'use client';

import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import {
  DOSE_OPTIONS,
  DURATION_OPTIONS,
  FREQUENCY_OPTIONS,
  MEDICINE_SUGGESTIONS,
  ROUTE_OPTIONS,
  TIME_SLOT_OPTIONS,
} from '@/lib/patientActionOptions';
import type { Medication } from '@/types/patientAction';

interface AddMedicationFormProps {
  onAdd: (medication: Omit<Medication, 'id'>) => void;
}

export function AddMedicationForm({ onAdd }: AddMedicationFormProps) {
  const [medicine, setMedicine] = useState('');
  const [dose, setDose] = useState('');
  const [route, setRoute] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [timeSlots, setTimeSlots] = useState('');
  const [instructions, setInstructions] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSelectMedicineSuggestion = (name: string) => {
    setMedicine(name);
    const found = MEDICINE_SUGGESTIONS.find((s) => s.name.toLowerCase() === name.toLowerCase());
    if (found) {
      if (found.defaultDose) setDose(found.defaultDose);
      if (found.defaultRoute) setRoute(found.defaultRoute);
      if (found.defaultFrequency) setFrequency(found.defaultFrequency);
      if (found.defaultDuration) setDuration(found.defaultDuration);
      if (found.defaultTimeSlots) setTimeSlots(found.defaultTimeSlots);
      if (found.defaultInstructions) setInstructions(found.defaultInstructions);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicine.trim()) {
      setValidationError('Please enter or select a medicine.');
      return;
    }
    setValidationError(null);

    onAdd({
      medicine: medicine.trim(),
      dose: dose || '500 mg',
      route: route || 'Oral',
      frequency: frequency || 'Every 8 hours',
      duration: duration || '5 days',
      timeSlots: timeSlots || 'Morning & Evening',
      instructions: instructions || 'Take with food',
    });

    // Reset form fields
    setMedicine('');
    setDose('');
    setRoute('');
    setFrequency('');
    setDuration('');
    setTimeSlots('');
    setInstructions('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
        Add Medication
      </h4>

      {validationError && (
        <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{validationError}</p>
      )}

      {/* Row 1: Search medicine, Dose, Route */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
        <div className="relative sm:col-span-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            list="med-suggestions"
            value={medicine}
            onChange={(e) => handleSelectMedicineSuggestion(e.target.value)}
            placeholder="Search medicine..."
            className="w-full rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
          <datalist id="med-suggestions">
            {MEDICINE_SUGGESTIONS.map((item) => (
              <option key={item.name} value={item.name} />
            ))}
          </datalist>
        </div>

        <div className="sm:col-span-3">
          <select
            value={dose}
            onChange={(e) => setDose(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-1.5 px-2.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="">Select dose</option>
            {DOSE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-1.5 px-2.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="">Select route</option>
            {ROUTE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Frequency, Duration, Time Slots, Add Button */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12 items-center">
        <div className="sm:col-span-3">
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-1.5 px-2.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="">Select frequency</option>
            {FREQUENCY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-1.5 px-2.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="">Select duration</option>
            {DURATION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-4">
          <select
            value={timeSlots}
            onChange={(e) => setTimeSlots(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-1.5 px-2.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="">Select time slots</option>
            {TIME_SLOT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-1 rounded-lg bg-blue-600 py-1.5 px-3 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
      </div>
    </form>
  );
}
