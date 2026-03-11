import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatUser } from '../../models/chat.models';
import { avatarColor } from '../../services/avatar.util';

@Component({
  selector: 'cflow-mention-dropdown',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dropdown" *ngIf="results.length > 0">
      <div class="dropdown-header">Mention a participant</div>
      <div class="dropdown-list">
        <div
          *ngFor="let user of results; let i = index"
          class="dropdown-item"
          [class.active]="i === activeIndex"
          (mousedown)="onSelect($event, user)"
        >
          <div
            class="mini-avatar"
            [style.background]="getColor(user.name)"
          >
            {{ user.name.charAt(0) }}
          </div>
          <div class="user-info">
            <span class="user-name">{{ user.name }}</span>
            <span class="user-email">{{ user.email }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dropdown {
      position: absolute;
      bottom: 100%;
      left: 16px;
      right: 16px;
      margin-bottom: 4px;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
      z-index: 50;
      overflow: hidden;
    }
    .dropdown-header {
      padding: 6px 12px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #9ca3af;
      border-bottom: 1px solid #f3f4f6;
    }
    .dropdown-list {
      max-height: 160px;
      overflow-y: auto;
      padding: 4px 0;
    }
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .dropdown-item:hover,
    .dropdown-item.active {
      background: #eef5ff;
    }
    .mini-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      flex-shrink: 0;
    }
    .user-info {
      min-width: 0;
      display: flex;
      flex-direction: column;
    }
    .user-name {
      font-size: 13px;
      font-weight: 500;
      color: #1f2937;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-email {
      font-size: 10px;
      color: #9ca3af;
    }
  `],
})
export class MentionDropdownComponent {
  @Input() results: ChatUser[] = [];
  @Input() activeIndex = 0;
  @Output() selectUser = new EventEmitter<ChatUser>();

  getColor(name: string): string {
    return avatarColor(name);
  }

  onSelect(event: MouseEvent, user: ChatUser): void {
    event.preventDefault();
    this.selectUser.emit(user);
  }
}
