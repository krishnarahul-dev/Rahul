import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatWindowComponent } from './chat/components/chat-window/chat-window.component';

type DemoUser = {
  id: string;
  cflow_id: string;
  name: string;
  email: string;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ChatWindowComponent],
  template: `
    <ng-container *ngIf="!selectedUser; else chatView">
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f8fafc;font-family:'DM Sans',system-ui,sans-serif;padding:24px;">
        <div style="width:100%;max-width:380px;background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px solid #f3f4f6;overflow:hidden;">
          <div style="padding:24px 28px;background:linear-gradient(135deg,#1b63f1,#144dde);">
            <div style="font-size:20px;font-weight:600;color:#fff;letter-spacing:-0.01em;">Cflow Chat</div>
            <div style="font-size:12px;color:rgba(255,255,255,.55);margin-top:4px;">
              Select a user to join the workflow conversation
            </div>
          </div>

          <div style="padding:20px 28px 28px;">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af;margin-bottom:8px;">
              Workflow Request #{{ workflowId }}
            </div>

            <div style="display:flex;flex-direction:column;gap:8px;">
              <button
                *ngFor="let u of users"
                (click)="selectUser(u)"
                style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:12px;border:1px solid #e5e7eb;background:#fff;cursor:pointer;text-align:left;font-family:inherit;">
                <div
                  style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700;"
                  [style.background]="avatarColor(u.name)">
                  {{ u.name.charAt(0) }}
                </div>
                <div>
                  <div style="font-size:14px;font-weight:500;color:#1f2937;">{{ u.name }}</div>
                  <div style="font-size:11px;color:#9ca3af;">{{ u.email }}</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ng-container>

    <ng-template #chatView>
      <div style="height:100vh;display:flex;flex-direction:column;background:#f8fafc;font-family:'DM Sans',system-ui,sans-serif;">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 20px;background:#fff;border-bottom:1px solid #f3f4f6;">
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#6b7280;">
            <span style="font-weight:500;color:#1f2937;">{{ selectedUser?.name }}</span>
            <span style="color:#d1d5db;">·</span>
            <span>Workflow #{{ workflowId }}</span>
          </div>

          <button
            (click)="switchUser()"
            style="font-size:12px;color:#3182fc;font-weight:500;background:none;border:none;cursor:pointer;font-family:inherit;">
            Switch user
          </button>
        </div>

        <div style="flex:1;padding:16px;overflow:hidden;">
          <cflow-chat-window
            *ngIf="selectedUser"
            [workflowId]="workflowId"
            [currentUser]="selectedUser">
          </cflow-chat-window>
        </div>
      </div>
    </ng-template>
  `
})
export class App {
  workflowId = '1023';

  users: DemoUser[] = [
    {
      id: 'u1',
      cflow_id: 'u1',
      name: 'Arjun Mehta',
      email: 'arjun@cflow.dev'
    },
    {
      id: 'u2',
      cflow_id: 'u2',
      name: 'Priya Sharma',
      email: 'priya@cflow.dev'
    },
    {
      id: 'u3',
      cflow_id: 'u3',
      name: 'Ravi Kumar',
      email: 'ravi@cflow.dev'
    }
  ];

  selectedUser: DemoUser | null = null;

  selectUser(user: DemoUser) {
    this.selectedUser = { ...user };
  }

  switchUser() {
    this.selectedUser = null;
  }

  avatarColor(name: string): string {
    const colors = ['#3182fc', '#e74c8b', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316'];
    let h = 0;
    for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h);
    return colors[Math.abs(h) % colors.length];
  }
}