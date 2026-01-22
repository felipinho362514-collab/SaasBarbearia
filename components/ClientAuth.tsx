
import React, { useState } from 'react';

interface ClientAuthProps {
  onLogin: (client: { name: string; phone: string }) => void;
  existingPhones: string[];
}

const ClientAuth: React.FC<ClientAuthProps> = ({ onLogin, existingPhones }) => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'phone' | 'register'>('phone');

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;

    // Simula verificação se o telefone já existe no sistema
    const isReturning = existingPhones.includes(phone) || localStorage.getItem(`client_name_${phone}`);
    
    if (isReturning) {
      const savedName = localStorage.getItem(`client_name_${phone}`) || "Cliente";
      onLogin({ name: savedName, phone });
    } else {
      setStep('register');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) return;
    
    localStorage.setItem(`client_name_${phone}`, name);
    onLogin({ name, phone });
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300">
        <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleNext} className="text-center">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Acesse sua Agenda</h2>
            <p className="text-slate-500 text-sm mb-8">Digite seu WhatsApp para ver seus horários e marcar novos serviços.</p>
            
            <div className="space-y-4">
              <input 
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="Seu WhatsApp (com DDD)"
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-center text-xl font-black text-amber-500 tracking-widest outline-none focus:border-amber-500 transition-all"
              />
              <button 
                type="submit"
                className="w-full bg-amber-500 text-slate-950 font-black py-4 rounded-xl hover:bg-amber-400 transition-all uppercase tracking-widest text-sm shadow-lg shadow-amber-500/20"
              >
                Continuar
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="text-center">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Seja Bem-vindo!</h2>
            <p className="text-slate-500 text-sm mb-8">Notamos que é sua primeira vez. Como gostaria de ser chamado?</p>
            
            <div className="space-y-4">
              <input 
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu Nome Completo"
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-center text-lg font-bold text-slate-100 outline-none focus:border-amber-500 transition-all"
              />
              <button 
                type="submit"
                className="w-full bg-amber-500 text-slate-950 font-black py-4 rounded-xl hover:bg-amber-400 transition-all uppercase tracking-widest text-sm"
              >
                Finalizar Cadastro
              </button>
              <button 
                type="button"
                onClick={() => setStep('phone')}
                className="text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:text-slate-300 transition-colors"
              >
                Voltar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ClientAuth;
