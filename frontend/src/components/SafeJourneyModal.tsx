import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Play,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  X,
  Radio,
} from 'lucide-react';
import { Journey, Checkpoint, EscalationAssessment } from '../types';

interface SafeJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeJourney: Journey | null;
  checkpoints: Checkpoint[];
  onStartJourney: (payload: {
    origin_name: string;
    destination_name: string;
    duration_minutes: number;
    interval_minutes: number;
  }) => void;
  onConfirmCheckIn: () => void;
  onSimulateEscalation: (level: number, offline: boolean) => void;
  escalationAssessment: EscalationAssessment | null;
}

export const SafeJourneyModal: React.FC<SafeJourneyModalProps> = ({
  isOpen,
  onClose,
  activeJourney,
  checkpoints,
  onStartJourney,
  onConfirmCheckIn,
  onSimulateEscalation,
  escalationAssessment,
}) => {
  if (!isOpen) return null;

  const [origin, setOrigin] = useState('Echelon Institute Campus, Faridabad');
  const [destination, setDestination] = useState('Bata Chowk Metro Station');
  const [duration, setDuration] = useState(30);
  const [interval, setInterval] = useState(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartJourney({
      origin_name: origin,
      destination_name: destination,
      duration_minutes: duration,
      interval_minutes: interval,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-raahi-dark border border-raahi-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-raahi-border bg-raahi-card">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-raahi-teal/20 text-raahi-teal flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">
                Safe Journey Configuration & Escalation
              </h2>
              <p className="text-xs text-slate-400">
                Scheduled Safety Checkpoints · Deterministic Escalation
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Start Journey Form if not active */}
          {!activeJourney || activeJourney.status !== 'active' ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Starting Point (Origin)
                </label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-raahi-darkest border border-raahi-border text-white text-xs focus:ring-1 focus:ring-raahi-teal outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Destination
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-raahi-darkest border border-raahi-border text-white text-xs focus:ring-1 focus:ring-raahi-teal outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Expected Journey Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-raahi-darkest border border-raahi-border text-white text-xs focus:ring-1 focus:ring-raahi-teal outline-none"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Check-In Frequency
                  </label>
                  <select
                    value={interval}
                    onChange={(e) => setInterval(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-raahi-darkest border border-raahi-border text-white text-xs focus:ring-1 focus:ring-raahi-teal outline-none"
                  >
                    <option value={5}>Every 5 Minutes (Intense)</option>
                    <option value={10}>Every 10 Minutes (Standard)</option>
                    <option value={15}>Every 15 Minutes</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-raahi-card border border-raahi-border text-slate-400 text-[11px] space-y-1">
                <div className="font-semibold text-slate-300">How Escalation Works:</div>
                <p>1. At each checkpoint, RAAHI prompts you: "Are you safe?"</p>
                <p>2. If unanswered after 60s, it prompts audibly (Level 1).</p>
                <p>3. If still unanswered, Priyal & Pavani are alerted with your last consented location (Level 2).</p>
                <p>4. If in an offline area, it starts Bluetooth mesh broadcast (Level 3).</p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-raahi-teal to-cyan-400 text-raahi-darkest font-bold text-xs shadow-lg hover:shadow-raahi-teal/20 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Begin Safe Journey</span>
              </button>
            </form>
          ) : (
            /* Active Journey Management & Escalation Testing */
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-raahi-darkest border border-raahi-border text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Active Journey</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {activeJourney.journey_id}
                  </span>
                </div>
                <div className="text-slate-300">
                  From: <strong>{activeJourney.origin_name}</strong> ➔ To: <strong>{activeJourney.destination_name}</strong>
                </div>
                <div className="text-slate-400">
                  Escalation Level: <strong className="text-cyan-400">Level {activeJourney.escalation_level}</strong>
                </div>
              </div>

              {/* Hackathon Simulation Controls for Escalation Ladder */}
              <div className="p-4 rounded-xl bg-raahi-card border border-raahi-border space-y-3">
                <div className="font-bold text-white text-xs flex items-center gap-2">
                  <Radio className="w-4 h-4 text-raahi-teal" />
                  Simulate Escalation Scenarios (For Judges)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => onSimulateEscalation(1, false)}
                    className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-600/60 text-amber-300 text-left hover:bg-amber-900/60 transition-colors"
                  >
                    <div className="font-bold text-xs">Level 1: Prompt</div>
                    <div className="text-[10px] text-amber-200/70">60s grace period prompt</div>
                  </button>

                  <button
                    onClick={() => onSimulateEscalation(2, false)}
                    className="p-2.5 rounded-lg bg-orange-950/60 border border-orange-600/60 text-orange-300 text-left hover:bg-orange-900/60 transition-colors"
                  >
                    <div className="font-bold text-xs">Level 2: Contact Alert</div>
                    <div className="text-[10px] text-orange-200/70">Alert Trusted Circle</div>
                  </button>

                  <button
                    onClick={() => onSimulateEscalation(3, true)}
                    className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-600/60 text-rose-300 text-left hover:bg-rose-900/60 transition-colors"
                  >
                    <div className="font-bold text-xs">Level 3: Mesh Broadcast</div>
                    <div className="text-[10px] text-rose-200/70">Offline BLE packet flood</div>
                  </button>
                </div>
              </div>

              {/* Explainable Risk Assessment Output */}
              {escalationAssessment && (
                <div className="p-4 rounded-xl bg-raahi-darkest border border-raahi-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Explainable Risk Score
                    </span>
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                        escalationAssessment.risk_level === 'CRITICAL'
                          ? 'bg-rose-950 border-rose-600 text-rose-300'
                          : escalationAssessment.risk_level === 'HIGH'
                          ? 'bg-orange-950 border-orange-600 text-orange-300'
                          : 'bg-emerald-950 border-emerald-600 text-emerald-300'
                      }`}
                    >
                      {escalationAssessment.risk_score} / 100 ({escalationAssessment.risk_level})
                    </span>
                  </div>

                  {/* Factor Reasons Breakdown */}
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="font-semibold text-slate-400 text-[11px]">
                      Deterministic Factors:
                    </div>
                    {escalationAssessment.reasons.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>

                  {/* Ethical AI / Safety Rule Notice */}
                  <div className="p-2.5 rounded-lg bg-raahi-card border border-raahi-border text-[10px] text-slate-400 italic">
                    {escalationAssessment.safety_disclaimer}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-raahi-border bg-raahi-darkest flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-raahi-card hover:bg-raahi-cardHover text-slate-300 text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
