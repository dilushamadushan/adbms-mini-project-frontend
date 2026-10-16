"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, Clock3, FileText, ReceiptText, Stethoscope, X } from 'lucide-react';
import { appointmentService } from '@/services/appointmentService';
import { useAuth } from '@/hooks/useAuth';
import type { Appointment } from '@/types';
import { appointmentDateTime, canCancelAppointment, normalizeAppointment, unwrapAppointments } from '@/lib/patientAppointments';

const overviewCards = [
  { label: 'Total bookings', key: 'appointments', href: '/patient/appointments', icon: CalendarDays, tone: 'text-[#0E4749] bg-teal-50' },
  { label: 'Billing records', key: 'billing', href: '/patient/billing', icon: ReceiptText, tone: 'text-amber-700 bg-amber-50' },
  { label: 'Medical records', key: 'records', href: '/patient/records', icon: FileText, tone: 'text-blue-700 bg-blue-50' },
  { label: 'Prescriptions', key: 'prescriptions', href: '/patient/prescriptions', icon: Stethoscope, tone: 'text-emerald-700 bg-emerald-50' },
];

export default function PatientDashboard() {
  const { user, userName, isLoading: isAuthLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
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
        if (isActive) setAppointments(unwrapAppointments(data).map(normalizeAppointment));
      })
      .catch(() => {
        if (isActive) setLoadError(true);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => { isActive = false; };
  }, [isAuthLoading, user?.user_id]);

  const upcomingAppointments = appointments
    .filter((appointment) => ['PENDING', 'CONFIRMED'].includes(appointment.status))
    .filter((appointment) => {
      const date = appointmentDateTime(appointment);
      return date && date >= new Date();
    })
    .sort((first, second) => (appointmentDateTime(first)?.getTime() ?? 0) - (appointmentDateTime(second)?.getTime() ?? 0));
  const nextAppointment = upcomingAppointments[0];

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

  function overviewValue(key: string) {
    if (key === 'appointments') return isAuthLoading || (user && isLoading) ? '…' : String(appointments.length);
    if (key === 'billing') return '0';
    if (key === 'records') return '2';
    return '2';
  }

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-xl bg-[#0E4749] p-6 text-white md:p-8">
        <div className="relative z-10 max-w-xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-teal-200">Patient portal</p>
          <h2 className="text-2xl font-bold">Welcome, {userName || 'Patient'}</h2>
          <p className="mt-2 text-sm text-teal-100">Your health information and care plan, all in one place.</p>
          <Link href="/patient/book" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#E07856] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#c96749]">
            Book an appointment <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div aria-hidden="true" className="absolute -right-10 -top-16 h-64 w-64 rounded-full border-[32px] border-teal-700/40" />
      </section>

      <section aria-label="Patient overview" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href} className="group flex min-h-28 items-center justify-between rounded-lg border border-[#DCE3E0] bg-white p-4 transition-colors hover:border-[#0E4749] hover:bg-[#f8fbfa] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E4749]">
              <div>
                <p className="text-sm font-medium text-[#5B6472]">{card.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{overviewValue(card.key)}</p>
              </div>
              <span className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.tone}`}><Icon className="h-5 w-5" /></span>
            </Link>
          );
        })}
      </section>

      <section className="rounded-xl border border-[#DCE3E0] bg-white p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-[#0E4749]">Your next appointment</h3>
            <p className="mt-1 text-sm text-[#5B6472]">Keep track of your upcoming care.</p>
          </div>
          <Link href="/patient/appointments" className="shrink-0 text-sm font-bold text-[#0E4749] hover:underline">All appointments</Link>
        </div>

        {isAuthLoading || (user && isLoading) ? (
          <p className="rounded-lg bg-gray-50 p-4 text-sm text-[#5B6472]">Loading appointments…</p>
        ) : loadError ? (
          <p role="alert" className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">Appointments could not be loaded. Please try again later.</p>
        ) : nextAppointment ? (
          <div className="flex flex-col gap-4 rounded-lg border border-[#DCE3E0] bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-gray-900">{nextAppointment.reason || 'Consultation'}</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-[#5B6472]">
                <Clock3 className="h-4 w-4" />
                {appointmentDateTime(nextAppointment)?.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
              <p className="mt-2 text-sm font-medium text-[#0E4749]">{nextAppointment.doctorName}</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/patient/appointments" className="inline-flex items-center gap-1 text-sm font-bold text-[#0E4749] hover:underline">Manage <ArrowRight className="h-4 w-4" /></Link>
              {canCancelAppointment(nextAppointment) && (
                <button onClick={() => setAppointmentToCancel(nextAppointment)} className="inline-flex items-center gap-1 text-sm font-bold text-rose-700 hover:underline">
                  <X className="h-4 w-4" /> Cancel
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[#DCE3E0] p-5 text-center">
            <CalendarDays className="mx-auto h-6 w-6 text-[#5B6472]" />
            <p className="mt-2 font-semibold text-gray-900">No upcoming appointments</p>
            <Link href="/patient/book" className="mt-2 inline-block text-sm font-bold text-[#0E4749] hover:underline">Find a time to visit</Link>
          </div>
        )}
      </section>

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
