"use client";

import React, { useEffect, useState } from 'react';
import { 
  nurseService, 
  ShiftHandoverItem, 
  DashboardStatsResponse,
  WardOverviewResponse 
} from '@/services/nurseService';
import { 
  History, Clock, CheckCircle2, AlertCircle, AlertTriangle, 
  UserCheck, Send, RefreshCw, ShieldCheck, ArrowRight, 
  Calendar, FileText, Check, Users, BedDouble
} from 'lucide-react';

export default function ShiftHandoverPage() {
  const [handovers, setHandovers] = useState<ShiftHandoverItem[]>([]);
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [ward, setWard] = useState<WardOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [shiftType, setShiftType] = useState<'Day' | 'Evening' | 'Night'>('Day');
  const [summaryNotes, setSummaryNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [handoverRes, statsRes, wardRes] = await Promise.all([
        nurseService.getCurrentShiftHandover(),
        nurseService.getDashboardStats().catch(() => null),
        nurseService.getWardOverview().catch(() => null),
      ]);
      setHandovers(handoverRes);
      setStats(statsRes);
      setWard(wardRes);

      const hour = new Date().getHours();
      if (hour >= 7 && hour < 15) {
        setShiftType('Day');
      } else if (hour >= 15 && hour < 23) {
        setShiftType('Evening');
      } else {
        setShiftType('Night');
      }
    } catch (err: any) {
      console.error('Failed to load handover data:', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to load shift handover data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summaryNotes.trim()) {
      setError('Please provide shift summary clinical notes before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await nurseService.createShiftHandover({
        shift_type: shiftType,
        summary_notes: summaryNotes.trim(),
      });
      setSuccessMsg(`Shift handover for ${shiftType} Shift submitted successfully.`);
      setSummaryNotes('');
      await loadData();
    } catch (err: any) {
      console.error('Failed to submit handover:', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to create shift handover.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptHandover = async (handoverId: number) => {
    setAcceptingId(handoverId);
    setError(null);
    setSuccessMsg(null);
    try {
      await nurseService.acceptShiftHandover(handoverId);
      setSuccessMsg('Handover duty successfully accepted and logged into audit trail.');
      await loadData();
    } catch (err: any) {
      console.error('Failed to accept handover:', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to accept handover.');
    } finally {
      setAcceptingId(null);
    }
  };

  const pendingHandover = handovers.find(h => h.status === 'Pending_Acceptance');

  return (
    <div className="space-y-6">
      <div className="bg-[#0E4749] text-white p-6 rounded-xl relative overflow-hidden shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-teal-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#E07856]" />
              Nurse Shift Handover Protocol
            </span>
            <span className="bg-teal-800/90 text-teal-100 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-teal-700/60 flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#E07856]" /> {stats?.active_shift || 'Active Shift'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {ward?.ward_name || 'Ward Station'} — Clinical Shift Handover
          </h1>
          <p className="text-teal-100/90 text-sm mt-1 max-w-2xl">
            Formal continuity-of-care transfer between outgoing and incoming duty nurses. Document critical patients, outstanding doctor orders, and SBAR notes.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 bg-teal-800/80 hover:bg-teal-700 text-white text-xs font-semibold px-3 py-2 rounded-lg border border-teal-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5B6472]">Admitted Patients</span>
            <Users className="w-4 h-4 text-[#0E4749]" />
          </div>
          <div className="text-2xl font-bold text-[#0E4749] mt-2">
            {stats?.occupied_beds ?? ward?.beds.filter(b => b.bed_status === 'Occupied').length ?? 0}
          </div>
          <div className="text-[11px] text-teal-700 mt-1">Current Inpatient Census</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5B6472]">Critical Watch</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600 mt-2">
            {stats?.critical_patients_count ?? 0}
          </div>
          <div className="text-[11px] text-red-600 mt-1">SpO2 &lt; 92% / Vital alerts</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5B6472]">Pending Doctor Orders</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">
            {stats?.pending_orders_count ?? 0}
          </div>
          <div className="text-[11px] text-amber-700 mt-1">Awaiting execution</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5B6472]">Medications Due (MAR)</span>
            <BedDouble className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-teal-700 mt-2">
            {stats?.medications_due_count ?? 0}
          </div>
          <div className="text-[11px] text-teal-600 mt-1">Pending administration</div>
        </div>
      </div>

      {pendingHandover && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-amber-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Handover Pending Acceptance
                </span>
                <span className="text-xs font-semibold text-amber-800">
                  {pendingHandover.shift_type} Shift Handover (#{pendingHandover.handover_id})
                </span>
              </div>
              <h3 className="text-base font-bold text-amber-950">
                Outgoing Nurse: {pendingHandover.outgoing_nurse_name || 'Staff Nurse'}
              </h3>
              <p className="text-xs text-amber-900 mt-1 whitespace-pre-line bg-white/70 p-3 rounded-lg border border-amber-200">
                {pendingHandover.summary_notes}
              </p>
              <div className="flex items-center gap-4 text-xs text-amber-800 pt-1">
                <span>Critical Patients: <strong>{pendingHandover.critical_patients_count}</strong></span>
                <span>•</span>
                <span>Pending Tasks: <strong>{pendingHandover.pending_tasks_count}</strong></span>
                <span>•</span>
                <span>Submitted: {new Date(pendingHandover.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            <button
              onClick={() => handleAcceptHandover(pendingHandover.handover_id)}
              disabled={acceptingId === pendingHandover.handover_id}
              className="flex-shrink-0 flex items-center justify-center gap-2 bg-[#0E4749] hover:bg-[#093233] text-white px-5 py-3 rounded-xl font-bold text-sm shadow hover:shadow-md transition active:scale-95 disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4 text-[#E07856]" />
              {acceptingId === pendingHandover.handover_id ? 'Accepting Shift...' : 'Accept Handover & Assume Duty'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-[#DCE3E0] shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#DCE3E0]">
            <Send className="w-5 h-5 text-[#0E4749]" />
            <h2 className="text-lg font-bold text-[#0E4749]">Create Outgoing Handover</h2>
          </div>

          <form onSubmit={handleCreateHandover} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#5B6472] uppercase tracking-wider mb-1.5">
                Shift Period
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Day', 'Evening', 'Night'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setShiftType(s)}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition ${
                      shiftType === s
                        ? 'bg-[#0E4749] text-white border-[#0E4749]'
                        : 'bg-[#F4F6F5] text-[#5B6472] border-transparent hover:border-[#DCE3E0]'
                    }`}
                  >
                    {s} Shift
                    <span className="block text-[10px] font-normal opacity-80">
                      {s === 'Day' ? '07:00-15:00' : s === 'Evening' ? '15:00-23:00' : '23:00-07:00'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#F8FAF9] p-3 rounded-lg border border-[#DCE3E0] text-xs space-y-1">
              <div className="font-semibold text-[#0E4749] flex items-center justify-between">
                <span>Handover Census Summary</span>
                <span className="text-[11px] font-normal text-[#5B6472]">Auto-computed</span>
              </div>
              <div className="flex justify-between text-[#5B6472]">
                <span>Inpatients in Ward:</span>
                <span className="font-bold text-[#0E4749]">
                  {stats?.occupied_beds ?? ward?.beds.filter(b => b.bed_status === 'Occupied').length ?? 0}
                </span>
              </div>
              <div className="flex justify-between text-[#5B6472]">
                <span>Critical / Low SpO2:</span>
                <span className="font-bold text-red-600">{stats?.critical_patients_count ?? 0}</span>
              </div>
              <div className="flex justify-between text-[#5B6472]">
                <span>Pending Doctor Orders:</span>
                <span className="font-bold text-amber-600">{stats?.pending_orders_count ?? 0}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5B6472] uppercase tracking-wider mb-1.5">
                Clinical Handover Notes (SBAR / Shift Summary)
              </label>
              <textarea
                value={summaryNotes}
                onChange={(e) => setSummaryNotes(e.target.value)}
                placeholder="Situation, Background, Assessment, Recommendation. e.g.:
- Bed 1: Mrs. Perera SpO2 91%, O2 at 2L via nasal cannula initiated.
- Bed 3: Dr. orders for Blood Culture acknowledged, pending lab draw at 20:00.
- Bed 5: Post-op IV saline continuing at 80ml/hr. All MAR meds administered on time."
                rows={7}
                className="w-full text-xs p-3 border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749] bg-white text-gray-800 leading-relaxed resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-[#0E4749] hover:bg-[#093233] text-white py-2.5 rounded-lg text-xs font-bold transition shadow-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-[#E07856]" />
              {submitting ? 'Submitting Handover...' : 'Submit Handover Report'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-[#DCE3E0] shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DCE3E0]">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#0E4749]" />
              <h2 className="text-lg font-bold text-[#0E4749]">Shift Handover Log & History</h2>
            </div>
            <span className="text-xs text-[#5B6472]">{handovers.length} records</span>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center text-xs text-[#5B6472] gap-2 items-center">
              <RefreshCw className="w-4 h-4 animate-spin text-[#0E4749]" />
              Loading handover records...
            </div>
          ) : handovers.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#5B6472]">
              No shift handovers logged yet. Create your first handover report on the left.
            </div>
          ) : (
            <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
              {handovers.map((h) => {
                const isAccepted = h.status === 'Accepted';
                return (
                  <div
                    key={h.handover_id}
                    className={`p-4 rounded-xl border transition ${
                      isAccepted
                        ? 'border-[#DCE3E0] bg-[#F8FAF9]'
                        : 'border-amber-300 bg-amber-50/60'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0E4749]">
                          {h.shift_type} Shift
                        </span>
                        <span className="text-xs text-[#5B6472]">
                          ({h.handover_date})
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isAccepted
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isAccepted ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Accepted
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" /> Pending Acceptance
                          </>
                        )}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-[#5B6472] mb-3">
                      <div>
                        <span className="text-gray-400">Outgoing:</span>{' '}
                        <strong className="text-gray-700">{h.outgoing_nurse_name || 'Staff Nurse'}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400">Incoming:</span>{' '}
                        <strong className="text-gray-700">{h.incoming_nurse_name || 'Awaiting Duty Nurse'}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400">Critical:</span>{' '}
                        <span className="font-semibold text-red-600">{h.critical_patients_count}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Pending Tasks:</span>{' '}
                        <span className="font-semibold text-amber-600">{h.pending_tasks_count}</span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-[#DCE3E0] text-xs text-gray-800 whitespace-pre-line leading-relaxed">
                      {h.summary_notes}
                    </div>

                    <div className="mt-2 text-[10px] text-gray-400 flex items-center justify-between">
                      <span>Logged: {new Date(h.created_at).toLocaleString()}</span>
                      {h.accepted_at && (
                        <span>Accepted: {new Date(h.accepted_at).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
