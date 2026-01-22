
export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
  CANCELLED = 'CANCELLED'
}

export interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  description: string;
  image: string;
}

export interface Barber {
  id: string;
  name: string;
  avatar: string;
  specialties: string[];
  workingHours: {
    start: string; // "09:00"
    end: string;   // "19:00"
    breakStart: string;
    breakEnd: string;
  };
}

export interface Appointment {
  id: string;
  barberId: string;
  clientId: string;
  clientName: string;
  clientPhone?: string; // Novo campo opcional para WhatsApp
  serviceIds: string[];
  date: string; // ISO string YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: AppointmentStatus;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}
