
import React, { useMemo, useState } from 'react';
import { Appointment, AppointmentStatus } from '../types';
import { SERVICES, BARBERS } from '../constants';

interface AdminDashboardProps {
  appointments: Appointment[];
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ appointments, onUpdateStatus }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // OTIMIZAÇÃO: Gerar próximos 14 dias para navegação de forma memoizada
  const weekDays = useMemo(() => {
    const days = [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(now.getDate() + i);
      const isoDate = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      const dayNumber = date.getDate();
      days.push({ isoDate, dayName, dayNumber, isToday: isoDate === todayStr });
    }
    return days;
  }, []);

  // OTIMIZAÇÃO: Processamento síncrono e único de dados para o dia selecionado
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

    const sorted = filtered.sort((a, b) => a.startTime.localeCompare(b.startTime));

    return {
      stats: { total, completed, faturamento },
      dayAppointments: sorted
    };
  }, [appointments, selectedDate]);

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8 transform-gpu">
      {/* Navegação de Data */}
      <section className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
        <div className="flex justify-between items-center mb-6 px-2">
          <h3 className="text-xs font-black text-amber-500 uppercase tracking-[0.3em]">Agenda da Semana</h3>
          <button 
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors duration-200"
          >
            Voltar para Hoje
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x touch-pan-x">
          {weekDays.map((day) => (
            <button
              key={day.isoDate}
              onClick={() => setSelectedDate(day.isoDate)}
              className={`flex flex-col items-center justify-center min-w-[70px] py-4 rounded-2xl border-2 transition-all duration-200 snap-start ${
                selectedDate === day.isoDate
                  ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
              }`}
            >
              <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${
                selectedDate === day.isoDate ? 'text-slate-900/60' : 'text-slate-600'
              }`}>
                {day.isToday ? 'Hoje' : day.dayName}
              </span>
              <span className="text-xl font-black">{day.dayNumber}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl">
          <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Agendados ({dayAppointments.length})</div>
          <div className="text-3xl font-black text-white">{stats.total}</div>
        </div>
        <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl">
          <div className="text-green-500/50 text-[10px] font-black uppercase tracking-widest mb-1">Finalizados</div>
          <div className="text-3xl font-black text-green-500">{stats.completed}</div>
        </div>
        <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl border-amber-500/20">
          <div className="text-amber-500/50 text-[10px] font-black uppercase tracking-widest mb-1">Receita {isToday ? 'de Hoje' : 'Prevista'}</div>
          <div className="text-3xl font-black text-amber-500">R$ {stats.faturamento}</div>
        </div>
      </div>

      {/* Lista de Agendamentos */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tighter">
            {isToday ? 'Fila de Hoje' : `Agenda: ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}`}
          </h3>
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest w-fit">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
        
        {dayAppointments.length === 0 ? (
          <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-[2.5rem] p-12 text-center">
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nenhum cliente marcado para este dia.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {dayAppointments.map(app => {
                const barber = BARBERS.find(b => b.id === app.barberId);
                return (
                  <div key={app.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg animate-in fade-in zoom-in duration-300 will-change-transform">
                    <div className="flex justify-between items-start">
                      <div className="bg-amber-500 text-slate-950 px-3 py-1 rounded-lg font-black text-lg">{app.startTime}</div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        app.status === AppointmentStatus.SCHEDULED ? 'bg-blue-500/10 text-blue-400' :
                        app.status === AppointmentStatus.COMPLETED ? 'bg-green-500/10 text-green-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <div>
                      <div className="font-black text-white text-lg leading-tight">{app.clientName}</div>
                      <div className="text-amber-500 text-xs font-bold mt-1">{app.clientPhone}</div>
                    </div>
                    <div className="flex items-center gap-2 pt-4 border-t border-slate-800">
                      <img loading="lazy" src={barber?.avatar} className="w-8 h-8 rounded-full border border-slate-700" alt="" />
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{barber?.name.split(' ')[0]}</span>
                    </div>
                    {app.status === AppointmentStatus.SCHEDULED && (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button 
                          onClick={() => onUpdateStatus(app.id, AppointmentStatus.COMPLETED)}
                          className="bg-green-500 text-slate-950 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-500/10 transition-all active:scale-95"
                        >
                          Finalizar
                        </button>
                        <button 
                          onClick={() => onUpdateStatus(app.id, AppointmentStatus.NO_SHOW)}
                          className="bg-slate-800 text-red-400 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest border border-red-500/20 transition-all active:scale-95"
                        >
                          Faltou
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-950 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    <th className="px-8 py-6">Horário</th>
                    <th className="px-8 py-6">Cliente</th>
                    <th className="px-8 py-6">Profissional</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {dayAppointments.map(app => {
                    const barber = BARBERS.find(b => b.id === app.barberId);
                    return (
                      <tr key={app.id} className="hover:bg-slate-800/20 transition-colors duration-150">
                        <td className="px-8 py-6">
                          <span className="bg-amber-500/10 text-amber-500 font-black px-4 py-2 rounded-xl text-sm border border-amber-500/10">
                            {app.startTime}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="font-black text-slate-100">{app.clientName}</div>
                          <div className="text-xs text-slate-500 font-bold tracking-tight">{app.clientPhone}</div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <img loading="lazy" src={barber?.avatar} className="w-8 h-8 rounded-full border-2 border-slate-800" alt="" />
                            <span className="text-sm text-slate-300 font-black uppercase tracking-tighter">{barber?.name.split(' ')[0]}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            app.status === AppointmentStatus.SCHEDULED ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            app.status === AppointmentStatus.COMPLETED ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {app.status === AppointmentStatus.SCHEDULED ? 'Agendado' : 
                             app.status === AppointmentStatus.COMPLETED ? 'Finalizado' : 'Ausente'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          {app.status === AppointmentStatus.SCHEDULED && (
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => onUpdateStatus(app.id, AppointmentStatus.COMPLETED)}
                                className="bg-green-500 text-slate-950 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-400 transition-all duration-200"
                              >
                                Finalizar
                              </button>
                              <button 
                                onClick={() => onUpdateStatus(app.id, AppointmentStatus.NO_SHOW)}
                                className="bg-red-500/10 text-red-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all duration-200 border border-red-500/20"
                              >
                                Faltou
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
