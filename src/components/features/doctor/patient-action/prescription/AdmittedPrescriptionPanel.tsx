'use client';

import React, { useEffect, useState } from 'react';
import { Clock3, Pill, Plus, Save, Trash2 } from 'lucide-react';
import { doctorService, type DoctorMedicine } from '@/services/doctorService';
import type { AdmittedPrescriptionPayload } from '@/services/patientActionService';
import type { AdmissionDetails } from '@/types/patientAction';

interface AdmittedPrescriptionPanelProps {
  admission: AdmissionDetails | null;
  patientId: number;
  appointmentId: number;
  doctorId: number;
  onSave: (payload: AdmittedPrescriptionPayload) => Promise<unknown>;
}

interface AdmissionMedicine {
  id: string;
  medicineId: number;
  medicineName: string;
  genericName: string;
  dose: string;
  frequency: string;
  duration: string;
  firstDoseTime: string;
  clinicalNote: string;
  status: 'Not Given';
}

const ORDER_TYPES = [
  'Medication',
  'Diet',
  'IV_Fluids',
  'Nursing_Care',
  'Lab',
  'Special',
];

const DOSE_OPTIONS = ['250 mg', '500 mg', '1 g', '2 tablets'];
const FREQUENCY_OPTIONS = ['Once daily', 'Twice daily', 'Three times daily', 'Every 8 hours'];
const DURATION_OPTIONS = ['1 day', '3 days', '5 days', '7 days', 'Until discharge'];
const FIRST_DOSE_OPTIONS = ['08:00', '12:00', '16:00', '20:00', '00:00'];

export function AdmittedPrescriptionPanel({
  admission,
  patientId,
  appointmentId,
  doctorId,
  onSave,
}: AdmittedPrescriptionPanelProps) {
  const [medicines, setMedicines] = useState<DoctorMedicine[]>([]);
  const [medicineError, setMedicineError] = useState('');
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [genericName, setGenericName] = useState('');
  const [dose, setDose] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [clinicalNote, setClinicalNote] = useState('');
  const [firstDoseTime, setFirstDoseTime] = useState('08:00');
  const [admissionMedicines, setAdmissionMedicines] = useState<AdmissionMedicine[]>([]);
  const [orderType, setOrderType] = useState('Medication');
  const [instruction, setInstruction] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    doctorService
      .getMedicines()
      .then(setMedicines)
      .catch(() => setMedicineError('Medicines could not be loaded.'));
  }, []);

  const selectedMedicine = medicines.find(
    (medicine) => String(medicine.medicine_id) === selectedMedicineId
  );

  const handleMedicineChange = (medicineId: string) => {
    const selected = medicines.find((medicine) => String(medicine.medicine_id) === medicineId);
    setSelectedMedicineId(medicineId);
    setGenericName(selected?.generic_name ?? '');
  };

  const addMedicine = () => {
    if (!selectedMedicine) return;

    setAdmissionMedicines((current) => [
      ...current,
      {
        id: `admission-med-${Date.now()}`,
        medicineId: selectedMedicine.medicine_id,
        medicineName: selectedMedicine.med_name,
        genericName,
        dose: dose || '500 mg',
        frequency: frequency || 'Once daily',
        duration: duration || '1 day',
        firstDoseTime,
        clinicalNote: clinicalNote.trim(),
        status: 'Not Given',
      },
    ]);
    setSelectedMedicineId('');
    setGenericName('');
    setDose('');
    setFrequency('');
    setDuration('');
    setClinicalNote('');
    setFirstDoseTime('08:00');
  };

  const clearMedicineForm = () => {
    setSelectedMedicineId('');
    setGenericName('');
    setDose('');
    setFrequency('');
    setDuration('');
    setClinicalNote('');
    setFirstDoseTime('08:00');
  };

  const saveForAdmission = async () => {
    if (!diagnosis.trim() || !clinicalNotes.trim() || admissionMedicines.length === 0) return;
    setIsSaving(true);
    try {
      await onSave({
        patient_id: patientId,
        apt_id: appointmentId,
        doctor_id: doctorId,
        diagnosis: diagnosis.trim(),
        clinical_notes: clinicalNotes.trim(),
        medicines: admissionMedicines.map((medicine) => ({
          medicine_id: medicine.medicineId,
          dose: medicine.dose,
          frequency: medicine.frequency,
          duration: medicine.duration,
          first_dose: medicine.firstDoseTime,
          notes: medicine.clinicalNote,
        })),
        nurse_orders: instruction.trim()
          ? [{ order_type: orderType, instruction: instruction.trim() }]
          : [],
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Pill className="h-5 w-5 text-emerald-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">Prescription</h3>
            <p className="text-xs text-slate-500">Inpatient medication and nurse orders</p>
          </div>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-right">
          <p className="text-xs font-bold text-emerald-700">Admitted</p>
          <p className="text-[11px] text-emerald-600">
            Ward {admission?.ward_id ?? '—'} · Admission #{admission?.admission_id ?? '—'}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <section className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
          <div className="mb-3 flex items-center gap-2 border-b border-blue-100 pb-2">
            <div className="h-2 w-2 rounded-full bg-blue-600" />
            <h4 className="text-xs font-bold uppercase tracking-wide text-blue-800">
              Add Medication
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-12">
            <select
              value={selectedMedicineId}
              onChange={(event) => handleMedicineChange(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none lg:col-span-3"
            >
              <option value="">
                {medicineError || (medicines.length ? 'Select medicine' : 'Loading medicines...')}
              </option>
              {medicines.map((medicine) => (
                <option key={medicine.medicine_id} value={medicine.medicine_id}>
                  {medicine.medicine_id} - {medicine.med_name}
                </option>
              ))}
            </select>
            <select
              value={genericName}
              disabled={!selectedMedicineId}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none disabled:bg-slate-50 lg:col-span-3"
            >
              <option value="">Generic name</option>
              {genericName && <option value={genericName}>{genericName}</option>}
            </select>
            <select
              value={dose}
              onChange={(event) => setDose(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none lg:col-span-2"
            >
              <option value="">Dose</option>
              {DOSE_OPTIONS.map((option) => <option key={option}>{option}</option>)}
            </select>
            <select
              value={frequency}
              onChange={(event) => setFrequency(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none lg:col-span-2"
            >
              <option value="">Frequency</option>
              {FREQUENCY_OPTIONS.map((option) => <option key={option}>{option}</option>)}
            </select>
            <select
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none lg:col-span-2"
            >
              <option value="">Duration</option>
              {DURATION_OPTIONS.map((option) => <option key={option}>{option}</option>)}
            </select>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 lg:col-span-2">
              <Clock3 className="h-3.5 w-3.5 text-blue-600" />
              <span>First dose</span>
              <select
                value={firstDoseTime}
                onChange={(event) => setFirstDoseTime(event.target.value)}
                className="ml-auto bg-transparent text-xs text-slate-700 focus:outline-none"
              >
                {FIRST_DOSE_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center lg:col-span-5">
              <textarea
                value={clinicalNote}
                onChange={(event) => setClinicalNote(event.target.value)}
                placeholder="Clinical notes"
                rows={1}
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
              />
            </label>
            <div className="flex gap-2 lg:col-span-2">
              <button
                type="button"
                onClick={clearMedicineForm}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={addMedicine}
                disabled={!selectedMedicine}
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input
              value={diagnosis}
              onChange={(event) => setDiagnosis(event.target.value)}
              placeholder="Diagnosis"
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
            />
            <textarea
              value={clinicalNotes}
              onChange={(event) => setClinicalNotes(event.target.value)}
              placeholder="Clinical notes"
              rows={2}
              className="resize-none rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-blue-100 pt-3">
            <h4 className="text-xs font-bold uppercase tracking-wide text-emerald-800">
              Current Prescription ({admissionMedicines.length})
            </h4>
            <span className="text-[11px] text-emerald-600">Added medicines</span>
          </div>
          <div className="mt-2 overflow-x-auto rounded-lg border border-emerald-100 bg-white">
            {admissionMedicines.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-slate-400">
                No inpatient medicines added yet.
              </p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Medicine</th>
                    <th className="px-3 py-2">Generic name</th>
                    <th className="px-3 py-2">Dose</th>
                    <th className="px-3 py-2">Frequency</th>
                    <th className="px-3 py-2">Duration</th>
                    <th className="px-3 py-2">First dose</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Clinical note</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {admissionMedicines.map((medicine) => (
                    <tr key={medicine.id}>
                      <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-slate-800">
                        {medicine.medicineId} - {medicine.medicineName}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">
                        {medicine.genericName || '—'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">{medicine.dose}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">{medicine.frequency}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">{medicine.duration}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">{medicine.firstDoseTime}</td>
                      <td className="px-3 py-2.5">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                          {medicine.status}
                        </span>
                      </td>
                      <td className="min-w-48 px-3 py-2.5 text-slate-600">
                        {medicine.clinicalNote || '—'}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => setAdmissionMedicines((current) => current.filter((item) => item.id !== medicine.id))}
                          className="p-1 text-red-500 hover:text-red-700"
                          title="Remove medicine"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
          <div className="mb-3 flex items-center gap-2 border-b border-emerald-100 pb-2">
            <div className="h-2 w-2 rounded-full bg-emerald-600" />
            <h4 className="text-xs font-bold uppercase tracking-wide text-emerald-800">
              Nurse Instructions
            </h4>
            <span className="text-[11px] text-emerald-600">Optional</span>
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[180px_1fr_auto]">
            <select
              value={orderType}
              onChange={(event) => setOrderType(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
            >
              {ORDER_TYPES.map((type) => <option key={type}>{type}</option>)}
            </select>
            <input
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
              placeholder="What should the nurse do?"
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none sm:col-span-2"
            />
          </div>
          <p className="mt-2 text-[11px] text-blue-600">
            This instruction will be saved together with the medicines when you press Save for admission.
          </p>
        </section>

        <div className="flex justify-end border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={saveForAdmission}
            disabled={isSaving || !diagnosis.trim() || !clinicalNotes.trim() || admissionMedicines.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? 'Saving…' : 'Save for admission'}
          </button>
        </div>
      </div>
    </section>
  );
}
