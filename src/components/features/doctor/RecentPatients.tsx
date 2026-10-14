'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DoctorAppointment } from '@/types/doctor';
import { StatusBadge } from './StatusBadge';
import { formatShortDate } from '@/lib/dateUtils';

const HEADERS = ['Date', 'Patient', 'Age', 'Reason', 'Status', 'Actions'];
const PAGE_SIZE = 5;

export function RecentPatients({ items }: { items: DoctorAppointment[] }) {
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageItems  = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const prev = () => setPage((p) => Math.max(0, p - 1));
  const next = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <User className="h-5 w-5 text-blue-600" /> Recent Patients
        </h3>
        <Link
          href="/doctor/patients"
          className="rounded-lg border border-slate-200 px-4 py-1.5 text-sm text-blue-600 hover:bg-blue-50"
        >
          View All
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">No recent patients.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-slate-500">
                  {HEADERS.map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageItems.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0">
                    <td className="whitespace-nowrap px-3 py-3 font-semibold text-slate-900">
                      {formatShortDate(p.date)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <User className="h-4 w-4" />
                        </div>
                        <p className="font-semibold text-slate-900">{p.patientName}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-700">{p.age}</td>
                    <td className="px-3 py-3 text-slate-700">{p.reason}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={"/doctor/patients/" + p.patientId}
                          className="rounded-md bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
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

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-500">
                Showing {page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, items.length)} of {items.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prev}
                  disabled={page === 0}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPage(i)}
                    className={"flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-medium transition-colors " + (i === page ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={next}
                  disabled={page === totalPages - 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}