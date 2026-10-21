'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import type { Medication } from '@/types/patientAction';

interface CurrentPrescriptionTableProps {
  medications: Medication[];
  onRemove: (id: string) => void;
  onClearAll?: () => void;
}

export function CurrentPrescriptionTable({
  medications,
  onRemove,
  onClearAll,
}: CurrentPrescriptionTableProps) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-800">
          Current Prescription ({medications.length})
        </h4>
        {medications.length > 0 && onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-slate-400 hover:text-red-600 transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      {/* Table */}
      {medications.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
          No medications added to this prescription yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-2 px-2.5">Medicine</th>
                <th className="py-2 px-2.5">Dose</th>
                <th className="py-2 px-2.5">Route</th>
                <th className="py-2 px-2.5">Frequency</th>
                <th className="py-2 px-2.5">Duration</th>
                <th className="py-2 px-2.5">Time Slots</th>
                <th className="py-2 px-2.5">Instructions</th>
                <th className="py-2 px-2 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {medications.map((med) => (
                <tr key={med.id} className="hover:bg-slate-50/50">
                  <td className="whitespace-nowrap py-2.5 px-2.5 font-bold text-slate-900">
                    {med.medicine}
                  </td>
                  <td className="whitespace-nowrap py-2.5 px-2.5 text-slate-600">
                    {med.dose}
                  </td>
                  <td className="whitespace-nowrap py-2.5 px-2.5 text-slate-600">
                    {med.route}
                  </td>
                  <td className="whitespace-nowrap py-2.5 px-2.5 text-slate-600">
                    {med.frequency}
                  </td>
                  <td className="whitespace-nowrap py-2.5 px-2.5 text-slate-600">
                    {med.duration}
                  </td>
                  <td className="whitespace-nowrap py-2.5 px-2.5 text-slate-600">
                    {med.timeSlots}
                  </td>
                  <td className="py-2.5 px-2.5 text-slate-600">
                    {med.instructions || '—'}
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <button
                      type="button"
                      onClick={() => onRemove(med.id)}
                      title="Remove medication"
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
