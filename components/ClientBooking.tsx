
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
  
  const firstName = prefillName.split(' ')[0];

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
    <div className="max-w-4xl mx-auto relative px-2 transform-gpu pb-32 md:pb-12">
      {/* Header Contextual - Otimizado para Mobile */}
      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">Novo Corte</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Passo a passo</p>
        </div>
        <button 
           onClick={onGoToMyAppointments}
           className="bg-slate-900 px-4 py-2 rounded-full border border-slate-800 text-[10px] font-black uppercase text-slate-400 active:scale-95 transition-all"
        >
          Meus Horários
        </button>
      </div>

      <div className="space-y-6">
        {/* 01. Profissional - Scroll Horizontal Mobile */}
        <section className="bg-slate-900/40 p-5 rounded-[2rem] border border-slate-800/50">
          <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-4">Escolha o Barbeiro</h3>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {BARBERS.map(barber => (
              <button
                key={barber.id}
                onClick={() => { setSelectedBarber(barber); setSelectedTime(null); }}
                className={`flex items-center gap-3 min-w-[160px] p-3 rounded-2xl border-2 transition-all duration-150 active:scale-95 ${
                  selectedBarber.id === barber.id ? 'border-amber-500 bg-amber-500/5' : 'border-slate-800 bg-slate-950'
                }`}
              >
                <img src={barber.avatar} className="w-10 h-10 rounded-full border border-slate-800" alt="" />
                <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">{barber.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 02. Serviços - Card Style para Touch */}
        <section className="bg-slate-900/40 p-5 rounded-[2rem] border border-slate-800/50">
          <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-4">Selecione os Serviços</h3>
          <div className="grid gap-2">
            {SERVICES.map(service => (
              <div 
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={`flex items-center p-3 rounded-2xl border-2 cursor-pointer transition-all duration-150 active:scale-[0.98] ${
                  selectedServices.includes(service.id) ? 'border-amber-500 bg-amber-500/5' : 'border-slate-800 bg-slate-950'
                }`}
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden grayscale group-active:grayscale-0">
                  <img src={service.image} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-slate-100 text-xs uppercase">{service.name}</span>
                    <span className="text-amber-500 font-black text-xs">R$ {service.price}</span>
                  </div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">{service.durationMinutes} min</p>
                </div>
                <div className={`ml-2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedServices.includes(service.id) ? 'bg-amber-500 border-amber-500' : 'border-slate-800'}`}>
                  {selectedServices.includes(service.id) && <svg className="w-3 h-3 text-slate-950" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 03. Data e Horário - Grid Compacto */}
        <section className="bg-slate-900/40 p-5 rounded-[2rem] border border-slate-800/50">
          <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-4">Data e Horário</h3>
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar snap-x">
            {weekDays.map((day) => (
              <button
                key={day.isoDate}
                onClick={() => { setSelectedDate(day.isoDate); setSelectedTime(null); }}
                className={`flex flex-col items-center justify-center min-w-[60px] py-3 rounded-xl border-2 transition-all snap-start ${
                  selectedDate === day.isoDate ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <span className="text-[8px] font-black uppercase mb-1">{day.dayName}</span>
                <span className="text-lg font-black">{day.dayNumber}</span>
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-4 gap-2 mt-4">
            {availableSlots.map(slot => (
              <button
                key={slot.time}
                disabled={!slot.available}
                onClick={() => setSelectedTime(slot.time)}
                className={`py-3 rounded-xl text-[10px] font-black transition-all duration-150 active:scale-90 ${
                  !slot.available ? 'opacity-20 bg-slate-900 text-slate-800' :
                  selectedTime === slot.time ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* FOOTER FIXO - MOBILE FIRST CHECKOUT */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] transform-gpu will-change-transform translate-z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent h-40 -top-20 pointer-events-none" />
        <div className="p-4 relative">
          <div className={`bg-amber-500 p-4 rounded-[2rem] shadow-2xl flex items-center justify-between transition-all duration-300 ${isFormValid ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-95'}`}>
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase text-slate-900/60 tracking-widest">Valor Total</span>
              <span className="text-xl font-black text-slate-950">R$ {totalPrice}</span>
              <span className="text-[9px] font-bold text-slate-950/70 uppercase">
                {selectedTime ? `${selectedTime} • ` : ''} {selectedServices.length} serviços
              </span>
            </div>
            <button
              disabled={!isFormValid}
              onClick={handleBooking}
              className="bg-slate-950 text-amber-500 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 disabled:opacity-30 disabled:grayscale shadow-xl"
            >
              {isFormValid ? 'Finalizar' : 'Pendente'}
            </button>
          </div>
        </div>
      </div>

      {/* Overlay de Sucesso Otimizado */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-amber-500/30 p-8 rounded-[3rem] text-center w-full max-w-sm mb-8 animate-in slide-in-from-bottom-10 duration-500">
            <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/20">
              <svg className="h-8 w-8 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Confirmado!</h2>
            <p className="text-slate-400 text-xs font-medium mb-8">Te vemos em breve na barbearia.</p>
            <button onClick={() => setShowSuccess(false)} className="w-full bg-amber-500 text-slate-950 font-black py-4 rounded-2xl uppercase tracking-widest text-xs">Entendido</button>
          </div>
        </div>
      )}

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default ClientBooking;
