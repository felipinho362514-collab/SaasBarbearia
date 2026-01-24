
export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
  CANCELLED = 'CANCELLED'
}

export enum UserRole {
  CLIENT = 'CLIENT',
  BARBER = 'BARBER'
}

export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  // Específico para barbeiro
  pin?: string; 
  services?: string[]; // IDs dos serviços que ele realiza
}

export interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  description: string;
  image: string;
}

export interface Barber extends User {
  specialties: string[];
  workingHours: {
    start: string;
    end: string;
    breakStart: string;
    breakEnd: string;
  };
  address: string;
  operatingDays: string;
}

export interface Appointment {
  id: string;
  barberId: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceIds: string[];
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  status: AppointmentStatus;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}
