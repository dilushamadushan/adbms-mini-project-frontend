import apiClient from '@/lib/apiClient';
import type { Appointment } from '@/types';

export interface AppointmentRecord extends Record<string, unknown> {
  apt_id: number;
  patient_id: number;
  patient_user_id: number;
  patient_name: string;
  doctor_id: number;
  doctor_name: string;
  dept_id: number;
  dept_name: string;
  apt_date: string;
  time_slot: string;
  status: string;
  reason?: string | null;
}

export interface AppointmentCreatePayload {
  doctor_id: number;
  dept_id: number;
  apt_date: string;
  time_slot: string;
}

export const appointmentService = {

  getAll: (params?: { date?: string; doctorId?: string; patientId?: string }) =>
    apiClient.get<AppointmentRecord[]>('/appointments', {
      params: {
        date: params?.date,
        doctor_id: params?.doctorId,
        patient_user_id: params?.patientId,
      },
    }),

  getBookedSlots: (doctorId: string, date: string, excludeAppointmentId?: string) =>
    apiClient.get<string[]>('/appointments/availability', {
      params: { doctor_id: doctorId, date, exclude_apt_id: excludeAppointmentId },
    }),

  getById: (id: string) =>
    apiClient.get<AppointmentRecord>(`/appointments/${id}`),

  create: (data: AppointmentCreatePayload) =>
    apiClient.post<AppointmentRecord>('/appointments', data),

  reschedule: (id: string, aptDate: string, timeSlot: string) =>
    apiClient.patch<AppointmentRecord>(`/appointments/${id}/schedule`, {
      apt_date: aptDate,
      time_slot: timeSlot,
    }),

  updateStatus: (id: string, status: Appointment['status']) =>
    apiClient.patch<AppointmentRecord>(`/appointments/${id}/status`, { status }),

  cancel: (id: string) =>
    apiClient.delete(`/appointments/${id}`),
};
