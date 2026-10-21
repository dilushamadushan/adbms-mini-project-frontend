'use client';

import React, { useState } from 'react';
import { BedDouble, Check } from 'lucide-react';

interface AdmitPatientFormProps {
  onConfirmAdmit: (data: {
    wardBed: string;
    reason: string;
    condition: string;
    doctor: string;
  }) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function AdmitPatientForm({
  onConfirmAdmit,
  onCancel,
  isSubmitting = false,
}: AdmitPatientFormProps) {
  const [wardBed, setWardBed] = useState('Ward A / Bed 12');
  const [reason, setReason] = useState('Severe abdominal pain and vomiting');
  const [condition, setCondition] = useState('Stable');
  const [doctor, setDoctor] = useState('Dr. Smith');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmAdmit({ wardBed, reason, condition, doctor });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
        <BedDouble className="h-4 w-4 text-[#0E4749]" />
        <span>Inpatient Admission Request</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-700 font-semibold mb-1">Ward / Bed Assignment</label>
          <select
            value={wardBed}
            onChange={(e) => setWardBed(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-1.5 px-2.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#0E4749]"
          >
            <option value="Ward A / Bed 12">Ward A / Bed 12 (General Medicine)</option>
            <option value="Ward A / Bed 14">Ward A / Bed 14 (General Medicine)</option>
            <option value="Ward B / Bed 03">Ward B / Bed 03 (Surgical)</option>
            <option value="ICU / Bed 02">ICU / Bed 02 (Critical Care)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-1">Initial Condition</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-1.5 px-2.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#0E4749]"
          >
            <option value="Stable">Stable</option>
            <option value="Moderate">Moderate</option>
            <option value="Severe">Severe</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-slate-700 font-semibold mb-1">Reason for Admission</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-1.5 px-2.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#0E4749]"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-slate-700 font-semibold mb-1">Attending / Responsible Doctor</label>
          <input
            type="text"
            value={doctor}
            onChange={(e) => setDoctor(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-1.5 px-2.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#0E4749]"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2.5 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0E4749] px-4 py-1.5 text-xs font-bold text-white hover:bg-teal-900 transition-colors shadow-sm disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" />
          {isSubmitting ? 'Submitting…' : 'Confirm Admission'}
        </button>
      </div>
    </form>
  );
}
