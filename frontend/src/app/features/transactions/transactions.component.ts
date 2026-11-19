import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Download, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-angular';
import { FraudStoreService } from '../../core/state/fraud-store.service';
import { MockTransactionService } from '../../core/services/mock-transaction.service';
import { RiskBadgeComponent } from '../../shared/components/risk-badge.component';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, RiskBadgeComponent],
  template: `
    <div class="space-y-5 animate-page-in">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="font-display text-2xl sm:text-3xl font-bold tracking-tight gradient-text">
            Transactions Explorer
          </h1>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1">
            Full searchable ledger with sorting, pagination, and CSV export
          </p>
        </div>

        <button
          type="button"
          (click)="txnService.exportCsv(sortedTransactions(), 'fraudshield-ledger.csv')"
          class="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white flex items-center gap-1.5 self-start"
        >
          <lucide-icon [img]="DownloadIcon" class="w-3.5 h-3.5" />
          Export Filtered CSV
        </button>
      </div>

      <!-- Search & Sort Controls -->
      <div class="fs-card p-3.5 flex flex-wrap items-center gap-3">
        <div class="relative flex-1 min-w-[220px]">
          <lucide-icon [img]="SearchIcon" class="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            [ngModel]="query()"
            (ngModelChange)="query.set($event); page.set(1)"
            placeholder="Search ID, sender, receiver, IP, or location..."
            class="w-full pl-9 pr-3 py-2 rounded-xl bg-[#090A16] border border-white/8 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <select
          [ngModel]="statusFilter()"
          (ngModelChange)="statusFilter.set($event); page.set(1)"
          class="px-3 py-2 rounded-xl bg-[#090A16] border border-white/8 text-xs text-zinc-200"
        >
          <option value="all">All Statuses</option>
          <option value="blocked">Blocked</option>
          <option value="flagged">Flagged</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
        </select>

        <button
          type="button"
          (click)="toggleSort('risk')"
          class="px-3 py-2 rounded-xl bg-[#090A16] border border-white/8 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5"
        >
          <lucide-icon [img]="SortIcon" class="w-3.5 h-3.5 text-purple-400" />
          Sort Risk ({{ sortBy() === 'risk' ? sortDir() : 'none' }})
        </button>

        <button
          type="button"
          (click)="toggleSort('amount')"
          class="px-3 py-2 rounded-xl bg-[#090A16] border border-white/8 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5"
        >
          <lucide-icon [img]="SortIcon" class="w-3.5 h-3.5 text-fuchsia-400" />
          Sort Amount ({{ sortBy() === 'amount' ? sortDir() : 'none' }})
        </button>
      </div>

      <!-- Table -->
      <div class="fs-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-white/8 bg-[#090A16]/70 text-[11px] uppercase tracking-wider text-zinc-500">
                <th class="py-3 px-4 font-medium">ID</th>
                <th class="py-3 px-4 font-medium">Sender</th>
                <th class="py-3 px-4 font-medium">Receiver</th>
                <th class="py-3 px-4 font-medium">Amount</th>
                <th class="py-3 px-4 font-medium">Type</th>
                <th class="py-3 px-4 font-medium">Location</th>
                <th class="py-3 px-4 font-medium">Risk</th>
                <th class="py-3 px-4 font-medium">Status</th>
                <th class="py-3 px-4 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/6 text-xs">
              @for (t of pagedTransactions(); track t.id) {
                <tr
                  (click)="store.openTransactionDrawer(t.id)"
                  class="hover:bg-purple-500/8 cursor-pointer transition-colors"
                >
                  <td class="py-3 px-4 font-mono-num font-semibold text-purple-300">{{ t.id }}</td>
                  <td class="py-3 px-4">
                    <div class="text-white font-medium">{{ t.senderName }}</div>
                    <div class="font-mono-num text-[10px] text-zinc-500">{{ t.senderAccount }}</div>
                  </td>
                  <td class="py-3 px-4 text-zinc-300">{{ t.receiverName }}</td>
                  <td class="py-3 px-4 font-mono-num font-semibold text-white">\${{ t.amount | number: '1.2-2' }}</td>
                  <td class="py-3 px-4 text-zinc-400">{{ t.type }}</td>
                  <td class="py-3 px-4 text-zinc-300">{{ t.location.city }}, {{ t.location.countryCode }}</td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                      <span class="font-mono-num font-bold text-white">{{ t.prediction.riskScore }}</span>
                      <app-risk-badge [riskLevel]="t.prediction.riskLevel" />
                    </div>
                  </td>
                  <td class="py-3 px-4"><app-risk-badge [status]="t.status" /></td>
                  <td class="py-3 px-4 text-right font-mono-num text-zinc-400">{{ t.timestamp | date: 'short' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-4 py-3 border-t border-white/8 flex items-center justify-between text-xs text-zinc-400">
          <span>Showing {{ pagedTransactions().length }} of {{ sortedTransactions().length }} transactions</span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              [disabled]="page() <= 1"
              (click)="page.set(page() - 1)"
              class="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40"
            >
              <lucide-icon [img]="PrevIcon" class="w-4 h-4" />
            </button>
            <span class="font-mono-num text-white">Page {{ page() }} / {{ totalPages() }}</span>
            <button
              type="button"
              [disabled]="page() >= totalPages()"
              (click)="page.set(page() + 1)"
              class="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40"
            >
              <lucide-icon [img]="NextIcon" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TransactionsComponent {
  readonly store = inject(FraudStoreService);
  readonly txnService = inject(MockTransactionService);

  readonly SearchIcon = Search;
  readonly DownloadIcon = Download;
  readonly SortIcon = ArrowUpDown;
  readonly PrevIcon = ChevronLeft;
  readonly NextIcon = ChevronRight;

  readonly query = signal('');
  readonly statusFilter = signal('all');
  readonly sortBy = signal<'time' | 'risk' | 'amount'>('time');
  readonly sortDir = signal<'asc' | 'desc'>('desc');
  readonly page = signal(1);
  readonly pageSize = 15;

  readonly sortedTransactions = computed(() => {
    const q = this.query().trim().toLowerCase();
    const st = this.statusFilter();
    const by = this.sortBy();
    const dir = this.sortDir() === 'asc' ? 1 : -1;

    const filtered = this.store.transactions().filter((t) => {
      if (st !== 'all' && t.status !== st) return false;
      if (!q) return true;
      return (
        t.id.toLowerCase().includes(q) ||
        t.senderName.toLowerCase().includes(q) ||
        t.senderAccount.toLowerCase().includes(q) ||
        t.receiverName.toLowerCase().includes(q) ||
        t.location.city.toLowerCase().includes(q) ||
        t.ipAddress.includes(q)
      );
    });

    if (by === 'risk') {
      return [...filtered].sort((a, b) => (a.prediction.riskScore - b.prediction.riskScore) * dir);
    }
    if (by === 'amount') {
      return [...filtered].sort((a, b) => (a.amount - b.amount) * dir);
    }
    return filtered;
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.sortedTransactions().length / this.pageSize)));

  readonly pagedTransactions = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.sortedTransactions().slice(start, start + this.pageSize);
  });

  toggleSort(field: 'risk' | 'amount'): void {
    if (this.sortBy() === field) {
      this.sortDir.update((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      this.sortBy.set(field);
      this.sortDir.set('desc');
    }
  }
}
