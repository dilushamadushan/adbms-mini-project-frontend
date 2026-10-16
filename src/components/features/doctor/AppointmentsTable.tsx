import Link from 'next/link';
import { Calendar, User, MoreVertical } from 'lucide-react';
import type { DoctorAppointment } from '@/types/doctor';
import { StatusBadge } from './StatusBadge';

const HEADERS = ['Time', 'Patient', 'Age', 'Status', 'Actions'];

interface Props {
  items: DoctorAppointment[];
  title: string;
  emptyText?: string;
  isUpcoming?: boolean;
}

export function AppointmentsTable({ items, title, emptyText = 'No appointments.', isUpcoming = false }: Props) {
  return (
    <section className={`rounded-xl border bg-white p-5 shadow-sm transition-colors ${isUpcoming ? 'border-amber-300 ring-1 ring-amber-200/60' : 'border-slate-200'}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Calendar className={`h-5 w-5 ${isUpcoming ? 'text-amber-600' : 'text-blue-600'}`} /> {title}
        </h3>
        <Link href="/doctor/schedule" className="rounded-lg border border-slate-200 px-4 py-1.5 text-sm text-blue-600 hover:bg-blue-50">
          View All
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">{emptyText}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-500">
                {HEADERS.map((h) => (
                  <th key={h} className="whitespace-nowrap px-3 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} className={`border-b border-slate-100 last:border-0 ${isUpcoming ? 'hover:bg-amber-50/40' : 'hover:bg-slate-50/60'}`}>
                  <td className="whitespace-nowrap px-3 py-3.5 font-semibold text-slate-900">
                    {a.time}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${isUpcoming ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'}`}>
                        <User className="h-4 w-4" />
                      </div>
                      <p className="font-semibold text-slate-900">{a.patientName}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 font-medium text-slate-700">{a.age ?? '—'}</td>
                  <td className="px-3 py-3.5"><StatusBadge status={a.status} /></td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/doctor/patients/${a.patientId}`}
                        className={`rounded-md px-4 py-1.5 text-xs font-medium ${isUpcoming ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                      >
                        View
                      </Link>
                      <button type="button" aria-label="More actions" className="text-slate-400 hover:text-slate-600">
                        <MoreVertical className="h-4 w-4" />
                      </button>
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