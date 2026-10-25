"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  TestTube, CheckCircle2, Clock, Check, 
  Search, RefreshCw, AlertTriangle, ArrowRight, User, FileText, X
} from 'lucide-react';
import { nurseService } from '@/services/nurseService';

export default function NurseLabTestsPage() {
  const [labOrders, setLabOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [resultsText, setResultsText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchLabOrders = async () => {
    setLoading(true);
    try {
      const data = await nurseService.getNurseLabOrders();
      setLabOrders(data || []);
    } catch (err: any) {
      setToast({ type: 'error', message: err?.response?.data?.detail || 'Failed to load lab orders.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabOrders();
  }, []);

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    if (!resultsText.trim()) {
      setToast({ type: 'error', message: 'Please enter the official lab test findings.' });
      return;
    }

    setSubmitting(true);
    try {
      await nurseService.completeLabOrder(selectedOrder.lab_id, resultsText.trim());
      setSelectedOrder(null);
      setResultsText('');
      setToast({ type: 'success', message: `Lab results recorded for ${selectedOrder.test_type} (${selectedOrder.patient_name}).` });
      setTimeout(() => setToast(null), 3500);
      await fetchLabOrders();
    } catch (err: any) {
      setToast({ type: 'error', message: err?.response?.data?.detail || 'Failed to finalize lab results.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOrders = labOrders.filter((ord) => {
    const matchesStatus = filterStatus === 'All' ? true : ord.status === filterStatus;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery = 
      !query ||
      (ord.patient_name && ord.patient_name.toLowerCase().includes(query)) ||
      (ord.bed_number && ord.bed_number.toLowerCase().includes(query)) ||
      (ord.test_type && ord.test_type.toLowerCase().includes(query)) ||
      (ord.doctor_name && ord.doctor_name.toLowerCase().includes(query)) ||
      (ord.results_text && ord.results_text.toLowerCase().includes(query));
    return matchesStatus && matchesQuery;
  });

  const pendingCount = labOrders.filter((o) => o.status === 'Pending').length;
  const completedCount = labOrders.filter((o) => o.status === 'Completed').length;

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
            <TestTube className="w-6 h-6 text-[#0E4749]" />
            <h1 className="text-2xl font-bold text-[#0E4749] tracking-tight">Clinical Lab Testing Station</h1>
          </div>
          <p className="text-xs text-[#5B6472] mt-1">
            Nurse-managed specimen testing, diagnostic evaluations, and physician result documentation for all patients.
          </p>
        </div>

        <button
          onClick={fetchLabOrders}
          disabled={loading}
          className="self-start sm:self-auto bg-white border border-[#DCE3E0] hover:bg-teal-50 text-[#0E4749] px-4 py-2 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Orders
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-[#0E4749]">
            <TestTube className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#0E4749]">{labOrders.length}</div>
            <div className="text-[11px] font-semibold text-[#5B6472]">Total Lab Orders</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-amber-700">{pendingCount}</div>
            <div className="text-[11px] font-semibold text-[#5B6472]">Awaiting Nurse Testing</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-700">{completedCount}</div>
            <div className="text-[11px] font-semibold text-[#5B6472]">Completed & Documented</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#DCE3E0] p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-[#F8FAF9] border border-[#DCE3E0] rounded-xl self-start">
            {(['All', 'Pending', 'Completed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterStatus === st
                    ? 'bg-[#0E4749] text-white shadow-2xs'
                    : 'text-[#5B6472] hover:text-[#0E4749] hover:bg-gray-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient, bed, test, doctor..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#DCE3E0] rounded-xl focus:outline-none focus:border-[#0E4749] bg-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0E4749]" />
            <span>Loading lab testing orders...</span>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-3">
            {filteredOrders.map((ord) => {
              const isPending = ord.status === 'Pending';
              const isCompleted = ord.status === 'Completed';

              return (
                <div
                  key={ord.lab_id}
                  className={`p-5 rounded-xl border transition ${
                    isPending
                      ? 'bg-amber-50/40 border-amber-300'
                      : 'bg-white border-[#DCE3E0]'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-[#0E4749]">{ord.patient_name}</span>
                        {ord.age && <span className="text-xs text-[#5B6472]">({ord.age} yrs)</span>}

                        {ord.bed_number && ord.bed_number !== 'Outpatient' ? (
                          <>
                            {ord.ward_name && (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                                {ord.ward_name}
                              </span>
                            )}
                            <Link
                              href={ord.bed_id ? `/nurse/bed/${ord.bed_id}` : '/nurse/dashboard'}
                              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-[#0E4749] border border-teal-200 hover:bg-teal-200 transition flex items-center gap-1 shadow-2xs"
                            >
                              <span>Bed {ord.bed_number}</span>
                              <ArrowRight className="w-3 h-3 text-[#0E4749]" />
                            </Link>
                          </>
                        ) : (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            Outpatient / Clinic
                          </span>
                        )}

                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0E4749] border border-teal-200">
                          {ord.test_type}
                        </span>

                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.status}
                        </span>
                      </div>

                      {ord.allergies && ord.allergies !== 'None' && (
                        <div className="text-[11px] text-red-700 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Allergies: {ord.allergies}</span>
                        </div>
                      )}

                      {isCompleted && ord.results_text && (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs">
                          <strong className="text-[#0E4749] block mb-0.5">Laboratory Findings / Official Results:</strong>
                          <p className="text-gray-800 whitespace-pre-wrap">{ord.results_text}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#5B6472] pt-0.5">
                        <span>Ordered by: <strong>{ord.doctor_name || 'Physician'}</strong></span>
                        <span>•</span>
                        <span>Ordered: {ord.ordered_at}</span>
                        {isCompleted && ord.updated_at && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold">Completed: {ord.updated_at}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 self-end lg:self-center">
                      {isPending ? (
                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setResultsText('');
                          }}
                          className="bg-[#0E4749] hover:bg-[#0a3335] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 transition active:scale-95"
                        >
                          <TestTube className="w-3.5 h-3.5 text-[#E07856]" />
                          Perform Test & Enter Results
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setResultsText(ord.results_text || '');
                          }}
                          className="bg-white hover:bg-gray-50 text-[#0E4749] border border-[#DCE3E0] px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition"
                        >
                          Edit / View Findings
                        </button>
                      )}

                      {ord.bed_id && (
                        <Link
                          href={`/nurse/bed/${ord.bed_id}`}
                          className="text-xs font-semibold text-[#0E4749] hover:bg-teal-50 border border-[#DCE3E0] px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                        >
                          View Bed <ArrowRight className="w-3 h-3 text-[#E07856]" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 text-xs italic">
            No lab orders match your search or filter.
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#DCE3E0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3E0]">
              <div className="flex items-center gap-2">
                <TestTube className="w-5 h-5 text-[#0E4749]" />
                <h3 className="font-bold text-base text-[#0E4749]">Laboratory Test Results Documentation</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-teal-50/60 p-3.5 rounded-xl border border-teal-100 text-xs space-y-1">
              <div><strong>Patient:</strong> {selectedOrder.patient_name} {selectedOrder.bed_number ? `(${selectedOrder.bed_number})` : ''}</div>
              <div><strong>Test Type:</strong> {selectedOrder.test_type}</div>
              <div><strong>Ordering Physician:</strong> {selectedOrder.doctor_name || 'Physician'}</div>
              <div><strong>Ordered At:</strong> {selectedOrder.ordered_at}</div>
              {selectedOrder.allergies && selectedOrder.allergies !== 'None' && (
                <div className="text-red-700 font-semibold pt-1">
                  Documented Allergies: {selectedOrder.allergies}
                </div>
              )}
            </div>

            <form onSubmit={handleCompleteOrder} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#5B6472] uppercase">
                    Test Findings, Diagnostic Values & Clinical Report
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setResultsText(`Test: ${selectedOrder.test_type}\nFindings: Normal limits.\nReference Values: Within normal physiological ranges.\nNotes: Specimen clear; no abnormality detected.`)}
                      className="text-[10px] text-teal-800 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded border border-teal-200 font-semibold"
                    >
                      Normal Template
                    </button>
                  </div>
                </div>

                <textarea
                  value={resultsText}
                  onChange={(e) => setResultsText(e.target.value)}
                  placeholder="Enter detailed laboratory findings (e.g. Hemoglobin: 13.8 g/dL, Platelets: 240,000 /mcL, Glucose: 98 mg/dL, specimen observation)..."
                  rows={6}
                  className="w-full p-3 text-xs border border-[#DCE3E0] rounded-xl focus:outline-none focus:border-[#0E4749]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE3E0]">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#5B6472] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold bg-[#0E4749] hover:bg-[#0a3335] text-white shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#E07856]" />
                  {submitting ? 'Saving Findings...' : 'Save & Finalize Lab Results'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
