'use client';

import React from 'react';
import { usePatientAction } from '@/hooks/usePatientAction';
import { PatientActionHeader } from './PatientActionHeader';
import { PatientInfoCard } from './PatientInfoCard';
import { AppointmentOverview } from './AppointmentOverview';
import { ClinicalNotes } from './ClinicalNotes';
import { PatientHistory } from './PatientHistory';
import { ClinicalActions } from './ClinicalActions';
import { PrescriptionPanel } from './prescription/PrescriptionPanel';
import { AdmissionReferralPanel } from './admission/AdmissionReferralPanel';
import { PatientActionFooter } from './PatientActionFooter';

interface PatientActionViewProps {
  appointmentId: string;
}

export function PatientActionView({ appointmentId }: PatientActionViewProps) {
  const {
    patient,
    appointment,
    history,
    notes,
    updateNotes,
    prescription,
    activeAction,
    setActiveAction,
    addMedication,
    removeMedication,
    clearMedications,
    saveNotes,
    sendToPharmacy,
    escalateForAdmission,
    submitAdmission,
    submitReferral,
    submitDischargeDisagree,
    completeAppointment,
    loading,
    error,
    isSavingNotes,
    isSendingPharmacy,
    isSubmittingEscalation,
    actionNotice,
  } = usePatientAction(appointmentId);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-2">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#0E4749] border-r-transparent align-[-0.125em]" />
        <p className="text-sm font-medium text-slate-500">Loading patient action data…</p>
      </div>
    );
  }

  if (error || !patient || !appointment) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center space-y-3">
        <p className="text-sm font-semibold text-red-700">
          {error || 'Unable to load appointment details'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header with Breadcrumb and Status */}
      <PatientActionHeader patientName={patient.name} status={appointment.status} />

      {/* Floating Action Notice Toast */}
      {actionNotice && (
        <div className="rounded-lg bg-[#0E4749] px-4 py-2.5 text-xs font-medium text-white shadow-md transition-all">
          {actionNotice}
        </div>
      )}

      {/* Patient Information Card */}
      <PatientInfoCard patient={patient} />

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-start">
        {/* Left Column: Overview, Notes, History */}
        <div className="space-y-5">
          <AppointmentOverview appointment={appointment} />
          <ClinicalNotes notes={notes} onChange={updateNotes} />
          <PatientHistory history={history} />
        </div>

        {/* Right Column: Clinical Actions and Swappable Panel */}
        <div className="space-y-5">
          <ClinicalActions
            activeAction={activeAction}
            onSelectAction={setActiveAction}
          />

          {activeAction === 'prescription' ? (
            <PrescriptionPanel
              prescription={prescription}
              onAddMedication={addMedication}
              onRemoveMedication={removeMedication}
              onClearAllMedications={clearMedications}
              onSendToPharmacy={sendToPharmacy}
              isSending={isSendingPharmacy}
            />
          ) : (
            <AdmissionReferralPanel
              initialTab="discharge"
              onAdmissionSubmit={submitAdmission}
              onDischargeSubmit={submitDischargeDisagree}
              onSwitchToPrescription={() => setActiveAction('prescription')}
              isSubmitting={isSubmittingEscalation}
            />
          )}
        </div>
      </div>

      {/* Sticky Bottom Action Footer */}
      <PatientActionFooter
        onSaveNotes={saveNotes}
        onEscalate={() => {
          setActiveAction('referral');
          escalateForAdmission('Escalated for inpatient admission');
        }}
        onComplete={completeAppointment}
        isSavingNotes={isSavingNotes}
      />
    </div>
  );
}
