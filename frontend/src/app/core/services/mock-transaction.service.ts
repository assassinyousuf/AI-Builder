import { Injectable, OnDestroy, inject } from '@angular/core';
import { FraudStoreService } from '../state/fraud-store.service';
import {
  DEMO_LOCATIONS,
  buildExplanationForTransaction,
  classifyRiskLevel,
} from '../data/mock-seed.data';
import { Transaction, TransactionStatus, TransactionType } from '../models/fraud.models';

@Injectable({ providedIn: 'root' })
export class MockTransactionService implements OnDestroy {
  private readonly store = inject(FraudStoreService);
  private streamTimer: ReturnType<typeof setInterval> | null = null;
  private txnCounter = 4822;

  private readonly names = [
    { acc: 'ACC-90412', name: 'Aarav Mehta' },
    { acc: 'ACC-55109', name: 'Liam Chen' },
    { acc: 'ACC-33821', name: 'Sofia Al-Mansoor' },
    { acc: 'ACC-61904', name: 'Ethan Brooks' },
    { acc: 'ACC-84210', name: 'Priya Nair' },
    { acc: 'ACC-41029', name: 'Tariq Mahmud' },
    { acc: 'ACC-29514', name: 'Elena Rostova' },
  ];

  private readonly receivers = [
    { acc: 'MER-4410', name: 'Apex Digital Exchange', cat: 'Crypto & Digital Assets' },
    { acc: 'MER-2209', name: 'LuxeGlobal Retail', cat: 'Luxury E-Commerce' },
    { acc: 'MER-8931', name: 'CloudScale Hosting', cat: 'SaaS / Infrastructure' },
    { acc: 'MER-1042', name: 'SwiftPay Remit', cat: 'Remittance Corridor' },
    { acc: 'ACC-88120', name: 'Vanguard Offshore Ltd', cat: 'Cross-Border Wire' },
  ];

  private readonly types: TransactionType[] = [
    'Card Payment',
    'Wire Transfer',
    'ACH Transfer',
    'P2P Transfer',
    'Crypto Swap',
    'International Remittance',
  ];

  startLiveStream(): void {
    if (this.streamTimer) return;
    this.scheduleNextTick();
  }

  private scheduleNextTick(): void {
    if (this.streamTimer) clearInterval(this.streamTimer);
    const speed = this.store.streamSpeed();
    const intervalMs = Math.max(450, Math.round(2400 / speed));

    this.streamTimer = setInterval(() => {
      if (this.store.streamPaused()) return;
      const txn = this.generateRandomTransaction();
      this.store.prependTransactions([txn]);
      const jitter = Number((38 + Math.random() * 14).toFixed(1));
      this.store.liveTps.set(jitter);

      if (txn.prediction.riskScore >= 80) {
        this.store.addAlert({
          title: `High-Risk ${txn.type} Detected (${txn.id})`,
          description: `$${txn.amount.toLocaleString()} from ${txn.location.city}, ${txn.location.countryCode} scored ${txn.prediction.riskScore}/100.`,
          severity: 'critical',
          category: 'high_risk_txn',
          transactionId: txn.id,
          accountId: txn.senderAccount,
        });
      }
    }, intervalMs);
  }

  setSpeed(speed: 0.5 | 1 | 2 | 5): void {
    this.store.streamSpeed.set(speed);
    this.scheduleNextTick();
  }

  togglePause(): void {
    this.store.streamPaused.update((p) => !p);
  }

  generateRandomTransaction(): Transaction {
    this.txnCounter += 1;
    const id = `TXN-${this.txnCounter}`;
    const sender = this.names[Math.floor(Math.random() * this.names.length)];
    const receiver = this.receivers[Math.floor(Math.random() * this.receivers.length)];
    const loc = DEMO_LOCATIONS[Math.floor(Math.random() * DEMO_LOCATIONS.length)];
    const dest = DEMO_LOCATIONS[Math.floor(Math.random() * DEMO_LOCATIONS.length)];
    const type = this.types[Math.floor(Math.random() * this.types.length)];

    const roll = Math.random();
    const score =
      roll > 0.88
        ? Math.floor(80 + Math.random() * 18)
        : roll > 0.72
          ? Math.floor(60 + Math.random() * 19)
          : roll > 0.48
            ? Math.floor(30 + Math.random() * 29)
            : Math.floor(5 + Math.random() * 24);

    const amount =
      score >= 80
        ? Math.round(4500 + Math.random() * 18000)
        : score >= 60
          ? Math.round(1200 + Math.random() * 4200)
          : Math.round(25 + Math.random() * 750);

    const isNewDevice = score >= 60;
    const isProxy = score >= 84;
    const riskLevel = classifyRiskLevel(score);
    const status: TransactionStatus =
      score >= this.store.settings().autoBlockThreshold
        ? 'blocked'
        : score >= this.store.activeThreshold()
          ? 'flagged'
          : 'approved';

    return {
      id,
      senderAccount: sender.acc,
      senderName: sender.name,
      receiverAccount: receiver.acc,
      receiverName: receiver.name,
      merchantName: receiver.acc.startsWith('MER') ? receiver.name : undefined,
      merchantCategory: receiver.cat,
      amount,
      currency: 'USD',
      type,
      location: loc,
      destinationLocation: dest,
      device: {
        deviceId: `DEV-${Math.floor(1000 + Math.random() * 8999)}`,
        os: isProxy ? 'Android 14 (Rooted)' : 'macOS 15.1',
        browser: isProxy ? 'Tor Browser' : 'Chrome 131',
        fingerprintHash: `fp_${Math.random().toString(16).slice(2, 10)}`,
        isNewDevice,
        isEmulatorOrProxy: isProxy,
      },
      ipAddress: `103.${Math.floor(20 + Math.random() * 200)}.${Math.floor(10 + Math.random() * 220)}.${Math.floor(1 + Math.random() * 240)}`,
      timestamp: new Date().toISOString(),
      prediction: {
        fraudProbability: Number((score / 100).toFixed(2)),
        riskScore: score,
        riskLevel,
        modelDecision: score >= 80 ? 'BLOCK' : score >= 60 ? 'REVIEW' : 'APPROVE',
        latencyMs: Math.floor(8 + Math.random() * 16),
        modelVersion: 'FraudShield-Ensemble v3.4',
      },
      status,
      explanation: buildExplanationForTransaction(
        id,
        amount,
        type,
        loc,
        score,
        isNewDevice,
        isProxy,
        score >= 70 ? 3.8 : 1.1
      ),
    };
  }

  approveTransaction(id: string): void {
    this.store.updateTransactionStatus(id, 'approved');
    this.store.showToast('Transaction Approved', `${id} marked as legitimate.`, 'success');
  }

  blockTransaction(id: string): void {
    this.store.updateTransactionStatus(id, 'blocked');
    this.store.showToast('Transaction Blocked', `${id} has been blocked in mock policy state.`, 'critical');
  }

  escalateTransaction(id: string): void {
    this.store.updateTransactionStatus(id, 'under_review');
    const txn = this.store.transactions().find((t) => t.id === id);
    if (txn) {
      const c = this.store.createCaseFromTransaction(txn);
      this.store.updateCaseStatus(c.id, 'Escalated', 'Escalate', 'Escalated from transaction inspector.');
    }
    this.store.showToast('Transaction Escalated', `${id} escalated to Tier-2 Investigation Queue.`, 'warning');
  }

  addToCase(id: string): void {
    const txn = this.store.transactions().find((t) => t.id === id);
    if (!txn) return;
    const c = this.store.createCaseFromTransaction(txn);
    this.store.showToast('Added to Case Queue', `${id} linked to ${c.id}.`, 'info');
  }

  exportCsv(transactions: Transaction[], filename = 'fraudshield-transactions.csv'): void {
    const headers = [
      'Transaction ID',
      'Sender Account',
      'Sender Name',
      'Receiver',
      'Amount (USD)',
      'Type',
      'Location',
      'Risk Score',
      'Risk Level',
      'Status',
      'Latency (ms)',
      'Timestamp',
    ];
    const rows = transactions.map((t) => [
      t.id,
      t.senderAccount,
      `"${t.senderName}"`,
      `"${t.receiverName}"`,
      t.amount.toFixed(2),
      `"${t.type}"`,
      `"${t.location.city}, ${t.location.country}"`,
      t.prediction.riskScore,
      t.prediction.riskLevel,
      t.status,
      t.prediction.latencyMs,
      t.timestamp,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    this.store.showToast('Export Complete', `Downloaded ${transactions.length} rows to ${filename}.`, 'success');
  }

  ngOnDestroy(): void {
    if (this.streamTimer) clearInterval(this.streamTimer);
  }
}
