import type { Appointment } from '@/types';

export type PatientAppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'URGENT';

export type PatientStatTone = 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'amber';

export interface PatientStat {
  key: string;
  title: string;
  value: number | string;
  subtext: string;
  tone: PatientStatTone;
}

export interface PatientDashboardAppointment {
  id: string;
  date: string;
  timeSlot: string;
  time: string;
  doctorId: string;
  doctorName: string;
  departmentName?: string;
  reason: string;
  status: PatientAppointmentStatus;
  room?: string;
}
