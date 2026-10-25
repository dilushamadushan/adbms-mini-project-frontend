"use client";

import { useEffect, useState } from 'react';
import { ArrowLeft, Hospital } from 'lucide-react';
import { isAxiosError } from 'axios';
import { receptionistService, type AdmissionRecord } from '@/services/receptionistService';

/*
function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getAdmissionDate(admittedAt: string): string {
  const date = new Date(admittedAt);
  return toDateInputValue(date);
}
*/

export default function ReceptionistAdmissions() {
  const [admissions, setAdmissions] = useState<AdmissionRecord[]>([]);
  const [dischargedPatients, setDischargedPatients] = useState<AdmissionRecord[]>([]);
  const [selectedAdmission, setSelectedAdmission] = useState<AdmissionRecord | null>(null);
  const [dischargeDateFilter, setDischargeDateFilter] = useState<'week' | 'month' | 'date' | 'all'>('month');
  const [selectedDischargeDate, setSelectedDischargeDate] = useState('');
  /*
  const [dischargeDate, setDischargeDate] = useState(toDateInputValue(new Date()));
  */
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDischarging, setIsDischarging] = useState(false);
  const filteredDischargedPatients = dischargedPatients.filter((admission) => {
    if (!admission.discharged_at) return false;
    const dischargeDate = admission.discharged_at.slice(0, 10);
    if (dischargeDateFilter === 'all') return true;
    if (dischargeDateFilter === 'date') return Boolean(selectedDischargeDate) && dischargeDate === selectedDischargeDate;

    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (dischargeDateFilter === 'week') {
      const daysSinceMonday = (startDate.getDay() + 6) % 7;
      startDate.setDate(startDate.getDate() - daysSinceMonday);
    } else {
      startDate.setDate(1);
    }
    const dateKey = (date: Date) => [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
    return dischargeDate >= dateKey(startDate) && dischargeDate <= dateKey(today);
  });

  useEffect(() => {
    Promise.all([
      receptionistService.getAdmissions(true),
      receptionistService.getAdmissions(false),
    ])
      .then(([activeRecords, allRecords]) => {
        setAdmissions(activeRecords.filter((admission) => admission.status === 'Discharge Authorized'));
        setDischargedPatients(allRecords.filter(
          (admission) => admission.status === 'Discharged' && admission.discharged_at,
        ));
      })
      .catch(() => setError('Admissions authorized for discharge could not be loaded.'))
      .finally(() => setIsLoading(false));
  }, []);

  function selectAdmission(admission: AdmissionRecord) {
    setSelectedAdmission(admission);
    setError('');
    setSuccess('');
    /*
    const today = toDateInputValue(new Date());
    const admittedDate = getAdmissionDate(admission.admitted_at);
    setDischargeDate(today < admittedDate ? admittedDate : today);
    */
  }

  async function dischargeSelectedPatient() {
    if (!selectedAdmission || isDischarging) return;

    setIsDischarging(true);
    setError('');
    setSuccess('');
    try {
      const result = await receptionistService.dischargeAuthorizedPatient(selectedAdmission.admission_id);
      setSuccess(`${result.admission.patient_name} discharged successfully.`);
      if (result.admission.discharged_at) {
        setDischargedPatients((current) => [
          result.admission,
          ...current.filter((admission) => admission.admission_id !== result.admission.admission_id),
        ]);
      }
      setAdmissions((current) => current.filter(
        (admission) => admission.admission_id !== selectedAdmission.admission_id,
      ));
      setSelectedAdmission(null);
    } catch (caught: unknown) {
      if (isAxiosError(caught)) {
        const detail: unknown = caught.response?.data?.detail;
        setError(
          typeof detail === 'string'
            ? detail
            : caught.response?.status
              ? `Discharge failed with HTTP ${caught.response.status}.`
              : 'The server could not be reached. Check your connection and try again.',
        );
      } else {
        setError('An unexpected error prevented the patient from being discharged.');
      }
    } finally {
      setIsDischarging(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#5B6472]">Admissions</p>
        <h2 className="mt-1 text-2xl font-bold text-[#0E4749]">Discharge</h2>
        <p className="mt-2 text-sm text-[#5B6472]">Select a patient authorized for discharge, review their details, then discharge them.</p>
      </header>

      {error && <p role="alert" className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
      {success && <p role="status" className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">{success}</p>}

      {isLoading ? (
        <p className="rounded-xl border border-[#DCE3E0] bg-white p-6 text-sm text-[#5B6472]">Loading discharge authorizations…</p>
      ) : selectedAdmission ? (
        <section className="max-w-3xl space-y-5 rounded-2xl border border-[#DCE3E0] bg-white p-6 shadow-sm md:p-8">
          <button
            type="button"
            onClick={() => setSelectedAdmission(null)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0E4749] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to authorized patients
          </button>

          <div className="border-b border-[#E8EDEA] pb-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#5B6472]">Discharge patient</p>
            <h3 className="mt-1 text-xl font-bold text-[#0E4749]">{selectedAdmission.patient_name}</h3>
          </div>

          <section aria-label="Admission details" className="space-y-4 rounded-xl bg-[#F6F8F7] p-5">
            <p className="text-sm"><span className="block text-xs text-[#5B6472]">Ward</span><strong className="mt-1 block">{selectedAdmission.ward_name}</strong></p>
            <p className="text-sm"><span className="block text-xs text-[#5B6472]">Bed</span><strong className="mt-1 block">{selectedAdmission.bed_number || 'Not assigned'}</strong></p>
            <p className="text-sm"><span className="block text-xs text-[#5B6472]">Gender</span><strong className="mt-1 block">{selectedAdmission.gender || 'Not recorded'}</strong></p>
            <p className="text-sm"><span className="block text-xs text-[#5B6472]">Admitting doctor</span><strong className="mt-1 block">{selectedAdmission.admitted_doctor_name}</strong></p>
            <p className="text-sm"><span className="block text-xs text-[#5B6472]">Admission date</span><strong className="mt-1 block">{new Date(selectedAdmission.admitted_at).toLocaleDateString()}</strong></p>
            <p className="text-sm"><span className="block text-xs text-[#5B6472]">Guardian</span><strong className="mt-1 block">{selectedAdmission.guardian_name} ({selectedAdmission.guardian_relationship})</strong></p>
            <p className="text-sm"><span className="block text-xs text-[#5B6472]">Admission reason</span><strong className="mt-1 block">{selectedAdmission.admission_reason}</strong></p>
            <p className="text-sm"><span className="block text-xs text-[#5B6472]">Doctor&apos;s discharge notes</span><strong className="mt-1 block">{selectedAdmission.discharge_notes || 'No notes provided'}</strong></p>
          </section>

          {/*
          Billing flow disabled for now. Keep the code for later use.
          <label htmlFor="discharge-date" className="block text-sm font-semibold">
            Discharge date
            <input
              id="discharge-date"
              required
              type="date"
              min={getAdmissionDate(selectedAdmission.admitted_at)}
              value={dischargeDate}
              onChange={(event) => setDischargeDate(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#DCE3E0] bg-white p-3 font-normal focus:border-[#0E4749] focus:outline-none focus:ring-2 focus:ring-teal-900/10"
            />
          </label>
          <Link
            href={`/templates/bill?patient_id=${selectedAdmission.patient_id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-[#E07856] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#c96749]"
          >
            Prepare bill
          </Link>
          */}

          <button
            type="button"
            onClick={dischargeSelectedPatient}
            disabled={isDischarging}
            className="w-full rounded-lg bg-[#0E4749] p-3.5 font-bold text-white transition-colors hover:bg-[#0a383a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDischarging ? 'Discharging patient…' : 'Discharge'}
          </button>
        </section>
      ) : admissions.length ? (
        <section className="space-y-3">
          <h3 className="font-bold text-[#0E4749]">Authorized for discharge</h3>
          {admissions.map((admission) => (
            <button
              key={admission.admission_id}
              type="button"
              onClick={() => selectAdmission(admission)}
              className="flex w-full items-start gap-4 rounded-xl border border-[#DCE3E0] bg-white p-5 text-left shadow-sm transition-colors hover:border-[#0E4749] hover:bg-teal-50/30"
            >
              <span className="rounded-lg bg-teal-50 p-3 text-[#0E4749]"><Hospital className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-gray-900">{admission.patient_name}</span>
                <span className="mt-1 block text-sm text-[#5B6472]">
                  {admission.ward_name} · {admission.bed_number ? `Bed ${admission.bed_number}` : 'Bed not assigned'} · Admitted {new Date(admission.admitted_at).toLocaleDateString()}
                </span>
                <span className="mt-1 block text-xs text-[#5B6472]">
                  Authorized {admission.discharge_authorized_at ? new Date(admission.discharge_authorized_at).toLocaleString() : '—'}
                </span>
              </span>
              <span className="self-center rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">Select</span>
            </button>
          ))}
        </section>
      ) : (
        <section className="rounded-xl border border-dashed border-[#DCE3E0] bg-white p-8 text-center text-sm text-[#5B6472]">
          No patients are currently authorized for discharge.
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-[#DCE3E0] bg-white shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#DCE3E0] p-5">
          <div>
            <h3 className="font-bold text-[#0E4749]">Discharged patients</h3>
            <p className="mt-1 text-sm text-[#5B6472]">Filter patients by their discharge date.</p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm font-semibold">
              Date range
              <select
                value={dischargeDateFilter}
                onChange={(event) => setDischargeDateFilter(event.target.value as 'week' | 'month' | 'date' | 'all')}
                className="mt-1.5 w-full rounded-lg border border-[#DCE3E0] bg-white p-3 font-normal focus:border-[#0E4749] focus:outline-none focus:ring-2 focus:ring-teal-900/10"
              >
                <option value="week">This week</option>
                <option value="month">This month</option>
                <option value="date">Specific date</option>
                <option value="all">All dates</option>
              </select>
            </label>
            {dischargeDateFilter === 'date' && (
              <label className="text-sm font-semibold">
                Discharge date
                <input
                  type="date"
                  value={selectedDischargeDate}
                  onChange={(event) => setSelectedDischargeDate(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#DCE3E0] bg-white p-3 font-normal focus:border-[#0E4749] focus:outline-none focus:ring-2 focus:ring-teal-900/10"
                />
              </label>
            )}
          </div>
        </div>
        {filteredDischargedPatients.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-[#5B6472]">
                <tr>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Ward</th>
                  <th className="p-4">Discharged at</th>
                  <th className="p-4">Discharge notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE3E0]">
                {filteredDischargedPatients.map((admission) => (
                  <tr key={admission.admission_id}>
                    <td className="p-4 font-semibold text-gray-900">{admission.patient_name}</td>
                    <td className="p-4">{admission.ward_name}</td>
                    <td className="p-4">{admission.discharged_at ? new Date(admission.discharged_at).toLocaleString() : '—'}</td>
                    <td className="max-w-sm p-4">{admission.discharge_notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-6 text-center text-sm text-[#5B6472]">
            {dischargeDateFilter === 'date' && !selectedDischargeDate
              ? 'Choose a date to view discharged patients.'
              : 'No discharged patients found for this date range.'}
          </p>
        )}
      </section>
    </div>
  );
}
