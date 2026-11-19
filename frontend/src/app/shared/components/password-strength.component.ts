import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-password-strength',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (password) {
      <div class="space-y-1.5 mt-2">
        <div class="grid grid-cols-4 gap-1.5">
          @for (bar of [1, 2, 3, 4]; track bar) {
            <div
              class="h-1 rounded-full transition-colors duration-200"
              [ngClass]="score() >= bar ? barColor() : 'bg-white/10'"
            ></div>
          }
        </div>
        <div class="flex items-center justify-between text-[10px]">
          <span class="text-zinc-500">Password strength</span>
          <span class="font-semibold" [ngClass]="textColor()">{{ label() }}</span>
        </div>
      </div>
    }
  `,
})
export class PasswordStrengthComponent {
  @Input() password = '';

  score(): number {
    const p = this.password || '';
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return Math.max(p.length >= 6 ? 1 : 0, s);
  }

  label(): string {
    const s = this.score();
    if (s <= 1) return 'Weak';
    if (s === 2) return 'Fair';
    if (s === 3) return 'Strong';
    return 'Very Strong';
  }

  barColor(): string {
    const s = this.score();
    if (s <= 1) return 'bg-red-500';
    if (s === 2) return 'bg-amber-500';
    if (s === 3) return 'bg-purple-500';
    return 'bg-emerald-500';
  }

  textColor(): string {
    const s = this.score();
    if (s <= 1) return 'text-red-400';
    if (s === 2) return 'text-amber-400';
    if (s === 3) return 'text-purple-300';
    return 'text-emerald-400';
  }
}
