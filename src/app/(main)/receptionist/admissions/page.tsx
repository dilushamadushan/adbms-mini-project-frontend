"use client";

import { useEffect, useState } from 'react';
import { ArrowLeft, Hospital } from 'lucide-react';
import { receptionistService, type AdmissionRecord } from '@/services/receptionistService';

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

function getStayDays(admittedAt: string, dischargeDate: string): number {
  const admittedDate = new Date(`${getAdmissionDate(admittedAt)}T00:00:00`);
  const selectedDate = new Date(`${dischargeDate}T00:00:00`);
  const difference = selectedDate.getTime() - admittedDate.getTime();
  return Math.max(1, Math.floor(difference / 86_400_000) + 1);
}

export default function ReceptionistAdmissions() {
  const [admissions, setAdmissions] = useState<AdmissionRecord[]>([]);
  const [selectedAdmission, setSelectedAdmission] = useState<AdmissionRecord | null>(null);
  const [dischargeDate, setDischargeDate] = useState(toDateInputValue(new Date()));
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    receptionistService.getAdmissions(true)
      .then((records) => {
        setAdmissions(records.filter((admission) => admission.status === 'Discharge Authorized'));
      })
      .catch(() => setError('Admissions authorized for discharge could not be loaded.'))
      .finally(() => setIsLoading(false));
  }, []);

  function selectAdmission(admission: AdmissionRecord) {
    setSelectedAdmission(admission);
    const today = toDateInputValue(new Date());
    const admittedDate = getAdmissionDate(admission.admitted_at);
    setDischargeDate(today < admittedDate ? admittedDate : today);
    setError('');
  }

  const stayDays = selectedAdmission
    ? getStayDays(selectedAdmission.admitted_at, dischargeDate)
    : 0;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#5B6472]">Admissions</p>
        <h2 className="mt-1 text-2xl font-bold text-[#0E4749]">Discharge and Billing</h2>
        <p className="mt-2 text-sm text-[#5B6472]">Select a patient authorized for discharge to review their admission and prepare discharge details.</p>
      </header>

      {error && <p role="alert" className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}

      {isLoading ? (
        <p className="rounded-xl border border-[#DCE3E0] bg-white p-6 text-sm text-[#5B6472]">Loading discharge authorizations…</p>
      ) : selectedAdmission ? (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(280px,2fr)]">
          <section className="min-w-0 space-y-5 rounded-2xl border border-[#DCE3E0] bg-white p-6 shadow-sm md:p-8">
            <button
              type="button"
              onClick={() => setSelectedAdmission(null)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0E4749] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to authorized patients
            </button>

            <div className="border-b border-[#E8EDEA] pb-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#5B6472]">Discharge form</p>
              <h3 className="mt-1 text-xl font-bold text-[#0E4749]">{selectedAdmission.patient_name}</h3>
              <p className="mt-1 text-sm text-[#5B6472]">Review the admission details and select the discharge date.</p>
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
          </section>

          <aside className="min-w-0 space-y-5 rounded-2xl border border-[#DCE3E0] bg-white p-6 shadow-sm md:p-8">
            <div className="border-b border-[#E8EDEA] pb-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#5B6472]">Bill</p>
              <h3 className="mt-1 text-xl font-bold text-[#0E4749]">Discharge bill</h3>
              <p className="mt-1 text-sm text-[#5B6472]">Charges will be calculated using the configured ward rate and selected services.</p>
            </div>

            <div className="space-y-4 rounded-xl bg-[#F6F8F7] p-5">
              <p className="text-sm"><span className="block text-xs text-[#5B6472]">Patient</span><strong className="mt-1 block">{selectedAdmission.patient_name}</strong></p>
              <p className="text-sm"><span className="block text-xs text-[#5B6472]">Ward</span><strong className="mt-1 block">{selectedAdmission.ward_name}</strong></p>
              <p className="text-sm"><span className="block text-xs text-[#5B6472]">Length of stay</span><strong className="mt-1 block text-lg text-[#0E4749]">{stayDays} {stayDays === 1 ? 'day' : 'days'}</strong></p>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Bill items, total, payment, printing, and discharge completion will be enabled after ward rates and service prices are configured.
            </div>
          </aside>
        </div>
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
    </div>
  );
}
