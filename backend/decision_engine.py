import time
from typing import Dict, Any, List

class TransactionDecisionEngine:
    """
    Applies configurable transaction decision policies.
    Provides clear distinction between raw model prediction (probabilistic score)
    and the final regulatory/bank transaction decision.
    """

    def __init__(self):
        # Configurable thresholds
        self.auto_block_threshold = 80
        self.review_threshold = 45
        self.high_amount_review_threshold = 10000.0

    def evaluate_transaction(
        self,
        transaction_data: Dict[str, Any],
        model_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Evaluate transaction against policy rules.
        """
        risk_score = model_result.get("risk_score", 0)
        fraud_prob = model_result.get("fraud_probability", 0.0)
        amount = float(transaction_data.get("amount", 0.0))
        tx_type = transaction_data.get("type", "Wire Transfer")

        reasons: List[str] = []
        requires_human_review = False
        decision_status = "Approved"

        # Rule 1: Critical model prediction triggers automated block
        if risk_score >= self.auto_block_threshold or fraud_prob >= 0.80:
            decision_status = "Blocked"
            reasons.append(
                f"DistilBERT sequence anomaly score ({risk_score}/100) exceeded auto-block cutoff ({self.auto_block_threshold})"
            )
        # Rule 2: Elevated risk or anomalous sequence warrants manual review
        elif risk_score >= self.review_threshold:
            decision_status = "Flagged for Review"
            requires_human_review = True
            reasons.append(
                f"Elevated behavioral risk score ({risk_score}/100) requires compliance analyst sign-off"
            )
        # Rule 3: High-value transaction policy override
        elif amount >= self.high_amount_review_threshold and tx_type in ["Wire Transfer", "Crypto Swap", "International Remittance"]:
            decision_status = "Flagged for Review"
            requires_human_review = True
            reasons.append(
                f"High-value cross-border threshold (${amount:,.2f} >= ${self.high_amount_review_threshold:,.2f}) triggered secondary verification"
            )
        else:
            decision_status = "Approved"
            reasons.append("Behavioral sequence and transaction parameters within normal operational baseline")

        # Create audit entry
        audit_log = {
            "evaluated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "policy_rules_evaluated": [
                "RL-01: DistilBERT High-Confidence Anomaly Filter",
                "RL-02: Behavioral Sequence Velocity & Transition Check",
                "RL-03: Cross-Border Value Threshold Filter"
            ],
            "primary_rationale": reasons[0] if reasons else "Standard clearance",
            "requires_human_review": requires_human_review,
            "automated_policy": True
        }

        return {
            "decision": decision_status,
            "reasons": reasons,
            "audit_log": audit_log,
            "requires_human_review": requires_human_review
        }
