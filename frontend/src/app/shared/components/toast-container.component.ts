import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X, CheckCircle2, AlertTriangle, ShieldAlert, Info } from 'lucide-angular';
import { FraudStoreService } from '../../core/state/fraud-store.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      @for (toast of store.toasts(); track toast.id) {
        <div
          class="pointer-events-auto fs-elevated px-4 py-3 flex items-start gap-3 shadow-2xl border animate-row-enter"
          [ngClass]="{
            'border-emerald-500/35': toast.type === 'success',
            'border-amber-500/35': toast.type === 'warning',
            'border-red-500/40': toast.type === 'critical',
            'border-purple-500/35': toast.type === 'info'
          }"
        >
          <div class="mt-0.5 shrink-0">
            @switch (toast.type) {
              @case ('success') {
                <lucide-icon [img]="CheckIcon" class="w-4 h-4 text-emerald-400" />
              }
              @case ('warning') {
                <lucide-icon [img]="AlertIcon" class="w-4 h-4 text-amber-400" />
              }
              @case ('critical') {
                <lucide-icon [img]="CriticalIcon" class="w-4 h-4 text-red-400" />
              }
              @default {
                <lucide-icon [img]="InfoIcon" class="w-4 h-4 text-purple-400" />
              }
            }
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-white">{{ toast.title }}</p>
            <p class="text-xs text-zinc-400 mt-0.5 leading-relaxed">{{ toast.message }}</p>
          </div>
          <button
            type="button"
            (click)="store.dismissToast(toast.id)"
            class="text-zinc-500 hover:text-white transition-colors p-0.5"
            aria-label="Dismiss notification"
          >
            <lucide-icon [img]="CloseIcon" class="w-3.5 h-3.5" />
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  readonly store = inject(FraudStoreService);
  readonly CloseIcon = X;
  readonly CheckIcon = CheckCircle2;
  readonly AlertIcon = AlertTriangle;
  readonly CriticalIcon = ShieldAlert;
  readonly InfoIcon = Info;
}
