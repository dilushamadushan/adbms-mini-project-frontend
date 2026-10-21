"use client";

import { useEffect, useState } from 'react';
import {
  receptionistService,
  type AdmissionRecord,
  type AvailableBed,
} from '@/services/receptionistService';

export default function NurseAdmissionAssignments() {
  const [admissions, setAdmissions] = useState<AdmissionRecord[]>([]);
  const [beds, setBeds] = useState<AvailableBed[]>([]);
  const [selectedBeds, setSelectedBeds] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function refresh() {
    const [rows, availableBeds] = await Promise.all([
      receptionistService.getAdmissions(true),
      receptionistService.getAvailableBeds(),
    ]);
    setAdmissions(rows.filter((admission) => admission.status === 'Pending' && admission.bed_id === null));
    setBeds(availableBeds);
  }

  useEffect(() => {
    Promise.all([
      receptionistService.getAdmissions(true),
      receptionistService.getAvailableBeds(),
    ])
      .then(([rows, availableBeds]) => {
        setAdmissions(rows.filter((admission) => admission.status === 'Pending' && admission.bed_id === null));
        setBeds(availableBeds);
      })
      .catch(() => setError('Pending admissions and available beds could not be loaded.'))
      .finally(() => setLoading(false));
  }, []);

  async function assignBed(admissionId: number) {
    const bedId = Number(selectedBeds[admissionId]);
    if (!bedId) return;
    setSavingId(admissionId);
    setError('');
    setSuccess('');
    try {
      const admission = await receptionistService.assignAdmissionBed(admissionId, bedId);
      setSuccess(`Bed ${admission.bed_number} assigned to ${admission.patient_name}.`);
      setSelectedBeds((current) => {
        const next = { ...current };
        delete next[admissionId];
        return next;
      });
      await refresh();
    } catch {
      setError('Bed assignment failed. Check that the bed is available in the selected ward.');
    } finally {
      setSavingId(null);
    }
  }

  if (loading) return <p className="rounded-lg border border-[#DCE3E0] bg-white p-5 text-sm text-[#5B6472]">Loading pending admissions…</p>;

  return (
    <div className="max-w-4xl space-y-5">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#5B6472]">Nurse workflow</p>
        <h2 className="mt-1 text-2xl font-bold text-[#0E4749]">Assign Admission Beds</h2>
        <p className="mt-2 text-sm text-[#5B6472]">Assign an available bed from the ward selected by reception.</p>
      </header>
      {error && <p role="alert" className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
      {success && <p role="status" className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">{success}</p>}
      {admissions.length ? admissions.map((admission) => {
        const wardBeds = beds.filter((bed) => bed.ward_id === admission.ward_id);
        return (
          <article key={admission.admission_id} className="rounded-xl border border-[#DCE3E0] bg-white p-5">
            <h3 className="font-bold text-gray-900">{admission.patient_name}</h3>
            <p className="mt-1 text-sm text-[#5B6472]">{admission.ward_name} · admitted {new Date(admission.admitted_at).toLocaleString()}</p>
            <p className="mt-2 text-sm">{admission.admission_reason}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <select
                value={selectedBeds[admission.admission_id] || ''}
                onChange={(event) => setSelectedBeds((current) => ({ ...current, [admission.admission_id]: event.target.value }))}
                className="min-w-56 rounded-lg border border-[#DCE3E0] bg-white p-3 text-sm"
              >
                <option value="">Select available bed</option>
                {wardBeds.map((bed) => <option key={bed.bed_id} value={bed.bed_id}>{bed.bed_number}</option>)}
              </select>
              <button
                type="button"
                disabled={savingId === admission.admission_id || !selectedBeds[admission.admission_id]}
                onClick={() => void assignBed(admission.admission_id)}
                className="rounded-lg bg-[#0E4749] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {savingId === admission.admission_id ? 'Assigning…' : 'Assign bed'}
              </button>
              {!wardBeds.length && <p className="self-center text-sm text-amber-700">No beds currently available in this ward.</p>}
            </div>
          </article>
        );
      }) : <p className="rounded-xl border border-dashed border-[#DCE3E0] bg-white p-8 text-sm text-[#5B6472]">No admissions are waiting for a bed assignment.</p>}
    </div>
  );
}
