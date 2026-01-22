
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

    // Verifica se já existe um nome para este telefone no localStorage
    const savedName = localStorage.getItem(`client_name_${phone}`);
    
    if (savedName && savedName.trim().length >= 3) {
      onLogin({ name: savedName, phone });
    } else {
      // Se não houver nome, obriga o registro
      setStep('register');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) return;
    
    // Salva e loga
    localStorage.setItem(`client_name_${phone}`, name.trim());
    onLogin({ name: name.trim(), phone });
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 md:p-10 rounded-[2.5rem] shadow-2xl animate-in zoom-in slide-in-from-bottom-10 duration-500">
        <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner">
          <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleNext} className="text-center">
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-3">Identifique-se</h2>
            <p className="text-slate-500 text-sm mb-8 px-4">Para sua segurança e privacidade, digite seu WhatsApp.</p>
            
            <div className="space-y-5">
              <div className="relative">
                <input 
                  type="tel"
                  required
                  autoFocus
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="(00) 00000-0000"
                  className="w-full bg-slate-950 border-2 border-slate-800 p-5 rounded-2xl text-center text-xl font-black text-amber-500 tracking-widest outline-none focus:border-amber-500 transition-all placeholder:text-slate-800"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-amber-500 text-slate-950 font-black py-5 rounded-2xl hover:bg-amber-400 active:scale-[0.98] transition-all uppercase tracking-widest text-sm shadow-xl shadow-amber-500/10"
              >
                Acessar Agenda
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="text-center">
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-3">Quase lá!</h2>
            <p className="text-slate-500 text-sm mb-8 px-4">Não encontramos seu nome. Como devemos te chamar na barbearia?</p>
            
            <div className="space-y-5">
              <input 
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu Nome e Sobrenome"
                className="w-full bg-slate-950 border-2 border-slate-800 p-5 rounded-2xl text-center text-lg font-bold text-slate-100 outline-none focus:border-amber-500 transition-all placeholder:text-slate-800"
              />
              <button 
                type="submit"
                className="w-full bg-amber-500 text-slate-950 font-black py-5 rounded-2xl hover:bg-amber-400 active:scale-[0.98] transition-all uppercase tracking-widest text-sm shadow-xl shadow-amber-500/10"
              >
                Salvar e Continuar
              </button>
              <button 
                type="button"
                onClick={() => setStep('phone')}
                className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] hover:text-slate-300 transition-colors pt-2"
              >
                Alterar Número
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ClientAuth;
