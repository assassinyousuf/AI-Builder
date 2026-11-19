import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Network, Play, Pause, RotateCcw, ShieldCheck, Database, Cpu } from 'lucide-angular';
import { MockFederatedService } from '../../core/services/mock-federated.service';

@Component({
  selector: 'app-federated-learning',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="space-y-6 animate-page-in">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 class="font-display text-2xl sm:text-3xl font-bold tracking-tight gradient-text">
            Privacy-Preserving Fraud Intelligence
          </h1>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1">
            Animated Federated Learning Simulation across four independent financial institutions
          </p>
        </div>

        <div class="flex items-center gap-2">
          @if (!fed.isRunning()) {
            <button
              type="button"
              (click)="fed.startTraining()"
              class="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-[0_0_20px_-5px_rgba(168,85,247,0.7)]"
            >
              <lucide-icon [img]="PlayIcon" class="w-3.5 h-3.5" />
              Start Training
            </button>
          } @else {
            <button
              type="button"
              (click)="fed.pauseTraining()"
              class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white flex items-center gap-1.5"
            >
              <lucide-icon [img]="PauseIcon" class="w-3.5 h-3.5" />
              Pause
            </button>
          }

          <button
            type="button"
            (click)="fed.resetTraining()"
            class="px-3.5 py-2 rounded-xl bg-[#10111D] border border-white/10 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5"
          >
            <lucide-icon [img]="ResetIcon" class="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      <!-- Privacy Banner -->
      <div class="fs-card p-4 border-emerald-500/25 bg-emerald-500/5 flex items-center gap-3 text-xs text-emerald-200">
        <lucide-icon [img]="ShieldIcon" class="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong>Raw customer transaction data stays within each institution in this conceptual demonstration.</strong> Only encrypted model weight updates are shared with the central aggregation server. (Animated educational simulation)
        </span>
      </div>

      <!-- Global Coordinator Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="fs-card p-4">
          <p class="text-[11px] text-zinc-400">Training Round</p>
          <p class="font-mono-num text-2xl font-bold text-white mt-0.5">
            {{ fed.currentRound() }} <span class="text-sm text-zinc-500">/ {{ fed.maxRounds }}</span>
          </p>
        </div>
        <div class="fs-card p-4">
          <p class="text-[11px] text-zinc-400">Global Model Version</p>
          <p class="font-mono-num text-2xl font-bold text-purple-300 mt-0.5">{{ fed.globalModelVersion() }}</p>
        </div>
        <div class="fs-card p-4">
          <p class="text-[11px] text-zinc-400">Global Ensemble AUC</p>
          <p class="font-mono-num text-2xl font-bold text-emerald-400 mt-0.5">{{ fed.globalAuc() }}</p>
        </div>
        <div class="fs-card p-4">
          <p class="text-[11px] text-zinc-400">Coordinator Phase</p>
          <p class="text-sm font-semibold text-fuchsia-300 mt-1.5 uppercase tracking-wider">
            {{ fed.phase().replace('_', ' ') }}
          </p>
        </div>
      </div>

      <!-- Central Aggregation Server + 4 Banks -->
      <div class="fs-card p-6 space-y-6">
        <!-- Central Server -->
        <div class="max-w-md mx-auto p-5 rounded-2xl bg-[#090A16] border border-purple-500/40 text-center shadow-[0_0_40px_-10px_rgba(168,85,247,0.45)]">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-600 mx-auto flex items-center justify-center mb-3">
            <lucide-icon [img]="NetworkIcon" class="w-6 h-6 text-white" />
          </div>
          <h3 class="font-display text-base font-bold text-white">Central Aggregation Server (FedAvg)</h3>
          <p class="text-xs text-zinc-400 mt-1">Aggregates encrypted gradient deltas without PII access</p>
          <div class="mt-3">
            <div class="flex justify-between text-[11px] mb-1">
              <span class="text-zinc-400">Aggregation Progress</span>
              <span class="font-mono-num text-purple-300">{{ fed.aggregationProgress() }}%</span>
            </div>
            <div class="h-2 w-full rounded-full bg-white/8 overflow-hidden">
              <div class="h-full gradient-accent-bar transition-all duration-300" [style.width.%]="fed.aggregationProgress()"></div>
            </div>
          </div>
        </div>

        <!-- 4 Institutions -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          @for (bank of fed.banks(); track bank.id) {
            <div class="p-5 rounded-2xl bg-[#090A16] border border-white/10 space-y-3 relative overflow-hidden">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-bold text-white">{{ bank.name }}</h4>
                  <p class="text-[11px] text-zinc-400">{{ bank.region }}</p>
                </div>
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-semibold uppercase border"
                  [ngClass]="
                    bank.stage === 'synced'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : bank.stage === 'idle'
                        ? 'bg-white/5 text-zinc-400 border-white/10'
                        : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                  "
                >
                  {{ bank.stage.replace('_', ' ') }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-2 text-xs pt-1">
                <div class="p-2.5 rounded-xl bg-[#10111D] border border-white/6">
                  <div class="flex items-center gap-1 text-zinc-400 text-[10px]">
                    <lucide-icon [img]="DbIcon" class="w-3 h-3 text-purple-400" />
                    Local Dataset
                  </div>
                  <p class="font-mono-num font-semibold text-white mt-0.5">{{ bank.localSamples | number }}</p>
                </div>
                <div class="p-2.5 rounded-xl bg-[#10111D] border border-white/6">
                  <div class="flex items-center gap-1 text-zinc-400 text-[10px]">
                    <lucide-icon [img]="CpuIcon" class="w-3 h-3 text-fuchsia-400" />
                    Local AUC
                  </div>
                  <p class="font-mono-num font-semibold text-emerald-300 mt-0.5">{{ bank.localAuc }}</p>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-[11px] mb-1">
                  <span class="text-zinc-400">Local Epoch</span>
                  <span class="font-mono-num text-white">{{ bank.progress }}%</span>
                </div>
                <div class="h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    [style.width.%]="bank.progress"
                    [style.backgroundColor]="bank.color"
                  ></div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class FederatedLearningComponent {
  readonly fed = inject(MockFederatedService);

  readonly NetworkIcon = Network;
  readonly PlayIcon = Play;
  readonly PauseIcon = Pause;
  readonly ResetIcon = RotateCcw;
  readonly ShieldIcon = ShieldCheck;
  readonly DbIcon = Database;
  readonly CpuIcon = Cpu;
}
