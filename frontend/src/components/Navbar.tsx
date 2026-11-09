import React from 'react';
import {
  ShieldAlert,
  Wifi,
  WifiOff,
  Bluetooth,
  Smartphone,
  Users,
  Layers,
  Radio,
  Settings,
  Info,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'user' | 'contact' | 'simulation' | 'admin';
  setCurrentTab: (tab: 'user' | 'contact' | 'simulation' | 'admin') => void;
  isOnline: boolean;
  setIsOnline: (val: boolean) => void;
  onOpenPrivacy: () => void;
  onOpenOnboarding: () => void;
  activeEmergencyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  isOnline,
  setIsOnline,
  onOpenPrivacy,
  onOpenOnboarding,
  activeEmergencyCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-raahi-dark/90 backdrop-blur-md border-b border-raahi-border px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Team ShaktiX Attribution */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-raahi-teal flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldAlert className="w-6 h-6 text-raahi-darkest" />
            </div>
            {activeEmergencyCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-raahi-danger opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-raahi-danger text-[9px] text-white font-bold items-center justify-center">
                  {activeEmergencyCount}
                </span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-raahi-teal font-sans">
                RAAHI
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300">
                HERHACK 2026
              </span>
              <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline">
                by <strong className="text-cyan-400">Team ShaktiX</strong>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              When the network fails, your safety network doesn't.
            </p>
          </div>
        </div>

        {/* View Switcher Tabs (For Hackathon Judges) */}
        <div className="flex items-center gap-1 bg-raahi-darkest/80 p-1 rounded-xl border border-raahi-border text-xs font-medium">
          <button
            onClick={() => setCurrentTab('user')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentTab === 'user'
                ? 'bg-raahi-teal text-raahi-darkest font-bold shadow-md shadow-raahi-teal/20'
                : 'text-slate-300 hover:text-white hover:bg-raahi-card'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile App</span>
          </button>

          <button
            onClick={() => setCurrentTab('contact')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentTab === 'contact'
                ? 'bg-raahi-teal text-raahi-darkest font-bold shadow-md shadow-raahi-teal/20'
                : 'text-slate-300 hover:text-white hover:bg-raahi-card'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Trusted Circle</span>
            {activeEmergencyCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-raahi-danger animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setCurrentTab('simulation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentTab === 'simulation'
                ? 'bg-raahi-teal text-raahi-darkest font-bold shadow-md shadow-raahi-teal/20'
                : 'text-slate-300 hover:text-white hover:bg-raahi-card'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="font-semibold text-emerald-300">Mesh Simulator</span>
          </button>

          <button
            onClick={() => setCurrentTab('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentTab === 'admin'
                ? 'bg-raahi-teal text-raahi-darkest font-bold shadow-md shadow-raahi-teal/20'
                : 'text-slate-300 hover:text-white hover:bg-raahi-card'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Campus Desk</span>
          </button>
        </div>

        {/* Connectivity Toggle & Statuses */}
        <div className="flex items-center gap-2">
          {/* Internet Toggle Switch */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            title="Click to toggle Internet connectivity (Simulate Dead Zone)"
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isOnline
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/40'
                : 'bg-rose-950/80 border-raahi-danger text-raahi-danger animate-pulse'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Online (Cellular)</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-raahi-danger" />
                <span>Offline (Dead Zone)</span>
              </>
            )}
          </button>

          {/* BLE Beacon Status Pill */}
          <div
            title="Opted-in BLE Mesh Relay Active"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-950/60 border border-cyan-500/30 text-cyan-300"
          >
            <Bluetooth className="w-3.5 h-3.5 text-raahi-teal animate-pulse" />
            <span className="hidden md:inline">BLE Mesh Ready</span>
          </div>

          {/* Privacy & Project Info Buttons */}
          <button
            onClick={onOpenPrivacy}
            title="Privacy & Permission Settings"
            className="p-2 rounded-lg bg-raahi-card hover:bg-raahi-cardHover border border-raahi-border text-slate-300 hover:text-raahi-teal transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenOnboarding}
            title="Project Identity & Information"
            className="p-2 rounded-lg bg-raahi-card hover:bg-raahi-cardHover border border-raahi-border text-slate-300 hover:text-raahi-teal transition-colors"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
