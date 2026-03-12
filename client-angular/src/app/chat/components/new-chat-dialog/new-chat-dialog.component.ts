import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatUser } from '../../models/chat.models';
import { ChatApiService } from '../../services/chat-api.service';
import { UserStatusComponent } from '../user-status/user-status.component';
import { avatarColor, initials } from '../../services/avatar.util';

@Component({
  selector: 'cflow-new-chat-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, UserStatusComponent],
  template: `
    <div class="ov" (click)="close.emit()">
      <div class="dlg" (click)="$event.stopPropagation()">
        <div class="dh"><h3>New Message</h3><button class="cb" (click)="close.emit()">&times;</button></div>
        <div class="sw"><input class="si" [(ngModel)]="q" (input)="onS()" placeholder="Search by name or email…" autofocus /></div>
        <div class="ul">
          <div *ngFor="let u of fu" class="ur" (click)="startChat.emit(u)">
            <div class="av" [style.background]="ac(u.name)">{{ini(u.name)}}</div>
            <div class="inf"><span class="nm">{{u.name}}</span><span class="em">{{u.email}}</span></div>
            <cflow-user-status [status]="u.status || 'offline'"></cflow-user-status>
          </div>
          <div *ngIf="fu.length===0" class="mt">No users found</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ov{position:fixed;inset:0;background:rgba(0,0,0,.3);z-index:100;display:flex;align-items:center;justify-content:center}
    .dlg{width:400px;max-height:500px;background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,.15);overflow:hidden;display:flex;flex-direction:column}
    .dh{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #f3f4f6}
    .dh h3{margin:0;font-size:16px;font-weight:600;color:#1f2937}
    .cb{width:28px;height:28px;border-radius:50%;border:none;background:#f3f4f6;font-size:18px;cursor:pointer;color:#6b7280;display:flex;align-items:center;justify-content:center}
    .sw{padding:12px 16px} .si{width:100%;padding:10px 12px;border-radius:10px;border:1px solid #e5e7eb;font-size:13px;outline:none;font-family:inherit} .si:focus{border-color:#93bbfd}
    .ul{flex:1;overflow-y:auto}
    .ur{display:flex;align-items:center;gap:12px;padding:10px 16px;cursor:pointer;transition:background .15s} .ur:hover{background:#f8fafc}
    .av{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:700;flex-shrink:0}
    .inf{flex:1;min-width:0} .nm{display:block;font-size:13px;font-weight:500;color:#1f2937} .em{display:block;font-size:11px;color:#9ca3af}
    .mt{padding:24px;text-align:center;color:#9ca3af;font-size:13px}
  `],
})
export class NewChatDialogComponent implements OnInit {
  @Input() currentUserId = '';
  @Output() startChat = new EventEmitter<ChatUser>();
  @Output() close = new EventEmitter<void>();

  all: ChatUser[] = [];
  fu: ChatUser[] = [];
  q = '';
  ac = avatarColor;
  ini = initials;

  constructor(private api: ChatApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.api.listUsers().subscribe(u => { this.all = u.filter(x => x.id !== this.currentUserId); this.fu = this.all; this.cdr.markForCheck(); });
  }

  onS(): void {
    const q = this.q.toLowerCase();
    this.fu = q ? this.all.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) : this.all;
  }
}
