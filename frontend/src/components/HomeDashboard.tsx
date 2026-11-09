import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Square,
  Users,
  Bluetooth,
  WifiOff,
  Wifi,
  ChevronRight,
  Radio,
  Flame,
  HelpCircle,
} from 'lucide-react';
import { UserProfile, Journey, Checkpoint, TrustedContact, EmergencyEvent } from '../types';

interface HomeDashboardProps {
  user: UserProfile;
  journey: Journey | null;
  checkpoints: Checkpoint[];
  contacts: TrustedContact[];
  activeEmergency: EmergencyEvent | null;
  isOnline: boolean;
  onTriggerSos: () => void;
  onOpenDiscreetTrigger: () => void;
  onConfirmCheckIn: () => void;
  onStartJourneyClick: () => void;
  onEndJourneyClick: () => void;
  onSwitchToContacts: () => void;
  onSwitchToSimulation: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  user,
  journey,
  checkpoints,
  contacts,
  activeEmergency,
  isOnline,
  onTriggerSos,
  onOpenDiscreetTrigger,
  onConfirmCheckIn,
  onStartJourneyClick,
  onEndJourneyClick,
  onSwitchToContacts,
  onSwitchToSimulation,
}) => {
  const [countdownSeconds, setCountdownSeconds] = useState<number>(480); // 8 mins default
  const [sosHolding, setSosHolding] = useState<boolean>(false);
  const [sosProgress, setSosProgress] = useState<number>(0);

  // Check-in countdown calculation
  useEffect(() => {
    if (!journey || journey.status !== 'active') return;

    const interval = setInterval(() => {
      const due = new Date(journey.next_check_in_due).getTime();
      const now = new Date().getTime();
      const diffSecs = Math.max(0, Math.floor((due - now) / 1000));
      setCountdownSeconds(diffSecs);
    }, 1000);

    return () => clearInterval(interval);
  }, [journey]);

  // Press-and-hold trigger handler for physical SOS button (1.5 seconds hold to prevent accident)
  useEffect(() => {
    let timer: any;
    if (sosHolding) {
      const startTime = Date.now();
      timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / 1200) * 100);
        setSosProgress(progress);
        if (progress >= 100) {
          setSosHolding(false);
          setSosProgress(0);
          onTriggerSos();
        }
      }, 50);
    } else {
      setSosProgress(0);
    }
    return () => clearInterval(timer);
  }, [sosHolding, onTriggerSos]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isSafeJourneyActive = journey && journey.status === 'active';

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Top Hero Status Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-raahi-card via-raahi-dark to-raahi-darkest border border-raahi-border p-5 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                RAAHI Safety Shield Active
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-400">
                {isOnline ? 'Direct Cloud Sync' : 'BLE Mesh Handoff Ready'}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Welcome to RAAHI
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {user.institution} · <span className="text-raahi-teal font-bold">Team ShaktiX</span>
            </p>
          </div>

          {/* Discreet Trigger Button */}
          <button
            onClick={onOpenDiscreetTrigger}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-raahi-cardHover border border-raahi-border hover:border-raahi-teal/50 text-xs font-semibold text-slate-200 transition-all hover:shadow-lg"
          >
            <Radio className="w-4 h-4 text-raahi-teal" />
            <span>Discreet Cadence Setup</span>
          </button>
        </div>

        {/* Offline Alert Strip if in Dead Zone */}
        {!isOnline && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 text-rose-300">
              <WifiOff className="w-4 h-4 text-raahi-danger shrink-0" />
              <span>
                <strong>Offline Dead Zone Active:</strong> Cellular data disconnected. Emergency signals will automatically route through nearby opted-in BLE mesh devices.
              </span>
            </div>
            <button
              onClick={onSwitchToSimulation}
              className="px-2.5 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 font-bold shrink-0 ml-3 text-[11px]"
            >
              Inspect Mesh
            </button>
          </div>
        )}
      </div>

      {/* Primary Emergency Activation Section (SOS Center) */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-raahi-card/80 to-raahi-dark border border-raahi-border/80 shadow-2xl relative overflow-hidden">
        {/* Active Emergency Warning Banner */}
        {activeEmergency && activeEmergency.status !== 'cancelled' && (
          <div className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-rose-950/90 to-red-950/80 border-2 border-raahi-danger text-white animate-pulse-slow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-raahi-danger shrink-0" />
                <div>
                  <div className="font-extrabold text-sm uppercase tracking-wider text-rose-200 flex items-center gap-2">
                    Emergency Broadcast Active
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-raahi-danger text-white font-mono font-bold">
                      {activeEmergency.event_id}
                    </span>
                  </div>
                  <div className="text-xs text-rose-300/90 mt-0.5">
                    Status: <strong className="uppercase">{activeEmergency.status}</strong> · Hop Count: {activeEmergency.hop_count}
                  </div>
                </div>
              </div>
              <button
                onClick={onSwitchToSimulation}
                className="px-3 py-1.5 rounded-xl bg-white text-raahi-darkest font-bold text-xs hover:bg-rose-100 transition-colors"
              >
                View Relay Path
              </button>
            </div>
          </div>
        )}

        <div className="text-center mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Rapid Response Center
          </span>
          <h2 className="text-lg font-bold text-white mt-1">
            Tap or Hold for Emergency SOS
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Transmits authenticated UUID packet with 15m TTL. Prevents broadcast loops. Works 100% offline via BLE.
          </p>
        </div>

        {/* SOS Button with Pulsating Safety Rings */}
        <div className="relative my-2">
          {/* Animated Ripples */}
          <div className="absolute inset-0 rounded-full bg-raahi-danger/20 animate-beacon pointer-events-none" />
          <div className="absolute -inset-4 rounded-full bg-raahi-danger/10 animate-ping-slow pointer-events-none" />

          <button
            onMouseDown={() => setSosHolding(true)}
            onMouseUp={() => setSosHolding(false)}
            onMouseLeave={() => setSosHolding(false)}
            onTouchStart={() => setSosHolding(true)}
            onTouchEnd={() => setSosHolding(false)}
            onClick={() => {
              if (sosProgress === 0) onTriggerSos();
            }}
            className="relative w-44 h-44 rounded-full bg-gradient-to-br from-raahi-danger via-rose-600 to-red-800 text-white shadow-2xl flex flex-col items-center justify-center p-4 border-4 border-rose-400/30 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          >
            {/* Circular progress bar on hold */}
            {sosProgress > 0 && (
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="82"
                  stroke="rgba(255, 255, 255, 0.9)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="515"
                  strokeDashoffset={515 - (515 * sosProgress) / 100}
                  className="transition-all duration-75"
                />
              </svg>
            )}

            <ShieldAlert className="w-12 h-12 text-white mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-black tracking-widest font-sans">
              SOS
            </span>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-rose-200 mt-1">
              {sosHolding ? 'Holding...' : 'Hold 1.2s'}
            </span>
          </button>
        </div>

        {/* Accidental Activation Safety Note */}
        <p className="text-[11px] text-slate-500 mt-6 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          Includes 5-second grace window to cancel accidental triggers.
        </p>
      </div>

      {/* Safe Journey Mode Card */}
      <div className="rounded-2xl bg-raahi-card border border-raahi-border p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                Safe Journey Mode
                {isSafeJourneyActive ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Active
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    Inactive
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Timed checkpoints with deterministic escalation ladder
              </p>
            </div>
          </div>

          {!isSafeJourneyActive ? (
            <button
              onClick={onStartJourneyClick}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-raahi-teal text-raahi-darkest font-bold text-xs hover:bg-cyan-300 transition-all shadow-md shadow-raahi-teal/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Journey</span>
            </button>
          ) : (
            <button
              onClick={onEndJourneyClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>End Journey</span>
            </button>
          )}
        </div>

        {/* If Safe Journey is Active: Show Checkpoints & Check-in Countdown */}
        {isSafeJourneyActive && journey ? (
          <div className="space-y-4 pt-2">
            {/* Route Context Banner */}
            <div className="p-3.5 rounded-xl bg-raahi-darkest border border-raahi-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-slate-400">Route: </span>
                <strong className="text-white">{journey.origin_name}</strong>
                <span className="text-cyan-400 mx-1.5">➔</span>
                <strong className="text-white">{journey.destination_name}</strong>
              </div>
              <div className="text-slate-400">
                Duration: <strong className="text-slate-200">{journey.expected_duration_minutes} mins</strong> · Interval: <strong className="text-cyan-400">{journey.check_in_interval_minutes}m</strong>
              </div>
            </div>

            {/* Check-In Countdown & Primary Confirmation Button */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-cyan-400 animate-spin-slow shrink-0" />
                <div>
                  <div className="text-xs uppercase font-bold text-cyan-300 tracking-wider">
                    Next Safety Check-In Due
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    {formatCountdown(countdownSeconds)}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Checkpoint {journey.current_checkpoint_index + 1} of {journey.total_checkpoints}
                  </div>
                </div>
              </div>

              {/* "I Am Safe" Button */}
              <button
                onClick={onConfirmCheckIn}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-raahi-darkest font-extrabold text-sm hover:from-emerald-400 hover:to-teal-300 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5 fill-current text-raahi-darkest" />
                <span>I Am Safe (Check In)</span>
              </button>
            </div>

            {/* Checkpoint Progress Timeline */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                <span>Checkpoint Timeline</span>
                <span className="text-[11px] text-slate-500">Grace period: 60 seconds</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {checkpoints.map((chk, idx) => (
                  <div
                    key={chk.checkpoint_id}
                    className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                      chk.status === 'confirmed_safe'
                        ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                        : chk.status === 'grace_period'
                        ? 'bg-amber-950/50 border-amber-500 text-amber-300 animate-pulse'
                        : chk.status === 'missed'
                        ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                        : idx === journey.current_checkpoint_index
                        ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-300'
                        : 'bg-raahi-darkest border-raahi-border text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                        chk.status === 'confirmed_safe'
                          ? 'bg-emerald-500 text-raahi-darkest'
                          : chk.status === 'grace_period'
                          ? 'bg-amber-500 text-raahi-darkest'
                          : chk.status === 'missed'
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className="truncate">
                      <div className="font-semibold truncate">
                        {chk.status === 'confirmed_safe'
                          ? 'Confirmed Safe'
                          : chk.status === 'grace_period'
                          ? 'Prompt Active'
                          : chk.status === 'missed'
                          ? 'Check-in Missed'
                          : 'Scheduled'}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {new Date(chk.scheduled_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-slate-400 text-xs">
            <p>No active journey running.</p>
            <p className="text-slate-500 text-[11px] mt-1">
              Click "Start Journey" to initiate scheduled check-ins while commuting.
            </p>
          </div>
        )}
      </div>

      {/* Trusted Circle Quick View */}
      <div className="rounded-2xl bg-raahi-card border border-raahi-border p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-raahi-teal" />
            <h3 className="font-bold text-white text-sm">Trusted Circle</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {contacts.length} contacts
            </span>
          </div>
          <button
            onClick={onSwitchToContacts}
            className="text-xs font-semibold text-raahi-teal hover:underline flex items-center gap-1"
          >
            Manage Circle
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="p-3 rounded-xl bg-raahi-darkest border border-raahi-border flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-semibold text-white">{contact.name}</div>
                <div className="text-[11px] text-slate-400">{contact.relationship}</div>
                <div className="text-[10px] font-mono text-cyan-400 mt-0.5">
                  {contact.phone}
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    contact.ack_status === 'acknowledged'
                      ? 'bg-emerald-950 border-emerald-800 text-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {contact.ack_status === 'acknowledged' ? 'Acknowledged' : 'Ready'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
