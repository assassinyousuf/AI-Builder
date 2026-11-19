import { Injectable, OnDestroy, signal } from '@angular/core';
import { FederatedBankState } from '../models/fraud.models';

@Injectable({ providedIn: 'root' })
export class MockFederatedService implements OnDestroy {
  private timer: ReturnType<typeof setInterval> | null = null;

  private readonly initialBanks: FederatedBankState[] = [
    { id: 'bank-a', name: 'Bank Alpha', region: 'South Asia', localSamples: 142000, localAuc: 0.912, progress: 0, stage: 'idle', color: '#A855F7' },
    { id: 'bank-b', name: 'Bank Beta', region: 'Southeast Asia', localSamples: 98500, localAuc: 0.904, progress: 0, stage: 'idle', color: '#D946EF' },
    { id: 'bank-c', name: 'Bank Gamma', region: 'Europe', localSamples: 215000, localAuc: 0.921, progress: 0, stage: 'idle', color: '#38BDF8' },
    { id: 'bank-d', name: 'Bank Delta', region: 'North America', localSamples: 176400, localAuc: 0.918, progress: 0, stage: 'idle', color: '#10B981' },
  ];

  readonly banks = signal<FederatedBankState[]>(structuredClone(this.initialBanks));
  readonly isRunning = signal<boolean>(false);
  readonly currentRound = signal<number>(1);
  readonly maxRounds = 5;
  readonly globalModelVersion = signal<string>('v3.4.0');
  readonly globalAuc = signal<number>(0.914);
  readonly aggregationProgress = signal<number>(0);
  readonly phase = signal<'idle' | 'local_training' | 'uploading' | 'aggregating' | 'distributing'>('idle');

  startTraining(): void {
    if (this.isRunning()) return;
    this.isRunning.set(true);
    if (this.phase() === 'idle') {
      this.phase.set('local_training');
    }

    this.timer = setInterval(() => {
      if (!this.isRunning()) return;
      const currentPhase = this.phase();

      if (currentPhase === 'local_training') {
        let allDone = true;
        this.banks.update((list) =>
          list.map((b, idx) => {
            const nextProg = Math.min(100, b.progress + 12 + idx * 3);
            if (nextProg < 100) allDone = false;
            return { ...b, progress: nextProg, stage: nextProg >= 100 ? 'uploading_gradients' : 'local_training' };
          })
        );
        if (allDone) {
          this.phase.set('uploading');
          this.aggregationProgress.set(25);
        }
      } else if (currentPhase === 'uploading') {
        this.aggregationProgress.update((p) => Math.min(60, p + 18));
        if (this.aggregationProgress() >= 60) {
          this.phase.set('aggregating');
          this.banks.update((list) => list.map((b) => ({ ...b, stage: 'aggregating' })));
        }
      } else if (currentPhase === 'aggregating') {
        this.aggregationProgress.update((p) => Math.min(100, p + 20));
        if (this.aggregationProgress() >= 100) {
          this.phase.set('distributing');
          const round = this.currentRound();
          this.globalModelVersion.set(`v3.4.${round}`);
          this.globalAuc.update((auc) => Number(Math.min(0.962, auc + 0.008).toFixed(3)));
          this.banks.update((list) =>
            list.map((b) => ({
              ...b,
              localAuc: Number(Math.min(0.958, b.localAuc + 0.009).toFixed(3)),
              stage: 'synced',
            }))
          );
        }
      } else if (currentPhase === 'distributing') {
        if (this.currentRound() < this.maxRounds) {
          this.currentRound.update((r) => r + 1);
          this.aggregationProgress.set(0);
          this.phase.set('local_training');
          this.banks.update((list) => list.map((b) => ({ ...b, progress: 0, stage: 'local_training' })));
        } else {
          this.pauseTraining();
        }
      }
    }, 450);
  }

  pauseTraining(): void {
    this.isRunning.set(false);
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  resetTraining(): void {
    this.pauseTraining();
    this.currentRound.set(1);
    this.globalModelVersion.set('v3.4.0');
    this.globalAuc.set(0.914);
    this.aggregationProgress.set(0);
    this.phase.set('idle');
    this.banks.set(structuredClone(this.initialBanks));
  }

  ngOnDestroy(): void {
    this.pauseTraining();
  }
}
