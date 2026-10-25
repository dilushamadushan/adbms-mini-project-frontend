'use client';

import React from 'react';
import { BedDouble, ClipboardList, User, Users } from 'lucide-react';
import type { AdmissionDetails } from '@/types/patientAction';

interface AdmissionDetailsViewProps {
  admission: AdmissionDetails | null;
}

const displayValue = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return 'Not assigned yet';
  }
  return String(value);
};

const formatDate = (value: string | null) => {
  if (!value) return 'Not assigned yet';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
};

export function AdmissionDetailsView({ admission }: AdmissionDetailsViewProps) {
  if (!admission) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
        Admission details are not available yet.
      </div>
    );
  }

  const status = displayValue(admission.status);
  const isPending = status.toLowerCase() === 'pending';

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <BedDouble className="h-4 w-4 text-[#0E4749]" />
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Admission Details</h4>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Current inpatient admission record
            </p>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-1 font-bold ${
          isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
        }`}>
          {status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SummaryItem label="Admission ID" value={`ADM-${String(admission.admission_id).padStart(5, '0')}`} tone="teal" mono />
        <SummaryItem label="Admission Status" value={status} tone={isPending ? 'amber' : 'green'} />
        <SummaryItem label="Ward" value={admission.ward_id} tone="blue" />
        <SummaryItem label="Bed" value={admission.bed_id} tone="purple" />
      </div>

      <div className="space-y-3">
        <DetailSection icon={ClipboardList} label="Reason for Admission" tone="teal">
          {displayValue(admission.admission_reason)}
        </DetailSection>
        <DetailSection icon={Users} label="Guardian Details" tone="blue">
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
            <span>Name: {displayValue(admission.guardian_name)}</span>
            <span>Relationship: {displayValue(admission.guardian_relationship)}</span>
            <span>Contact: {displayValue(admission.guardian_contact)}</span>
          </div>
        </DetailSection>
        <DetailSection icon={User} label="Admission Information" tone="purple">
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            <span>Patient ID: {displayValue(admission.patient_id)}</span>
            <span>Gender: {displayValue(admission.gender)}</span>
            <span>Admitting Doctor ID: {displayValue(admission.admitted_doctor_id)}</span>
            <span>Admitted By User ID: {displayValue(admission.admitted_by)}</span>
            <span className="sm:col-span-2">Admission Date &amp; Time: {formatDate(admission.admitted_at)}</span>
          </div>
        </DetailSection>
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  tone,
  mono = false,
}: {
  label: string;
  value: string | number | null | undefined;
  tone: 'teal' | 'amber' | 'green' | 'blue' | 'purple';
  mono?: boolean;
}) {
  const tones = {
    teal: 'border-teal-200 bg-teal-50 text-teal-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    blue: 'border-blue-200 bg-blue-50 text-blue-900',
    purple: 'border-violet-200 bg-violet-50 text-violet-900',
  };

  return (
    <div className={`rounded-xl border p-3 ${tones[tone]}`}>
      <span className="block text-[11px] font-medium opacity-70">{label}</span>
      <span className={`mt-1 block truncate text-sm font-bold ${mono ? 'font-mono' : ''}`}>
        {displayValue(value)}
      </span>
    </div>
  );
}

function DetailSection({
  icon: Icon,
  label,
  tone,
  children,
}: {
  icon: React.ElementType;
  label: string;
  tone: 'teal' | 'blue' | 'purple';
  children: React.ReactNode;
}) {
  const iconTones = {
    teal: 'bg-teal-100 text-teal-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-violet-100 text-violet-700',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
      <div className="mb-2 flex items-center gap-2 font-semibold text-slate-700">
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconTones[tone]}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span>{label}</span>
      </div>
      <div className="text-slate-800">{children}</div>
    </div>
  );
}
