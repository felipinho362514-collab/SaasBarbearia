
import React, { useState, useMemo } from 'react';
import { BARBERS, SERVICES } from '../constants';
import { calculateAvailableSlots } from '../services/bookingService';
import { Barber, Service, TimeSlot, Appointment, AppointmentStatus } from '../types';

interface ClientBookingProps {
  onBook: (appointment: Partial<Appointment>) => void;
  existingAppointments: Appointment[];
  onGoToMyAppointments: () => void;
  prefillName?: string;
  prefillPhone?: string;
}

const ClientBooking: React.FC<ClientBookingProps> = ({ 
  onBook, 
  existingAppointments, 
  onGoToMyAppointments,
  prefillName = '',
  prefillPhone = ''
}) => {
  const [selectedBarber, setSelectedBarber] = useState<Barber>(BARBERS[0]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const availableSlots = useMemo(() => {
    return calculateAvailableSlots(selectedDate, selectedBarber, existingAppointments);
  }, [selectedDate, selectedBarber, existingAppointments]);

  const weekDays = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(now.getDate() + i);
      const isoDate = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      const dayNumber = date.getDate();
      days.push({ isoDate, dayName, dayNumber, isToday: i === 0 });
    }
    return days;
  }, []);

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId) 
        : [...prev, serviceId]
    );
  };

  const handleBooking = () => {
    if (!selectedTime || selectedServices.length === 0) return;
    onBook({
      barberId: selectedBarber.id,
      serviceIds: selectedServices,
      date: selectedDate,
      startTime: selectedTime,
      clientName: prefillName,
      clientPhone: prefillPhone,
      status: AppointmentStatus.SCHEDULED
    });
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedServices([]);
      setSelectedTime(null);
    }, 4000);
  };

  const totalPrice = useMemo(() => {
    return SERVICES
      .filter(s => selectedServices.includes(s.id))
      .reduce((acc, curr) => acc + curr.price, 0);
  }, [selectedServices]);

  const isFormValid = selectedTime && selectedServices.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 transform-gpu">
      {/* Botão de Histórico */}
      <div className="flex justify-end mb-6">
        <button 
           onClick={onGoToMyAppointments}
           className="bg-slate-900 px-5 py-2.5 rounded-2xl border border-slate-800 text-[10px] font-black uppercase text-slate-400 active:scale-95 transition-all flex items-center gap-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Minha Agenda
        </button>
      </div>

      <div className="space-y-10 pb-48">
        
        {/* 01. CAROUSEL DE CORTES (O CORAÇÃO DO VISUAL) */}
        <section className="bg-slate-900/20 rounded-[3rem] py-6">
          <div className="px-6 mb-6">
            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Escolha seu Estilo</h3>
            <p className="text-slate-500 text-[9px] font-bold uppercase mt-1">Toque para selecionar um ou mais</p>
          </div>
          
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 snap-x pb-4">
            {SERVICES.map(service => (
              <div
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={`flex-shrink-0 w-64 h-80 rounded-[2.5rem] relative overflow-hidden snap-center cursor-pointer transition-all duration-300 border-2 ${
                  selectedServices.includes(service.id) ? 'border-amber-500 scale-105 shadow-2xl shadow-amber-500/20' : 'border-slate-800 grayscale-[0.5]'
                }`}
              >
                <img src={service.image} className="absolute inset-0 w-full h-full object-cover" alt={service.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                {selectedServices.includes(service.id) && (
                  <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 p-2 rounded-full shadow-lg">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                  </div>
                )}

                <div className="absolute bottom-6 left-6 right-6">
                  <span className="bg-amber-500 text-slate-950 px-3 py-1 rounded-lg text-[9px] font-black uppercase mb-2 inline-block">
                    R$ {service.price}
                  </span>
                  <h4 className="text-white font-black text-lg uppercase tracking-tight leading-none mb-1">{service.name}</h4>
                  <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">{service.durationMinutes} min</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 02. PROFISSIONAIS (GRID COMPACTO) */}
        <section className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-slate-800/50">
          <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-6">Mãos de Mestre</h3>
          <div className="grid grid-cols-2 gap-4">
            {BARBERS.map(barber => (
              <button
                key={barber.id}
                onClick={() => { setSelectedBarber(barber); setSelectedTime(null); }}
                className={`flex items-center gap-4 p-4 rounded-[2rem] border-2 transition-all duration-200 active:scale-95 ${
                  selectedBarber.id === barber.id ? 'border-amber-500 bg-amber-500/5' : 'border-slate-800 bg-slate-950'
                }`}
              >
                <img src={barber.avatar} className="w-12 h-12 rounded-full border-2 border-slate-800" alt="" />
                <div className="text-left">
                  <span className="block text-[10px] font-black text-slate-200 uppercase tracking-tight">{barber.name.split(' ')[0]}</span>
                  <span className="block text-[8px] text-slate-500 font-bold uppercase">{barber.operatingDays.split(' ')[0]}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 03. Data e Horário */}
        <section className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-slate-800/50">
          <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-6">Qual o melhor momento?</h3>
          <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar snap-x">
            {weekDays.map((day) => (
              <button
                key={day.isoDate}
                onClick={() => { setSelectedDate(day.isoDate); setSelectedTime(null); }}
                className={`flex flex-col items-center justify-center min-w-[70px] py-4 rounded-2xl border-2 transition-all snap-start ${
                  selectedDate === day.isoDate ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-xl shadow-amber-500/10' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <span className="text-[8px] font-black uppercase mb-1 opacity-70">{day.dayName}</span>
                <span className="text-xl font-black">{day.dayNumber}</span>
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-4 gap-2.5 mt-4">
            {availableSlots.map(slot => (
              <button
                key={slot.time}
                disabled={!slot.available}
                onClick={() => setSelectedTime(slot.time)}
                className={`py-4 rounded-2xl text-[11px] font-black transition-all duration-200 active:scale-90 ${
                  !slot.available ? 'opacity-20 bg-slate-900 text-slate-800 border-transparent' :
                  selectedTime === slot.time ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xl' : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* BARRA DE FINALIZAÇÃO FIXA */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] transform-gpu">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/98 to-transparent h-48 -top-28 pointer-events-none" />
        <div className="p-5 relative pb-10">
          <div className={`bg-amber-500 p-5 rounded-[2.5rem] shadow-2xl flex items-center justify-between transition-all duration-500 ${isFormValid ? 'scale-100' : 'scale-[0.98] opacity-95'}`}>
            <div className="flex flex-col ml-3">
              <span className="text-[8px] font-black uppercase text-slate-900/60 tracking-[0.2em]">Investimento</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] font-black text-slate-900">R$</span>
                <span className="text-2xl font-black text-slate-950 leading-none">{totalPrice}</span>
              </div>
              <p className="text-[9px] font-bold text-slate-950/80 uppercase mt-1.5 flex items-center gap-1">
                {selectedTime && <span className="bg-slate-950/10 px-1.5 py-0.5 rounded-md">{selectedTime}</span>}
                <span>{selectedServices.length} {selectedServices.length === 1 ? 'item' : 'itens'}</span>
              </p>
            </div>
            <button
              disabled={!isFormValid}
              onClick={handleBooking}
              className="bg-slate-950 text-amber-500 px-10 py-5 rounded-[1.8rem] font-black text-[11px] uppercase tracking-[0.2em] active:scale-95 disabled:opacity-30 disabled:grayscale transition-all shadow-2xl"
            >
              {isFormValid ? 'Finalizar' : 'Pendente'}
            </button>
          </div>
        </div>
      </div>

      {/* Sucesso Animado */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/90 backdrop-blur-md p-6 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-amber-500/20 p-10 rounded-[3.5rem] text-center w-full max-w-sm mb-12 shadow-2xl animate-in slide-in-from-bottom-20 duration-500">
            <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-amber-500/30">
              <svg className="h-10 w-10 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-3xl font-black text-white mb-3 uppercase tracking-tighter">Reservado!</h2>
            <p className="text-slate-400 text-[13px] font-medium mb-10 leading-relaxed">Sua vaga está garantida. Te esperamos com o café pronto!</p>
            <button onClick={() => setShowSuccess(false)} className="w-full bg-amber-500 text-slate-950 font-black py-5 rounded-[2rem] uppercase tracking-widest text-[11px] shadow-xl active:scale-95 transition-all">Entendido</button>
          </div>
        </div>
      )}

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default ClientBooking;
