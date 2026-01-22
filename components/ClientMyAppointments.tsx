
import React from 'react';
import { Appointment, AppointmentStatus } from '../types';
import { SERVICES, BARBERS } from '../constants';

interface ClientMyAppointmentsProps {
  appointments: Appointment[];
  onCancel: (id: string) => void;
}

const ClientMyAppointments: React.FC<ClientMyAppointmentsProps> = ({ appointments, onCancel }) => {
  const myVisibleAppointments = appointments.filter(a => a.status !== AppointmentStatus.CANCELLED);

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Minha Agenda</h2>
        <p className="text-slate-500 mt-2">Veja os detalhes dos seus agendamentos e como chegar até nós.</p>
      </div>

      {myVisibleAppointments.length === 0 ? (
        <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-[2rem] p-16 text-center">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
             <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Nenhum agendamento ativo.</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {myVisibleAppointments.map(app => {
            const barber = BARBERS.find(b => b.id === app.barberId);
            const appServices = app.serviceIds.map(id => SERVICES.find(s => s.id === id));
            const totalPrice = appServices.reduce((acc, s) => acc + (s?.price || 0), 0);
            
            return (
              <div key={app.id} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                       <div className="bg-amber-500 text-slate-950 w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black shadow-lg shadow-amber-500/10">
                          <span className="text-[10px] uppercase opacity-70 leading-none">{new Date(app.date).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                          <span className="text-2xl leading-none">{app.date.split('-')[2]}</span>
                       </div>
                       <div>
                          <div className="text-amber-500 font-black text-xl">{app.startTime}</div>
                          <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                            {new Date(app.date).toLocaleDateString('pt-BR', { weekday: 'long' })}
                          </div>
                       </div>
                    </div>
                    <span className="bg-green-500/10 text-green-500 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-green-500/20">
                      Confirmado
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 border-t border-slate-800 pt-8">
                    {/* Coluna do Barbeiro */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Seu Profissional</h4>
                      <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                        <img src={barber?.avatar} className="w-12 h-12 rounded-full border-2 border-amber-500 object-cover" alt="" />
                        <div>
                          <div className="font-black text-white">{barber?.name}</div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase">{barber?.operatingDays}</div>
                        </div>
                      </div>
                      <a 
                        href={`https://wa.me/${barber?.phone}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-center gap-3 w-full bg-green-500 text-slate-950 font-black py-4 rounded-xl hover:bg-green-400 transition-all text-xs uppercase tracking-widest shadow-lg shadow-green-500/10"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.319 1.592 5.548 0 10.058-4.51 10.06-10.059.002-2.689-1.047-5.215-2.951-7.121C17.175 2.699 14.653 1.65 11.963 1.65c-5.549 0-10.059 4.51-10.06 10.06-.001 2.125.61 4.202 1.768 5.89l-.999 3.646 3.743-.982-.361-.221z"/></svg>
                        WhatsApp Barbeiro
                      </a>
                    </div>

                    {/* Coluna da Unidade / Menu de Informações */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Onde Estamos</h4>
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
                         <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                               <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <div className="space-y-1">
                               <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Endereço</span>
                               <p className="text-xs text-slate-300 font-bold leading-relaxed">{barber?.address}</p>
                            </div>
                         </div>
                         <div className="flex gap-3 border-t border-slate-900 pt-4">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                               <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div className="space-y-1">
                               <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Horário de Funcionamento</span>
                               <p className="text-xs text-slate-300 font-bold">
                                  {barber?.workingHours.start} às {barber?.workingHours.end} • {barber?.operatingDays}
                               </p>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap gap-2">
                    {appServices.map(s => (
                      <span key={s?.id} className="bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-slate-700">
                        {s?.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950/80 p-6 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Valor:</span>
                    <div className="text-lg font-black text-white">R$ {totalPrice}</div>
                  </div>
                  <button 
                    onClick={() => onCancel(app.id)}
                    className="text-[10px] font-black text-red-500/50 hover:text-red-500 uppercase tracking-[0.2em] transition-all hover:scale-105"
                  >
                    Desmarcar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="pt-10 text-center">
         <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">BarberFlow Pro © 2026</p>
      </div>
    </div>
  );
};

export default ClientMyAppointments;
