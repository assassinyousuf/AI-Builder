import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, KeyRound, ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-angular';
import { AuthLayoutComponent } from '../auth-layout.component';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule, AuthLayoutComponent],
  template: `
    <app-auth-layout>
      <div class="fs-card p-7 sm:p-8 border-white/10 space-y-6">
        <div class="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
          <lucide-icon [img]="KeyIcon" class="w-5 h-5 text-purple-300" />
        </div>

        <div>
          <h2 class="font-display text-2xl font-bold text-white">Password recovery</h2>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1">
            Enter your registered email address to request recovery instructions.
          </p>
        </div>

        @if (!sent()) {
          <form (ngSubmit)="submit()" class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-zinc-300 mb-1.5">Registered email</label>
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                placeholder="name@company.com"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#090A16] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/60"
              />
              @if (error()) {
                <p class="text-[11px] text-red-400 mt-1">{{ error() }}</p>
              }
            </div>

            <button
              type="submit"
              [disabled]="loading()"
              class="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 disabled:opacity-60 text-xs font-semibold text-white"
            >
              {{ loading() ? 'Submitting Request...' : 'Send Recovery Link' }}
            </button>
          </form>
        } @else {
          <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-xs text-emerald-200">
            <div class="flex items-center gap-2 font-semibold text-emerald-300">
              <lucide-icon [img]="CheckIcon" class="w-4 h-4" />
              Recovery Request Recorded
            </div>
            <p class="leading-relaxed text-zinc-300">{{ confirmationMessage() }}</p>
          </div>

          <a
            routerLink="/auth/reset-password"
            class="w-full py-2.5 rounded-xl bg-white/6 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-2"
          >
            Proceed to Reset Password
            <lucide-icon [img]="ArrowRightIcon" class="w-3.5 h-3.5" />
          </a>
        }

        <a
          routerLink="/auth/sign-in"
          class="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white"
        >
          <lucide-icon [img]="ArrowLeftIcon" class="w-3.5 h-3.5" />
          Back to Sign In
        </a>
      </div>
    </app-auth-layout>
  `,
})
export class ForgotPasswordComponent {
  private readonly auth = inject(AuthService);

  readonly KeyIcon = KeyRound;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly ArrowRightIcon = ArrowRight;
  readonly CheckIcon = CheckCircle2;

  email = '';
  readonly loading = signal(false);
  readonly sent = signal(false);
  readonly error = signal<string | null>(null);
  readonly confirmationMessage = signal('');

  async submit(): Promise<void> {
    const clean = this.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      this.error.set('Please enter a valid registered email address.');
      return;
    }
    this.error.set(null);
    this.loading.set(true);
    const res = await this.auth.requestPasswordReset(clean);
    this.loading.set(false);
    this.confirmationMessage.set(res.message);
    this.sent.set(true);
  }
}
