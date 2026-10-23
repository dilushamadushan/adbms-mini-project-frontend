'use client';

import { useCallback, useEffect, useState } from 'react';
import { patientActionService } from '@/services/patientActionService';
import type {
  AdmissionTab,
  AdmissionRequestData,
  AdmissionDetails,
  AppointmentDetails,
  ClinicalActionType,
  DischargeDisagreeData,
  Medication,
  PatientDetails,
  PatientHistoryEntry,
  PrescriptionDraft,
  UrgentReferralData,
} from '@/types/patientAction';

export function usePatientAction(appointmentId: string) {
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [isAdmitted, setIsAdmitted] = useState(false);
  const [admission, setAdmission] = useState<AdmissionDetails | null>(null);
  const [history, setHistory] = useState<PatientHistoryEntry[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [prescription, setPrescription] = useState<PrescriptionDraft>({
    status: 'Draft',
    medications: [],
  });

  // Clinical Actions & Sub-Tabs state
  const [activeAction, setActiveAction] = useState<ClinicalActionType>('prescription');
  const [activeAdmissionTab, setActiveAdmissionTab] = useState<AdmissionTab>('admission');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSavingNotes, setIsSavingNotes] = useState<boolean>(false);
  const [isSendingPharmacy, setIsSendingPharmacy] = useState<boolean>(false);
  const [isSubmittingEscalation, setIsSubmittingEscalation] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [actionNoticeTone, setActionNoticeTone] = useState<'default' | 'success'>('default');

  // Load initial data
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    patientActionService
      .getPatientActionData(appointmentId)
      .then((data) => {
        if (!active) return;
        setPatient(data.patient);
        setAppointment(data.appointment);
        setIsAdmitted(data.isAdmitted);
        setAdmission(data.admission);
        setHistory(data.history || []);
        setNotes(data.initialNotes || '');
        setPrescription({
          status: 'Draft',
          medications: data.initialMedications || [],
        });
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load patient action data');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [appointmentId]);

  // Notice dismiss timer
  useEffect(() => {
    if (!actionNotice) return;
    const timer = setTimeout(() => setActionNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [actionNotice]);

  // Notes handler
  const updateNotes = useCallback((newText: string) => {
    if (newText.length <= 1000) {
      setNotes(newText);
    }
  }, []);

  // Medication handlers
  const addMedication = useCallback((med: Omit<Medication, 'id'>) => {
    const newMed: Medication = {
      ...med,
      id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setPrescription((prev) => ({
      ...prev,
      status: 'Draft',
      medications: [...prev.medications, newMed],
    }));
  }, []);

  const removeMedication = useCallback((medicationId: string) => {
    setPrescription((prev) => ({
      ...prev,
      medications: prev.medications.filter((m) => m.id !== medicationId),
    }));
  }, []);

  const clearMedications = useCallback(() => {
    setPrescription((prev) => ({
      ...prev,
      medications: [],
    }));
  }, []);

  // Action handlers
  const saveNotes = useCallback(async () => {
    if (!appointmentId) return;
    setIsSavingNotes(true);
    try {
      const res = await patientActionService.saveNotes(appointmentId, notes);
      setActionNotice(res.message);
    } catch {
      setActionNotice('Failed to save notes');
    } finally {
      setIsSavingNotes(false);
    }
  }, [appointmentId, notes]);

  const sendToPharmacy = useCallback(async () => {
    if (!appointmentId || prescription.medications.length === 0) return;
    setIsSendingPharmacy(true);
    try {
      const res = await patientActionService.sendToPharmacy(appointmentId, prescription.medications);
      setPrescription((prev) => ({ ...prev, status: 'Sent' }));
      setActionNotice(res.message);
    } catch {
      setActionNotice('Failed to send prescription');
    } finally {
      setIsSendingPharmacy(false);
    }
  }, [appointmentId, prescription.medications]);

  const escalateForAdmission = useCallback(async (reason?: string) => {
    if (!appointmentId) return;
    try {
      const res = await patientActionService.escalateForAdmission(appointmentId, reason);
      setActiveAction('referral');
      setActionNotice(res.message);
    } catch {
      setActionNotice('Failed to escalate admission');
    }
  }, [appointmentId]);

  const submitAdmission = useCallback(async (data: AdmissionRequestData) => {
    if (!appointmentId) return;
    setIsSubmittingEscalation(true);
    try {
      const res = await patientActionService.createAdmissionRequest(data);
      setIsAdmitted(true);
      const admissionStatus = await patientActionService.getAdmissionStatus(data.patient_id);
      setAdmission(admissionStatus.admission);
      setActionNoticeTone('success');
      setActionNotice('Admission request saved');
      return res;
    } catch (error) {
      throw error;
    } finally {
      setIsSubmittingEscalation(false);
    }
  }, [appointmentId]);

  const submitReferral = useCallback(async (data: UrgentReferralData) => {
    if (!appointmentId) return;
    setIsSubmittingEscalation(true);
    try {
      const res = await patientActionService.submitReferral(appointmentId, data);
      setActionNoticeTone('default');
      setActionNotice(res.message);
    } catch {
      setActionNotice('Failed to dispatch referral');
    } finally {
      setIsSubmittingEscalation(false);
    }
  }, [appointmentId]);

  const submitDischargeDisagree = useCallback(async (data: DischargeDisagreeData) => {
    if (!appointmentId) return;
    setIsSubmittingEscalation(true);
    try {
      const res = await patientActionService.submitDischargeDisagree(appointmentId, data);
      setActionNoticeTone('default');
      setActionNotice(res.message);
    } catch {
      setActionNotice('Failed to document discharge/refusal');
    } finally {
      setIsSubmittingEscalation(false);
    }
  }, [appointmentId]);

  const completeAppointment = useCallback(async () => {
    if (!appointmentId) return;
    try {
      const res = await patientActionService.completeAppointment(appointmentId);
      setAppointment((prev) => (prev ? { ...prev, status: 'COMPLETED' } : null));
      setActionNotice(res.message);
    } catch {
      setActionNotice('Failed to complete appointment');
    }
  }, [appointmentId]);

  return {
    patient,
    appointment,
    isAdmitted,
    admission,
    history,
    notes,
    updateNotes,
    prescription,
    activeAction,
    setActiveAction,
    activeAdmissionTab,
    setActiveAdmissionTab,
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
    actionNoticeTone,
  };
}
