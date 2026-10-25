"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Pill, CheckSquare, AlertTriangle, ShieldCheck, 
  Search, RefreshCw, CheckCircle2, X, Clock, ArrowRight 
} from 'lucide-react';
import { nurseService } from '@/services/nurseService';

export default function NurseMarPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedRx, setSelectedRx] = useState<any | null>(null);
  const [status, setStatus] = useState<'Given' | 'Held' | 'Refused' | 'Not Given'>('Given');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [fiveRightsChecked, setFiveRightsChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchMar = async () => {
    setLoading(true);
    try {
      const data = await nurseService.getWardMar();
      setPrescriptions(data.prescriptions || []);
      setHistory(data.history || []);
    } catch (err: any) {
      setToast({ type: 'error', message: err?.response?.data?.detail || 'Failed to fetch ward MAR.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMar();
  }, []);

  const handleAdminister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRx) return;
    if (!fiveRightsChecked) {
      setToast({ type: 'error', message: 'You must verify the 5 Rights of Medication Administration.' });
      return;
    }

    setSubmitting(true);
    try {
      await nurseService.administerMedication(selectedRx.patient_id, {
        rx_id: selectedRx.rx_id,
        status,
        reason: reason.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      setSelectedRx(null);
      setStatus('Given');
      setReason('');
      setNotes('');
      setFiveRightsChecked(false);
      setToast({ type: 'success', message: `${selectedRx.med_name} marked as ${status} for ${selectedRx.patient_name}.` });
      setTimeout(() => setToast(null), 4000);
      await fetchMar();
    } catch (err: any) {
      setToast({ type: 'error', message: err?.response?.data?.detail || 'Failed to record medication administration.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRx = prescriptions.filter((rx) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (rx.med_name && rx.med_name.toLowerCase().includes(q)) ||
      (rx.patient_name && rx.patient_name.toLowerCase().includes(q)) ||
      (rx.bed_number && rx.bed_number.toLowerCase().includes(q)) ||
      (rx.dosage && rx.dosage.toLowerCase().includes(q)) ||
      (rx.prescribing_doctor && rx.prescribing_doctor.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 p-4 rounded-xl border-2 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-red-50 border-red-300 text-red-950'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Pill className="w-6 h-6 text-[#0E4749]" />
            <h1 className="text-2xl font-bold text-[#0E4749] tracking-tight">Medication Administration Record (MAR)</h1>
          </div>
          <p className="text-xs text-[#5B6472] mt-1">
            Ward-wide active prescriptions, clinical allergy warnings, and dose administration logging.
          </p>
        </div>

        <button
          onClick={fetchMar}
          disabled={loading}
          className="self-start sm:self-auto bg-white border border-[#DCE3E0] hover:bg-teal-50 text-[#0E4749] px-4 py-2 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Schedule
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#DCE3E0] p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#0E4749]">Active Ward Prescriptions</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[#0E4749] border border-teal-200">
              {prescriptions.length} Active
            </span>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search drug, patient, bed..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#DCE3E0] rounded-xl focus:outline-none focus:border-[#0E4749] bg-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0E4749]" />
            <span>Loading active medications...</span>
          </div>
        ) : filteredRx.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRx.map((rx) => (
              <div
                key={rx.rx_id}
                className={`p-4 rounded-xl border transition flex flex-col justify-between gap-3 ${
                  rx.has_allergy_conflict
                    ? 'bg-rose-50/40 border-rose-300'
                    : 'bg-white border-[#DCE3E0]'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-gray-900">{rx.med_name}</div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-[#0E4749] border border-teal-200 inline-block mt-0.5">
                        {rx.dosage}
                      </span>
                    </div>

                    {rx.bed_number && (
                      <Link
                        href={rx.bed_id ? `/nurse/bed/${rx.bed_id}?tab=mar` : '/nurse/dashboard'}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-teal-100 text-[#0E4749] hover:bg-teal-200 transition"
                      >
                        Bed {rx.bed_number}
                      </Link>
                    )}
                  </div>

                  <div className="text-xs text-[#5B6472]">
                    Patient: <strong className="text-gray-900">{rx.patient_name}</strong>
                  </div>

                  {rx.has_allergy_conflict && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-100 p-2 rounded-lg border border-rose-200">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>Allergy Conflict: Patient allergic to {rx.patient_allergies}</span>
                    </div>
                  )}

                  <div className="text-[11px] text-[#5B6472]">
                    Prescribed by: {rx.prescribing_doctor || 'Attending Physician'} • {rx.duration || 'Daily'}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-[11px] text-gray-400">
                    {rx.latest_admin_time ? `Last given: ${rx.latest_admin_time}` : 'Not yet administered today'}
                  </span>

                  <button
                    onClick={() => {
                      setSelectedRx(rx);
                      setFiveRightsChecked(false);
                      setStatus('Given');
                      setReason('');
                      setNotes('');
                    }}
                    className="bg-[#0E4749] hover:bg-[#0a3335] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 transition"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-[#E07856]" /> Administer Dose
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 text-xs italic">
            No active prescriptions match your search.
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#DCE3E0] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#DCE3E0]">
          <Clock className="w-5 h-5 text-[#0E4749]" />
          <h2 className="font-bold text-sm text-[#0E4749]">Medication Administration Audit History</h2>
        </div>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAF9] text-[#5B6472] uppercase border-b border-[#DCE3E0]">
                <tr>
                  <th className="py-2.5 px-3">Date / Time</th>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Bed</th>
                  <th className="py-2.5 px-3">Medication</th>
                  <th className="py-2.5 px-3">Dosage</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Administered By</th>
                  <th className="py-2.5 px-3">Notes / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((h) => (
                  <tr key={h.mar_id} className="hover:bg-gray-50/60">
                    <td className="py-2.5 px-3 font-semibold text-gray-800">{h.administered_at}</td>
                    <td className="py-2.5 px-3 font-bold text-gray-900">{h.patient_name}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#0E4749]">{h.bed_number ? `Bed ${h.bed_number}` : '--'}</td>
                    <td className="py-2.5 px-3 font-semibold text-gray-800">{h.med_name}</td>
                    <td className="py-2.5 px-3 text-[#5B6472]">{h.dosage}</td>
                    <td className="py-2.5 px-3">
                      <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                        h.status === 'Given' ? 'bg-emerald-100 text-emerald-800' :
                        h.status === 'Held' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#5B6472]">{h.administered_by_name || 'Staff Nurse'}</td>
                    <td className="py-2.5 px-3 text-gray-500 italic">{h.notes || h.reason || '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-400 text-xs italic">
            No medication administration records logged yet.
          </div>
        )}
      </div>

      {selectedRx && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#DCE3E0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3E0]">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-[#0E4749]" />
                <h3 className="font-bold text-base text-[#0E4749]">Record Medication Administration</h3>
              </div>
              <button onClick={() => setSelectedRx(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs space-y-1">
              <div><strong>Drug:</strong> {selectedRx.med_name}</div>
              <div><strong>Dosage:</strong> {selectedRx.dosage}</div>
              <div><strong>Patient:</strong> {selectedRx.patient_name} {selectedRx.bed_number ? `(Bed ${selectedRx.bed_number})` : ''}</div>
              {selectedRx.has_allergy_conflict && (
                <div className="text-red-700 font-bold bg-red-100 p-2 rounded border border-red-300 mt-1">
                  CRITICAL: Patient has a documented allergy to {selectedRx.patient_allergies}! Verify with physician.
                </div>
              )}
            </div>

            <form onSubmit={handleAdminister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">Administration Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full p-2.5 text-xs border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749]"
                >
                  <option value="Given">Given (Administered on time)</option>
                  <option value="Held">Held (Withheld due to clinical reason)</option>
                  <option value="Refused">Refused by Patient</option>
                  <option value="Not Given">Not Given</option>
                </select>
              </div>

              {status !== 'Given' && (
                <div>
                  <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">Clinical Reason / Withheld Rationale</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Systolic BP < 90, patient nauseous, or refused"
                    className="w-full p-2 text-xs border border-[#DCE3E0] rounded-lg"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">Nursing Observations / Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Tolerated well with full glass of water."
                  rows={2}
                  className="w-full p-2 text-xs border border-[#DCE3E0] rounded-lg"
                />
              </div>

              <div className="bg-teal-50 border border-teal-200 p-3 rounded-xl flex items-start gap-2">
                <input
                  type="checkbox"
                  id="rightsCheck"
                  checked={fiveRightsChecked}
                  onChange={(e) => setFiveRightsChecked(e.target.checked)}
                  className="mt-0.5 rounded text-[#0E4749]"
                />
                <label htmlFor="rightsCheck" className="text-xs text-teal-950 font-medium cursor-pointer">
                  I verify the <strong>5 Rights of Medication Administration</strong>: Right Patient, Right Drug, Right Dose, Right Route, and Right Time.
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE3E0]">
                <button
                  type="button"
                  onClick={() => setSelectedRx(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#5B6472] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !fiveRightsChecked}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0E4749] hover:bg-[#0a3335] text-white transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Confirm MAR Administration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
