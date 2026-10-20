"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { receptionistService, type RecepPatientRecord } from '@/services/receptionistService';

export default function ReceptionistPatientRecords() {
  const [patients, setPatients] = useState<RecepPatientRecord[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoading(true);
      receptionistService.getPatients(search)
        .then(setPatients)
        .catch(() => setError('Patient records could not be loaded.'))
        .finally(() => setIsLoading(false));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-sm font-semibold uppercase tracking-wide text-[#5B6472]">Patient directory</p><h2 className="mt-1 text-2xl font-bold text-[#0E4749]">Patient Records</h2></div>
        <Link href="/receptionist/book" className="inline-flex items-center gap-2 rounded-lg bg-[#0E4749] px-4 py-2.5 text-sm font-bold text-white"><UserPlus className="h-4 w-4" /> Register patient</Link>
      </header>
      <label className="relative block max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5B6472]" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by patient name" className="w-full rounded-lg border border-[#DCE3E0] bg-white py-3 pl-10 pr-4 text-sm focus:border-[#0E4749] focus:outline-none" />
      </label>
      {error && <p role="alert" className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
      <section className="overflow-x-auto rounded-xl border border-[#DCE3E0] bg-white">
        {isLoading ? <p className="p-5 text-sm text-[#5B6472]">Loading patient records…</p> : patients.length ? (
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-[#5B6472]"><tr><th className="p-4">Patient</th><th className="p-4">DOB</th><th className="p-4">Blood group</th><th className="p-4">Emergency contact</th><th className="p-4">Allergies</th><th className="p-4">Email</th></tr></thead>
            <tbody className="divide-y divide-[#DCE3E0]">
              {patients.map((patient) => <tr key={patient.patient_id}>
                <td className="p-4 font-semibold text-gray-900">{patient.first_name} {patient.last_name}<span className="block text-xs font-normal text-[#5B6472]">ID {patient.patient_id}</span></td>
                <td className="p-4">{patient.dob || 'Not provided'}</td>
                <td className="p-4">{patient.blood_group || 'Unknown'}</td>
                <td className="p-4">{patient.emergency_contact || 'Not provided'}</td>
                <td className="max-w-48 truncate p-4">{patient.allergies || 'Unknown'}</td>
                <td className="p-4">{patient.email}</td>
              </tr>)}
            </tbody>
          </table>
        ) : <p className="p-5 text-sm text-[#5B6472]">No matching patients found.</p>}
      </section>
    </div>
  );
}
