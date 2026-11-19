import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import type { EChartsOption } from 'echarts';
import {
  LucideAngularModule,
  RefreshCw,
  Download,
  ShieldAlert,
  TrendingUp,
  Activity,
  DollarSign,
  ShieldCheck,
  Percent,
  Zap,
  ArrowRight,
  Check,
  Clock,
} from 'lucide-angular';
import { FraudStoreService } from '../../core/state/fraud-store.service';
import { MockTransactionService } from '../../core/services/mock-transaction.service';
import { EchartsWrapperComponent } from '../../shared/components/echarts-wrapper.component';
import { RiskBadgeComponent } from '../../shared/components/risk-badge.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    EchartsWrapperComponent,
    RiskBadgeComponent,
  ],
  template: `
    <div class="space-y-6 animate-page-in">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="font-display text-2xl sm:text-3xl font-bold tracking-tight gradient-text">
              Command Center
            </h1>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <span class="relative w-2 h-2 rounded-full bg-emerald-400 live-dot"></span>
              LIVE MONITORING
            </span>
          </div>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time financial fraud intelligence and risk monitoring • Last updated
            <span class="font-mono-num text-zinc-300">{{ lastUpdated() | date: 'mediumTime' }}</span>
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Date Range Selector -->
          <div class="inline-flex rounded-xl bg-[#10111D] border border-white/8 p-1">
            @for (range of ranges; track range) {
              <button
                type="button"
                (click)="store.dateRange.set(range)"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                [ngClass]="
                  store.dateRange() === range
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                "
              >
                {{ range | uppercase }}
              </button>
            }
          </div>

          <button
            type="button"
            (click)="refreshDashboard()"
            class="px-3.5 py-2 rounded-xl bg-[#10111D] hover:bg-[#151626] border border-white/8 text-xs font-medium text-zinc-200 flex items-center gap-1.5 transition-colors"
          >
            <lucide-icon [img]="RefreshIcon" class="w-3.5 h-3.5 text-purple-400" />
            Refresh
          </button>

          <button
            type="button"
            (click)="exportReport()"
            class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-[0_0_24px_-6px_rgba(168,85,247,0.7)] transition-all"
          >
            <lucide-icon [img]="DownloadIcon" class="w-3.5 h-3.5" />
            Export Report
          </button>
        </div>
      </div>

      <!-- 6 KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        <!-- 1. Transactions Processed -->
        <div class="fs-card fs-card-hover p-4 relative overflow-hidden">
          <div class="flex items-center justify-between text-xs text-zinc-400">
            <span>Transactions Processed</span>
            <lucide-icon [img]="ActivityIcon" class="w-4 h-4 text-purple-400" />
          </div>
          <div class="mt-2 font-mono-num text-2xl font-bold text-white">
            {{ kpis().totalProcessed | number }}
          </div>
          <div class="mt-2 flex items-center justify-between text-[11px]">
            <span class="text-emerald-400 font-medium">+12.4% vs prior</span>
            <span class="text-zinc-500">{{ store.dateRange() }}</span>
          </div>
        </div>

        <!-- 2. Fraud Detected -->
        <div class="fs-card fs-card-hover p-4 relative overflow-hidden border-red-500/20">
          <div class="flex items-center justify-between text-xs text-zinc-400">
            <span>Fraud Detected</span>
            <lucide-icon [img]="AlertIcon" class="w-4 h-4 text-red-400" />
          </div>
          <div class="mt-2 font-mono-num text-2xl font-bold text-white">
            {{ kpis().fraudDetected | number }}
          </div>
          <div class="mt-2 flex items-center justify-between text-[11px]">
            <span class="text-red-400 font-medium">{{ kpis().suspiciousCount }} active flags</span>
            <span class="text-zinc-500">Threshold {{ store.activeThreshold() }}</span>
          </div>
        </div>

        <!-- 3. Financial Exposure -->
        <div class="fs-card fs-card-hover p-4 relative overflow-hidden">
          <div class="flex items-center justify-between text-xs text-zinc-400">
            <span>Financial Exposure</span>
            <lucide-icon [img]="DollarIcon" class="w-4 h-4 text-amber-400" />
          </div>
          <div class="mt-2 font-mono-num text-2xl font-bold text-white">
            \${{ kpis().exposureAmount | number: '1.0-0' }}
          </div>
          <div class="mt-2 flex items-center justify-between text-[11px]">
            <span class="text-amber-400 font-medium">Flagged volume</span>
            <span class="text-zinc-500">USD</span>
          </div>
        </div>

        <!-- 4. Money Saved -->
        <div class="fs-card fs-card-hover p-4 relative overflow-hidden">
          <div class="flex items-center justify-between text-xs text-zinc-400">
            <span>Money Saved</span>
            <lucide-icon [img]="ShieldCheckIcon" class="w-4 h-4 text-emerald-400" />
          </div>
          <div class="mt-2 font-mono-num text-2xl font-bold text-emerald-300">
            \${{ kpis().moneySaved | number: '1.0-0' }}
          </div>
          <div class="mt-2 flex items-center justify-between text-[11px]">
            <span class="text-zinc-400">Simulated est. savings</span>
            <span class="text-emerald-400 font-medium">Blocked</span>
          </div>
        </div>

        <!-- 5. False Positive Rate -->
        <div class="fs-card fs-card-hover p-4 relative overflow-hidden">
          <div class="flex items-center justify-between text-xs text-zinc-400">
            <span>False Positive Rate</span>
            <lucide-icon [img]="PercentIcon" class="w-4 h-4 text-fuchsia-400" />
          </div>
          <div class="mt-2 font-mono-num text-2xl font-bold text-white">
            {{ kpis().falsePositiveRate }}%
          </div>
          <div class="mt-2 flex items-center justify-between text-[11px]">
            <span class="text-zinc-400">Demo evaluation metric</span>
            <span class="text-purple-300 font-medium">Tuned</span>
          </div>
        </div>

        <!-- 6. Transactions Per Second -->
        <div class="fs-card fs-card-hover p-4 relative overflow-hidden border-purple-500/25">
          <div class="flex items-center justify-between text-xs text-zinc-400">
            <span>Transactions / Sec</span>
            <lucide-icon [img]="ZapIcon" class="w-4 h-4 text-purple-400" />
          </div>
          <div class="mt-2 font-mono-num text-2xl font-bold text-purple-300">
            {{ kpis().tps }} <span class="text-sm font-normal text-zinc-400">TPS</span>
          </div>
          <div class="mt-2 flex items-center justify-between text-[11px]">
            <span class="text-emerald-400 font-medium">{{ kpis().avgLatency }}ms avg latency</span>
            <span class="text-zinc-500">Stream</span>
          </div>
        </div>
      </div>

      <!-- Charts Row 1: Volume + Fraud vs Legit + Risk Distribution -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div class="fs-card p-5 lg:col-span-5">
          <div class="flex items-center justify-between mb-3">
            <div>
              <h3 class="text-sm font-semibold text-white">Transaction Volume</h3>
              <p class="text-[11px] text-zinc-400">Throughput across selected {{ store.dateRange() }} window</p>
            </div>
            <span class="text-[11px] font-mono-num text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md">
              +14.2%
            </span>
          </div>
          <app-echarts [option]="volumeChartOption()" height="240px" />
        </div>

        <div class="fs-card p-5 lg:col-span-4">
          <div class="flex items-center justify-between mb-3">
            <div>
              <h3 class="text-sm font-semibold text-white">Fraud vs Legitimate</h3>
              <p class="text-[11px] text-zinc-400">Dual-series comparison</p>
            </div>
          </div>
          <app-echarts [option]="fraudVsLegitOption()" height="240px" />
        </div>

        <div class="fs-card p-5 lg:col-span-3">
          <div class="flex items-center justify-between mb-3">
            <div>
              <h3 class="text-sm font-semibold text-white">Risk Distribution</h3>
              <p class="text-[11px] text-zinc-400">Live store breakdown</p>
            </div>
          </div>
          <app-echarts [option]="riskDonutOption()" height="240px" />
        </div>
      </div>

      <!-- Charts Row 2: Fraud Trend + Category Breakdown -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div class="fs-card p-5 lg:col-span-7">
          <div class="flex items-center justify-between mb-3">
            <div>
              <h3 class="text-sm font-semibold text-white">Fraud Trend Over Time</h3>
              <p class="text-[11px] text-zinc-400">Blocked vs flagged anomaly rate</p>
            </div>
          </div>
          <app-echarts [option]="fraudTrendOption()" height="230px" />
        </div>

        <div class="fs-card p-5 lg:col-span-5">
          <div class="flex items-center justify-between mb-3">
            <div>
              <h3 class="text-sm font-semibold text-white">Fraud by Transaction Category</h3>
              <p class="text-[11px] text-zinc-400">High-risk detections per payment rail</p>
            </div>
          </div>
          <app-echarts [option]="categoryBarOption()" height="230px" />
        </div>
      </div>

      <!-- Bottom Grid: Live Preview Table + Alerts + Activity -->
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <!-- Live Transaction Preview -->
        <div class="fs-card p-5 xl:col-span-8 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-sm font-semibold text-white">Live Transaction Preview</h3>
              <p class="text-[11px] text-zinc-400">Click any row to open full explainability drawer</p>
            </div>
            <a
              routerLink="/app/monitoring"
              class="text-xs font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              View All Transactions
              <lucide-icon [img]="ArrowRightIcon" class="w-3.5 h-3.5" />
            </a>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-white/8 text-[11px] uppercase tracking-wider text-zinc-500">
                  <th class="py-2.5 pr-3 font-medium">ID</th>
                  <th class="py-2.5 px-3 font-medium">Sender</th>
                  <th class="py-2.5 px-3 font-medium">Amount</th>
                  <th class="py-2.5 px-3 font-medium">Location</th>
                  <th class="py-2.5 px-3 font-medium">Risk</th>
                  <th class="py-2.5 px-3 font-medium">Status</th>
                  <th class="py-2.5 pl-3 font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/6 text-xs">
                @for (t of previewTxns(); track t.id) {
                  <tr
                    (click)="store.openTransactionDrawer(t.id)"
                    class="hover:bg-purple-500/8 cursor-pointer transition-colors animate-row-enter"
                  >
                    <td class="py-3 pr-3 font-mono-num font-semibold text-purple-300">{{ t.id }}</td>
                    <td class="py-3 px-3">
                      <div class="font-medium text-white">{{ t.senderName }}</div>
                      <div class="text-[10px] font-mono-num text-zinc-500">{{ t.senderAccount }}</div>
                    </td>
                    <td class="py-3 px-3 font-mono-num font-semibold text-white">
                      \${{ t.amount | number: '1.0-0' }}
                    </td>
                    <td class="py-3 px-3 text-zinc-300">{{ t.location.city }}, {{ t.location.countryCode }}</td>
                    <td class="py-3 px-3">
                      <span
                        class="font-mono-num font-bold"
                        [ngClass]="{
                          'text-red-400': t.prediction.riskScore >= 80,
                          'text-amber-400': t.prediction.riskScore >= 60 && t.prediction.riskScore < 80,
                          'text-purple-300': t.prediction.riskScore >= 30 && t.prediction.riskScore < 60,
                          'text-emerald-400': t.prediction.riskScore < 30
                        }"
                      >
                        {{ t.prediction.riskScore }}
                      </span>
                    </td>
                    <td class="py-3 px-3">
                      <app-risk-badge [status]="t.status" />
                    </td>
                    <td class="py-3 pl-3 text-right font-mono-num text-zinc-400">
                      {{ t.timestamp | date: 'shortTime' }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right Side: Recent Alerts + Activity Overview -->
        <div class="xl:col-span-4 space-y-4">
          <!-- Recent Alerts -->
          <div class="fs-card p-5">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-semibold text-white flex items-center gap-2">
                <lucide-icon [img]="AlertIcon" class="w-4 h-4 text-red-400" />
                Recent Alerts
              </h3>
              <span class="text-[11px] font-mono-num text-zinc-400">{{ store.alerts().length }} active</span>
            </div>
            <div class="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              @for (alert of store.alerts().slice(0, 5); track alert.id) {
                <div
                  class="p-3 rounded-xl border transition-colors"
                  [ngClass]="
                    alert.severity === 'critical'
                      ? 'bg-red-500/8 border-red-500/25'
                      : 'bg-amber-500/8 border-amber-500/25'
                  "
                >
                  <div class="flex items-start justify-between gap-2">
                    <p class="text-xs font-semibold text-white leading-snug">{{ alert.title }}</p>
                    @if (!alert.acknowledged) {
                      <button
                        type="button"
                        (click)="store.acknowledgeAlert(alert.id)"
                        class="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-emerald-300 shrink-0"
                        title="Acknowledge alert"
                      >
                        <lucide-icon [img]="CheckIcon" class="w-3.5 h-3.5" />
                      </button>
                    }
                  </div>
                  <p class="text-[11px] text-zinc-400 mt-1 line-clamp-2">{{ alert.description }}</p>
                  <div class="flex items-center justify-between mt-2 text-[10px] text-zinc-500">
                    <span>{{ alert.timestamp | date: 'shortTime' }}</span>
                    @if (alert.transactionId) {
                      <button
                        type="button"
                        (click)="store.openTransactionDrawer(alert.transactionId)"
                        class="text-purple-400 hover:underline font-mono-num"
                      >
                        Inspect {{ alert.transactionId }}
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Activity Overview -->
          <div class="fs-card p-5">
            <h3 class="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <lucide-icon [img]="ClockIcon" class="w-4 h-4 text-purple-400" />
              Activity Overview
            </h3>
            <div class="space-y-3 max-h-56 overflow-y-auto pr-1">
              @for (act of store.activities().slice(0, 5); track act.id) {
                <div class="flex items-start gap-2.5 text-xs">
                  <span
                    class="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                    [ngClass]="{
                      'bg-red-400': act.type === 'decision',
                      'bg-purple-400': act.type === 'investigation',
                      'bg-fuchsia-400': act.type === 'simulation',
                      'bg-emerald-400': act.type === 'system'
                    }"
                  ></span>
                  <div class="min-w-0 flex-1">
                    <p class="font-medium text-zinc-200">{{ act.title }}</p>
                    <p class="text-[11px] text-zinc-400 truncate">{{ act.detail }}</p>
                    <p class="text-[10px] text-zinc-500 mt-0.5">
                      {{ act.actor }} • {{ act.timestamp | date: 'shortTime' }}
                    </p>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  readonly store = inject(FraudStoreService);
  private readonly txnService = inject(MockTransactionService);

  readonly ranges: ('24h' | '7d' | '30d')[] = ['24h', '7d', '30d'];
  readonly lastUpdated = signal(new Date());
  readonly kpis = this.store.kpis;
  readonly previewTxns = computed(() => this.store.transactions().slice(0, 7));

  // Icons
  readonly RefreshIcon = RefreshCw;
  readonly DownloadIcon = Download;
  readonly AlertIcon = ShieldAlert;
  readonly TrendingIcon = TrendingUp;
  readonly ActivityIcon = Activity;
  readonly DollarIcon = DollarSign;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly PercentIcon = Percent;
  readonly ZapIcon = Zap;
  readonly ArrowRightIcon = ArrowRight;
  readonly CheckIcon = Check;
  readonly ClockIcon = Clock;

  readonly volumeChartOption = computed<EChartsOption>(() => {
    const range = this.store.dateRange();
    const labels =
      range === '24h'
        ? ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now']
        : range === '7d'
          ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          : ['W1', 'W2', 'W3', 'W4'];
    const base =
      range === '24h'
        ? [12400, 9800, 18200, 24500, 28900, 22100, 12592 + this.store.transactions().length * 12]
        : range === '7d'
          ? [112000, 124000, 119000, 134000, 142000, 108000, 128492]
          : [480000, 512000, 539000, 562000];

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#151626',
        borderColor: 'rgba(168,85,247,0.35)',
        textStyle: { color: '#F8FAFC', fontSize: 12 },
      },
      grid: { left: 42, right: 16, top: 18, bottom: 26 },
      xAxis: {
        type: 'category',
        data: labels,
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        axisLabel: { color: '#71717A', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        axisLabel: { color: '#71717A', fontSize: 10 },
      },
      series: [
        {
          name: 'Transactions',
          type: 'line',
          smooth: true,
          data: base,
          symbolSize: 6,
          itemStyle: { color: '#A855F7' },
          lineStyle: { width: 2.5, color: '#A855F7' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(168,85,247,0.35)' },
                { offset: 1, color: 'rgba(168,85,247,0.0)' },
              ],
            },
          },
        },
      ],
    };
  });

  readonly fraudVsLegitOption = computed<EChartsOption>(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#151626',
      borderColor: 'rgba(255,255,255,0.12)',
      textStyle: { color: '#F8FAFC', fontSize: 12 },
    },
    legend: {
      data: ['Legitimate', 'Fraud'],
      textStyle: { color: '#A1A1AA', fontSize: 11 },
      top: 0,
    },
    grid: { left: 38, right: 14, top: 32, bottom: 26 },
    xAxis: {
      type: 'category',
      data: ['00h', '04h', '08h', '12h', '16h', '20h'],
      axisLabel: { color: '#71717A', fontSize: 11 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      axisLabel: { color: '#71717A', fontSize: 10 },
    },
    series: [
      {
        name: 'Legitimate',
        type: 'line',
        smooth: true,
        data: [1100, 920, 1780, 2380, 2790, 2110],
        itemStyle: { color: '#10B981' },
        areaStyle: { color: 'rgba(16,185,129,0.14)' },
      },
      {
        name: 'Fraud',
        type: 'line',
        smooth: true,
        data: [42, 31, 68, 95, 124 + this.kpis().suspiciousCount, 88],
        itemStyle: { color: '#EF4444' },
        areaStyle: { color: 'rgba(239,68,68,0.22)' },
      },
    ],
  }));

  readonly riskDonutOption = computed<EChartsOption>(() => {
    const txns = this.store.transactions();
    const low = txns.filter((t) => t.prediction.riskLevel === 'low').length;
    const med = txns.filter((t) => t.prediction.riskLevel === 'medium').length;
    const high = txns.filter((t) => t.prediction.riskLevel === 'high').length;
    const crit = txns.filter((t) => t.prediction.riskLevel === 'critical').length;

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: '#151626',
        borderColor: 'rgba(255,255,255,0.12)',
        textStyle: { color: '#F8FAFC', fontSize: 12 },
      },
      legend: {
        bottom: 0,
        textStyle: { color: '#A1A1AA', fontSize: 10 },
        itemWidth: 10,
        itemHeight: 10,
      },
      series: [
        {
          type: 'pie',
          radius: ['52%', '74%'],
          center: ['50%', '43%'],
          avoidLabelOverlap: true,
          label: { show: false },
          data: [
            { value: low, name: 'Low', itemStyle: { color: '#10B981' } },
            { value: med, name: 'Medium', itemStyle: { color: '#A855F7' } },
            { value: high, name: 'High', itemStyle: { color: '#F59E0B' } },
            { value: crit, name: 'Critical', itemStyle: { color: '#EF4444' } },
          ],
        },
      ],
    };
  });

  readonly fraudTrendOption = computed<EChartsOption>(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#151626',
      borderColor: 'rgba(255,255,255,0.12)',
      textStyle: { color: '#F8FAFC', fontSize: 12 },
    },
    legend: {
      data: ['Blocked', 'Flagged for Review'],
      textStyle: { color: '#A1A1AA', fontSize: 11 },
      top: 0,
    },
    grid: { left: 38, right: 16, top: 32, bottom: 26 },
    xAxis: {
      type: 'category',
      data: ['T-6h', 'T-5h', 'T-4h', 'T-3h', 'T-2h', 'T-1h', 'Now'],
      axisLabel: { color: '#71717A', fontSize: 11 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      axisLabel: { color: '#71717A', fontSize: 10 },
    },
    series: [
      {
        name: 'Blocked',
        type: 'bar',
        stack: 'risk',
        data: [14, 18, 22, 19, 27, 24, this.store.transactions().filter((t) => t.status === 'blocked').length],
        itemStyle: { color: '#D946EF', borderRadius: [0, 0, 0, 0] },
      },
      {
        name: 'Flagged for Review',
        type: 'bar',
        stack: 'risk',
        data: [9, 11, 15, 12, 18, 16, this.store.transactions().filter((t) => t.status === 'flagged').length],
        itemStyle: { color: '#7C3AED', borderRadius: [4, 4, 0, 0] },
      },
    ],
  }));

  readonly categoryBarOption = computed<EChartsOption>(() => {
    const txns = this.store.transactions();
    const categories = ['Wire Transfer', 'Card Payment', 'Crypto Swap', 'International Remittance', 'ACH Transfer'];
    const counts = categories.map(
      (cat) => txns.filter((t) => t.type === cat && t.prediction.riskScore >= 60).length
    );

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#151626',
        borderColor: 'rgba(255,255,255,0.12)',
        textStyle: { color: '#F8FAFC', fontSize: 12 },
      },
      grid: { left: 130, right: 20, top: 12, bottom: 24 },
      xAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        axisLabel: { color: '#71717A', fontSize: 10 },
      },
      yAxis: {
        type: 'category',
        data: categories,
        axisLabel: { color: '#A1A1AA', fontSize: 11 },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      },
      series: [
        {
          type: 'bar',
          data: counts,
          barWidth: 14,
          itemStyle: {
            borderRadius: [0, 6, 6, 0],
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#7C3AED' },
                { offset: 1, color: '#EC4899' },
              ],
            },
          },
        },
      ],
    };
  });

  refreshDashboard(): void {
    this.lastUpdated.set(new Date());
    this.store.showToast('Dashboard Refreshed', 'KPIs and charts synchronized with live store.', 'info');
  }

  exportReport(): void {
    this.txnService.exportCsv(this.store.transactions(), 'fraudshield-command-center-report.csv');
  }
}
