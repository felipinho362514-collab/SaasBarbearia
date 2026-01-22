
import React from 'react';
import { Appointment, AppointmentStatus } from '../types';
import { SERVICES, BARBERS } from '../constants';

interface ClientMyAppointmentsProps {
  appointments: Appointment[];
  onCancel: (id: string) => void;
}

const ClientMyAppointments: React.FC<ClientMyAppointmentsProps> = ({ appointments, onCancel }) => {
  // Filtramos para exibir apenas o que não foi cancelado, para limpar a visão do cliente.
  const myVisibleAppointments = appointments.filter(a => a.status !== AppointmentStatus.CANCELLED);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Meus Compromissos</h2>
        <p className="text-slate-500 mt-2">Acompanhe seus horários e gerencie suas reservas.</p>
      </div>

      {myVisibleAppointments.length === 0 ? (
        <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-[2rem] p-12 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-slate-400 font-medium">Você ainda não possui agendamentos ativos.</p>
          <p className="text-slate-600 text-xs mt-2 uppercase tracking-widest font-bold">Os horários cancelados são removidos automaticamente.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {myVisibleAppointments.map(app => {
            const barber = BARBERS.find(b => b.id === app.barberId);
            const appServices = app.serviceIds.map(id => SERVICES.find(s => s.id === id));
            const totalPrice = appServices.reduce((acc, s) => acc + (s?.price || 0), 0);
            
            return (
              <div key={app.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 transition-all hover:border-amber-500/30">
                <div className="p-6 flex flex-col md:flex-row gap-6">
                  {/* Badge de Data/Hora */}
                  <div className="bg-amber-500 text-slate-950 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[100px] shadow-lg shadow-amber-500/10">
                    <span className="text-xs font-black uppercase tracking-tighter opacity-70">
                      {new Date(app.date).toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </span>
                    <span className="text-2xl font-black leading-none my-1">
                      {app.startTime}
                    </span>
                    <span className="text-[10px] font-bold opacity-70">
                      {app.date.split('-').reverse().slice(0, 2).join('/')}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Profissional</h4>
                        <div className="flex items-center gap-2">
                          <img src={barber?.avatar} className="w-5 h-5 rounded-full object-cover" alt="" />
                          <span className="font-bold text-slate-100">{barber?.name}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                          app.status === AppointmentStatus.SCHEDULED ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          app.status === AppointmentStatus.COMPLETED ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          'bg-slate-800 text-slate-500'
                        }`}>
                          {app.status === AppointmentStatus.SCHEDULED ? 'Confirmado' : 
                           app.status === AppointmentStatus.COMPLETED ? 'Concluído' : 'Finalizado'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-800">
                      <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Serviços Contratados</h4>
                      <div className="flex flex-wrap gap-2">
                        {appServices.map(s => (
                          <span key={s?.id} className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-1 rounded-lg">
                            {s?.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/50 p-4 px-6 border-t border-slate-800 flex justify-between items-center">
                  <div className="text-sm font-bold text-amber-500">
                    Total: R$ {totalPrice}
                  </div>
                  {app.status === AppointmentStatus.SCHEDULED && (
                    <button 
                      onClick={() => {
                        // Chamada direta para garantir funcionamento
                        onCancel(app.id);
                      }}
                      className="text-[10px] font-black text-red-500 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl uppercase tracking-widest transition-all"
                    >
                      Cancelar Reserva
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientMyAppointments;
