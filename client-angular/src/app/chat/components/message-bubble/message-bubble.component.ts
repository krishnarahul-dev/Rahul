import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessage } from '../../models/chat.models';
import { avatarColor, initials } from '../../services/avatar.util';

@Component({
  selector: 'cflow-message-bubble',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bubble-row"
      [class.own]="isOwn"
      [class.has-avatar]="showAvatar"
    >
      <!-- Avatar column -->
      <div class="avatar-col">
        <div
          *ngIf="showAvatar"
          class="avatar"
          [style.background]="senderColor"
          [title]="message.sender?.name || ''"
        >
          {{ senderInitials }}
        </div>
      </div>

      <!-- Content -->
      <div class="bubble-content">
        <span *ngIf="showAvatar && !isOwn" class="sender-name">
          {{ message.sender?.name }}
        </span>
        <div class="bubble" [class.bubble-own]="isOwn">
          <span [innerHTML]="highlightedMessage"></span>
        </div>
        <span class="timestamp" [class.timestamp-right]="isOwn">
          {{ formattedTime }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .bubble-row {
      display: flex;
      gap: 10px;
      margin-top: 2px;
      align-items: flex-start;
    }
    .bubble-row.own {
      flex-direction: row-reverse;
    }
    .bubble-row.has-avatar {
      margin-top: 12px;
    }

    .avatar-col {
      width: 28px;
      flex-shrink: 0;
    }
    .avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      user-select: none;
    }

    .bubble-content {
      max-width: 75%;
    }

    .sender-name {
      display: block;
      font-size: 11px;
      font-weight: 500;
      color: #6b7280;
      margin-bottom: 2px;
      margin-left: 4px;
    }

    .bubble {
      padding: 8px 14px;
      font-size: 13px;
      line-height: 1.55;
      border-radius: 16px;
      background: #f3f4f6;
      color: #1f2937;
      border-bottom-left-radius: 6px;
      word-break: break-word;
    }
    .bubble-own {
      background: #3182fc;
      color: #fff;
      border-bottom-left-radius: 16px;
      border-bottom-right-radius: 6px;
    }

    .timestamp {
      display: block;
      font-size: 10px;
      color: #9ca3af;
      margin-top: 2px;
      margin-left: 4px;
    }
    .timestamp-right {
      text-align: right;
      margin-left: 0;
      margin-right: 4px;
    }

    :host ::ng-deep .mention {
      font-weight: 600;
      color: #3182fc;
      cursor: pointer;
    }
    :host .bubble-own ::ng-deep .mention {
      color: #bfdbfe;
    }
  `],
})
export class MessageBubbleComponent {
  @Input() message!: ChatMessage;
  @Input() isOwn = false;
  @Input() showAvatar = true;

  get senderColor(): string {
    return avatarColor(this.message.sender?.name);
  }

  get senderInitials(): string {
    return initials(this.message.sender?.name);
  }

  get formattedTime(): string {
    const d = new Date(this.message.created_at);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  get highlightedMessage(): string {
    return (this.message.message || '').replace(
      /@(\w[\w. ]*)/g,
      '<span class="mention">@$1</span>'
    );
  }
}
