import React from 'react';
import {
  Radio,
  Layers,
  ShieldAlert,
  CheckCircle,
  Clock,
  Activity,
  Server,
  Bluetooth,
  Lock,
} from 'lucide-react';
import { EmergencyEvent, RelayDevice } from '../types';

interface AdminDashboardViewProps {
  events: EmergencyEvent[];
  devices: RelayDevice[];
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  events,
  devices,
}) => {
  const activeCount = events.filter(
    (e) => e.status !== 'acknowledged' && e.status !== 'cancelled'
  ).length;
  const acknowledgedCount = events.filter((e) => e.status === 'acknowledged').length;
  const onlineDevicesCount = devices.filter((d) => d.internet_connected).length;

  return (
    <div className="space-y-6 animate-fade-in pb-14">
      {/* Admin Operations Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-raahi-card via-raahi-dark to-raahi-darkest border border-raahi-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-raahi-teal animate-pulse" />
            <h2 className="text-xl font-extrabold text-white">
              Campus Security & Incident Command Desk
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
              Operations Center
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time emergency telemetry for Echelon Institute of Technology & Regional Nodes.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Server className="w-4 h-4 text-emerald-400" />
          <span>FastAPI Engine: <strong className="text-white">Active</strong></span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-raahi-card border border-raahi-border flex items-center gap-3">
          <ShieldAlert className="w-7 h-7 text-raahi-danger shrink-0" />
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">
              Active Incidents
            </div>
            <div className="text-xl font-black text-white font-mono">
              {activeCount}
            </div>
            <div className="text-[10px] text-rose-400">Requires Response</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-raahi-card border border-raahi-border flex items-center gap-3">
          <CheckCircle className="w-7 h-7 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">
              Acknowledged
            </div>
            <div className="text-xl font-black text-white font-mono">
              {acknowledgedCount}
            </div>
            <div className="text-[10px] text-emerald-400">Safe / Guardian Contacted</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-raahi-card border border-raahi-border flex items-center gap-3">
          <Bluetooth className="w-7 h-7 text-raahi-teal shrink-0" />
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">
              Relay Mesh Nodes
            </div>
            <div className="text-xl font-black text-white font-mono">
              {devices.length}
            </div>
            <div className="text-[10px] text-cyan-300">Opted-in community peers</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-raahi-card border border-raahi-border flex items-center gap-3">
          <Activity className="w-7 h-7 text-purple-400 shrink-0" />
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">
              Connected Hubs
            </div>
            <div className="text-xl font-black text-white font-mono">
              {onlineDevicesCount}
            </div>
            <div className="text-[10px] text-purple-300">ESP32 & 4G Forwarders</div>
          </div>
        </div>
      </div>

      {/* Incident Log & Telemetry Table */}
      <div className="p-5 rounded-2xl bg-raahi-card border border-raahi-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm">
            Live Emergency Incident Registry (Data-Minimized)
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {events.length} Recorded Incidents
          </span>
        </div>

        {events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-raahi-darkest text-slate-400 border-b border-raahi-border uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3">Event ID</th>
                  <th className="p-3">Sender (Pseudonymized)</th>
                  <th className="p-3">Trigger Mode</th>
                  <th className="p-3">Relay Path & Hops</th>
                  <th className="p-3">Consented Location</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Acknowledged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-raahi-border/60">
                {events.map((evt) => (
                  <tr key={evt.event_id} className="hover:bg-raahi-cardHover/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-cyan-400">
                      {evt.event_id}
                    </td>
                    <td className="p-3 font-semibold text-white">
                      {evt.user_name}
                    </td>
                    <td className="p-3 uppercase font-medium text-[11px] text-slate-300">
                      {evt.trigger_type.replace('_', ' ')}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-200">
                        {evt.hop_count} Hops
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">
                        {evt.relay_path.join(' ➔ ')}
                      </div>
                    </td>
                    <td className="p-3">
                      {evt.location ? (
                        <div>
                          <div className="font-semibold text-white">
                            {evt.location.location_name || 'Bypass Route'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {evt.location.latitude.toFixed(3)}N, {evt.location.longitude.toFixed(3)}E
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">No Location Consented</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          evt.status === 'acknowledged'
                            ? 'bg-emerald-950 border-emerald-700 text-emerald-400'
                            : 'bg-rose-950 border-raahi-danger text-raahi-danger animate-pulse'
                        }`}
                      >
                        {evt.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">
                      {evt.acknowledged_by || (
                        <span className="text-slate-500 italic">Pending ACK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs">
            No incidents recorded. Clean campus status.
          </div>
        )}
      </div>

      {/* Opted-in Relay Nodes Inventory */}
      <div className="p-5 rounded-2xl bg-raahi-card border border-raahi-border space-y-3">
        <h3 className="font-bold text-white text-sm">
          Opted-In Relay Devices & ESP32 Gateways
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {devices.map((dev) => (
            <div
              key={dev.device_id}
              className="p-3.5 rounded-xl bg-raahi-darkest border border-raahi-border text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white truncate max-w-[130px]">
                  {dev.device_name}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    dev.internet_connected ? 'bg-emerald-400' : 'bg-cyan-400'
                  }`}
                />
              </div>

              <div className="text-slate-400 text-[11px] font-mono">
                ID: {dev.device_id} · RSSI: {dev.ble_rssi} dBm
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-raahi-border">
                <span>Battery: {dev.battery_level}%</span>
                <span className="text-cyan-400">
                  {dev.internet_connected ? 'Cloud Connected' : 'BLE Mesh Only'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
