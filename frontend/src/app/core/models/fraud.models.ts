export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type TransactionStatus = 'approved' | 'flagged' | 'blocked' | 'under_review';

export type TransactionType =
  | 'Wire Transfer'
  | 'Card Payment'
  | 'ACH Transfer'
  | 'Crypto Swap'
  | 'P2P Transfer'
  | 'International Remittance';

export interface ShapContribution {
  feature: string;
  label: string;
  value: string;
  contribution: number; // positive increases fraud risk, negative decreases risk
  direction: 'increases_risk' | 'decreases_risk';
}

export interface LlmReasonCode {
  code: string;
  headline: string;
  narrative: string;
  riskIndicators: string[];
  recommendedAction: string;
  confidence: number;
  generatedAt: string;
}

export interface RiskExplanation {
  transactionId: string;
  summary: string;
  evidenceSummary: string[];
  shapContributions: ShapContribution[];
  reasonCode: LlmReasonCode;
  isMockExplanation: true;
}

export interface FraudPrediction {
  fraudProbability: number; // 0..1
  riskScore: number; // 0..100
  riskLevel: RiskLevel;
  modelDecision: 'APPROVE' | 'REVIEW' | 'BLOCK';
  latencyMs: number;
  modelVersion: string;
}

export interface GeoCoordinate {
  city: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  region: string;
}

export interface DeviceInfo {
  deviceId: string;
  os: string;
  browser: string;
  fingerprintHash: string;
  isNewDevice: boolean;
  isEmulatorOrProxy: boolean;
}

export interface Transaction {
  id: string;
  senderAccount: string;
  senderName: string;
  receiverAccount: string;
  receiverName: string;
  merchantName?: string;
  merchantCategory: string;
  amount: number;
  currency: string;
  type: TransactionType;
  location: GeoCoordinate;
  destinationLocation?: GeoCoordinate;
  device: DeviceInfo;
  ipAddress: string;
  timestamp: string;
  prediction: FraudPrediction;
  status: TransactionStatus;
  explanation: RiskExplanation;
  isSimulated?: boolean;
  simulationTag?: string;
  isNew?: boolean;
}

export type AlertSeverity = 'critical' | 'high' | 'medium';
export type AlertCategory = 'high_risk_txn' | 'account_cluster' | 'impossible_travel' | 'attack_sim' | 'drift';

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  category: AlertCategory;
  transactionId?: string;
  accountId?: string;
  timestamp: string;
  acknowledged: boolean;
  isSimulated?: boolean;
}

export type CaseStatus =
  | 'New'
  | 'Under Investigation'
  | 'Escalated'
  | 'Resolved'
  | 'False Positive';

export type CasePriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface CaseNote {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

export interface AnalystDecision {
  id: string;
  caseId?: string;
  transactionId: string;
  action: 'Approve' | 'Block' | 'Escalate' | 'Mark False Positive' | 'Close Case' | 'Investigate';
  analyst: string;
  note?: string;
  timestamp: string;
}

export interface CaseTimelineEvent {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  actor: string;
}

export interface FraudCase {
  id: string;
  transactionId: string;
  accountId: string;
  accountName: string;
  amount: number;
  riskScore: number;
  priority: CasePriority;
  assignedAnalyst: string;
  status: CaseStatus;
  createdAt: string;
  updatedAt: string;
  summary: string;
  associatedTransactionIds: string[];
  connectedNodeIds: string[];
  notes: CaseNote[];
  timeline: CaseTimelineEvent[];
  decisions: AnalystDecision[];
  isSimulated?: boolean;
}

export interface Account {
  id: string;
  holderName: string;
  country: string;
  riskScore: number;
  accountAgeDays: number;
  avgTransactionAmount: number;
  status: 'Active' | 'Flagged' | 'Frozen';
}

export interface Device {
  id: string;
  label: string;
  os: string;
  linkedAccounts: number;
  riskFlag: boolean;
}

export interface Merchant {
  id: string;
  name: string;
  category: string;
  country: string;
  chargebackRate: number;
}

export type GraphNodeType = 'normal_account' | 'suspicious_account' | 'device' | 'merchant' | 'customer';
export type GraphEdgeType = 'TRANSFERRED_TO' | 'USED_DEVICE' | 'CONNECTED_TO' | 'PAID_MERCHANT';

export interface GraphNode {
  id: string;
  label: string;
  type: GraphNodeType;
  riskScore: number;
  clusterId: string;
  connections: number;
  investigationStatus: 'Clear' | 'Monitoring' | 'Investigating' | 'Flagged';
  relatedTransactions: string[];
  associatedDevices: string[];
  metadata?: Record<string, string | number>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: GraphEdgeType;
  amount?: number;
  suspicious?: boolean;
  clusterId?: string;
}

export interface SimulationEvent {
  id: string;
  step: number;
  title: string;
  detail: string;
  transactionId?: string;
  riskScore?: number;
  timestamp: string;
}

export interface SimulationScenario {
  id: 'card_testing' | 'account_takeover' | 'money_laundering';
  name: string;
  subtitle: string;
  description: string;
  indicators: string[];
  totalSteps: number;
  estimatedDurationSec: number;
}

export interface EvaluationSample {
  id: string;
  actualFraud: boolean;
  probability: number; // 0..1
  amount: number;
}

export interface ModelMetrics {
  modelName: string;
  modelType: string;
  version: string;
  dataset: string;
  lastUpdated: string;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  prAuc: number;
  confusionMatrix: {
    tp: number;
    fp: number;
    tn: number;
    fn: number;
  };
}

export interface ArtifactModelBenchmark {
  group: 'Text / Sequence Models' | 'User Behavioral / Hybrid Models';
  name: string;
  threshold?: number;
  f1: number;
  rocAuc: number;
  f05?: number;
  f2?: number;
}

export type DriftStatus = 'Stable' | 'Warning' | 'Drift Detected';

export interface DriftMetrics {
  status: DriftStatus;
  overallPsi: number;
  lastChecked: string;
  retrainRecommended: boolean;
  features: {
    name: string;
    psi: number;
    baselineMean: number;
    currentMean: number;
    status: DriftStatus;
  }[];
  timeline: {
    date: string;
    psi: number;
    auc: number;
  }[];
}

export interface FederatedBankState {
  id: string;
  name: string;
  region: string;
  localSamples: number;
  localAuc: number;
  progress: number; // 0..100
  stage: 'idle' | 'local_training' | 'uploading_gradients' | 'aggregating' | 'synced';
  color: string;
}

export interface ActivityItem {
  id: string;
  type: 'decision' | 'investigation' | 'system' | 'simulation';
  title: string;
  detail: string;
  actor: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  timestamp: string;
  read: boolean;
  route?: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'critical' | 'info';
}

export interface GeoLocationStat {
  country: string;
  countryCode: string;
  city: string;
  lat: number;
  lng: number;
  totalTransactions: number;
  fraudCount: number;
  avgRiskScore: number;
  exposureAmount: number;
}

export interface GeoRoute {
  id: string;
  from: GeoCoordinate;
  to: GeoCoordinate;
  amount: number;
  riskScore: number;
  transactionId: string;
  impossibleTravel: boolean;
}
