import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Trash2,
  Phone,
  ShieldCheck,
  CheckCircle,
  Clock,
  Send,
  AlertCircle,
} from 'lucide-react';
import { TrustedContact } from '../types';

interface TrustedCircleViewProps {
  contacts: TrustedContact[];
  onAddContact: (contact: Partial<TrustedContact>) => void;
  onDeleteContact: (contactId: string) => void;
}

export const TrustedCircleView: React.FC<TrustedCircleViewProps> = ({
  contacts,
  onAddContact,
  onDeleteContact,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('Friend');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    onAddContact({ name, phone, relationship });
    setName('');
    setPhone('');
    setRelationship('Friend');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-raahi-card via-raahi-dark to-raahi-darkest border border-raahi-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-raahi-teal" />
            <h2 className="text-xl font-extrabold text-white">
              Trusted Circle
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Selected guardians receiving verified alerts, consented location & journey updates.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-raahi-teal to-cyan-400 text-raahi-darkest font-bold text-xs shadow-md hover:shadow-raahi-teal/20 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>{showAddForm ? 'Cancel' : 'Add Contact'}</span>
        </button>
      </div>

      {/* Add Contact Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="p-5 rounded-2xl bg-raahi-card border border-raahi-border space-y-4 text-xs animate-fade-in"
        >
          <h3 className="font-bold text-white text-sm">
            Add New Guardian to Trusted Circle
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Priyal Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-raahi-darkest border border-raahi-border text-white outline-none focus:ring-1 focus:ring-raahi-teal"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+91 98XXX XXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-raahi-darkest border border-raahi-border text-white outline-none focus:ring-1 focus:ring-raahi-teal"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Relationship
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-raahi-darkest border border-raahi-border text-white outline-none focus:ring-1 focus:ring-raahi-teal"
              >
                <option value="Team ShaktiX">Team ShaktiX</option>
                <option value="Family Member">Family Member</option>
                <option value="Campus Security">Campus Security</option>
                <option value="Local Guardian">Local Guardian</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-raahi-teal text-raahi-darkest font-bold shadow-md hover:bg-cyan-300 transition-colors"
            >
              Save Guardian
            </button>
          </div>
        </form>
      )}

      {/* Contacts List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="p-5 rounded-2xl bg-raahi-card border border-raahi-border hover:border-raahi-teal/30 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">
                    {contact.name}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {contact.relationship}
                  </span>
                </div>
                <button
                  onClick={() => onDeleteContact(contact.id)}
                  title="Remove contact"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-raahi-danger hover:bg-raahi-darkest transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs font-mono text-cyan-400 bg-raahi-darkest p-2 rounded-xl border border-raahi-border">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{contact.phone}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-raahi-border/60 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Explicit Consent Given
              </span>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  contact.ack_status === 'acknowledged'
                    ? 'bg-emerald-950 border-emerald-800 text-emerald-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {contact.ack_status === 'acknowledged' ? 'ACK Received' : 'Standby'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Privacy Note */}
      <div className="p-4 rounded-xl bg-raahi-darkest border border-raahi-border text-xs text-slate-400 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-raahi-teal shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-white">Controlled Transmission Rule</div>
          <p className="mt-0.5 text-slate-400">
            RAAHI never silently sends your location to contacts during normal movement. Contacts are only notified when you explicitly activate SOS or miss a scheduled journey check-in prompt after the grace period.
          </p>
        </div>
      </div>
    </div>
  );
};
