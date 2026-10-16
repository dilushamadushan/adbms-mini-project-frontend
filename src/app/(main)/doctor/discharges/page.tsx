"use client";

import { useEffect, useState } from 'react';
import { receptionistService, type AdmissionRecord } from '@/services/receptionistService';

export default function DoctorDischargeAuthorizations() {
  const [admissions, setAdmissions] = useState<AdmissionRecord[]>([]);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);

  function refresh() {
    return receptionistService.getAdmissions(true).then(setAdmissions);
  }

  useEffect(() => {
    refresh().catch(() => setError('Admissions could not be loaded.'));
  }, []);

  async function authorize(admissionId: number) {
    setSavingId(admissionId);
    setError('');
    setSuccess('');
    try {
      await receptionistService.authorizeDischarge(admissionId, notes[admissionId] || '');
      setSuccess('Discharge authorization recorded. Reception can now calculate the bill and complete discharge after payment.');
      await refresh();
    } catch {
      setError('Could not authorize discharge. Enter discharge notes and confirm the patient remains admitted.');
    } finally {
      setSavingId(null);
    }
  }

  const awaitingAuthorization = admissions.filter((admission) => admission.status === 'Admitted');
  return (
    <div className="space-y-6">
      <header><p className="text-sm font-semibold uppercase tracking-wide text-[#5B6472]">Doctor workflow</p><h2 className="mt-1 text-2xl font-bold text-[#0E4749]">Discharge Authorizations</h2><p className="mt-2 text-sm text-[#5B6472]">Authorize a patient for discharge. Reception will calculate the bill and complete discharge after payment.</p></header>
      {error && <p role="alert" className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
      {success && <p role="status" className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">{success}</p>}
      {awaitingAuthorization.length ? awaitingAuthorization.map((admission) => (
        <article key={admission.admission_id} className="space-y-4 rounded-xl border border-[#DCE3E0] bg-white p-5">
          <div><h3 className="font-bold text-gray-900">{admission.patient_name}</h3><p className="mt-1 text-sm text-[#5B6472]">{admission.ward_name}, {admission.bed_number ? `bed ${admission.bed_number}` : 'bed pending nurse assignment'} · admitted {new Date(admission.admitted_at).toLocaleString()}</p><p className="mt-2 text-sm">{admission.admission_reason}</p></div>
          <label className="block text-sm font-semibold text-gray-800">Discharge notes
            <textarea required minLength={1} maxLength={4000} rows={3} value={notes[admission.admission_id] || ''} onChange={(event) => setNotes((current) => ({ ...current, [admission.admission_id]: event.target.value }))} className="mt-2 w-full rounded-lg border border-[#DCE3E0] p-3 font-normal" />
          </label>
          <button type="button" disabled={savingId === admission.admission_id || !notes[admission.admission_id]?.trim()} onClick={() => void authorize(admission.admission_id)} className="rounded-lg bg-[#0E4749] px-5 py-2.5 font-bold text-white disabled:opacity-50">{savingId === admission.admission_id ? 'Authorizing…' : 'Authorize discharge'}</button>
        </article>
      )) : <p className="rounded-xl border border-dashed border-[#DCE3E0] bg-white p-7 text-sm text-[#5B6472]">No admissions are awaiting discharge authorization.</p>}
    </div>
  );
}
