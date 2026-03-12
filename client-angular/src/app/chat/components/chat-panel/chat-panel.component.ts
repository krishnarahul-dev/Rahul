import { Component, Input, OnChanges, OnInit, OnDestroy, SimpleChanges, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, switchMap, filter } from 'rxjs/operators';
import { Conversation, ChatMessage, ChatUser, TypingEvent } from '../../models/chat.models';
import { ChatApiService } from '../../services/chat-api.service';
import { ChatSocketService } from '../../services/chat-socket.service';
import { MessageBubbleComponent } from '../message-bubble/message-bubble.component';
import { MentionDropdownComponent } from '../mention-dropdown/mention-dropdown.component';
import { UserStatusComponent } from '../user-status/user-status.component';
import { avatarColor, initials } from '../../services/avatar.util';

@Component({
  selector: 'cflow-chat-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, MessageBubbleComponent, MentionDropdownComponent, UserStatusComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="!conversation" class="empty"><p style="color:#9ca3af;font-size:14px">Select a conversation to start chatting</p></div>
    <div *ngIf="conversation" class="panel">
      <!-- Header -->
      <div class="hdr">
        <div class="hav" [style.background]="hdrColor">
          <span *ngIf="conversation.type==='workflow'">⚙</span>
          <span *ngIf="conversation.type==='group'">👥</span>
          <span *ngIf="conversation.type==='direct'||!conversation.type">{{hdrInit}}</span>
        </div>
        <div class="htxt"><h3 class="hn">{{hdrName}}</h3>
          <span class="hsub">
            <ng-container *ngIf="(conversation.type==='direct'||!conversation.type)&&dmP?.status">
              <cflow-user-status [status]="dmP!.status!"></cflow-user-status> {{dmP!.status}}
            </ng-container>
            <ng-container *ngIf="conversation.type!=='direct'&&conversation.type">{{conversation.participants?.length||0}} members</ng-container>
          </span>
        </div>
      </div>
      <!-- Messages -->
      <div #scrollEl class="msgs">
        <div *ngIf="loading" class="ctr">Loading…</div>
        <div *ngIf="!loading && messages.length===0" class="ctr">No messages yet</div>
        <cflow-message-bubble *ngFor="let m of messages; let i=index; trackBy:tMsg"
          [message]="m" [isOwn]="isOwn(m)" [showAvatar]="showAv(i)"></cflow-message-bubble>
        <div *ngIf="typN.length>0" class="typing"><span class="td"></span><span class="td"></span><span class="td"></span>
          <span class="tt">{{typN.join(', ')}} typing…</span></div>
      </div>
      <!-- Input -->
      <div class="ia">
        <cflow-mention-dropdown *ngIf="showM" [results]="mRes" [activeIndex]="mIdx" (selectUser)="insMention($event)"></cflow-mention-dropdown>
        <div class="iw">
          <textarea #inEl [(ngModel)]="inp" (ngModelChange)="onInp()" (keydown)="onKey($event)" placeholder="Type a message… (@ to mention)" rows="1" class="ta"></textarea>
          <button class="sb" [class.active]="inp.trim()" [disabled]="!inp.trim()" (click)="send()">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host{display:flex;flex-direction:column;height:100%;font-family:'DM Sans',system-ui,sans-serif}
    .empty{display:flex;align-items:center;justify-content:center;height:100%}
    .panel{display:flex;flex-direction:column;height:100%;background:#fff}
    .hdr{display:flex;align-items:center;gap:12px;padding:12px 20px;border-bottom:1px solid #f3f4f6;flex-shrink:0}
    .hav{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:700;flex-shrink:0}
    .htxt{flex:1;min-width:0} .hn{margin:0;font-size:14px;font-weight:600;color:#1f2937;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .hsub{font-size:12px;color:#9ca3af;display:flex;align-items:center;gap:4px}
    .msgs{flex:1;overflow-y:auto;padding:16px 20px} .msgs::-webkit-scrollbar{width:4px} .msgs::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:4px}
    .ctr{display:flex;align-items:center;justify-content:center;height:100%;color:#9ca3af;font-size:13px}
    .typing{display:flex;align-items:center;gap:6px;padding:6px 0 0 38px}
    .td{width:5px;height:5px;border-radius:50%;background:#9ca3af;animation:blink 1.4s infinite both}
    .td:nth-child(2){animation-delay:.2s} .td:nth-child(3){animation-delay:.4s}
    .tt{font-size:12px;color:#9ca3af}
    .ia{position:relative;padding:8px 16px 16px;flex-shrink:0}
    .iw{display:flex;align-items:flex-end;gap:8px;background:#f9fafb;border-radius:12px;border:1px solid #e5e7eb;padding:8px 12px;transition:border-color .2s}
    .iw:focus-within{border-color:#93bbfd;box-shadow:0 0 0 3px rgba(49,130,252,.08)}
    .ta{flex:1;background:transparent;resize:none;font-size:13px;font-family:inherit;color:#1f2937;border:none;outline:none;line-height:1.5;min-height:24px;max-height:112px}
    .ta::placeholder{color:#9ca3af}
    .sb{width:32px;height:32px;border-radius:8px;background:#d1d5db;color:#fff;border:none;cursor:not-allowed;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .2s}
    .sb.active{background:#3182fc;cursor:pointer} .sb.active:hover{background:#1b63f1}
    @keyframes blink{0%,80%,100%{opacity:.2}40%{opacity:1}}
  `],
})
export class ChatPanelComponent implements OnChanges, OnInit, OnDestroy {
  @Input() conversation: Conversation | null = null;
  @Input() currentUser!: ChatUser;
  @ViewChild('scrollEl') scrollEl!: ElementRef<HTMLDivElement>;
  @ViewChild('inEl') inEl!: ElementRef<HTMLTextAreaElement>;

  messages: ChatMessage[] = [];
  inp = '';
  loading = false;
  typingUsers = new Map<string, string>();
  showM = false;
  mRes: ChatUser[] = [];
  mIdx = 0;

  avatarColor = avatarColor;
  initials = initials;

  private destroy$ = new Subject<void>();
  private mSearch$ = new Subject<string>();
  private tTimer: any = null;

  constructor(private api: ChatApiService, private socket: ChatSocketService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.mSearch$.pipe(debounceTime(200), filter(q => q.length >= 1), switchMap(q => this.api.searchUsers(q)), takeUntil(this.destroy$))
      .subscribe({ next: u => { this.mRes = u; this.showM = u.length > 0; this.mIdx = 0; this.cdr.markForCheck(); }, error: () => { this.mRes = []; this.showM = false; this.cdr.markForCheck(); } });

    this.socket.message$.pipe(takeUntil(this.destroy$)).subscribe(msg => {
      if (this.conversation && msg.conversation_id === this.conversation.id) {
        if (!this.messages.some(m => m.id === msg.id)) { this.messages = [...this.messages, msg]; this.cdr.markForCheck(); this.scrollBot(); this.socket.markRead(this.conversation.id); }
      }
    });

    this.socket.typing$.pipe(takeUntil(this.destroy$)).subscribe(evt => {
      if (this.conversation && evt.conversation_id === this.conversation.id && evt.user_id !== this.currentUser.id) { this.typingUsers.set(evt.user_id, evt.name); this.cdr.markForCheck(); }
    });
    this.socket.stopTyping$.pipe(takeUntil(this.destroy$)).subscribe(evt => {
      if (this.conversation && evt.conversation_id === this.conversation.id) { this.typingUsers.delete(evt.user_id); this.cdr.markForCheck(); }
    });
  }

  ngOnChanges(ch: SimpleChanges): void {
    if (ch['conversation']) { this.messages = []; this.typingUsers.clear(); if (this.conversation) { this.loadMsgs(); this.socket.joinConversation(this.conversation.id); this.socket.markRead(this.conversation.id); } }
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  private loadMsgs(): void {
    if (!this.conversation) return;
    this.loading = true; this.cdr.markForCheck();
    this.api.getMessages(this.conversation.id).subscribe({ next: m => { this.messages = m; this.loading = false; this.cdr.markForCheck(); this.scrollBot(); }, error: () => { this.loading = false; this.cdr.markForCheck(); } });
  }

  get dmP(): ChatUser | undefined { return this.conversation?.participants?.find(p => p.id !== this.currentUser.id); }
  get hdrName(): string { if (this.conversation?.type === 'direct') return this.dmP?.name || 'Unknown'; return this.conversation?.name || this.conversation?.title || 'Conversation'; }
  get hdrColor(): string { if (this.conversation?.type === 'direct') return avatarColor(this.dmP?.name); if (this.conversation?.type === 'workflow') return '#8b5cf6'; return '#3182fc'; }
  get hdrInit(): string { return initials(this.dmP?.name || ''); }
  get typN(): string[] { return Array.from(this.typingUsers.values()); }

  showAv(i: number): boolean { if (i === 0) return true; return (this.messages[i].sender?.id || this.messages[i].sender_id) !== (this.messages[i-1].sender?.id || this.messages[i-1].sender_id); }
  isOwn(m: ChatMessage): boolean { const s = m.sender; return !!(s?.id === this.currentUser.id || s?.cflow_id === this.currentUser.cflow_id || s?.email === this.currentUser.email || m.sender_id === this.currentUser.id); }
  tMsg(_: number, m: ChatMessage): string { return m.id; }

  insMention(u: ChatUser): void {
    const el = this.inEl?.nativeElement; const pos = el?.selectionStart ?? this.inp.length;
    this.inp = this.inp.slice(0, pos).replace(/@\w*$/, `@${u.name} `) + this.inp.slice(pos);
    this.showM = false; this.cdr.markForCheck(); setTimeout(() => el?.focus(), 0);
  }

  onInp(): void {
    const el = this.inEl?.nativeElement; const pos = el?.selectionStart ?? this.inp.length;
    const m = this.inp.slice(0, pos).match(/@(\w*)$/);
    if (m && m[1].length >= 1) this.mSearch$.next(m[1]); else { this.showM = false; this.mRes = []; }
    if (this.conversation) { this.socket.emitTyping(this.conversation.id); clearTimeout(this.tTimer); this.tTimer = setTimeout(() => { if (this.conversation) this.socket.emitStopTyping(this.conversation.id); }, 1500); }
  }

  onKey(e: KeyboardEvent): void {
    if (this.showM && this.mRes.length) {
      if (e.key === 'ArrowDown') { e.preventDefault(); this.mIdx = Math.min(this.mIdx + 1, this.mRes.length - 1); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); this.mIdx = Math.max(this.mIdx - 1, 0); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); this.insMention(this.mRes[this.mIdx]); return; }
      if (e.key === 'Escape') { this.showM = false; return; }
    }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send(); }
  }

  send(): void {
    const t = this.inp.trim(); if (!t || !this.conversation) return;
    // Find current user's DB id from participants
    const me = this.conversation.participants?.find(p => p.cflow_id === this.currentUser.cflow_id || p.email === this.currentUser.email || p.id === this.currentUser.id);
    if (me) {
      this.api.sendMessage({ conversation_id: this.conversation.id, sender_id: me.id, message: t }).subscribe({ next: msg => {
        if (!this.messages.some(m => m.id === msg.id)) { this.messages = [...this.messages, msg]; }
        this.inp = ''; this.showM = false; this.cdr.markForCheck(); this.scrollBot(); setTimeout(() => this.inEl?.nativeElement?.focus(), 0);
      }, error: err => console.error('Send failed:', err) });
    } else {
      // Fallback: use socket
      this.socket.sendMessage(t, this.conversation.id);
      this.inp = ''; this.showM = false; this.cdr.markForCheck(); setTimeout(() => this.inEl?.nativeElement?.focus(), 0);
    }
    if (this.conversation) this.socket.emitStopTyping(this.conversation.id);
  }

  private scrollBot(): void { setTimeout(() => { const el = this.scrollEl?.nativeElement; if (el) el.scrollTop = el.scrollHeight; }, 50); }
}
