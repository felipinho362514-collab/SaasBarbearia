
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface ClientAuthProps {
  onLogin: (user: User) => void;
}

const ClientAuth: React.FC<ClientAuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulação de delay de rede
    setTimeout(() => {
      const users: User[] = JSON.parse(localStorage.getItem('barberflow_users_db') || '[]');
      
      if (mode === 'login') {
        // Busca usuário pelo TELEFONE em vez de email
        const cleanPhone = phone.replace(/\D/g, '');
        const user = users.find(u => u.phone?.replace(/\D/g, '') === cleanPhone && u.role === UserRole.CLIENT);
        
        if (user) {
          onLogin(user);
        } else {
          alert("Número não encontrado. Por favor, verifique ou crie uma conta.");
          setMode('register');
        }
      } else {
        // Validação básica de cadastro
        const cleanPhone = phone.replace(/\D/g, '');
        if (users.some(u => u.phone?.replace(/\D/g, '') === cleanPhone)) {
          alert("Este número de telefone já está cadastrado.");
          setMode('login');
        } else {
          const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            role: UserRole.CLIENT
          };
          users.push(newUser);
          localStorage.setItem('barberflow_users_db', JSON.stringify(users));
          onLogin(newUser);
        }
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in duration-500">
      <div className="w-full max-w-sm bg-slate-900/50 border border-slate-800 p-8 rounded-[3rem] shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-amber-500">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
             </svg>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
            {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua Conta'}
          </h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 px-4">
            {mode === 'login' ? 'Informe seu WhatsApp para acessar' : 'Cadastre-se para agendar seu horário'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {mode === 'register' && (
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu Nome Completo"
              className="w-full bg-slate-950 border-2 border-slate-800 p-5 rounded-2xl text-center text-sm font-bold text-white outline-none focus:border-amber-500 transition-all"
            />
          )}

          <input 
            type="tel" 
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="WhatsApp (ex: 11999999999)"
            className="w-full bg-slate-950 border-2 border-slate-800 p-5 rounded-2xl text-center text-sm font-bold text-white outline-none focus:border-amber-500 transition-all"
          />

          {mode === 'register' && (
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu Melhor E-mail"
              className="w-full bg-slate-950 border-2 border-slate-800 p-5 rounded-2xl text-center text-sm font-bold text-white outline-none focus:border-amber-500 transition-all"
            />
          )}
          
          <button 
            disabled={loading}
            className="w-full bg-amber-500 text-slate-950 font-black py-5 rounded-2xl uppercase tracking-widest text-xs active:scale-95 transition-all shadow-xl shadow-amber-500/10 disabled:opacity-50"
          >
            {loading ? 'Validando...' : (mode === 'login' ? 'Entrar na Agenda' : 'Cadastrar e Continuar')}
          </button>

          <button 
            type="button" 
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setName('');
              setPhone('');
              setEmail('');
            }} 
            className="w-full text-[9px] font-black uppercase text-slate-500 tracking-widest pt-2 hover:text-amber-500 transition-colors"
          >
            {mode === 'login' ? 'Não tem conta? Crie agora' : 'Já tem conta? Faça Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClientAuth;
