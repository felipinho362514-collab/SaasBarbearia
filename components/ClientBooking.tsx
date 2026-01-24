
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
    for (let i = 0; i < 7; i++) {
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
    <div className="max-w-4xl mx-auto relative px-2 transform-gpu pb-40 md:pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-slate-900 pb-6 gap-4">
        <div>
           <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">Agendar Horário</h2>
           <p className="text-slate-500 text-sm mt-1">Olá, <strong>{firstName}</strong>. Escolha os serviços e o dia.</p>
        </div>
        <button 
           onClick={onGoToMyAppointments}
           className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-amber-500 transition-colors tracking-widest bg-slate-900 px-4 py-2 rounded-full border border-slate-800 md:bg-transparent md:border-0 md:p-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          Minhas Reservas
        </button>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-amber-500/30 p-8 md:p-12 rounded-[3rem] text-center max-w-sm w-full shadow-2xl animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-amber-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">Reservado!</h2>
            <p className="text-slate-400 mb-8 text-sm font-medium leading-relaxed">Tudo certo, <strong>{firstName}</strong>! Te esperamos na barbearia no horário marcado.</p>
            <button 
              onClick={() => setShowSuccess(false)}
              className="w-full bg-amber-500 text-slate-950 font-black py-4 rounded-2xl hover:bg-amber-400 transition-all uppercase tracking-widest text-xs"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Coluna 1: Profissional e Serviços */}
        <div className="space-y-8">
          <section className="bg-slate-900/50 p-5 md:p-6 rounded-[2rem] border border-slate-800">
            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-6">01. O Profissional</h3>
            <div className="flex gap-3">
              {BARBERS.map(barber => (
                <button
                  key={barber.id}
                  onClick={() => {
                    setSelectedBarber(barber);
                    setSelectedTime(null);
                  }}
                  className={`flex-1 group relative p-4 rounded-2xl border-2 transition-all duration-200 ${
                    selectedBarber.id === barber.id 
                    ? 'border-amber-500 bg-amber-500/5 shadow-lg shadow-amber-500/5' 
                    : 'border-slate-800 bg-slate-950'
                  }`}
                >
                  <img loading="lazy" src={barber.avatar} className="w-14 h-14 rounded-full mx-auto mb-3 object-cover border-2 border-slate-800 group-hover:border-amber-500/50 transition-all" alt="" />
                  <div className="text-[10px] font-black text-slate-200 text-center uppercase tracking-widest">{barber.name.split(' ')[0]}</div>
                  {selectedBarber.id === barber.id && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-lg animate-in zoom-in duration-200">
                      <svg className="w-2.5 h-2.5 text-slate-950" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-slate-900/50 p-5 md:p-6 rounded-[2rem] border border-slate-800">
            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-6">02. Serviços</h3>
            <div className="grid gap-3">
              {SERVICES.map(service => (
                <div 
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`group relative flex overflow-hidden rounded-2xl border-2 cursor-pointer transition-all duration-150 active:scale-[0.98] ${
                    selectedServices.includes(service.id) 
                    ? 'border-amber-500 bg-amber-500/5' 
                    : 'border-slate-800 bg-slate-950'
                  }`}
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 overflow-hidden shrink-0">
                    <img loading="lazy" src={service.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start">
                      <span className="font-black text-slate-100 text-sm md:text-base uppercase tracking-tight">{service.name}</span>
                      <span className="text-amber-500 font-black text-xs md:text-sm">R$ {service.price}</span>
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{service.durationMinutes} min • {service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Coluna 2: Dia e Horário */}
        <div className="space-y-8">
          <section className="bg-slate-900/50 p-5 md:p-6 rounded-[2rem] border border-slate-800">
            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-6">03. Escolha o Dia</h3>
            
            <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar snap-x touch-pan-x">
              {weekDays.map((day) => (
                <button
                  key={day.isoDate}
                  onClick={() => {
                    setSelectedDate(day.isoDate);
                    setSelectedTime(null);
                  }}
                  className={`flex flex-col items-center justify-center min-w-[75px] py-5 rounded-2xl border-2 transition-all duration-200 snap-center ${
                    selectedDate === day.isoDate
                      ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-xl shadow-amber-500/20'
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${
                    selectedDate === day.isoDate ? 'text-slate-950/60' : 'text-slate-600'
                  }`}>
                    {day.isToday ? 'Hoje' : day.dayName}
                  </span>
                  <span className="text-2xl font-black">{day.dayNumber}</span>
                </button>
              ))}
            </div>
            
            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-6">04. Horário Disponível</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {availableSlots.length > 0 ? (
                availableSlots.map(slot => (
                  <button
                    key={slot.time}
                    disabled={!slot.available}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`py-4 rounded-xl text-[11px] font-black transition-all duration-150 ${
                      !slot.available 
                      ? 'bg-slate-900 text-slate-800 cursor-not-allowed border border-transparent' 
                      : selectedTime === slot.time
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 border-amber-500'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-600 active:scale-95'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest italic">Barbearia fechada neste dia</p>
                </div>
              )}
            </div>
          </section>

          {/* Checkout Card - Desktop (Sticky na coluna) */}
          <section className="hidden md:block bg-amber-500 p-8 rounded-[2.5rem] shadow-2xl shadow-amber-500/10 text-slate-950 sticky top-24 transform-gpu">
            <div className="flex justify-between items-center mb-6">
              <div className="space-y-0.5">
                 <p className="text-[9px] font-black uppercase opacity-60 tracking-widest">Resumo do Corte</p>
                 <p className="font-black text-sm">{selectedServices.length} serviço(s) selecionado(s)</p>
              </div>
              <div className="text-right">
                <span className="uppercase tracking-widest text-[9px] font-black opacity-60">Valor total</span>
                <p className="text-3xl font-black leading-none">R$ {totalPrice}</p>
              </div>
            </div>
            <button
              disabled={!isFormValid}
              onClick={handleBooking}
              className="w-full py-5 bg-slate-950 text-amber-500 hover:bg-slate-900 disabled:bg-slate-950/40 disabled:text-slate-800 font-black rounded-2xl transition-all duration-200 uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95"
            >
              {isFormValid ? 'Finalizar Reserva' : 'Selecione os Detalhes'}
            </button>
          </section>
        </div>
      </div>

      {/* Checkout Bar - Mobile (Fixed at bottom) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-slate-950/80 backdrop-blur-xl border-t border-slate-900 transform-gpu will-change-transform translate-z-0">
        <section className={`bg-amber-500 p-5 rounded-[2rem] shadow-2xl shadow-amber-500/20 text-slate-950 transition-all duration-300 ${isFormValid ? 'scale-100 opacity-100' : 'scale-[0.98] opacity-90'}`}>
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] font-black uppercase opacity-60 tracking-widest">Total:</span>
                <span className="text-xl font-black">R$ {totalPrice}</span>
              </div>
              <p className="text-[9px] font-bold opacity-70 uppercase tracking-tighter truncate">
                {selectedTime ? `${selectedTime} • ` : ''} {selectedServices.length} serviço(s)
              </p>
            </div>
            <button
              disabled={!isFormValid}
              onClick={handleBooking}
              className="px-6 py-4 bg-slate-950 text-amber-500 disabled:bg-slate-950/20 disabled:text-slate-800 font-black rounded-xl transition-all duration-200 uppercase tracking-widest text-[10px] active:scale-95 shadow-lg"
            >
              {isFormValid ? 'Finalizar' : 'Escolha'}
            </button>
          </div>
        </section>
      </div>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default ClientBooking;
