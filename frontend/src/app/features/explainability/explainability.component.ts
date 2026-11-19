import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { EChartsOption } from 'echarts';
import {
  LucideAngularModule,
  BrainCircuit,
  Sparkles,
  Copy,
  RefreshCw,
  Check,
  Search,
  AlertCircle,
} from 'lucide-angular';
import { FraudStoreService } from '../../core/state/fraud-store.service';
import { MockFraudService } from '../../core/services/mock-fraud.service';
import { EchartsWrapperComponent } from '../../shared/components/echarts-wrapper.component';
import { RiskGaugeComponent } from '../../shared/components/risk-gauge.component';
import { RiskBadgeComponent } from '../../shared/components/risk-badge.component';
import { LlmReasonCode } from '../../core/models/fraud.models';

@Component({
  selector: 'app-explainability',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    EchartsWrapperComponent,
    RiskGaugeComponent,
    RiskBadgeComponent,
  ],
  template: `
    <div class="space-y-6 animate-page-in">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 class="font-display text-2xl sm:text-3xl font-bold tracking-tight gradient-text">
            Explainable Fraud Intelligence
          </h1>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1">
            SHAP-style feature attribution & deterministic AI Reason Code synthesis (Mock Explainability Schema)
          </p>
        </div>

        <!-- Transaction Selector -->
        <div class="flex flex-wrap items-center gap-2">
          <div class="relative">
            <lucide-icon [img]="SearchIcon" class="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              [ngModel]="txnFilter()"
              (ngModelChange)="txnFilter.set($event)"
              placeholder="Filter TXN ID..."
              class="pl-8 pr-3 py-2 rounded-xl bg-[#10111D] border border-white/10 text-xs text-white placeholder-zinc-500 w-36 focus:outline-none focus:border-purple-500/50"
            />
          </div>
          <select
            [ngModel]="store.selectedExplainTransactionId()"
            (ngModelChange)="selectTxn($event)"
            class="px-3.5 py-2 rounded-xl bg-[#10111D] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500/50"
          >
            @for (t of selectableTxns(); track t.id) {
              <option [value]="t.id">
                {{ t.id }} — \${{ t.amount | number: '1.0-0' }} (Risk {{ t.prediction.riskScore }})
              </option>
            }
          </select>
        </div>
      </div>

      @if (selectedTxn(); as txn) {
        <!-- Top Row: Risk Gauge + SHAP Horizontal Bar Chart -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <!-- Risk Gauge Card -->
          <div class="fs-card p-6 lg:col-span-4 flex flex-col items-center justify-between text-center">
            <div class="w-full flex items-center justify-between mb-2">
              <span class="font-mono-num text-sm font-bold text-purple-300">{{ txn.id }}</span>
              <app-risk-badge [riskLevel]="txn.prediction.riskLevel" [status]="txn.status" />
            </div>

            <app-risk-gauge [score]="txn.prediction.riskScore" [size]="156" [strokeWidth]="12" class="my-3" />

            <div class="w-full grid grid-cols-2 gap-3 pt-3 border-t border-white/8 text-left">
              <div>
                <p class="text-[11px] text-zinc-500">Fraud Probability</p>
                <p class="font-mono-num text-base font-bold text-white">
                  {{ (txn.prediction.fraudProbability * 100).toFixed(1) }}%
                </p>
              </div>
              <div>
                <p class="text-[11px] text-zinc-500">Model Decision</p>
                <p class="font-mono-num text-base font-bold text-purple-300">
                  {{ txn.prediction.modelDecision }}
                </p>
              </div>
              <div>
                <p class="text-[11px] text-zinc-500">Amount</p>
                <p class="font-mono-num text-sm font-semibold text-white">\${{ txn.amount | number: '1.2-2' }}</p>
              </div>
              <div>
                <p class="text-[11px] text-zinc-500">Location</p>
                <p class="text-sm font-medium text-zinc-200 truncate">{{ txn.location.city }}</p>
              </div>
            </div>
          </div>

          <!-- SHAP Feature Importance -->
          <div class="fs-card p-6 lg:col-span-8">
            <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h2 class="text-base font-semibold text-white flex items-center gap-2">
                  <lucide-icon [img]="BrainIcon" class="w-4 h-4 text-purple-400" />
                  Top 5 Contributing Features (SHAP Attribution)
                </h2>
                <p class="text-[11px] text-zinc-400">
                  Red bars push risk higher; Emerald bars reduce predicted fraud probability (Simulated SHAP schema)
                </p>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-zinc-400 border border-white/8">
                Mock Attribution Output
              </span>
            </div>

            <app-echarts [option]="shapChartOption()" height="220px" />

            <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2">
              @for (s of txn.explanation.shapContributions; track s.feature) {
                <div class="p-2.5 rounded-xl bg-[#090A16] border border-white/6">
                  <p class="text-[11px] font-medium text-zinc-300 truncate">{{ s.label }}</p>
                  <p class="text-[10px] text-zinc-500 truncate mt-0.5">{{ s.value }}</p>
                  <p
                    class="font-mono-num text-xs font-bold mt-1"
                    [ngClass]="s.contribution >= 0 ? 'text-red-400' : 'text-emerald-400'"
                  >
                    {{ s.contribution >= 0 ? '+' : '' }}{{ s.contribution.toFixed(3) }}
                  </p>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Bottom Row: Why Flagged + LLM Reason Codes Panel -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <!-- Why was this transaction flagged? -->
          <div class="fs-card p-6 lg:col-span-5 space-y-4">
            <h2 class="text-base font-semibold text-white flex items-center gap-2">
              <lucide-icon [img]="AlertIcon" class="w-4 h-4 text-amber-400" />
              Why was this transaction flagged?
            </h2>

            <p class="text-sm text-zinc-200 leading-relaxed bg-[#090A16] p-4 rounded-xl border border-white/8">
              {{ txn.explanation.summary }}
            </p>

            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Evidence Summary
              </p>
              <ul class="space-y-2">
                @for (ev of txn.explanation.evidenceSummary; track ev) {
                  <li class="flex items-start gap-2 text-xs text-zinc-300">
                    <span class="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                    <span>{{ ev }}</span>
                  </li>
                }
              </ul>
            </div>
          </div>

          <!-- LLM Reason Codes Panel -->
          <div class="fs-card p-6 lg:col-span-7 border-purple-500/25 space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 class="text-base font-semibold text-white flex items-center gap-2">
                  <lucide-icon [img]="SparklesIcon" class="w-4 h-4 text-fuchsia-400" />
                  LLM Reason Codes
                </h2>
                <p class="text-[11px] text-zinc-400">
                  Deterministic compliance-ready narrative generated from local transaction telemetry
                </p>
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="generateReasonCode(false)"
                  [disabled]="generating()"
                  class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-60 text-xs font-semibold text-white flex items-center gap-1.5 transition-all"
                >
                  <lucide-icon [img]="SparklesIcon" class="w-3.5 h-3.5" />
                  {{ generating() ? 'Synthesizing...' : 'Generate Explanation' }}
                </button>
                <button
                  type="button"
                  (click)="generateReasonCode(true)"
                  [disabled]="generating()"
                  class="p-2 rounded-xl bg-[#090A16] hover:bg-white/8 border border-white/10 text-zinc-300"
                  title="Regenerate variant"
                >
                  <lucide-icon [img]="RefreshIcon" class="w-3.5 h-3.5" [class.animate-spin]="generating()" />
                </button>
                <button
                  type="button"
                  (click)="copyExplanation()"
                  class="p-2 rounded-xl bg-[#090A16] hover:bg-white/8 border border-white/10 text-zinc-300"
                  title="Copy explanation"
                >
                  <lucide-icon [img]="copied() ? CheckIcon : CopyIcon" class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            @if (generating()) {
              <div class="space-y-2.5 p-4 rounded-xl bg-[#090A16] border border-purple-500/20">
                <div class="h-4 w-48 rounded skeleton-shimmer"></div>
                <div class="h-3 w-full rounded skeleton-shimmer"></div>
                <div class="h-3 w-5/6 rounded skeleton-shimmer"></div>
              </div>
            } @else {
              @if (activeReasonCode(); as rc) {
                <div class="p-4 rounded-xl bg-[#090A16] border border-purple-500/25 space-y-3">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <span class="font-mono-num text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {{ rc.code }}
                    </span>
                    <span class="text-[11px] font-mono-num text-zinc-400">
                      Confidence: {{ rc.confidence }}% • Mock Reason Engine
                    </span>
                  </div>

                  <p class="text-sm font-semibold text-white">{{ rc.headline }}</p>
                  <p class="text-xs text-zinc-300 leading-relaxed">{{ rc.narrative }}</p>

                  <div class="pt-2 border-t border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span class="text-[11px] font-semibold text-amber-300">
                      Recommended Action:
                    </span>
                    <span class="text-xs text-zinc-200">{{ rc.recommendedAction }}</span>
                  </div>
                </div>
              }
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class ExplainabilityComponent {
  readonly store = inject(FraudStoreService);
  private readonly fraudService = inject(MockFraudService);

  readonly txnFilter = signal('');
  readonly generating = signal(false);
  readonly copied = signal(false);
  private variantCounter = 0;
  readonly overrideReasonCode = signal<LlmReasonCode | null>(null);

  readonly BrainIcon = BrainCircuit;
  readonly SparklesIcon = Sparkles;
  readonly CopyIcon = Copy;
  readonly RefreshIcon = RefreshCw;
  readonly CheckIcon = Check;
  readonly SearchIcon = Search;
  readonly AlertIcon = AlertCircle;

  readonly selectableTxns = computed(() => {
    const q = this.txnFilter().trim().toLowerCase();
    const list = this.store.transactions();
    if (!q) return list.slice(0, 30);
    return list.filter((t) => t.id.toLowerCase().includes(q) || t.senderName.toLowerCase().includes(q)).slice(0, 30);
  });

  readonly selectedTxn = computed(() => {
    const id = this.store.selectedExplainTransactionId();
    return this.store.transactions().find((t) => t.id === id) ?? this.store.transactions()[0];
  });

  readonly activeReasonCode = computed(() => {
    return this.overrideReasonCode() ?? this.selectedTxn()?.explanation.reasonCode ?? null;
  });

  readonly shapChartOption = computed<EChartsOption>(() => {
    const txn = this.selectedTxn();
    if (!txn) return {};
    const items = [...txn.explanation.shapContributions].reverse();

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#151626',
        borderColor: 'rgba(168,85,247,0.35)',
        textStyle: { color: '#F8FAFC', fontSize: 12 },
      },
      grid: { left: 145, right: 24, top: 10, bottom: 24 },
      xAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
        axisLabel: { color: '#71717A', fontSize: 10 },
      },
      yAxis: {
        type: 'category',
        data: items.map((i) => i.label),
        axisLabel: { color: '#E4E4E7', fontSize: 11 },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      },
      series: [
        {
          type: 'bar',
          barWidth: 16,
          data: items.map((i) => ({
            value: i.contribution,
            itemStyle: {
              color: i.contribution >= 0 ? '#EF4444' : '#10B981',
              borderRadius: i.contribution >= 0 ? [0, 6, 6, 0] : [6, 0, 0, 6],
            },
          })),
        },
      ],
    };
  });

  selectTxn(id: string): void {
    this.store.selectedExplainTransactionId.set(id);
    this.overrideReasonCode.set(null);
  }

  generateReasonCode(nextVariant: boolean): void {
    const txn = this.selectedTxn();
    if (!txn) return;
    this.generating.set(true);
    if (nextVariant) this.variantCounter++;
    setTimeout(() => {
      const code = this.fraudService.generateDeterministicReasonCode(txn, this.variantCounter);
      this.overrideReasonCode.set(code);
      this.generating.set(false);
    }, 650);
  }

  copyExplanation(): void {
    const rc = this.activeReasonCode();
    if (!rc) return;
    const text = `[${rc.code}] ${rc.headline}\n${rc.narrative}\nRecommended Action: ${rc.recommendedAction}`;
    navigator.clipboard?.writeText(text);
    this.copied.set(true);
    this.store.showToast('Copied', 'Reason code narrative copied to clipboard.', 'success');
    setTimeout(() => this.copied.set(false), 2000);
  }
}
