import { Injectable, OnDestroy, inject, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { SessionService } from '../auth/services/session.service';
import { FraudStoreService } from '../state/fraud-store.service';
import {
  RealTimeFraudAlert,
  RealTimeCase,
  WebSocketEventMessage,
  PlaygroundTransactionRecord,
} from '../models/playground.models';

@Injectable({ providedIn: 'root' })
export class AlertRealtimeService implements OnDestroy {
  private readonly session = inject(SessionService);
  private readonly store = inject(FraudStoreService);

  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private isDestroyed = false;

  readonly isConnected = signal(false);
  readonly connectionStatus = signal<'connected' | 'connecting' | 'disconnected'>('disconnected');
  readonly lastAlert = signal<RealTimeFraudAlert | null>(null);
  readonly activeWorkspaceTenant = signal<string>('WS-901');

  // Event streams for subscribers
  readonly transactionCreated$ = new Subject<PlaygroundTransactionRecord>();
  readonly transactionAnalyzed$ = new Subject<{ transaction: PlaygroundTransactionRecord; decision: string }>();
  readonly alertCreated$ = new Subject<RealTimeFraudAlert>();
  readonly statusUpdated$ = new Subject<{ transaction_id: string; status: string; notes?: string }>();
  readonly caseCreated$ = new Subject<RealTimeCase>();

  constructor() {
    this.connect();
  }

  connect(): void {
    if (this.isDestroyed || typeof WebSocket === 'undefined') return;
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.connectionStatus.set('connecting');
    const wsId = this.session.activeWorkspaceId() || 'WS-901';
    this.activeWorkspaceTenant.set(wsId);
    const url = `${API_CONFIG.wsUrl}?workspace_id=${encodeURIComponent(wsId)}`;

    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.isConnected.set(true);
        this.connectionStatus.set('connected');
        this.startHeartbeat();
      };

      this.socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as WebSocketEventMessage;
          this.handleIncomingMessage(msg);
        } catch {
          // Non-JSON socket message
        }
      };

      this.socket.onclose = () => {
        this.cleanupSocket();
        this.scheduleReconnect();
      };

      this.socket.onerror = () => {
        this.cleanupSocket();
        this.scheduleReconnect();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  registerWorkspace(workspaceId: string): void {
    this.activeWorkspaceTenant.set(workspaceId);
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          type: 'register_workspace',
          workspace_id: workspaceId,
        })
      );
    } else {
      this.connect();
    }
  }

  private handleIncomingMessage(msg: WebSocketEventMessage): void {
    switch (msg.type) {
      case 'transaction.created': {
        const txn = msg.payload as PlaygroundTransactionRecord;
        this.transactionCreated$.next(txn);
        break;
      }

      case 'transaction.analyzed': {
        const data = msg.payload;
        this.transactionAnalyzed$.next(data);
        break;
      }

      case 'fraud.alert.created': {
        const alert = msg.payload as RealTimeFraudAlert;
        this.lastAlert.set(alert);
        this.alertCreated$.next(alert);

        // Synchronize with global store
        this.store.addAlert({
          title: alert.title,
          description: alert.description,
          severity: alert.severity,
          category: 'high_risk_txn',
          transactionId: alert.transaction_id,
          accountId: alert.account_id,
        });

        // Trigger notification and toast
        this.store.showToast(
          alert.title,
          alert.description,
          alert.severity === 'critical' ? 'critical' : 'warning'
        );
        break;
      }

      case 'case.created': {
        const c = msg.payload as RealTimeCase;
        this.caseCreated$.next(c);
        break;
      }

      case 'transaction.status.updated': {
        const update = msg.payload;
        this.statusUpdated$.next(update);
        this.store.showToast(
          `Transaction ${update.status}`,
          `Status updated for ${update.transaction_id}`,
          'info'
        );
        break;
      }
    }
  }

  private startHeartbeat(): void {
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.pingTimer = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000);
  }

  private scheduleReconnect(): void {
    if (this.isDestroyed || this.reconnectTimer) return;
    this.isConnected.set(false);
    this.connectionStatus.set('disconnected');

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, API_CONFIG.reconnectIntervalMs);
  }

  private cleanupSocket(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      this.socket = null;
    }
    this.isConnected.set(false);
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.cleanupSocket();
  }
}
