
import React, { useState, useEffect } from 'react';
import { BARBERS, SERVICES } from '../constants';
import { calculateAvailableSlots } from '../services/bookingService';
import { Barber, Service, TimeSlot, Appointment, AppointmentStatus } from '../types';

interface ClientBookingProps {
  onBook: (appointment: Partial<Appointment>) => void;
  existingAppointments: Appointment[];
}

const ClientBooking: React.FC<ClientBookingProps> = ({ onBook, existingAppointments }) => {
  const [selectedBarber, setSelectedBarber] = useState<Barber>(BARBERS[0]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Estados para identificação do cliente
  const [firstName, setFirstName] = useState(() => localStorage.getItem('barber_client_fname') || '');
  const [lastName, setLastName] = useState(() => localStorage.getItem('barber_client_lname') || '');
  const [phone, setPhone] = useState(() => localStorage.getItem('barber_client_phone') || '');

  useEffect(() => {
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
    if (!selectedTime || selectedServices.length === 0 || !firstName || !lastName || !phone) return;
    
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    
    // Salva os dados para conveniência futura
    localStorage.setItem('barber_client_fname', firstName);
    localStorage.setItem('barber_client_lname', lastName);
    localStorage.setItem('barber_client_phone', phone);

    onBook({
      barberId: selectedBarber.id,
      serviceIds: selectedServices,
      date: selectedDate,
      startTime: selectedTime,
      clientName: fullName,
      clientPhone: phone,
      status: AppointmentStatus.SCHEDULED
    });
    
    setShowSuccess(true);
    
    // Reset selections after success
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedServices([]);
      setSelectedTime(null);
    }, 4000);
  };

  const totalPrice = SERVICES
    .filter(s => selectedServices.includes(s.id))
    .reduce((acc, curr) => acc + curr.price, 0);

  // Validação agora inclui o telefone
  const isFormValid = selectedTime && selectedServices.length > 0 && firstName.trim() && lastName.trim() && phone.trim().length >= 8;

  return (
    <div className="max-w-4xl mx-auto relative">
      {/* Modal de Sucesso */}
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
        {/* Esquerda: Escolhas */}
        <div className="space-y-8">
          {/* Escolha do Barbeiro */}
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

          {/* Escolha dos Serviços */}
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

        {/* Direita: Data e Confirmação */}
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

          {/* Passo 04: Identificação do Cliente */}
          <section className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
            <h3 className="text-sm font-black text-amber-500 uppercase tracking-[0.2em] mb-6">04. Quem é você?</h3>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Nome</label>
                  <input 
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-slate-100 outline-none focus:border-amber-500 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Sobrenome</label>
                  <input 
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Seu sobrenome"
                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-slate-100 outline-none focus:border-amber-500 transition-all font-bold"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex items-center gap-2">
                  WhatsApp 
                  <span className="text-amber-500 text-[8px]">(Obrigatório)</span>
                </label>
                <div className="relative">
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="w-full bg-slate-950 border border-slate-800 p-4 pl-12 rounded-xl text-slate-100 outline-none focus:border-amber-500 transition-all font-black text-xl tracking-wider"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.319 1.592 5.548 0 10.058-4.51 10.06-10.059.002-2.689-1.047-5.215-2.951-7.121C17.175 2.699 14.653 1.65 11.963 1.65c-5.549 0-10.059 4.51-10.06 10.06-.001 2.125.61 4.202 1.768 5.89l-.999 3.646 3.743-.982-.361-.221z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Resumo e Botão */}
          <section className="bg-amber-500 p-8 rounded-[2.5rem] shadow-2xl shadow-amber-500/20 text-slate-950">
            <h3 className="text-xs font-black uppercase tracking-widest mb-6 border-b border-slate-950/10 pb-4">Resumo da Reserva</h3>
            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-sm font-bold">
                <span className="opacity-60">Cliente:</span>
                <span className="truncate max-w-[150px] font-black">{firstName ? `${firstName} ${lastName}` : '---'}</span>
              </div>
              <div className="flex justify-between text-base font-black border-y border-slate-950/5 py-2 my-2">
                <span className="opacity-60">WhatsApp:</span>
                <span className="tracking-tighter">{phone || '---'}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="opacity-60">Barbeiro:</span>
                <span>{selectedBarber.name}</span>
              </div>
              <div className="flex justify-between text-lg font-black pt-4 border-t border-slate-950/10">
                <span>TOTAL</span>
                <span>R$ {totalPrice}</span>
              </div>
            </div>
            
            <button
              disabled={!isFormValid}
              onClick={handleBooking}
              className="w-full py-4 bg-slate-950 text-amber-500 hover:bg-slate-900 disabled:bg-slate-950/50 disabled:text-slate-700 font-black rounded-2xl transition-all uppercase tracking-[0.2em] text-sm shadow-xl"
            >
              {isFormValid ? 'Finalizar Agendamento' : 'Preencha seus dados'}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ClientBooking;
