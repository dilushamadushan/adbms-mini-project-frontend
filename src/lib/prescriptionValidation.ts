import type { Medication, PrescriptionDraft } from '@/types/patientAction';

export function validatePrescription(prescription: PrescriptionDraft): string | null {
  if (!prescription.diagnosis.trim()) {
    return 'Diagnosis is required.';
  }
  if (!prescription.clinicalNotes.trim()) {
    return 'Clinical notes are required.';
  }
  if (prescription.medications.length === 0) {
    return 'Add at least one medicine.';
  }
  if (prescription.medications.some((medicine) => !medicine.clinicalNote?.trim())) {
    return 'Each medicine must have a clinical note.';
  }
  return null;
}

export function toPrescriptionMedicine(medicine: Medication) {
  return {
    medicine_id: medicine.medicineId,
    dose: medicine.dose,
    frequency: medicine.frequency,
    duration: medicine.duration,
  };
}
