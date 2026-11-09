"""
RAAHI In-Memory & Demo State Store
Pre-seeded for HERHACK 2026 Demonstration - Team ShaktiX
"""

from typing import Dict, List, Optional
from datetime import datetime, timezone, timedelta
from .models import (
    UserProfile,
    TrustedContact,
    ConsentRecord,
    Journey,
    Checkpoint,
    CheckpointStatus,
    JourneyStatus,
    EmergencyEvent,
    RelayDevice,
    EventStatus,
    TriggerType,
    LocationModel
)


class DataStore:
    def __init__(self):
        self.reset_to_demo_state()

    def reset_to_demo_state(self):
        # 1. User Profile (Team ShaktiX)
        self.user = UserProfile(
            id="USR-SHAKTIX-01",
            name="ShaktiX Member",
            phone="+91 98765 43210",
            email="shaktix@echelon.ac.in",
            institution="Echelon Institute of Technology, Faridabad",
            team="ShaktiX",
            blood_group="B+",
            emergency_notes="Student ID: EIT/2023/CS · Team ShaktiX · Daily Metro Commuter",
            consent=ConsentRecord(
                user_id="USR-SHAKTIX-01",
                consent_location_emergency=True,
                consent_ble_relay=True,
                consent_contacts_notify=True,
                no_continuous_audio_ack=True,
                no_public_tracking_ack=True,
                data_retention_days=7,
                signed_at=datetime.now(timezone.utc)
            )
        )

        # 2. Trusted Contacts (All equal members of Team ShaktiX & Campus Security)
        self.contacts: Dict[str, TrustedContact] = {
            "TC-1": TrustedContact(
                id="TC-1",
                user_id="USR-SHAKTIX-01",
                name="Priyal",
                phone="+91 98111 22233",
                relationship="Team ShaktiX",
                notify_sms=True,
                notify_push=True,
                is_opted_in=True,
                ack_status="idle"
            ),
            "TC-2": TrustedContact(
                id="TC-2",
                user_id="USR-SHAKTIX-01",
                name="Pavani",
                phone="+91 98222 33344",
                relationship="Team ShaktiX",
                notify_sms=True,
                notify_push=True,
                is_opted_in=True,
                ack_status="idle"
            ),
            "TC-3": TrustedContact(
                id="TC-3",
                user_id="USR-SHAKTIX-01",
                name="Ayushi Saxena",
                phone="+91 98765 43210",
                relationship="Team ShaktiX",
                notify_sms=True,
                notify_push=True,
                is_opted_in=True,
                ack_status="idle"
            ),
            "TC-4": TrustedContact(
                id="TC-4",
                user_id="USR-SHAKTIX-01",
                name="Campus Security Desk",
                phone="+91 129 240 1000",
                relationship="Echelon Institute Security",
                notify_sms=True,
                notify_push=True,
                is_opted_in=True,
                ack_status="idle"
            )
        }

        # 3. Active Journey & Checkpoints (Faridabad - Delhi Commute)
        now = datetime.now(timezone.utc)
        self.active_journey: Optional[Journey] = Journey(
            journey_id="JRN-2026-001",
            user_id="USR-SHAKTIX-AYUSHI",
            origin_name="Echelon Institute Campus, Faridabad",
            destination_name="Bata Chowk Metro Station",
            start_time=now - timedelta(minutes=12),
            expected_duration_minutes=35,
            check_in_interval_minutes=10,
            next_check_in_due=now + timedelta(minutes=8),
            status=JourneyStatus.ACTIVE,
            current_checkpoint_index=1,
            total_checkpoints=3,
            route_context="Sector 52 via Bypass Road (Known intermittent signal spot)",
            escalation_level=0
        )

        self.checkpoints: List[Checkpoint] = [
            Checkpoint(
                checkpoint_id="CHK-1",
                journey_id="JRN-2026-001",
                checkpoint_index=0,
                scheduled_time=now - timedelta(minutes=10),
                actual_time=now - timedelta(minutes=9, seconds=45),
                status=CheckpointStatus.CONFIRMED_SAFE,
                grace_period_seconds=60,
                response_note="Safe - Boarded auto-rickshaw at Campus Gate"
            ),
            Checkpoint(
                checkpoint_id="CHK-2",
                journey_id="JRN-2026-001",
                checkpoint_index=1,
                scheduled_time=now + timedelta(minutes=8),
                actual_time=None,
                status=CheckpointStatus.PENDING,
                grace_period_seconds=60,
                response_note=None
            ),
            Checkpoint(
                checkpoint_id="CHK-3",
                journey_id="JRN-2026-001",
                checkpoint_index=2,
                scheduled_time=now + timedelta(minutes=23),
                actual_time=None,
                status=CheckpointStatus.PENDING,
                grace_period_seconds=60,
                response_note=None
            )
        ]

        # 4. Simulation Relay Devices
        self.relay_devices: Dict[str, RelayDevice] = {
            "DEV-A": RelayDevice(
                device_id="DEV-A",
                device_name="Phone A (ShaktiX User - Offline)",
                is_opted_in=True,
                battery_level=78,
                ble_rssi=-42,
                internet_connected=False,
                last_seen=now
            ),
            "DEV-B": RelayDevice(
                device_id="DEV-B",
                device_name="Phone B (Nearby Relay Peer)",
                is_opted_in=True,
                battery_level=91,
                ble_rssi=-68,
                internet_connected=False,
                last_seen=now
            ),
            "DEV-C": RelayDevice(
                device_id="DEV-C",
                device_name="Phone C (Connected Hub Gateway)",
                is_opted_in=True,
                battery_level=64,
                ble_rssi=-74,
                internet_connected=True,
                last_seen=now
            ),
            "DEV-ESP32": RelayDevice(
                device_id="DEV-ESP32",
                device_name="ESP32 Campus Safety Relay Beacon",
                is_opted_in=True,
                battery_level=100,
                ble_rssi=-52,
                internet_connected=True,
                last_seen=now
            )
        }

        # 5. Emergency Events History
        self.emergency_events: Dict[str, EmergencyEvent] = {}

    def get_user(self) -> UserProfile:
        return self.user

    def update_consent(self, consent: ConsentRecord):
        self.user.consent = consent

    def get_contacts(self) -> List[TrustedContact]:
        return list(self.contacts.values())

    def add_contact(self, contact: TrustedContact) -> TrustedContact:
        self.contacts[contact.id] = contact
        return contact

    def remove_contact(self, contact_id: str) -> bool:
        if contact_id in self.contacts:
            del self.contacts[contact_id]
            return True
        return False

    def get_active_journey(self) -> Optional[Journey]:
        return self.active_journey

    def get_checkpoints(self) -> List[Checkpoint]:
        return self.checkpoints

    def create_emergency_event(self, event: EmergencyEvent) -> EmergencyEvent:
        self.emergency_events[event.event_id] = event
        return event

    def get_event(self, event_id: str) -> Optional[EmergencyEvent]:
        return self.emergency_events.get(event_id)

    def list_events(self) -> List[EmergencyEvent]:
        return sorted(
            list(self.emergency_events.values()),
            key=lambda e: e.initial_timestamp,
            reverse=True
        )


db = DataStore()
