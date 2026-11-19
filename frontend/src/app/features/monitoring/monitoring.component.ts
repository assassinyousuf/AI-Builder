import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Pause,
  Play,
  Search,
  Download,
  Zap,
  Activity,
  ShieldAlert,
  Clock,
} from 'lucide-angular';
import { FraudStoreService } from '../../core/state/fraud-store.service';
import { MockTransactionService } from '../../core/services/mock-transaction.service';
import { RiskBadgeComponent } from '../../shared/components/risk-badge.component';
import { RiskLevel, TransactionType } from '../../core/models/fraud.models';

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, RiskBadgeComponent],
  template: `
    <div class="space-y-5 animate-page-in">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="font-display text-2xl sm:text-3xl font-bold tracking-tight gradient-text">
              Live Transaction Stream
            </h1>
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border"
              [ngClass]="
                store.streamPaused()
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              "
            >
              <span
                class="relative w-2 h-2 rounded-full"
                [ngClass]="store.streamPaused() ? 'bg-amber-400' : 'bg-emerald-400 live-dot'"
              ></span>
              {{ store.streamPaused() ? 'PAUSED' : 'LIVE' }}
            </span>
          </div>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time scoring stream with simulated millisecond inference • Click any row to inspect
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            (click)="txnService.togglePause()"
            class="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors"
            [ngClass]="
              store.streamPaused()
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/40'
                : 'bg-[#10111D] hover:bg-[#151626] text-zinc-200 border-white/10'
            "
          >
            <lucide-icon [img]="store.streamPaused() ? PlayIcon : PauseIcon" class="w-3.5 h-3.5" />
            {{ store.streamPaused() ? 'Resume Stream' : 'Pause Stream' }}
          </button>

          <!-- Speed Selector -->
          <div class="inline-flex items-center rounded-xl bg-[#10111D] border border-white/8 p-1">
            @for (spd of speeds; track spd) {
              <button
                type="button"
                (click)="txnService.setSpeed(spd)"
                class="px-2.5 py-1 rounded-lg text-[11px] font-mono-num font-medium transition-colors"
                [ngClass]="
                  store.streamSpeed() === spd
                    ? 'bg-purple-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                "
              >
                {{ spd }}x
              </button>
            }
          </div>

          <button
            type="button"
            (click)="txnService.exportCsv(filteredTransactions(), 'fraudshield-live-stream.csv')"
            class="px-3.5 py-2 rounded-xl bg-[#10111D] hover:bg-[#151626] border border-white/8 text-xs font-medium text-zinc-200 flex items-center gap-1.5"
          >
            <lucide-icon [img]="DownloadIcon" class="w-3.5 h-3.5 text-purple-400" />
            Export CSV
          </button>
        </div>
      </div>

      <!-- Stream Telemetry KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="fs-card p-4 flex items-center justify-between">
          <div>
            <p class="text-[11px] text-zinc-400">Live Throughput</p>
            <p class="font-mono-num text-xl font-bold text-purple-300 mt-0.5">{{ store.liveTps() }} TPS</p>
          </div>
          <lucide-icon [img]="ZapIcon" class="w-5 h-5 text-purple-400" />
        </div>

        <div class="fs-card p-4 flex items-center justify-between">
          <div>
            <p class="text-[11px] text-zinc-400">Stream Buffer</p>
            <p class="font-mono-num text-xl font-bold text-white mt-0.5">{{ store.transactions().length }}</p>
          </div>
          <lucide-icon [img]="ActivityIcon" class="w-5 h-5 text-fuchsia-400" />
        </div>

        <div class="fs-card p-4 flex items-center justify-between">
          <div>
            <p class="text-[11px] text-zinc-400">Suspicious Flagged</p>
            <p class="font-mono-num text-xl font-bold text-red-400 mt-0.5">{{ store.kpis().suspiciousCount }}</p>
          </div>
          <lucide-icon [img]="AlertIcon" class="w-5 h-5 text-red-400" />
        </div>

        <div class="fs-card p-4 flex items-center justify-between">
          <div>
            <p class="text-[11px] text-zinc-400">Avg Inference Latency</p>
            <p class="font-mono-num text-xl font-bold text-emerald-400 mt-0.5">{{ store.kpis().avgLatency }} ms</p>
          </div>
          <lucide-icon [img]="ClockIcon" class="w-5 h-5 text-emerald-400" />
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="fs-card p-3.5 flex flex-wrap items-center gap-3">
        <div class="relative flex-1 min-w-[220px]">
          <lucide-icon [img]="SearchIcon" class="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            placeholder="Search by ID, sender, receiver, or city..."
            class="w-full pl-9 pr-3 py-2 rounded-xl bg-[#090A16] border border-white/8 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <select
          [ngModel]="riskFilter()"
          (ngModelChange)="riskFilter.set($event)"
          class="px-3 py-2 rounded-xl bg-[#090A16] border border-white/8 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/50"
        >
          <option value="all">All Risk Levels</option>
          <option value="critical">Critical (80–100)</option>
          <option value="high">High (60–79)</option>
          <option value="medium">Medium (30–59)</option>
          <option value="low">Low (0–29)</option>
        </select>

        <select
          [ngModel]="typeFilter()"
          (ngModelChange)="typeFilter.set($event)"
          class="px-3 py-2 rounded-xl bg-[#090A16] border border-white/8 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/50"
        >
          <option value="all">All Transaction Types</option>
          @for (t of transactionTypes; track t) {
            <option [value]="t">{{ t }}</option>
          }
        </select>

        <select
          [ngModel]="dateFilter()"
          (ngModelChange)="dateFilter.set($event)"
          class="px-3 py-2 rounded-xl bg-[#090A16] border border-white/8 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/50"
        >
          <option value="all">All Time</option>
          <option value="15m">Last 15 Minutes</option>
          <option value="1h">Last 1 Hour</option>
        </select>
      </div>

      <!-- Animated Stream Table -->
      <div class="fs-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-white/8 bg-[#090A16]/70 text-[11px] uppercase tracking-wider text-zinc-500">
                <th class="py-3 px-4 font-medium">Transaction ID</th>
                <th class="py-3 px-4 font-medium">Sender</th>
                <th class="py-3 px-4 font-medium">Receiver</th>
                <th class="py-3 px-4 font-medium">Amount</th>
                <th class="py-3 px-4 font-medium">Type</th>
                <th class="py-3 px-4 font-medium">Location</th>
                <th class="py-3 px-4 font-medium">Risk Score</th>
                <th class="py-3 px-4 font-medium">Latency</th>
                <th class="py-3 px-4 font-medium">Decision</th>
                <th class="py-3 px-4 font-medium text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/6 text-xs">
              @for (t of filteredTransactions(); track t.id) {
                <tr
                  (click)="store.openTransactionDrawer(t.id)"
                  class="hover:bg-purple-500/8 cursor-pointer transition-colors"
                  [class.animate-row-enter]="t.isNew"
                >
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                      <span class="font-mono-num font-semibold text-purple-300">{{ t.id }}</span>
                      @if (t.isSimulated) {
                        <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-fuchsia-500/20 text-fuchsia-300">
                          SIM
                        </span>
                      }
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="text-white font-medium">{{ t.senderName }}</div>
                    <div class="font-mono-num text-[10px] text-zinc-500">{{ t.senderAccount }}</div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="text-zinc-200">{{ t.receiverName }}</div>
                    <div class="font-mono-num text-[10px] text-zinc-500">{{ t.receiverAccount }}</div>
                  </td>
                  <td class="py-3 px-4 font-mono-num font-semibold text-white">
                    \${{ t.amount | number: '1.2-2' }}
                  </td>
                  <td class="py-3 px-4 text-zinc-300">{{ t.type }}</td>
                  <td class="py-3 px-4 text-zinc-300">{{ t.location.city }}, {{ t.location.countryCode }}</td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                      <span class="font-mono-num font-bold text-white w-6">{{ t.prediction.riskScore }}</span>
                      <app-risk-badge [riskLevel]="t.prediction.riskLevel" />
                    </div>
                  </td>
                  <td class="py-3 px-4 font-mono-num text-zinc-400">{{ t.prediction.latencyMs }}ms</td>
                  <td class="py-3 px-4">
                    <app-risk-badge [status]="t.status" />
                  </td>
                  <td class="py-3 px-4 text-right font-mono-num text-zinc-400">
                    {{ t.timestamp | date: 'mediumTime' }}
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="10" class="py-12 text-center text-sm text-zinc-500">
                    No transactions match your active filters.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class MonitoringComponent {
  readonly store = inject(FraudStoreService);
  readonly txnService = inject(MockTransactionService);

  readonly speeds: (0.5 | 1 | 2 | 5)[] = [0.5, 1, 2, 5];
  readonly transactionTypes: TransactionType[] = [
    'Wire Transfer',
    'Card Payment',
    'ACH Transfer',
    'Crypto Swap',
    'P2P Transfer',
    'International Remittance',
  ];

  readonly searchQuery = signal('');
  readonly riskFilter = signal<'all' | RiskLevel>('all');
  readonly typeFilter = signal<'all' | TransactionType>('all');
  readonly dateFilter = signal<'all' | '15m' | '1h'>('all');

  readonly PauseIcon = Pause;
  readonly PlayIcon = Play;
  readonly SearchIcon = Search;
  readonly DownloadIcon = Download;
  readonly ZapIcon = Zap;
  readonly ActivityIcon = Activity;
  readonly AlertIcon = ShieldAlert;
  readonly ClockIcon = Clock;

  readonly filteredTransactions = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const risk = this.riskFilter();
    const type = this.typeFilter();
    const dateWin = this.dateFilter();
    const now = Date.now();

    return this.store.transactions().filter((t) => {
      if (risk !== 'all' && t.prediction.riskLevel !== risk) return false;
      if (type !== 'all' && t.type !== type) return false;
      if (dateWin === '15m' && now - new Date(t.timestamp).getTime() > 15 * 60 * 1000) return false;
      if (dateWin === '1h' && now - new Date(t.timestamp).getTime() > 60 * 60 * 1000) return false;
      if (q) {
        const match =
          t.id.toLowerCase().includes(q) ||
          t.senderName.toLowerCase().includes(q) ||
          t.senderAccount.toLowerCase().includes(q) ||
          t.receiverName.toLowerCase().includes(q) ||
          t.location.city.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  });
}
