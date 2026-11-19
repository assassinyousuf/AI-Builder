import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { EChartsOption } from 'echarts';
import { LucideAngularModule, TrendingUp, AlertTriangle, RotateCcw, Zap } from 'lucide-angular';
import { MockDriftService } from '../../core/services/mock-drift.service';
import { EchartsWrapperComponent } from '../../shared/components/echarts-wrapper.component';

@Component({
  selector: 'app-drift-monitor',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, EchartsWrapperComponent],
  template: `
    <div class="space-y-6 animate-page-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="font-display text-2xl sm:text-3xl font-bold tracking-tight gradient-text">
              Model Drift Intelligence
            </h1>
            <span
              class="px-2.5 py-1 rounded-full text-[11px] font-semibold border"
              [ngClass]="{
                'bg-emerald-500/15 text-emerald-300 border-emerald-500/30': driftService.drift().status === 'Stable',
                'bg-amber-500/15 text-amber-300 border-amber-500/30': driftService.drift().status === 'Warning',
                'bg-red-500/15 text-red-300 border-red-500/30': driftService.drift().status === 'Drift Detected'
              }"
            >
              {{ driftService.drift().status | uppercase }}
            </span>
          </div>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1">
            Population Stability Index (PSI), feature shift tracking, and demo retraining triggers
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="driftService.simulateDriftEvent()"
            class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-xs font-semibold text-white flex items-center gap-1.5"
          >
            <lucide-icon [img]="ZapIcon" class="w-3.5 h-3.5" />
            Simulate Drift Event
          </button>
          <button
            type="button"
            (click)="driftService.resetDrift()"
            class="px-3.5 py-2 rounded-xl bg-[#10111D] border border-white/10 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5"
          >
            <lucide-icon [img]="ResetIcon" class="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      <!-- Retrain Recommended Banner -->
      @if (driftService.drift().retrainRecommended) {
        <div class="fs-card p-4 border-red-500/40 bg-red-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-page-in">
          <div class="flex items-start gap-3">
            <lucide-icon [img]="WarnIcon" class="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-bold text-red-200">Retrain Recommended — Concept & Covariate Drift Detected</p>
              <p class="text-xs text-red-200/80 mt-0.5">
                Overall PSI reached {{ driftService.drift().overallPsi }} (threshold: 0.25). Suggested action: trigger offline recalibration on recent 14-day labeled window. (Frontend simulation only)
              </p>
            </div>
          </div>
          <span class="px-3 py-1 rounded-lg bg-red-500/20 text-xs font-mono-num font-bold text-red-300 shrink-0">
            PSI {{ driftService.drift().overallPsi }}
          </span>
        </div>
      }

      <!-- Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="fs-card p-5">
          <h3 class="text-sm font-semibold text-white mb-2">Feature Population Stability Index (PSI)</h3>
          <app-echarts [option]="psiChartOption()" height="240px" />
        </div>

        <div class="fs-card p-5">
          <h3 class="text-sm font-semibold text-white mb-2">Feature Mean Comparison (Baseline vs Current)</h3>
          <app-echarts [option]="featureCompOption()" height="240px" />
        </div>

        <div class="fs-card p-5">
          <h3 class="text-sm font-semibold text-white mb-2">Fraud Probability Score Distribution</h3>
          <app-echarts [option]="probDistOption()" height="230px" />
        </div>

        <div class="fs-card p-5">
          <h3 class="text-sm font-semibold text-white mb-2">Model Performance (ROC-AUC) & PSI Timeline</h3>
          <app-echarts [option]="timelineOption()" height="230px" />
        </div>
      </div>
    </div>
  `,
})
export class DriftMonitorComponent {
  readonly driftService = inject(MockDriftService);

  readonly TrendingIcon = TrendingUp;
  readonly WarnIcon = AlertTriangle;
  readonly ResetIcon = RotateCcw;
  readonly ZapIcon = Zap;

  readonly psiChartOption = computed<EChartsOption>(() => {
    const features = this.driftService.drift().features;
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: '#151626', textStyle: { color: '#F8FAFC', fontSize: 12 } },
      grid: { left: 165, right: 20, top: 14, bottom: 24 },
      xAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        axisLabel: { color: '#71717A', fontSize: 10 },
      },
      yAxis: {
        type: 'category',
        data: features.map((f) => f.name),
        axisLabel: { color: '#D4D4D8', fontSize: 10 },
      },
      series: [
        {
          type: 'bar',
          barWidth: 14,
          data: features.map((f) => ({
            value: f.psi,
            itemStyle: {
              color: f.psi >= 0.25 ? '#EF4444' : f.psi >= 0.1 ? '#F59E0B' : '#10B981',
              borderRadius: [0, 6, 6, 0],
            },
          })),
        },
      ],
    };
  });

  readonly featureCompOption = computed<EChartsOption>(() => {
    const features = this.driftService.drift().features.slice(0, 4);
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: '#151626', textStyle: { color: '#F8FAFC', fontSize: 12 } },
      legend: { data: ['Baseline', 'Current'], textStyle: { color: '#A1A1AA', fontSize: 11 }, top: 0 },
      grid: { left: 42, right: 16, top: 30, bottom: 26 },
      xAxis: {
        type: 'category',
        data: features.map((f) => f.name.split('_')[0]),
        axisLabel: { color: '#A1A1AA', fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        axisLabel: { color: '#71717A', fontSize: 10 },
      },
      series: [
        { name: 'Baseline', type: 'bar', data: features.map((f) => f.baselineMean), itemStyle: { color: '#7C3AED' } },
        { name: 'Current', type: 'bar', data: features.map((f) => f.currentMean), itemStyle: { color: '#EC4899' } },
      ],
    };
  });

  readonly probDistOption = computed<EChartsOption>(() => {
    const isDrifted = this.driftService.drift().retrainRecommended;
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: '#151626', textStyle: { color: '#F8FAFC', fontSize: 12 } },
      legend: { data: ['Training Baseline', 'Live Window'], textStyle: { color: '#A1A1AA', fontSize: 11 }, top: 0 },
      grid: { left: 40, right: 16, top: 30, bottom: 26 },
      xAxis: {
        type: 'category',
        data: ['0.0-0.2', '0.2-0.4', '0.4-0.6', '0.6-0.8', '0.8-1.0'],
        axisLabel: { color: '#71717A', fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        axisLabel: { color: '#71717A', fontSize: 10 },
      },
      series: [
        {
          name: 'Training Baseline',
          type: 'line',
          smooth: true,
          data: [62, 21, 9, 5, 3],
          itemStyle: { color: '#10B981' },
          areaStyle: { color: 'rgba(16,185,129,0.12)' },
        },
        {
          name: 'Live Window',
          type: 'line',
          smooth: true,
          data: isDrifted ? [38, 24, 18, 12, 8] : [60, 22, 10, 5, 3],
          itemStyle: { color: isDrifted ? '#EF4444' : '#A855F7' },
          areaStyle: { color: isDrifted ? 'rgba(239,68,68,0.18)' : 'rgba(168,85,247,0.15)' },
        },
      ],
    };
  });

  readonly timelineOption = computed<EChartsOption>(() => {
    const tl = this.driftService.drift().timeline;
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: '#151626', textStyle: { color: '#F8FAFC', fontSize: 12 } },
      legend: { data: ['ROC-AUC', 'PSI'], textStyle: { color: '#A1A1AA', fontSize: 11 }, top: 0 },
      grid: { left: 42, right: 42, top: 30, bottom: 26 },
      xAxis: {
        type: 'category',
        data: tl.map((d) => d.date),
        axisLabel: { color: '#71717A', fontSize: 10 },
      },
      yAxis: [
        { type: 'value', min: 0.8, max: 1.0, axisLabel: { color: '#71717A', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } } },
        { type: 'value', min: 0, max: 0.5, axisLabel: { color: '#71717A', fontSize: 10 }, splitLine: { show: false } },
      ],
      series: [
        { name: 'ROC-AUC', type: 'line', smooth: true, data: tl.map((d) => d.auc), itemStyle: { color: '#A855F7' } },
        { name: 'PSI', type: 'line', yAxisIndex: 1, smooth: true, data: tl.map((d) => d.psi), itemStyle: { color: '#F59E0B' } },
      ],
    };
  });
}
