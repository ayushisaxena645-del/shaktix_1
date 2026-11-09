"""
RAAHI Admin & Response Dashboard Telemetry Routes
"""

from fastapi import APIRouter
from datetime import datetime, timezone
from ..database import db
from ..packet_engine import packet_engine

router = APIRouter(prefix="/api/dashboard", tags=["Admin & Response Dashboard"])


@router.get("/overview")
def get_dashboard_overview():
    events = db.list_events()
    devices = list(db.relay_devices.values())
    journey = db.get_active_journey()

    active_emergencies = [e for e in events if e.status not in ["acknowledged", "cancelled"]]
    acknowledged_emergencies = [e for e in events if e.status == "acknowledged"]

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "team_info": {
            "name": "Team ShaktiX",
            "members": ["Priyal", "Pavani", "Ayushi Saxena"],
            "institution": "Echelon Institute of Technology, Faridabad",
            "event": "HERHACK 2026",
            "tagline": "When the network fails, your safety network doesn't."
        },
        "stats": {
            "total_emergency_events": len(events),
            "active_emergencies_count": len(active_emergencies),
            "acknowledged_count": len(acknowledged_emergencies),
            "relay_devices_online": sum(1 for d in devices if d.internet_connected),
            "relay_nodes_total": len(devices),
            "safe_journey_active": journey.status == "active" if journey else False
        },
        "recent_events": events[:10],
        "relay_devices": devices,
        "relay_audit_log": packet_engine.relay_audit_log[-15:]
    }


@router.post("/reset-demo")
def reset_demo_state():
    db.reset_to_demo_state()
    packet_engine.seen_packet_ids.clear()
    packet_engine.seen_event_ids.clear()
    packet_engine.relay_audit_log.clear()
    return {"status": "success", "message": "Demo state cleanly reset for HERHACK 2026 judging."}
