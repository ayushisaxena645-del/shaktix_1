import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Radio,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Bluetooth,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { EmergencyEvent, EventStatus } from '../types';

interface DiscreetSosModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEvent: EmergencyEvent | null;
  onConfirmTrigger: (triggerType: string) => void;
  onCancelEvent: (eventId: string) => void;
}

export const DiscreetSosModal: React.FC<DiscreetSosModalProps> = ({
  isOpen,
  onClose,
  activeEvent,
  onConfirmTrigger,
  onCancelEvent,
}) => {
  if (!isOpen) return null;

  const [cadenceCount, setCadenceCount] = useState<number>(0);
  const [cancelCountdown, setCancelCountdown] = useState<number>(5);
  const [isArmed, setIsArmed] = useState<boolean>(false);

  // Cadence tap detection (3 quick taps to trigger silent SOS)
  const handleCadenceTap = () => {
    const next = cadenceCount + 1;
    setCadenceCount(next);
    if (next >= 3) {
      setIsArmed(true);
      setCadenceCount(0);
      onConfirmTrigger('discreet_cadence');
    }
  };

  // Reset cadence if user pauses
  useEffect(() => {
    if (cadenceCount > 0 && cadenceCount < 3) {
      const t = setTimeout(() => setCadenceCount(0), 1200);
      return () => clearTimeout(t);
    }
  }, [cadenceCount]);

  // 5-second cancellation buffer countdown
  useEffect(() => {
    if (activeEvent && activeEvent.status === 'broadcasting') {
      const interval = setInterval(() => {
        setCancelCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCancelCountdown(5);
    }
  }, [activeEvent]);

  // Stepper lifecycle items
  const steps: { key: EventStatus; label: string; desc: string }[] = [
    { key: 'created', label: '1. Created', desc: 'UUID Generated & Signed' },
    { key: 'broadcasting', label: '2. Broadcasting', desc: 'Offline BLE Beacon Active' },
    { key: 'relayed', label: '3. Relayed', desc: 'Hop via Opted-in Devices' },
    { key: 'delivered', label: '4. Delivered', desc: 'Synchronized with Cloud' },
    { key: 'acknowledged', label: '5. Acknowledged', desc: 'Confirmed by Trusted Circle' },
  ];

  const getStepStatus = (stepKey: EventStatus) => {
    if (!activeEvent) return 'inactive';
    const order: EventStatus[] = ['created', 'broadcasting', 'relayed', 'delivered', 'acknowledged'];
    const currentIdx = order.indexOf(activeEvent.status);
    const targetIdx = order.indexOf(stepKey);

    if (activeEvent.status === 'cancelled') return 'cancelled';
    if (targetIdx < currentIdx) return 'completed';
    if (targetIdx === currentIdx) return 'current';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-raahi-dark border border-raahi-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-raahi-border bg-raahi-card">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-raahi-teal animate-pulse" />
            <div>
              <h2 className="font-bold text-white text-base">
                Discreet Emergency Activation & Lifecycle
              </h2>
              <p className="text-xs text-slate-400">
                Silent Trigger · 5s Safety Window · Verified Acknowledgement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-raahi-cardHover"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Active Event Lifecycle View */}
          {activeEvent ? (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-raahi-darkest border border-raahi-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Emergency Event ID
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    {activeEvent.event_id}
                  </span>
                </div>
                <div className="text-xs text-slate-300">
                  Trigger: <strong className="uppercase text-white">{activeEvent.trigger_type}</strong> · Hop Count: <strong>{activeEvent.hop_count}</strong>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Relay Route: {activeEvent.relay_path.join(' ➔ ')}
                </div>
              </div>

              {/* 5-Second Cancellation Grace Alert */}
              {cancelCountdown > 0 && activeEvent.status === 'broadcasting' && (
                <div className="p-4 rounded-xl bg-rose-950/70 border border-raahi-danger flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-raahi-danger shrink-0" />
                    <div>
                      <div className="font-bold text-white text-xs">
                        Accidental Trigger Buffer Active
                      </div>
                      <div className="text-[11px] text-rose-300">
                        Broadcasting to nearby mesh in <strong>{cancelCountdown}s</strong>.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onCancelEvent(activeEvent.event_id);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-raahi-danger hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    Cancel False Alarm
                  </button>
                </div>
              )}

              {/* Verified Stepper Lifecycle */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Transmission Lifecycle (Zero False Delivery)
                </div>
                <div className="space-y-2">
                  {steps.map((st) => {
                    const status = getStepStatus(st.key);
                    return (
                      <div
                        key={st.key}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                          status === 'completed'
                            ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                            : status === 'current'
                            ? 'bg-cyan-950/50 border-cyan-500 text-cyan-200 shadow-lg shadow-cyan-500/10'
                            : 'bg-raahi-darkest border-raahi-border text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {status === 'completed' ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : status === 'current' ? (
                            <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                          )}
                          <div>
                            <div className="font-semibold text-white">{st.label}</div>
                            <div className="text-[10px] text-slate-400">{st.desc}</div>
                          </div>
                        </div>

                        <div>
                          {status === 'completed' && (
                            <span className="text-[10px] font-bold text-emerald-400 uppercase">
                              Verified
                            </span>
                          )}
                          {status === 'current' && (
                            <span className="text-[10px] font-bold text-cyan-400 uppercase animate-pulse">
                              In Progress
                            </span>
                          )}
                          {status === 'pending' && (
                            <span className="text-[10px] text-slate-500 uppercase">
                              Awaiting ACK
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Strict Product Rule Disclaimer */}
              <div className="p-3 rounded-lg bg-raahi-card border border-raahi-border text-[11px] text-slate-400">
                <strong className="text-slate-300">Rule of Transparency:</strong> An alert is never marked as Delivered or Acknowledged until an authenticated cryptographic acknowledgement packet is received from the trusted recipient.
              </div>
            </div>
          ) : (
            /* Setup / Test Cadence Trigger */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-raahi-darkest border border-raahi-border text-xs text-slate-300 space-y-2">
                <div className="font-bold text-white text-sm">
                  Configurable Discreet Trigger
                </div>
                <p>
                  In situations where taking out the phone or speaking is dangerous, you can activate RAAHI silently via:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-400">
                  <li><strong>Triple-Tap Volume/Power Button Cadence</strong> (Hardwired Native Gesture)</li>
                  <li><strong>Covert Screen Tap Sequence</strong> (Tap anywhere 3 times rapidly)</li>
                  <li><strong>Safe Journey Missed Checkpoint Escalation</strong> (Automatic fail-safe)</li>
                </ul>
              </div>

              {/* Interactive Cadence Test Area */}
              <div className="p-6 rounded-2xl bg-raahi-card border-2 border-dashed border-raahi-border text-center space-y-4">
                <div className="text-xs text-slate-400 font-medium">
                  Practice Cadence Sequence (Tap 3 times quickly):
                </div>

                <button
                  onClick={handleCadenceTap}
                  className="w-24 h-24 mx-auto rounded-full bg-raahi-darkest border-2 border-raahi-teal text-raahi-teal font-extrabold text-lg flex items-center justify-center hover:bg-raahi-teal/10 active:scale-90 transition-all shadow-lg shadow-raahi-teal/10 cursor-pointer"
                >
                  {cadenceCount > 0 ? `${cadenceCount} / 3` : 'TAP'}
                </button>

                <p className="text-[11px] text-slate-500">
                  Tap 3 times within 1.2 seconds to initiate silent broadcast.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-raahi-border bg-raahi-darkest flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-raahi-card hover:bg-raahi-cardHover text-slate-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
