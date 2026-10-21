'use client';

import React, { useState } from 'react';
import { History, ChevronUp, ChevronDown, ChevronRight } from 'lucide-react';
import type { PatientHistoryEntry } from '@/types/patientAction';

interface PatientHistoryProps {
  history: PatientHistoryEntry[];
}

export function PatientHistory({ history }: PatientHistoryProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header with Collapsible Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-left focus:outline-none"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">Patient History</h3>
        </div>
        <span className="text-slate-400 hover:text-slate-600">
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </span>
      </button>

      {/* Subtitle */}
      <p className="mt-1 text-xs text-slate-500">
        View past visits, diagnoses and previous prescriptions.
      </p>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="mt-4 space-y-3">
          {history.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-500">
              No previous visit history found.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Visit Type</th>
                    <th className="py-2.5 px-3">Diagnosis</th>
                    <th className="py-2.5 px-3">Prescriptions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50">
                      <td className="whitespace-nowrap py-2.5 px-3 font-medium text-slate-900">
                        {row.date}
                      </td>
                      <td className="whitespace-nowrap py-2.5 px-3 text-slate-600">
                        {row.visitType}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">
                        {row.diagnosis}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {row.prescriptions}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="pt-1">
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              View More History
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
