'use client';

import React, { useState } from 'react';
import { Check, FileText, User } from 'lucide-react';
import { toast } from 'sonner';
import type { DischargeRequestData } from '@/types/patientAction';

interface DischargePatientFormProps {
  admissionId: number;
  doctorId: number;
  doctorName: string;
  notes: string;
  onNotesChange: (value: string) => void;
  onConfirmDischarge: (data: DischargeRequestData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function DischargePatientForm({
  admissionId,
  doctorId,
  doctorName,
  notes,
  onNotesChange,
  onConfirmDischarge,
  onCancel,
  isSubmitting = false,
}: DischargePatientFormProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (!admissionId || !doctorId || !notes.trim()) {
      const message = 'Discharge notes are required before confirmation.';
      setFormError(message);
      toast.error(message);
      return;
    }
    setShowConfirmation(true);
  };

  const confirmDischarge = async () => {
    setShowConfirmation(false);
    try {
      await onConfirmDischarge({
        admission_id: admissionId,
        doctor_id: doctorId,
        notes: notes.trim(),
      });
      toast.success('Discharge request submitted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to request discharge';
      setFormError(message);
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
        <FileText className="h-4 w-4 text-blue-600" />
        <span>Discharge Patient</span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <label className="mb-1 block font-semibold text-slate-700">Authorizing Doctor</label>
        <div className="relative">
          <User className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#0E4749]" />
          <input
            type="text"
            value={doctorName}
            readOnly
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-2.5 text-xs font-semibold text-slate-800 focus:outline-none"
          />
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
        <label className="mb-2 block text-sm font-bold text-slate-800">Discharge Notes</label>
        <textarea
          rows={7}
          value={notes}
          onChange={(event) => onNotesChange(event.target.value.slice(0, 1000))}
          placeholder="Enter discharge instructions or clinical notes..."
          className="w-full resize-y rounded-lg border border-blue-200 bg-white p-3 text-sm text-slate-900 focus:border-[#0E4749] focus:outline-none"
          required
        />
        <div className="pt-1.5 text-right text-[11px] text-slate-500">{notes.length}/1000</div>
      </div>

      {formError && <p className="font-medium text-red-600">{formError}</p>}

      <div className="flex justify-end gap-2.5 pt-1">
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0E4749] px-4 py-2 font-bold text-white shadow-sm hover:bg-teal-900 disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" />
          {isSubmitting ? 'Saving...' : 'Confirm Discharge'}
        </button>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-[2px]">
          <div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Confirm Patient Discharge</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Are you sure you want to submit this discharge request?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowConfirmation(false)} className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button type="button" onClick={confirmDischarge} disabled={isSubmitting} className="rounded-lg bg-[#0E4749] px-3.5 py-2 text-xs font-bold text-white hover:bg-teal-900 disabled:opacity-50">
                {isSubmitting ? 'Saving...' : 'Confirm Discharge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
