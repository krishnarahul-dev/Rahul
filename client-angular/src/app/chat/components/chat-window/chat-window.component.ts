import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, switchMap, filter } from 'rxjs/operators';

import { ChatApiService } from '../../services/chat-api.service';
import { ChatSocketService } from '../../services/chat-socket.service';
import { ChatUser, ChatMessage, Conversation } from '../../models/chat.models';
import { avatarColor } from '../../services/avatar.util';

import { MessageBubbleComponent } from '../message-bubble/message-bubble.component';
import { MentionDropdownComponent } from '../mention-dropdown/mention-dropdown.component';

@Component({
  selector: 'cflow-chat-window',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MessageBubbleComponent,
    MentionDropdownComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css'],
})
export class ChatWindowComponent implements OnInit, OnDestroy, OnChanges {
  // ── Inputs (provided by the host Cflow page) ──────────
  @Input() workflowId!: string;
  @Input() currentUser!: ChatUser;

  // ── Template refs ─────────────────────────────────────
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;

  // ── State ─────────────────────────────────────────────
  conversation: Conversation | null = null;
  messages: ChatMessage[] = [];
  inputText = '';
  loading = true;
  typingUsers: Map<string, string> = new Map(); // user_id → name

  // Mentions
  mentionResults: ChatUser[] = [];
  mentionIndex = 0;
  showMentions = false;

  private destroy$ = new Subject<void>();
  private mentionSearch$ = new Subject<string>();
  private typingTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private api: ChatApiService,
    private socket: ChatSocketService,
    private cdr: ChangeDetectorRef
  ) {}

  // ── Lifecycle ─────────────────────────────────────────

  ngOnInit(): void {
    this.setupMentionSearch();
    this.loadChat();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reload if workflowId or user changes
    if (
      (changes['workflowId'] && !changes['workflowId'].firstChange) ||
      (changes['currentUser'] && !changes['currentUser'].firstChange)
    ) {
      this.socket.disconnect();
      this.messages = [];
      this.conversation = null;
      this.loading = true;
      this.cdr.markForCheck();
      this.loadChat();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.socket.disconnect();
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
  }

  // ── Data loading ──────────────────────────────────────

  private loadChat(): void {
    this.api.getConversation(this.workflowId).subscribe({
      next: (convo) => {
        this.conversation = convo;
        this.loadMessages(convo.id);
        this.connectSocket();
      },
      error: (err) => {
        console.error('[Chat] Failed to load conversation:', err);
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  private loadMessages(conversationId: string): void {
    this.api.getMessages(conversationId).subscribe({
      next: (msgs) => {
        this.messages = msgs;
        this.loading = false;
        this.cdr.markForCheck();
        this.scrollToBottom();
      },
      error: (err) => {
        console.error('[Chat] Failed to load messages:', err);
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  // ── Socket connection ─────────────────────────────────

  private connectSocket(): void {
    this.socket.connect(this.workflowId, this.currentUser);

    this.socket.message$.pipe(takeUntil(this.destroy$)).subscribe((msg) => {
      // Deduplicate
      if (!this.messages.some((m) => m.id === msg.id)) {
        this.messages = [...this.messages, msg];
        this.cdr.markForCheck();
        this.scrollToBottom();
      }
    });

    this.socket.typing$.pipe(takeUntil(this.destroy$)).subscribe((evt) => {
      if (evt.user_id !== this.currentUser.id) {
        this.typingUsers.set(evt.user_id, evt.name);
        this.cdr.markForCheck();
      }
    });

    this.socket.stopTyping$.pipe(takeUntil(this.destroy$)).subscribe((evt) => {
      this.typingUsers.delete(evt.user_id);
      this.cdr.markForCheck();
    });
  }

  // ── Mention autocomplete ──────────────────────────────

  private setupMentionSearch(): void {
    this.mentionSearch$
      .pipe(
        debounceTime(200),
        filter((q) => q.length >= 1),
        switchMap((q) => this.api.searchUsers(q)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (users) => {
          this.mentionResults = users;
          this.showMentions = users.length > 0;
          this.mentionIndex = 0;
          this.cdr.markForCheck();
        },
        error: () => {
          this.mentionResults = [];
          this.showMentions = false;
          this.cdr.markForCheck();
        },
      });
  }

  private detectMention(): void {
    const el = this.messageInput?.nativeElement;
    const cursorPos = el?.selectionStart ?? this.inputText.length;
    const textBefore = this.inputText.slice(0, cursorPos);
    const match = textBefore.match(/@(\w*)$/);

    if (match) {
      const query = match[1];
      if (query.length >= 1) {
        this.mentionSearch$.next(query);
      } else {
        this.mentionResults = [];
        this.showMentions = false;
      }
    } else {
      this.mentionResults = [];
      this.showMentions = false;
    }
  }

  insertMention(user: ChatUser): void {
    const el = this.messageInput?.nativeElement;
    const cursorPos = el?.selectionStart ?? this.inputText.length;
    const before = this.inputText.slice(0, cursorPos);
    const after = this.inputText.slice(cursorPos);
    const newBefore = before.replace(/@\w*$/, `@${user.name} `);

    this.inputText = newBefore + after;
    this.showMentions = false;
    this.mentionResults = [];
    this.cdr.markForCheck();

    setTimeout(() => el?.focus(), 0);
  }

  // ── Event handlers ────────────────────────────────────

  onInputChange(): void {
    this.detectMention();

    // Typing indicator
    this.socket.emitTyping();
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => this.socket.emitStopTyping(), 1500);
  }

  onKeyDown(event: KeyboardEvent): void {
    // Mention navigation
    if (this.showMentions && this.mentionResults.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.mentionIndex = Math.min(
          this.mentionIndex + 1,
          this.mentionResults.length - 1
        );
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.mentionIndex = Math.max(this.mentionIndex - 1, 0);
        return;
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        this.insertMention(this.mentionResults[this.mentionIndex]);
        return;
      }
      if (event.key === 'Escape') {
        this.showMentions = false;
        this.mentionResults = [];
        return;
      }
    }

    // Send on Enter
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

send(): void {
  const text = this.inputText.trim();
  if (!text || !this.conversation) return;

  const sender = (this.conversation.participants || []).find(
    (p: any) =>
      p.cflow_id === this.currentUser.cflow_id ||
      p.email === this.currentUser.email ||
      p.id === this.currentUser.id
  );

  if (!sender) {
    console.error('Sender not found in conversation participants');
    return;
  }

  this.api.sendMessage({
    conversation_id: this.conversation.id,
    sender_id: sender.id,
    message: text
  }).subscribe({
    next: (msg: any) => {
      this.messages = [...this.messages, msg];
      this.inputText = '';
      this.showMentions = false;
      this.cdr.markForCheck();
      setTimeout(() => {
        this.scrollToBottom();
        this.messageInput?.nativeElement?.focus();
      }, 0);
    },
    error: (err: any) => {
      console.error('Send message failed:', err);
    }
  });
}

  // ── Helpers ───────────────────────────────────────────

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.scrollContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }

  getAvatarColor(name: string): string {
    return avatarColor(name);
  }

  get typingNames(): string[] {
    return Array.from(this.typingUsers.values());
  }

  shouldShowAvatar(index: number): boolean {
    if (index === 0) return true;
    const current = this.messages[index];
    const prev = this.messages[index - 1];
    return (
      (current.sender?.id || current.sender_id) !==
      (prev.sender?.id || prev.sender_id)
    );
  }

  isOwnMessage(msg: ChatMessage): boolean {
  const sender = msg.sender;

  return !!(
    sender?.id === this.currentUser.id ||
    sender?.cflow_id === this.currentUser.cflow_id ||
    sender?.email === this.currentUser.email ||
    msg.sender_id === this.currentUser.id
  );
}

  trackByMessageId(_: number, msg: ChatMessage): string {
    return msg.id;
  }
}
