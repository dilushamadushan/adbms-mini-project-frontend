'use client';

import React, { useState } from 'react';
import { Pill, Send } from 'lucide-react';
import { AddMedicationForm } from './AddMedicationForm';
import { CurrentPrescriptionTable } from './CurrentPrescriptionTable';
import type { Medication, PrescriptionDraft } from '@/types/patientAction';
import { validatePrescription } from '@/lib/prescriptionValidation';

interface PrescriptionPanelProps {
  prescription: PrescriptionDraft;
  onAddMedication: (medication: Omit<Medication, 'id'>) => void;
  onRemoveMedication: (id: string) => void;
  onClearAllMedications: () => void;
  onSendToPharmacy: () => void;
  onDiagnosisChange: (value: string) => void;
  onClinicalNotesChange: (value: string) => void;
  isSending?: boolean;
}

export function PrescriptionPanel({
  prescription,
  onAddMedication,
  onRemoveMedication,
  onClearAllMedications,
  onSendToPharmacy,
  onDiagnosisChange,
  onClinicalNotesChange,
  isSending = false,
}: PrescriptionPanelProps) {
  const hasMedications = prescription.medications.length > 0;
  const [showSummary, setShowSummary] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const handleSendClick = () => {
    const error = validatePrescription(prescription);
    if (error) {
      setValidationMessage(error);
      return;
    }
    setValidationMessage(null);
    setShowSummary(true);
  };

  const confirmSend = () => {
    setShowSummary(false);
    onSendToPharmacy();
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Pill className="h-5 w-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">Prescription</h3>
        </div>

      </div>

      <div className="space-y-4">
        {/* Medication entry section */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
          <div className="mb-3 flex items-center gap-2 border-b border-blue-100 pb-2">
            <div className="h-2 w-2 rounded-full bg-blue-600" />
            <h4 className="text-xs font-bold uppercase tracking-wide text-blue-800">
              Add Medication
            </h4>
           
          </div>
          <AddMedicationForm
            onAdd={onAddMedication}
            existingMedications={prescription.medications}
            diagnosis={prescription.diagnosis}
            clinicalNotes={prescription.clinicalNotes}
            onDiagnosisChange={onDiagnosisChange}
            onClinicalNotesChange={onClinicalNotesChange}
          />
        </div>

        {/* Current prescription section */}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
          <div className="mb-3 flex items-center justify-between gap-2 border-b border-emerald-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-600" />
              <h4 className="text-xs font-bold uppercase tracking-wide text-emerald-800">
                Current Prescription ({prescription.medications.length})
              </h4>
            
            </div>
            {prescription.medications.length > 0 && (
              <button
                type="button"
                onClick={onClearAllMedications}
                className="text-xs font-medium text-emerald-700 transition-colors hover:text-red-600"
              >
                Remove all
              </button>
            )}
          </div>
          <CurrentPrescriptionTable
            medications={prescription.medications}
            onRemove={onRemoveMedication}
          />
          {validationMessage && (
            <p className="mt-3 rounded-lg border border-red-100 bg-red-50 p-2.5 text-xs text-red-700">
              {validationMessage}
            </p>
          )}
          {(prescription.diagnosis || prescription.clinicalNotes) && (
            <div className="mt-4 grid grid-cols-1 gap-3 border-t border-emerald-100 pt-3 sm:grid-cols-3">
              {prescription.diagnosis && (
                <div className="rounded-lg border border-amber-100 bg-amber-50/60 p-3 sm:col-span-1">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-amber-700">
                    Diagnosis
                  </p>
                  <p className="text-xs text-slate-700">{prescription.diagnosis}</p>
                </div>
              )}
              {prescription.clinicalNotes && (
                <div className="rounded-lg border border-sky-100 bg-sky-50/60 p-3 sm:col-span-2">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-sky-700">
                    Clinical Notes
                  </p>
                  <p className="whitespace-pre-wrap text-xs text-slate-700">
                    {prescription.clinicalNotes}
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="mt-4 flex justify-end border-t border-emerald-100 pt-3">
            <button
              type="button"
              onClick={handleSendClick}
              disabled={!hasMedications || isSending || prescription.status === 'Sent'}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                !hasMedications || prescription.status === 'Sent'
                  ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                  : 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              {isSending ? 'Sending…' : prescription.status === 'Sent' ? 'Sent' : 'Send to Pharmacy'}
            </button>
          </div>
        </div>
      </div>

      {showSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
            <h4 className="text-base font-bold text-slate-900">Confirm Prescription</h4>
            <p className="mt-1 text-xs text-slate-500">
              Review the details before saving this prescription.
            </p>
            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-lg bg-amber-50 p-3">
                <p className="font-bold text-amber-700">Diagnosis</p>
                <p className="mt-1 text-slate-700">{prescription.diagnosis}</p>
              </div>
              <div className="rounded-lg bg-sky-50 p-3">
                <p className="font-bold text-sky-700">Clinical Notes</p>
                <p className="mt-1 whitespace-pre-wrap text-slate-700">{prescription.clinicalNotes}</p>
              </div>
              <div>
                <p className="mb-2 font-bold text-emerald-700">
                  Medicines ({prescription.medications.length})
                </p>
                <div className="space-y-2">
                  {prescription.medications.map((medicine) => (
                    <div key={medicine.id} className="rounded-lg border border-slate-200 p-2.5">
                      <p className="font-semibold text-slate-800">
                        {medicine.medicine} (ID: {medicine.medicineId})
                      </p>
                      <p className="text-slate-600">
                        {medicine.dose}, {medicine.frequency}, {medicine.duration}
                      </p>
                      <p className="mt-1 text-slate-600">
                        Note: {medicine.clinicalNote}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSummary(false)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSend}
                disabled={isSending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-3.5 w-3.5" />
                {isSending ? 'Saving…' : 'OK, Save Prescription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
