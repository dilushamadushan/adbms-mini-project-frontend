'use client';

import React from 'react';
import { Zap, Pill, Hospital } from 'lucide-react';
import type { ClinicalActionType } from '@/types/patientAction';

interface ClinicalActionsProps {
  activeAction: ClinicalActionType;
  onSelectAction: (action: ClinicalActionType) => void;
}

export function ClinicalActions({
  activeAction = 'prescription',
  onSelectAction,
}: ClinicalActionsProps) {
  const isPrescription = activeAction === 'prescription';
  const isReferral = activeAction === 'referral';

  return (
    <section className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-blue-600" />
        <h3 className="text-base font-bold text-slate-900">Clinical Actions</h3>
      </div>

      {/* Switchable Action Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" role="tablist">
        {/* 1. Prescription Card */}
        <button
          type="button"
          role="tab"
          aria-selected={isPrescription}
          onClick={() => onSelectAction('prescription')}
          className={`flex w-full items-center gap-3.5 rounded-xl border p-4 text-left transition-all cursor-pointer ${
            isPrescription
              ? 'border-sky-400 bg-sky-50/60 ring-2 ring-sky-200 shadow-sm'
              : 'border-slate-200 bg-white hover:border-sky-200 hover:bg-slate-50/60'
          }`}
        >
          <div
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-colors ${
              isPrescription
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-sky-100 text-sky-600'
            }`}
          >
            <Pill className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900">
              Prescription
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Add &amp; manage medications
            </p>
          </div>
        </button>

        {/* 2. Urgent Admission / Referral Card */}
        <button
          type="button"
          role="tab"
          aria-selected={isReferral}
          onClick={() => onSelectAction('referral')}
          className={`flex w-full items-center gap-3.5 rounded-xl border p-4 text-left transition-all cursor-pointer ${
            isReferral
              ? 'border-red-400 bg-red-50/70 ring-2 ring-red-200 shadow-sm'
              : 'border-red-200 bg-red-50/30 hover:bg-red-50 hover:border-red-300'
          }`}
        >
          <div
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-colors ${
              isReferral
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-red-100 text-red-600'
            }`}
          >
            <Hospital className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h4
              className={`text-sm font-bold ${
                isReferral ? 'text-red-700' : 'text-red-600'
              }`}
            >
              Admission / Referral
            </h4>
            <p className="text-xs text-red-500 mt-0.5">
              Inpatient &amp; hospital referral
            </p>
          </div>
        </button>
      </div>
    </section>
  );
}
