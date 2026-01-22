
import { Appointment, Barber, TimeSlot, AppointmentStatus } from '../types';
import { SLOT_INTERVAL } from '../constants.tsx';

/**
 * Lógica de Negócio: Verificação de Disponibilidade
 * 
 * Esta função simula uma consulta ao backend que calcula os slots livres.
 * 1. Define o intervalo operacional do barbeiro.
 * 2. Gera slots de 30 em 30 minutos.
 * 3. Filtra slots que conflitam com agendamentos existentes.
 * 4. Filtra o horário de almoço.
 */
export const calculateAvailableSlots = (
  date: string,
  barber: Barber,
  existingAppointments: Appointment[]
): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const [startHour, startMin] = barber.workingHours.start.split(':').map(Number);
  const [endHour, endMin] = barber.workingHours.end.split(':').map(Number);
  
  const startTime = new Date();
  startTime.setHours(startHour, startMin, 0, 0);
  
  const endTime = new Date();
  endTime.setHours(endHour, endMin, 0, 0);
  
  let current = new Date(startTime);
  
  while (current < endTime) {
    const timeString = current.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    // Verificar se o horário está em um agendamento existente
    const isOccupied = existingAppointments.some(app => 
      app.date === date && 
      app.barberId === barber.id &&
      app.status !== AppointmentStatus.CANCELLED &&
      app.startTime === timeString
    );
    
    // Verificar horário de almoço
    const isLunch = timeString >= barber.workingHours.breakStart && 
                    timeString < barber.workingHours.breakEnd;
    
    slots.push({
      time: timeString,
      available: !isOccupied && !isLunch
    });
    
    current.setMinutes(current.getMinutes() + SLOT_INTERVAL);
  }
  
  return slots;
};

/**
 * Estratégia Anti-Conflito (Passo 1):
 * No banco de dados real (PostgreSQL), usaríamos uma CONSTRAINT UNIQUE composta:
 * UNIQUE(barber_id, appointment_date, start_time) 
 * Isso impede que dois registros iguais existam ao mesmo tempo.
 * No nível da aplicação, usamos transações (Serializable) para garantir a atomicidade.
 */
