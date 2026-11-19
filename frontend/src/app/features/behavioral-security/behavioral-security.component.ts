import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { EChartsOption } from 'echarts';
import { LucideAngularModule, Fingerprint, Play, Square, RotateCcw, ShieldCheck } from 'lucide-angular';
import { EchartsWrapperComponent } from '../../shared/components/echarts-wrapper.component';

interface MousePoint {
  x: number;
  y: number;
  t: number;
}

@Component({
  selector: 'app-behavioral-security',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, EchartsWrapperComponent],
  template: `
    <div class="space-y-6 animate-page-in">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 class="font-display text-2xl sm:text-3xl font-bold tracking-tight gradient-text">
            Behavioral Security Lab
          </h1>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1">
            Consent-based browser interaction timing demo • Captures only non-sensitive movement & cadence statistics
          </p>
        </div>

        <div class="flex items-center gap-2">
          @if (!isTesting()) {
            <button
              type="button"
              (click)="startTest()"
              class="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-xs font-semibold text-white flex items-center gap-1.5"
            >
              <lucide-icon [img]="PlayIcon" class="w-3.5 h-3.5" />
              Start Behavioral Test
            </button>
          } @else {
            <button
              type="button"
              (click)="stopTest()"
              class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white flex items-center gap-1.5"
            >
              <lucide-icon [img]="StopIcon" class="w-3.5 h-3.5" />
              Stop Test
            </button>
          }
          <button
            type="button"
            (click)="resetTest()"
            class="px-3.5 py-2 rounded-xl bg-[#10111D] border border-white/10 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5"
          >
            <lucide-icon [img]="ResetIcon" class="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      <!-- Privacy Notice -->
      <div class="fs-card p-3.5 border-purple-500/25 flex items-center gap-3 text-xs text-purple-200">
        <lucide-icon [img]="ShieldIcon" class="w-4 h-4 text-purple-400 shrink-0" />
        <span>
          Privacy First: This demo never records typed characters, passwords, or personal data—only inter-key millisecond intervals and pointer coordinates inside the sandbox below. Result is an illustrative behavioral anomaly estimate, not definitive human/bot identification.
        </span>
      </div>

      <!-- Interactive Sandbox + Score -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <!-- Mouse & Keystroke Sandbox -->
        <div class="fs-card p-5 lg:col-span-7 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-white flex items-center gap-2">
              <lucide-icon [img]="FingerprintIcon" class="w-4 h-4 text-purple-400" />
              Interaction Capture Sandbox
            </h3>
            <span class="text-[11px] font-mono-num" [ngClass]="isTesting() ? 'text-emerald-400' : 'text-zinc-500'">
              {{ isTesting() ? 'RECORDING TELEMETRY' : 'IDLE — CLICK START' }}
            </span>
          </div>

          <div
            (mousemove)="onMouseMove($event)"
            class="relative h-56 rounded-xl bg-[#070812] border border-white/10 overflow-hidden cursor-crosshair select-none"
          >
            <svg class="w-full h-full">
              @if (mousePathSvg()) {
                <path
                  [attr.d]="mousePathSvg()"
                  fill="none"
                  stroke="url(#mouseGrad)"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              }
              <defs>
                <linearGradient id="mouseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#A855F7" />
                  <stop offset="100%" stop-color="#EC4899" />
                </linearGradient>
              </defs>
            </svg>
            <div class="absolute bottom-2.5 left-3 text-[11px] text-zinc-500 pointer-events-none">
              Move pointer here ({{ mousePoints().length }} samples)
            </div>
          </div>

          <div>
            <label class="block text-xs text-zinc-400 mb-1.5">
              Optional Cadence Test Box (only timing intervals are measured, text is discarded):
            </label>
            <input
              type="text"
              (keydown)="onKeyDown()"
              [disabled]="!isTesting()"
              placeholder="Type a few sample words while test is active..."
              class="w-full px-3.5 py-2.5 rounded-xl bg-[#090A16] border border-white/10 text-xs text-white placeholder-zinc-500 disabled:opacity-50 focus:outline-none focus:border-purple-500/50"
            />
          </div>
        </div>

        <!-- Behavioral Anomaly Score & Comparison -->
        <div class="fs-card p-5 lg:col-span-5 space-y-4">
          <h3 class="text-sm font-semibold text-white">Behavioral Anomaly Estimate</h3>

          <div class="p-4 rounded-xl bg-[#090A16] border border-white/8 flex items-center justify-between">
            <div>
              <p class="text-[11px] text-zinc-400">Demo Anomaly Score</p>
              <p class="font-mono-num text-3xl font-extrabold text-purple-300 mt-1">
                {{ anomalyScore() }}<span class="text-sm font-normal text-zinc-500"> / 100</span>
              </p>
              <p class="text-[11px] text-emerald-400 mt-1">
                {{ anomalyScore() < 35 ? 'Consistent with typical human cadence' : 'Elevated variance / automated-like' }}
              </p>
            </div>
            <div class="text-right text-xs space-y-1">
              <div class="text-zinc-400">Pointer Samples: <span class="font-mono-num text-white">{{ mousePoints().length }}</span></div>
              <div class="text-zinc-400">Key Intervals: <span class="font-mono-num text-white">{{ keyIntervals().length }}</span></div>
            </div>
          </div>

          <!-- Pattern Comparison -->
          <div class="space-y-2.5 text-xs">
            <div class="p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
              <p class="font-semibold text-emerald-300">Typical Human Interaction Pattern</p>
              <p class="text-zinc-400 mt-0.5">Curved pointer trajectories, variable 90–260ms keystroke cadence, natural micro-pauses.</p>
            </div>
            <div class="p-3 rounded-xl bg-red-500/8 border border-red-500/20">
              <p class="font-semibold text-red-300">Simulated Automated Bot Pattern</p>
              <p class="text-zinc-400 mt-0.5">Linear teleportation jumps, constant &lt;15ms key intervals, zero hover hesitation.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Key Interval Distribution Chart -->
      <div class="fs-card p-5">
        <h3 class="text-sm font-semibold text-white mb-2">Keystroke Inter-Key Timing Distribution (ms)</h3>
        <app-echarts [option]="keyChartOption()" height="210px" />
      </div>
    </div>
  `,
})
export class BehavioralSecurityComponent {
  readonly FingerprintIcon = Fingerprint;
  readonly PlayIcon = Play;
  readonly StopIcon = Square;
  readonly ResetIcon = RotateCcw;
  readonly ShieldIcon = ShieldCheck;

  readonly isTesting = signal(false);
  readonly mousePoints = signal<MousePoint[]>([]);
  readonly keyIntervals = signal<number[]>([132, 168, 145, 210, 118, 154]);
  private lastKeyTime: number | null = null;

  readonly mousePathSvg = computed(() => {
    const pts = this.mousePoints();
    if (pts.length < 2) return '';
    return pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  });

  readonly anomalyScore = computed(() => {
    const pts = this.mousePoints();
    if (!this.isTesting() && pts.length === 0) return 14;
    const intervals = this.keyIntervals();
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / (intervals.length || 1);
    const base = avgInterval < 45 ? 72 : 16;
    return Math.min(95, Math.max(8, Math.round(base + (pts.length > 0 ? 4 : 0))));
  });

  readonly keyChartOption = computed<EChartsOption>(() => {
    const data = this.keyIntervals().slice(-20);
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: '#151626', textStyle: { color: '#F8FAFC', fontSize: 12 } },
      grid: { left: 42, right: 16, top: 16, bottom: 26 },
      xAxis: {
        type: 'category',
        data: data.map((_, i) => `K${i + 1}`),
        axisLabel: { color: '#71717A', fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        name: 'ms',
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        axisLabel: { color: '#71717A', fontSize: 10 },
      },
      series: [
        {
          type: 'bar',
          data,
          barWidth: 16,
          itemStyle: { color: '#A855F7', borderRadius: [6, 6, 0, 0] },
        },
      ],
    };
  });

  startTest(): void {
    this.isTesting.set(true);
    this.mousePoints.set([]);
    this.lastKeyTime = null;
  }

  stopTest(): void {
    this.isTesting.set(false);
  }

  resetTest(): void {
    this.isTesting.set(false);
    this.mousePoints.set([]);
    this.keyIntervals.set([132, 168, 145, 210, 118, 154]);
    this.lastKeyTime = null;
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isTesting()) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.mousePoints.update((pts) => [...pts.slice(-120), { x, y, t: Date.now() }]);
  }

  onKeyDown(): void {
    if (!this.isTesting()) return;
    const now = performance.now();
    if (this.lastKeyTime !== null) {
      const delta = Math.min(600, Math.round(now - this.lastKeyTime));
      this.keyIntervals.update((arr) => [...arr.slice(-24), delta]);
    }
    this.lastKeyTime = now;
  }
}
