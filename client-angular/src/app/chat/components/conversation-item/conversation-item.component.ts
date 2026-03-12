import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Conversation, ChatUser } from '../../models/chat.models';
import { UserStatusComponent } from '../user-status/user-status.component';
import { avatarColor, initials } from '../../services/avatar.util';

@Component({
  selector: 'cflow-conversation-item',
  standalone: true,
  imports: [CommonModule, UserStatusComponent],
  template: `
    <div class="item" [class.active]="isActive" (click)="select.emit()">
      <div class="av-wrap">
        <div class="av" [style.background]="getColor()">
          <span *ngIf="conversation.type === 'workflow'">⚙</span>
          <span *ngIf="conversation.type === 'group'">👥</span>
          <span *ngIf="conversation.type === 'direct' || !conversation.type">{{ getInitials() }}</span>
        </div>
        <cflow-user-status *ngIf="(conversation.type === 'direct' || !conversation.type) && otherUser?.status"
          [status]="otherUser!.status!" class="presence"></cflow-user-status>
      </div>
      <div class="txt">
        <div class="top"><span class="nm">{{ displayName }}</span>
          <span class="tm" *ngIf="conversation.last_message">{{ fmtTime(conversation.last_message.created_at) }}</span>
        </div>
        <div class="btm">
          <span class="preview" *ngIf="conversation.last_message">
            <strong *ngIf="conversation.type !== 'direct' && conversation.type">{{ conversation.last_message.sender?.name?.split(' ')[0] }}: </strong>
            {{ (conversation.last_message.message || '').slice(0, 45) }}
          </span>
          <span class="badge" *ngIf="(conversation.unread_count || 0) > 0">{{ conversation.unread_count }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host{display:block} .item{display:flex;align-items:center;gap:12px;padding:10px 16px;cursor:pointer;transition:background .15s;border-left:3px solid transparent}
    .item:hover{background:#f8fafc} .item.active{background:#eef5ff;border-left-color:#3182fc}
    .av-wrap{position:relative;flex-shrink:0} .av{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:700}
    .presence{position:absolute;bottom:0;right:0}
    .txt{flex:1;min-width:0} .top{display:flex;justify-content:space-between;align-items:baseline}
    .nm{font-size:13px;font-weight:600;color:#1f2937;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .tm{font-size:10px;color:#9ca3af;flex-shrink:0;margin-left:8px}
    .btm{display:flex;justify-content:space-between;align-items:center;margin-top:2px}
    .preview{font-size:12px;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}
    .preview strong{font-weight:600;color:#4b5563}
    .badge{background:#3182fc;color:#fff;font-size:10px;font-weight:700;min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 5px;flex-shrink:0;margin-left:8px}
  `],
})
export class ConversationItemComponent {
  @Input() conversation!: Conversation;
  @Input() currentUserId = '';
  @Input() isActive = false;
  @Output() select = new EventEmitter<void>();

  get otherUser(): ChatUser | undefined {
    if (this.conversation.type !== 'direct') return undefined;
    return this.conversation.participants?.find(p => p.id !== this.currentUserId);
  }

  get displayName(): string {
    if (this.conversation.type === 'direct') return this.otherUser?.name || 'Unknown';
    return this.conversation.name || this.conversation.title || 'Untitled';
  }

  getColor(): string {
    if (this.conversation.type === 'direct') return avatarColor(this.otherUser?.name);
    if (this.conversation.type === 'workflow') return '#8b5cf6';
    return '#3182fc';
  }

  getInitials(): string {
    return initials(this.otherUser?.name || this.conversation.name || '');
  }

  fmtTime(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}
