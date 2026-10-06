
export type Role = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST' | 'PATIENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Staff extends User {
  department?: string;
  specialty?: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export type PatientStatus = 'Critical' | 'Recovering' | 'Stable';

export interface Patient {
  id: string;
  name: string;
  mrn: string;
  dateOfBirth?: string;
  age?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  phone?: string;
  address?: string;
  allergies?: string[];
  status: PatientStatus;
  lastVisit?: string;
}

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'URGENT';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  reason: string;
  room?: string;
}

export type BedStatus = 'AVAILABLE' | 'STABLE' | 'MODERATE' | 'CRITICAL' | 'CLEANING' | 'INCOMING';

export interface Bed {
  id: string;
  wardName: string;
  status: BedStatus;
  patientId?: string;
  patientName?: string;
  etd?: string;
}

export type LabStatus = 'Pending' | 'In Progress' | 'Completed' | 'Critical';

export interface LabOrder {
  id: string;
  title: string;
  patientId: string;
  patientName: string;
  doctorId?: string;
  date: string;
  status: LabStatus;
  results?: Record<string, string>;
}

export interface Medication {
  name: string;
  dose: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  time: string;
  title: string;
  description: string;
  vitals?: Record<string, string>;
  medications?: Medication[];
  doctorId: string;
  doctorName: string;
}

export interface Department {
  id: string;
  name: string;
  head?: string;
  staffCount: number;
  bedCount: number;
  occupancy: number;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  risk: RiskLevel;
  timestamp: string;
}
