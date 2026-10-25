"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BedDouble,
  CalendarDays,
  HeartPulse,
  Search,
  ShieldAlert,
} from "lucide-react";
import { doctorService, type CurrentAdmittedPatient } from "@/services/doctorService";

const FALLBACK_VALUE = "Not assigned yet";

function displayValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || String(value).trim() === "") {
    return FALLBACK_VALUE;
  }
  return String(value);
}

function formatAdmissionDate(value: string | null): string {
  if (!value) return FALLBACK_VALUE;
  const parsed = new Date(value.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Patients() {
  const [patients, setPatients] = useState<CurrentAdmittedPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  useEffect(() => {
    let active = true;
    doctorService
      .getCurrentAdmittedPatients()
      .then((response) => {
        if (active) setPatients(response.data);
      })
      .catch(() => {
        if (active) setError("Unable to load admitted patients from the server.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredPatients = useMemo(() => {
    const value = query.trim().toLowerCase();
    return patients.filter((patient) =>
      patient.patient_name.toLowerCase().includes(value)
    );
  }, [patients, query]);

  return (
    <div className="min-h-full bg-[#f4f9ff] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1220px] space-y-5">
        <header>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#164d69]">Patient List</h1>
          <p className="mt-1 text-sm text-[#7893a9]">View and manage your currently admitted patients.</p>
        </header>

        <section className="relative overflow-hidden rounded-2xl border border-[#d7edf1] bg-gradient-to-r from-white via-[#f5ffff] to-[#e3f5f7] px-6 py-5 shadow-[0_6px_22px_rgba(61,121,177,0.09)]">
          <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-[#d8f4f1]" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#d8f8f1] text-[#119a94]">
              <BedDouble className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#165b68]">Currently Admitted Patients</h2>
              <p className="mt-1 text-sm text-[#7893a9]">Total patients in hospital (Admitted status)</p>
            </div>
            <HeartPulse className="absolute right-10 h-20 w-20 text-[#56b8ba]/25" />
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#dcecf1] bg-white shadow-[0_6px_22px_rgba(61,121,177,0.08)]">
          <div className="border-b border-[#e6f0f3] p-4">
            <label className="relative block max-w-[430px]">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7396a5]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search patient by name..."
                className="h-12 w-full rounded-xl border border-[#d7e8ee] bg-[#fbfdfe] pl-12 pr-4 text-sm text-[#28516d] outline-none transition focus:border-[#13a4a5] focus:ring-4 focus:ring-[#13a4a5]/10"
              />
            </label>
          </div>
          <div className="overflow-x-auto">
            {loading && <p className="py-10 text-center text-sm text-[#7893a9]">Loading admitted patients...</p>}
            {error && <p className="py-10 text-center text-sm text-red-600">{error}</p>}
            <table className="w-full min-w-[1080px] text-left">
              <thead className="bg-[#eff8fb] text-[11px] font-bold uppercase tracking-wide text-[#527d91]">
                <tr>
                  <th className="px-5 py-3">Patient</th><th className="px-3 py-3">Age</th><th className="px-3 py-3">Gender</th><th className="px-3 py-3">Blood Group</th><th className="px-3 py-3">Allergies</th><th className="px-3 py-3">Ward</th><th className="px-3 py-3">Bed</th><th className="px-3 py-3">Admission Reason</th><th className="px-3 py-3">Admitted At</th><th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf3f5]">
                {!loading && !error && filteredPatients.map((patient, index) => {
                  const initials = patient.patient_name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
                  return (
                  <tr key={patient.admission_id} className="text-sm text-[#52758a] transition hover:bg-[#f8fcfd]">
                    <td className="px-5 py-3"><div className="flex items-center gap-3"><span className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-extrabold ${["bg-blue-100 text-blue-600", "bg-teal-100 text-teal-600", "bg-violet-100 text-violet-600", "bg-pink-100 text-pink-600"][index % 4]}`}>{initials}</span><div><p className="font-bold text-[#28516d]">{patient.patient_name}</p></div></div></td>
                    <td className="px-3 py-3">{displayValue(patient.age)}</td><td className="px-3 py-3">{displayValue(patient.gender)}</td><td className="px-3 py-3 font-semibold">{displayValue(patient.blood_group)}</td>
                    <td className="px-3 py-3"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${patient.allergies === "None" || patient.allergies === "None recorded" ? "bg-[#edf5f7] text-[#6f8c99]" : "bg-[#fff0f0] text-[#dc5960]"}`}><ShieldAlert className="h-3 w-3" />{displayValue(patient.allergies)}</span></td>
                    <td className="px-3 py-3">{displayValue(patient.ward_name)}</td><td className="px-3 py-3 font-semibold">{displayValue(patient.bed_number)}</td><td className="max-w-[150px] px-3 py-3">{displayValue(patient.admission_reason)}</td>
                    <td className="px-3 py-3 text-xs">{formatAdmissionDate(patient.admitted_at)}</td><td className="px-3 py-3"><span className="rounded-full bg-[#ddf8e8] px-2.5 py-1 text-[10px] font-bold text-[#15945e]">{displayValue(patient.status)}</span></td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
            {!loading && !error && filteredPatients.length === 0 && <p className="py-10 text-center text-sm text-[#7893a9]">No admitted patient found.</p>}
          </div>
          <div className="flex items-center gap-2 border-t border-[#edf3f5] px-5 py-3 text-xs text-[#7893a9]"><CalendarDays className="h-4 w-4 text-[#159da0]" /> Showing {filteredPatients.length} of {patients.length} admitted patients</div>
        </section>
      </div>
    </div>
  );
}
