import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap, finalize } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';
import { SessionService } from '../auth/services/session.service';
import { FraudStoreService } from '../state/fraud-store.service';
import {
  BankTenant,
  PlaygroundTransactionRecord,
  SimulateTransactionPayload,
  SimulateTransactionResponse,
} from '../models/playground.models';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);
  private readonly store = inject(FraudStoreService);

  readonly isSubmitting = signal(false);
  readonly lastSubmission = signal<SimulateTransactionResponse | null>(null);
  readonly submissionError = signal<string | null>(null);

  // Cached banks in the network
  readonly availableBanks = signal<BankTenant[]>([
    {
      id: 'BANK-AEGIS',
      workspace_id: 'WS-901',
      name: 'Aegis Capital Bank',
      code: 'AEGIS',
      country: 'United States',
      currency: 'USD',
      role: 'Tier 1 Settlement & Commercial Bank',
      sharing_policy: 'Full Consortium',
      logo_badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'BANK-APEX',
      workspace_id: 'WS-903',
      name: 'Apex Global Bank',
      code: 'APEX',
      country: 'Singapore',
      currency: 'SGD',
      role: 'Cross-Border Remittance & Liquidity Hub',
      sharing_policy: 'Bilateral Trusted',
      logo_badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'BANK-VANGUARD',
      workspace_id: 'WS-904',
      name: 'Vanguard International Bank',
      code: 'VANGUARD',
      country: 'United Kingdom',
      currency: 'GBP',
      role: 'European Commercial & Institutional Partner',
      sharing_policy: 'Strict Reciprocal',
      logo_badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    {
      id: 'BANK-CENTRAL',
      workspace_id: 'WS-CENTRAL',
      name: 'Central Fraud Intelligence Network',
      code: 'CENTRAL',
      country: 'Global Consortium',
      currency: 'USD',
      role: 'Regulatory & Cross-Bank Consortium Oversight',
      sharing_policy: 'Global Intelligence Authority',
      logo_badge: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
    },
  ]);

  constructor() {
    this.fetchBanks();
  }

  fetchBanks(): void {
    this.http
      .get<{ banks: BankTenant[] }>(`${API_CONFIG.baseUrl}/banks`)
      .pipe(
        catchError(() => {
          // Keep defaults if backend offline
          return [];
        })
      )
      .subscribe((res) => {
        if (res && res.banks) {
          this.availableBanks.set(res.banks);
        }
      });
  }

  /**
   * Submits a transaction simulation to the backend processing pipeline.
   * Performs the complete 10-step transaction flow.
   */
  simulateTransaction(payload: SimulateTransactionPayload): Observable<SimulateTransactionResponse> {
    if (this.isSubmitting()) {
      return throwError(() => new Error('A transaction submission is already in progress.'));
    }

    this.isSubmitting.set(true);
    this.submissionError.set(null);

    const wsId = this.session.activeWorkspaceId() || 'WS-901';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Workspace-Id': wsId,
    });

    return this.http
      .post<SimulateTransactionResponse>(`${API_CONFIG.baseUrl}/transactions/simulate`, payload, {
        headers,
      })
      .pipe(
        tap((response) => {
          this.lastSubmission.set(response);
          // Sync into frontend global store for real-time visibility across all views
          this.syncToGlobalStore(response);
        }),
        catchError((err) => {
          const errMsg = err?.error?.detail || err?.message || 'Transaction submission failed.';
          this.submissionError.set(errMsg);
          return throwError(() => err);
        }),
        finalize(() => {
          this.isSubmitting.set(false);
        })
      );
  }

  getTransactions(limit = 50): Observable<PlaygroundTransactionRecord[]> {
    const wsId = this.session.activeWorkspaceId() || 'WS-901';
    const headers = new HttpHeaders({
      'X-Workspace-Id': wsId,
    });

    return this.http
      .get<{ transactions: PlaygroundTransactionRecord[] }>(
        `${API_CONFIG.baseUrl}/transactions?limit=${limit}`,
        { headers }
      )
      .pipe(
        map((res) => res.transactions || []),
        catchError(() => {
          // If offline or error, return empty
          return [];
        })
      );
  }

  submitAnalystDecision(transactionId: string, action: 'Approve' | 'Block' | 'Escalate', notes?: string): Observable<any> {
    const wsId = this.session.activeWorkspaceId() || 'WS-901';
    const headers = new HttpHeaders({
      'X-Workspace-Id': wsId,
    });

    return this.http.post(
      `${API_CONFIG.baseUrl}/transactions/${transactionId}/decision`,
      {
        action,
        analyst_name: this.store.settings().analystName || 'Maya Lin',
        notes: notes || '',
      },
      { headers }
    );
  }

  private syncToGlobalStore(res: SimulateTransactionResponse): void {
    const t = res.transaction;
    const pred = res.model_prediction;

    // Convert to application Transaction model format for store compatibility
    const appTxn = {
      id: t.id,
      senderAccount: t.sender_account,
      senderName: t.sender_name,
      receiverAccount: t.recipient_account,
      receiverName: t.recipient_name,
      merchantCategory: 'Cross-Border Interbank',
      amount: t.amount,
      currency: t.currency,
      type: t.type as any,
      location: {
        city: t.sender_bank_name.includes('Aegis') ? 'New York' : 'Singapore',
        country: t.sender_bank_name.includes('Aegis') ? 'United States' : 'Singapore',
        countryCode: t.sender_bank_name.includes('Aegis') ? 'US' : 'SG',
        lat: 40.7128,
        lng: -74.006,
        region: 'North America',
      },
      destinationLocation: {
        city: t.receiver_bank_name.includes('Apex') ? 'Singapore' : 'London',
        country: t.receiver_bank_name.includes('Apex') ? 'Singapore' : 'United Kingdom',
        countryCode: t.receiver_bank_name.includes('Apex') ? 'SG' : 'GB',
        lat: 1.3521,
        lng: 103.8198,
        region: 'Southeast Asia',
      },
      device: {
        deviceId: 'DEV-SIM-PLAYGROUND',
        os: 'Simulated API Gateway',
        browser: 'HTTP/2 REST Switch',
        fingerprintHash: 'FNG-8841-SIM',
        isNewDevice: pred.risk_score >= 60,
        isEmulatorOrProxy: pred.risk_score >= 80,
      },
      ipAddress: '103.145.82.19',
      timestamp: t.created_at,
      prediction: {
        fraudProbability: pred.fraud_probability,
        riskScore: pred.risk_score,
        riskLevel: pred.risk_score >= 80 ? ('critical' as const) : pred.risk_score >= 60 ? ('high' as const) : pred.risk_score >= 30 ? ('medium' as const) : ('low' as const),
        modelDecision: res.decision === 'Blocked' ? ('BLOCK' as const) : res.decision === 'Flagged for Review' ? ('REVIEW' as const) : ('APPROVE' as const),
        latencyMs: pred.inference_latency_ms,
        modelVersion: pred.model_version,
      },
      status: (res.decision === 'Approved' ? 'approved' : res.decision === 'Blocked' ? 'blocked' : 'flagged') as any,
      explanation: {
        transactionId: t.id,
        summary: `Simulated transaction evaluated by DistilBERT: ${pred.prediction} (Score: ${pred.risk_score}/100, Decision: ${res.decision}). Behavioral sequence: "${pred.explanation_metadata.anonymized_sequence}".`,
        evidenceSummary: pred.explanation_metadata.risk_indicators,
        shapContributions: pred.explanation_metadata.top_risk_tokens.map((tok) => ({
          feature: tok.token,
          label: `Sequence Token [${tok.token}]`,
          value: `Impact weight ${tok.weight}`,
          contribution: tok.weight,
          direction: tok.impact === 'increases_risk' ? ('increases_risk' as const) : ('decreases_risk' as const),
        })),
        reasonCode: {
          code: pred.prediction === 'Fraudulent' ? 'RC-DISTILBERT-ANOMALY' : 'RC-NORMAL-SEQUENCE',
          headline: `DistilBERT Transformer Assessment: ${pred.prediction}`,
          narrative: `Sequence analysis indicates ${pred.explanation_metadata.risk_indicators.join('; ')}. Evaluated under research threshold ${pred.research_threshold}.`,
          riskIndicators: pred.explanation_metadata.risk_indicators,
          recommendedAction: res.decision === 'Blocked' ? 'Halt wire clearance immediately' : res.decision === 'Flagged for Review' ? 'Escalate to Tier 2 compliance investigator' : 'Clear for standard interbank settlement',
          confidence: +(pred.fraud_probability * 100).toFixed(1),
          generatedAt: pred.prediction_timestamp,
        },
        isMockExplanation: true as const,
      },
      isSimulated: true,
      simulationTag: 'PLAYGROUND',
      isNew: true,
    };

    this.store.prependTransactions([appTxn]);
  }
}
