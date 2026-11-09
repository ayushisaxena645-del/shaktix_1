import React, { useState } from 'react';
import {
  Shield,
  MicOff,
  EyeOff,
  Trash2,
  Lock,
  Clock,
  Radio,
  X,
  CheckCircle,
} from 'lucide-react';
import { ConsentRecord } from '../types';

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  consent: ConsentRecord | undefined;
  onUpdateConsent: (consent: ConsentRecord) => void;
  onPurgeData: () => void;
}

export const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({
  isOpen,
  onClose,
  consent,
  onUpdateConsent,
  onPurgeData,
}) => {
  if (!isOpen) return null;

  const [locConsent, setLocConsent] = useState(
    consent?.consent_location_emergency ?? true
  );
  const [bleConsent, setBleConsent] = useState(
    consent?.consent_ble_relay ?? true
  );
  const [contactsConsent, setContactsConsent] = useState(
    consent?.consent_contacts_notify ?? true
  );
  const [retention, setRetention] = useState(
    consent?.data_retention_days ?? 7
  );
  const [purgedMessage, setPurgedMessage] = useState(false);

  const handleSave = () => {
    onUpdateConsent({
      user_id: consent?.user_id ?? 'USR-SHAKTIX-AYUSHI',
      consent_location_emergency: locConsent,
      consent_ble_relay: bleConsent,
      consent_contacts_notify: contactsConsent,
      no_continuous_audio_ack: true,
      no_public_tracking_ack: true,
      data_retention_days: retention,
      signed_at: new Date().toISOString(),
    });
    onClose();
  };

  const handlePurge = () => {
    if (confirm('Are you sure you want to purge all local and synced safety logs?')) {
      onPurgeData();
      setPurgedMessage(true);
      setTimeout(() => setPurgedMessage(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-raahi-dark border border-raahi-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-raahi-border bg-raahi-card">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-raahi-teal" />
            <div>
              <h2 className="font-bold text-white text-base">
                Privacy Architecture & Rights
              </h2>
              <p className="text-xs text-slate-400">
                User-Governed Permissions · No Covert Surveillance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-raahi-cardHover"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh] text-xs">
          {/* Privacy Commitments Box */}
          <div className="space-y-2.5">
            <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              System Guarantees (Non-Negotiable)
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center gap-3">
              <MicOff className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-white">No Continuous Audio Recording</div>
                <div className="text-[11px] text-emerald-300/80">
                  Microphone is never accessed in the background. RAAHI protects your dignity and privacy.
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center gap-3">
              <EyeOff className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-white">No Public Tracking</div>
                <div className="text-[11px] text-emerald-300/80">
                  Your coordinates are not broadcast publicly and never sold. Only shared with your Trusted Circle upon emergency trigger.
                </div>
              </div>
            </div>
          </div>

          {/* Granular Permission Toggles */}
          <div className="space-y-3">
            <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Configurable Permissions
            </div>

            <label className="flex items-center justify-between p-3 rounded-xl bg-raahi-card border border-raahi-border cursor-pointer">
              <div>
                <div className="font-semibold text-white">Attach Consented GPS Location</div>
                <div className="text-[11px] text-slate-400">
                  Package GPS coordinates inside the signed 15m emergency packet.
                </div>
              </div>
              <input
                type="checkbox"
                checked={locConsent}
                onChange={(e) => setLocConsent(e.target.checked)}
                className="w-4 h-4 text-raahi-teal bg-raahi-dark border-raahi-border rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-raahi-card border border-raahi-border cursor-pointer">
              <div>
                <div className="font-semibold text-white">Opt-In Bluetooth Mesh Relay</div>
                <div className="text-[11px] text-slate-400">
                  Participate anonymously as a relay node for other women in offline dead-zones.
                </div>
              </div>
              <input
                type="checkbox"
                checked={bleConsent}
                onChange={(e) => setBleConsent(e.target.checked)}
                className="w-4 h-4 text-raahi-teal bg-raahi-dark border-raahi-border rounded"
              />
            </label>
          </div>

          {/* Data Retention & Purge */}
          <div className="p-4 rounded-xl bg-raahi-darkest border border-raahi-border space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Data Retention Policy</div>
                <div className="text-[11px] text-slate-400">
                  Purge emergency records automatically from database.
                </div>
              </div>
              <select
                value={retention}
                onChange={(e) => setRetention(Number(e.target.value))}
                className="px-2.5 py-1 rounded-lg bg-raahi-card border border-raahi-border text-white text-xs outline-none"
              >
                <option value={1}>24 Hours</option>
                <option value={7}>7 Days</option>
                <option value={30}>30 Days</option>
              </select>
            </div>

            <div className="pt-2 border-t border-raahi-border flex items-center justify-between">
              <div>
                <div className="font-semibold text-rose-300">Purge Data Immediately</div>
                <div className="text-[11px] text-slate-500">Delete all stored event logs right now.</div>
              </div>
              <button
                type="button"
                onClick={handlePurge}
                className="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Purge</span>
              </button>
            </div>

            {purgedMessage && (
              <div className="p-2 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 text-[11px] text-center">
                All local and cloud event history has been purged cleanly.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-raahi-border bg-raahi-darkest flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-raahi-teal text-raahi-darkest font-bold shadow-md hover:bg-cyan-300 transition-colors"
          >
            Save Privacy Settings
          </button>
        </div>
      </div>
    </div>
  );
};
