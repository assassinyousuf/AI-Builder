import { Injectable } from '@angular/core';
import { HELD_OUT_EVALUATION_DATASET } from '../data/mock-seed.data';
import { EvaluationSample } from '../models/fraud.models';

export interface ThresholdEvaluationResult {
  threshold: number;
  tp: number;
  fp: number;
  tn: number;
  fn: number;
  precision: number;
  recall: number;
  fpr: number;
  tpr: number;
  tnr: number;
  fnr: number;
  f1Score: number;
  flaggedCount: number;
  approvedCount: number;
}

@Injectable({ providedIn: 'root' })
export class MockAnalyticsService {
  readonly dataset: EvaluationSample[] = HELD_OUT_EVALUATION_DATASET;

  evaluateThreshold(thresholdPct: number): ThresholdEvaluationResult {
    const threshold = Math.max(0, Math.min(100, thresholdPct)) / 100;
    let tp = 0;
    let fp = 0;
    let tn = 0;
    let fn = 0;

    for (const sample of this.dataset) {
      const predictedFraud = sample.probability >= threshold;
      if (predictedFraud && sample.actualFraud) tp++;
      else if (predictedFraud && !sample.actualFraud) fp++;
      else if (!predictedFraud && !sample.actualFraud) tn++;
      else fn++;
    }

    const precision = tp + fp > 0 ? tp / (tp + fp) : 1;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const fpr = fp + tn > 0 ? fp / (fp + tn) : 0;
    const tpr = recall;
    const tnr = fp + tn > 0 ? tn / (fp + tn) : 1;
    const fnr = tp + fn > 0 ? fn / (tp + fn) : 0;
    const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    return {
      threshold: thresholdPct,
      tp,
      fp,
      tn,
      fn,
      precision: Number((precision * 100).toFixed(1)),
      recall: Number((recall * 100).toFixed(1)),
      fpr: Number((fpr * 100).toFixed(1)),
      tpr: Number((tpr * 100).toFixed(1)),
      tnr: Number((tnr * 100).toFixed(1)),
      fnr: Number((fnr * 100).toFixed(1)),
      f1Score: Number((f1Score * 100).toFixed(1)),
      flaggedCount: tp + fp,
      approvedCount: tn + fn,
    };
  }

  getPrecisionRecallCurve(): { threshold: number; precision: number; recall: number; fpr: number; f1: number }[] {
    const points: { threshold: number; precision: number; recall: number; fpr: number; f1: number }[] = [];
    for (let t = 5; t <= 95; t += 5) {
      const res = this.evaluateThreshold(t);
      points.push({
        threshold: t,
        precision: res.precision,
        recall: res.recall,
        fpr: res.fpr,
        f1: res.f1Score,
      });
    }
    return points;
  }
}
