import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  UserProfile,
  TrustedContact,
  ConsentRecord,
  Journey,
  Checkpoint,
  EmergencyEvent,
  RelayDevice,
  EscalationAssessment,
} from './types';
import { api } from './api';
import { Navbar } from './components/Navbar';
import { HomeDashboard } from './components/HomeDashboard';
import { DiscreetSosModal } from './components/DiscreetSosModal';
import { SafeJourneyModal } from './components/SafeJourneyModal';
import { TrustedCircleView } from './components/TrustedCircleView';
import { EmergencyContactDashboard } from './components/EmergencyContactDashboard';
import { PrivacySettingsModal } from './components/PrivacySettingsModal';
import { MultiDeviceSimView } from './components/MultiDeviceSimView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { OnboardingModal } from './components/OnboardingModal';
import { OfflineEmergencyMode } from './components/OfflineEmergencyMode';

export const App: React.FC = () => {
  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<'user' | 'contact' | 'simulation' | 'admin'>('user');
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Core Data State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [activeEmergency, setActiveEmergency] = useState<EmergencyEvent | null>(null);
  const [events, setEvents] = useState<EmergencyEvent[]>([]);
  const [devices, setDevices] = useState<RelayDevice[]>([]);
  const [escalationAssessment, setEscalationAssessment] = useState<EscalationAssessment | null>(null);

  // Modals
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isDiscreetModalOpen, setIsDiscreetModalOpen] = useState<boolean>(false);
  const [isSafeJourneyModalOpen, setIsSafeJourneyModalOpen] = useState<boolean>(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);

  // Initial Data Fetch
  const loadInitialData = async () => {
    const prof = await api.getProfile();
    setUser(prof);

    const conts = await api.getContacts();
    setContacts(conts);

    const jData = await api.getActiveJourney();
    setJourney(jData.journey);
    setCheckpoints(jData.checkpoints);

    const evts = await api.getEvents();
    setEvents(evts);
    if (evts.length > 0 && evts[0].status !== 'cancelled' && evts[0].status !== 'acknowledged') {
      setActiveEmergency(evts[0]);
    }

    const devs = await api.getRelayDevices();
    setDevices(devs);
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Periodic poll to keep views synchronized
  useEffect(() => {
    const interval = setInterval(async () => {
      const evts = await api.getEvents();
      setEvents(evts);
      if (activeEmergency) {
        const updated = evts.find((e) => e.event_id === activeEmergency.event_id);
        if (updated) setActiveEmergency(updated);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [activeEmergency]);

  // Trigger Emergency SOS (Manual or Discreet)
  const handleTriggerEmergency = async (triggerType: string = 'sos_button') => {
    const event = await api.triggerEmergency({
      trigger_type: triggerType,
      ttl_minutes: 15,
      location: {
        latitude: 28.3845,
        longitude: 77.3126,
        location_name: 'Faridabad Campus Transit Corridor',
        consent_granted: true,
      },
      is_simulated: true,
    });

    setActiveEmergency(event);
    setEvents((prev) => [event, ...prev.filter((e) => e.event_id !== event.event_id)]);
    setIsDiscreetModalOpen(true);
  };

  // Safe Journey Handlers
  const handleStartJourney = async (payload: {
    origin_name: string;
    destination_name: string;
    duration_minutes: number;
    interval_minutes: number;
  }) => {
    const newJ = await api.startJourney(payload);
    setJourney(newJ);
    const jData = await api.getActiveJourney();
    setCheckpoints(jData.checkpoints);
  };

  const handleConfirmCheckIn = async () => {
    await api.confirmCheckIn('I am safe - check in verified.');
    const jData = await api.getActiveJourney();
    setJourney(jData.journey);
    setCheckpoints(jData.checkpoints);

    // Confetti celebration
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#00F0FF', '#10B981', '#ffffff'],
    });
  };

  const handleEndJourney = async () => {
    await api.endJourney();
    setJourney(null);
  };

  const handleSimulateEscalation = async (level: number, offline: boolean) => {
    const res = await api.simulateJourneyEscalation(level, offline);
    setEscalationAssessment(res.assessment);
    if (journey) {
      setJourney({ ...journey, escalation_level: level, status: res.journey_status });
    }
    if (level >= 3) {
      handleTriggerEmergency('missed_checkpoint_escalation');
    }
  };

  // Acknowledge Emergency
  const handleAcknowledge = async (eventId: string, contactName: string, notes?: string) => {
    const ack = await api.acknowledgeEmergency(eventId, contactName, notes);
    if (ack) {
      setActiveEmergency(ack);
      setEvents((prev) => prev.map((e) => (e.event_id === eventId ? ack : e)));
      // Update contact status
      setContacts((prev) =>
        prev.map((c) =>
          contactName.toLowerCase().includes(c.name.toLowerCase().split(' ')[0])
            ? { ...c, ack_status: 'acknowledged' }
            : c
        )
      );
    }
  };

  // Cancel Emergency
  const handleCancelEmergency = async (eventId: string) => {
    await api.cancelEmergency(eventId);
    setActiveEmergency(null);
    setEvents((prev) =>
      prev.map((e) => (e.event_id === eventId ? { ...e, status: 'cancelled' } : e))
    );
  };

  // Relay Step Simulation (Hop 1, Hop 2, Delivered)
  const handleSimulateHop = async (step: number) => {
    if (!activeEmergency) return;
    const updated = await api.simulateHop(activeEmergency.event_id, step);
    if (updated) {
      setActiveEmergency(updated);
      setEvents((prev) =>
        prev.map((e) => (e.event_id === activeEmergency.event_id ? updated : e))
      );
    }
  };

  // Contact Handlers
  const handleAddContact = async (cData: Partial<TrustedContact>) => {
    const added = await api.addContact(cData);
    setContacts((prev) => [...prev, added]);
  };

  const handleDeleteContact = async (cId: string) => {
    await api.deleteContact(cId);
    setContacts((prev) => prev.filter((c) => c.id !== cId));
  };

  // Consent
  const handleUpdateConsent = async (consent: ConsentRecord) => {
    await api.updateConsent(consent);
    if (user) {
      setUser({ ...user, consent });
    }
  };

  // Reset Demo
  const handleResetDemo = async () => {
    await api.resetDemo();
    setActiveEmergency(null);
    setEscalationAssessment(null);
    await loadInitialData();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-raahi-darkest text-slate-300">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-raahi-teal border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm font-semibold text-white">Loading RAAHI Safety Engine...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-raahi-darkest text-slate-100 flex flex-col font-sans">
      {/* Top Universal Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isOnline={isOnline}
        setIsOnline={setIsOnline}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        activeEmergencyCount={activeEmergency && activeEmergency.status !== 'cancelled' ? 1 : 0}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* If emergency is active and offline mode is simulated: show offline emergency banner */}
        {activeEmergency &&
          activeEmergency.status !== 'cancelled' &&
          activeEmergency.status !== 'acknowledged' &&
          !isOnline &&
          currentTab === 'user' && (
            <OfflineEmergencyMode
              activeEmergency={activeEmergency}
              devices={devices}
              onRelayStep={handleSimulateHop}
              onCancelAlert={() => handleCancelEmergency(activeEmergency.event_id)}
            />
          )}

        {/* Tab 1: User App Mobile Dashboard */}
        {currentTab === 'user' && (
          <HomeDashboard
            user={user}
            journey={journey}
            checkpoints={checkpoints}
            contacts={contacts}
            activeEmergency={activeEmergency}
            isOnline={isOnline}
            onTriggerSos={() => handleTriggerEmergency('sos_button')}
            onOpenDiscreetTrigger={() => setIsDiscreetModalOpen(true)}
            onConfirmCheckIn={handleConfirmCheckIn}
            onStartJourneyClick={() => setIsSafeJourneyModalOpen(true)}
            onEndJourneyClick={handleEndJourney}
            onSwitchToContacts={() => setCurrentTab('contact')}
            onSwitchToSimulation={() => setCurrentTab('simulation')}
          />
        )}

        {/* Tab 2: Trusted Circle Screen */}
        {currentTab === 'contact' && (
          <div className="space-y-8">
            <TrustedCircleView
              contacts={contacts}
              onAddContact={handleAddContact}
              onDeleteContact={handleDeleteContact}
            />

            {/* Emergency Contact Receiver View (For Priyal / Pavani) */}
            <EmergencyContactDashboard
              user={user}
              events={events}
              activeEmergency={activeEmergency}
              onAcknowledge={handleAcknowledge}
            />
          </div>
        )}

        {/* Tab 3: Dedicated Hackathon Multi-Device Simulator */}
        {currentTab === 'simulation' && (
          <MultiDeviceSimView
            user={user}
            activeEmergency={activeEmergency}
            devices={devices}
            onTriggerSos={() => handleTriggerEmergency('sos_button')}
            onSimulateHop={handleSimulateHop}
            onAcknowledge={handleAcknowledge}
            onResetDemo={handleResetDemo}
          />
        )}

        {/* Tab 4: Campus Security Incident Command Desk */}
        {currentTab === 'admin' && (
          <AdminDashboardView events={events} devices={devices} />
        )}
      </main>

      {/* Universal Footer with Team ShaktiX Attribution */}
      <footer className="border-t border-raahi-border bg-raahi-dark/60 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>RAAHI</strong> · Resilient Assistance & Emergency Handoff Intelligence · HERHACK 2026
          </div>
          <div>
            Developed by <strong>Team ShaktiX</strong> (Priyal, Pavani, Ayushi Saxena) · Echelon Institute of Technology, Faridabad
          </div>
        </div>
      </footer>

      {/* Modals */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        user={user}
        onSaveConsent={handleUpdateConsent}
      />

      <DiscreetSosModal
        isOpen={isDiscreetModalOpen}
        onClose={() => setIsDiscreetModalOpen(false)}
        activeEvent={activeEmergency}
        onConfirmTrigger={(type) => handleTriggerEmergency(type)}
        onCancelEvent={handleCancelEmergency}
      />

      <SafeJourneyModal
        isOpen={isSafeJourneyModalOpen}
        onClose={() => setIsSafeJourneyModalOpen(false)}
        activeJourney={journey}
        checkpoints={checkpoints}
        onStartJourney={handleStartJourney}
        onConfirmCheckIn={handleConfirmCheckIn}
        onSimulateEscalation={handleSimulateEscalation}
        escalationAssessment={escalationAssessment}
      />

      <PrivacySettingsModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        consent={user.consent}
        onUpdateConsent={handleUpdateConsent}
        onPurgeData={handleResetDemo}
      />
    </div>
  );
};
export default App;
