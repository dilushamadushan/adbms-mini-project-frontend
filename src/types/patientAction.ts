import type { AppointmentStatus } from '@/types/doctor';

export interface PatientEmergencyContact {
  name: string;
  phone: string;
}

export interface PatientDetails {
  id: string;
  mrn: string;
  name: string;
  gender: 'Female' | 'Male' | 'Other';
  age: number;
  dob: string;
  phone: string;
  bloodGroup: string;
  allergies: string;
  emergencyContact: PatientEmergencyContact;
}

export interface AppointmentDetails {
  id: string;
  date: string;
  formattedDate: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
}

export interface PatientHistoryEntry {
  id: string;
  date: string;
  visitType: string;
  diagnosis: string;
  prescriptions: string;
}

export interface Medication {
  id: string;
  medicine: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
  timeSlots: string;
  instructions: string;
}

export interface PrescriptionDraft {
  status: 'Draft' | 'Sent';
  medications: Medication[];
  updatedAt?: string;
}

export interface ClinicalNote {
  noteText: string;
  updatedAt?: string;
}

export interface PatientActionData {
  patient: PatientDetails;
  appointment: AppointmentDetails;
  history: PatientHistoryEntry[];
  initialNotes?: string;
  initialMedications?: Medication[];
}

export type ClinicalActionType = 'prescription' | 'referral';
export type AdmissionTab = 'admission' | 'referral' | 'discharge';

export interface HospitalAdmissionData {
  urgency: 'Immediate (Stat)' | 'Urgent (Within 2h)' | 'Routine';
  department: string;
  bedType: string;
  admittingDiagnosis: string;
  precautions: string[];
  notes: string;
}

export interface UrgentReferralData {
  destination: string;
  specialty: string;
  urgency: 'Emergency Transfer' | 'Urgent Same-Day' | 'Within 24-48 Hours';
  transportMode: string;
  reasonForReferral: string;
  clinicalSummary: string;
}

export interface DischargeDisagreeData {
  dispositionType: 'DAMA (Patient Disagrees / Refuses Admission)' | 'Routine Home Discharge' | 'Outpatient Specialist Follow-up';
  disagreeReason: string;
  counselingProvided: boolean;
  risksExplained: boolean;
  followUpPlan: string;
  returnWarningSigns: string;
}

