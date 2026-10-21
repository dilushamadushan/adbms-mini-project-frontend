'use client';

import React, { useState } from 'react';
import { Send, Building2, Truck } from 'lucide-react';
import {
  REFERRAL_DESTINATIONS,
  REFERRAL_SPECIALTIES,
  TRANSPORT_MODES,
} from '@/lib/admissionReferralOptions';
import type { UrgentReferralData } from '@/types/patientAction';

interface UrgentReferralFormProps {
  defaultSummary?: string;
  onSubmit: (data: UrgentReferralData) => void;
  isSubmitting?: boolean;
}

export function UrgentReferralForm({
  defaultSummary = '',
  onSubmit,
  isSubmitting = false,
}: UrgentReferralFormProps) {
  const [destination, setDestination] = useState(REFERRAL_DESTINATIONS[0]);
  const [specialty, setSpecialty] = useState(REFERRAL_SPECIALTIES[0]);
  const [urgency, setUrgency] = useState<UrgentReferralData['urgency']>('Emergency Transfer');
  const [transportMode, setTransportMode] = useState(TRANSPORT_MODES[0]);
  const [reasonForReferral, setReasonForReferral] = useState('Specialized tertiary evaluation & management');
  const [clinicalSummary, setClinicalSummary] = useState(
    defaultSummary || 'Patient presenting with acute symptoms requiring secondary tertiary review.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      destination,
      specialty,
      urgency,
      transportMode,
      reasonForReferral,
      clinicalSummary,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {/* Referral Urgency */}
      <div className="space-y-1.5">
        <label className="font-bold text-slate-700 uppercase tracking-wide">Referral Priority</label>
        <div className="grid grid-cols-3 gap-2">
          {(['Emergency Transfer', 'Urgent Same-Day', 'Within 24-48 Hours'] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUrgency(u)}
              className={`rounded-lg border py-2 px-2 text-center font-semibold transition-all ${
                urgency === u
                  ? 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-200'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Target Hospital & Specialty */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="font-semibold text-slate-600 flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
            Referred Facility
          </label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-1.5 px-2.5 text-xs text-slate-700 bg-white focus:outline-none focus:border-red-400"
          >
            {REFERRAL_DESTINATIONS.map((dest) => (
              <option key={dest} value={dest}>{dest}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-600">Specialty Department</label>
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-1.5 px-2.5 text-xs text-slate-700 bg-white focus:outline-none focus:border-red-400"
          >
            {REFERRAL_SPECIALTIES.map((spec) => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transport Mode & Referral Reason */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="font-semibold text-slate-600 flex items-center gap-1">
            <Truck className="h-3.5 w-3.5 text-slate-400" />
            Transport Arrangement
          </label>
          <select
            value={transportMode}
            onChange={(e) => setTransportMode(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-1.5 px-2.5 text-xs text-slate-700 bg-white focus:outline-none focus:border-red-400"
          >
            {TRANSPORT_MODES.map((mode) => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-600">Reason for Referral</label>
          <input
            type="text"
            value={reasonForReferral}
            onChange={(e) => setReasonForReferral(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-1.5 px-3 text-xs text-slate-900 focus:outline-none focus:border-red-400"
            required
          />
        </div>
      </div>

      {/* Clinical Summary */}
      <div className="space-y-1">
        <label className="font-semibold text-slate-600">Clinical Summary & Vitals for Receiving Team</label>
        <textarea
          rows={3}
          value={clinicalSummary}
          onChange={(e) => setClinicalSummary(e.target.value)}
          className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-900 focus:outline-none focus:border-red-400"
          required
        />
      </div>

      {/* Dispatch Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-red-600 py-2 px-4 font-bold text-white shadow-sm hover:bg-red-700 transition-colors disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {isSubmitting ? 'Dispatching Referral…' : 'Dispatch Urgent Referral Packet'}
      </button>
    </form>
  );
}
