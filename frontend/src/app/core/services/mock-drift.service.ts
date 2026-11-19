import { Injectable, inject, signal } from '@angular/core';
import { DriftMetrics } from '../models/fraud.models';
import { FraudStoreService } from '../state/fraud-store.service';

@Injectable({ providedIn: 'root' })
export class MockDriftService {
  private readonly store = inject(FraudStoreService);

  private readonly baselineMetrics: DriftMetrics = {
    status: 'Stable',
    overallPsi: 0.08,
    lastChecked: new Date().toISOString(),
    retrainRecommended: false,
    features: [
      { name: 'transaction_amount_zscore', psi: 0.06, baselineMean: 0.12, currentMean: 0.15, status: 'Stable' },
      { name: 'velocity_1h_count', psi: 0.09, baselineMean: 1.4, currentMean: 1.6, status: 'Stable' },
      { name: 'device_fingerprint_entropy', psi: 0.07, baselineMean: 0.24, currentMean: 0.26, status: 'Stable' },
      { name: 'geo_distance_km', psi: 0.11, baselineMean: 42.0, currentMean: 55.0, status: 'Warning' },
      { name: 'merchant_chargeback_ratio', psi: 0.05, baselineMean: 0.018, currentMean: 0.019, status: 'Stable' },
    ],
    timeline: [
      { date: 'Day -6', psi: 0.05, auc: 0.942 },
      { date: 'Day -5', psi: 0.06, auc: 0.941 },
      { date: 'Day -4', psi: 0.06, auc: 0.939 },
      { date: 'Day -3', psi: 0.07, auc: 0.938 },
      { date: 'Day -2', psi: 0.08, auc: 0.936 },
      { date: 'Day -1', psi: 0.08, auc: 0.935 },
      { date: 'Today', psi: 0.08, auc: 0.935 },
    ],
  };

  readonly drift = signal<DriftMetrics>(structuredClone(this.baselineMetrics));

  simulateDriftEvent(): void {
    this.drift.set({
      status: 'Drift Detected',
      overallPsi: 0.34,
      lastChecked: new Date().toISOString(),
      retrainRecommended: true,
      features: [
        { name: 'transaction_amount_zscore', psi: 0.38, baselineMean: 0.12, currentMean: 0.64, status: 'Drift Detected' },
        { name: 'velocity_1h_count', psi: 0.42, baselineMean: 1.4, currentMean: 4.1, status: 'Drift Detected' },
        { name: 'device_fingerprint_entropy', psi: 0.29, baselineMean: 0.24, currentMean: 0.51, status: 'Drift Detected' },
        { name: 'geo_distance_km', psi: 0.21, baselineMean: 42.0, currentMean: 218.0, status: 'Warning' },
        { name: 'merchant_chargeback_ratio', psi: 0.12, baselineMean: 0.018, currentMean: 0.031, status: 'Warning' },
      ],
      timeline: [
        { date: 'Day -6', psi: 0.05, auc: 0.942 },
        { date: 'Day -5', psi: 0.06, auc: 0.941 },
        { date: 'Day -4', psi: 0.07, auc: 0.939 },
        { date: 'Day -3', psi: 0.11, auc: 0.931 },
        { date: 'Day -2', psi: 0.18, auc: 0.914 },
        { date: 'Day -1', psi: 0.26, auc: 0.892 },
        { date: 'Today', psi: 0.34, auc: 0.868 },
      ],
    });

    this.store.addAlert({
      title: 'Model Drift Detected (PSI: 0.34)',
      description: 'Feature shift detected in velocity_1h_count and transaction_amount_zscore. Retraining recommended.',
      severity: 'critical',
      category: 'drift',
    });

    this.store.showToast(
      'Drift Event Simulated',
      'Overall PSI jumped to 0.34. Retrain Recommended alert triggered.',
      'warning'
    );
  }

  resetDrift(): void {
    this.drift.set(structuredClone(this.baselineMetrics));
    this.store.showToast('Drift Reset', 'Restored baseline feature distributions (PSI: 0.08).', 'info');
  }
}
