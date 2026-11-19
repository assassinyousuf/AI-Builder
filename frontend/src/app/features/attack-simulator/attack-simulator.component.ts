import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  LucideAngularModule,
  Swords,
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  Zap,
} from 'lucide-angular';
import { MockSimulationService } from '../../core/services/mock-simulation.service';
import { FraudStoreService } from '../../core/state/fraud-store.service';
import { SimulationScenario } from '../../core/models/fraud.models';

@Component({
  selector: 'app-attack-simulator',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="space-y-6 animate-page-in">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="font-display text-2xl sm:text-3xl font-bold tracking-tight gradient-text">
              Fraud Attack Simulation Lab
            </h1>
            <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30">
              SIMULATION SANDBOX
            </span>
          </div>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1">
            Launch realistic adversarial attack sequences that propagate live across Dashboard, Stream, Alerts, Graph, and Case Queue
          </p>
        </div>

        @if (sim.status() !== 'idle') {
          <div class="flex items-center gap-2">
            @if (sim.status() === 'running' || sim.status() === 'paused') {
              <button
                type="button"
                (click)="sim.togglePause()"
                class="px-3.5 py-2 rounded-xl bg-[#10111D] hover:bg-[#151626] border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5"
              >
                <lucide-icon [img]="sim.status() === 'paused' ? PlayIcon : PauseIcon" class="w-3.5 h-3.5 text-purple-400" />
                {{ sim.status() === 'paused' ? 'Resume' : 'Pause' }}
              </button>
            }
            <button
              type="button"
              (click)="sim.resetSimulation()"
              class="px-3.5 py-2 rounded-xl bg-[#10111D] hover:bg-[#151626] border border-white/10 text-xs font-semibold text-zinc-300 flex items-center gap-1.5"
            >
              <lucide-icon [img]="ResetIcon" class="w-3.5 h-3.5" />
              Reset Scenario
            </button>
          </div>
        }
      </div>

      <!-- 3 Scenario Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        @for (sc of sim.scenarios; track sc.id) {
          <div
            class="fs-card fs-card-hover p-6 flex flex-col justify-between relative overflow-hidden"
            [class.border-purple-500/60]="sim.activeScenarioId() === sc.id || preselectedScenario() === sc.id"
          >
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/25">
                  {{ sc.totalSteps }} Staged Events
                </span>
                @if (sim.activeScenarioId() === sc.id && sim.status() === 'running') {
                  <span class="flex items-center gap-1.5 text-[11px] font-semibold text-fuchsia-300">
                    <span class="relative w-2 h-2 rounded-full bg-fuchsia-400 live-dot"></span>
                    RUNNING
                  </span>
                }
              </div>

              <h2 class="font-display text-lg font-bold text-white">{{ sc.name }}</h2>
              <p class="text-xs text-purple-300 mt-0.5">{{ sc.subtitle }}</p>
              <p class="text-xs text-zinc-400 mt-3 leading-relaxed">{{ sc.description }}</p>

              <ul class="mt-4 space-y-1.5">
                @for (ind of sc.indicators; track ind) {
                  <li class="flex items-center gap-2 text-xs text-zinc-300">
                    <span class="w-1.5 h-1.5 rounded-full bg-fuchsia-400 shrink-0"></span>
                    <span>{{ ind }}</span>
                  </li>
                }
              </ul>
            </div>

            <button
              type="button"
              (click)="sim.launchScenario(sc.id)"
              [disabled]="sim.status() === 'running' || sim.status() === 'preparing'"
              class="mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-50 text-xs font-semibold text-white flex items-center justify-center gap-2 shadow-[0_0_24px_-6px_rgba(168,85,247,0.65)] transition-all"
            >
              <lucide-icon [img]="SwordsIcon" class="w-4 h-4" />
              Launch Simulation
            </button>
          </div>
        }
      </div>

      <!-- Active Simulation Telemetry & Timeline -->
      @if (sim.status() !== 'idle') {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <!-- Progress & Summary -->
          <div class="fs-card p-6 lg:col-span-5 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-white flex items-center gap-2">
                <lucide-icon [img]="ZapIcon" class="w-4 h-4 text-fuchsia-400" />
                Simulation Execution Status
              </h3>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                SIMULATION DATA
              </span>
            </div>

            @if (sim.status() === 'preparing') {
              <div class="p-4 rounded-xl bg-[#090A16] border border-purple-500/25 space-y-2">
                <p class="text-xs font-medium text-purple-300">Preparing adversarial payload & device telemetry...</p>
                <div class="h-2 w-full rounded-full skeleton-shimmer"></div>
              </div>
            } @else {
              <div>
                <div class="flex justify-between text-xs mb-1.5">
                  <span class="text-zinc-400">Injection Progress</span>
                  <span class="font-mono-num text-white">{{ sim.currentStep() }} / {{ sim.totalSteps() }}</span>
                </div>
                <div class="h-2.5 w-full rounded-full bg-white/8 overflow-hidden">
                  <div
                    class="h-full gradient-accent-bar transition-all duration-500"
                    [style.width.%]="(sim.currentStep() / (sim.totalSteps() || 1)) * 100"
                  ></div>
                </div>
              </div>
            }

            @if (sim.summaryStats(); as sum) {
              <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-2 animate-page-in">
                <p class="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                  <lucide-icon [img]="CheckIcon" class="w-4 h-4" />
                  Simulation Complete — Detection Summary
                </p>
                <div class="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span class="text-zinc-400">Injected Txns:</span>
                    <span class="font-mono-num font-bold text-white ml-1">{{ sum.injectedCount }}</span>
                  </div>
                  <div>
                    <span class="text-zinc-400">Auto-Blocked:</span>
                    <span class="font-mono-num font-bold text-red-300 ml-1">{{ sum.blockedCount }}</span>
                  </div>
                  <div>
                    <span class="text-zinc-400">Alerts Fired:</span>
                    <span class="font-mono-num font-bold text-amber-300 ml-1">{{ sum.alertsGenerated }}</span>
                  </div>
                  <div>
                    <span class="text-zinc-400">Cases Opened:</span>
                    <span class="font-mono-num font-bold text-purple-300 ml-1">{{ sum.casesCreated }}</span>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Injection Timeline -->
          <div class="fs-card p-6 lg:col-span-7">
            <h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <lucide-icon [img]="AlertIcon" class="w-4 h-4 text-red-400" />
              Transaction Injection Timeline (Simulated)
            </h3>
            <div class="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              @for (ev of sim.events(); track ev.id) {
                <div class="p-3 rounded-xl bg-[#090A16] border border-white/8 flex items-center justify-between gap-3 animate-row-enter">
                  <div class="min-w-0">
                    <p class="text-xs font-semibold text-white">{{ ev.title }}</p>
                    <p class="text-[11px] text-zinc-400 mt-0.5 truncate">{{ ev.detail }}</p>
                  </div>
                  @if (ev.transactionId) {
                    <button
                      type="button"
                      (click)="store.openTransactionDrawer(ev.transactionId)"
                      class="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-[11px] font-mono-num text-purple-300 shrink-0"
                    >
                      Inspect
                    </button>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AttackSimulatorComponent implements OnInit {
  readonly sim = inject(MockSimulationService);
  readonly store = inject(FraudStoreService);
  private readonly route = inject(ActivatedRoute);

  readonly preselectedScenario = signal<SimulationScenario['id'] | null>(null);

  readonly SwordsIcon = Swords;
  readonly PlayIcon = Play;
  readonly PauseIcon = Pause;
  readonly ResetIcon = RotateCcw;
  readonly AlertIcon = ShieldAlert;
  readonly CheckIcon = CheckCircle2;
  readonly ZapIcon = Zap;

  ngOnInit(): void {
    const param = this.route.snapshot.queryParamMap.get('scenario');
    if (param === 'card_testing' || param === 'account_takeover' || param === 'money_laundering') {
      this.preselectedScenario.set(param);
    }
  }
}
