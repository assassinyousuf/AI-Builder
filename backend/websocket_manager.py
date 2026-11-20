import json
import asyncio
from typing import Dict, Set, Any, Optional
from starlette.websockets import WebSocket, WebSocketDisconnect

class WebSocketConnectionManager:
    """
    Tenant-aware WebSocket connection manager.
    Enforces that events are only published to authorized bank channels.
    """

    def __init__(self):
        # Maps workspace_id -> set of active WebSockets
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.all_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket, workspace_id: Optional[str] = "WS-CENTRAL"):
        await websocket.accept()
        ws_id = workspace_id or "WS-CENTRAL"
        if ws_id not in self.active_connections:
            self.active_connections[ws_id] = set()
        self.active_connections[ws_id].add(websocket)
        self.all_connections.add(websocket)

        # Send initial connection ACK
        await websocket.send_text(json.dumps({
            "type": "connection.established",
            "workspace_id": ws_id,
            "message": f"Connected to FraudShield Real-Time Engine (Tenant: {ws_id})"
        }))

    def disconnect(self, websocket: WebSocket, workspace_id: Optional[str] = None):
        if websocket in self.all_connections:
            self.all_connections.remove(websocket)
        if workspace_id and workspace_id in self.active_connections:
            self.active_connections[workspace_id].discard(websocket)
        else:
            for ws_set in self.active_connections.values():
                ws_set.discard(websocket)

    async def broadcast_event(
        self,
        event_type: str,
        payload: Dict[str, Any],
        target_workspaces: Optional[list] = None
    ):
        """
        Broadcast a tenant-filtered event to authorized connections.
        """
        message = json.dumps({
            "type": event_type,
            "payload": payload,
            "timestamp": payload.get("timestamp") or payload.get("created_at") or payload.get("prediction_timestamp") or time_now()
        })

        tasks = []
        if target_workspaces:
            # Send to specified workspaces + Central Intel
            recipients = set()
            for ws in target_workspaces:
                recipients.update(self.active_connections.get(ws, set()))
            # Central always receives consortium intelligence
            recipients.update(self.active_connections.get("WS-CENTRAL", set()))

            for connection in list(recipients):
                tasks.append(self._safe_send(connection, message))
        else:
            # Broadcast to all
            for connection in list(self.all_connections):
                tasks.append(self._safe_send(connection, message))

        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

    async def _safe_send(self, websocket: WebSocket, message: str):
        try:
            await websocket.send_text(message)
        except Exception:
            self.disconnect(websocket)

def time_now():
    import time
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
