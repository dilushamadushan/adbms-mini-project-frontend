'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
import { usePatientAppointments } from '@/hooks/usePatientAppointments';
import { appointmentDateTime, canCancelAppointment } from '@/lib/patientAppointments';
import { appointmentService } from '@/services/appointmentService';
import { formatDateLabel, todayKey } from '@/lib/dateUtils';
import type { Appointment } from '@/types';
import type { PatientStat } from '@/types/patient';
import { PatientGreetingBanner } from './PatientGreetingBanner';
import { PatientStatCard } from './PatientStatCard';
import { PatientAppointmentsTable } from './PatientAppointmentsTable';
import { MiniCalendar } from '../doctor/MiniCalendar';

interface PatientDashboardViewProps {
  patientId: string | number;
  patientName: string;
}

export function PatientDashboardView({ patientId, patientName }: PatientDashboardViewProps) {
  const { data: appointments, setData: setAppointments, loading, error } = usePatientAppointments(patientId);
  const today = todayKey();
  const [selected, setSelected] = useState(today);

  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  // Group appointments by date
  const byDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    appointments.forEach((a) => {
      const list = map.get(a.date) ?? [];
      list.push(a);
      map.set(a.date, list);
    });
    return map;
  }, [appointments]);

  const markedDates = useMemo(() => new Set(appointments.map((a) => a.date)), [appointments]);

  // Upcoming dates
  const upcomingAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const d = appointmentDateTime(a);
      return d && d >= new Date() && ['PENDING', 'CONFIRMED'].includes(a.status);
    });
  }, [appointments]);

  const upcomingDates = useMemo(() => new Set(upcomingAppointments.map((a) => a.date)), [upcomingAppointments]);

  const completedCount = useMemo(() => {
    return appointments.filter((a) => a.status === 'COMPLETED').length;
  }, [appointments]);

  const selectedList = byDate.get(selected) ?? [];
  const isToday = selected === today;
  const isUpcoming = upcomingDates.has(selected);

  const stats: PatientStat[] = [
    { key: 'bookings', title: 'Total Bookings', value: appointments.length, subtext: '', tone: 'blue' },
    { key: 'upcoming', title: 'Upcoming Visits', value: upcomingAppointments.length, subtext: '', tone: 'yellow' },
    { key: 'completed', title: 'Completed Visits', value: completedCount, subtext: '', tone: 'green' },
    { key: 'records', title: 'Medical Records', value: '2', subtext: '', tone: 'purple' },
  ];

  const title = isToday
    ? "Today's Appointments"
    : isUpcoming
    ? "Upcoming Appointments"
    : `Appointments · ${formatDateLabel(selected)}`;

  const emptyText = isToday
    ? 'No appointments today.'
    : isUpcoming
    ? 'No upcoming appointments on this date.'
    : 'No appointments on this date.';

  async function confirmCancellation() {
    if (!appointmentToCancel) return;
    setIsCancelling(true);
    setCancelError('');
    try {
      await appointmentService.cancel(appointmentToCancel.id);
      setAppointments((current) =>
        current.map((item) =>
          item.id === appointmentToCancel.id ? { ...item, status: 'CANCELLED' } : item
        )
      );
      setAppointmentToCancel(null);
    } catch {
      setCancelError('This appointment could not be cancelled. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="space-y-6">
      <PatientGreetingBanner name={patientName || 'Patient'} />

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-slate-500">Loading appointments…</p>}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        {stats.map(({ key, ...s }) => (
          <PatientStatCard key={key} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <PatientAppointmentsTable
            title={title}
            items={selectedList.length > 0 ? selectedList : upcomingAppointments.slice(0, 5)}
            emptyText={emptyText}
            onCancelClick={(a) => setAppointmentToCancel(a)}
          />
        </div>

        <aside className="space-y-6">
          <MiniCalendar
            selected={selected}
            onSelect={setSelected}
            markedDates={markedDates}
            upcomingDates={upcomingDates}
          />
        </aside>
      </div>

      {appointmentToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/45 p-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="cancel-appointment-title" className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 id="cancel-appointment-title" className="text-lg font-bold text-gray-900">Are you sure you want to cancel?</h3>
            <p className="mt-2 text-sm text-[#5B6472]">
              Your {appointmentToCancel.reason?.toLowerCase() || 'consultation'} appointment with {appointmentToCancel.doctorName} is scheduled for{' '}
              {appointmentDateTime(appointmentToCancel)?.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}.
            </p>
            <p className="mt-3 text-sm font-semibold text-gray-800">Would you rather reschedule it?</p>
            {cancelError && <p role="alert" className="mt-3 text-sm text-rose-700">{cancelError}</p>}
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                onClick={() => setAppointmentToCancel(null)}
                disabled={isCancelling}
                className="rounded-lg border border-[#DCE3E0] px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Keep appointment
              </button>
              <Link
                href={`/patient/book?rescheduleId=${encodeURIComponent(appointmentToCancel.id)}`}
                className="rounded-lg border border-[#0E4749] px-4 py-2 text-sm font-semibold text-[#0E4749] hover:bg-teal-50"
              >
                Reschedule
              </Link>
              <button
                onClick={confirmCancellation}
                disabled={isCancelling}
                className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling…' : 'Confirm cancellation'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
