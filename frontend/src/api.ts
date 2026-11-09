/**
 * RAAHI API Client & Offline Fallback Cache
 * Automatically synchronizes with Python FastAPI backend,
 * with seamless in-browser offline fallback for demonstrations.
 */

import {
  UserProfile,
  TrustedContact,
  ConsentRecord,
  Journey,
  Checkpoint,
  EmergencyEvent,
  RelayDevice,
  RelayPacket,
  EscalationAssessment,
} from './types';

const API_BASE = 'http://localhost:8000/api';

// Initial local state fallback
const DEFAULT_USER: UserProfile = {
  id: 'USR-SHAKTIX-01',
  name: 'ShaktiX User',
  phone: '+91 98765 43210',
  email: 'shaktix@echelon.ac.in',
  institution: 'Echelon Institute of Technology, Faridabad',
  team: 'ShaktiX',
  blood_group: 'B+',
  emergency_notes: 'Transit Route: Campus to Bata Chowk Metro · Team ShaktiX',
  consent: {
    user_id: 'USR-SHAKTIX-01',
    consent_location_emergency: true,
    consent_ble_relay: true,
    consent_contacts_notify: true,
    no_continuous_audio_ack: true,
    no_public_tracking_ack: true,
    data_retention_days: 7,
    signed_at: new Date().toISOString(),
  },
};

const DEFAULT_CONTACTS: TrustedContact[] = [
  {
    id: 'TC-1',
    user_id: 'USR-SHAKTIX-01',
    name: 'Priyal',
    phone: '+91 98111 22233',
    relationship: 'Team ShaktiX',
    notify_sms: true,
    notify_push: true,
    is_opted_in: true,
    ack_status: 'idle',
  },
  {
    id: 'TC-2',
    user_id: 'USR-SHAKTIX-01',
    name: 'Pavani',
    phone: '+91 98222 33344',
    relationship: 'Team ShaktiX',
    notify_sms: true,
    notify_push: true,
    is_opted_in: true,
    ack_status: 'idle',
  },
  {
    id: 'TC-3',
    user_id: 'USR-SHAKTIX-01',
    name: 'Ayushi Saxena',
    phone: '+91 98765 43210',
    relationship: 'Team ShaktiX',
    notify_sms: true,
    notify_push: true,
    is_opted_in: true,
    ack_status: 'idle',
  },
  {
    id: 'TC-4',
    user_id: 'USR-SHAKTIX-01',
    name: 'Campus Security Desk',
    phone: '+91 129 240 1000',
    relationship: 'Echelon Institute Security Desk',
    notify_sms: true,
    notify_push: true,
    is_opted_in: true,
    ack_status: 'idle',
  },
];

export const api = {
  // Check backend health
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/dashboard/overview`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Auth & Profile
  async getProfile(): Promise<UserProfile> {
    try {
      const res = await fetch(`${API_BASE}/auth/profile`);
      if (res.ok) return await res.json();
    } catch {}
    return DEFAULT_USER;
  },

  async updateConsent(consent: ConsentRecord): Promise<ConsentRecord> {
    try {
      const res = await fetch(`${API_BASE}/auth/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consent),
      });
      if (res.ok) return await res.json();
    } catch {}
    return consent;
  },

  // Contacts
  async getContacts(): Promise<TrustedContact[]> {
    try {
      const res = await fetch(`${API_BASE}/contacts`);
      if (res.ok) return await res.json();
    } catch {}
    return DEFAULT_CONTACTS;
  },

  async addContact(contact: Partial<TrustedContact>): Promise<TrustedContact> {
    try {
      const res = await fetch(`${API_BASE}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
      });
      if (res.ok) return await res.json();
    } catch {}
    const newC: TrustedContact = {
      id: `TC-${Date.now().toString().slice(-4)}`,
      user_id: DEFAULT_USER.id,
      name: contact.name || 'New Contact',
      phone: contact.phone || '',
      relationship: contact.relationship || 'Friend',
      notify_sms: true,
      notify_push: true,
      is_opted_in: true,
      ack_status: 'idle',
    };
    return newC;
  },

  async deleteContact(contactId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/contacts/${contactId}`, {
        method: 'DELETE',
      });
      if (res.ok) return true;
    } catch {}
    return true;
  },

  // Emergency SOS
  async triggerEmergency(payload: {
    trigger_type: string;
    ttl_minutes?: number;
    location?: any;
    is_simulated?: boolean;
  }): Promise<EmergencyEvent> {
    try {
      const res = await fetch(`${API_BASE}/emergency/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
    } catch {}

    const now = new Date().toISOString();
    return {
      event_id: `RAAHI-EVT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      user_id: DEFAULT_USER.id,
      user_name: DEFAULT_USER.name,
      status: 'broadcasting',
      trigger_type: payload.trigger_type as any,
      initial_timestamp: now,
      last_updated: now,
      ttl_minutes: payload.ttl_minutes || 15,
      location: payload.location || {
        latitude: 28.3845,
        longitude: 77.3126,
        location_name: 'Faridabad Campus Transit Route',
        consent_granted: true,
        captured_at: now,
      },
      hop_count: 0,
      relay_path: ['Phone A (ShaktiX User - Offline Broadcast)'],
      signature: 'HMAC_SHA256_LOCAL_VERIFIED',
      is_simulated: payload.is_simulated || false,
    };
  },

  async getEvents(): Promise<EmergencyEvent[]> {
    try {
      const res = await fetch(`${API_BASE}/emergency/events`);
      if (res.ok) return await res.json();
    } catch {}
    return [];
  },

  async acknowledgeEmergency(
    eventId: string,
    contactName: string,
    notes?: string
  ): Promise<EmergencyEvent | null> {
    try {
      const res = await fetch(`${API_BASE}/emergency/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          contact_name: contactName,
          notes: notes || 'Help dispatched.',
        }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async cancelEmergency(eventId: string): Promise<EmergencyEvent | null> {
    try {
      const res = await fetch(`${API_BASE}/emergency/cancel/${eventId}`, {
        method: 'POST',
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  // Safe Journey
  async getActiveJourney(): Promise<{ journey: Journey | null; checkpoints: Checkpoint[] }> {
    try {
      const res = await fetch(`${API_BASE}/journey/active`);
      if (res.ok) return await res.json();
    } catch {}
    const now = new Date();
    return {
      journey: {
        journey_id: 'JRN-2026-001',
        user_id: DEFAULT_USER.id,
        origin_name: 'Echelon Institute Campus',
        destination_name: 'Bata Chowk Metro Station',
        start_time: new Date(now.getTime() - 10 * 60000).toISOString(),
        expected_duration_minutes: 35,
        check_in_interval_minutes: 10,
        next_check_in_due: new Date(now.getTime() + 8 * 60000).toISOString(),
        status: 'active',
        current_checkpoint_index: 1,
        total_checkpoints: 3,
        route_context: 'Sector 52 via Bypass Road',
        escalation_level: 0,
      },
      checkpoints: [
        {
          checkpoint_id: 'CHK-1',
          journey_id: 'JRN-2026-001',
          checkpoint_index: 0,
          scheduled_time: new Date(now.getTime() - 10 * 60000).toISOString(),
          actual_time: new Date(now.getTime() - 9.5 * 60000).toISOString(),
          status: 'confirmed_safe',
          grace_period_seconds: 60,
          response_note: 'Safe - Boarded auto',
        },
        {
          checkpoint_id: 'CHK-2',
          journey_id: 'JRN-2026-001',
          checkpoint_index: 1,
          scheduled_time: new Date(now.getTime() + 8 * 60000).toISOString(),
          status: 'pending',
          grace_period_seconds: 60,
        },
        {
          checkpoint_id: 'CHK-3',
          journey_id: 'JRN-2026-001',
          checkpoint_index: 2,
          scheduled_time: new Date(now.getTime() + 23 * 60000).toISOString(),
          status: 'pending',
          grace_period_seconds: 60,
        },
      ],
    };
  },

  async confirmCheckIn(note?: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/journey/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note || 'Safe' }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { status: 'success', message: 'Check-in confirmed safe.' };
  },

  async simulateJourneyEscalation(level: number, connectivityLost: boolean): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/journey/escalate-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escalation_level: level,
          connectivity_lost: connectivityLost,
        }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return {
      escalation_level: level,
      journey_status: level >= 2 ? 'escalated' : 'active',
      assessment: {
        risk_score: level === 1 ? 25 : level === 2 ? 65 : 95,
        risk_level: level === 1 ? 'MODERATE' : level === 2 ? 'HIGH' : 'CRITICAL',
        missed_checkpoints_count: level >= 2 ? 1 : 0,
        connectivity_lost: connectivityLost,
        distress_signal_received: false,
        route_deviation_confirmed: false,
        reasons: [
          'User did not confirm 1 scheduled checkpoint prompt within 60s grace period.',
          connectivityLost ? 'Network cellular offline during transit.' : 'Cellular active.',
        ],
        recommended_action:
          level >= 2
            ? 'Notify Trusted Circle and activate offline BLE beacon relay.'
            : 'Audible prompt active.',
        safety_disclaimer:
          'RAAHI deterministic escalation. A missed check-in indicates unconfirmed status, not proof of an attack.',
      },
    };
  },

  async startJourney(payload: {
    origin_name: string;
    destination_name: string;
    duration_minutes: number;
    interval_minutes: number;
  }): Promise<Journey> {
    try {
      const res = await fetch(`${API_BASE}/journey/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin_name: payload.origin_name,
          destination_name: payload.destination_name,
          expected_duration_minutes: payload.duration_minutes,
          check_in_interval_minutes: payload.interval_minutes,
        }),
      });
      if (res.ok) return await res.json();
    } catch {}
    const now = new Date();
    return {
      journey_id: `JRN-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      user_id: DEFAULT_USER.id,
      origin_name: payload.origin_name,
      destination_name: payload.destination_name,
      start_time: now.toISOString(),
      expected_duration_minutes: payload.duration_minutes,
      check_in_interval_minutes: payload.interval_minutes,
      next_check_in_due: new Date(now.getTime() + payload.interval_minutes * 60000).toISOString(),
      status: 'active',
      current_checkpoint_index: 0,
      total_checkpoints: Math.max(1, Math.floor(payload.duration_minutes / payload.interval_minutes)),
      escalation_level: 0,
    };
  },

  async endJourney(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/journey/end`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {}
    return { status: 'completed' };
  },

  // Relay & Simulation
  async getRelayDevices(): Promise<RelayDevice[]> {
    try {
      const res = await fetch(`${API_BASE}/relay/devices`);
      if (res.ok) return await res.json();
    } catch {}
    return [
      {
        device_id: 'DEV-A',
        device_name: 'Phone A (ShaktiX User - Offline)',
        is_opted_in: true,
        battery_level: 78,
        ble_rssi: -42,
        internet_connected: false,
        last_seen: new Date().toISOString(),
      },
      {
        device_id: 'DEV-B',
        device_name: 'Phone B (Nearby Relay Peer)',
        is_opted_in: true,
        battery_level: 91,
        ble_rssi: -68,
        internet_connected: false,
        last_seen: new Date().toISOString(),
      },
      {
        device_id: 'DEV-C',
        device_name: 'Phone C (Connected Hub Gateway)',
        is_opted_in: true,
        battery_level: 64,
        ble_rssi: -74,
        internet_connected: true,
        last_seen: new Date().toISOString(),
      },
      {
        device_id: 'DEV-ESP32',
        device_name: 'ESP32 Campus Safety Relay Beacon',
        is_opted_in: true,
        battery_level: 100,
        ble_rssi: -52,
        internet_connected: true,
        last_seen: new Date().toISOString(),
      },
    ];
  },

  async simulateHop(eventId: string, step: number): Promise<EmergencyEvent | null> {
    try {
      const res = await fetch(`${API_BASE}/relay/simulate-hop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, step }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async getDashboardOverview(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/dashboard/overview`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async resetDemo(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/dashboard/reset-demo`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {}
    return { status: 'success' };
  },
};
