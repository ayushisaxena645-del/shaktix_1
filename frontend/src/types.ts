export type EventStatus =
  | 'created'
  | 'broadcasting'
  | 'relayed'
  | 'delivered'
  | 'acknowledged'
  | 'cancelled';

export type TriggerType =
  | 'sos_button'
  | 'discreet_cadence'
  | 'missed_checkpoint_escalation'
  | 'fall_or_impact';

export type JourneyStatus = 'active' | 'completed' | 'escalated' | 'cancelled';

export type CheckpointStatus =
  | 'pending'
  | 'confirmed_safe'
  | 'missed'
  | 'grace_period'
  | 'escalated';

export interface LocationModel {
  latitude: float;
  longitude: float;
  accuracy_meters?: number;
  location_name?: string;
  consent_granted: boolean;
  captured_at: string;
}

export type float = number;

export interface ConsentRecord {
  user_id: string;
  consent_location_emergency: boolean;
  consent_ble_relay: boolean;
  consent_contacts_notify: boolean;
  no_continuous_audio_ack: boolean;
  no_public_tracking_ack: boolean;
  data_retention_days: number;
  signed_at: string;
}

export interface TrustedContact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  relationship: string;
  notify_sms: boolean;
  notify_push: boolean;
  is_opted_in: boolean;
  ack_status?: 'idle' | 'delivered' | 'acknowledged';
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  institution: string;
  team: string;
  blood_group?: string;
  emergency_notes?: string;
  consent?: ConsentRecord;
}

export interface Checkpoint {
  checkpoint_id: string;
  journey_id: string;
  checkpoint_index: number;
  scheduled_time: string;
  actual_time?: string | null;
  status: CheckpointStatus;
  grace_period_seconds: number;
  response_note?: string | null;
}

export interface Journey {
  journey_id: string;
  user_id: string;
  origin_name: string;
  destination_name: string;
  start_time: string;
  expected_duration_minutes: number;
  check_in_interval_minutes: number;
  next_check_in_due: string;
  status: JourneyStatus;
  current_checkpoint_index: number;
  total_checkpoints: number;
  route_context?: string;
  escalation_level: number;
}

export interface RelayDevice {
  device_id: string;
  device_name: string;
  is_opted_in: boolean;
  battery_level: number;
  ble_rssi: number;
  internet_connected: boolean;
  last_seen: string;
}

export interface RelayPacket {
  packet_id: string;
  event_id: string;
  sender_user_id: string;
  sender_name: string;
  timestamp_utc: string;
  ttl_minutes: number;
  hop_count: number;
  max_hops: number;
  location?: LocationModel | null;
  trigger_type: TriggerType;
  journey_context?: string | null;
  payload_hash: string;
  signature: string;
  relay_nodes: string[];
}

export interface EmergencyEvent {
  event_id: string;
  user_id: string;
  user_name: string;
  status: EventStatus;
  trigger_type: TriggerType;
  initial_timestamp: string;
  last_updated: string;
  ttl_minutes: number;
  location?: LocationModel | null;
  journey_context?: string | null;
  hop_count: number;
  relay_path: string[];
  signature?: string;
  acknowledged_by?: string | null;
  acknowledged_at?: string | null;
  acknowledgement_notes?: string | null;
  is_simulated: boolean;
}

export interface EscalationAssessment {
  event_id?: string;
  journey_id?: string;
  risk_score: number;
  risk_level: string;
  missed_checkpoints_count: number;
  connectivity_lost: boolean;
  distress_signal_received: boolean;
  route_deviation_confirmed: boolean;
  reasons: string[];
  recommended_action: string;
  safety_disclaimer: string;
}
