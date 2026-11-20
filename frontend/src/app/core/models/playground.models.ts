export interface BankTenant {
  id: string;
  workspace_id: string;
  name: string;
  code: string;
  country: string;
  currency: string;
  role: string;
  sharing_policy: string;
  logo_badge: string;
}

export interface SimulateTransactionPayload {
  reference?: string;
  sending_bank_id: string;
  receiving_bank_id: string;
  sender_account: string;
  sender_name?: string;
  recipient_account: string;
  recipient_name?: string;
  amount: number;
  currency: string;
  transaction_type: string;
  description?: string;
  behavioral_session_ref?: string;
  custom_sequence?: string;
}

export interface TokenAttribution {
  token: string;
  weight: number;
  impact: 'increases_risk' | 'decreases_risk' | 'neutral';
}

export interface DistilBertExplanationMetadata {
  anonymized_sequence: string;
  token_count: number;
  sample_tokens: string[];
  top_risk_tokens: TokenAttribution[];
  risk_indicators: string[];
  model_architecture: string;
  academic_paper: string;
}

export interface DistilBertModelPrediction {
  prediction: 'Fraudulent' | 'Legitimate';
  fraud_probability: number;
  risk_score: number;
  model_version: string;
  research_threshold: number;
  inference_latency_ms: number;
  prediction_timestamp: string;
  explanation_metadata: DistilBertExplanationMetadata;
}

export interface TransactionDecisionAudit {
  evaluated_at: string;
  policy_rules_evaluated?: string[];
  primary_rationale?: string;
  requires_human_review?: boolean;
  automated_policy?: boolean;
  analyst?: string;
  manual_action?: string;
  notes?: string;
}

export interface DecisionDetails {
  decision: 'Approved' | 'Flagged for Review' | 'Blocked' | 'Failed';
  reasons: string[];
  audit_log: TransactionDecisionAudit;
  requires_human_review: boolean;
}

export interface RealTimeFraudAlert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium';
  transaction_id: string;
  account_id: string;
  timestamp: string;
  initiating_bank_id: string;
  receiving_bank_id: string;
  authorized_bank_ids: string[];
  acknowledged: boolean;
}

export interface RealTimeCase {
  id: string;
  transaction_id: string;
  account_id: string;
  account_name: string;
  amount: number;
  risk_score: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  assigned_analyst: string;
  status: 'New' | 'Under Investigation' | 'Escalated' | 'Resolved';
  summary: string;
  created_at: string;
  associated_banks: string[];
}

export interface PlaygroundTransactionRecord {
  id: string;
  sender_bank_id: string;
  sender_bank_name: string;
  sender_bank_code: string;
  receiver_bank_id: string;
  receiver_bank_name: string;
  receiver_bank_code: string;
  sender_account: string;
  sender_name: string;
  recipient_account: string;
  recipient_name: string;
  amount: number;
  currency: string;
  type: string;
  description?: string;
  session_reference?: string;
  behavioral_sequence: string;
  created_at: string;
  status: 'Submitted' | 'Analyzing' | 'Approved' | 'Flagged for Review' | 'Blocked' | 'Failed';
  model_prediction: DistilBertModelPrediction;
  decision_details?: DecisionDetails;
  alert_id?: string;
  case_id?: string;
}

export interface SimulateTransactionResponse {
  success: boolean;
  transaction: PlaygroundTransactionRecord;
  model_prediction: DistilBertModelPrediction;
  decision: 'Approved' | 'Flagged for Review' | 'Blocked' | 'Failed';
  decision_details: DecisionDetails;
  alert?: RealTimeFraudAlert;
  case?: RealTimeCase;
}

export interface WebSocketEventMessage<T = any> {
  type:
    | 'connection.established'
    | 'transaction.created'
    | 'transaction.analyzed'
    | 'fraud.alert.created'
    | 'transaction.status.updated'
    | 'case.created';
  payload: T;
  timestamp?: string;
}
