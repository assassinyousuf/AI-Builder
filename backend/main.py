import os
import json
import time
from typing import Dict, Any, List, Optional

from starlette.applications import Starlette
from starlette.routing import Route, WebSocketRoute
from starlette.requests import Request
from starlette.responses import JSONResponse, Response
from starlette.websockets import WebSocket, WebSocketDisconnect
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware

from model_adapter import DistilBertInferenceAdapter
from decision_engine import TransactionDecisionEngine
from tenant_manager import TenantManager, BANKS
from websocket_manager import WebSocketConnectionManager

# Core singletons
model_adapter = DistilBertInferenceAdapter()
decision_engine = TransactionDecisionEngine()
ws_manager = WebSocketConnectionManager()

# In-memory persistence stores
TRANSACTIONS_STORE: List[Dict[str, Any]] = []
ALERTS_STORE: List[Dict[str, Any]] = []
CASES_STORE: List[Dict[str, Any]] = []

# Preset Behavioral Sequences representing realistic API action chains
PRESET_BEHAVIORAL_SEQUENCES = {
    "standard_salary": (
        "POST /api/v1/auth/login "
        "GET /api/v1/accounts/balance "
        "GET /api/v1/beneficiaries/list "
        "POST /api/v1/transfers/prepare "
        "POST /api/v1/transfers/wire"
    ),
    "account_takeover": (
        "POST /api/v1/auth/password/reset "
        "POST /api/v1/auth/login "
        "GET /api/v1/accounts/balance "
        "POST /api/v1/beneficiaries/add "
        "POST /api/v1/transfers/wire "
        "POST /api/v1/transfers/wire"
    ),
    "headless_bot": (
        "POST /api/v1/auth/login headless_bot_signature "
        "GET /api/v1/accounts/balance proxy_jump "
        "POST /api/v1/beneficiaries/add "
        "POST /api/v1/transfers/wire"
    ),
    "velocity_probing": (
        "POST /api/v1/auth/mfa/fail "
        "POST /api/v1/auth/login "
        "GET /api/v1/accounts/balance "
        "GET /api/v1/accounts/balance "
        "GET /api/v1/accounts/balance "
        "POST /api/v1/cards/auth "
        "POST /api/v1/transfers/wire"
    )
}

async def health_check(request: Request):
    return JSONResponse({
        "status": "healthy",
        "service": "FraudShield Multi-Bank Intelligence Engine",
        "model_version": model_adapter.model_version,
        "research_threshold": model_adapter.research_threshold,
        "active_tenants": len(BANKS),
        "persisted_transactions": len(TRANSACTIONS_STORE)
    })

async def get_banks(request: Request):
    return JSONResponse({"banks": BANKS})

async def get_model_info(request: Request):
    return JSONResponse({
        "model_name": "Fine-Tuned DistilBERT Behavioral Transformer",
        "model_version": model_adapter.model_version,
        "research_threshold": model_adapter.research_threshold,
        "f1_score": model_adapter.f1_score,
        "roc_auc": model_adapter.roc_auc,
        "architecture": "DistilBertForSequenceClassification + Sigmoid Head (66M params, 250MB)",
        "input_domain": "Anonymized Banking API Action Sequences",
        "supported_sequences": list(PRESET_BEHAVIORAL_SEQUENCES.keys())
    })

async def simulate_transaction(request: Request):
    """
    Core 10-Step Transaction Processing Workflow:
    1. Generate unique reference.
    2. Validate request.
    3. Retrieve or construct model-compatible behavioral sequence.
    4. Pass sequence to DistilBERT inference adapter.
    5. Receive model prediction and explanation metadata.
    6. Persist transaction & prediction.
    7. Apply transaction decision policy.
    8. Create fraud alert and investigation case if suspicious.
    9. Publish tenant-aware WebSocket events.
    10. Return result to client.
    """
    try:
        req = await request.json()
    except Exception:
        return JSONResponse({"error": "Invalid JSON body"}, status_code=400)

    amount = float(req.get("amount", 0.0))
    if amount <= 0:
        return JSONResponse({"error": "Transaction amount must be strictly positive."}, status_code=400)

    # Step 1: Unique reference
    txn_ref = req.get("reference") or f"TXN-{int(time.time() * 1000) % 1000000:06d}"

    sending_bank_id = req.get("sending_bank_id", "BANK-AEGIS")
    receiving_bank_id = req.get("receiving_bank_id", "BANK-APEX")
    sending_bank = TenantManager.get_bank_by_id(sending_bank_id) or BANKS[0]
    receiving_bank = TenantManager.get_bank_by_id(receiving_bank_id) or BANKS[1]

    # Step 3: Construct model-compatible anonymized behavioral sequence
    session_ref = req.get("behavioral_session_ref", "SES-ANOMALOUS-TAKEOVER")
    custom_seq = req.get("custom_sequence")

    if custom_seq:
        behavioral_sequence = custom_seq
    elif session_ref and "normal" in session_ref.lower():
        behavioral_sequence = PRESET_BEHAVIORAL_SEQUENCES["standard_salary"]
    elif session_ref and "bot" in session_ref.lower():
        behavioral_sequence = PRESET_BEHAVIORAL_SEQUENCES["headless_bot"]
    elif session_ref and "velocity" in session_ref.lower():
        behavioral_sequence = PRESET_BEHAVIORAL_SEQUENCES["velocity_probing"]
    else:
        behavioral_sequence = PRESET_BEHAVIORAL_SEQUENCES["account_takeover"]

    # Step 4 & 5: DistilBERT Inference strictly over sequence
    model_prediction = model_adapter.predict(behavioral_sequence)

    # Step 6: Initial state object
    tx_type = req.get("transaction_type", "Wire Transfer")
    currency = req.get("currency", "USD")
    sender_account = req.get("sender_account", "ACC-AEGIS-90412")
    recipient_account = req.get("recipient_account", "ACC-APEX-44109")
    sender_name = req.get("sender_name", "Aarav Mehta")
    recipient_name = req.get("recipient_name", "Liam Chen")

    transaction_record = {
        "id": txn_ref,
        "sender_bank_id": sending_bank["id"],
        "sender_bank_name": sending_bank["name"],
        "sender_bank_code": sending_bank["code"],
        "receiver_bank_id": receiving_bank["id"],
        "receiver_bank_name": receiving_bank["name"],
        "receiver_bank_code": receiving_bank["code"],
        "sender_account": sender_account,
        "sender_name": sender_name,
        "recipient_account": recipient_account,
        "recipient_name": recipient_name,
        "amount": amount,
        "currency": currency,
        "type": tx_type,
        "description": req.get("description", "Cross-border commercial settlement"),
        "session_reference": session_ref,
        "behavioral_sequence": behavioral_sequence,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "model_prediction": model_prediction,
    }

    # Publish transaction.created event
    initiating_workspace = sending_bank["workspace_id"]
    receiving_workspace = receiving_bank["workspace_id"]
    await ws_manager.broadcast_event(
        "transaction.created",
        transaction_record,
        target_workspaces=[initiating_workspace, receiving_workspace]
    )

    # Step 7: Apply Transaction Decision Policy
    decision_result = decision_engine.evaluate_transaction(transaction_record, model_prediction)
    final_decision = decision_result["decision"]
    transaction_record["status"] = final_decision
    transaction_record["decision_details"] = decision_result

    # Step 8: Fraud Alert & Case Creation if high-risk or flagged
    created_alert = None
    created_case = None

    if model_prediction["prediction"] == "Fraudulent" or final_decision in ["Blocked", "Flagged for Review"]:
        alert_severity = "critical" if final_decision == "Blocked" else "high"
        alert_id = f"ALT-{int(time.time() * 1000) % 100000:05d}"

        # Tenant authorization for alert:
        authorized_banks = [sending_bank["id"]]
        if receiving_bank["sharing_policy"] in ["Full Consortium", "Bilateral Trusted"]:
            authorized_banks.append(receiving_bank["id"])

        created_alert = {
            "id": alert_id,
            "title": f"Fraud Alert: {final_decision.upper()} {tx_type} ({txn_ref})",
            "description": (
                f"DistilBERT classified behavioral sequence as {model_prediction['prediction']} "
                f"(Risk Score: {model_prediction['risk_score']}/100, Probability: {(model_prediction['fraud_probability']*100):.1f}%). "
                f"Amount: {currency} {amount:,.2f} from {sending_bank['name']} to {receiving_bank['name']}."
            ),
            "severity": alert_severity,
            "transaction_id": txn_ref,
            "account_id": sender_account,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "initiating_bank_id": sending_bank["id"],
            "receiving_bank_id": receiving_bank["id"],
            "authorized_bank_ids": authorized_banks,
            "acknowledged": False
        }
        ALERTS_STORE.insert(0, created_alert)

        # Create or link Case
        case_id = f"CASE-{int(time.time() * 1000) % 10000:04d}"
        created_case = {
            "id": case_id,
            "transaction_id": txn_ref,
            "account_id": sender_account,
            "account_name": sender_name,
            "amount": amount,
            "risk_score": model_prediction["risk_score"],
            "priority": "Critical" if alert_severity == "critical" else "High",
            "assigned_analyst": "Maya Lin",
            "status": "New",
            "summary": f"DistilBERT sequence anomaly detected on {sending_bank['name']} outbound transfer to {receiving_bank['name']}.",
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "associated_banks": [sending_bank["name"], receiving_bank["name"]]
        }
        CASES_STORE.insert(0, created_case)
        transaction_record["case_id"] = case_id
        transaction_record["alert_id"] = alert_id

    # Persist transaction
    TRANSACTIONS_STORE.insert(0, transaction_record)

    # Step 9: Publish tenant-aware WebSocket events
    await ws_manager.broadcast_event(
        "transaction.analyzed",
        {
            "transaction": transaction_record,
            "model_prediction": model_prediction,
            "decision": final_decision
        },
        target_workspaces=[initiating_workspace, receiving_workspace]
    )

    if created_alert:
        target_alert_workspaces = [initiating_workspace]
        if receiving_bank["id"] in created_alert["authorized_bank_ids"]:
            target_alert_workspaces.append(receiving_workspace)

        await ws_manager.broadcast_event(
            "fraud.alert.created",
            created_alert,
            target_workspaces=target_alert_workspaces
        )

    if created_case:
        await ws_manager.broadcast_event(
            "case.created",
            created_case,
            target_workspaces=[initiating_workspace, "WS-CENTRAL"]
        )

    # Step 10: Return response to frontend
    return JSONResponse({
        "success": True,
        "transaction": transaction_record,
        "model_prediction": model_prediction,
        "decision": final_decision,
        "decision_details": decision_result,
        "alert": created_alert,
        "case": created_case
    })

async def get_transactions(request: Request):
    workspace_id = request.headers.get("x-workspace-id")
    limit = int(request.query_params.get("limit", 50))
    filtered = [
        t for t in TRANSACTIONS_STORE
        if TenantManager.authorize_transaction_access(t, workspace_id)
    ]
    return JSONResponse({
        "workspace_id": workspace_id or "WS-CENTRAL",
        "total": len(filtered),
        "transactions": filtered[:limit]
    })

async def get_transaction_detail(request: Request):
    transaction_id = request.path_params.get("transaction_id")
    workspace_id = request.headers.get("x-workspace-id")
    for t in TRANSACTIONS_STORE:
        if t["id"] == transaction_id:
            if not TenantManager.authorize_transaction_access(t, workspace_id):
                return JSONResponse({"error": "Unauthorized: Bank workspace cannot access this transaction."}, status_code=403)
            return JSONResponse({"transaction": t})
    return JSONResponse({"error": "Transaction reference not found."}, status_code=404)

async def update_transaction_decision(request: Request):
    transaction_id = request.path_params.get("transaction_id")
    workspace_id = request.headers.get("x-workspace-id")
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"error": "Invalid JSON body"}, status_code=400)

    action = body.get("action")
    analyst_name = body.get("analyst_name", "Maya Lin")
    notes = body.get("notes", "")

    for t in TRANSACTIONS_STORE:
        if t["id"] == transaction_id:
            if not TenantManager.authorize_transaction_access(t, workspace_id):
                return JSONResponse({"error": "Unauthorized to modify this transaction."}, status_code=403)

            t["status"] = action
            t.setdefault("decision_details", {})["audit_log"] = {
                "evaluated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "analyst": analyst_name,
                "manual_action": action,
                "notes": notes,
                "automated_policy": False
            }

            initiating_ws = TenantManager.get_bank_by_id(t["sender_bank_id"])["workspace_id"]
            receiving_ws = TenantManager.get_bank_by_id(t["receiver_bank_id"])["workspace_id"]
            await ws_manager.broadcast_event(
                "transaction.status.updated",
                {"transaction_id": transaction_id, "status": action, "notes": notes},
                target_workspaces=[initiating_ws, receiving_ws]
            )

            return JSONResponse({"success": True, "transaction": t})
    return JSONResponse({"error": "Transaction reference not found."}, status_code=404)

async def get_alerts(request: Request):
    workspace_id = request.headers.get("x-workspace-id")
    filtered = [
        a for a in ALERTS_STORE
        if TenantManager.authorize_alert_access(a, workspace_id)
    ]
    return JSONResponse({
        "workspace_id": workspace_id or "WS-CENTRAL",
        "alerts": filtered
    })

async def get_cases(request: Request):
    workspace_id = request.headers.get("x-workspace-id")
    return JSONResponse({
        "workspace_id": workspace_id or "WS-CENTRAL",
        "cases": CASES_STORE
    })

async def websocket_route(websocket: WebSocket):
    workspace_id = websocket.query_params.get("workspace_id", "WS-CENTRAL")
    await ws_manager.connect(websocket, workspace_id)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong", "time": time.time()}))
                elif msg.get("type") == "register_workspace":
                    new_ws = msg.get("workspace_id")
                    if new_ws:
                        ws_manager.disconnect(websocket, workspace_id)
                        await ws_manager.connect(websocket, new_ws)
                        workspace_id = new_ws
            except Exception:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, workspace_id)

routes = [
    Route("/api/v1/health", health_check, methods=["GET"]),
    Route("/api/v1/banks", get_banks, methods=["GET"]),
    Route("/api/v1/model/info", get_model_info, methods=["GET"]),
    Route("/api/v1/transactions/simulate", simulate_transaction, methods=["POST"]),
    Route("/api/v1/transactions", simulate_transaction, methods=["POST"]),
    Route("/api/v1/transactions", get_transactions, methods=["GET"]),
    Route("/api/v1/transactions/{transaction_id}", get_transaction_detail, methods=["GET"]),
    Route("/api/v1/transactions/{transaction_id}/decision", update_transaction_decision, methods=["POST"]),
    Route("/api/v1/alerts", get_alerts, methods=["GET"]),
    Route("/api/v1/cases", get_cases, methods=["GET"]),
    WebSocketRoute("/ws", websocket_route)
]

middleware = [
    Middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
        allow_credentials=True,
    )
]

app = Starlette(routes=routes, middleware=middleware)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
