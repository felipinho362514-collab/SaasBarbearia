
import React, { useMemo } from 'react';
import { Appointment, AppointmentStatus } from '../types';
import { SERVICES, BARBERS } from '../constants';

interface AdminDashboardProps {
  appointments: Appointment[];
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ appointments, onUpdateStatus }) => {
  const today = new Date().toISOString().split('T')[0];
  
  const stats = useMemo(() => {
    const todayApps = appointments.filter(a => a.date === today && a.status !== AppointmentStatus.CANCELLED);
    const completed = todayApps.filter(a => a.status === AppointmentStatus.COMPLETED).length;
    const faturamento = todayApps
      .filter(a => a.status === AppointmentStatus.COMPLETED)
      .reduce((acc, curr) => {
        const servicesTotal = curr.serviceIds.reduce((sum, sId) => {
          const service = SERVICES.find(s => s.id === sId);
          return sum + (service?.price || 0);
        }, 0);
        return acc + servicesTotal;
      }, 0);
    return { completed, faturamento, total: todayApps.length };
  }, [appointments, today]);

  const sortedAppointments = [...appointments]
    .filter(a => a.date === today && a.status !== AppointmentStatus.CANCELLED)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl">
          <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Hoje</div>
          <div className="text-3xl font-black text-white">{stats.total}</div>
        </div>
        <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl">
          <div className="text-green-500/50 text-[10px] font-black uppercase tracking-widest mb-1">Concluídos</div>
          <div className="text-3xl font-black text-green-500">{stats.completed}</div>
        </div>
        <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl border-amber-500/20">
          <div className="text-amber-500/50 text-[10px] font-black uppercase tracking-widest mb-1">Faturamento</div>
          <div className="text-3xl font-black text-amber-500">R$ {stats.faturamento}</div>
        </div>
      </div>

      {/* Appointment List / Cards */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tighter">Fila de Hoje</h3>
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest w-fit">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
        
        {sortedAppointments.length === 0 ? (
          <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-[2.5rem] p-12 text-center">
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nenhum agendamento para hoje.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {/* Mobile Cards (Visible only on small screens) */}
            <div className="md:hidden space-y-4">
              {sortedAppointments.map(app => {
                const barber = BARBERS.find(b => b.id === app.barberId);
                const servicesCount = app.serviceIds.length;
                return (
                  <div key={app.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
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
                      <div className="font-black text-white text-lg">{app.clientName}</div>
                      <div className="text-amber-500 text-xs font-bold">{app.clientPhone}</div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <img src={barber?.avatar} className="w-6 h-6 rounded-full" alt="" />
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{barber?.name.split(' ')[0]} • {servicesCount} serviço(s)</span>
                    </div>
                    {app.status === AppointmentStatus.SCHEDULED && (
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <button 
                          onClick={() => onUpdateStatus(app.id, AppointmentStatus.COMPLETED)}
                          className="bg-green-500 text-slate-950 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest"
                        >
                          Finalizar
                        </button>
                        <button 
                          onClick={() => onUpdateStatus(app.id, AppointmentStatus.NO_SHOW)}
                          className="bg-slate-800 text-red-400 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border border-red-500/20"
                        >
                          Faltou
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (Visible only on medium+ screens) */}
            <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-950 text-slate-500 text-[10px] uppercase tracking-widest">
                    <th className="px-8 py-6">Horário</th>
                    <th className="px-8 py-6">Cliente</th>
                    <th className="px-8 py-6">Profissional</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {sortedAppointments.map(app => {
                    const barber = BARBERS.find(b => b.id === app.barberId);
                    return (
                      <tr key={app.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-8 py-6">
                          <span className="bg-amber-500/10 text-amber-500 font-black px-3 py-1.5 rounded-xl text-sm border border-amber-500/10">{app.startTime}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="font-black text-slate-100">{app.clientName}</div>
                          <div className="text-xs text-slate-500 font-bold tracking-tight">{app.clientPhone}</div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <img src={barber?.avatar} className="w-8 h-8 rounded-full border-2 border-slate-800" alt="" />
                            <span className="text-sm text-slate-300 font-black uppercase tracking-tighter">{barber?.name.split(' ')[0]}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            app.status === AppointmentStatus.SCHEDULED ? 'bg-blue-500/10 text-blue-400 border border-blue-500/10' :
                            app.status === AppointmentStatus.COMPLETED ? 'bg-green-500/10 text-green-400 border border-green-500/10' :
                            'bg-red-500/10 text-red-400 border border-red-500/10'
                          }`}>
                            {app.status === AppointmentStatus.SCHEDULED ? 'Agendado' : 
                             app.status === AppointmentStatus.COMPLETED ? 'Finalizado' : 'Faltou'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right space-x-2">
                          {app.status === AppointmentStatus.SCHEDULED && (
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => onUpdateStatus(app.id, AppointmentStatus.COMPLETED)}
                                className="bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-slate-950 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-green-500/20"
                              >
                                Finalizar
                              </button>
                              <button 
                                onClick={() => onUpdateStatus(app.id, AppointmentStatus.NO_SHOW)}
                                className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-slate-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-500/20"
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
    </div>
  );
};

export default AdminDashboard;
