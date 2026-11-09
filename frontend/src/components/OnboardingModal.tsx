import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  MicOff,
  EyeOff,
  Radio,
  CheckCircle2,
  X,
  Users,
  Award,
} from 'lucide-react';
import { UserProfile, ConsentRecord } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSaveConsent: (consent: ConsentRecord) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveConsent,
}) => {
  if (!isOpen) return null;

  const [locationConsent, setLocationConsent] = useState(
    user.consent?.consent_location_emergency ?? true
  );
  const [bleConsent, setBleConsent] = useState(
    user.consent?.consent_ble_relay ?? true
  );
  const [notifyConsent, setNotifyConsent] = useState(
    user.consent?.consent_contacts_notify ?? true
  );
  const [retentionDays, setRetentionDays] = useState(
    user.consent?.data_retention_days ?? 7
  );

  const handleSave = () => {
    onSaveConsent({
      user_id: user.id,
      consent_location_emergency: locationConsent,
      consent_ble_relay: bleConsent,
      consent_contacts_notify: notifyConsent,
      no_continuous_audio_ack: true,
      no_public_tracking_ack: true,
      data_retention_days: retentionDays,
      signed_at: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-raahi-dark border border-raahi-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-raahi-border bg-gradient-to-r from-raahi-card to-raahi-dark">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-raahi-teal/20 border border-raahi-teal/40 flex items-center justify-center text-raahi-teal">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                About RAAHI & Consent Framework
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-900/60 text-cyan-300 border border-cyan-700">
                  HERHACK 2026
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Resilient Assistance and Emergency Handoff Intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-raahi-card transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Team ShaktiX Attribution Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-indigo-950/40 border border-cyan-800/40 flex items-start gap-3">
            <Award className="w-6 h-6 text-raahi-teal shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white text-sm">
                Team ShaktiX · Echelon Institute of Technology, Faridabad
              </div>
              <div className="text-xs text-slate-300 mt-1 flex flex-wrap gap-2">
                <span>
                  <strong>Team ShaktiX:</strong> Priyal · Pavani · Ayushi Saxena
                </span>
              </div>
              <p className="text-xs text-cyan-200/80 mt-1.5 italic">
                "When the network fails, your safety network doesn't."
              </p>
            </div>
          </div>

          {/* Core Innovation Pillars */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              Privacy-First Safety By Design
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-raahi-card/80 border border-raahi-border flex items-start gap-2.5">
                <MicOff className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white text-xs">
                    Zero Audio Spying
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    No continuous microphone recording or voice eavesdropping.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-raahi-card/80 border border-raahi-border flex items-start gap-2.5">
                <EyeOff className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white text-xs">
                    No Public Tracking
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Location is shared ONLY upon explicit emergency activation or escalation.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-raahi-card/80 border border-raahi-border flex items-start gap-2.5">
                <Radio className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white text-xs">
                    Offline BLE Mesh
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Multi-hop relay with 15m TTL & duplicate rejection.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Granular User Consent Form */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Explicit Consent Preferences
            </h3>

            {/* Toggle 1: Emergency Location */}
            <label className="flex items-start justify-between p-3.5 rounded-xl bg-raahi-card border border-raahi-border cursor-pointer hover:border-raahi-teal/40 transition-colors">
              <div className="pr-4">
                <div className="font-semibold text-white text-xs flex items-center gap-1.5">
                  Emergency Location Transmission
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800">
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Package GPS coordinates inside the signed emergency packet only when SOS or escalation is triggered.
                </p>
              </div>
              <input
                type="checkbox"
                checked={locationConsent}
                onChange={(e) => setLocationConsent(e.target.checked)}
                className="w-4 h-4 rounded text-raahi-teal bg-raahi-dark border-raahi-border focus:ring-raahi-teal mt-1"
              />
            </label>

            {/* Toggle 2: Opt-In BLE Relay */}
            <label className="flex items-start justify-between p-3.5 rounded-xl bg-raahi-card border border-raahi-border cursor-pointer hover:border-raahi-teal/40 transition-colors">
              <div className="pr-4">
                <div className="font-semibold text-white text-xs flex items-center gap-1.5">
                  Opt-In Bluetooth Relay Mesh Participation
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 font-bold border border-cyan-800">
                    Community Safety
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Allow your device to anonymously relay encrypted emergency signals for nearby women when they are offline without internet.
                </p>
              </div>
              <input
                type="checkbox"
                checked={bleConsent}
                onChange={(e) => setBleConsent(e.target.checked)}
                className="w-4 h-4 rounded text-raahi-teal bg-raahi-dark border-raahi-border focus:ring-raahi-teal mt-1"
              />
            </label>

            {/* Toggle 3: Trusted Circle Notifications */}
            <label className="flex items-start justify-between p-3.5 rounded-xl bg-raahi-card border border-raahi-border cursor-pointer hover:border-raahi-teal/40 transition-colors">
              <div className="pr-4">
                <div className="font-semibold text-white text-xs">
                  Trusted Circle Instant Escalation
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Automatically alert Priyal, Pavani, and Campus Security if a journey checkpoint is missed after the 60-second grace prompt.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifyConsent}
                onChange={(e) => setNotifyConsent(e.target.checked)}
                className="w-4 h-4 rounded text-raahi-teal bg-raahi-dark border-raahi-border focus:ring-raahi-teal mt-1"
              />
            </label>

            {/* Retention Setting */}
            <div className="p-3.5 rounded-xl bg-raahi-card border border-raahi-border flex items-center justify-between">
              <div>
                <div className="font-semibold text-white text-xs">
                  Emergency Packet Data Retention
                </div>
                <p className="text-[11px] text-slate-400">
                  Automatically purge all incident and telemetry logs from server storage.
                </p>
              </div>
              <select
                value={retentionDays}
                onChange={(e) => setRetentionDays(Number(e.target.value))}
                className="bg-raahi-darkest text-slate-200 border border-raahi-border rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-raahi-teal outline-none"
              >
                <option value={1}>24 Hours</option>
                <option value={7}>7 Days (Standard)</option>
                <option value={30}>30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-raahi-border bg-raahi-darkest flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Current User: <strong className="text-white">{user.name}</strong> ({user.institution})
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-raahi-teal to-cyan-400 text-raahi-darkest font-bold text-xs hover:shadow-lg hover:shadow-raahi-teal/20 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm & Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
