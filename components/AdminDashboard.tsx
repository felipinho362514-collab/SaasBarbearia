
import React, { useMemo, useState } from 'react';
import { Appointment, AppointmentStatus } from '../types';
import { SERVICES, BARBERS } from '../constants';

interface AdminDashboardProps {
  appointments: Appointment[];
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ appointments, onUpdateStatus }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const weekDays = useMemo(() => {
    const days = [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    for (let i = -2; i < 12; i++) { // Mostra 2 dias passados e 12 futuros
      const date = new Date();
      date.setDate(now.getDate() + i);
      const isoDate = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      const dayNumber = date.getDate();
      days.push({ isoDate, dayName, dayNumber, isToday: isoDate === todayStr });
    }
    return days;
  }, []);

  const { stats, dayAppointments } = useMemo(() => {
    let total = 0;
    let completed = 0;
    let faturamento = 0;
    const filtered = appointments.filter(app => {
      if (app.date !== selectedDate || app.status === AppointmentStatus.CANCELLED) return false;
      total++;
      if (app.status === AppointmentStatus.COMPLETED) {
        completed++;
        app.serviceIds.forEach(sId => {
          const service = SERVICES.find(s => s.id === sId);
          if (service) faturamento += service.price;
        });
      }
      return true;
    });
    return { 
      stats: { total, completed, faturamento }, 
      dayAppointments: filtered.sort((a, b) => a.startTime.localeCompare(b.startTime)) 
    };
  }, [appointments, selectedDate]);

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-500">
      {/* Header de Gestão */}
      <section className="px-2">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Painel do Mestre</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Gestão de Fluxo e Caixa</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-2xl">
             <span className="text-amber-500 font-black text-sm">R$ {stats.faturamento}</span>
          </div>
        </div>

        {/* Mini Dash de Performance */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-xl">
            <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Agendados</span>
            <span className="text-xl font-black text-white">{stats.total}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-xl">
            <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Concluídos</span>
            <span className="text-xl font-black text-green-500">{stats.completed}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-xl">
            <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Pendente</span>
            <span className="text-xl font-black text-amber-500">{stats.total - stats.completed}</span>
          </div>
        </div>
      </section>

      {/* Seletor de Escala (Strip Tátil) */}
      <section className="bg-slate-900/50 border-y border-slate-800/50 py-6">
        <div className="flex justify-between items-center mb-4 px-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Escala Semanal</h3>
          {!isToday && (
            <button 
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])} 
              className="bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase px-3 py-1 rounded-full border border-amber-500/20 active:scale-90 transition-all"
            >
              Voltar para Hoje
            </button>
          )}
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-6 snap-x">
          {weekDays.map((day) => (
            <button
              key={day.isoDate}
              onClick={() => setSelectedDate(day.isoDate)}
              className={`flex flex-col items-center justify-center min-w-[65px] py-4 rounded-[1.8rem] border-2 transition-all snap-center active:scale-95 ${
                selectedDate === day.isoDate 
                  ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-105 z-10' 
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <span className={`text-[8px] font-black uppercase mb-1.5 ${selectedDate === day.isoDate ? 'text-slate-900' : 'opacity-60'}`}>
                {day.dayName}
              </span>
              <span className="text-lg font-black">{day.dayNumber}</span>
              {day.isToday && selectedDate !== day.isoDate && (
                <div className="w-1 h-1 bg-amber-500 rounded-full mt-1" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Feed de Atendimentos */}
      <section className="px-4 space-y-4">
        <div className="flex items-center gap-2 mb-2 px-2">
           <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
           <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
             {isToday ? 'Atendimentos de Hoje' : `Agenda para ${new Date(selectedDate).toLocaleDateString('pt-BR')}`}
           </h4>
        </div>

        {dayAppointments.length === 0 ? (
          <div className="py-20 text-center bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3rem]">
            <div className="text-slate-700 font-black uppercase tracking-[0.3em] text-[10px]">Sem horários marcados</div>
          </div>
        ) : (
          dayAppointments.map(app => (
            <div 
              key={app.id} 
              className={`bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] shadow-xl flex flex-col gap-6 transition-all active:bg-slate-800/50 ${
                app.status === AppointmentStatus.COMPLETED ? 'opacity-50 grayscale' : 'opacity-100'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="bg-amber-500 text-slate-950 px-4 py-2 rounded-2xl font-black text-lg shadow-lg">
                    {app.startTime}
                  </div>
                  <div>
                    <h5 className="text-[15px] font-black text-slate-100 uppercase tracking-tight leading-none">{app.clientName}</h5>
                    <p className="text-[10px] font-bold text-amber-500/80 mt-1.5 tracking-widest">{app.clientPhone}</p>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border ${
                  app.status === AppointmentStatus.SCHEDULED ? 'bg-blue-500/5 border-blue-500/20 text-blue-400' :
                  app.status === AppointmentStatus.COMPLETED ? 'bg-green-500/5 border-green-500/20 text-green-400' : 
                  'bg-red-500/5 border-red-500/20 text-red-400'
                }`}>
                  {app.status === AppointmentStatus.SCHEDULED ? 'Confirmado' : 
                   app.status === AppointmentStatus.COMPLETED ? 'Finalizado' : 'Ausente'}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {app.serviceIds.map(sId => {
                  const s = SERVICES.find(serv => serv.id === sId);
                  return (
                    <span key={sId} className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase text-slate-500 tracking-tighter">
                      {s?.name}
                    </span>
                  );
                })}
              </div>

              {app.status === AppointmentStatus.SCHEDULED && (
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/50">
                  <button 
                    onClick={() => onUpdateStatus(app.id, AppointmentStatus.COMPLETED)}
                    className="bg-green-600/90 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all shadow-lg shadow-green-900/20"
                  >
                    Marcar Presença
                  </button>
                  <button 
                    onClick={() => onUpdateStatus(app.id, AppointmentStatus.NO_SHOW)}
                    className="bg-slate-950 border border-red-500/20 text-red-500/70 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all"
                  >
                    Não Compareceu
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </section>

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default AdminDashboard;
