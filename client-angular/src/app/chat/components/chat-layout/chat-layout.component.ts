import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChatUser, Conversation } from '../../models/chat.models';
import { ChatApiService } from '../../services/chat-api.service';
import { ChatSocketService } from '../../services/chat-socket.service';
import { ConversationListComponent } from '../conversation-list/conversation-list.component';
import { ChatPanelComponent } from '../chat-panel/chat-panel.component';
import { NewChatDialogComponent } from '../new-chat-dialog/new-chat-dialog.component';
import { GroupCreateDialogComponent } from '../group-create-dialog/group-create-dialog.component';

@Component({
  selector: 'cflow-chat-layout',
  standalone: true,
  imports: [CommonModule, ConversationListComponent, ChatPanelComponent, NewChatDialogComponent, GroupCreateDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="layout">
      <div class="sidebar">
        <cflow-conversation-list
          [conversations]="conversations" [currentUserId]="currentUser.id"
          [activeConversationId]="active?.id || ''"
          (selectConversation)="onSelect($event)" (newChat)="showNC=true" (newGroup)="showNG=true">
        </cflow-conversation-list>
      </div>
      <div class="panel">
        <cflow-chat-panel [conversation]="active" [currentUser]="currentUser"></cflow-chat-panel>
      </div>
    </div>
    <cflow-new-chat-dialog *ngIf="showNC" [currentUserId]="currentUser.id"
      (startChat)="onStartDM($event)" (close)="showNC=false"></cflow-new-chat-dialog>
    <cflow-group-create-dialog *ngIf="showNG" [currentUserId]="currentUser.id"
      (createGroup)="onCreateGroup($event)" (close)="showNG=false"></cflow-group-create-dialog>
  `,
  styles: [`
    :host{display:block;height:100%;font-family:'DM Sans',system-ui,sans-serif}
    .layout{display:flex;height:100%;background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid #f3f4f6;overflow:hidden}
    .sidebar{width:320px;min-width:280px;border-right:1px solid #f3f4f6;display:flex;flex-direction:column}
    .panel{flex:1;min-width:0;display:flex;flex-direction:column}
  `],
})
export class ChatLayoutComponent implements OnInit, OnDestroy {
  @Input() currentUser!: ChatUser;
  @Input() workflowId?: string;

  conversations: Conversation[] = [];
  active: Conversation | null = null;
  showNC = false;
  showNG = false;

  private destroy$ = new Subject<void>();

  constructor(private api: ChatApiService, private socket: ChatSocketService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Connect socket v2
    this.socket.connectV2(this.currentUser);

    // Load conversations
    this.loadConvos();

    // Auto-open workflow conversation if provided
    if (this.workflowId) {
      this.api.getConversation(this.workflowId).subscribe(convo => {
        this.active = convo;
        this.cdr.markForCheck();
      });
    }

    // Refresh on new messages
    this.socket.message$.pipe(takeUntil(this.destroy$)).subscribe(() => this.loadConvos());
    this.socket.convCreated$.pipe(takeUntil(this.destroy$)).subscribe(() => this.loadConvos());
    this.socket.presence$.pipe(takeUntil(this.destroy$)).subscribe(evt => {
      for (const c of this.conversations) {
        const p = c.participants?.find(u => u.id === evt.user_id);
        if (p) (p as any).status = evt.status;
      }
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); this.socket.disconnect(); }

  loadConvos(): void {
    this.api.listConversations(this.currentUser.id).subscribe(convos => {
      this.conversations = convos;
      if (this.active) {
        const upd = convos.find(c => c.id === this.active!.id);
        if (upd) this.active = upd;
      }
      this.cdr.markForCheck();
    });
  }

  onSelect(c: Conversation): void {
    this.active = c;
    this.api.markRead(c.id, this.currentUser.id).subscribe();
    c.unread_count = 0;
    this.cdr.markForCheck();
  }

  onStartDM(target: ChatUser): void {
    this.showNC = false;
    this.api.createDirect(this.currentUser.id, target.id).subscribe(c => {
      this.active = c; this.loadConvos(); this.cdr.markForCheck();
    });
  }

  onCreateGroup(data: { name: string; memberIds: string[] }): void {
    this.showNG = false;
    this.api.createGroup(this.currentUser.id, data.name, data.memberIds).subscribe(c => {
      this.active = c; this.loadConvos(); this.cdr.markForCheck();
    });
  }
}
