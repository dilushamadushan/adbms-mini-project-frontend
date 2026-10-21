"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { BedCard } from '@/components/features/beds/BedCard';
import { 
  nurseService, 
  WardOverviewResponse, 
  DashboardStatsResponse, 
  WardBedItem,
  UnassignedAdmissionItem,
  AssignedWardItem
} from '@/services/nurseService';
import { 
  RefreshCw, BedDouble, AlertCircle, Sparkles, Filter, Clock, 
  Pill, ClipboardList, AlertTriangle, ChevronRight, UserCheck, 
  Search, Check, Package, X, UserPlus, ArrowRight, User
} from 'lucide-react';

export default function NurseWardOverview() {
  const [data, setData] = useState<WardOverviewResponse | null>(null);
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [unassignedPatients, setUnassignedPatients] = useState<UnassignedAdmissionItem[]>([]);
  const [selectedWardId, setSelectedWardId] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'Occupied' | 'Available' | 'Cleaning' | 'Critical'>('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [cleaningBedId, setCleaningBedId] = useState<number | null>(null);

  const [assignModalBed, setAssignModalBed] = useState<WardBedItem | null>(null);
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<number | null>(null);
  const [assigningLoading, setAssigningLoading] = useState(false);

  const fetchOverview = async (wardId?: number) => {
    setLoading(true);
    setError(null);
    const targetWard = wardId ?? selectedWardId;
    try {
      const [overviewRes, statsRes, unassignedRes] = await Promise.all([
        nurseService.getWardOverview(targetWard),
        nurseService.getDashboardStats(targetWard).catch(() => null),
        nurseService.getUnassignedPatients(targetWard).catch(() => []),
      ]);
      setData(overviewRes);
      setStats(statsRes);
      setUnassignedPatients(unassignedRes);
      if (overviewRes.ward_id) {
        setSelectedWardId(overviewRes.ward_id);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to connect to ward overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newWardId = parseInt(e.target.value);
    setSelectedWardId(newWardId);
    fetchOverview(newWardId);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setActiveQuery('');
  };

  const handleQuickClean = async (bedId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCleaningBedId(bedId);
    setError(null);
    setSuccessMsg(null);
    try {
      await nurseService.updateBedStatus(bedId, 'Available');
      setSuccessMsg(`Bed status successfully updated to Available! Ready for patient admission.`);
      await fetchOverview();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to update bed status.');
    } finally {
      setCleaningBedId(null);
    }
  };

  const handleOpenAssignModal = (bed: WardBedItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAssignModalBed(bed);
    if (unassignedPatients.length > 0) {
      setSelectedAdmissionId(unassignedPatients[0].admission_id);
    } else {
      setSelectedAdmissionId(null);
    }
  };

  const handleConfirmAssignment = async () => {
    if (!assignModalBed || !selectedAdmissionId) return;
    setAssigningLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await nurseService.assignPatientToBed(assignModalBed.bed_id, selectedAdmissionId);
      setSuccessMsg(`Patient successfully allocated to Bed ${assignModalBed.bed_number}!`);
      setAssignModalBed(null);
      await fetchOverview();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to allocate patient to bed.');
    } finally {
      setAssigningLoading(false);
    }
  };

  const criticalBedsCount = useMemo(() => {
    if (!data?.beds) return 0;
    return data.beds.filter(b => b.vitals_status === 'CRITICAL').length;
  }, [data]);

  const filteredBeds = useMemo(() => {
    if (!data?.beds) return [];
    return data.beds.filter((b) => {
      let matchesStatus = true;
      if (filter === 'Occupied') matchesStatus = b.bed_status === 'Occupied';
      else if (filter === 'Available') matchesStatus = b.bed_status === 'Available';
      else if (filter === 'Cleaning') matchesStatus = b.bed_status === 'Cleaning';
      else if (filter === 'Critical') matchesStatus = b.vitals_status === 'CRITICAL';

      let matchesSearch = true;
      if (activeQuery) {
        const q = activeQuery.toLowerCase();
        const bedNum = b.bed_number.toLowerCase();
        const patient = (b.patient_name || '').toLowerCase();
        const doctor = (b.attending_doctor_name || '').toLowerCase();
        const reason = (b.admission_reason || '').toLowerCase();
        matchesSearch = bedNum.includes(q) || patient.includes(q) || doctor.includes(q) || reason.includes(q);
      }

      return matchesStatus && matchesSearch;
    });
  }, [data, filter, activeQuery]);

  return (
    <div className="space-y-6">
      <div className="bg-[#0E4749] text-white p-6 rounded-xl relative overflow-hidden shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-teal-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <BedDouble className="w-4 h-4 text-[#E07856]" />
              Assigned Ward Station:
            </span>

            <select
              value={selectedWardId}
              onChange={handleWardChange}
              className="bg-teal-900/90 text-white font-bold text-xs px-3 py-1.5 rounded-lg border border-teal-600 focus:outline-none focus:ring-2 focus:ring-[#E07856] cursor-pointer"
            >
              {data?.assigned_wards && data.assigned_wards.length > 0 ? (
                data.assigned_wards.map((w: AssignedWardItem) => (
                  <option key={w.ward_id} value={w.ward_id}>
                    {w.ward_name} (Ward #{w.ward_id} • {w.total_beds} Beds)
                  </option>
                ))
              ) : (
                <option value={data?.ward_id || 1}>
                  {data?.ward_name || 'Cardiology Care Ward'} (Ward #{data?.ward_id || 1})
                </option>
              )}
            </select>

            <span className="bg-teal-800/90 text-teal-100 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-teal-700/60 flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#E07856]" /> Shift: {stats?.active_shift || 'Active Shift'}
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            {data ? (
              <>
                <span className="text-white">{data.occupied_beds} Occupied</span>
                <span className="text-teal-300 mx-2">•</span>
                <span className="text-emerald-300">{data.available_beds} Available</span>
                {data.cleaning_beds > 0 && (
                  <>
                    <span className="text-teal-300 mx-2">•</span>
                    <span className="text-amber-300">{data.cleaning_beds} Cleaning</span>
                  </>
                )}
              </>
            ) : (
              'Loading Ward Census...'
            )}
          </h1>

          <div className="flex items-center gap-3 text-xs text-teal-200">
            <span>Occupancy Rate: <strong className="text-white">{data?.occupancy_rate ?? 0}%</strong></span>
            <span>•</span>
            <span>Total Bed Capacity: <strong className="text-white">{data?.total_beds ?? 10} Beds</strong></span>
            <span>•</span>
            <span>Active Census: <strong className="text-white">{data?.beds?.length ?? 0} Beds Mapped</strong></span>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2">
          <Link
            href="/nurse/handover"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#E07856] hover:bg-[#d06846] text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <UserCheck className="w-4 h-4" /> Shift Handover Protocol
          </Link>
          <Link
            href="/nurse/inventory"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-teal-800 hover:bg-teal-700 text-teal-100 rounded-lg text-xs font-semibold transition-all border border-teal-700 shadow-sm"
          >
            <Package className="w-3.5 h-3.5 text-[#E07856]" /> Ward Stock
          </Link>
          <button
            onClick={() => fetchOverview()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-teal-800/80 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-all border border-teal-700 shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-teal-800 to-transparent opacity-40 pointer-events-none" />
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold shadow-sm">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900 text-xs">Dismiss</button>
        </div>
      )}

      {unassignedPatients.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-teal-50 border-2 border-teal-400 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-teal-600 text-white flex-shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-[#0E4749]">Incoming Inpatients Awaiting Bed Allocation:</span>{' '}
              <span className="text-xs text-gray-700 font-medium block sm:inline">
                {unassignedPatients.length} patient(s) admitted to this ward. Assign them to an available bed below.
              </span>
              <div className="flex flex-wrap gap-2 mt-1">
                {unassignedPatients.map(p => (
                  <span key={p.admission_id} className="text-[11px] bg-white px-2 py-0.5 rounded border border-teal-300 text-gray-800 font-semibold">
                    {p.patient_name} ({p.admission_reason || 'Admitted'})
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => setFilter('Available')}
            className="text-xs font-bold bg-[#0E4749] text-white px-3.5 py-2 rounded-lg hover:bg-[#093233] transition shadow flex items-center gap-1.5 flex-shrink-0"
          >
            Show Available Beds <ArrowRight className="w-3.5 h-3.5 text-[#E07856]" />
          </button>
        </div>
      )}

      {(criticalBedsCount > 0 || (stats && stats.critical_patients_count > 0)) && (
        <div className="bg-red-50 border-2 border-red-300 p-4 rounded-xl flex items-center justify-between gap-3 text-red-900 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-100 text-red-600 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-red-700">EMERGENCY CLINICAL ALERT:</span>{' '}
              <span className="text-xs text-red-900 font-medium">
                {criticalBedsCount || stats?.critical_patients_count} patient in this ward recorded critical vitals (SpO2 &lt; 92% or abnormal pulse/BP threshold). Review Bed CCW-106 immediately.
              </span>
            </div>
          </div>
          <button
            onClick={() => setFilter('Critical')}
            className="text-xs font-bold bg-red-600 text-white px-3.5 py-2 rounded-lg hover:bg-red-700 transition shadow flex items-center gap-1.5 flex-shrink-0"
          >
            Filter Critical Beds <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-1 flex items-center gap-1">
              <Pill className="w-3.5 h-3.5 text-[#0E4749]" /> Medications Due (MAR)
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats?.medications_due_count ?? 3} Active Prescriptions</div>
            <div className="text-[11px] text-[#5B6472] mt-0.5">Scheduled for administration today</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-1 flex items-center gap-1">
              <ClipboardList className="w-3.5 h-3.5 text-[#0E4749]" /> Doctor Orders Pending
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats?.pending_orders_count ?? 4} Orders Awaiting</div>
            <div className="text-[11px] text-[#5B6472] mt-0.5">Diet, lab samples, IV fluid adjustments</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#0E4749]" /> Current Shift Info
            </div>
            <div className="text-base font-bold text-gray-900 truncate">{stats?.active_shift || 'Active Shift'}</div>
            <div className="text-[11px] text-teal-700 font-semibold mt-0.5">Nurse Sarah Connor in charge</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#DCE3E0] shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-[#5B6472] flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-[#0E4749]" /> View:
          </span>

          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'ALL'
                ? 'bg-[#0E4749] text-white shadow-sm'
                : 'bg-gray-100 text-[#5B6472] hover:bg-gray-200'
            }`}
          >
            All Beds ({data?.beds?.length || 10})
          </button>

          <button
            onClick={() => setFilter('Occupied')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'Occupied'
                ? 'bg-[#0E4749] text-white shadow-sm'
                : 'bg-gray-100 text-[#5B6472] hover:bg-gray-200'
            }`}
          >
            Occupied ({data?.beds?.filter(b => b.bed_status === 'Occupied').length || 0})
          </button>

          <button
            onClick={() => setFilter('Available')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'Available'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-gray-100 text-[#5B6472] hover:bg-gray-200'
            }`}
          >
            Available ({data?.beds?.filter(b => b.bed_status === 'Available').length || 0})
          </button>

          <button
            onClick={() => setFilter('Cleaning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'Cleaning'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-gray-100 text-[#5B6472] hover:bg-gray-200'
            }`}
          >
            Cleaning ({data?.beds?.filter(b => b.bed_status === 'Cleaning').length || 0})
          </button>

          {criticalBedsCount > 0 && (
            <button
              onClick={() => setFilter('Critical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                filter === 'Critical'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              Critical ({criticalBedsCount})
            </button>
          )}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-[#5B6472] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search bed, patient, diagnosis..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-8 pr-7 py-1.5 text-xs border border-[#DCE3E0] rounded-lg w-full focus:outline-none focus:border-[#0E4749] text-gray-800"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="bg-[#0E4749] hover:bg-[#093233] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1"
          >
            <Search className="w-3 h-3" /> Search
          </button>
        </form>
      </div>

      {activeQuery && (
        <div className="flex items-center justify-between text-xs text-[#5B6472] bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
          <span>Found <strong>{filteredBeds.length}</strong> bed(s) matching search <em>"{activeQuery}"</em></span>
          <button onClick={handleClearSearch} className="text-[#0E4749] font-bold underline">Clear Search</button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => fetchOverview()} className="ml-auto underline font-semibold">Try Again</button>
        </div>
      )}

      {loading && !data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="h-44 bg-gray-200/70 animate-pulse rounded-xl border border-[#DCE3E0]" />
          ))}
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredBeds.map((bed) => (
            <BedCard
              key={bed.bed_id}
              bed={bed}
              onQuickClean={handleQuickClean}
              onOpenAssignModal={handleOpenAssignModal}
              cleaningLoading={cleaningBedId === bed.bed_id}
            />
          ))}
        </div>
      )}

      {data && filteredBeds.length === 0 && (
        <div className="bg-white border border-[#DCE3E0] rounded-xl p-12 text-center text-[#5B6472]">
          <Sparkles className="w-8 h-8 text-[#0E4749] mx-auto mb-2 opacity-50" />
          <p className="font-semibold text-sm">No beds found matching the filter "{filter}".</p>
          {(activeQuery || filter !== 'ALL') && (
            <button
              onClick={() => { handleClearSearch(); setFilter('ALL'); }}
              className="mt-2 text-xs font-bold text-[#0E4749] underline"
            >
              Reset filters and search
            </button>
          )}
        </div>
      )}

      {assignModalBed && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#DCE3E0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3E0]">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#0E4749]" />
                <h3 className="font-bold text-base text-[#0E4749]">
                  Assign Inpatient to Bed {assignModalBed.bed_number}
                </h3>
              </div>
              <button
                onClick={() => setAssignModalBed(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#5B6472]">
              Select an admitted patient waiting for ward bed placement:
            </p>

            {unassignedPatients.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-[#5B6472]">
                No admitted patients currently awaiting bed placement in this ward.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {unassignedPatients.map((p) => (
                  <label
                    key={p.admission_id}
                    className={`block p-3 rounded-xl border cursor-pointer transition ${
                      selectedAdmissionId === p.admission_id
                        ? 'border-[#0E4749] bg-teal-50/50 shadow-xs ring-1 ring-[#0E4749]'
                        : 'border-[#DCE3E0] hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="assignedPatient"
                          checked={selectedAdmissionId === p.admission_id}
                          onChange={() => setSelectedAdmissionId(p.admission_id)}
                          className="text-[#0E4749] focus:ring-[#0E4749]"
                        />
                        <span className="font-bold text-sm text-gray-900">{p.patient_name}</span>
                      </div>
                      <span className="text-[11px] text-[#5B6472]">{p.gender}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1 pl-5">
                      <em>&ldquo;{p.admission_reason}&rdquo;</em>
                    </div>
                    <div className="text-[10px] text-[#5B6472] mt-1 pl-5 flex items-center justify-between">
                      <span>Doctor: {p.attending_doctor_name || 'Staff Doctor'}</span>
                      {p.blood_group && <span className="font-bold text-red-600">{p.blood_group}</span>}
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE3E0]">
              <button
                type="button"
                onClick={() => setAssignModalBed(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-[#5B6472] hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={assigningLoading || !selectedAdmissionId}
                onClick={handleConfirmAssignment}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0E4749] hover:bg-[#093233] text-white transition disabled:opacity-50 shadow flex items-center gap-1.5"
              >
                {assigningLoading ? 'Allocating Bed...' : `Confirm Placement in ${assignModalBed.bed_number}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
