import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { EChartsOption } from 'echarts';
import { LucideAngularModule, SlidersHorizontal, RotateCcw, Info } from 'lucide-angular';
import { MockAnalyticsService } from '../../core/services/mock-analytics.service';
import { FraudStoreService } from '../../core/state/fraud-store.service';
import { EchartsWrapperComponent } from '../../shared/components/echarts-wrapper.component';

@Component({
  selector: 'app-threshold-tuner',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, EchartsWrapperComponent],
  template: `
    <div class="space-y-6 animate-page-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="font-display text-2xl sm:text-3xl font-bold tracking-tight gradient-text">
            Model Threshold Optimization
          </h1>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1">
            Deterministic evaluation on 120-sample held-out fixture (Precision vs False Positive Rate trade-off)
          </p>
        </div>

        <button
          type="button"
          (click)="resetThreshold()"
          class="px-3.5 py-2 rounded-xl bg-[#10111D] hover:bg-[#151626] border border-white/10 text-xs font-medium text-zinc-200 flex items-center gap-1.5 self-start"
        >
          <lucide-icon [img]="ResetIcon" class="w-3.5 h-3.5 text-purple-400" />
          Reset to Default (65)
        </button>
      </div>

      <!-- Top Grid: Left Controls + Right Metrics & Confusion Matrix -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <!-- Left Side: Slider + Presets -->
        <div class="fs-card p-6 lg:col-span-5 space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold text-white flex items-center gap-2">
              <lucide-icon [img]="SlidersIcon" class="w-4 h-4 text-purple-400" />
              Decision Threshold
            </h2>
            <span class="font-mono-num text-3xl font-extrabold text-purple-300">
              {{ threshold() }}<span class="text-sm font-normal text-zinc-500"> / 100</span>
            </span>
          </div>

          <div class="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              [ngModel]="threshold()"
              (ngModelChange)="onSliderChange($event)"
              class="w-full fs-slider"
            />
            <div class="flex justify-between text-[10px] font-mono-num text-zinc-500">
              <span>0 (Flag All)</span>
              <span>50</span>
              <span>100 (Flag None)</span>
            </div>
          </div>

          <!-- Presets -->
          <div class="space-y-2">
            <p class="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">Operating Presets</p>
            <div class="grid grid-cols-2 gap-2">
              @for (p of presets; track p.name) {
                <button
                  type="button"
                  (click)="applyPreset(p.name, p.value)"
                  class="px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left"
                  [ngClass]="
                    activePreset() === p.name
                      ? 'bg-purple-600/25 border-purple-500/50 text-white'
                      : 'bg-[#090A16] border-white/8 text-zinc-400 hover:text-white'
                  "
                >
                  <div>{{ p.name }}</div>
                  <div class="font-mono-num text-[10px] text-zinc-500">
                    {{ p.value !== null ? 'Threshold ' + p.value : 'Manual' }}
                  </div>
                </button>
              }
            </div>
          </div>

          <!-- Risk Classification Boundaries -->
          <div class="p-4 rounded-xl bg-[#090A16] border border-white/8 space-y-2">
            <p class="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <lucide-icon [img]="InfoIcon" class="w-3.5 h-3.5 text-purple-400" />
              Precision vs False Positive Trade-off
            </p>
            <p class="text-[11px] text-zinc-400 leading-relaxed">
              Lowering the threshold captures more fraudulent transactions (higher Recall) but increases customer friction
              by flagging legitimate transactions (higher FPR). Raising it reduces false alarms at the cost of missed fraud.
            </p>
          </div>
        </div>

        <!-- Right Side: Metrics + Confusion Matrix -->
        <div class="lg:col-span-7 space-y-4">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="fs-card p-4">
              <p class="text-[11px] text-zinc-400">Precision</p>
              <p class="font-mono-num text-2xl font-bold text-purple-300 mt-1">{{ metrics().precision }}%</p>
            </div>
            <div class="fs-card p-4">
              <p class="text-[11px] text-zinc-400">Recall (TPR)</p>
              <p class="font-mono-num text-2xl font-bold text-emerald-400 mt-1">{{ metrics().recall }}%</p>
            </div>
            <div class="fs-card p-4">
              <p class="text-[11px] text-zinc-400">False Positive Rate</p>
              <p class="font-mono-num text-2xl font-bold text-amber-400 mt-1">{{ metrics().fpr }}%</p>
            </div>
            <div class="fs-card p-4">
              <p class="text-[11px] text-zinc-400">F1-Score</p>
              <p class="font-mono-num text-2xl font-bold text-fuchsia-300 mt-1">{{ metrics().f1Score }}%</p>
            </div>
          </div>

          <!-- Confusion Matrix -->
          <div class="fs-card p-5">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-semibold text-white">Confusion Matrix (n = 120 Held-Out)</h3>
              <span class="text-[11px] font-mono-num text-zinc-400">
                TNR: {{ metrics().tnr }}% • FNR: {{ metrics().fnr }}%
              </span>
            </div>

            <div class="grid grid-cols-2 gap-3 text-center">
              <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                <p class="text-[11px] uppercase tracking-wider text-emerald-300 font-semibold">True Positive (TP)</p>
                <p class="font-mono-num text-2xl font-bold text-white mt-1">{{ metrics().tp }}</p>
                <p class="text-[10px] text-zinc-400 mt-0.5">Fraud correctly blocked</p>
              </div>
              <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25">
                <p class="text-[11px] uppercase tracking-wider text-amber-300 font-semibold">False Positive (FP)</p>
                <p class="font-mono-num text-2xl font-bold text-white mt-1">{{ metrics().fp }}</p>
                <p class="text-[10px] text-zinc-400 mt-0.5">Legit flagged (friction)</p>
              </div>
              <div class="p-4 rounded-xl bg-red-500/10 border border-red-500/25">
                <p class="text-[11px] uppercase tracking-wider text-red-300 font-semibold">False Negative (FN)</p>
                <p class="font-mono-num text-2xl font-bold text-white mt-1">{{ metrics().fn }}</p>
                <p class="text-[10px] text-zinc-400 mt-0.5">Fraud missed</p>
              </div>
              <div class="p-4 rounded-xl bg-purple-500/10 border border-purple-500/25">
                <p class="text-[11px] uppercase tracking-wider text-purple-300 font-semibold">True Negative (TN)</p>
                <p class="font-mono-num text-2xl font-bold text-white mt-1">{{ metrics().tn }}</p>
                <p class="text-[10px] text-zinc-400 mt-0.5">Legit approved</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="fs-card p-5">
          <h3 class="text-sm font-semibold text-white mb-2">Precision-Recall Curve</h3>
          <app-echarts [option]="prCurveOption()" height="230px" />
        </div>

        <div class="fs-card p-5">
          <h3 class="text-sm font-semibold text-white mb-2">Threshold Comparison</h3>
          <app-echarts [option]="thresholdComparisonOption()" height="230px" />
        </div>

        <div class="fs-card p-5">
          <h3 class="text-sm font-semibold text-white mb-2">Model Decision Distribution</h3>
          <app-echarts [option]="decisionDistOption()" height="230px" />
        </div>
      </div>
    </div>
  `,
})
export class ThresholdTunerComponent {
  private readonly analytics = inject(MockAnalyticsService);
  private readonly store = inject(FraudStoreService);

  readonly SlidersIcon = SlidersHorizontal;
  readonly ResetIcon = RotateCcw;
  readonly InfoIcon = Info;

  readonly threshold = signal(this.store.activeThreshold());
  readonly activePreset = signal<'Balanced' | 'High Recall' | 'Low False Positives' | 'Custom'>('Balanced');

  readonly presets: { name: 'Balanced' | 'High Recall' | 'Low False Positives' | 'Custom'; value: number | null }[] = [
    { name: 'Balanced', value: 65 },
    { name: 'High Recall', value: 40 },
    { name: 'Low False Positives', value: 80 },
    { name: 'Custom', value: null },
  ];

  readonly metrics = computed(() => this.analytics.evaluateThreshold(this.threshold()));
  readonly curveData = this.analytics.getPrecisionRecallCurve();

  readonly prCurveOption = computed<EChartsOption>(() => ({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: '#151626', textStyle: { color: '#F8FAFC', fontSize: 12 } },
    grid: { left: 40, right: 16, top: 18, bottom: 28 },
    xAxis: {
      type: 'category',
      data: this.curveData.map((p) => `${p.recall}%`),
      name: 'Recall',
      axisLabel: { color: '#71717A', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      max: 100,
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      axisLabel: { color: '#71717A', fontSize: 10 },
    },
    series: [
      {
        name: 'Precision %',
        type: 'line',
        smooth: true,
        data: this.curveData.map((p) => p.precision),
        itemStyle: { color: '#D946EF' },
        areaStyle: { color: 'rgba(217,70,239,0.16)' },
      },
    ],
  }));

  readonly thresholdComparisonOption = computed<EChartsOption>(() => ({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: '#151626', textStyle: { color: '#F8FAFC', fontSize: 12 } },
    legend: { data: ['Precision', 'Recall', 'FPR'], textStyle: { color: '#A1A1AA', fontSize: 10 }, top: 0 },
    grid: { left: 38, right: 14, top: 28, bottom: 26 },
    xAxis: {
      type: 'category',
      data: this.curveData.map((p) => p.threshold),
      axisLabel: { color: '#71717A', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      max: 100,
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      axisLabel: { color: '#71717A', fontSize: 10 },
    },
    series: [
      { name: 'Precision', type: 'line', smooth: true, data: this.curveData.map((p) => p.precision), itemStyle: { color: '#A855F7' } },
      { name: 'Recall', type: 'line', smooth: true, data: this.curveData.map((p) => p.recall), itemStyle: { color: '#10B981' } },
      { name: 'FPR', type: 'line', smooth: true, data: this.curveData.map((p) => p.fpr), itemStyle: { color: '#F59E0B' } },
    ],
  }));

  readonly decisionDistOption = computed<EChartsOption>(() => {
    const m = this.metrics();
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', backgroundColor: '#151626', textStyle: { color: '#F8FAFC', fontSize: 12 } },
      grid: { left: 40, right: 16, top: 16, bottom: 26 },
      xAxis: {
        type: 'category',
        data: ['Flagged / Blocked', 'Approved'],
        axisLabel: { color: '#A1A1AA', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        axisLabel: { color: '#71717A', fontSize: 10 },
      },
      series: [
        {
          type: 'bar',
          barWidth: 42,
          data: [
            { value: m.flaggedCount, itemStyle: { color: '#EF4444', borderRadius: [8, 8, 0, 0] } },
            { value: m.approvedCount, itemStyle: { color: '#10B981', borderRadius: [8, 8, 0, 0] } },
          ],
        },
      ],
    };
  });

  onSliderChange(val: number): void {
    const num = Number(val);
    this.threshold.set(num);
    this.store.activeThreshold.set(num);
    this.activePreset.set('Custom');
  }

  applyPreset(name: 'Balanced' | 'High Recall' | 'Low False Positives' | 'Custom', value: number | null): void {
    this.activePreset.set(name);
    if (value !== null) {
      this.threshold.set(value);
      this.store.activeThreshold.set(value);
    }
  }

  resetThreshold(): void {
    this.threshold.set(65);
    this.store.activeThreshold.set(65);
    this.activePreset.set('Balanced');
  }
}
