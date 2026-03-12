import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cflow-user-status',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="dot" [ngClass]="'s-' + (status || 'offline')"></span>`,
  styles: [`.dot{display:inline-block;width:8px;height:8px;border-radius:50%;border:1.5px solid #fff;flex-shrink:0}
    .s-online{background:#10b981} .s-away{background:#f59e0b} .s-offline{background:#d1d5db}`]
})
export class UserStatusComponent {
  @Input() status: string = 'offline';
}
