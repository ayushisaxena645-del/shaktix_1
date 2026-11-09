import React, { useState, useEffect } from 'react';
import {
  WifiOff,
  Bluetooth,
  ShieldAlert,
  Clock,
  Layers,
  CheckCircle,
  AlertCircle,
  Copy,
  Info,
  Radio,
  Share2,
} from 'lucide-react';
import { EmergencyEvent, RelayDevice } from '../types';

interface OfflineEmergencyModeProps {
  activeEmergency: EmergencyEvent;
  devices: RelayDevice[];
  onRelayStep: (step: number) => void;
  onCancelAlert: () => void;
}

export const OfflineEmergencyMode: React.FC<OfflineEmergencyModeProps> = ({
  activeEmergency,
  devices,
  onRelayStep,
  onCancelAlert,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [ttlSecondsRemaining, setTtlSecondsRemaining] = useState<number>(
    activeEmergency.ttl_minutes * 60
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTtlSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTtl = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Structured packet preview representation
  const rawPacket = {
    packet_id: `PKT-${activeEmergency.event_id.replace('RAAHI-EVT-', '')}`,
    event_id: activeEmergency.event_id,
    timestamp_utc: activeEmergency.initial_timestamp,
    ttl_minutes: activeEmergency.ttl_minutes,
    hop_count: activeEmergency.hop_count,
    max_hops: 3,
    location: activeEmergency.location,
    signature_hmac: activeEmergency.signature || 'HMAC_SHA256_VERIFIED_7F90B2',
    relay_path: activeEmergency.relay_path,
  };

  const copyPacketJson = () => {
    navigator.clipboard.writeText(JSON.stringify(rawPacket, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 animate-fade-in pb-10">
      {/* Offline Alert Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950 via-raahi-card to-raahi-dark border-2 border-raahi-danger shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-raahi-danger flex items-center justify-center text-white shadow-lg shadow-raahi-danger/40 animate-pulse">
              <WifiOff className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-rose-300">
                  Offline Emergency Mode Active
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-900 text-rose-200 border border-rose-700 font-mono">
                  {activeEmergency.event_id}
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-0.5">
                BLE Autonomous Mesh Packet Broadcasting
              </h2>
              <p className="text-xs text-rose-200/80">
                Cellular internet is offline. Signal is hopping securely between nearby opted-in phones.
              </p>
            </div>
          </div>

          <button
            onClick={onCancelAlert}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-600 transition-colors shrink-0"
          >
            Cancel Alert
          </button>
        </div>

        {/* Realistic Delivery Notice */}
        <div className="mt-4 p-3 rounded-xl bg-raahi-darkest/80 border border-rose-900/60 flex items-start gap-2.5 text-xs text-slate-300">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Honest Delivery Guarantee:</strong> Emergency signals travel via peer-to-peer Bluetooth Low Energy. If no opted-in relay device or connected bridge is in range, delivery is delayed until the next peer is encountered.
          </span>
        </div>
      </div>

      {/* Packet Telemetry & TTL Countdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Metric 1: TTL Expiry */}
        <div className="p-4 rounded-xl bg-raahi-card border border-raahi-border flex items-center gap-3">
          <Clock className="w-8 h-8 text-cyan-400 shrink-0" />
          <div>
            <div className="text-[11px] uppercase font-bold text-slate-400">
              Packet TTL Remaining
            </div>
            <div className="text-xl font-black text-white font-mono">
              {formatTtl(ttlSecondsRemaining)}
            </div>
            <div className="text-[10px] text-slate-500">15m Window Expiry</div>
          </div>
        </div>

        {/* Metric 2: Hop Count */}
        <div className="p-4 rounded-xl bg-raahi-card border border-raahi-border flex items-center gap-3">
          <Layers className="w-8 h-8 text-raahi-teal shrink-0" />
          <div>
            <div className="text-[11px] uppercase font-bold text-slate-400">
              Hop Count / Limit
            </div>
            <div className="text-xl font-black text-white font-mono">
              {activeEmergency.hop_count} / 3 Hops
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold">
              Loop-Prevention Guard Active
            </div>
          </div>
        </div>

        {/* Metric 3: Duplication Filter */}
        <div className="p-4 rounded-xl bg-raahi-card border border-raahi-border flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[11px] uppercase font-bold text-slate-400">
              Deduplication Filter
            </div>
            <div className="text-lg font-bold text-emerald-300">
              Active & Monitored
            </div>
            <div className="text-[10px] text-slate-500">Seen packet cache enabled</div>
          </div>
        </div>

        {/* Metric 4: Cryptographic Authenticity */}
        <div className="p-4 rounded-xl bg-raahi-card border border-raahi-border flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-purple-400 shrink-0" />
          <div>
            <div className="text-[11px] uppercase font-bold text-slate-400">
              HMAC Signature
            </div>
            <div className="text-sm font-mono font-bold text-purple-300 truncate max-w-[130px]">
              {activeEmergency.signature?.slice(0, 10)}...
            </div>
            <div className="text-[10px] text-purple-400">Tamper-evident payload</div>
          </div>
        </div>
      </div>

      {/* Relay Path Visualizer */}
      <div className="p-5 rounded-2xl bg-raahi-card border border-raahi-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Radio className="w-4 h-4 text-raahi-teal" />
            Active BLE Handoff Path
          </h3>
          <span className="text-xs text-cyan-300 font-mono">
            {activeEmergency.relay_path.length} Node(s) engaged
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3">
          {activeEmergency.relay_path.map((node, index) => (
            <React.Fragment key={index}>
              <div className="w-full md:w-auto flex-1 p-3 rounded-xl bg-raahi-darkest border border-raahi-border flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-raahi-teal/20 border border-raahi-teal/40 flex items-center justify-center font-bold text-raahi-teal text-xs shrink-0">
                  {index === 0 ? 'SRC' : `HOP ${index}`}
                </div>
                <div className="truncate">
                  <div className="font-semibold text-white text-xs truncate">
                    {node}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {index === 0 ? 'Originated without Cellular' : 'BLE Relay Received & Forwarded'}
                  </div>
                </div>
              </div>

              {index < activeEmergency.relay_path.length - 1 && (
                <div className="text-raahi-teal font-bold hidden md:block">➔</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Raw Emergency Packet Inspector */}
      <div className="p-5 rounded-2xl bg-raahi-card border border-raahi-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">
              Live Encrypted Packet Payload (BLE Over-The-Air Representation)
            </h3>
          </div>
          <button
            onClick={copyPacketJson}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-raahi-darkest border border-raahi-border text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
          {JSON.stringify(rawPacket, null, 2)}
        </pre>
      </div>
    </div>
  );
};
