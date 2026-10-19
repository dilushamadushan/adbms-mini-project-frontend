'use client';

import Link from 'next/link';
import { Calendar, Stethoscope, ArrowRight, X } from 'lucide-react';
import type { Appointment } from '@/types';
import { PatientStatusBadge } from './PatientStatusBadge';
import { canCancelAppointment } from '@/lib/patientAppointments';

interface PatientAppointmentsTableProps {
  title: string;
  items: Appointment[];
  emptyText?: string;
  onCancelClick?: (appointment: Appointment) => void;
}

export function PatientAppointmentsTable({
  title,
  items,
  emptyText = 'No appointments found.',
  onCancelClick,
}: PatientAppointmentsTableProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Calendar className="h-5 w-5 text-[#0E4749]" /> {title}
        </h3>
        <Link
          href="/patient/book"
          className="rounded-lg bg-[#E07856] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#c96749] transition-colors"
        >
          Book New
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">{emptyText}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-500">
                <th className="whitespace-nowrap px-3 py-3 font-medium">Time / Date</th>
                <th className="px-3 py-3 font-medium">Doctor</th>
                <th className="px-3 py-3 font-medium">Reason / Care</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                  <td className="whitespace-nowrap px-3 py-3 font-semibold text-slate-900">
                    <div>{a.time || '—'}</div>
                    <div className="text-xs font-normal text-slate-500">{a.date}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-[#0E4749]">
                        <Stethoscope className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-slate-900">{a.doctorName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    <p className="font-medium text-slate-800">{a.reason || 'General Checkup'}</p>
                    {a.room && <p className="text-xs text-slate-400">Room: {a.room}</p>}
                  </td>
                  <td className="px-3 py-3">
                    <PatientStatusBadge status={a.status} />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href="/patient/appointments"
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold text-[#0E4749] hover:bg-teal-50"
                      >
                        View <ArrowRight className="h-3 w-3" />
                      </Link>
                      {canCancelAppointment(a) && onCancelClick && (
                        <button
                          onClick={() => onCancelClick(a)}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          <X className="h-3 w-3" /> Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
