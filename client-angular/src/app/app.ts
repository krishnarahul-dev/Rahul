import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatLayoutComponent } from './chat/components/chat-layout/chat-layout.component';

type DemoUser = {
  id: string;
  cflow_id: string;
  name: string;
  email: string;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ChatLayoutComponent],
  template: `
    <ng-container *ngIf="!selectedUser; else chatView">
      <div class="login-page">
        <div class="login-card">
          <div class="login-header">
            <div class="login-title">Cflow Chat</div>
            <div class="login-sub">Select a user to open the full chat experience</div>
          </div>
          <div class="login-body">
            <div class="login-label">Direct Messages · Groups · Workflow Chats</div>
            <div class="user-list">
              <button *ngFor="let u of users" (click)="selectUser(u)" class="user-btn">
                <div class="user-av" [style.background]="avatarColor(u.name)">{{ u.name.charAt(0) }}</div>
                <div><div class="user-name">{{ u.name }}</div><div class="user-email">{{ u.email }}</div></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ng-container>

    <ng-template #chatView>
      <div class="chat-page">
        <div class="top-bar">
          <div class="top-info">
            <span class="top-name">{{ selectedUser?.name }}</span>
            <span class="top-sep">·</span>
            <span class="top-badge">DM · Group · Workflow</span>
          </div>
          <button (click)="switchUser()" class="switch-btn">Switch user</button>
        </div>
        <div class="chat-area">
          <cflow-chat-layout *ngIf="selectedUser" [currentUser]="selectedUser"></cflow-chat-layout>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    :host { display: block; height: 100dvh; font-family: 'DM Sans', system-ui, sans-serif; }

    .login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; padding: 24px; }
    .login-card { width: 100%; max-width: 380px; background: #fff; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.06); border: 1px solid #f3f4f6; overflow: hidden; }
    .login-header { padding: 24px 28px; background: linear-gradient(135deg, #1b63f1, #144dde); }
    .login-title { font-size: 20px; font-weight: 600; color: #fff; letter-spacing: -0.01em; }
    .login-sub { font-size: 12px; color: rgba(255,255,255,.55); margin-top: 4px; }
    .login-body { padding: 20px 28px 28px; }
    .login-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #9ca3af; margin-bottom: 12px; }
    .user-list { display: flex; flex-direction: column; gap: 8px; }
    .user-btn { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px; border: 1px solid #e5e7eb; background: #fff; cursor: pointer; text-align: left; font-family: inherit; transition: all .15s; }
    .user-btn:hover { border-color: #93bbfd; background: #eef5ff; }
    .user-av { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 700; }
    .user-name { font-size: 14px; font-weight: 500; color: #1f2937; }
    .user-email { font-size: 11px; color: #9ca3af; }

    .chat-page { height: 100vh; display: flex; flex-direction: column; background: #f8fafc; }
    .top-bar { display: flex; align-items: center; justify-content: space-between; padding: 10px 20px; background: #fff; border-bottom: 1px solid #f3f4f6; flex-shrink: 0; }
    .top-info { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #6b7280; }
    .top-name { font-weight: 500; color: #1f2937; }
    .top-sep { color: #d1d5db; }
    .top-badge { font-size: 11px; color: #3182fc; background: #eef5ff; padding: 2px 8px; border-radius: 8px; font-weight: 500; }
    .switch-btn { font-size: 12px; color: #3182fc; font-weight: 500; background: none; border: none; cursor: pointer; font-family: inherit; }
    .chat-area { flex: 1; padding: 16px; overflow: hidden; }
  `]
})
export class App {
  users: DemoUser[] = [
    { id: 'a1b2c3d4-0001-4000-8000-000000000001', cflow_id: 'cflow_1001', name: 'Arjun Mehta', email: 'arjun@cflow.dev' },
    { id: 'a1b2c3d4-0002-4000-8000-000000000002', cflow_id: 'cflow_1002', name: 'Priya Sharma', email: 'priya@cflow.dev' },
    { id: 'a1b2c3d4-0003-4000-8000-000000000003', cflow_id: 'cflow_1003', name: 'Ravi Kumar', email: 'ravi@cflow.dev' },
  ];

  selectedUser: DemoUser | null = null;

  selectUser(user: DemoUser) { this.selectedUser = { ...user }; }
  switchUser() { this.selectedUser = null; }

  avatarColor(name: string): string {
    const colors = ['#3182fc', '#e74c8b', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316'];
    let h = 0;
    for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h);
    return colors[Math.abs(h) % colors.length];
  }
}
