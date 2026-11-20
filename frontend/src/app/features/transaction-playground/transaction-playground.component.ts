import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  LucideAngularModule,
  ArrowLeftRight,
  SendHorizontal,
  Building2,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Cpu,
  Clock,
  Layers,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Fingerprint,
  Radio,
  FileText,
  Sliders,
  History,
  Info,
  ChevronRight,
  Search,
  Zap,
} from 'lucide-angular';

import { TransactionService } from '../../core/services/transaction.service';
import { AlertRealtimeService } from '../../core/services/alert-realtime.service';
import { FraudStoreService } from '../../core/state/fraud-store.service';
import { WorkspaceService } from '../../core/auth/services/workspace.service';
import { SessionService } from '../../core/auth/services/session.service';
import {
  BankTenant,
  SimulateTransactionPayload,
  SimulateTransactionResponse,
  PlaygroundTransactionRecord,
  RealTimeFraudAlert,
} from '../../core/models/playground.models';
import { RiskGaugeComponent } from '../../shared/components/risk-gauge.component';
import { RiskBadgeComponent } from '../../shared/components/risk-badge.component';
import { TransactionFlow3dComponent, FlowTransactionInput } from '../../shared/components/transaction-flow-3d/transaction-flow-3d.component';

interface PresetScenario {
  id: string;
  name: string;
  tag: string;
  riskExpectation: 'LOW' | 'CRITICAL' | 'ELEVATED' | 'HIGH_VALUE';
  description: string;
  sendingBankId: string;
  receivingBankId: string;
  senderAccount: string;
  senderName: string;
  recipientAccount: string;
  recipientName: string;
  amount: number;
  currency: string;
  type: string;
  txDescription: string;
  sessionRef: string;
}

@Component({
  selector: 'app-transaction-playground',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LucideAngularModule,
    RiskGaugeComponent,
    TransactionFlow3dComponent,
  ],
  template: `
    <div class="space-y-6 animate-page-in pb-12">
      <!-- Header with Status Pill and Quick Preset Selector -->
      <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div class="flex flex-wrap items-center gap-3">
            <h1 class="font-display text-2xl sm:text-3xl font-bold tracking-tight gradient-text">
              Live Banking Transaction Playground
            </h1>
            <span
              class="px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1.5"
              [ngClass]="
                realtime.isConnected()
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              "
            >
              <span
                class="w-2 h-2 rounded-full"
                [class.bg-emerald-400]="realtime.isConnected()"
                [class.live-dot]="realtime.isConnected()"
                [class.bg-amber-400]="!realtime.isConnected()"
              ></span>
              {{ realtime.isConnected() ? 'BACKEND WEBSOCKET CONNECTED' : 'STANDBY' }}
            </span>
            <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
              DistilBERT INFERENCE ENGINE
            </span>
          </div>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1">
            Simulate inter-bank payment transfers through the fine-tuned DistilBERT transformer sequence engine with real-time multi-tenant alerts.
          </p>
        </div>

        <!-- Tenant Bank Perspective Selector -->
        <div class="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0B0C18] border border-white/8">
          <span class="text-[11px] font-medium text-zinc-500 px-2 flex items-center gap-1.5">
            <lucide-icon [img]="BuildingIcon" class="w-3.5 h-3.5 text-purple-400" />
            Active View:
          </span>
          @for (bank of banks(); track bank.id) {
            <button
              type="button"
              (click)="switchTenantWorkspace(bank.workspace_id)"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              [ngClass]="
                session.activeWorkspaceId() === bank.workspace_id
                  ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              "
            >
              <span>{{ bank.code }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Quick Preset Scenario Cards -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <p class="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <lucide-icon [img]="SparklesIcon" class="w-3.5 h-3.5 text-purple-400" />
            Pre-Configured Behavioral Attack & Settlement Scenarios
          </p>
          <span class="text-[11px] text-zinc-500">1-Click load realistic behavioral API sequences</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          @for (preset of presets; track preset.id) {
            <button
              type="button"
              (click)="loadPreset(preset)"
              class="fs-card fs-card-hover p-4 text-left transition-all border flex flex-col justify-between"
              [ngClass]="
                activePresetId() === preset.id
                  ? 'border-purple-500 bg-purple-950/20 shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)]'
                  : 'border-white/8 hover:border-white/20'
              "
            >
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                    [ngClass]="{
                      'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30': preset.riskExpectation === 'LOW',
                      'bg-red-500/15 text-red-300 border border-red-500/30': preset.riskExpectation === 'CRITICAL',
                      'bg-amber-500/15 text-amber-300 border border-amber-500/30': preset.riskExpectation === 'ELEVATED',
                      'bg-purple-500/15 text-purple-300 border border-purple-500/30': preset.riskExpectation === 'HIGH_VALUE'
                    }"
                  >
                    {{ preset.tag }}
                  </span>
                  <span class="font-mono-num text-xs font-bold text-zinc-300">
                    {{ preset.currency }} {{ preset.amount | number: '1.0-0' }}
                  </span>
                </div>
                <p class="text-xs font-bold text-white">{{ preset.name }}</p>
                <p class="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {{ preset.description }}
                </p>
              </div>
              <div class="mt-3 pt-2.5 border-t border-white/6 flex items-center justify-between text-[10px] text-zinc-500">
                <span>{{ preset.sendingBankId === 'BANK-AEGIS' ? 'Aegis' : 'Vanguard' }} &rarr; Apex</span>
                <span class="text-purple-400 font-semibold group-hover:underline">Load Preset &rarr;</span>
              </div>
            </button>
          }
        </div>
      </div>

      <!-- 3D Neural Transaction Flow Simulation Section -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-fuchsia-500"></span>
            </span>
            <span class="text-xs font-bold uppercase tracking-wider text-white">Full 3D Real-Time Transaction Flow Simulation</span>
          </div>
          <span class="text-[11px] text-zinc-400 font-mono">
            Interactive WebGL · Real-Time Detection, Cause Breakdown &amp; Multi-Bank Alerts
          </span>
        </div>

        <app-transaction-flow-3d [transactionData]="flow3dData()" />
      </div>

      <!-- Main Two-Column Playground Workspace -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left: Transaction Configuration Form (7 Cols) -->
        <div class="lg:col-span-7 space-y-6">
          <div class="fs-card p-6 border border-white/8 space-y-5">
            <div class="flex items-center justify-between border-b border-white/8 pb-4">
              <div>
                <h2 class="text-sm font-bold text-white flex items-center gap-2">
                  <lucide-icon [img]="SendIcon" class="w-4 h-4 text-purple-400" />
                  Initiate Simulated Inter-Bank Transfer
                </h2>
                <p class="text-xs text-zinc-400 mt-0.5">
                  Sends transaction parameters and anonymized behavioral telemetry to the backend engine.
                </p>
              </div>
              <button
                type="button"
                (click)="resetForm()"
                class="px-2.5 py-1 rounded-lg text-[11px] text-zinc-400 hover:text-white hover:bg-white/5 border border-white/8 flex items-center gap-1.5 transition-colors"
              >
                <lucide-icon [img]="RotateIcon" class="w-3.5 h-3.5" />
                Reset
              </button>
            </div>

            <!-- Inter-Bank Routing (Sending & Receiving Banks) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Sending Bank -->
              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-zinc-300">
                  Originating Bank (Sender)
                </label>
                <select
                  [(ngModel)]="form.sending_bank_id"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-[#10111D] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  @for (bank of banks(); track bank.id) {
                    <option [value]="bank.id">{{ bank.name }} ({{ bank.country }})</option>
                  }
                </select>
                <p class="text-[10px] text-zinc-500">Initiates outbound wire & compliance screening</p>
              </div>

              <!-- Receiving Bank -->
              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-zinc-300">
                  Beneficiary Bank (Receiver)
                </label>
                <select
                  [(ngModel)]="form.receiving_bank_id"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-[#10111D] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  @for (bank of banks(); track bank.id) {
                    <option [value]="bank.id">{{ bank.name }} ({{ bank.country }})</option>
                  }
                </select>
                <p class="text-[10px] text-zinc-500">Receives transfer & shared fraud alerts</p>
              </div>
            </div>

            <!-- Synthetic Accounts -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Sender Account -->
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-semibold text-zinc-300">Sender Account Reference</label>
                  <button
                    type="button"
                    (click)="generateSyntheticAccount('sender')"
                    class="text-[10px] text-purple-400 hover:text-purple-300"
                  >
                    Generate Ref
                  </button>
                </div>
                <input
                  type="text"
                  [(ngModel)]="form.sender_account"
                  placeholder="e.g. ACC-AEGIS-90412"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-[#10111D] border border-white/10 text-xs text-white font-mono-num focus:outline-none focus:border-purple-500"
                />
                <input
                  type="text"
                  [(ngModel)]="form.sender_name"
                  placeholder="Account Holder Name"
                  class="w-full px-3.5 py-1.5 rounded-lg bg-[#0C0D17] border border-white/6 text-[11px] text-zinc-300 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <!-- Recipient Account -->
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-semibold text-zinc-300">Recipient Account Reference</label>
                  <button
                    type="button"
                    (click)="generateSyntheticAccount('receiver')"
                    class="text-[10px] text-purple-400 hover:text-purple-300"
                  >
                    Generate Ref
                  </button>
                </div>
                <input
                  type="text"
                  [(ngModel)]="form.recipient_account"
                  placeholder="e.g. ACC-APEX-44109"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-[#10111D] border border-white/10 text-xs text-white font-mono-num focus:outline-none focus:border-purple-500"
                />
                <input
                  type="text"
                  [(ngModel)]="form.recipient_name"
                  placeholder="Beneficiary Entity Name"
                  class="w-full px-3.5 py-1.5 rounded-lg bg-[#0C0D17] border border-white/6 text-[11px] text-zinc-300 focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            <!-- Amount, Currency & Transaction Type -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <!-- Amount -->
              <div class="space-y-1.5 sm:col-span-1">
                <label class="block text-xs font-semibold text-zinc-300">Transfer Amount</label>
                <div class="relative">
                  <span class="absolute left-3.5 top-2.5 text-xs font-bold text-zinc-400">
                    {{ getCurrencySymbol(form.currency) }}
                  </span>
                  <input
                    type="number"
                    [(ngModel)]="form.amount"
                    min="1"
                    step="100"
                    class="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[#10111D] border border-white/10 text-xs font-bold text-white font-mono-num focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <!-- Currency -->
              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-zinc-300">Currency</label>
                <select
                  [(ngModel)]="form.currency"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-[#10111D] border border-white/10 text-xs text-white font-mono-num focus:outline-none focus:border-purple-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="SGD">SGD (S$)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="BDT">BDT (৳)</option>
                  <option value="AED">AED (د.إ)</option>
                </select>
              </div>

              <!-- Transaction Type -->
              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-zinc-300">Channel / Type</label>
                <select
                  [(ngModel)]="form.transaction_type"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-[#10111D] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Wire Transfer">Wire Transfer</option>
                  <option value="International Remittance">International Remittance</option>
                  <option value="ACH Transfer">ACH Transfer</option>
                  <option value="Card Payment">Card Payment</option>
                  <option value="P2P Transfer">P2P Transfer</option>
                  <option value="Crypto Swap">Crypto Swap</option>
                </select>
              </div>
            </div>

            <!-- Behavioral Session Reference & API Sequence Preview -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <lucide-icon [img]="FingerprintIcon" class="w-3.5 h-3.5 text-purple-400" />
                  Behavioral Banking Session Reference
                </label>
                <span class="text-[10px] text-zinc-500">Maps to anonymized API call sequence</span>
              </div>
              <select
                [(ngModel)]="form.behavioral_session_ref"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#10111D] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 font-mono-num"
              >
                <option value="SES-NORMAL-SALARY">SES-NORMAL-SALARY (Baseline: login &rarr; balance &rarr; beneficiary &rarr; wire)</option>
                <option value="SES-ANOMALOUS-TAKEOVER">SES-ANOMALOUS-TAKEOVER (Attack: password reset &rarr; instant beneficiary &rarr; wire)</option>
                <option value="SES-HEADLESS-BOT">SES-HEADLESS-BOT (Automated: headless browser &rarr; proxy jump &rarr; rapid dispatch)</option>
                <option value="SES-VELOCITY-PROBE">SES-VELOCITY-PROBE (Probing: MFA failure &rarr; repeated balance &rarr; card auth)</option>
              </select>

              <!-- Sequence Token Preview Box -->
              <div class="p-3 rounded-xl bg-[#070810] border border-white/6 text-[11px] font-mono leading-relaxed text-zinc-400">
                <span class="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider mb-1">
                  DistilBERT Input Token Sequence:
                </span>
                <span class="text-purple-300 font-medium">{{ getBehavioralSequencePreview() }}</span>
              </div>
            </div>

            <!-- Description -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-zinc-300">Transaction Memo / Description</label>
              <input
                type="text"
                [(ngModel)]="form.description"
                placeholder="e.g. Cross-border commercial invoice settlement"
                class="w-full px-3.5 py-2 rounded-xl bg-[#10111D] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <!-- Error Banner -->
            @if (txnService.submissionError(); as err) {
              <div class="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs flex items-center gap-2">
                <lucide-icon [img]="AlertIcon" class="w-4 h-4 shrink-0 text-red-400" />
                <span>{{ err }}</span>
              </div>
            }

            <!-- Disclaimer Notice -->
            <div class="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-[11px] text-zinc-400 flex items-start gap-2.5">
              <lucide-icon [img]="InfoIcon" class="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span class="text-purple-300 font-semibold">Synthetic Sandbox Guardrail:</span>
                This playground runs simulated interbank transactions against real DistilBERT transformer weights. Never enter real banking credentials; no real financial settlement is executed.
              </div>
            </div>

            <!-- Submit Button & Progress Indicator -->
            <div class="pt-2">
              <button
                type="button"
                (click)="submitTransaction()"
                [disabled]="txnService.isSubmitting()"
                class="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold tracking-wide transition-all shadow-[0_0_25px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                @if (txnService.isSubmitting()) {
                  <span class="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
                  <span>Executing DistilBERT Transformer Inference...</span>
                } @else {
                  <lucide-icon [img]="SendIcon" class="w-4 h-4" />
                  <span>Submit Simulated Transfer &amp; Run Fraud Detection</span>
                }
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Real-Time Results & Live Alerts Panel (5 Cols) -->
        <div class="lg:col-span-5 space-y-6">
          <!-- Active Transaction Result Card -->
          <div class="fs-card p-6 border border-white/8 space-y-5">
            <div class="flex items-center justify-between border-b border-white/8 pb-4">
              <div>
                <h2 class="text-sm font-bold text-white flex items-center gap-2">
                  <lucide-icon [img]="CpuIcon" class="w-4 h-4 text-purple-400" />
                  Backend Detection &amp; Decision Result
                </h2>
                <p class="text-xs text-zinc-400 mt-0.5">
                  Actual inference outputs returned by DistilBERT microservice.
                </p>
              </div>
              @if (activeResult(); as res) {
                <span
                  class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  [ngClass]="{
                    'bg-red-500/20 text-red-300 border border-red-500/30': res.decision === 'Blocked',
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30': res.decision === 'Flagged for Review',
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30': res.decision === 'Approved'
                  }"
                >
                  {{ res.decision }}
                </span>
              }
            </div>

            @if (activeResult(); as res) {
              <!-- Gauge & Score Summary -->
              <div class="p-5 rounded-2xl bg-[#090A16] border border-white/8 flex items-center gap-5">
                <app-risk-gauge [score]="res.model_prediction.risk_score" [size]="96" [strokeWidth]="8" />
                <div class="flex-1 min-w-0 space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-zinc-400">Model Prediction</span>
                    <span
                      class="px-2 py-0.5 rounded text-[11px] font-bold"
                      [ngClass]="
                        res.model_prediction.prediction === 'Fraudulent'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      "
                    >
                      {{ res.model_prediction.prediction }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-zinc-400">Fraud Probability</span>
                    <span class="font-mono-num text-xs font-semibold text-white">
                      {{ (res.model_prediction.fraud_probability * 100).toFixed(1) }}%
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-zinc-400">Research Threshold</span>
                    <span class="font-mono-num text-xs text-purple-300">
                      {{ (res.model_prediction.research_threshold * 100).toFixed(1) }}%
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-zinc-400">Inference Latency</span>
                    <span class="font-mono-num text-xs font-bold text-emerald-400">
                      {{ res.model_prediction.inference_latency_ms }} ms
                    </span>
                  </div>
                </div>
              </div>

              <!-- Transaction Reference & Routing Meta -->
              <div class="grid grid-cols-2 gap-3 text-xs">
                <div class="p-3 rounded-xl bg-[#10111D] border border-white/6">
                  <p class="text-[10px] text-zinc-500 uppercase font-semibold">Reference</p>
                  <p class="font-mono-num font-bold text-white mt-0.5">{{ res.transaction.id }}</p>
                </div>
                <div class="p-3 rounded-xl bg-[#10111D] border border-white/6">
                  <p class="text-[10px] text-zinc-500 uppercase font-semibold">Amount & Currency</p>
                  <p class="font-mono-num font-bold text-white mt-0.5">
                    {{ res.transaction.currency }} {{ res.transaction.amount | number: '1.2-2' }}
                  </p>
                </div>
                <div class="p-3 rounded-xl bg-[#10111D] border border-white/6">
                  <p class="text-[10px] text-zinc-500 uppercase font-semibold">Sending Bank</p>
                  <p class="font-medium text-purple-300 truncate mt-0.5">{{ res.transaction.sender_bank_name }}</p>
                </div>
                <div class="p-3 rounded-xl bg-[#10111D] border border-white/6">
                  <p class="text-[10px] text-zinc-500 uppercase font-semibold">Receiving Bank</p>
                  <p class="font-medium text-emerald-300 truncate mt-0.5">{{ res.transaction.receiver_bank_name }}</p>
                </div>
              </div>

              <!-- DistilBERT Behavioral Token Attributions -->
              <div class="space-y-2">
                <p class="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                  <span>DistilBERT Sequence Risk Indicators</span>
                  <span class="text-[10px] text-zinc-500">{{ res.model_prediction.model_version }}</span>
                </p>
                <div class="p-3.5 rounded-xl bg-[#090A16] border border-white/6 space-y-2">
                  @for (ind of res.model_prediction.explanation_metadata.risk_indicators; track ind) {
                    <div class="flex items-start gap-2 text-[11px] text-zinc-300">
                      <lucide-icon [img]="AlertIcon" class="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span>{{ ind }}</span>
                    </div>
                  }
                  <div class="pt-2 border-t border-white/6 flex flex-wrap gap-1.5">
                    @for (tok of res.model_prediction.explanation_metadata.top_risk_tokens; track tok.token) {
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/15 text-purple-300 border border-purple-500/25">
                        {{ tok.token }} (+{{ tok.weight }})
                      </span>
                    }
                  </div>
                </div>
              </div>

              <!-- Decision Policy Rationale & Action Buttons -->
              <div class="p-3.5 rounded-xl bg-[#10111D] border border-white/8 space-y-2.5">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-white">Bank Decision Policy Rationale</span>
                  <span class="text-[10px] text-zinc-400">Automated Guardrail</span>
                </div>
                <p class="text-[11px] text-zinc-300 leading-relaxed">
                  {{ res.decision_details.reasons[0] || 'Standard clear' }}
                </p>

                <!-- Investigation Links if Alert or Case Created -->
                @if (res.case; as c) {
                  <div class="pt-2 border-t border-white/6 flex items-center justify-between">
                    <div class="flex items-center gap-1.5 text-xs text-purple-300">
                      <lucide-icon [img]="FileTextIcon" class="w-3.5 h-3.5" />
                      <span>Case Created: <strong class="font-mono-num">{{ c.id }}</strong></span>
                    </div>
                    <a
                      routerLink="/app/cases"
                      class="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-purple-600/30 text-purple-200 hover:bg-purple-600/50 flex items-center gap-1 transition-colors"
                    >
                      <span>Open Case Queue</span>
                      <lucide-icon [img]="ExternalLinkIcon" class="w-3 h-3" />
                    </a>
                  </div>
                }
              </div>
            } @else {
              <!-- Empty State before first simulation -->
              <div class="py-12 text-center space-y-3">
                <div class="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                  <lucide-icon [img]="SendIcon" class="w-6 h-6" />
                </div>
                <p class="text-sm font-semibold text-white">No Simulation Executed Yet</p>
                <p class="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                  Select a preset scenario above or enter custom transfer parameters, then submit to trigger live DistilBERT scoring.
                </p>
              </div>
            }
          </div>

          <!-- Real-Time Multi-Bank Alert Dispatch Card -->
          <div class="fs-card p-5 border border-white/8 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <lucide-icon [img]="RadioIcon" class="w-3.5 h-3.5 text-purple-400" />
                Real-Time Bank Alert Broadcast Stream
              </h3>
              <span class="text-[10px] text-zinc-500">Tenant-Aware Channels</span>
            </div>

            @if (activeAlert(); as alert) {
              <div
                class="p-4 rounded-xl border space-y-2 animate-page-in"
                [ngClass]="{
                  'bg-red-500/10 border-red-500/30 text-red-200': alert.severity === 'critical',
                  'bg-amber-500/10 border-amber-500/30 text-amber-200': alert.severity === 'high',
                  'bg-purple-500/10 border-purple-500/30 text-purple-200': alert.severity === 'medium'
                }"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold">{{ alert.title }}</span>
                  <span class="text-[10px] font-mono-num opacity-75">{{ alert.timestamp | date: 'mediumTime' }}</span>
                </div>
                <p class="text-[11px] leading-relaxed opacity-90">{{ alert.description }}</p>
                <div class="pt-2 border-t border-white/10 flex flex-wrap items-center gap-2 text-[10px]">
                  <span class="text-zinc-400">Authorized Recipients:</span>
                  @for (bankId of alert.authorized_bank_ids; track bankId) {
                    <span class="px-2 py-0.5 rounded bg-white/10 font-semibold font-mono-num">
                      {{ bankId }}
                    </span>
                  }
                  <span class="px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 font-semibold">
                    + Central Consortium
                  </span>
                </div>
              </div>
            } @else {
              <div class="py-6 text-center text-xs text-zinc-500">
                Listening for real-time WebSocket alert dispatches across bank tenants...
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Recent Simulated Transactions History -->
      <div class="fs-card p-6 border border-white/8 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <lucide-icon [img]="HistoryIcon" class="w-4 h-4 text-purple-400" />
              Tenant Transaction Audit Log &amp; Decision History
            </h3>
            <p class="text-xs text-zinc-400 mt-0.5">
              Filtered in accordance with active bank workspace permissions ({{ session.activeRole() }}).
            </p>
          </div>
          <button
            type="button"
            (click)="loadRecentTransactions()"
            class="px-3 py-1.5 rounded-xl bg-[#10111D] hover:bg-[#151626] border border-white/8 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 self-start sm:self-auto"
          >
            <lucide-icon [img]="RotateIcon" class="w-3.5 h-3.5" />
            Refresh Log
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-white/8 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <th class="py-3 px-3">Reference</th>
                <th class="py-3 px-3">Route (Origin &rarr; Target)</th>
                <th class="py-3 px-3">Type</th>
                <th class="py-3 px-3">Amount</th>
                <th class="py-3 px-3">DistilBERT Score</th>
                <th class="py-3 px-3">Status</th>
                <th class="py-3 px-3">Timestamp</th>
                <th class="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/6">
              @for (tx of recentTransactions(); track tx.id) {
                <tr class="hover:bg-white/4 transition-colors">
                  <td class="py-3 px-3 font-mono-num font-bold text-purple-300">
                    {{ tx.id }}
                  </td>
                  <td class="py-3 px-3">
                    <div class="font-medium text-white">{{ tx.sender_bank_code }} &rarr; {{ tx.receiver_bank_code }}</div>
                    <div class="text-[10px] text-zinc-500 font-mono-num">{{ tx.sender_account }}</div>
                  </td>
                  <td class="py-3 px-3 text-zinc-300">{{ tx.type }}</td>
                  <td class="py-3 px-3 font-mono-num font-bold text-white">
                    {{ tx.currency }} {{ tx.amount | number: '1.2-2' }}
                  </td>
                  <td class="py-3 px-3">
                    <span
                      class="px-2 py-0.5 rounded text-[11px] font-bold font-mono-num"
                      [ngClass]="{
                        'bg-red-500/20 text-red-300': tx.model_prediction.risk_score >= 80,
                        'bg-amber-500/20 text-amber-300': tx.model_prediction.risk_score >= 45 && tx.model_prediction.risk_score < 80,
                        'bg-emerald-500/20 text-emerald-300': tx.model_prediction.risk_score < 45
                      }"
                    >
                      {{ tx.model_prediction.risk_score }}/100
                    </span>
                  </td>
                  <td class="py-3 px-3">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      [ngClass]="{
                        'bg-red-500/20 text-red-300 border border-red-500/30': tx.status === 'Blocked',
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30': tx.status === 'Flagged for Review',
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30': tx.status === 'Approved'
                      }"
                    >
                      {{ tx.status }}
                    </span>
                  </td>
                  <td class="py-3 px-3 text-zinc-500 font-mono-num text-[11px]">
                    {{ tx.created_at | date: 'shortTime' }}
                  </td>
                  <td class="py-3 px-3 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        (click)="inspectTransaction(tx.id)"
                        class="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 border border-purple-500/30 transition-colors"
                      >
                        Inspect
                      </button>
                      @if (tx.status === 'Flagged for Review') {
                        <button
                          type="button"
                          (click)="updateStatus(tx.id, 'Approved')"
                          class="px-2 py-1 rounded-lg text-[10px] font-medium bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30"
                          title="Analyst Approve"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          (click)="updateStatus(tx.id, 'Blocked')"
                          class="px-2 py-1 rounded-lg text-[10px] font-medium bg-red-500/15 text-red-300 hover:bg-red-500/25 border border-red-500/30"
                          title="Analyst Block"
                        >
                          Block
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="py-8 text-center text-xs text-zinc-500">
                    No simulated transactions in the audit log for this workspace. Use the form above to submit one.
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
export class TransactionPlaygroundComponent implements OnInit, OnDestroy {
  readonly txnService = inject(TransactionService);
  readonly realtime = inject(AlertRealtimeService);
  readonly store = inject(FraudStoreService);
  readonly workspaceService = inject(WorkspaceService);
  readonly session = inject(SessionService);
  private readonly router = inject(Router);

  // Icons
  readonly ArrowLeftRightIcon = ArrowLeftRight;
  readonly SendIcon = SendHorizontal;
  readonly BuildingIcon = Building2;
  readonly ShieldAlertIcon = ShieldAlert;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly AlertIcon = AlertTriangle;
  readonly RotateIcon = RotateCcw;
  readonly SparklesIcon = Sparkles;
  readonly CpuIcon = Cpu;
  readonly ClockIcon = Clock;
  readonly LayersIcon = Layers;
  readonly CheckIcon = CheckCircle2;
  readonly CloseIcon = XCircle;
  readonly ExternalLinkIcon = ExternalLink;
  readonly FingerprintIcon = Fingerprint;
  readonly RadioIcon = Radio;
  readonly FileTextIcon = FileText;
  readonly SlidersIcon = Sliders;
  readonly HistoryIcon = History;
  readonly InfoIcon = Info;
  readonly ChevronRightIcon = ChevronRight;
  readonly SearchIcon = Search;
  readonly ZapIcon = Zap;

  readonly banks = this.txnService.availableBanks;
  readonly activePresetId = signal<string>('preset-ato');
  readonly activeResult = signal<SimulateTransactionResponse | null>(null);
  readonly activeAlert = signal<RealTimeFraudAlert | null>(null);
  readonly recentTransactions = signal<PlaygroundTransactionRecord[]>([]);

  readonly flow3dData = computed<FlowTransactionInput>(() => {
    const res = this.activeResult();
    const form = this.form;
    if (res) {
      const isFraud = res.decision === 'Blocked' || res.model_prediction.prediction === 'Fraudulent';
      return {
        senderBank: res.transaction.sender_bank_name || 'Aegis Capital Bank',
        senderAccount: res.transaction.sender_account,
        senderName: res.transaction.sender_name,
        receiverBank: res.transaction.receiver_bank_name || 'Apex Global Bank',
        recipientAccount: res.transaction.recipient_account,
        recipientName: res.transaction.recipient_name,
        amount: res.transaction.amount,
        currency: res.transaction.currency,
        type: res.transaction.type,
        isFraud,
        score: res.model_prediction.risk_score,
        decision: res.decision,
        latency: res.model_prediction.inference_latency_ms,
        reasons: res.decision_details?.reasons || [],
        alertNotification: res.alert?.title
      };
    }
    const isAttack = this.activePresetId() === 'preset-ato' || this.activePresetId() === 'preset-bot';
    return {
      senderBank: form.sending_bank_id === 'BANK-AEGIS' ? 'Aegis Capital Bank' : form.sending_bank_id === 'BANK-APEX' ? 'Apex Global Bank' : 'Vanguard Crest Bank',
      senderAccount: form.sender_account,
      senderName: form.sender_name,
      receiverBank: form.receiving_bank_id === 'BANK-APEX' ? 'Apex Global Bank' : form.receiving_bank_id === 'BANK-VANG' ? 'Vanguard Crest Bank' : 'Aegis Capital Bank',
      recipientAccount: form.recipient_account,
      recipientName: form.recipient_name,
      amount: form.amount,
      currency: form.currency,
      type: form.transaction_type,
      isFraud: isAttack,
      score: isAttack ? 87 : 12,
      decision: isAttack ? 'Blocked' : 'Approved',
      latency: 7.8,
      reasons: isAttack
        ? ['DistilBERT behavioral sequence anomaly detected', 'Credential modification prior to wire dispatch']
        : ['Consistent account holder behavioral baseline', 'Low risk transaction pattern']
    };
  });

  private sub: Subscription = new Subscription();

  // Form State
  form: SimulateTransactionPayload = {
    sending_bank_id: 'BANK-AEGIS',
    receiving_bank_id: 'BANK-APEX',
    sender_account: 'ACC-AEGIS-90412',
    sender_name: 'Aarav Mehta',
    recipient_account: 'ACC-APEX-44109',
    recipient_name: 'Liam Chen',
    amount: 4800,
    currency: 'USD',
    transaction_type: 'Wire Transfer',
    description: 'Urgent family medical emergency wire',
    behavioral_session_ref: 'SES-ANOMALOUS-TAKEOVER',
  };

  readonly presets: PresetScenario[] = [
    {
      id: 'preset-ato',
      name: 'Adversarial Account Takeover',
      tag: 'Critical Fraud',
      riskExpectation: 'CRITICAL',
      description: 'Hijacked session from impossible geo, password reset + instant beneficiary addition + maximum cashout wire.',
      sendingBankId: 'BANK-AEGIS',
      receivingBankId: 'BANK-APEX',
      senderAccount: 'ACC-AEGIS-90412',
      senderName: 'Aarav Mehta',
      recipientAccount: 'ACC-APEX-44109',
      recipientName: 'Liam Chen',
      amount: 4800,
      currency: 'USD',
      type: 'Wire Transfer',
      txDescription: 'Cross-border immediate wire cashout',
      sessionRef: 'SES-ANOMALOUS-TAKEOVER',
    },
    {
      id: 'preset-legit',
      name: 'Legitimate Expatriate Remittance',
      tag: 'Legitimate',
      riskExpectation: 'LOW',
      description: 'Standard consumer banking pattern: bi-weekly salary transfer from established device to verified family beneficiary.',
      sendingBankId: 'BANK-AEGIS',
      receivingBankId: 'BANK-APEX',
      senderAccount: 'ACC-AEGIS-55109',
      senderName: 'Sofia Al-Mansoor',
      recipientAccount: 'ACC-APEX-10429',
      recipientName: 'Tariq Mahmud',
      amount: 850,
      currency: 'USD',
      type: 'International Remittance',
      txDescription: 'Monthly family support remittance',
      sessionRef: 'SES-NORMAL-SALARY',
    },
    {
      id: 'preset-bot',
      name: 'Automated Bot Micro-Test',
      tag: 'Botnet Probe',
      riskExpectation: 'ELEVATED',
      description: 'Headless browser proxy executing rapid automated API balance probes before high-frequency card authorization.',
      sendingBankId: 'BANK-VANGUARD',
      receivingBankId: 'BANK-APEX',
      senderAccount: 'ACC-VANGUARD-88120',
      senderName: 'Elena Rostova',
      recipientAccount: 'ACC-APEX-99214',
      recipientName: 'Mule Relay Pool #3',
      amount: 1500,
      currency: 'GBP',
      type: 'Card Payment',
      txDescription: 'Card auth testing batch #12',
      sessionRef: 'SES-HEADLESS-BOT',
    },
    {
      id: 'preset-highval',
      name: 'High-Value Institutional Wire',
      tag: 'Policy Review',
      riskExpectation: 'HIGH_VALUE',
      description: 'Legitimate corporate treasury settlement exceeding $10,000 threshold requiring compliance officer four-eyes approval.',
      sendingBankId: 'BANK-AEGIS',
      receivingBankId: 'BANK-VANGUARD',
      senderAccount: 'ACC-AEGIS-11048',
      senderName: 'Apex Digital Capital',
      recipientAccount: 'ACC-VANGUARD-77318',
      recipientName: 'Global Liquidity Services UK',
      amount: 45000,
      currency: 'USD',
      type: 'Wire Transfer',
      txDescription: 'Treasury interbank liquidity swap',
      sessionRef: 'SES-VELOCITY-PROBE',
    },
  ];

  ngOnInit(): void {
    this.loadPreset(this.presets[0]);
    this.loadRecentTransactions();

    // Listen to real-time events
    this.sub.add(
      this.realtime.alertCreated$.subscribe((alert) => {
        this.activeAlert.set(alert);
      })
    );

    this.sub.add(
      this.realtime.transactionCreated$.subscribe((txn) => {
        this.recentTransactions.update((list) => [txn, ...list.filter((t) => t.id !== txn.id)].slice(0, 50));
      })
    );

    this.sub.add(
      this.realtime.transactionAnalyzed$.subscribe((data) => {
        this.recentTransactions.update((list) =>
          list.map((t) => (t.id === data.transaction.id ? { ...t, ...data.transaction, status: data.decision as any } : t))
        );
      })
    );
  }

  loadPreset(preset: PresetScenario): void {
    this.activePresetId.set(preset.id);
    this.form = {
      sending_bank_id: preset.sendingBankId,
      receiving_bank_id: preset.receivingBankId,
      sender_account: preset.senderAccount,
      sender_name: preset.senderName,
      recipient_account: preset.recipientAccount,
      recipient_name: preset.recipientName,
      amount: preset.amount,
      currency: preset.currency,
      transaction_type: preset.type,
      description: preset.txDescription,
      behavioral_session_ref: preset.sessionRef,
    };
  }

  submitTransaction(): void {
    if (!this.form.sender_account || !this.form.recipient_account || this.form.amount <= 0) {
      this.store.showToast('Validation Error', 'Please complete all required transaction fields.', 'warning');
      return;
    }

    this.txnService.simulateTransaction(this.form).subscribe({
      next: (res) => {
        this.activeResult.set(res);
        if (res.alert) {
          this.activeAlert.set(res.alert);
        }
        this.loadRecentTransactions();
        this.store.showToast(
          `Decision: ${res.decision.toUpperCase()}`,
          `DistilBERT scored ${res.model_prediction.risk_score}/100 in ${res.model_prediction.inference_latency_ms}ms`,
          res.decision === 'Blocked' ? 'critical' : res.decision === 'Flagged for Review' ? 'warning' : 'success'
        );
      },
      error: (err) => {
        this.store.showToast('Transaction Failed', err.message || 'Error processing transaction simulation.', 'critical');
      },
    });
  }

  loadRecentTransactions(): void {
    this.txnService.getTransactions(30).subscribe((txns) => {
      this.recentTransactions.set(txns);
    });
  }

  inspectTransaction(id: string): void {
    this.store.openTransactionDrawer(id);
  }

  updateStatus(id: string, action: 'Approved' | 'Blocked'): void {
    const decision: 'Approve' | 'Block' = action === 'Approved' ? 'Approve' : 'Block';
    this.txnService.submitAnalystDecision(id, decision, 'Manual override via Transaction Playground').subscribe({
      next: () => {
        this.recentTransactions.update((list) =>
          list.map((t) => (t.id === id ? { ...t, status: action } : t))
        );
        this.store.showToast('Status Updated', `Transaction ${id} is now ${action}`, 'info');
      },
    });
  }

  switchTenantWorkspace(workspaceId: string): void {
    this.workspaceService.switchWorkspace(workspaceId);
    this.realtime.registerWorkspace(workspaceId);
    this.loadRecentTransactions();
    this.store.showToast(
      'Tenant Switched',
      `Active bank perspective changed to ${workspaceId}`,
      'info'
    );
  }

  generateSyntheticAccount(type: 'sender' | 'receiver'): void {
    const prefix = type === 'sender' ? 'ACC-AEGIS' : 'ACC-APEX';
    const num = Math.floor(10000 + Math.random() * 89999);
    if (type === 'sender') {
      this.form.sender_account = `${prefix}-${num}`;
    } else {
      this.form.recipient_account = `${prefix}-${num}`;
    }
  }

  resetForm(): void {
    this.loadPreset(this.presets[0]);
  }

  getCurrencySymbol(curr: string): string {
    switch (curr) {
      case 'SGD':
        return 'S$';
      case 'GBP':
        return '£';
      case 'EUR':
        return '€';
      case 'BDT':
        return '৳';
      case 'AED':
        return 'د.إ';
      default:
        return '$';
    }
  }

  getBehavioralSequencePreview(): string {
    const ref = this.form.behavioral_session_ref || '';
    if (ref.includes('NORMAL')) {
      return 'POST /api/v1/auth/login -> GET /api/v1/accounts/balance -> GET /api/v1/beneficiaries/list -> POST /api/v1/transfers/wire';
    }
    if (ref.includes('BOT')) {
      return 'POST /api/v1/auth/login [headless_bot] -> GET /api/v1/accounts/balance [proxy_jump] -> POST /api/v1/transfers/wire';
    }
    if (ref.includes('VELOCITY')) {
      return 'POST /api/v1/auth/mfa/fail -> POST /api/v1/auth/login -> GET /api/v1/accounts/balance (x3) -> POST /api/v1/transfers/wire';
    }
    return 'POST /api/v1/auth/password/reset -> POST /api/v1/auth/login -> POST /api/v1/beneficiaries/add -> POST /api/v1/transfers/wire';
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
