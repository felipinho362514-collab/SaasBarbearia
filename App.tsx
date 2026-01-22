
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import ClientBooking from './components/ClientBooking';
import ClientMyAppointments from './components/ClientMyAppointments';
import AdminDashboard from './components/AdminDashboard';
import { Appointment, AppointmentStatus } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'portal' | 'client' | 'admin' | 'admin-login' | 'client-my-appointments'>('portal');
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    // Tenta carregar agendamentos do LocalStorage ao iniciar
    const saved = localStorage.getItem('barber_appointments');
    return saved ? JSON.parse(saved) : [];
  });
  const [aiTip, setAiTip] = useState<string>("");
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Salva no LocalStorage sempre que os agendamentos mudarem
  useEffect(() => {
    localStorage.setItem('barber_appointments', JSON.stringify(appointments));
  }, [appointments]);

  // Limpa notificação após 3 segundos
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
          // Fix: Always use process.env.API_KEY directly for GoogleGenAI initialization.
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: "Gere uma frase curta de 'Dica do Mestre Barbeiro' sobre gestão ou estilo. Máximo 10 palavras.",
          });
          // Fix: Access .text property directly instead of calling a method.
          setAiTip(response.text || "A excelência está no acabamento.");
        } catch (e) {
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
    showNotify("Agendamento realizado com sucesso!");
  };

  const handleUpdateStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    if (status === AppointmentStatus.CANCELLED) {
      showNotify("Reserva cancelada.", "success");
    } else if (status === AppointmentStatus.COMPLETED) {
      showNotify("Serviço finalizado!", "success");
    }
  };

  const handleCancelAppointment = (id: string) => {
    handleUpdateStatus(id, AppointmentStatus.CANCELLED);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '2026') {
      setView('admin');
      setLoginError(false);
      setPin('');
      showNotify("Bem-vindo de volta, mestre!");
    } else {
      setLoginError(true);
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Sistema de Notificação (Toast) */}
      {notification && (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-right-8 duration-300 ${
          notification.type === 'success' ? 'bg-slate-900 border-green-500/50 text-green-400' : 'bg-slate-900 border-red-500/50 text-red-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
          <span className="text-sm font-black uppercase tracking-widest">{notification.message}</span>
        </div>
      )}

      {/* Navegação/Voltar */}
      {view !== 'portal' && (
        <div className="fixed top-5 left-4 z-50">
          <button 
            onClick={() => setView('portal')}
            className="bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md p-2.5 rounded-full border border-slate-800 text-slate-400 hover:text-white transition-all shadow-xl hover:scale-105 active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
        </div>
      )}

      {/* Renderização Condicional de Telas */}
      {view === 'portal' ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-12">
            <div className="w-20 h-20 bg-amber-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/20 mx-auto mb-6 rotate-3">
              <svg className="w-12 h-12 text-slate-950" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.38 8.01c.21-.21.21-.55 0-.76L17.75 5.6c-.21-.21-.55-.21-.76 0l-1.07 1.07c-1.12-.76-2.48-1.21-3.92-1.21-3.87 0-7 3.13-7 7 0 1.44.45 2.8 1.21 3.92l-1.07 1.07c-.21.21-.21.55 0 .76l1.63 1.63c.21.21.55.21.76 0l1.07-1.07c1.12.76 2.48 1.21 3.92 1.21 3.87 0 7-3.13 7-7 0-1.44-.45-2.8-1.21-3.92l1.07-1.07zM12 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-black text-slate-100 uppercase tracking-tighter mb-2">BarberFlow Pro</h1>
            <p className="text-slate-500 font-medium">Selecione uma opção para continuar</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            <button 
              onClick={() => setView('client')}
              className="group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 p-8 rounded-3xl transition-all text-left shadow-xl h-full flex flex-col"
            >
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">Novo Agendamento</h3>
              <p className="text-slate-400 text-sm leading-relaxed mt-auto">Marque seu próximo horário com nossos especialistas.</p>
            </button>

            <button 
              onClick={() => setView('client-my-appointments')}
              className="group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 p-8 rounded-3xl transition-all text-left shadow-xl h-full flex flex-col"
            >
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">Meus Horários</h3>
              <p className="text-slate-400 text-sm leading-relaxed mt-auto">Consulte a data e o horário das suas reservas atuais.</p>
            </button>

            <button 
              onClick={() => setView('admin-login')}
              className="group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 p-8 rounded-3xl transition-all text-left shadow-xl h-full flex flex-col"
            >
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-slate-400 group-hover:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">Painel Barbeiro</h3>
              <p className="text-slate-400 text-sm leading-relaxed mt-auto">Acesso restrito para gestão da equipe e faturamento.</p>
            </button>
          </div>
        </div>
      ) : view === 'admin-login' ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-2xl text-center">
            <button onClick={() => setView('portal')} className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest mb-8 flex items-center gap-2 mx-auto">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Voltar
            </button>
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Acesso Restrito</h2>
            <p className="text-slate-500 text-sm mb-8">Digite o PIN para acessar o painel administrativo.</p>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input 
                type="password" 
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className={`w-full bg-slate-950 border ${loginError ? 'border-red-500' : 'border-slate-800'} p-4 rounded-xl text-center text-3xl tracking-[1em] text-amber-500 outline-none focus:border-amber-500 transition-all`}
                maxLength={4}
                autoFocus
              />
              {loginError && <p className="text-red-500 text-xs font-bold">PIN Incorreto.</p>}
              <button className="w-full bg-amber-500 text-slate-950 font-black py-4 rounded-xl hover:bg-amber-400 transition-all uppercase tracking-widest text-xs">Entrar no Painel</button>
            </form>
            <p className="mt-6 text-[10px] text-slate-600 font-bold uppercase italic tracking-widest">Dica: PIN é 2026</p>
          </div>
        </div>
      ) : (
        <>
          <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-900 shadow-2xl h-20 flex items-center">
            {/* Fix: Removed redundant view !== 'portal' check to resolve TypeScript "no overlap" error */}
            <div className={`max-w-7xl mx-auto px-4 w-full flex justify-between items-center transition-all duration-300 pl-16`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-black text-slate-950 shadow-lg shadow-amber-500/20">B</div>
                <span className="font-black text-lg tracking-tighter bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent uppercase whitespace-nowrap">
                  {view === 'client' ? 'Agendamento' : view === 'client-my-appointments' ? 'Meus Horários' : 'Painel Gestão'}
                </span>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto px-4 py-12">
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              {view === 'client' && <ClientBooking onBook={handleBook} existingAppointments={appointments} />}
              {view === 'client-my-appointments' && <ClientMyAppointments appointments={appointments} onCancel={handleCancelAppointment} />}
              {view === 'admin' && <AdminDashboard appointments={appointments} onUpdateStatus={handleUpdateStatus} />}
            </div>
          </main>
        </>
      )}
    </div>
  );
};

export default App;
