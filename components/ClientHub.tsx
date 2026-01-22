
import React, { useState } from 'react';
import ClientBooking from './ClientBooking';
import ClientMyAppointments from './ClientMyAppointments';
import { Appointment } from '../types';

interface ClientHubProps {
  onBook: (appointment: Partial<Appointment>) => void;
  appointments: Appointment[];
  onCancel: (id: string) => void;
}

const ClientHub: React.FC<ClientHubProps> = ({ onBook, appointments, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'booking' | 'my-appointments'>('booking');

  return (
    <div className="space-y-8">
      {/* Menu de Abas (Sub-menu da seção Agendamento) */}
      <div className="flex justify-center p-1 bg-slate-900 border border-slate-800 rounded-2xl max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('booking')}
          className={`flex-1 py-3 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'booking'
              ? 'bg-amber-500 text-slate-950 shadow-lg'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Novo Agendamento
        </button>
        <button
          onClick={() => setActiveTab('my-appointments')}
          className={`flex-1 py-3 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'my-appointments'
              ? 'bg-amber-500 text-slate-950 shadow-lg'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Meus Horários
        </button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'booking' ? (
          <ClientBooking 
            onBook={onBook} 
            existingAppointments={appointments} 
            onGoToMyAppointments={() => setActiveTab('my-appointments')} 
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
