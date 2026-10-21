'use client';

import React from 'react';
import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';
import { StatusBadge } from '@/components/features/doctor/StatusBadge';
import type { AppointmentStatus } from '@/types/doctor';

interface PatientActionHeaderProps {
  patientName: string;
  status: AppointmentStatus;
}

export function PatientActionHeader({ patientName, status }: PatientActionHeaderProps) {
  return (
    <div className="space-y-3">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500">
        <Link
          href="/doctor/dashboard"
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Home className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <Link
          href="/doctor/patient-action"
          className="hover:text-slate-800 transition-colors"
        >
          Today&apos;s Patients
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="font-semibold text-slate-800 truncate">{patientName}</span>
      </nav>

      {/* Title & Status Badge */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Patient Details
        </h1>
        <StatusBadge status={status} />
      </div>
    </div>
  );
}
