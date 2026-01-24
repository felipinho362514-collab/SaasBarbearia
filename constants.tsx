
import { Barber, Service, UserRole } from './types';

export const BARBERS: Barber[] = [
  {
    id: 'b1',
    name: 'Arthur "The Blade"',
    role: UserRole.BARBER,
    avatar: 'https://images.unsplash.com/photo-1503910361347-1c38167766c6?auto=format&fit=crop&q=80&w=200&h=200',
    phone: '5511912345678',
    email: 'arthur@barber.com',
    pin: '1234',
    address: 'Rua das Navalhas, 120 - Centro, São Paulo',
    operatingDays: 'Segunda a Sexta',
    specialties: ['Corte Clássico', 'Barba Terapia'],
    workingHours: { start: '09:00', end: '19:00', breakStart: '12:00', breakEnd: '13:00' }
  },
  {
    id: 'b2',
    name: 'Vitor "Fade Master"',
    role: UserRole.BARBER,
    avatar: 'https://images.unsplash.com/photo-1621605815841-aa887ad43617?auto=format&fit=crop&q=80&w=200&h=200',
    phone: '5511998765432',
    email: 'vitor@barber.com',
    pin: '1234',
    address: 'Av. do Degradê, 500 - Jardim América, São Paulo',
    operatingDays: 'Terça a Sábado',
    specialties: ['Degradê Moderno', 'Platinado'],
    workingHours: { start: '10:00', end: '20:00', breakStart: '14:00', breakEnd: '15:00' }
  }
];

export const SERVICES: Service[] = [
  { 
    id: 's1', 
    name: 'Corte Social', 
    durationMinutes: 30, 
    price: 50, 
    description: 'Corte tradicional com acabamento fino.',
    image: 'https://images.unsplash.com/photo-1622286332618-f2803b186716?auto=format&fit=crop&q=80&w=400&h=300'
  },
  { 
    id: 's2', 
    name: 'Barba Completa', 
    durationMinutes: 30, 
    price: 40, 
    description: 'Toalha quente e alinhamento com navalha.',
    image: 'https://images.unsplash.com/photo-1512690118299-a91f173974cc?auto=format&fit=crop&q=80&w=400&h=300'
  },
  { 
    id: 's3', 
    name: 'Combo Premium', 
    durationMinutes: 60, 
    price: 80, 
    description: 'Corte + Barba + Lavagem especial.',
    image: 'https://images.unsplash.com/photo-1599351431247-f10b21ce5a9a?auto=format&fit=crop&q=80&w=400&h=300'
  }
];

export const SLOT_INTERVAL = 30;
