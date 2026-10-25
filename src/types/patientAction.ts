import type { AppointmentStatus } from '@/types/doctor';

export interface PatientDetails {
  id: string;
  name: string;
  gender: 'Female' | 'Male' | 'Other';
  age: number;
  dob: string;
  phone: string;
  bloodGroup: string;
  allergies: string;
}

export interface AppointmentDetails {
  id: string;
  date: string;
  formattedDate: string;
  time: string;
  reason: string;
  doctorId: number;
  doctorName: string;
  status: AppointmentStatus;
}

export interface AdmissionRequestData {
  patient_id: number;
  gender: string;
  ward_id: number;
  reason: string;
  doctor_id: number;
  user_id: number;
}

export interface DischargeRequestData {
  admission_id: number;
  doctor_id: number;
  notes: string;
}

export interface WardOption {
  ward_id: number;
  ward_name: string;
}

export interface AdmissionDetails {
  admission_id: number;
  patient_id: number;
  ward_id: number | null;
  bed_id: number | null;
  admitted_doctor_id: number | null;
  admitted_by: number | null;
  admitted_at: string | null;
  admission_reason: string | null;
  guardian_name: string | null;
  guardian_relationship: string | null;
  guardian_contact: string | null;
  gender: string | null;
  status: string | null;
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
  medicineId: number;
  medicine: string;
  genericName: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string;
  clinicalNote?: string;
}

export interface PrescriptionDraft {
  status: 'Draft' | 'Sent';
  medications: Medication[];
  diagnosis: string;
  clinicalNotes: string;
  updatedAt?: string;
}

export interface ClinicalNote {
  noteText: string;
  updatedAt?: string;
}

export interface PatientActionData {
  patient: PatientDetails;
  appointment: AppointmentDetails;
  isAdmitted: boolean;
  admission: AdmissionDetails | null;
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
