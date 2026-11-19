import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  FolderKanban,
  Search,
  X,
  CheckCircle2,
  Ban,
  ArrowUpRight,
  AlertTriangle,
  MessageSquarePlus,
} from 'lucide-angular';
import { FraudStoreService } from '../../core/state/fraud-store.service';
import { CaseStatus, FraudCase } from '../../core/models/fraud.models';

@Component({
  selector: 'app-case-queue',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-5 animate-page-in">
      <!-- Header -->
      <div>
        <h1 class="font-display text-2xl sm:text-3xl font-bold tracking-tight gradient-text">
          Fraud Investigation Queue
        </h1>
        <p class="text-xs sm:text-sm text-zinc-400 mt-1">
          Enterprise case triage, analyst notes, decision audit trail, and status workflow
        </p>
      </div>

      <!-- Tabs -->
      <div class="flex flex-wrap items-center gap-2">
        @for (tab of tabs; track tab) {
          <button
            type="button"
            (click)="activeTab.set(tab)"
            class="px-3.5 py-2 rounded-xl text-xs font-medium border transition-all"
            [ngClass]="
              activeTab() === tab
                ? 'bg-purple-600/25 border-purple-500/50 text-white'
                : 'bg-[#10111D] border-white/8 text-zinc-400 hover:text-white'
            "
          >
            {{ tab }}
            <span class="ml-1.5 font-mono-num text-[10px] px-1.5 py-0.5 rounded bg-white/8">
              {{ countForTab(tab) }}
            </span>
          </button>
        }
      </div>

      <!-- Search -->
      <div class="fs-card p-3.5 flex flex-wrap items-center gap-3">
        <div class="relative flex-1 min-w-[220px]">
          <lucide-icon [img]="SearchIcon" class="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            placeholder="Search by Case ID, Transaction ID, Account, or Analyst..."
            class="w-full pl-9 pr-3 py-2 rounded-xl bg-[#090A16] border border-white/8 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>
      </div>

      <!-- Case Table -->
      <div class="fs-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-white/8 bg-[#090A16]/70 text-[11px] uppercase tracking-wider text-zinc-500">
                <th class="py-3 px-4 font-medium">Case ID</th>
                <th class="py-3 px-4 font-medium">Transaction ID</th>
                <th class="py-3 px-4 font-medium">Account</th>
                <th class="py-3 px-4 font-medium">Amount</th>
                <th class="py-3 px-4 font-medium">Risk</th>
                <th class="py-3 px-4 font-medium">Priority</th>
                <th class="py-3 px-4 font-medium">Analyst</th>
                <th class="py-3 px-4 font-medium">Status</th>
                <th class="py-3 px-4 font-medium text-right">Created</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/6 text-xs">
              @for (c of filteredCases(); track c.id) {
                <tr
                  (click)="selectedCaseId.set(c.id)"
                  class="hover:bg-purple-500/8 cursor-pointer transition-colors"
                >
                  <td class="py-3 px-4 font-mono-num font-semibold text-purple-300">
                    {{ c.id }}
                    @if (c.isSimulated) {
                      <span class="ml-1 px-1.5 py-0.5 rounded text-[9px] bg-fuchsia-500/20 text-fuchsia-300">SIM</span>
                    }
                  </td>
                  <td class="py-3 px-4 font-mono-num text-zinc-300">{{ c.transactionId }}</td>
                  <td class="py-3 px-4">
                    <div class="text-white font-medium">{{ c.accountName }}</div>
                    <div class="font-mono-num text-[10px] text-zinc-500">{{ c.accountId }}</div>
                  </td>
                  <td class="py-3 px-4 font-mono-num font-semibold text-white">\${{ c.amount | number: '1.0-0' }}</td>
                  <td class="py-3 px-4 font-mono-num font-bold text-red-400">{{ c.riskScore }}</td>
                  <td class="py-3 px-4">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-semibold border"
                      [ngClass]="{
                        'bg-red-500/15 text-red-300 border-red-500/30': c.priority === 'Critical',
                        'bg-amber-500/15 text-amber-300 border-amber-500/30': c.priority === 'High',
                        'bg-purple-500/15 text-purple-300 border-purple-500/30': c.priority === 'Medium'
                      }"
                    >
                      {{ c.priority }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-zinc-300">{{ c.assignedAnalyst }}</td>
                  <td class="py-3 px-4">
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] bg-white/6 text-zinc-200 border border-white/10">
                      {{ c.status }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right font-mono-num text-zinc-400">{{ c.createdAt | date: 'shortDate' }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="9" class="py-12 text-center text-sm text-zinc-500">No cases in this view.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Case Detail Drawer -->
    @if (selectedCase(); as c) {
      <div class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" (click)="selectedCaseId.set(null)"></div>
      <aside class="fixed top-0 right-0 z-50 h-full w-full max-w-xl bg-[#090A16]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col animate-page-in">
        <div class="px-6 py-4 border-b border-white/8 flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono-num text-base font-bold text-white">{{ c.id }}</span>
              <span class="px-2.5 py-0.5 rounded-full text-[11px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {{ c.status }}
              </span>
            </div>
            <p class="text-xs text-zinc-400 mt-1">{{ c.accountName }} ({{ c.accountId }}) • \${{ c.amount | number: '1.0-0' }}</p>
          </div>
          <button type="button" (click)="selectedCaseId.set(null)" class="p-2 rounded-lg text-zinc-400 hover:text-white">
            <lucide-icon [img]="CloseIcon" class="w-4 h-4" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-5">
          <div class="fs-card p-4 space-y-2">
            <p class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Case Summary</p>
            <p class="text-xs text-zinc-200 leading-relaxed">{{ c.summary }}</p>
            <div class="flex flex-wrap gap-2 pt-2">
              @for (txId of c.associatedTransactionIds; track txId) {
                <button
                  type="button"
                  (click)="store.openTransactionDrawer(txId)"
                  class="px-2.5 py-1 rounded-lg bg-purple-500/15 text-[11px] font-mono-num text-purple-300 border border-purple-500/25"
                >
                  Inspect {{ txId }}
                </button>
              }
            </div>
          </div>

          <!-- Add Analyst Note -->
          <div class="fs-card p-4 space-y-3">
            <p class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Analyst Notes</p>
            <div class="flex gap-2">
              <input
                type="text"
                [(ngModel)]="newNote"
                placeholder="Add investigation note..."
                class="flex-1 px-3 py-2 rounded-xl bg-[#090A16] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="button"
                (click)="submitNote(c.id)"
                class="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white flex items-center gap-1"
              >
                <lucide-icon [img]="NoteIcon" class="w-3.5 h-3.5" />
                Add
              </button>
            </div>
            <div class="space-y-2">
              @for (n of c.notes; track n.id) {
                <div class="p-3 rounded-xl bg-[#090A16] border border-white/6 text-xs">
                  <p class="text-zinc-200">{{ n.content }}</p>
                  <p class="text-[10px] text-zinc-500 mt-1">{{ n.author }} • {{ n.timestamp | date: 'short' }}</p>
                </div>
              }
            </div>
          </div>

          <!-- Timeline -->
          <div class="fs-card p-4 space-y-2.5">
            <p class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Investigation Timeline</p>
            @for (tl of c.timeline; track tl.id) {
              <div class="text-xs border-l-2 border-purple-500/40 pl-3 py-0.5">
                <p class="font-semibold text-white">{{ tl.title }}</p>
                <p class="text-zinc-400">{{ tl.detail }}</p>
                <p class="text-[10px] text-zinc-500">{{ tl.actor }} • {{ tl.timestamp | date: 'shortTime' }}</p>
              </div>
            }
          </div>
        </div>

        <!-- Decision Footer -->
        <div class="px-6 py-4 border-t border-white/8 bg-[#080913] flex flex-wrap gap-2">
          <button
            type="button"
            (click)="requestDecision(c, 'Resolved', 'Approve')"
            class="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 flex items-center gap-1"
          >
            <lucide-icon [img]="ApproveIcon" class="w-3.5 h-3.5" />
            Approve
          </button>
          <button
            type="button"
            (click)="requestDecision(c, 'Resolved', 'Block')"
            class="px-3 py-2 rounded-xl text-xs font-semibold bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 flex items-center gap-1"
          >
            <lucide-icon [img]="BlockIcon" class="w-3.5 h-3.5" />
            Block
          </button>
          <button
            type="button"
            (click)="requestDecision(c, 'Escalated', 'Escalate')"
            class="px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 flex items-center gap-1"
          >
            <lucide-icon [img]="EscalateIcon" class="w-3.5 h-3.5" />
            Escalate
          </button>
          <button
            type="button"
            (click)="requestDecision(c, 'False Positive', 'Mark False Positive')"
            class="px-3 py-2 rounded-xl text-xs font-semibold bg-white/8 hover:bg-white/12 text-zinc-200 border border-white/10"
          >
            Mark False Positive
          </button>
        </div>
      </aside>
    }

    <!-- Confirmation Dialog -->
    @if (pendingConfirm(); as conf) {
      <div class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="w-full max-w-md fs-elevated p-6 space-y-4 animate-page-in">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <lucide-icon [img]="WarnIcon" class="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-white">Confirm Analyst Decision</h3>
              <p class="text-xs text-zinc-400">{{ conf.caseItem.id }} • {{ conf.action }}</p>
            </div>
          </div>
          <p class="text-xs text-zinc-300 leading-relaxed">
            Are you sure you want to execute <strong>{{ conf.action }}</strong> on {{ conf.caseItem.id }} (Transaction {{ conf.caseItem.transactionId }})? This updates local mock state and audit logs.
          </p>
          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              (click)="pendingConfirm.set(null)"
              class="px-4 py-2 rounded-xl bg-white/6 text-xs text-zinc-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="confirmDecision()"
              class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white"
            >
              Confirm Decision
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class CaseQueueComponent {
  readonly store = inject(FraudStoreService);

  readonly FolderIcon = FolderKanban;
  readonly SearchIcon = Search;
  readonly CloseIcon = X;
  readonly ApproveIcon = CheckCircle2;
  readonly BlockIcon = Ban;
  readonly EscalateIcon = ArrowUpRight;
  readonly WarnIcon = AlertTriangle;
  readonly NoteIcon = MessageSquarePlus;

  readonly tabs: ('All Cases' | CaseStatus)[] = [
    'All Cases',
    'New',
    'Under Investigation',
    'Escalated',
    'Resolved',
    'False Positive',
  ];

  readonly activeTab = signal<'All Cases' | CaseStatus>('All Cases');
  readonly searchQuery = signal('');
  readonly selectedCaseId = signal<string | null>(null);
  newNote = '';

  readonly pendingConfirm = signal<{
    caseItem: FraudCase;
    status: CaseStatus;
    action: 'Approve' | 'Block' | 'Escalate' | 'Mark False Positive' | 'Close Case';
  } | null>(null);

  readonly selectedCase = computed(() => {
    const id = this.selectedCaseId();
    if (!id) return null;
    return this.store.cases().find((c) => c.id === id) ?? null;
  });

  readonly filteredCases = computed(() => {
    const tab = this.activeTab();
    const q = this.searchQuery().trim().toLowerCase();
    return this.store.cases().filter((c) => {
      if (tab !== 'All Cases' && c.status !== tab) return false;
      if (!q) return true;
      return (
        c.id.toLowerCase().includes(q) ||
        c.transactionId.toLowerCase().includes(q) ||
        c.accountName.toLowerCase().includes(q) ||
        c.assignedAnalyst.toLowerCase().includes(q)
      );
    });
  });

  countForTab(tab: 'All Cases' | CaseStatus): number {
    if (tab === 'All Cases') return this.store.cases().length;
    return this.store.cases().filter((c) => c.status === tab).length;
  }

  submitNote(caseId: string): void {
    const text = this.newNote.trim();
    if (!text) return;
    this.store.addCaseNote(caseId, text);
    this.newNote = '';
    this.store.showToast('Note Added', 'Analyst note recorded in case timeline.', 'info');
  }

  requestDecision(
    caseItem: FraudCase,
    status: CaseStatus,
    action: 'Approve' | 'Block' | 'Escalate' | 'Mark False Positive' | 'Close Case'
  ): void {
    this.pendingConfirm.set({ caseItem, status, action });
  }

  confirmDecision(): void {
    const conf = this.pendingConfirm();
    if (!conf) return;
    this.store.updateCaseStatus(conf.caseItem.id, conf.status, conf.action);
    this.pendingConfirm.set(null);
    this.store.showToast('Case Updated', `${conf.caseItem.id} marked as ${conf.status}.`, 'success');
  }
}
