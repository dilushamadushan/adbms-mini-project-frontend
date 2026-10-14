import type { AppointmentStatus } from '@/types/doctor';

export const STATUS_STYLES: Record<AppointmentStatus, { label: string; badge: string; text: string }> = {
  COMPLETED: { label: 'Completed', badge: 'bg-green-100 text-green-700', text: 'text-green-600' },
  SCHEDULED: { label: 'Scheduled', badge: 'bg-blue-100 text-blue-700', text: 'text-blue-600' },
  CANCELLED: { label: 'Cancelled', badge: 'bg-red-100 text-red-600', text: 'text-red-500' },
  UPCOMING:  { label: 'Upcoming',  badge: 'bg-orange-100 text-orange-600', text: 'text-orange-500' },
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-block rounded-md px-2.5 py-1 text-xs font-medium ${s.badge}`}>
      {s.label}
    </span>
  );
}