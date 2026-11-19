import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RiskLevel, TransactionStatus } from '../../core/models/fraud.models';

@Component({
  selector: 'app-risk-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (riskLevel) {
      <span
        class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase border"
        [ngClass]="riskClass"
      >
        <span class="w-1.5 h-1.5 rounded-full" [ngClass]="dotClass"></span>
        {{ riskLevel }}
      </span>
    }
    @if (status) {
      <span
        class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize border"
        [ngClass]="statusClass"
      >
        {{ statusLabel }}
      </span>
    }
  `,
})
export class RiskBadgeComponent {
  @Input() riskLevel?: RiskLevel;
  @Input() status?: TransactionStatus;

  get riskClass(): string {
    switch (this.riskLevel) {
      case 'critical':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'medium':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  }

  get dotClass(): string {
    switch (this.riskLevel) {
      case 'critical':
        return 'bg-red-400';
      case 'high':
        return 'bg-amber-400';
      case 'medium':
        return 'bg-purple-400';
      default:
        return 'bg-emerald-400';
    }
  }

  get statusClass(): string {
    switch (this.status) {
      case 'blocked':
        return 'bg-red-500/10 text-red-300 border-red-500/25';
      case 'flagged':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/25';
      case 'under_review':
        return 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/25';
      default:
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25';
    }
  }

  get statusLabel(): string {
    return (this.status ?? '').replace('_', ' ');
  }
}
