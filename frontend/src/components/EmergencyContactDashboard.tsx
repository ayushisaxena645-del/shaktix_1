import React, { useState } from 'react';
import {
  ShieldAlert,
  MapPin,
  Phone,
  CheckCircle2,
  ExternalLink,
  Radio,
  Clock,
  Navigation,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { EmergencyEvent, UserProfile } from '../types';

interface EmergencyContactDashboardProps {
  user: UserProfile;
  events: EmergencyEvent[];
  activeEmergency: EmergencyEvent | null;
  onAcknowledge: (eventId: string, contactName: string, notes?: string) => void;
}

export const EmergencyContactDashboard: React.FC<EmergencyContactDashboardProps> = ({
  user,
  events,
  activeEmergency,
  onAcknowledge,
}) => {
  const [selectedContact, setSelectedContact] = useState<string>('Priyal');
  const [ackNotes, setAckNotes] = useState<string>(
    'Received. Calling campus patrol and moving to transit point.'
  );

  const displayEvent = activeEmergency || events[0] || null;

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950 via-raahi-card to-raahi-dark border border-raahi-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-raahi-teal" />
            <h2 className="text-xl font-extrabold text-white">
              Emergency Contact & Guardian View
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
              Receiver Mode
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulating what a Trusted Circle Guardian sees upon receiving the relayed distress signal.
          </p>
        </div>

        {/* Guardian Persona Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Viewing as:</span>
          <select
            value={selectedContact}
            onChange={(e) => setSelectedContact(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-raahi-darkest border border-raahi-border text-white text-xs font-semibold focus:ring-1 focus:ring-raahi-teal outline-none"
          >
            <option value="Priyal">Priyal (Team ShaktiX)</option>
            <option value="Pavani">Pavani (Team ShaktiX)</option>
            <option value="Ayushi Saxena">Ayushi Saxena (Team ShaktiX)</option>
            <option value="Campus Security Desk">Campus Security Desk</option>
          </select>
        </div>
      </div>

      {displayEvent ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column: Distress Alert Details & Acknowledgement Actions */}
          <div className="lg:col-span-1 space-y-4">
            <div className="p-5 rounded-2xl bg-raahi-card border border-raahi-border space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Incoming Alert Status
                </span>
                <span
                  className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full border ${
                    displayEvent.status === 'acknowledged'
                      ? 'bg-emerald-950 border-emerald-700 text-emerald-400'
                      : 'bg-rose-950 border-raahi-danger text-raahi-danger animate-pulse'
                  }`}
                >
                  {displayEvent.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white">
                  {user.name}
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  {user.emergency_notes}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-raahi-darkest border border-raahi-border text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Event ID:</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {displayEvent.event_id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Trigger Type:</span>
                  <span className="text-white uppercase font-bold text-[11px]">
                    {displayEvent.trigger_type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Relay Hops:</span>
                  <span className="text-emerald-400 font-bold">
                    {displayEvent.hop_count} Hops
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Time Sent:</span>
                  <span className="text-slate-300">
                    {new Date(displayEvent.initial_timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Journey Route Context */}
              {displayEvent.journey_context && (
                <div className="p-3 rounded-xl bg-raahi-darkest border border-raahi-border text-xs">
                  <span className="text-slate-400">Journey Context: </span>
                  <span className="text-white font-medium">
                    {displayEvent.journey_context}
                  </span>
                </div>
              )}

              {/* Acknowledge Action Box */}
              {displayEvent.status !== 'acknowledged' ? (
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Response Note to Sender:
                  </label>
                  <textarea
                    rows={2}
                    value={ackNotes}
                    onChange={(e) => setAckNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-raahi-darkest border border-raahi-border text-white text-xs focus:ring-1 focus:ring-raahi-teal outline-none resize-none"
                  />

                  <button
                    onClick={() =>
                      onAcknowledge(displayEvent.event_id, selectedContact, ackNotes)
                    }
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-raahi-darkest font-black text-xs hover:from-emerald-400 hover:to-teal-300 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 fill-current text-raahi-darkest" />
                    <span>Acknowledge Alert (Send Confirmation)</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                  <div>
                    <div className="font-bold">
                      Acknowledged by {displayEvent.acknowledged_by || selectedContact}
                    </div>
                    <div className="text-[11px] text-emerald-400/80">
                      Confirmation packet successfully returned to sender.
                    </div>
                  </div>
                </div>
              )}

              {/* Direct Call & Emergency Quick Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href={`tel:${user.phone}`}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-raahi-cardHover border border-raahi-border hover:border-raahi-teal/50 text-white font-bold text-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-raahi-teal" />
                  <span>Call {user.name.split(' ')[0]}</span>
                </a>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${
                    displayEvent.location?.latitude ?? 28.3845
                  },${displayEvent.location?.longitude ?? 77.3126}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-raahi-cardHover border border-raahi-border hover:border-raahi-teal/50 text-white font-bold text-xs transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                  <span>External Maps</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive OpenStreetMap Location Viewer */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 rounded-2xl bg-raahi-card border border-raahi-border flex flex-col h-full space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-raahi-danger" />
                  <h3 className="font-bold text-white text-sm">
                    Consented Emergency Location (OpenStreetMap)
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {displayEvent.location?.latitude.toFixed(4) ?? '28.3845'}° N,{' '}
                  {displayEvent.location?.longitude.toFixed(4) ?? '77.3126'}° E
                </span>
              </div>

              {/* Embedded OpenStreetMap Iframe */}
              <div className="relative w-full h-[360px] rounded-xl overflow-hidden border border-raahi-border bg-raahi-darkest">
                <iframe
                  title="OpenStreetMap Emergency Pin"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=77.2926%2C28.3645%2C77.3326%2C28.4045&layer=mapnik&marker=${
                    displayEvent.location?.latitude ?? 28.3845
                  }%2C${displayEvent.location?.longitude ?? 77.3126}`}
                  className="w-full h-full grayscale-[25%] contrast-125"
                />

                {/* Overlay GPS Pin Badge */}
                <div className="absolute top-3 left-3 bg-raahi-darkest/90 backdrop-blur-md p-2.5 rounded-xl border border-raahi-border text-xs space-y-0.5">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-raahi-danger animate-ping" />
                    Faridabad Bypass Route
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Accuracy: ±8.5m · Consented for Emergency Response
                  </div>
                </div>
              </div>

              {/* Relay Handoff Node Trail */}
              <div className="p-3.5 rounded-xl bg-raahi-darkest border border-raahi-border text-xs space-y-1">
                <div className="font-semibold text-slate-300">
                  Relay Hop Trail (Mesh Provenance):
                </div>
                <div className="text-slate-400 flex flex-wrap items-center gap-1.5 text-[11px]">
                  {displayEvent.relay_path.map((node, i) => (
                    <span key={i} className="flex items-center gap-1 text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-raahi-card border border-raahi-border font-mono text-cyan-300">
                        {node}
                      </span>
                      {i < displayEvent.relay_path.length - 1 && (
                        <span className="text-slate-600">➔</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-raahi-card border border-raahi-border text-slate-400">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">All Clear</h3>
          <p className="text-xs text-slate-400 mt-1">
            No active emergencies for Ayushi Saxena right now.
          </p>
        </div>
      )}
    </div>
  );
};
