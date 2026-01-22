
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
    const todayApps = appointments.filter(a => a.date === today);
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
    .filter(a => a.date === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 border-l-4 border-l-blue-500">
          <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total de Hoje</div>
          <div className="text-3xl font-bold mt-1">{stats.total}</div>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 border-l-4 border-l-green-500">
          <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">Concluídos</div>
          <div className="text-3xl font-bold mt-1">{stats.completed}</div>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 border-l-4 border-l-amber-500">
          <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">Faturamento</div>
          <div className="text-3xl font-bold mt-1 text-amber-500">R$ {stats.faturamento}</div>
        </div>
      </div>

      {/* Appointment List */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-slate-100">Fila do Dia</h3>
          <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-xs font-bold uppercase border border-amber-500/20">Hoje • {today}</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950 text-slate-500 text-[10px] uppercase tracking-widest">
                <th className="px-6 py-4">Horário</th>
                <th className="px-6 py-4">Cliente / Contato</th>
                <th className="px-6 py-4">Barbeiro</th>
                <th className="px-6 py-4">Serviços</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {sortedAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                    Nenhum agendamento para hoje ainda.
                  </td>
                </tr>
              ) : (
                sortedAppointments.map(app => {
                  const serviceNames = app.serviceIds
                    .map(id => SERVICES.find(s => s.id === id)?.name)
                    .filter(Boolean)
                    .join(', ');
                  const barber = BARBERS.find(b => b.id === app.barberId);
                  
                  return (
                    <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="bg-amber-500/10 text-amber-500 font-black px-2 py-1 rounded text-sm">{app.startTime}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-black text-slate-100 mb-1">{app.clientName}</div>
                        <div className="text-sm text-amber-500 font-bold tracking-tight bg-amber-500/5 px-2 py-0.5 rounded-lg inline-block border border-amber-500/10">
                          {app.clientPhone || 'Sem WhatsApp'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <img src={barber?.avatar} className="w-6 h-6 rounded-full" alt="" />
                          <span className="text-sm text-slate-300 font-medium">{barber?.name.split(' ')[0]}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-400 block max-w-xs truncate" title={serviceNames}>{serviceNames}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          app.status === AppointmentStatus.SCHEDULED ? 'bg-blue-500/20 text-blue-400' :
                          app.status === AppointmentStatus.COMPLETED ? 'bg-green-500/20 text-green-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {app.status === AppointmentStatus.SCHEDULED ? 'Agendado' : 
                           app.status === AppointmentStatus.COMPLETED ? 'Finalizado' : 'Faltou'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {app.status === AppointmentStatus.SCHEDULED && (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => onUpdateStatus(app.id, AppointmentStatus.COMPLETED)}
                              className="bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-slate-950 px-3 py-1 rounded-lg text-xs font-bold transition-all border border-green-500/20"
                            >
                              Finalizar
                            </button>
                            <button 
                              onClick={() => onUpdateStatus(app.id, AppointmentStatus.NO_SHOW)}
                              className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-slate-950 px-3 py-1 rounded-lg text-xs font-bold transition-all border border-red-500/20"
                            >
                              Faltou
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
