
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import ClientHub from './components/ClientHub';
import ClientAuth from './components/ClientAuth';
import AdminDashboard from './components/AdminDashboard';
import { Appointment, AppointmentStatus } from './types';

interface LoggedClient {
  name: string;
  phone: string;
}

const App: React.FC = () => {
  const [view, setView] = useState<'portal' | 'client' | 'admin' | 'admin-login'>('portal');
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState(false);
  
  const [loggedClient, setLoggedClient] = useState<LoggedClient | null>(() => {
    const saved = localStorage.getItem('barber_active_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('barber_appointments');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [aiTip, setAiTip] = useState<string>("");
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    localStorage.setItem('barber_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    if (loggedClient) {
      localStorage.setItem('barber_active_session', JSON.stringify(loggedClient));
    } else {
      localStorage.removeItem('barber_active_session');
    }
  }, [loggedClient]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (view === 'admin') {
      const fetchAiInsights = async () => {
        try {
          const apiKey = process.env.API_KEY;
          if (!apiKey) {
             setAiTip("O segredo do estilo é a confiança total.");
             return;
          }
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: "Gere uma frase curta de 'Dica do Mestre Barbeiro' sobre gestão ou estilo. Máximo 10 palavras.",
          });
          setAiTip(response.text || "A excelência está no acabamento.");
        } catch (e) {
          console.error("Erro na IA:", e);
          setAiTip("O segredo do estilo é a confiança total.");
        }
      };
      fetchAiInsights();
    }
  }, [view]);

  const showNotify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  };

  const handleBook = (newApp: Partial<Appointment>) => {
    const app: Appointment = {
      ...newApp as Appointment,
      id: Math.random().toString(36).substr(2, 9),
    };
    setAppointments(prev => [...prev, app]);
    showNotify("Agendamento realizado!");
  };

  const handleUpdateStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    if (status === AppointmentStatus.CANCELLED) {
      showNotify("Cancelado.", "success");
    } else if (status === AppointmentStatus.COMPLETED) {
      showNotify("Finalizado!", "success");
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '2026') {
      setView('admin');
      setLoginError(false);
      setPin('');
      showNotify("Olá, Mestre!");
    } else {
      setLoginError(true);
      setPin('');
    }
  };

  const handleLogout = () => {
    setLoggedClient(null);
    if (view === 'client') setView('portal');
    showNotify("Até breve!");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {notification && (
        <div className={`fixed top-4 left-4 right-4 z-[200] px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
          notification.type === 'success' ? 'bg-slate-900 border-green-500/50 text-green-400' : 'bg-slate-900 border-red-500/50 text-red-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
          <span className="text-[10px] font-black uppercase tracking-widest">{notification.message}</span>
        </div>
      )}

      {view !== 'portal' && (
        <div className="fixed top-5 left-4 z-50">
          <button 
            onClick={() => setView('portal')}
            className="bg-slate-900/80 backdrop-blur-md p-2 rounded-full border border-slate-800 text-slate-400 active:scale-95 shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
        </div>
      )}

      {view === 'portal' ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-12">
            <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/20 mx-auto mb-6">
               <svg className="w-10 h-10 text-slate-950" fill="currentColor" viewBox="0 0 24 24"><path d="M19.38 8.01c.21-.21.21-.55 0-.76L17.75 5.6c-.21-.21-.55-.21-.76 0l-1.07 1.07c-1.12-.76-2.48-1.21-3.92-1.21-3.87 0-7 3.13-7 7 0 1.44.45 2.8 1.21 3.92l-1.07 1.07c-.21.21-.21.55 0 .76l1.63 1.63c.21.21.55.21.76 0l1.07-1.07c1.12.76 2.48 1.21 3.92 1.21 3.87 0 7-3.13 7-7 0-1.44-.45-2.8-1.21-3.92l1.07-1.07zM12 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>
            </div>
            <h1 className="text-3xl font-black text-slate-100 uppercase tracking-tighter mb-1">BarberFlow Pro</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest opacity-60">Mobile Experience</p>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button onClick={() => setView('client')} className="bg-amber-500 text-slate-950 p-6 rounded-3xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all shadow-xl shadow-amber-500/10">Novo Agendamento</button>
            <button onClick={() => setView('admin-login')} className="bg-slate-900 border border-slate-800 text-slate-400 p-6 rounded-3xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all">Acesso Gestão</button>
          </div>
        </div>
      ) : (
        <>
          <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-900 h-16 flex items-center px-4 pl-14">
             <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center font-black text-slate-950 text-[10px]">B</div>
                <span className="font-black text-sm uppercase tracking-tighter">
                  {view === 'client' ? (loggedClient ? `Olá, ${loggedClient.name.split(' ')[0]}` : 'Entrar') : 'Painel'}
                </span>
             </div>
             {view === 'client' && loggedClient && (
               <button onClick={handleLogout} className="ml-auto text-[8px] font-black uppercase text-slate-500 tracking-widest">Sair</button>
             )}
          </nav>
          <main className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
             {view === 'admin-login' ? (
               <div className="flex items-center justify-center min-h-[60vh]">
                 <form onSubmit={handleAdminLogin} className="w-full max-w-xs space-y-4">
                    <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="PIN 4 DÍGITOS" className="w-full bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center text-2xl font-black text-amber-500 outline-none focus:border-amber-500" maxLength={4} autoFocus />
                    <button className="w-full bg-amber-500 text-slate-950 font-black py-4 rounded-xl text-[10px] uppercase tracking-widest">Acessar</button>
                 </form>
               </div>
             ) : (
               <div className="animate-in fade-in duration-500">
                 {view === 'client' && (
                   !loggedClient ? <ClientAuth onLogin={setLoggedClient} existingPhones={appointments.map(a => a.clientPhone || '')} /> : 
                   <ClientHub loggedClient={loggedClient} onBook={handleBook} appointments={appointments.filter(a => a.clientPhone === loggedClient.phone)} onCancel={(id) => handleUpdateStatus(id, AppointmentStatus.CANCELLED)} />
                 )}
                 {view === 'admin' && <AdminDashboard appointments={appointments} onUpdateStatus={handleUpdateStatus} />}
               </div>
             )}
          </main>
        </>
      )}
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 0px; }`}</style>
    </div>
  );
};

export default App;
