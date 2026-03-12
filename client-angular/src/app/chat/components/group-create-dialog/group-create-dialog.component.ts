import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatUser } from '../../models/chat.models';
import { ChatApiService } from '../../services/chat-api.service';
import { avatarColor, initials } from '../../services/avatar.util';

@Component({
  selector: 'cflow-group-create-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ov" (click)="close.emit()">
      <div class="dlg" (click)="$event.stopPropagation()">
        <div class="dh"><h3>Create Group</h3><button class="cb" (click)="close.emit()">&times;</button></div>
        <div class="bd">
          <label class="lb">Group name</label>
          <input class="si" [(ngModel)]="gn" placeholder="e.g. Engineering Team" autofocus />
          <div class="sel" *ngIf="sids.size > 0">
            <span class="chip" *ngFor="let u of selU">{{u.name}} <button class="cx" (click)="tog(u)">&times;</button></span>
          </div>
          <label class="lb">Add members</label>
          <input class="si" [(ngModel)]="q" (input)="onS()" placeholder="Search users…" />
          <div class="ul">
            <div *ngFor="let u of fu" class="ur" (click)="tog(u)">
              <div class="ck" [class.on]="sids.has(u.id)">
                <svg *ngIf="sids.has(u.id)" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
              </div>
              <div class="av" [style.background]="ac(u.name)">{{ini(u.name)}}</div>
              <div class="inf"><span class="nm">{{u.name}}</span><span class="em">{{u.email}}</span></div>
            </div>
          </div>
        </div>
        <div class="ft">
          <button class="cnl" (click)="close.emit()">Cancel</button>
          <button class="cr" [disabled]="!gn.trim()||sids.size<1" (click)="onCreate()">Create Group</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ov{position:fixed;inset:0;background:rgba(0,0,0,.3);z-index:100;display:flex;align-items:center;justify-content:center}
    .dlg{width:440px;max-height:600px;background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,.15);overflow:hidden;display:flex;flex-direction:column}
    .dh{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #f3f4f6}
    .dh h3{margin:0;font-size:16px;font-weight:600}
    .cb{width:28px;height:28px;border-radius:50%;border:none;background:#f3f4f6;font-size:18px;cursor:pointer;color:#6b7280}
    .bd{padding:16px 20px;flex:1;overflow-y:auto}
    .lb{display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;margin-bottom:6px;margin-top:12px}
    .lb:first-child{margin-top:0}
    .si{width:100%;padding:10px 12px;border-radius:10px;border:1px solid #e5e7eb;font-size:13px;outline:none;font-family:inherit} .si:focus{border-color:#93bbfd}
    .sel{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
    .chip{display:flex;align-items:center;gap:4px;background:#eef5ff;color:#3182fc;font-size:12px;font-weight:500;padding:4px 10px;border-radius:16px}
    .cx{background:none;border:none;color:#3182fc;cursor:pointer;font-size:14px;padding:0}
    .ul{max-height:200px;overflow-y:auto;margin-top:8px}
    .ur{display:flex;align-items:center;gap:10px;padding:8px 4px;cursor:pointer;border-radius:8px;transition:background .15s} .ur:hover{background:#f8fafc}
    .ck{width:20px;height:20px;border-radius:6px;border:2px solid #d1d5db;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s}
    .ck.on{background:#3182fc;border-color:#3182fc;color:#fff}
    .av{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;flex-shrink:0}
    .inf{flex:1;min-width:0} .nm{display:block;font-size:13px;font-weight:500;color:#1f2937} .em{display:block;font-size:11px;color:#9ca3af}
    .ft{display:flex;justify-content:flex-end;gap:8px;padding:12px 20px;border-top:1px solid #f3f4f6}
    .cnl{padding:8px 16px;border-radius:8px;border:1px solid #e5e7eb;background:#fff;font-size:13px;cursor:pointer;font-family:inherit}
    .cr{padding:8px 20px;border-radius:8px;border:none;background:#3182fc;color:#fff;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:background .15s}
    .cr:hover{background:#1b63f1} .cr:disabled{opacity:.4;cursor:not-allowed}
  `],
})
export class GroupCreateDialogComponent implements OnInit {
  @Input() currentUserId = '';
  @Output() createGroup = new EventEmitter<{ name: string; memberIds: string[] }>();
  @Output() close = new EventEmitter<void>();

  gn = ''; q = '';
  all: ChatUser[] = []; fu: ChatUser[] = [];
  sids = new Set<string>();
  ac = avatarColor; ini = initials;

  constructor(private api: ChatApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.api.listUsers().subscribe(u => { this.all = u.filter(x => x.id !== this.currentUserId); this.fu = this.all; this.cdr.markForCheck(); });
  }

  onS(): void { const q = this.q.toLowerCase(); this.fu = q ? this.all.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) : this.all; }

  tog(u: ChatUser): void { if (this.sids.has(u.id)) this.sids.delete(u.id); else this.sids.add(u.id); this.sids = new Set(this.sids); }

  get selU(): ChatUser[] { return this.all.filter(u => this.sids.has(u.id)); }

  onCreate(): void { if (!this.gn.trim() || this.sids.size < 1) return; this.createGroup.emit({ name: this.gn.trim(), memberIds: Array.from(this.sids) }); }
}
