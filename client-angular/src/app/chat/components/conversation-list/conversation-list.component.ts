import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Conversation } from '../../models/chat.models';
import { ConversationItemComponent } from '../conversation-item/conversation-item.component';

@Component({
  selector: 'cflow-conversation-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ConversationItemComponent],
  template: `
    <div class="sb">
      <div class="hdr">
        <h2 class="ttl">Messages</h2>
        <div class="acts">
          <button class="ib" title="New group" (click)="newGroup.emit()">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </button>
          <button class="ib" title="New message" (click)="newChat.emit()">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="sw"><input class="si" [(ngModel)]="sq" placeholder="Search conversations…" /></div>
      <div class="tabs">
        <button *ngFor="let t of tabs" class="tab" [class.active]="at === t.k" (click)="at = t.k">{{ t.l }}</button>
      </div>
      <div class="list">
        <div *ngIf="filtered.length === 0" class="empty">No conversations yet</div>
        <cflow-conversation-item *ngFor="let c of filtered; trackBy: tid"
          [conversation]="c" [currentUserId]="currentUserId"
          [isActive]="c.id === activeConversationId"
          (select)="selectConversation.emit(c)"></cflow-conversation-item>
      </div>
    </div>
  `,
  styles: [`
    :host{display:flex;flex-direction:column;height:100%} .sb{display:flex;flex-direction:column;height:100%;background:#fff}
    .hdr{display:flex;align-items:center;justify-content:space-between;padding:16px 16px 8px}
    .ttl{font-size:18px;font-weight:700;color:#1f2937;margin:0} .acts{display:flex;gap:4px}
    .ib{width:32px;height:32px;border-radius:8px;border:none;background:transparent;color:#6b7280;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
    .ib:hover{background:#f3f4f6;color:#1f2937}
    .sw{padding:0 16px;margin-bottom:8px}
    .si{width:100%;padding:8px 12px;border-radius:8px;border:1px solid #e5e7eb;font-size:13px;outline:none;font-family:inherit}
    .si:focus{border-color:#93bbfd}
    .tabs{display:flex;gap:2px;padding:0 12px;border-bottom:1px solid #f3f4f6}
    .tab{padding:8px 12px;font-size:12px;font-weight:500;color:#6b7280;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;font-family:inherit}
    .tab:hover{color:#1f2937} .tab.active{color:#3182fc;border-bottom-color:#3182fc}
    .list{flex:1;overflow-y:auto} .list::-webkit-scrollbar{width:4px} .list::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:4px}
    .empty{padding:32px 16px;text-align:center;color:#9ca3af;font-size:13px}
  `],
})
export class ConversationListComponent {
  @Input() conversations: Conversation[] = [];
  @Input() currentUserId = '';
  @Input() activeConversationId = '';
  @Output() selectConversation = new EventEmitter<Conversation>();
  @Output() newChat = new EventEmitter<void>();
  @Output() newGroup = new EventEmitter<void>();

  at = 'all';
  sq = '';
  tabs = [{ k: 'all', l: 'All' }, { k: 'direct', l: 'Direct' }, { k: 'group', l: 'Groups' }, { k: 'workflow', l: 'Workflow' }];

  get filtered(): Conversation[] {
    let list = this.conversations;
    if (this.at !== 'all') list = list.filter(c => c.type === this.at);
    if (this.sq.trim()) {
      const q = this.sq.toLowerCase();
      list = list.filter(c => {
        const n = c.type === 'direct'
          ? c.participants?.find(p => p.id !== this.currentUserId)?.name || ''
          : c.name || c.title || '';
        return n.toLowerCase().includes(q);
      });
    }
    return list;
  }

  tid(_: number, c: Conversation): string { return c.id; }
}
