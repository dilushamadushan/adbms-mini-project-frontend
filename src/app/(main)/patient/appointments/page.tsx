"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CalendarDays, Clock3, MapPin, X } from 'lucide-react';
import { appointmentService } from '@/services/appointmentService';
import { useAuth } from '@/hooks/useAuth';
import { appointmentDateTime, canCancelAppointment, normalizeAppointment, unwrapAppointments } from '@/lib/patientAppointments';
import type { Appointment } from '@/types';

export default function PatientAppointments() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoadedAt, setAppointmentsLoadedAt] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    if (isAuthLoading || !user?.user_id) return;
    let isActive = true;

    appointmentService.getAll({ patientId: String(user.user_id) })
      .then(({ data }) => {
        if (isActive) {
          setAppointments(unwrapAppointments(data).map(normalizeAppointment));
          setAppointmentsLoadedAt(Date.now());
        }
      })
      .catch(() => {
        if (isActive) setLoadError(true);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => { isActive = false; };
  }, [isAuthLoading, user?.user_id]);

  const sortedAppointments = [...appointments].sort((first, second) => {
    const firstDate = appointmentDateTime(first)?.getTime() ?? 0;
    const secondDate = appointmentDateTime(second)?.getTime() ?? 0;
    const firstIsUpcoming = firstDate >= appointmentsLoadedAt && ['PENDING', 'CONFIRMED'].includes(first.status);
    const secondIsUpcoming = secondDate >= appointmentsLoadedAt && ['PENDING', 'CONFIRMED'].includes(second.status);
    if (firstIsUpcoming !== secondIsUpcoming) return firstIsUpcoming ? -1 : 1;
    return firstIsUpcoming ? firstDate - secondDate : secondDate - firstDate;
  });

  async function confirmCancellation() {
    if (!appointmentToCancel) return;
    setIsCancelling(true);
    setCancelError('');
    try {
      await appointmentService.cancel(appointmentToCancel.id);
      setAppointments((current) => current.map((appointment) => (
        appointment.id === appointmentToCancel.id ? { ...appointment, status: 'CANCELLED' } : appointment
      )));
      setAppointmentToCancel(null);
    } catch {
      setCancelError('This appointment could not be cancelled. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#5B6472]">Care schedule</p>
          <h2 className="mt-1 text-2xl font-bold text-[#0E4749]">My appointments</h2>
        </div>
        <Link href="/patient/book" className="rounded-lg bg-[#0E4749] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a3335]">Book appointment</Link>
      </header>

      {isAuthLoading || (user && isLoading) ? (
        <p className="rounded-lg border border-[#DCE3E0] bg-white p-5 text-sm text-[#5B6472]">Loading appointments…</p>
      ) : loadError ? (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">Appointments could not be loaded. Please try again later.</p>
      ) : sortedAppointments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#DCE3E0] bg-white p-8 text-center">
          <CalendarDays className="mx-auto h-7 w-7 text-[#0E4749]" />
          <p className="mt-3 font-semibold text-gray-900">No appointments yet</p>
          <p className="mt-1 text-sm text-[#5B6472]">Your bookings will appear here.</p>
          <Link href="/patient/book" className="mt-4 inline-block text-sm font-bold text-[#0E4749] hover:underline">Find a time to visit</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedAppointments.map((appointment) => {
            const date = appointmentDateTime(appointment);
            const isUpcoming = date !== null && date >= new Date() && ['PENDING', 'CONFIRMED'].includes(appointment.status);
            const statusTone = appointment.status === 'CANCELLED'
              ? 'bg-gray-100 text-gray-700'
              : appointment.status === 'COMPLETED'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-emerald-50 text-emerald-700';

            return (
              <article key={appointment.id} className="relative overflow-hidden rounded-xl border border-[#DCE3E0] bg-white p-5">
                <div className={`absolute inset-y-0 left-0 w-1 ${appointment.status === 'CANCELLED' ? 'bg-gray-400' : isUpcoming ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                <div className="flex flex-col gap-4 pl-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className={`inline-flex rounded px-2 py-1 text-xs font-bold ${statusTone}`}>{appointment.status}</span>
                    <h3 className="mt-2 text-lg font-bold text-gray-900">{appointment.reason || 'Consultation'}</h3>
                    <p className="text-sm font-medium text-[#0E4749]">{appointment.doctorName}</p>
                    <div className="mt-4 grid gap-2 text-sm text-[#5B6472] sm:grid-cols-2">
                      <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 shrink-0" />{date?.toLocaleDateString(undefined, { dateStyle: 'medium' }) ?? appointment.date}</p>
                      <p className="flex items-center gap-2"><Clock3 className="h-4 w-4 shrink-0" />{date?.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) ?? appointment.time}</p>
                      {appointment.room && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" />{appointment.room}</p>}
                    </div>
                  </div>
                  {canCancelAppointment(appointment) && (
                    <button onClick={() => setAppointmentToCancel(appointment)} className="inline-flex shrink-0 items-center gap-1 self-start text-sm font-bold text-rose-700 hover:underline">
                      <X className="h-4 w-4" /> Cancel
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {appointmentToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/45 p-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="cancel-appointment-title" className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 id="cancel-appointment-title" className="text-lg font-bold text-gray-900">Are you sure you want to cancel?</h3>
            <p className="mt-2 text-sm text-[#5B6472]">Your {appointmentToCancel.reason.toLowerCase()} appointment with {appointmentToCancel.doctorName} is scheduled for {appointmentDateTime(appointmentToCancel)?.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}.</p>
            <p className="mt-3 text-sm font-semibold text-gray-800">Would you rather reschedule it?</p>
            {cancelError && <p role="alert" className="mt-3 text-sm text-rose-700">{cancelError}</p>}
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button onClick={() => setAppointmentToCancel(null)} disabled={isCancelling} className="rounded-lg border border-[#DCE3E0] px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Keep appointment</button>
              <Link href={`/patient/book?rescheduleId=${encodeURIComponent(appointmentToCancel.id)}`} className="rounded-lg border border-[#0E4749] px-4 py-2 text-sm font-semibold text-[#0E4749] hover:bg-teal-50">Reschedule</Link>
              <button onClick={confirmCancellation} disabled={isCancelling} className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-50">{isCancelling ? 'Cancelling…' : 'Confirm cancellation'}</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
