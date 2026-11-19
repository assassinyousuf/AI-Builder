import { Injectable, OnDestroy, inject, signal } from '@angular/core';
import { FraudStoreService } from '../state/fraud-store.service';
import {
  DEMO_LOCATIONS,
  buildExplanationForTransaction,
  classifyRiskLevel,
} from '../data/mock-seed.data';
import {
  GraphEdge,
  GraphNode,
  SimulationEvent,
  SimulationScenario,
  Transaction,
  TransactionType,
} from '../models/fraud.models';

@Injectable({ providedIn: 'root' })
export class MockSimulationService implements OnDestroy {
  private readonly store = inject(FraudStoreService);
  private timer: ReturnType<typeof setInterval> | null = null;
  private simCounter = 7100;

  readonly scenarios: SimulationScenario[] = [
    {
      id: 'card_testing',
      name: 'Card Testing Burst',
      subtitle: 'BIN Enumeration & Micro-Charge Velocity Attack',
      description:
        'Simulates rapid-fire micro-transactions and failed authorization probes within seconds before escalating to high-value card-not-present checkout.',
      indicators: [
        'Rapid transaction frequency (<3s intervals)',
        'Multiple failed authorization attempts',
        'Repeated card BIN usage across merchants',
        'Suspicious escalation sequence',
      ],
      totalSteps: 5,
      estimatedDurationSec: 8,
    },
    {
      id: 'account_takeover',
      name: 'Account Takeover',
      subtitle: 'Credential Compromise + Impossible Travel Wire',
      description:
        'Simulates a hijacked session from an unfamiliar geography and headless device, followed by rapid profile anomaly and high-value outbound transfer.',
      indicators: [
        'Unusual login location (Impossible travel)',
        'New unseen device fingerprint + proxy',
        'Sharp behavioral keystroke deviation',
        'High-value outbound wire attempt',
      ],
      totalSteps: 4,
      estimatedDurationSec: 7,
    },
    {
      id: 'money_laundering',
      name: 'Money Laundering Ring',
      subtitle: 'Multi-Hop Mule Relay & Layering Topology',
      description:
        'Simulates illicit funds splitting across connected mule accounts and converging into an offshore settlement hub to evade static rules.',
      indicators: [
        'Multiple mule accounts in relay chain',
        'Layered split-and-merge transfers',
        'Rapid cross-account velocity',
        'Shared device cluster in Fraud Graph',
      ],
      totalSteps: 5,
      estimatedDurationSec: 9,
    },
  ];

  readonly activeScenarioId = signal<SimulationScenario['id'] | null>(null);
  readonly status = signal<'idle' | 'preparing' | 'running' | 'paused' | 'completed'>('idle');
  readonly currentStep = signal<number>(0);
  readonly totalSteps = signal<number>(0);
  readonly events = signal<SimulationEvent[]>([]);
  readonly injectedTxnIds = signal<string[]>([]);
  readonly summaryStats = signal<{
    injectedCount: number;
    blockedCount: number;
    totalSimulatedAmount: number;
    alertsGenerated: number;
    casesCreated: number;
  } | null>(null);

  launchScenario(id: SimulationScenario['id']): void {
    this.resetSimulation();
    const scenario = this.scenarios.find((s) => s.id === id);
    if (!scenario) return;

    this.activeScenarioId.set(id);
    this.totalSteps.set(scenario.totalSteps);
    this.status.set('preparing');

    setTimeout(() => {
      if (this.activeScenarioId() !== id) return;
      this.status.set('running');
      this.runStep(scenario, 1);
      this.timer = setInterval(() => {
        if (this.status() !== 'running') return;
        const next = this.currentStep() + 1;
        if (next > scenario.totalSteps) {
          this.completeSimulation(scenario);
        } else {
          this.runStep(scenario, next);
        }
      }, 1350);
    }, 850);
  }

  togglePause(): void {
    if (this.status() === 'running') {
      this.status.set('paused');
    } else if (this.status() === 'paused') {
      this.status.set('running');
    }
  }

  resetSimulation(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.activeScenarioId.set(null);
    this.status.set('idle');
    this.currentStep.set(0);
    this.totalSteps.set(0);
    this.events.set([]);
    this.injectedTxnIds.set([]);
    this.summaryStats.set(null);
  }

  private runStep(scenario: SimulationScenario, step: number): void {
    this.currentStep.set(step);
    const txn = this.buildScenarioTransaction(scenario.id, step);
    this.store.prependTransactions([txn]);
    this.injectedTxnIds.update((ids) => [...ids, txn.id]);

    this.events.update((curr) => [
      {
        id: `SIM-EV-${Date.now()}-${step}`,
        step,
        title: `Step ${step}/${scenario.totalSteps}: ${txn.id} ($${txn.amount.toLocaleString()})`,
        detail: `${txn.type} from ${txn.senderAccount} -> ${txn.receiverName} | Risk ${txn.prediction.riskScore}/100 (${txn.status.toUpperCase()})`,
        transactionId: txn.id,
        riskScore: txn.prediction.riskScore,
        timestamp: new Date().toISOString(),
      },
      ...curr,
    ]);

    if (txn.prediction.riskScore >= 75) {
      this.store.addAlert({
        title: `[SIMULATION] ${scenario.name}: ${txn.id}`,
        description: `Simulated attack event scored ${txn.prediction.riskScore}/100 ($${txn.amount.toLocaleString()}).`,
        severity: txn.prediction.riskScore >= 85 ? 'critical' : 'high',
        category: 'attack_sim',
        transactionId: txn.id,
        accountId: txn.senderAccount,
        isSimulated: true,
      });
    }

    if (step === scenario.totalSteps) {
      this.injectScenarioGraphAndCase(scenario, txn);
    }
  }

  private injectScenarioGraphAndCase(scenario: SimulationScenario, finalTxn: Transaction): void {
    this.store.createCaseFromTransaction(finalTxn, true);

    const clusterId = `sim_${scenario.id}_${Date.now()}`;
    const nodes: GraphNode[] = [
      {
        id: finalTxn.senderAccount,
        label: `${finalTxn.senderAccount}\n(Sim Origin)`,
        type: 'suspicious_account',
        riskScore: finalTxn.prediction.riskScore,
        clusterId,
        connections: 2,
        investigationStatus: 'Flagged',
        relatedTransactions: [finalTxn.id],
        associatedDevices: [finalTxn.device.deviceId],
      },
      {
        id: finalTxn.receiverAccount,
        label: `${finalTxn.receiverAccount}\n(Sim Target)`,
        type: 'suspicious_account',
        riskScore: 91,
        clusterId,
        connections: 2,
        investigationStatus: 'Investigating',
        relatedTransactions: [finalTxn.id],
        associatedDevices: [],
      },
    ];
    const edges: GraphEdge[] = [
      {
        id: `SIM-E-${Date.now()}`,
        source: finalTxn.senderAccount,
        target: finalTxn.receiverAccount,
        type: 'TRANSFERRED_TO',
        amount: finalTxn.amount,
        suspicious: true,
        clusterId,
      },
    ];
    this.store.injectGraphEntities(nodes, edges);
  }

  private completeSimulation(scenario: SimulationScenario): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.status.set('completed');
    const ids = this.injectedTxnIds();
    const txns = this.store.transactions().filter((t) => ids.includes(t.id));
    const blockedCount = txns.filter((t) => t.status === 'blocked').length;
    const totalSimulatedAmount = txns.reduce((s, t) => s + t.amount, 0);

    this.summaryStats.set({
      injectedCount: txns.length,
      blockedCount,
      totalSimulatedAmount,
      alertsGenerated: txns.filter((t) => t.prediction.riskScore >= 75).length,
      casesCreated: 1,
    });

    this.store.addActivity({
      type: 'simulation',
      title: `Completed Simulation: ${scenario.name}`,
      detail: `Injected ${txns.length} simulated transactions ($${totalSimulatedAmount.toLocaleString()}). ${blockedCount} auto-blocked.`,
      actor: 'Attack Simulator',
    });

    this.store.showToast(
      'Simulation Complete',
      `${scenario.name} finished. ${blockedCount}/${txns.length} simulated threats blocked.`,
      'warning'
    );
  }

  private buildScenarioTransaction(id: SimulationScenario['id'], step: number): Transaction {
    this.simCounter += 1;
    const txnId = `SIM-${this.simCounter}`;

    if (id === 'card_testing') {
      const amounts = [1.0, 2.5, 4.99, 12.0, 2450.0];
      const scores = [58, 66, 74, 83, 93];
      const amount = amounts[(step - 1) % amounts.length];
      const score = scores[(step - 1) % scores.length];
      const loc = DEMO_LOCATIONS[6]; // New York
      return this.makeTxn(
        txnId,
        'ACC-SIM-401',
        'Compromised Card #401',
        'MER-SIM-99',
        'Global Digital Goods',
        amount,
        'Card Payment',
        loc,
        score,
        true,
        step >= 4,
        'Card Testing Burst'
      );
    }

    if (id === 'account_takeover') {
      const amounts = [150, 890, 4200, 14800];
      const scores = [68, 79, 88, 96];
      const amount = amounts[(step - 1) % amounts.length];
      const score = scores[(step - 1) % scores.length];
      const loc = DEMO_LOCATIONS[8]; // Dubai
      return this.makeTxn(
        txnId,
        'ACC-SIM-702',
        'Takeover Target #702',
        'ACC-SIM-MULE9',
        'Offshore Settlement #9',
        amount,
        'Wire Transfer',
        loc,
        score,
        true,
        true,
        'Account Takeover'
      );
    }

    // money_laundering
    const amounts = [3200, 3150, 3100, 6200, 11900];
    const scores = [71, 76, 82, 89, 95];
    const amount = amounts[(step - 1) % amounts.length];
    const score = scores[(step - 1) % scores.length];
    const loc = DEMO_LOCATIONS[(step + 1) % DEMO_LOCATIONS.length];
    return this.makeTxn(
      txnId,
      `ACC-MULE-${step}`,
      `Mule Account #${step}`,
      step === 5 ? 'ACC-OFFSHORE-HUB' : `ACC-MULE-${step + 1}`,
      step === 5 ? 'Offshore Consolidation Hub' : `Mule Account #${step + 1}`,
      amount,
      'International Remittance',
      loc,
      score,
      true,
      step >= 3,
      'Money Laundering Ring'
    );
  }

  private makeTxn(
    id: string,
    senderAccount: string,
    senderName: string,
    receiverAccount: string,
    receiverName: string,
    amount: number,
    type: TransactionType,
    loc: (typeof DEMO_LOCATIONS)[number],
    score: number,
    isNewDevice: boolean,
    isProxy: boolean,
    tag: string
  ): Transaction {
    return {
      id,
      senderAccount,
      senderName,
      receiverAccount,
      receiverName,
      merchantCategory: 'Simulation Traffic',
      amount,
      currency: 'USD',
      type,
      location: loc,
      destinationLocation: DEMO_LOCATIONS[4],
      device: {
        deviceId: `DEV-SIM-${tag.slice(0, 3).toUpperCase()}`,
        os: isProxy ? 'Linux Headless' : 'Windows 11',
        browser: isProxy ? 'Puppeteer / Proxy' : 'Chrome 131',
        fingerprintHash: `fp_sim_${id.toLowerCase()}`,
        isNewDevice,
        isEmulatorOrProxy: isProxy,
      },
      ipAddress: '198.51.100.77',
      timestamp: new Date().toISOString(),
      prediction: {
        fraudProbability: Number((score / 100).toFixed(2)),
        riskScore: score,
        riskLevel: classifyRiskLevel(score),
        modelDecision: score >= 80 ? 'BLOCK' : score >= 60 ? 'REVIEW' : 'APPROVE',
        latencyMs: 11,
        modelVersion: 'FraudShield-Ensemble v3.4',
      },
      status: score >= 80 ? 'blocked' : 'flagged',
      explanation: buildExplanationForTransaction(id, amount, type, loc, score, isNewDevice, isProxy, 6.2),
      isSimulated: true,
      simulationTag: tag,
    };
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }
}
