
import React, { useState, useEffect } from 'react';
import { User, UserRole, Appointment, AppointmentStatus } from './types';
import ClientHub from './components/ClientHub';
import ClientAuth from './components/ClientAuth';
import AdminDashboard from './components/AdminDashboard';
import BarberAuth from './components/BarberAuth';
import { BARBERS } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<'portal' | 'client' | 'barber'>('portal');
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('barberflow_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('barberflow_appointments');
    return saved ? JSON.parse(saved) : [];
  });

  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Sincroniza barbeiros iniciais se o DB estiver vazio
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('barberflow_users_db') || '[]');
    if (users.length === 0) {
      localStorage.setItem('barberflow_users_db', JSON.stringify(BARBERS));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('barberflow_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('barberflow_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('barberflow_user');
    }
  }, [currentUser]);

  const showNotify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('portal');
    showNotify("Sessão encerrada");
  };

  const handleBook = (newApp: Partial<Appointment>) => {
    const app: Appointment = {
      ...newApp as Appointment,
      id: Math.random().toString(36).substr(2, 9),
    };
    setAppointments(prev => [...prev, app]);
    showNotify("Agendamento confirmado!");
  };

  const handleUpdateStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    showNotify("Status atualizado");
  };

  useEffect(() => {
    if (currentUser && view === 'portal') {
      setView(currentUser.role === UserRole.CLIENT ? 'client' : 'barber');
    }
  }, [currentUser]);

  if (view === 'portal') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-16 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="w-24 h-24 bg-amber-500 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-amber-500/20 mx-auto mb-8 transform -rotate-12">
            <svg className="w-14 h-14 text-slate-950" fill="currentColor" viewBox="0 0 24 24"><path d="M19.38 8.01c.21-.21.21-.55 0-.76L17.75 5.6c-.21-.21-.55-.21-.76 0l-1.07 1.07c-1.12-.76-2.48-1.21-3.92-1.21-3.87 0-7 3.13-7 7 0 1.44.45 2.8 1.21 3.92l-1.07 1.07c-.21.21-.21.55 0 .76l1.63 1.63c.21.21.55.21.76 0l1.07-1.07c1.12.76 2.48 1.21 3.92 1.21 3.87 0 7-3.13 7-7 0-1.44-.45-2.8-1.21-3.92l1.07-1.07zM12 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>
          </div>
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-4">BarberFlow</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] bg-slate-900 px-4 py-2 rounded-full inline-block">Sua jornada começa aqui</p>
        </div>

        <div className="flex flex-col gap-5 w-full max-w-xs animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
          <button 
            onClick={() => setView('client')}
            className="bg-amber-500 text-slate-950 p-7 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-amber-500/20 active:scale-95 transition-all"
          >
            Quero Agendar
          </button>
          <button 
            onClick={() => setView('barber')}
            className="bg-slate-900 border-2 border-slate-800 text-slate-400 p-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[10px] active:scale-95 transition-all"
          >
            Sou Barbeiro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {notification && (
        <div className={`fixed top-6 left-6 right-6 z-[200] px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
          notification.type === 'success' ? 'bg-slate-900 border-green-500/30 text-green-400' : 'bg-slate-900 border-red-500/30 text-red-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
          <span className="text-[10px] font-black uppercase tracking-widest">{notification.message}</span>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-900 h-20 flex items-center px-6">
        <button onClick={() => setView('portal')} className="mr-4 text-slate-500 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center font-black text-slate-950 text-xs">B</div>
          <span className="font-black text-xs uppercase tracking-tight text-white/90">BarberFlow</span>
        </div>
        {currentUser && (
          <button onClick={handleLogout} className="ml-auto text-[8px] font-black uppercase text-slate-500 tracking-[0.2em] bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">Sair</button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto">
        {view === 'client' && (
          !currentUser ? <ClientAuth onLogin={setCurrentUser} /> : 
          <ClientHub 
            loggedClient={currentUser} 
            onBook={handleBook} 
            appointments={appointments.filter(a => a.clientId === currentUser.id)} 
            onCancel={(id) => handleUpdateStatus(id, AppointmentStatus.CANCELLED)} 
          />
        )}
        {view === 'barber' && (
          !currentUser ? <BarberAuth onLogin={setCurrentUser} /> : 
          <AdminDashboard 
            appointments={appointments.filter(a => a.barberId === currentUser.id)} 
            onUpdateStatus={handleUpdateStatus} 
          />
        )}
      </main>

      <style>{`* { -webkit-tap-highlight-color: transparent; } .no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default App;
