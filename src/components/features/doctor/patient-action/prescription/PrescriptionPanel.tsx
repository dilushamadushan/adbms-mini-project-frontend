'use client';

import React from 'react';
import { Pill, Send } from 'lucide-react';
import { AddMedicationForm } from './AddMedicationForm';
import { CurrentPrescriptionTable } from './CurrentPrescriptionTable';
import { PrescriptionNote } from './PrescriptionNote';
import type { Medication, PrescriptionDraft } from '@/types/patientAction';

interface PrescriptionPanelProps {
  prescription: PrescriptionDraft;
  onAddMedication: (medication: Omit<Medication, 'id'>) => void;
  onRemoveMedication: (id: string) => void;
  onClearAllMedications: () => void;
  onSendToPharmacy: () => void;
  isSending?: boolean;
}

export function PrescriptionPanel({
  prescription,
  onAddMedication,
  onRemoveMedication,
  onClearAllMedications,
  onSendToPharmacy,
  isSending = false,
}: PrescriptionPanelProps) {
  const hasMedications = prescription.medications.length > 0;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Pill className="h-5 w-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">Prescription</h3>
        </div>

        <div className="flex items-center gap-2.5">
          <span
            className={`inline-block rounded-md px-2.5 py-0.5 text-xs font-semibold ${
              prescription.status === 'Sent'
                ? 'bg-green-100 text-green-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {prescription.status}
          </span>

          <button
            type="button"
            onClick={onSendToPharmacy}
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

      {/* Add Medication Form */}
      <AddMedicationForm onAdd={onAddMedication} />

      {/* Current Prescriptions Table */}
      <CurrentPrescriptionTable
        medications={prescription.medications}
        onRemove={onRemoveMedication}
        onClearAll={onClearAllMedications}
      />

      {/* Auto-generated Prescription Notes */}
      <PrescriptionNote medications={prescription.medications} />
    </section>
  );
}
