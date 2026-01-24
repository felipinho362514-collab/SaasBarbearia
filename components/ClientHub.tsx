
import React, { useState } from 'react';
import ClientBooking from './ClientBooking';
import ClientMyAppointments from './ClientMyAppointments';
import { Appointment, User } from '../types';

interface ClientHubProps {
  loggedClient: User;
  onBook: (appointment: Partial<Appointment>) => void;
  appointments: Appointment[];
  onCancel: (id: string) => void;
}

const ClientHub: React.FC<ClientHubProps> = ({ loggedClient, onBook, appointments, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'booking' | 'my-appointments'>('booking');

  const handleBookWithUser = (appointmentData: Partial<Appointment>) => {
    onBook({
      ...appointmentData,
      clientId: loggedClient.id,
      clientName: loggedClient.name,
      clientPhone: loggedClient.phone || ''
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-center p-1 bg-slate-900 border border-slate-800 rounded-2xl max-w-sm mx-auto mt-6">
        <button
          onClick={() => setActiveTab('booking')}
          className={`flex-1 py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'booking' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-500'
          }`}
        >
          Novo Agendamento
        </button>
        <button
          onClick={() => setActiveTab('my-appointments')}
          className={`flex-1 py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'my-appointments' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-500'
          }`}
        >
          Minha Agenda ({appointments.filter(a => a.status === 'SCHEDULED').length})
        </button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
        {activeTab === 'booking' ? (
          <ClientBooking 
            onBook={handleBookWithUser} 
            existingAppointments={appointments} 
            onGoToMyAppointments={() => setActiveTab('my-appointments')}
            prefillName={loggedClient.name}
            prefillPhone={loggedClient.phone}
          />
        ) : (
          <ClientMyAppointments 
            appointments={appointments} 
            onCancel={onCancel} 
          />
        )}
      </div>
    </div>
  );
};

export default ClientHub;
