"use client";

import { useEffect, useState } from 'react';
import { Banknote, Hospital } from 'lucide-react';
import { receptionistService, type AdmissionRecord } from '@/services/receptionistService';

export default function ReceptionistAdmissions() {
  const [admissions, setAdmissions] = useState<AdmissionRecord[]>([]);
  const [roomCharges, setRoomCharges] = useState<Record<number, string>>({});
  const [treatmentCharges, setTreatmentCharges] = useState<Record<number, string>>({});
  const [otherCharges, setOtherCharges] = useState<Record<number, string>>({});
  const [payments, setPayments] = useState<Record<number, string>>({});
  const [methods, setMethods] = useState<Record<number, string>>({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [savingAdmission, setSavingAdmission] = useState<number | null>(null);

  function loadAdmissions() {
    return receptionistService.getAdmissions(true).then((records) => {
      setAdmissions(records.filter((admission) => admission.status === 'Discharge Authorized'));
    });
  }

  useEffect(() => {
    loadAdmissions().catch(() => setError('Admission records could not be loaded.'));
  }, []);

  async function calculateBill(admission: AdmissionRecord) {
    const room = Number(roomCharges[admission.admission_id] || 0);
    const treatment = Number(treatmentCharges[admission.admission_id] || 0);
    const other = Number(otherCharges[admission.admission_id] || 0);
    const payment = Number(payments[admission.admission_id] || 0);
    setSavingAdmission(admission.admission_id);
    setError('');
    setMessage('');
    try {
      const result = await receptionistService.calculateDischargeBill(admission.admission_id, {
        room_charges: room,
        treatment_charges: treatment,
        other_charges: other,
        amount_paid: payment,
        payment_method: methods[admission.admission_id] || null,
      });
      setMessage(result.message);
      await loadAdmissions();
    } catch {
      setError('The discharge bill could not be calculated or payment recorded.');
    } finally {
      setSavingAdmission(null);
    }
  }

  async function payBalance(admission: AdmissionRecord) {
    const payment = Number(payments[admission.admission_id] || 0);
    const method = methods[admission.admission_id] || '';
    setSavingAdmission(admission.admission_id);
    setError('');
    setMessage('');
    try {
      const result = await receptionistService.payDischargeBalance(admission.admission_id, payment, method);
      setMessage(result.message);
      await loadAdmissions();
    } catch {
      setError('Payment could not be recorded. Check the amount and payment method.');
    } finally {
      setSavingAdmission(null);
    }
  }

  return (
    <div className="space-y-6">
      <header><p className="text-sm font-semibold uppercase tracking-wide text-[#5B6472]">Admissions</p><h2 className="mt-1 text-2xl font-bold text-[#0E4749]">Discharge and Billing</h2><p className="mt-2 text-sm text-[#5B6472]">A doctor must authorize discharge before you calculate the bill. Discharge is completed after the full bill is paid.</p></header>
      {error && <p role="alert" className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
      {message && <p role="status" className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">{message}</p>}
      {admissions.length ? admissions.map((admission) => {
        const total = Number(admission.total_amount || 0);
        const paid = Number(admission.amount_paid || 0);
        const outstanding = Math.max(total - paid, 0);
        const isAuthorized = admission.status === 'Discharge Authorized';
        const hasBill = admission.bill_id !== null;
        return (
          <article key={admission.admission_id} className="rounded-xl border border-[#DCE3E0] bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="rounded-lg bg-teal-50 p-3 text-[#0E4749]"><Hospital className="h-5 w-5" /></span>
                <div><h3 className="font-bold text-gray-900">{admission.patient_name}</h3><p className="mt-1 text-sm text-[#5B6472]">{admission.ward_name}, {admission.bed_number ? `Bed ${admission.bed_number}` : 'bed pending nurse assignment'} · Admitted {new Date(admission.admitted_at).toLocaleDateString()}</p><p className="mt-1 text-sm text-[#5B6472]">{admission.admission_reason}</p><p className="mt-1 text-xs text-[#5B6472]">{admission.gender ? `Gender: ${admission.gender} · ` : ''}Admitting doctor: {admission.admitted_doctor_name} · Guardian: {admission.guardian_name} ({admission.guardian_relationship}) · {admission.guardian_contact}</p></div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${isAuthorized ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-800'}`}>{admission.status}</span>
            </div>

            {isAuthorized && (
              <div className="mt-5 border-t border-[#DCE3E0] pt-5">
                {hasBill ? (
                  <>
                    <div className="grid gap-3 text-sm sm:grid-cols-5">
                      <p>Room: <strong>{Number(admission.room_charges).toFixed(2)}</strong></p>
                      <p>Treatment: <strong>{Number(admission.treatment_charges).toFixed(2)}</strong></p>
                      <p>Other: <strong>{Number(admission.other_charges).toFixed(2)}</strong></p>
                      <p>Total: <strong>{total.toFixed(2)}</strong></p>
                      <p>Balance: <strong>{outstanding.toFixed(2)}</strong></p>
                    </div>
                    {outstanding > 0 && <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <label className="text-sm font-semibold">Payment amount<input type="number" min="0.01" step="0.01" max={outstanding} value={payments[admission.admission_id] || ''} onChange={(event) => setPayments((values) => ({ ...values, [admission.admission_id]: event.target.value }))} className="mt-1 w-full rounded-lg border border-[#DCE3E0] p-2 font-normal" /></label>
                      <label className="text-sm font-semibold">Payment method<select value={methods[admission.admission_id] || ''} onChange={(event) => setMethods((values) => ({ ...values, [admission.admission_id]: event.target.value }))} className="mt-1 w-full rounded-lg border border-[#DCE3E0] bg-white p-2 font-normal"><option value="">Select method</option><option>Cash</option><option>Card</option><option>Bank Transfer</option><option>Insurance</option></select></label>
                      <button type="button" disabled={savingAdmission === admission.admission_id || !payments[admission.admission_id] || !methods[admission.admission_id]} onClick={() => void payBalance(admission)} className="self-end rounded-lg bg-[#0E4749] px-4 py-2.5 font-bold text-white disabled:opacity-50">{savingAdmission === admission.admission_id ? 'Recording…' : 'Record payment'}</button>
                    </div>}
                  </>
                ) : (
                  <>
                    <p className="mb-3 text-sm font-semibold text-[#0E4749]">Doctor authorized at {admission.discharge_authorized_at ? new Date(admission.discharge_authorized_at).toLocaleString() : '—'}{admission.discharge_notes ? ` · ${admission.discharge_notes}` : ''}</p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                      <label className="text-sm font-semibold">Room charges<input type="number" min="0" step="0.01" value={roomCharges[admission.admission_id] || ''} onChange={(event) => setRoomCharges((current) => ({ ...current, [admission.admission_id]: event.target.value }))} className="mt-1 w-full rounded-lg border border-[#DCE3E0] p-2 font-normal" /></label>
                      <label className="text-sm font-semibold">Treatment charges<input type="number" min="0" step="0.01" value={treatmentCharges[admission.admission_id] || ''} onChange={(event) => setTreatmentCharges((current) => ({ ...current, [admission.admission_id]: event.target.value }))} className="mt-1 w-full rounded-lg border border-[#DCE3E0] p-2 font-normal" /></label>
                      <label className="text-sm font-semibold">Other charges<input type="number" min="0" step="0.01" value={otherCharges[admission.admission_id] || ''} onChange={(event) => setOtherCharges((current) => ({ ...current, [admission.admission_id]: event.target.value }))} className="mt-1 w-full rounded-lg border border-[#DCE3E0] p-2 font-normal" /></label>
                      <label className="text-sm font-semibold">Amount paid now<input type="number" min="0" step="0.01" value={payments[admission.admission_id] || ''} onChange={(event) => setPayments((current) => ({ ...current, [admission.admission_id]: event.target.value }))} className="mt-1 w-full rounded-lg border border-[#DCE3E0] p-2 font-normal" /></label>
                      <label className="text-sm font-semibold">Payment method<select value={methods[admission.admission_id] || ''} onChange={(event) => setMethods((values) => ({ ...values, [admission.admission_id]: event.target.value }))} className="mt-1 w-full rounded-lg border border-[#DCE3E0] bg-white p-2 font-normal"><option value="">Select method</option><option>Cash</option><option>Card</option><option>Bank Transfer</option><option>Insurance</option></select></label>
                    </div>
                    <p className="mt-3 flex items-center gap-2 text-sm text-[#5B6472]"><Banknote className="h-4 w-4" /> Total calculated from room + treatment + other charges.</p>
                    <button type="button" disabled={savingAdmission === admission.admission_id || (payments[admission.admission_id] !== undefined && Number(payments[admission.admission_id]) > 0 && !methods[admission.admission_id])} onClick={() => void calculateBill(admission)} className="mt-4 rounded-lg bg-[#0E4749] px-4 py-2.5 font-bold text-white disabled:opacity-50">{savingAdmission === admission.admission_id ? 'Calculating…' : 'Calculate bill and record payment'}</button>
                  </>
                )}
              </div>
            )}
          </article>
        );
      }) : <section className="rounded-xl border border-dashed border-[#DCE3E0] bg-white p-8 text-center text-sm text-[#5B6472]">No patients are currently authorized for discharge.</section>}
    </div>
  );
}
