import type { PatientAppointmentStatus } from '@/types/patient';

export const PATIENT_STATUS_STYLES: Record<string, { label: string; badge: string }> = {
  COMPLETED: { label: 'Completed', badge: 'bg-green-100 text-green-700' },
  CONFIRMED: { label: 'Confirmed', badge: 'bg-blue-100 text-blue-700' },
  PENDING:   { label: 'Pending',   badge: 'bg-amber-100 text-amber-800 border border-amber-200' },
  CANCELLED: { label: 'Cancelled', badge: 'bg-red-100 text-red-600' },
  URGENT:    { label: 'Urgent',    badge: 'bg-rose-100 text-rose-700 font-bold' },
};

export function PatientStatusBadge({ status }: { status: string }) {
  const upper = (status || '').toUpperCase();
  const s = PATIENT_STATUS_STYLES[upper] ?? { label: status, badge: 'bg-gray-100 text-gray-700' };

  return (
    <span className={`inline-block rounded-md px-2.5 py-1 text-xs font-semibold ${s.badge}`}>
      {s.label}
    </span>
  );
}
