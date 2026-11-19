import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-risk-gauge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-flex items-center justify-center" [style.width.px]="size" [style.height.px]="size">
      <svg [attr.width]="size" [attr.height]="size" class="-rotate-90 transform">
        <circle
          [attr.cx]="center"
          [attr.cy]="center"
          [attr.r]="radius"
          fill="transparent"
          stroke="rgba(255,255,255,0.08)"
          [attr.stroke-width]="strokeWidth"
        />
        <circle
          [attr.cx]="center"
          [attr.cy]="center"
          [attr.r]="radius"
          fill="transparent"
          [attr.stroke]="strokeColor"
          [attr.stroke-width]="strokeWidth"
          stroke-linecap="round"
          [attr.stroke-dasharray]="circumference"
          [attr.stroke-dashoffset]="dashOffset"
          class="transition-all duration-700 ease-out"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span class="font-mono-num font-bold tracking-tight text-white" [style.font-size.px]="size * 0.24">
          {{ score }}
        </span>
        <span class="text-[10px] uppercase tracking-wider text-zinc-400">Risk / 100</span>
      </div>
    </div>
  `,
})
export class RiskGaugeComponent {
  @Input() score = 0;
  @Input() size = 120;
  @Input() strokeWidth = 10;

  get center(): number {
    return this.size / 2;
  }

  get radius(): number {
    return (this.size - this.strokeWidth) / 2;
  }

  get circumference(): number {
    return 2 * Math.PI * this.radius;
  }

  get dashOffset(): number {
    const clamped = Math.max(0, Math.min(100, this.score));
    return this.circumference * (1 - clamped / 100);
  }

  get strokeColor(): string {
    if (this.score >= 80) return '#EF4444';
    if (this.score >= 60) return '#F59E0B';
    if (this.score >= 30) return '#A855F7';
    return '#10B981';
  }
}
