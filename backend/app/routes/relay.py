"""
RAAHI BLE Relay & Packet Synchronization Routes
"""

from typing import List, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from ..database import db
from ..models import (
    RelayPacket,
    RelayDevice,
    EmergencyEvent,
    EventStatus
)
from ..packet_engine import packet_engine

router = APIRouter(prefix="/api/relay", tags=["BLE Relay"])


@router.get("/devices", response_model=List[RelayDevice])
def list_relay_devices():
    return list(db.relay_devices.values())


@router.post("/device/{device_id}/toggle-net")
def toggle_device_network(device_id: str):
    dev = db.relay_devices.get(device_id)
    if not dev:
        raise HTTPException(status_code=404, detail="Relay device not found")
    dev.internet_connected = not dev.internet_connected
    return {"device_id": dev.device_id, "internet_connected": dev.internet_connected}


@router.post("/receive-packet")
def receive_relayed_packet(packet: RelayPacket, forwarder_device_id: str = "DEV-C"):
    """
    Called when an opted-in device (or an ESP32 hub / internet phone)
    relays an emergency packet into the RAAHI backend.
    """
    dev = db.relay_devices.get(forwarder_device_id)
    forwarder_name = dev.device_name if dev else f"Node {forwarder_device_id}"

    # 1. Packet validation & deduplication
    is_valid, reason = packet_engine.validate_packet(packet)
    if not is_valid:
        raise HTTPException(status_code=400, detail=reason)

    # 2. Process relay hop
    success, msg, relayed_pkt = packet_engine.process_incoming_relay(
        packet,
        relaying_device_id=forwarder_device_id,
        relaying_device_name=forwarder_name
    )
    if not success:
        raise HTTPException(status_code=400, detail=msg)

    # 3. Synchronize with EmergencyEvent in database
    event = db.get_event(packet.event_id)
    now_utc = datetime.now(timezone.utc)

    if not event:
        # Create event if it originated completely offline without prior cloud record
        event = EmergencyEvent(
            event_id=packet.event_id,
            user_id=packet.sender_user_id,
            user_name=packet.sender_name,
            status=EventStatus.DELIVERED,
            trigger_type=packet.trigger_type,
            initial_timestamp=packet.timestamp_utc,
            last_updated=now_utc,
            ttl_minutes=packet.ttl_minutes,
            location=packet.location,
            journey_context=packet.journey_context,
            hop_count=relayed_pkt.hop_count,
            relay_path=relayed_pkt.relay_nodes,
            signature=packet.signature,
            is_simulated=False
        )
        db.create_emergency_event(event)
    else:
        event.status = EventStatus.DELIVERED
        event.hop_count = relayed_pkt.hop_count
        event.relay_path = relayed_pkt.relay_nodes
        event.last_updated = now_utc

    return {
        "status": "success",
        "message": "Emergency packet accepted, validated and delivered to safety network.",
        "event_id": event.event_id,
        "hop_count": event.hop_count,
        "relay_path": event.relay_path,
        "delivery_status": event.status
    }


@router.post("/simulate-hop")
def simulate_multi_hop_step(payload: dict):
    """
    Hackathon Demonstration Helper:
    Simulates:
    Step 1: Phone A (Offline) -> emits packet
    Step 2: Phone B (Nearby Opted-in Relay) -> captures BLE & re-broadcasts (hop 1)
    Step 3: Phone C / ESP32 (Connected) -> receives BLE & uploads to backend (hop 2 -> Delivered)
    """
    event_id = payload.get("event_id")
    step = payload.get("step", 1)  # 1, 2, or 3
    event = db.get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    now = datetime.now(timezone.utc)

    if step == 1:
        event.status = EventStatus.BROADCASTING
        event.relay_path = ["Phone A (ShaktiX User - Offline BLE)"]
        event.hop_count = 0
    elif step == 2:
        event.status = EventStatus.RELAYED
        event.hop_count = 1
        if "Phone B (Nearby Relay Peer)" not in event.relay_path:
            event.relay_path.append("Phone B (Nearby Relay Peer)")
    elif step == 3:
        event.status = EventStatus.DELIVERED
        event.hop_count = 2
        if "Phone C (Connected Hub Gateway)" not in event.relay_path:
            event.relay_path.append("Phone C (Connected Hub Gateway -> Cloud Forwarder)")
    
    event.last_updated = now
    return event


@router.get("/audit-log")
def get_relay_audit_log():
    return packet_engine.relay_audit_log
