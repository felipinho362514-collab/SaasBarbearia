
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
    return { stats: { total, completed, faturamento }, dayAppointments: filtered.sort((a, b) => a.startTime.localeCompare(b.startTime)) };
  }, [appointments, selectedDate]);

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 transform-gpu pb-20">
      {/* Seletor de Data App-Style */}
      <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-5 shadow-2xl">
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Escala da Semana</h3>
          {!isToday && (
            <button onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])} className="text-[9px] font-black text-slate-500 uppercase underline">Hoje</button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar snap-x">
          {weekDays.map((day) => (
            <button
              key={day.isoDate}
              onClick={() => setSelectedDate(day.isoDate)}
              className={`flex flex-col items-center justify-center min-w-[55px] py-3 rounded-2xl border-2 transition-all snap-center active:scale-95 ${
                selectedDate === day.isoDate ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-slate-950 border-slate-800 text-slate-600'
              }`}
            >
              <span className="text-[7px] font-black uppercase mb-1">{day.dayName}</span>
              <span className="text-base font-black">{day.dayNumber}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Fila', value: stats.total, color: 'text-white' },
          { label: 'Ok', value: stats.completed, color: 'text-green-500' },
          { label: 'R$', value: `R$${stats.faturamento}`, color: 'text-amber-500' }
        ].map(stat => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800/50 p-4 rounded-2xl text-center">
            <div className="text-[8px] font-black text-slate-500 uppercase mb-1">{stat.label}</div>
            <div className={`text-sm font-black ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Lista de Agendamentos - Mobile Optimized Cards */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Agenda do Dia</h4>
        {dayAppointments.length === 0 ? (
          <div className="bg-slate-900/30 border-2 border-dashed border-slate-800 p-10 rounded-[2.5rem] text-center">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Folga total por aqui</p>
          </div>
        ) : (
          dayAppointments.map(app => (
            <div key={app.id} className="bg-slate-900 border border-slate-800 p-5 rounded-[2rem] shadow-lg flex flex-col gap-4 active:bg-slate-800/50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500 text-slate-950 px-3 py-1 rounded-xl font-black text-base">{app.startTime}</div>
                  <div>
                    <div className="text-sm font-black text-slate-100 uppercase tracking-tighter leading-none">{app.clientName}</div>
                    <div className="text-[9px] font-bold text-amber-500 mt-1">{app.clientPhone}</div>
                  </div>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                  app.status === AppointmentStatus.SCHEDULED ? 'bg-blue-500/10 text-blue-400' :
                  app.status === AppointmentStatus.COMPLETED ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {app.status}
                </div>
              </div>

              {app.status === AppointmentStatus.SCHEDULED && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <button 
                    onClick={() => onUpdateStatus(app.id, AppointmentStatus.COMPLETED)}
                    className="bg-green-500 text-slate-950 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest active:scale-95"
                  >
                    Finalizar
                  </button>
                  <button 
                    onClick={() => onUpdateStatus(app.id, AppointmentStatus.NO_SHOW)}
                    className="bg-slate-800 text-red-400 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest border border-red-500/10 active:scale-95"
                  >
                    Ausente
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default AdminDashboard;
