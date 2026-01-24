
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface ClientAuthProps {
  onLogin: (user: User) => void;
}

const ClientAuth: React.FC<ClientAuthProps> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'phone' | 'code' | 'profile'>('phone');
  const [loading, setLoading] = useState(false);

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;
    setLoading(true);
    // Simula envio de WhatsApp
    setTimeout(() => {
      setLoading(false);
      setStep('code');
    }, 1500);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 4) return;
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      // Busca usuário existente
      const users: User[] = JSON.parse(localStorage.getItem('barberflow_users_db') || '[]');
      const existing = users.find(u => u.phone === phone);
      
      if (existing) {
        onLogin(existing);
      } else {
        setStep('profile');
      }
    }, 1000);
  };

  const handleCompleteProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) return;
    
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      phone: phone,
      role: UserRole.CLIENT
    };

    // "Salva no DB"
    const users: User[] = JSON.parse(localStorage.getItem('barberflow_users_db') || '[]');
    users.push(newUser);
    localStorage.setItem('barberflow_users_db', JSON.stringify(users));
    
    onLogin(newUser);
  };

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
      <div className="w-full max-w-sm bg-slate-900/50 border border-slate-800 p-8 rounded-[3rem] shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-amber-500">
             {step === 'phone' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
             {step === 'code' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
             {step === 'profile' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
            {step === 'phone' && 'Identificação'}
            {step === 'code' && 'Validar WhatsApp'}
            {step === 'profile' && 'Sua Primeira Vez'}
          </h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 px-6">
            {step === 'phone' && 'Digite seu número para começarmos'}
            {step === 'code' && `Enviamos um código para ${phone}`}
            {step === 'profile' && 'Como quer ser chamado na barbearia?'}
          </p>
        </div>

        {step === 'phone' && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <input 
              type="tel" 
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="(00) 00000-0000"
              className="w-full bg-slate-950 border-2 border-slate-800 p-5 rounded-2xl text-center text-xl font-black text-amber-500 outline-none focus:border-amber-500 transition-all"
            />
            <button 
              disabled={loading}
              className="w-full bg-amber-500 text-slate-950 font-black py-5 rounded-2xl uppercase tracking-widest text-xs active:scale-95 transition-all shadow-xl shadow-amber-500/10"
            >
              {loading ? 'Processando...' : 'Receber Código'}
            </button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <input 
              type="text" 
              inputMode="numeric"
              required
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="0000"
              maxLength={4}
              className="w-full bg-slate-950 border-2 border-slate-800 p-5 rounded-2xl text-center text-3xl font-black text-amber-500 tracking-[0.5em] outline-none focus:border-amber-500"
            />
            <button className="w-full bg-amber-500 text-slate-950 font-black py-5 rounded-2xl uppercase tracking-widest text-xs active:scale-95 transition-all">
              Verificar
            </button>
            <button type="button" onClick={() => setStep('phone')} className="w-full text-[9px] font-black uppercase text-slate-500 tracking-widest">Alterar Número</button>
          </form>
        )}

        {step === 'profile' && (
          <form onSubmit={handleCompleteProfile} className="space-y-4">
            <input 
              type="text" 
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu Nome Completo"
              className="w-full bg-slate-950 border-2 border-slate-800 p-5 rounded-2xl text-center text-lg font-black text-slate-100 outline-none focus:border-amber-500"
            />
            <button className="w-full bg-amber-500 text-slate-950 font-black py-5 rounded-2xl uppercase tracking-widest text-xs active:scale-95 transition-all">
              Começar a Agendar
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ClientAuth;
