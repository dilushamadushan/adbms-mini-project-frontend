'use client';

import React, { useState } from 'react';
import { BedDouble, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ADMISSION_DEPARTMENTS, BED_TYPES, CARE_PRECAUTIONS } from '@/lib/admissionReferralOptions';
import type { HospitalAdmissionData } from '@/types/patientAction';

interface HospitalAdmissionFormProps {
  defaultDiagnosis?: string;
  onSubmit: (data: HospitalAdmissionData) => void;
  isSubmitting?: boolean;
}

export function HospitalAdmissionForm({
  defaultDiagnosis = '',
  onSubmit,
  isSubmitting = false,
}: HospitalAdmissionFormProps) {
  const [urgency, setUrgency] = useState<HospitalAdmissionData['urgency']>('Urgent (Within 2h)');
  const [department, setDepartment] = useState(ADMISSION_DEPARTMENTS[0]);
  const [bedType, setBedType] = useState(BED_TYPES[0]);
  const [admittingDiagnosis, setAdmittingDiagnosis] = useState(defaultDiagnosis || 'Severe febrile illness');
  const [selectedPrecautions, setSelectedPrecautions] = useState<string[]>(['Oxygen Therapy (>2L/min)']);
  const [notes, setNotes] = useState('');

  const togglePrecaution = (item: string) => {
    setSelectedPrecautions((prev) =>
      prev.includes(item) ? prev.filter((p) => p !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      urgency,
      department,
      bedType,
      admittingDiagnosis,
      precautions: selectedPrecautions,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {/* Priority Urgency Selection */}
      <div className="space-y-1.5">
        <label className="font-bold text-slate-700 uppercase tracking-wide">Admission Urgency</label>
        <div className="grid grid-cols-3 gap-2">
          {(['Immediate (Stat)', 'Urgent (Within 2h)', 'Routine'] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setUrgency(lvl)}
              className={`rounded-lg border py-2 px-2.5 font-semibold text-center transition-all ${
                urgency === lvl
                  ? lvl === 'Immediate (Stat)'
                    ? 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-200'
                    : 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-200'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Ward & Bed Type */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="font-semibold text-slate-600">Target Ward / Unit</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-1.5 px-2.5 text-xs text-slate-700 bg-white focus:outline-none focus:border-red-400"
          >
            {ADMISSION_DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-600">Bed Category</label>
          <select
            value={bedType}
            onChange={(e) => setBedType(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-1.5 px-2.5 text-xs text-slate-700 bg-white focus:outline-none focus:border-red-400"
          >
            {BED_TYPES.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Admitting Diagnosis */}
      <div className="space-y-1">
        <label className="font-semibold text-slate-600">Admitting Diagnosis / Indication</label>
        <input
          type="text"
          value={admittingDiagnosis}
          onChange={(e) => setAdmittingDiagnosis(e.target.value)}
          placeholder="e.g. Acute exacerbation, observation"
          className="w-full rounded-lg border border-slate-200 py-1.5 px-3 text-xs text-slate-900 focus:outline-none focus:border-red-400"
          required
        />
      </div>

      {/* Precautions Chips */}
      <div className="space-y-1.5">
        <label className="font-semibold text-slate-600">Care Precautions & Orders</label>
        <div className="flex flex-wrap gap-1.5">
          {CARE_PRECAUTIONS.map((item) => {
            const isChecked = selectedPrecautions.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => togglePrecaution(item)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors ${
                  isChecked
                    ? 'border-red-300 bg-red-100/70 text-red-800'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {isChecked ? '✓ ' : '+ '}{item}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clinical Handover Notes */}
      <div className="space-y-1">
        <label className="font-semibold text-slate-600">Handover Notes for Inpatient Nursing Team</label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Instructions on IV fluids, monitoring, pending lab results..."
          className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:outline-none focus:border-red-400"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-red-600 py-2 px-4 font-bold text-white shadow-sm hover:bg-red-700 transition-colors disabled:opacity-50"
      >
        <BedDouble className="h-4 w-4" />
        {isSubmitting ? 'Submitting Request…' : 'Submit Inpatient Admission Request'}
      </button>
    </form>
  );
}
