'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePatientAction } from '@/hooks/usePatientAction';
import { PatientActionHeader } from './PatientActionHeader';
import { PatientInfoCard } from './PatientInfoCard';
import { AppointmentOverview } from './AppointmentOverview';
import { ClinicalActions } from './ClinicalActions';
import { PrescriptionPanel } from './prescription/PrescriptionPanel';
import { AdmissionReferralPanel } from './admission/AdmissionReferralPanel';
import { PatientActionFooter } from './PatientActionFooter';

interface PatientActionViewProps {
  appointmentId: string;
}

export function PatientActionView({ appointmentId }: PatientActionViewProps) {
  const { user } = useAuth();
  const {
    patient,
    appointment,
    isAdmitted,
    admission,
    notes,
    updateNotes,
    prescription,
    activeAction,
    setActiveAction,
    addMedication,
    removeMedication,
    clearMedications,
    sendToPharmacy,
    escalateForAdmission,
    submitAdmission,
    submitReferral,
    submitDischargeDisagree,
    submitDischarge,
    completeAppointment,
    loading,
    error,
    isSendingPharmacy,
    isSubmittingEscalation,
    isCompletingAppointment,
    actionNotice,
    actionNoticeTone,
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
        <div className={`rounded-lg px-4 py-2.5 text-xs font-medium text-white shadow-md transition-all ${
          actionNoticeTone === 'success' ? 'bg-emerald-600' : 'bg-[#0E4749]'
        }`}>
          {actionNotice}
        </div>
      )}

      {/* Patient Information Card */}
      <PatientInfoCard patient={patient} />

      {activeAction === 'prescription' ? (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <AppointmentOverview appointment={appointment} />
          <ClinicalActions
            activeAction={activeAction}
            onSelectAction={setActiveAction}
          />
          <div className="lg:col-span-2">
            <PrescriptionPanel
              prescription={prescription}
              onAddMedication={addMedication}
              onRemoveMedication={removeMedication}
              onClearAllMedications={clearMedications}
              onSendToPharmacy={sendToPharmacy}
              isSending={isSendingPharmacy}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(240px,0.75fr)_minmax(0,1.25fr)]">
          <AppointmentOverview appointment={appointment} />
          <div className="space-y-5">
            <ClinicalActions
              activeAction={activeAction}
              onSelectAction={setActiveAction}
            />
            <AdmissionReferralPanel
              initialTab={isAdmitted ? 'discharge' : 'admit'}
              isAdmitted={isAdmitted}
              patientId={Number(patient.id)}
              patientName={patient.name}
              patientGender={patient.gender}
              doctorName={appointment.doctorName}
              doctorId={appointment.doctorId}
              userId={Number(user?.user_id)}
              admissionReason={appointment.reason}
              admission={admission}
              notes={notes}
              onNotesChange={updateNotes}
              onAdmissionSubmit={submitAdmission}
              onDischargeSubmit={submitDischarge}
              onSwitchToPrescription={() => setActiveAction('prescription')}
              isSubmitting={isSubmittingEscalation}
            />
          </div>
        </div>
      )}

      {/* Sticky Bottom Action Footer */}
      <PatientActionFooter
        onEscalate={() => {
          setActiveAction('referral');
          escalateForAdmission('Escalated for inpatient admission');
        }}
        onComplete={completeAppointment}
        isCompleting={isCompletingAppointment}
        isCompleted={appointment.status === 'COMPLETED'}
      />
    </div>
  );
}
