import type { Appointment } from '@/types';

type AppointmentInput = Omit<Partial<Appointment>, 'status' | 'reason'>
  & { status?: string; reason?: string | null }
  & Record<string, unknown>;

export function unwrapAppointments(payload: unknown): AppointmentInput[] {
  if (Array.isArray(payload)) return payload as AppointmentInput[];
  if (!payload || typeof payload !== 'object') return [];
  const record = payload as Record<string, unknown>;
  if (Array.isArray(record.data)) return record.data as AppointmentInput[];
  if (record.data && typeof record.data === 'object') return unwrapAppointments(record.data);
  if (Array.isArray(record.items)) return record.items as AppointmentInput[];
  return [];
}

export function normalizeAppointment(input: AppointmentInput): Appointment {
  const status = String(input.status ?? 'PENDING').toUpperCase();
  const normalizedStatus = status === 'SCHEDULED' ? 'CONFIRMED' : status;
  return {
    id: String(input.id ?? input.apt_id ?? ''),
    patientId: String(input.patientId ?? input.patient_id ?? ''),
    patientName: String(input.patientName ?? input.patient_name ?? ''),
    doctorId: String(input.doctorId ?? input.doctor_id ?? ''),
    doctorName: String(input.doctorName ?? input.doctor_name ?? 'Care provider'),
    date: String(input.date ?? input.apt_date ?? '').slice(0, 10),
    time: String(input.time ?? input.time_slot ?? ''),
    status: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'URGENT'].includes(normalizedStatus)
      ? normalizedStatus as Appointment['status']
      : 'PENDING',
    reason: String(input.reason ?? input.dept_name ?? 'Consultation'),
    room: typeof input.room === 'string' ? input.room : undefined,
  };
}

export function appointmentDateTime(appointment: Appointment) {
  const date = new Date(`${appointment.date}T${appointment.time}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function canCancelAppointment(appointment: Appointment, now = new Date()) {
  const date = appointmentDateTime(appointment);
  return ['PENDING', 'CONFIRMED'].includes(appointment.status)
    && date !== null
    && date.getTime() - now.getTime() > 60 * 60 * 1000;
}