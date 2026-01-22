
import React, { useState, useEffect } from 'react';
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
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Como estamos logados, usamos os dados do login
  const firstName = prefillName.split(' ')[0];
  const lastName = prefillName.split(' ').slice(1).join(' ');
  const phone = prefillPhone;

  useEffect(() => {
    // Aqui passamos todos os agendamentos do sistema para o serviço de cálculo (que deve estar no App para ser global)
    // Para simplificar no demo, o ClientHub já passa os agendamentos filtrados, mas para disponibilidade real, precisamos dos globais.
    // Como este é um sistema local, vamos assumir que o cálculo é feito sobre a base de dados.
    const slots = calculateAvailableSlots(selectedDate, selectedBarber, existingAppointments);
    setAvailableSlots(slots);
    setSelectedTime(null);
  }, [selectedDate, selectedBarber, existingAppointments]);

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

  const totalPrice = SERVICES
    .filter(s => selectedServices.includes(s.id))
    .reduce((acc, curr) => acc + curr.price, 0);

  const isFormValid = selectedTime && selectedServices.length > 0;

  return (
    <div className="max-w-4xl mx-auto relative">
      <div className="flex justify-between items-end mb-10 border-b border-slate-900 pb-6">
        <div>
           <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Reserve seu Estilo</h2>
           <p className="text-slate-500 text-sm mt-1">Olá, <strong>{firstName}</strong>. Escolha o melhor horário para você.</p>
        </div>
        <button 
           onClick={onGoToMyAppointments}
           className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-amber-500 transition-colors tracking-widest"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          Ver minhas reservas
        </button>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-amber-500/50 p-10 rounded-[2.5rem] text-center max-w-md shadow-2xl shadow-amber-500/20 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-amber-500/40">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Agendado!</h2>
            <p className="text-slate-400 mb-8 font-medium">Sua reserva foi confirmada para <strong>{firstName}</strong>. Vejo você em breve!</p>
            <button 
              onClick={() => setShowSuccess(false)}
              className="w-full bg-amber-500 text-slate-950 font-black py-4 rounded-2xl hover:bg-amber-400 transition-all uppercase tracking-widest text-sm"
            >
              Excelente
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <section className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
            <h3 className="text-sm font-black text-amber-500 uppercase tracking-[0.2em] mb-6">01. Escolha o Profissional</h3>
            <div className="flex gap-4">
              {BARBERS.map(barber => (
                <button
                  key={barber.id}
                  onClick={() => setSelectedBarber(barber)}
                  className={`flex-1 group relative p-4 rounded-2xl border-2 transition-all ${
                    selectedBarber.id === barber.id 
                    ? 'border-amber-500 bg-amber-500/5' 
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                  }`}
                >
                  <img src={barber.avatar} className="w-16 h-16 rounded-full mx-auto mb-3 object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                  <div className="text-xs font-bold text-slate-200 text-center">{barber.name.split(' ')[0]}</div>
                  {selectedBarber.id === barber.id && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                      <svg className="w-2 h-2 text-slate-950" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
            <h3 className="text-sm font-black text-amber-500 uppercase tracking-[0.2em] mb-6">02. Selecione os Serviços</h3>
            <div className="grid gap-4">
              {SERVICES.map(service => (
                <div 
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`group relative flex overflow-hidden rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedServices.includes(service.id) 
                    ? 'border-amber-500 bg-amber-500/5' 
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                  }`}
                >
                  <div className="w-24 h-24 overflow-hidden shrink-0">
                    <img src={service.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-slate-100">{service.name}</span>
                      <span className="text-amber-500 font-black text-sm">R$ {service.price}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{service.durationMinutes} min • {service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
            <h3 className="text-sm font-black text-amber-500 uppercase tracking-[0.2em] mb-6">03. Quando?</h3>
            <input 
              type="date" 
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-slate-100 mb-6 outline-none focus:border-amber-500 transition-all font-bold"
            />
            
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map(slot => (
                <button
                  key={slot.time}
                  disabled={!slot.available}
                  onClick={() => setSelectedTime(slot.time)}
                  className={`py-3 rounded-xl text-xs font-black transition-all ${
                    !slot.available 
                    ? 'bg-slate-900 text-slate-700 opacity-40 cursor-not-allowed' 
                    : selectedTime === slot.time
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-amber-500 p-8 rounded-[2.5rem] shadow-2xl shadow-amber-500/20 text-slate-950">
            <div className="flex justify-between items-center mb-6">
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase opacity-60">Perfil Identificado</p>
                 <p className="font-black text-xs">{phone}</p>
              </div>
              <div className="text-right">
                <span className="uppercase tracking-widest text-[10px] font-black opacity-60">Total</span>
                <p className="text-2xl font-black leading-none">R$ {totalPrice}</p>
              </div>
            </div>
            <button
              disabled={!isFormValid}
              onClick={handleBooking}
              className="w-full py-4 bg-slate-950 text-amber-500 hover:bg-slate-900 disabled:bg-slate-950/50 disabled:text-slate-700 font-black rounded-2xl transition-all uppercase tracking-[0.2em] text-sm shadow-xl"
            >
              {isFormValid ? 'Confirmar Reserva' : 'Selecione um horário'}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ClientBooking;
