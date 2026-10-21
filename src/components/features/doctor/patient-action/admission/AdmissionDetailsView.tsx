'use client';

import React from 'react';
import { Calendar, User, BedDouble, CheckCircle2 } from 'lucide-react';

interface AdmissionDetailsViewProps {
  admissionId?: string;
  wardBed?: string;
  date?: string;
  doctor?: string;
  reason?: string;
  condition?: string;
}

export function AdmissionDetailsView({
  admissionId = 'ADM-00124',
  wardBed = 'Ward A / Bed 12',
  date = '20 Oct 2026 10:45 AM',
  doctor = 'Dr. Smith',
  reason = 'Severe abdominal pain and vomiting',
  condition = 'Stable',
}: AdmissionDetailsViewProps) {
  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <BedDouble className="h-4 w-4 text-[#0E4749]" />
          <h4 className="font-bold text-slate-900 text-sm">Admission Overview</h4>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 font-bold text-emerald-800">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
          Admitted
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50/80 p-3.5 border border-slate-100">
        <div>
          <span className="text-slate-500 block text-[11px]">Admission ID</span>
          <span className="font-mono font-bold text-slate-800 text-xs">{admissionId}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Ward / Bed</span>
          <span className="font-bold text-slate-800 text-xs">{wardBed}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Admission Date &amp; Time</span>
          <span className="font-medium text-slate-800 text-xs">{date}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Responsible Doctor</span>
          <span className="font-medium text-slate-800 text-xs">{doctor}</span>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <div>
          <span className="text-slate-500 block font-semibold">Reason for Admission</span>
          <p className="text-slate-800 text-xs mt-0.5">{reason}</p>
        </div>

        <div>
          <span className="text-slate-500 block font-semibold">Current Inpatient Condition</span>
          <div className="flex items-center gap-1.5 mt-1 font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>{condition}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
