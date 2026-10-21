'use client';

import React, { useState } from 'react';
import { UserX, CheckSquare, AlertOctagon, FileCheck } from 'lucide-react';
import { DISAGREE_REASONS, DISPOSITION_TYPES } from '@/lib/admissionReferralOptions';
import type { DischargeDisagreeData } from '@/types/patientAction';

interface DischargeDisagreeFormProps {
  onSubmit: (data: DischargeDisagreeData) => void;
  isSubmitting?: boolean;
}

export function DischargeDisagreeForm({
  onSubmit,
  isSubmitting = false,
}: DischargeDisagreeFormProps) {
  const [dispositionType, setDispositionType] =
    useState<DischargeDisagreeData['dispositionType']>(DISPOSITION_TYPES[0]);
  const [disagreeReason, setDisagreeReason] = useState(DISAGREE_REASONS[0]);
  const [counselingProvided, setCounselingProvided] = useState(true);
  const [risksExplained, setRisksExplained] = useState(true);
  const [followUpPlan, setFollowUpPlan] = useState('Re-evaluate with primary physician in 48-72 hours.');
  const [returnWarningSigns, setReturnWarningSigns] = useState(
    'Return to Emergency immediately if breathing difficulty, chest pain, fever >102°F, or confusion occurs.'
  );

  const isDama = dispositionType.includes('DAMA');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      dispositionType,
      disagreeReason: isDama ? disagreeReason : 'N/A - Standard Discharge',
      counselingProvided,
      risksExplained,
      followUpPlan,
      returnWarningSigns,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {/* Disposition Selection */}
      <div className="space-y-1.5">
        <label className="font-bold text-slate-700 uppercase tracking-wide">
          Disposition / Discharge Status
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {DISPOSITION_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setDispositionType(type)}
              className={`rounded-lg border p-2 text-left font-semibold transition-all ${
                dispositionType === type
                  ? type.includes('DAMA')
                    ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-200'
                    : 'border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-200'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* DAMA Warning Banner if Patient Disagrees */}
      {isDama && (
        <div className="rounded-lg border border-amber-300 bg-amber-50/70 p-3 space-y-3">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <AlertOctagon className="h-4 w-4 text-amber-600" />
            Patient Refusal of Recommended Admission (DAMA)
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-amber-900">Documented Reason Patient Declines Admission</label>
            <select
              value={disagreeReason}
              onChange={(e) => setDisagreeReason(e.target.value)}
              className="w-full rounded-lg border border-amber-300 py-1.5 px-2.5 text-xs text-slate-800 bg-white focus:outline-none"
            >
              {DISAGREE_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Legal / Medical Checkboxes */}
          <div className="space-y-2 pt-1 text-slate-700">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={counselingProvided}
                onChange={(e) => setCounselingProvided(e.target.checked)}
                className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
              />
              <span>Informed counseling provided: Patient has full cognitive capacity to make medical decisions.</span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={risksExplained}
                onChange={(e) => setRisksExplained(e.target.checked)}
                className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
              />
              <span>Clinical risks explained: Patient explicitly advised on severe consequences of refusal.</span>
            </label>
          </div>
        </div>
      )}

      {/* Follow-up Plan & Return Warning Signs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="font-semibold text-slate-600">Home Care & Follow-Up Plan</label>
          <textarea
            rows={2}
            value={followUpPlan}
            onChange={(e) => setFollowUpPlan(e.target.value)}
            className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-400"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-600">Return Precautions / Red Flag Warnings</label>
          <textarea
            rows={2}
            value={returnWarningSigns}
            onChange={(e) => setReturnWarningSigns(e.target.value)}
            className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-400"
            required
          />
        </div>
      </div>

      {/* Finalize Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full flex items-center justify-center gap-1.5 rounded-lg py-2 px-4 font-bold text-white shadow-sm transition-colors disabled:opacity-50 ${
          isDama ? 'bg-amber-700 hover:bg-amber-800' : 'bg-[#0E4749] hover:bg-[#0b3b3d]'
        }`}
      >
        <FileCheck className="h-4 w-4" />
        {isSubmitting ? 'Documenting Disposition…' : isDama ? 'Confirm Patient Refusal (DAMA Record)' : 'Complete Discharge Documentation'}
      </button>
    </form>
  );
}
