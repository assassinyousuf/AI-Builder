import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  LucideAngularModule,
  X,
  ShieldAlert,
  CheckCircle2,
  Ban,
  ArrowUpRight,
  FolderPlus,
  Sparkles,
  MapPin,
  Cpu,
  Clock,
} from 'lucide-angular';
import { FraudStoreService } from '../../core/state/fraud-store.service';
import { MockTransactionService } from '../../core/services/mock-transaction.service';
import { RiskGaugeComponent } from './risk-gauge.component';
import { RiskBadgeComponent } from './risk-badge.component';

@Component({
  selector: 'app-transaction-drawer',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RiskGaugeComponent, RiskBadgeComponent],
  template: `
    @if (txn(); as t) {
      <div
        class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        (click)="store.closeTransactionDrawer()"
      ></div>

      <aside
        class="fixed top-0 right-0 z-50 h-full w-full max-w-xl bg-[#090A16]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col animate-page-in"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-white/8 flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2.5">
              <span class="font-mono-num text-base font-bold text-white">{{ t.id }}</span>
              <app-risk-badge [riskLevel]="t.prediction.riskLevel" [status]="t.status" />
              @if (t.isSimulated) {
                <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                  SIMULATED
                </span>
              }
            </div>
            <p class="text-xs text-zinc-400 mt-1">
              {{ t.type }} • {{ t.timestamp | date: 'medium' }}
            </p>
          </div>
          <button
            type="button"
            (click)="store.closeTransactionDrawer()"
            class="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close drawer"
          >
            <lucide-icon [img]="CloseIcon" class="w-4 h-4" />
          </button>
        </div>

        <!-- Scrollable Body -->
        <div class="flex-1 overflow-y-auto p-6 space-y-5">
          <!-- Risk Gauge & Probability -->
          <div class="fs-card p-5 flex items-center gap-6">
            <app-risk-gauge [score]="t.prediction.riskScore" [size]="108" [strokeWidth]="9" />
            <div class="flex-1 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs text-zinc-400">Fraud Probability</span>
                <span class="font-mono-num text-sm font-semibold text-white">
                  {{ (t.prediction.fraudProbability * 100).toFixed(1) }}%
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-zinc-400">Model Decision</span>
                <span class="text-xs font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {{ t.prediction.modelDecision }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-zinc-400">Inference Latency</span>
                <span class="font-mono-num text-xs text-emerald-400">{{ t.prediction.latencyMs }} ms</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-zinc-400">Amount</span>
                <span class="font-mono-num text-base font-bold text-white">
                  \${{ t.amount | number: '1.2-2' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Sender / Receiver / Device / Geo -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="fs-card p-4 space-y-1.5">
              <p class="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">Originating Account</p>
              <p class="text-sm font-semibold text-white">{{ t.senderName }}</p>
              <p class="font-mono-num text-xs text-purple-300">{{ t.senderAccount }}</p>
              <div class="flex items-center gap-1.5 text-xs text-zinc-400 pt-1">
                <lucide-icon [img]="MapIcon" class="w-3.5 h-3.5 text-zinc-500" />
                {{ t.location.city }}, {{ t.location.country }}
              </div>
            </div>

            <div class="fs-card p-4 space-y-1.5">
              <p class="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">Beneficiary / Merchant</p>
              <p class="text-sm font-semibold text-white">{{ t.receiverName }}</p>
              <p class="font-mono-num text-xs text-fuchsia-300">{{ t.receiverAccount }}</p>
              <div class="flex items-center gap-1.5 text-xs text-zinc-400 pt-1">
                <lucide-icon [img]="CpuIcon" class="w-3.5 h-3.5 text-zinc-500" />
                {{ t.device.deviceId }} ({{ t.device.os }})
              </div>
            </div>
          </div>

          <!-- Top SHAP Contributions -->
          <div class="fs-card p-4 space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Top Contributing Features (Mock SHAP)
              </h4>
              <span class="text-[10px] text-zinc-500">Local Demo Model</span>
            </div>
            <div class="space-y-2.5">
              @for (item of t.explanation.shapContributions.slice(0, 4); track item.feature) {
                <div>
                  <div class="flex items-center justify-between text-xs mb-1">
                    <span class="text-zinc-300">{{ item.label }} <span class="text-zinc-500">({{ item.value }})</span></span>
                    <span
                      class="font-mono-num font-semibold"
                      [ngClass]="item.contribution >= 0 ? 'text-red-400' : 'text-emerald-400'"
                    >
                      {{ item.contribution >= 0 ? '+' : '' }}{{ item.contribution.toFixed(2) }}
                    </span>
                  </div>
                  <div class="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-500"
                      [ngClass]="item.contribution >= 0 ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-emerald-500'"
                      [style.width.%]="Math.min(100, Math.abs(item.contribution) * 260)"
                    ></div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- LLM Reason Code -->
          <div class="fs-card p-4 border-purple-500/25 bg-purple-950/10 space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <lucide-icon [img]="SparklesIcon" class="w-4 h-4 text-purple-400" />
                <span class="text-xs font-semibold text-purple-200">AI Reason Code</span>
              </div>
              <span class="font-mono-num text-[11px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                {{ t.explanation.reasonCode.code }}
              </span>
            </div>
            <p class="text-xs font-medium text-white">{{ t.explanation.reasonCode.headline }}</p>
            <p class="text-xs text-zinc-300 leading-relaxed">{{ t.explanation.reasonCode.narrative }}</p>
          </div>

          <!-- Related Alerts & Similar Transactions -->
          @if (relatedAlerts().length > 0 || similarTxns().length > 0) {
            <div class="fs-card p-4 space-y-3">
              <h4 class="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Related Signals & Similar Transactions
              </h4>
              @if (relatedAlerts().length > 0) {
                <div class="space-y-1.5">
                  @for (a of relatedAlerts(); track a.id) {
                    <div class="text-xs px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 flex items-center justify-between">
                      <span class="truncate">{{ a.title }}</span>
                      <span class="font-mono-num text-[10px] text-red-400 ml-2 shrink-0">{{ a.severity | uppercase }}</span>
                    </div>
                  }
                </div>
              }
              @if (similarTxns().length > 0) {
                <div class="space-y-1.5">
                  @for (s of similarTxns(); track s.id) {
                    <button
                      type="button"
                      (click)="store.openTransactionDrawer(s.id)"
                      class="w-full text-left text-xs px-3 py-2 rounded-lg bg-white/3 hover:bg-white/6 border border-white/6 flex items-center justify-between transition-colors"
                    >
                      <span class="font-mono-num text-purple-300">{{ s.id }}</span>
                      <span class="text-zinc-300">\${{ s.amount | number: '1.0-0' }} • {{ s.location.city }}</span>
                      <span class="font-mono-num text-zinc-400">Risk {{ s.prediction.riskScore }}</span>
                    </button>
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- Action Footer -->
        <div class="px-6 py-4 border-t border-white/8 bg-[#080913] flex flex-wrap items-center gap-2">
          <button
            type="button"
            (click)="investigate(t.id)"
            class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 transition-colors"
          >
            <lucide-icon [img]="SparklesIcon" class="w-3.5 h-3.5" />
            Investigate
          </button>
          <button
            type="button"
            (click)="txnService.addToCase(t.id)"
            class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/6 hover:bg-white/10 text-zinc-200 border border-white/10 flex items-center gap-1.5 transition-colors"
          >
            <lucide-icon [img]="FolderIcon" class="w-3.5 h-3.5" />
            Add to Case
          </button>
          <div class="flex-1"></div>
          <button
            type="button"
            (click)="txnService.approveTransaction(t.id)"
            class="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 transition-colors"
          >
            <lucide-icon [img]="ApproveIcon" class="w-3.5 h-3.5" />
            Approve
          </button>
          <button
            type="button"
            (click)="txnService.blockTransaction(t.id)"
            class="px-3 py-2 rounded-xl text-xs font-semibold bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 flex items-center gap-1 transition-colors"
          >
            <lucide-icon [img]="BlockIcon" class="w-3.5 h-3.5" />
            Block
          </button>
          <button
            type="button"
            (click)="txnService.escalateTransaction(t.id)"
            class="px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 flex items-center gap-1 transition-colors"
          >
            <lucide-icon [img]="EscalateIcon" class="w-3.5 h-3.5" />
            Escalate
          </button>
        </div>
      </aside>
    }
  `,
})
export class TransactionDrawerComponent {
  readonly store = inject(FraudStoreService);
  readonly txnService = inject(MockTransactionService);
  private readonly router = inject(Router);

  readonly Math = Math;
  readonly CloseIcon = X;
  readonly AlertIcon = ShieldAlert;
  readonly ApproveIcon = CheckCircle2;
  readonly BlockIcon = Ban;
  readonly EscalateIcon = ArrowUpRight;
  readonly FolderIcon = FolderPlus;
  readonly SparklesIcon = Sparkles;
  readonly MapIcon = MapPin;
  readonly CpuIcon = Cpu;
  readonly ClockIcon = Clock;

  readonly txn = this.store.drawerTransaction;

  readonly relatedAlerts = computed(() => {
    const t = this.txn();
    if (!t) return [];
    return this.store.alerts().filter((a) => a.transactionId === t.id || a.accountId === t.senderAccount).slice(0, 3);
  });

  readonly similarTxns = computed(() => {
    const t = this.txn();
    if (!t) return [];
    return this.store
      .transactions()
      .filter((x) => x.id !== t.id && x.type === t.type)
      .slice(0, 3);
  });

  investigate(id: string): void {
    this.store.selectedExplainTransactionId.set(id);
    this.store.closeTransactionDrawer();
    this.router.navigate(['/app/explainability']);
  }
}
