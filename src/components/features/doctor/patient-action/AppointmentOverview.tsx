'use client';

import React from 'react';
import { Calendar, Clock, FileText } from 'lucide-react';
import type { AppointmentDetails } from '@/types/patientAction';

interface AppointmentOverviewProps {
  appointment: AppointmentDetails;
}

export function AppointmentOverview({ appointment }: AppointmentOverviewProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-blue-600" />
        <h3 className="text-base font-bold text-slate-900">Appointment Overview</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Date Item */}
        <div className="flex items-start gap-3 rounded-lg bg-slate-50/70 p-3 border border-slate-100">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-600">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-500">Date</span>
            <span className="text-sm font-bold text-slate-900">
              {appointment.formattedDate || appointment.date}
            </span>
          </div>
        </div>

        {/* Time Item */}
        <div className="flex items-start gap-3 rounded-lg bg-slate-50/70 p-3 border border-slate-100">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-600">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-500">Time</span>
            <span className="text-sm font-bold text-slate-900">
              {appointment.time}
            </span>
          </div>
        </div>

        {/* Reason Item */}
        <div className="flex items-start gap-3 rounded-lg bg-slate-50/70 p-3 border border-slate-100">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-600">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-medium text-slate-500">Reason</span>
            <span className="text-sm font-bold text-slate-900 truncate block">
              {appointment.reason}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
