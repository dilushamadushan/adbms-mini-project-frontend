"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { PatientListItem } from '@/components/features/patients/PatientListItem';
import { nurseService, WardPatientItem } from '@/services/nurseService';
import { RefreshCw, Search, Users, AlertCircle, BedDouble } from 'lucide-react';

export default function NursePatientsList() {
  const [patients, setPatients] = useState<WardPatientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await nurseService.getWardPatients();
      setPatients(data);
    } catch (err: any) {
      console.error('Failed to load ward patients:', err);
      setError(err?.response?.data?.detail || 'Failed to fetch admitted patients.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.patient_name.toLowerCase().includes(q) ||
        (p.bed_number && p.bed_number.toLowerCase().includes(q)) ||
        (p.admission_reason && p.admission_reason.toLowerCase().includes(q))
    );
  }, [patients, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#0E4749] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#E07856]" /> Ward Admitted Inpatients
          </h2>
          <p className="text-xs text-[#5B6472]">
            Monitor all currently admitted patients across your assigned ward.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient or bed..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749]"
            />
          </div>
          <button
            onClick={fetchPatients}
            disabled={loading}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-white border border-[#DCE3E0] text-[#0E4749] hover:bg-gray-50 rounded-lg shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#DCE3E0] flex justify-between items-center bg-gray-50">
          <span className="text-xs font-bold text-[#5B6472] uppercase tracking-wider">
            {loading ? 'LOADING INPATIENTS...' : `${patients.length} ADMITTED PATIENTS IN WARD`}
          </span>
          <span className="text-xs text-teal-700 font-semibold bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
            Active Census
          </span>
        </div>

        {error && (
          <div className="p-6 text-center text-red-600 text-sm flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        {loading && !error && (
          <div className="p-12 text-center text-[#5B6472]">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0E4749] mx-auto mb-2" />
            <p className="font-semibold text-xs">Loading inpatient roster...</p>
          </div>
        )}

        {!loading && filteredPatients.length > 0 && (
          <div className="divide-y divide-[#DCE3E0]">
            {filteredPatients.map((patient) => {
              const bedTarget = patient.bed_id ? `/nurse/bed/${patient.bed_id}` : '#';
              return (
                <Link key={patient.admission_id} href={bedTarget} className="block hover:bg-gray-50/70 transition-colors">
                  <PatientListItem
                    name={patient.patient_name}
                    id={patient.bed_number ? `Bed ${patient.bed_number}` : 'No Bed'}
                    details={`${patient.ward_name} • Attending: ${patient.attending_doctor || 'Staff'}${
                      patient.admission_reason ? ` • ${patient.admission_reason}` : ''
                    }`}
                    status={patient.vitals_status === 'CRITICAL' ? 'Critical' : patient.vitals_status === 'MODERATE' ? 'Recovering' : 'Stable'}
                    date={patient.admitted_at ? new Date(patient.admitted_at).toLocaleDateString() : 'Active'}
                  />
                </Link>
              );
            })}
          </div>
        )}

        {!loading && !error && filteredPatients.length === 0 && (
          <div className="p-12 text-center text-[#5B6472]">
            <BedDouble className="w-8 h-8 text-[#0E4749] mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-sm">No admitted patients currently found in this ward.</p>
          </div>
        )}
      </div>
    </div>
  );
}
