"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CalendarClock, CalendarPlus, Hospital, Users } from 'lucide-react';
import { receptionistService, type ReceptionistOverview } from '@/services/receptionistService';

function formatTime(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ReceptionistDashboard() {
  const [overview, setOverview] = useState<ReceptionistOverview | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    receptionistService.getOverview()
      .then(setOverview)
      .catch(() => setError('Receptionist dashboard data could not be loaded.'));
  }, []);

  const cards = [
    { label: "Today's appointments", value: overview?.appointments_today, icon: CalendarClock },
    { label: 'Total patients', value: overview?.total_patients, icon: Users },
    { label: 'Active admissions', value: overview?.active_admissions, icon: Hospital },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#5B6472]">Reception</p>
          <h2 className="mt-1 text-2xl font-bold text-[#0E4749]">Today&apos;s Overview</h2>
        </div>
        <Link href="/receptionist/appointments" className="inline-flex items-center gap-2 rounded-lg bg-[#E07856] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#c96749]">
          <CalendarPlus className="h-4 w-4" /> Manage appointments
        </Link>
      </header>

      {error && <p role="alert" className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}

      <section className="grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon }) => (
          <article key={label} className="flex items-center justify-between rounded-xl border border-[#DCE3E0] bg-white p-5">
            <div><p className="text-sm text-[#5B6472]">{label}</p><p className="mt-1 text-3xl font-bold text-gray-900">{value ?? '—'}</p></div>
            <span className="rounded-lg bg-teal-50 p-3 text-[#0E4749]"><Icon className="h-6 w-6" /></span>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-xl border border-[#DCE3E0] bg-white">
        <div className="border-b border-[#DCE3E0] p-5">
          <h3 className="font-bold text-[#0E4749]">Appointments today</h3>
        </div>
        {overview?.appointments.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-[#5B6472]">
                <tr><th className="p-4">Time</th><th className="p-4">Patient</th><th className="p-4">Doctor</th><th className="p-4">Department</th><th className="p-4">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-[#DCE3E0]">
                {overview.appointments.map((appointment) => (
                  <tr key={appointment.apt_id}>
                    <td className="p-4 font-semibold">{formatTime(appointment.time_slot)}</td>
                    <td className="p-4">{appointment.patient_name}</td>
                    <td className="p-4">{appointment.doctor_name}</td>
                    <td className="p-4">{appointment.dept_name}</td>
                    <td className="p-4">{appointment.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-5 text-sm text-[#5B6472]">{overview ? 'No appointments scheduled for today.' : 'Loading appointments…'}</p>
        )}
      </section>

      <nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['/receptionist/book', 'Register patient'],
          ['/receptionist/patients', 'Patient records'],
          ['/receptionist/admit', 'Admit patient'],
          ['/receptionist/admissions', 'Discharge and billing'],
        ].map(([href, label]) => <Link key={href} href={href} className="rounded-lg border border-[#DCE3E0] bg-white p-4 text-sm font-semibold text-[#0E4749] hover:border-[#0E4749]">{label}</Link>)}
      </nav>
    </div>
  );
}
