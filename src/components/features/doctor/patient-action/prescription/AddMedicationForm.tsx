'use client';

import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { doctorService, type DoctorMedicine } from '@/services/doctorService';
import {
  DOSE_OPTIONS,
  DURATION_OPTIONS,
  FREQUENCY_OPTIONS,
} from '@/lib/patientActionOptions';
import type { Medication } from '@/types/patientAction';

interface AddMedicationFormProps {
  onAdd: (medication: Omit<Medication, 'id'>) => void;
  existingMedications: Medication[];
  diagnosis: string;
  clinicalNotes: string;
  onDiagnosisChange: (value: string) => void;
  onClinicalNotesChange: (value: string) => void;
}

export function AddMedicationForm({
  onAdd,
  existingMedications,
  diagnosis,
  clinicalNotes,
  onDiagnosisChange,
  onClinicalNotesChange,
}: AddMedicationFormProps) {
  const [medicine, setMedicine] = useState('');
  const [dose, setDose] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [instructions, setInstructions] = useState('');
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [genericName, setGenericName] = useState('');
  const [medicines, setMedicines] = useState<DoctorMedicine[]>([]);
  const [medicineError, setMedicineError] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    doctorService.getMedicines()
      .then(setMedicines)
      .catch(() => setMedicineError('Medicines could not be loaded.'));
  }, []);

  const handleMedicineChange = (medicineId: string) => {
    const selected = medicines.find((item) => String(item.medicine_id) === medicineId);
    setSelectedMedicineId(medicineId);
    setMedicine(selected?.med_name ?? '');
    setGenericName(selected?.generic_name ?? '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicine.trim()) {
      setValidationError('Please enter or select a medicine.');
      return;
    }
    if (!clinicalNotes.trim()) {
      setValidationError('Please add a clinical note for this prescription.');
      return;
    }
    const nextMedication = {
      medicine: medicine.trim(),
      dose: dose || '500 mg',
      frequency: frequency || 'Every 8 hours',
      duration: duration || '5 days',
    };
    const duplicate = existingMedications.some((item) =>
      item.medicine === nextMedication.medicine &&
      item.dose === nextMedication.dose &&
      item.frequency === nextMedication.frequency &&
      item.duration === nextMedication.duration &&
      item.clinicalNote?.trim() === clinicalNotes.trim()
    );
    if (duplicate) {
      setValidationError('This medicine with the same dose, frequency, and duration is already added.');
      return;
    }
    setValidationError(null);

    onAdd({
      medicineId: Number(selectedMedicineId),
      medicine: nextMedication.medicine,
      genericName,
      dose: nextMedication.dose,
      frequency: nextMedication.frequency,
      duration: nextMedication.duration,
      instructions: instructions || 'Take with food',
      clinicalNote: clinicalNotes.trim(),
    });

    // Reset form fields
    setMedicine('');
    setDose('');
    setFrequency('');
    setDuration('');
    setInstructions('');
    setSelectedMedicineId('');
    setGenericName('');
  };

  const handleClear = () => {
    setMedicine('');
    setDose('');
    setFrequency('');
    setDuration('');
    setInstructions('');
    setSelectedMedicineId('');
    setGenericName('');
    setValidationError(null);
    onDiagnosisChange('');
    onClinicalNotesChange('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
        Add Medication
      </h4>

      {validationError && (
        <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{validationError}</p>
      )}

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs font-semibold text-slate-600">Diagnosis</span>
          <input
            value={diagnosis}
            onChange={(e) => onDiagnosisChange(e.target.value)}
            placeholder="e.g. Fever"
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold text-slate-600">Clinical notes</span>
          <textarea
            value={clinicalNotes}
            onChange={(e) => onClinicalNotesChange(e.target.value)}
            placeholder="Add clinical notes"
            rows={4}
            className="w-full resize-y rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
          />
        </label>
      </div>

      {/* Linked medicine and generic-name selections */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
        <div className="sm:col-span-6">
          <select
            value={selectedMedicineId}
            onChange={(e) => handleMedicineChange(e.target.value)}
            disabled={medicines.length === 0}
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none disabled:bg-slate-50"
          >
            <option value="">
              {medicineError || (medicines.length === 0 ? 'Loading medicines...' : 'Select medicine')}
            </option>
            {medicines.map((item) => (
              <option key={item.medicine_id} value={item.medicine_id}>
                {item.medicine_id} - {item.med_name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-6">
          <select
            value={genericName}
            disabled={!selectedMedicineId}
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none disabled:bg-slate-50"
          >
            <option value="">Generic name</option>
            {genericName && <option value={genericName}>{genericName}</option>}
          </select>
        </div>

        <div className="sm:col-span-4">
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

      </div>

      {/* Dosage details, duration, and add button */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12 items-center">
        <div className="sm:col-span-4">
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

        <div className="flex gap-2 sm:col-span-5">
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 rounded-lg border border-slate-300 bg-white py-1.5 px-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Clear
          </button>
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-blue-600 py-1.5 px-3 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
      </div>
    </form>
  );
}
