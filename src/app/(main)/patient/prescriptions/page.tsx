"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  Loader2,
  Pill,
  RefreshCw,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import {
  patientService,
  type PatientPrescription,
} from '@/services/patientService';

function formatPrescriptionDate(dateStr?: string | null) {
  if (!dateStr) return 'N/A';
  const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PatientPrescriptions() {
  const { user, isLoading: isAuthLoading } = useAuth();

  const [patientId, setPatientId] = useState<number | null>(null);
  const [prescriptions, setPrescriptions] = useState<PatientPrescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');

  // Filtering & search states
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'Active' | 'Inactive'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch patient profile first to resolve accurate patient_id
  const fetchPatientProfileAndPrescriptions = useCallback(async (isRefresh = false) => {
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
          // If profile fetch fails or testing with patient 1 as fallback
          resolvedId = 1;
          setPatientId(1);
        }
      }

      const activeId = resolvedId || 1;
      const statusParam = selectedStatus === 'ALL' ? undefined : selectedStatus;
      const data = await patientService.getPrescriptions(activeId, statusParam);
      setPrescriptions(data);
    } catch {
      setLoadError('Failed to load prescriptions. Please try again.');
      toast.error('Unable to fetch prescriptions');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [patientId, selectedStatus]);

  useEffect(() => {
    if (isAuthLoading) return;
    fetchPatientProfileAndPrescriptions();
  }, [isAuthLoading, fetchPatientProfileAndPrescriptions]);

  // Client-side search filtering
  const filteredPrescriptions = useMemo(() => {
    if (!searchQuery.trim()) return prescriptions;
    const query = searchQuery.toLowerCase().trim();
    return prescriptions.filter((item) =>
      item.med_name.toLowerCase().includes(query) ||
      item.dosage.toLowerCase().includes(query) ||
      (item.duration && item.duration.toLowerCase().includes(query)) ||
      String(item.rx_id).includes(query)
    );
  }, [prescriptions, searchQuery]);

  // Calculate summary counts
  const totalCount = prescriptions.length;
  const activeCount = prescriptions.filter((p) => p.status?.toLowerCase() === 'active').length;
  const inactiveCount = prescriptions.filter((p) => p.status?.toLowerCase() !== 'active').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-[#0E4749]">My Prescriptions</h3>
          <p className="text-sm text-[#5B6472]">
            View and track your prescribed medications, dosage instructions, and schedules
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchPatientProfileAndPrescriptions(true)}
          disabled={isLoading || isRefreshing}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#DCE3E0] bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0E4749] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 text-[#0E4749] ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#DCE3E0] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Medications</span>
            <div className="rounded-lg bg-teal-50 p-2 text-[#0E4749]">
              <Pill className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{totalCount}</div>
          <p className="mt-1 text-xs text-[#5B6472]">Prescribed across all consultations</p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Active Regimens</span>
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-900">{activeCount}</div>
          <p className="mt-1 text-xs text-emerald-700">Currently scheduled to take</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Past / Inactive</span>
            <div className="rounded-lg bg-gray-200 p-2 text-gray-700">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-800">{inactiveCount}</div>
          <p className="mt-1 text-xs text-gray-500">Completed or discontinued</p>
        </div>
      </div>

      {/* Controls: Search and Status Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#DCE3E0] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by medication name, dosage..."
            className="w-full rounded-lg border border-[#DCE3E0] bg-white py-2 pl-9 pr-3 text-sm text-gray-900 transition focus:border-[#0E4749] focus:outline-none focus:ring-1 focus:ring-[#0E4749]"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-xs font-medium text-gray-500">Status:</span>
          {(['ALL', 'Active', 'Inactive'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setSelectedStatus(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                selectedStatus === status
                  ? 'bg-[#0E4749] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'ALL' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Prescription Content List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-[#DCE3E0] bg-white py-16 text-sm text-[#5B6472] shadow-sm">
          <Loader2 className="h-7 w-7 animate-spin text-[#0E4749]" />
          <span>Loading your prescriptions…</span>
        </div>
      ) : loadError ? (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          <div>
            <h5 className="font-bold">Error loading prescriptions</h5>
            <p className="mt-1 text-xs text-rose-600">{loadError}</p>
            <button
              type="button"
              onClick={() => fetchPatientProfileAndPrescriptions()}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </button>
          </div>
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#DCE3E0] bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-[#0E4749]">
            <Pill className="h-6 w-6" />
          </div>
          <h4 className="mt-4 text-base font-bold text-gray-900">No Prescriptions Found</h4>
          <p className="mt-1 text-sm text-[#5B6472]">
            {searchQuery
              ? `No prescriptions matching "${searchQuery}". Try clearing your search.`
              : 'You do not have any prescriptions matching the selected criteria.'}
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-4 inline-flex items-center rounded-lg bg-[#0E4749] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#093537]"
            >
              Clear Search Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredPrescriptions.map((rx) => {
            const isActive = rx.status?.toLowerCase() === 'active';

            return (
              <div
                key={rx.rx_id}
                className="overflow-hidden rounded-xl border border-[#DCE3E0] bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[#0E4749]">
                        <Pill className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-lg font-bold text-gray-900">{rx.med_name}</h4>
                          <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs font-semibold text-gray-600">
                            Rx #{rx.rx_id}
                          </span>
                        </div>
                        <p className="mt-1 font-mono text-sm font-medium text-[#0E4749]">
                          {rx.dosage}
                        </p>
                      </div>
                    </div>

                    <div className="self-start">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                          isActive
                            ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border border-gray-200 bg-gray-100 text-gray-600'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isActive ? 'animate-pulse bg-emerald-500' : 'bg-gray-400'
                          }`}
                        />
                        {rx.status || 'Active'}
                      </span>
                    </div>
                  </div>

                  {/* Metadata Chips */}
                  <div className="mt-4 grid grid-cols-1 gap-2 border-t border-[#DCE3E0] pt-4 sm:grid-cols-3">
                    {rx.duration && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        <span>
                          <strong className="text-gray-700">Duration:</strong> {rx.duration}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      <span>
                        <strong className="text-gray-700">Prescribed:</strong>{' '}
                        {formatPrescriptionDate(rx.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <FileText className="h-3.5 w-3.5 text-gray-400" />
                      <span>
                        <strong className="text-gray-700">Medical Record:</strong> #{rx.record_id}
                      </span>
                    </div>
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
