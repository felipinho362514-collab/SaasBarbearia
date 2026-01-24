
import React, { useState } from 'react';
import { User, UserRole, Barber } from '../types';

interface BarberAuthProps {
  onLogin: (user: User) => void;
}

const BarberAuth: React.FC<BarberAuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const users: User[] = JSON.parse(localStorage.getItem('barberflow_users_db') || '[]');
      
      if (mode === 'login') {
        const user = users.find(u => u.email === email && u.pin === pin && u.role === UserRole.BARBER);
        if (user) {
          onLogin(user);
        } else {
          alert("Credenciais inválidas");
        }
      } else {
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          name: name.trim(),
          email: email.trim(),
          pin: pin,
          role: UserRole.BARBER
        };
        users.push(newUser);
        localStorage.setItem('barberflow_users_db', JSON.stringify(users));
        onLogin(newUser);
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in duration-500">
      <div className="w-full max-w-sm bg-slate-900/50 border border-slate-800 p-8 rounded-[3rem] shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-950">
             <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08s5.97 1.09 6 3.08c-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Área do Profissional</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">
            {mode === 'login' ? 'Acesse seu painel de gestão' : 'Crie seu perfil profissional'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {mode === 'register' && (
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da Barbearia/Seu Nome"
              className="w-full bg-slate-950 border-2 border-slate-800 p-5 rounded-2xl text-center text-sm font-bold text-white outline-none focus:border-amber-500"
            />
          )}
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail Profissional"
            className="w-full bg-slate-950 border-2 border-slate-800 p-5 rounded-2xl text-center text-sm font-bold text-white outline-none focus:border-amber-500"
          />
          <input 
            type="password" 
            required
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="PIN de Acesso (4 dígitos)"
            maxLength={4}
            className="w-full bg-slate-950 border-2 border-slate-800 p-5 rounded-2xl text-center text-xl font-black text-amber-500 tracking-widest outline-none focus:border-amber-500"
          />
          
          <button 
            disabled={loading}
            className="w-full bg-amber-500 text-slate-950 font-black py-5 rounded-2xl uppercase tracking-widest text-xs active:scale-95 transition-all shadow-xl shadow-amber-500/10"
          >
            {loading ? 'Validando...' : (mode === 'login' ? 'Entrar no Painel' : 'Criar Conta')}
          </button>

          <button 
            type="button" 
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')} 
            className="w-full text-[9px] font-black uppercase text-slate-500 tracking-widest pt-2"
          >
            {mode === 'login' ? 'Não tem conta? Cadastre sua Barbearia' : 'Já tem conta? Fazer Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BarberAuth;
