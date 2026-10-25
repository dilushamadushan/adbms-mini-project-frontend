import type { Medication, PatientActionData, PatientHistoryEntry } from '@/types/patientAction';

export const MOCK_HISTORY: PatientHistoryEntry[] = [
  {
    id: 'hist-1',
    date: '12 Aug 2025',
    visitType: 'Follow-up',
    diagnosis: 'Common Cold',
    prescriptions: 'Amoxicillin 500 mg (3 days)',
  },
  {
    id: 'hist-2',
    date: '03 Mar 2025',
    visitType: 'Consultation',
    diagnosis: 'Allergic Rhinitis',
    prescriptions: 'Cetirizine 10 mg (7 days)',
  },
  {
    id: 'hist-3',
    date: '15 Nov 2024',
    visitType: 'Consultation',
    diagnosis: 'Fever',
    prescriptions: 'Paracetamol 500 mg (3 days)',
  },
];

export const MOCK_INITIAL_MEDICATIONS: Medication[] = [
  {
    id: 'med-1',
    medicineId: 0,
    medicine: 'Paracetamol',
    genericName: 'Paracetamol',
    dose: '500 mg',
    frequency: 'Every 6 hours',
    duration: '3 days',
    instructions: 'Take with food',
  },
  {
    id: 'med-2',
    medicineId: 0,
    medicine: 'Amoxicillin',
    genericName: 'Amoxicillin',
    dose: '500 mg',
    frequency: 'Every 8 hours',
    duration: '5 days',
    instructions: 'Complete the course',
  },
];

export const MOCK_PATIENT_ACTION_DATA: PatientActionData = {
  patient: {
    id: '10284',
    name: 'Jane Doe',
    gender: 'Female',
    age: 31,
    dob: '14 Mar 1995',
    phone: '+94 77 123 4567',
    bloodGroup: 'O+',
    allergies: 'Penicillin',
  },
  appointment: {
    id: 'apt-10284',
    date: '2026-10-26',
    formattedDate: 'Tue, 26 Oct 2026',
    time: '09:00 AM',
    reason: 'Fever and sore throat',
    doctorId: 0,
    doctorName: 'Care provider',
    status: 'SCHEDULED',
  },
  isAdmitted: false,
  admission: null,
  history: MOCK_HISTORY,
  initialNotes: '',
  initialMedications: MOCK_INITIAL_MEDICATIONS,
};

/**
 * Pure helper function to generate readable prescription notes from medication list
 */
export function generatePrescriptionNotes(medications: Medication[]): string[] {
  return medications.map((med) => {
    const freq = med.frequency ? med.frequency.toLowerCase() : 'as directed';
    const dur = med.duration ? med.duration.toLowerCase() : '';

    const parts = [freq];
    if (dur) parts.push(`for ${dur}`);
    const firstPart = parts.join(', ');

    return `${med.medicine} ${med.dose} — ${firstPart}.`;
  });
}
