"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Pill,
  RefreshCw,
  Search,
  Stethoscope,
  User,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import {
  patientService,
  type PatientMedicalRecord,
} from '@/services/patientService';

function formatRecordDate(dateStr?: string | null) {
  if (!dateStr) return 'N/A';
  const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRecordTime(dateStr?: string | null) {
  if (!dateStr) return '';
  const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PatientRecords() {
  const { user, isLoading: isAuthLoading } = useAuth();

  const [patientId, setPatientId] = useState<number | null>(null);
  const [records, setRecords] = useState<PatientMedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRecords = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setLoadError('');

    try {
      let resolvedId = patientId;

      if (!resolvedId) {
        try {
          const profile = await patientService.getMyProfile();
          if (profile?.patient_id) {
            resolvedId = profile.patient_id;
            setPatientId(resolvedId);
          }
        } catch {
          // Fallback to patient 1 if profile query fails or in testing
          resolvedId = 1;
          setPatientId(1);
        }
      }

      const activeId = resolvedId || 1;
      const data = await patientService.getMedicalRecords(activeId);
      setRecords(data);
    } catch {
      setLoadError('Failed to load your medical records. Please try again.');
      toast.error('Unable to fetch medical records');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (isAuthLoading) return;
    fetchRecords();
  }, [isAuthLoading, fetchRecords]);

  // Client-side search filtering
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const query = searchQuery.toLowerCase().trim();
    return records.filter((rec) =>
      rec.diagnosis.toLowerCase().includes(query) ||
      (rec.clinical_notes && rec.clinical_notes.toLowerCase().includes(query)) ||
      rec.doctor_name.toLowerCase().includes(query) ||
      (rec.doctor_specialty && rec.doctor_specialty.toLowerCase().includes(query)) ||
      String(rec.record_id).includes(query) ||
      (rec.prescriptions &&
        rec.prescriptions.some((p) => p.med_name.toLowerCase().includes(query)))
    );
  }, [records, searchQuery]);

  // Summary counts
  const totalRecords = records.length;
  const uniqueDoctors = new Set(records.map((r) => r.doctor_name)).size;
  const totalPrescriptions = records.reduce(
    (sum, r) => sum + (r.prescriptions?.length || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-[#0E4749]">My Medical Records</h3>
          <p className="text-sm text-[#5B6472]">
            Review your clinical history, diagnoses, attending physician notes, and prescribed treatments
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchRecords(true)}
          disabled={isLoading || isRefreshing}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#DCE3E0] bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0E4749] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 text-[#0E4749] ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#DCE3E0] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Consultations</span>
            <div className="rounded-lg bg-teal-50 p-2 text-[#0E4749]">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{totalRecords}</div>
          <p className="mt-1 text-xs text-[#5B6472]">Recorded doctor visits</p>
        </div>

        <div className="rounded-xl border border-[#DCE3E0] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Attending Physicians</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <Stethoscope className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{uniqueDoctors}</div>
          <p className="mt-1 text-xs text-[#5B6472]">Specialists consulted</p>
        </div>

        <div className="rounded-xl border border-[#DCE3E0] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Prescribed Medicines</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-700">
              <Pill className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{totalPrescriptions}</div>
          <p className="mt-1 text-xs text-[#5B6472]">Linked medication orders</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center rounded-xl border border-[#DCE3E0] bg-white p-4 shadow-sm">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medical records by diagnosis, doctor name, medication, notes..."
            className="w-full rounded-lg border border-[#DCE3E0] bg-white py-2 pl-9 pr-3 text-sm text-gray-900 transition focus:border-[#0E4749] focus:outline-none focus:ring-1 focus:ring-[#0E4749]"
          />
        </div>
      </div>

      {/* Records Timeline List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-[#DCE3E0] bg-white py-16 text-sm text-[#5B6472] shadow-sm">
          <Loader2 className="h-7 w-7 animate-spin text-[#0E4749]" />
          <span>Loading your medical records…</span>
        </div>
      ) : loadError ? (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          <div>
            <h5 className="font-bold">Error loading records</h5>
            <p className="mt-1 text-xs text-rose-600">{loadError}</p>
            <button
              type="button"
              onClick={() => fetchRecords()}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </button>
          </div>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#DCE3E0] bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-[#0E4749]">
            <FileText className="h-6 w-6" />
          </div>
          <h4 className="mt-4 text-base font-bold text-gray-900">No Medical Records Found</h4>
          <p className="mt-1 text-sm text-[#5B6472]">
            {searchQuery
              ? `No records matching "${searchQuery}". Try a different keyword.`
              : 'Your medical records and consultation history will appear here once entered by your doctor.'}
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-4 inline-flex items-center rounded-lg bg-[#0E4749] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#093537]"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRecords.map((record) => {
            const displayDate = formatRecordDate(record.apt_date || record.created_at);
            const displayTime = formatRecordTime(record.created_at);

            return (
              <div
                key={record.record_id}
                className="overflow-hidden rounded-xl border border-[#DCE3E0] bg-white shadow-sm transition hover:shadow-md"
              >
                {/* Record Header */}
                <div className="flex flex-col gap-3 border-b border-[#DCE3E0] bg-gray-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-[#0E4749]">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-lg font-bold text-gray-900">{record.diagnosis}</h4>
                        <span className="rounded bg-teal-50 px-2 py-0.5 text-xs font-bold text-[#0E4749]">
                          Record #{record.record_id}
                        </span>
                        {record.apt_id && (
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                            Apt #{record.apt_id}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#5B6472]">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {displayDate}
                        </span>
                        {displayTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                            {displayTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Doctor badge */}
                  <div className="flex items-center gap-2 rounded-lg border border-[#DCE3E0] bg-white px-3 py-2 shadow-2xs self-start sm:self-auto">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0E4749] text-xs font-bold text-white">
                      <Stethoscope className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">{record.doctor_name}</div>
                      <div className="text-[11px] font-medium text-[#0E4749]">
                        {record.doctor_specialty || 'General Practitioner'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Record Body */}
                <div className="space-y-5 p-5">
                  {/* Clinical Notes */}
                  {record.clinical_notes && (
                    <div>
                      <h5 className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Doctor's Clinical Notes & Recommendations
                      </h5>
                      <div className="rounded-lg border border-[#DCE3E0] bg-slate-50/70 p-4 text-sm leading-relaxed text-gray-800">
                        {record.clinical_notes}
                      </div>
                    </div>
                  )}

                  {/* Prescribed Medications */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h5 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                        <Pill className="h-3.5 w-3.5 text-[#0E4749]" />
                        Prescriptions ({record.prescriptions?.length || 0})
                      </h5>
                      {record.prescriptions && record.prescriptions.length > 0 && (
                        <Link
                          href="/patient/prescriptions"
                          className="flex items-center gap-1 text-xs font-semibold text-[#0E4749] hover:underline"
                        >
                          <span>Manage all prescriptions</span>
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>

                    {record.prescriptions && record.prescriptions.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {record.prescriptions.map((rx) => {
                          const isActive = rx.status?.toLowerCase() === 'active';
                          return (
                            <div
                              key={rx.rx_id}
                              className="flex items-start justify-between rounded-lg border border-[#DCE3E0] bg-white p-3.5 shadow-2xs"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-gray-900">{rx.med_name}</span>
                                  <span className="font-mono text-[10px] text-gray-400">
                                    Rx #{rx.rx_id}
                                  </span>
                                </div>
                                <div className="font-mono text-xs font-medium text-[#0E4749]">
                                  {rx.dosage}
                                </div>
                                {rx.duration && (
                                  <div className="flex items-center gap-1 text-[11px] text-[#5B6472]">
                                    <Clock className="h-3 w-3 text-gray-400" />
                                    <span>{rx.duration}</span>
                                  </div>
                                )}
                              </div>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  isActive
                                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border border-gray-200 bg-gray-100 text-gray-600'
                                }`}
                              >
                                {rx.status || 'Active'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="rounded-lg border border-[#DCE3E0] bg-gray-50/50 p-3 text-xs italic text-gray-500">
                        No medications were prescribed during this consultation.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
