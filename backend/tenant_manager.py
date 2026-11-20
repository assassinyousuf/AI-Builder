from typing import Dict, Any, List, Optional

BANKS = [
    {
        "id": "BANK-AEGIS",
        "workspace_id": "WS-901",
        "name": "Aegis Capital Bank",
        "code": "AEGIS",
        "country": "United States",
        "currency": "USD",
        "role": "Tier 1 Settlement & Commercial Bank",
        "sharing_policy": "Full Consortium",
        "logo_badge": "bg-purple-500/20 text-purple-300 border-purple-500/30"
    },
    {
        "id": "BANK-APEX",
        "workspace_id": "WS-903",
        "name": "Apex Global Bank",
        "code": "APEX",
        "country": "Singapore",
        "currency": "SGD",
        "role": "Cross-Border Remittance & Liquidity Hub",
        "sharing_policy": "Bilateral Trusted",
        "logo_badge": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
    },
    {
        "id": "BANK-VANGUARD",
        "workspace_id": "WS-904",
        "name": "Vanguard International Bank",
        "code": "VANGUARD",
        "country": "United Kingdom",
        "currency": "GBP",
        "role": "European Commercial & Institutional Partner",
        "sharing_policy": "Strict Reciprocal",
        "logo_badge": "bg-blue-500/20 text-blue-300 border-blue-500/30"
    },
    {
        "id": "BANK-CENTRAL",
        "workspace_id": "WS-CENTRAL",
        "name": "Central Fraud Intelligence Network",
        "code": "CENTRAL",
        "country": "Global Consortium",
        "currency": "USD",
        "role": "Regulatory & Cross-Bank Consortium Oversight",
        "sharing_policy": "Global Intelligence Authority",
        "logo_badge": "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30"
    }
]

class TenantManager:
    """
    Enforces multi-tenant authorization rules on the backend.
    """

    @staticmethod
    def get_bank_by_id(bank_id: str) -> Optional[Dict[str, Any]]:
        for b in BANKS:
            if b["id"] == bank_id or b["code"] == bank_id:
                return b
        return None

    @staticmethod
    def get_bank_by_workspace(workspace_id: str) -> Optional[Dict[str, Any]]:
        for b in BANKS:
            if b["workspace_id"] == workspace_id:
                return b
        return None

    @staticmethod
    def is_central_workspace(workspace_id: Optional[str]) -> bool:
        return workspace_id in ["WS-CENTRAL", "WS-902", "CENTRAL", None]

    @staticmethod
    def authorize_transaction_access(transaction: Dict[str, Any], workspace_id: Optional[str]) -> bool:
        """
        Check if the requesting workspace is authorized to access the transaction.
        """
        if TenantManager.is_central_workspace(workspace_id):
            return True

        bank = TenantManager.get_bank_by_workspace(workspace_id or "")
        if not bank:
            # Default to Aegis (Bank A) if workspace is default WS-901
            return True

        bank_id = bank["id"]
        sender_bank_id = transaction.get("sender_bank_id")
        receiver_bank_id = transaction.get("receiver_bank_id")

        return bank_id in [sender_bank_id, receiver_bank_id]

    @staticmethod
    def authorize_alert_access(alert: Dict[str, Any], workspace_id: Optional[str]) -> bool:
        """
        Check if the requesting workspace is authorized to receive or view the alert.
        """
        if TenantManager.is_central_workspace(workspace_id):
            return True

        bank = TenantManager.get_bank_by_workspace(workspace_id or "")
        if not bank:
            return True

        target_banks = alert.get("authorized_bank_ids", [])
        return bank["id"] in target_banks
