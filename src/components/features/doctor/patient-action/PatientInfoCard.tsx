'use client';

import React from 'react';
import { User, Calendar, Phone, Droplet, AlertTriangle, Users } from 'lucide-react';
import type { PatientDetails } from '@/types/patientAction';

interface PatientInfoCardProps {
  patient: PatientDetails;
}

export function PatientInfoCard({ patient }: PatientInfoCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
        {/* Left Section: Avatar & Primary Demographics */}
        <div className="flex items-center gap-4 lg:col-span-5">
          <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 ring-4 ring-slate-50">
            <User className="h-10 w-10 text-slate-400" />
          </div>

          <div className="space-y-1.5 min-w-0">
            <h2 className="text-xl font-bold text-slate-900 truncate">
              {patient.name}
            </h2>
            <p className="text-xs font-mono font-medium text-slate-500">
              MRN: {patient.mrn}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1 font-medium text-blue-600">
                <User className="h-3.5 w-3.5 text-blue-500" />
                {patient.gender}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Age: <strong className="text-slate-800">{patient.age}</strong>
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                DOB: <strong className="text-slate-800">{patient.dob}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Middle Section: Contact & Medical Flags */}
        <div className="space-y-2 border-t border-slate-100 pt-4 text-xs sm:border-t-0 sm:pt-0 lg:col-span-4 lg:border-l lg:border-slate-100 lg:pl-6">
          <div className="flex items-center gap-2.5">
            <Phone className="h-4 w-4 flex-shrink-0 text-slate-500" />
            <span className="text-slate-500">Phone:</span>
            <span className="font-semibold text-slate-900">{patient.phone}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Droplet className="h-4 w-4 flex-shrink-0 text-red-500" />
            <span className="text-slate-500">Blood Group:</span>
            <span className="font-semibold text-slate-900">{patient.bloodGroup}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-500" />
            <span className="text-slate-500">Allergies:</span>
            <span className="font-semibold text-amber-800">{patient.allergies}</span>
          </div>
        </div>

        {/* Right Section: Emergency Contact */}
        <div className="border-t border-slate-100 pt-4 sm:border-t-0 sm:pt-0 lg:col-span-3 lg:border-l lg:border-slate-100 lg:pl-6">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Users className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <div className="text-xs text-slate-500 font-medium">Emergency Contact:</div>
              <div className="text-xs font-bold text-slate-900">
                {patient.emergencyContact.name}
              </div>
              <div className="text-xs text-slate-600 font-mono">
                {patient.emergencyContact.phone}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
