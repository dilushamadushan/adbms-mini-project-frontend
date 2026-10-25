"use client";

import Link from "next/link";
import { BedDouble, CalendarDays, ChevronRight, Eye, Search, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DoctorPatientSearch() {
  const [patients, setPatients] = useState<CurrentAdmittedPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState<"All" | "Male" | "Female">("All");
  const [dateFilter, setDateFilter] = useState("All Dates");

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

  const dateOptions = useMemo(
    () => [
      "All Dates",
      ...Array.from(
        new Set(
          patients
            .map((patient) => patient.admitted_at?.slice(0, 4))
            .filter((year): year is string => Boolean(year))
        )
      ),
    ],
    [patients]
  );

  const filteredPatients = useMemo(() => {
    const value = query.trim().toLowerCase();
    return patients.filter((patient) => {
      const matchesSearch =
        !value ||
        patient.patient_name.toLowerCase().includes(value) ||
        displayValue(patient.ward_name).toLowerCase().includes(value);
      const matchesGender = gender === "All" || patient.gender === gender;
      const matchesDate =
        dateFilter === "All Dates" || patient.admitted_at?.startsWith(dateFilter);
      return matchesSearch && matchesGender && matchesDate;
    });
  }, [dateFilter, gender, patients, query]);

  const tone = (index: number) =>
    ["bg-blue-100 text-blue-600", "bg-teal-100 text-teal-600", "bg-violet-100 text-violet-600", "bg-pink-100 text-pink-600"][index % 4];

  return (
    <div className="min-h-full bg-[#f4f9ff] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1220px] space-y-5">
        <section className="relative overflow-hidden rounded-2xl border border-[#e5effa] bg-white px-6 py-5 shadow-[0_4px_18px_rgba(61,121,177,0.08)]">
          <div className="absolute -right-8 -top-16 h-44 w-44 rounded-full bg-[#edf6ff]" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f2ff] text-[#1976ed]">
              <UsersRound className="h-8 w-8" strokeWidth={1.8} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#183b69]">Currently Admitted Patients</h1>
              <p className="mt-1 text-sm text-[#6680a0]">Live patients with an active admitted status</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#e5effa] bg-white p-5 shadow-[0_4px_18px_rgba(61,121,177,0.08)]">
          <div className="flex flex-col gap-3 md:flex-row">
            <label className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6680a0]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by patient or ward..."
                className="h-12 w-full rounded-xl border border-[#d9e6f3] pl-12 pr-4 text-sm text-[#294b73] outline-none focus:border-[#1976ed] focus:ring-4 focus:ring-[#1976ed]/10"
              />
            </label>
            <label className="relative">
              <select value={gender} onChange={(event) => setGender(event.target.value as "All" | "Male" | "Female")} className="h-12 appearance-none rounded-xl border border-[#d9e6f3] bg-white px-6 pr-10 text-sm font-semibold text-[#294b73] outline-none focus:border-[#1976ed]">
                <option value="All">All genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>
            <label className="relative">
              <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1976ed]" />
              <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="h-12 appearance-none rounded-xl border border-[#d9e6f3] bg-white pl-11 pr-10 text-sm font-semibold text-[#294b73] outline-none focus:border-[#1976ed]">
                {dateOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-[#e5effa] bg-white p-5 shadow-[0_4px_18px_rgba(61,121,177,0.08)]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#183b69]">Admitted Patient List</h2>
            <span className="rounded-full bg-[#e8f2ff] px-3 py-1 text-xs font-bold text-[#1976ed]">{filteredPatients.length} patients</span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-[#dce9f6]">
            <div className="min-w-[1280px]">
              <div className="grid grid-cols-[52px_1.35fr_0.65fr_0.75fr_1fr_1.1fr_1.35fr_1.35fr_1fr_0.85fr_120px] items-center bg-[#eff6ff] px-4 py-3 text-xs font-bold text-[#375b85]">
                <span>#</span><span>Patient Name</span><span>Age</span><span>Gender</span><span>Blood Group</span><span>Allergies</span><span>Ward</span><span>Admission Reason</span><span>Admitted</span><span>Status</span><span>Action</span>
              </div>
              {loading && <div className="border-t border-[#e5effa] px-5 py-8 text-center text-sm text-[#6680a0]">Loading admitted patients...</div>}
              {error && <div className="border-t border-[#e5effa] px-5 py-8 text-center text-sm text-red-600">{error}</div>}
              {!loading && !error && filteredPatients.length === 0 && <div className="border-t border-[#e5effa] px-5 py-8 text-center text-sm text-[#6680a0]">No currently admitted patients found.</div>}
              {!loading && !error && filteredPatients.map((patient, index) => {
                const initials = patient.patient_name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <div key={patient.admission_id} className="grid grid-cols-[52px_1.35fr_0.65fr_0.75fr_1fr_1.1fr_1.35fr_1.35fr_1fr_0.85fr_120px] items-center border-t border-[#e5effa] px-4 py-3 text-sm">
                    <span className="text-[#375b85]">{index + 1}</span>
                    <span className="flex items-center gap-3 font-semibold text-[#294b73]"><span className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${tone(index)}`}>{initials}</span>{patient.patient_name}</span>
                    <span className="text-[#6680a0]">{displayValue(patient.age)}</span>
                    <span className="text-[#6680a0]">{displayValue(patient.gender)}</span>
                    <span><span className="rounded-full bg-[#ffe5ee] px-3 py-1 text-xs font-bold text-[#e3547d]">{displayValue(patient.blood_group)}</span></span>
                    <span className="text-[#6680a0]">{displayValue(patient.allergies)}</span>
                    <span className="flex items-center gap-1.5 text-[#6680a0]"><BedDouble className="h-4 w-4 text-[#1976ed]" />{displayValue(patient.ward_name)}<span className="text-xs">({displayValue(patient.bed_number)})</span></span>
                    <span className="max-w-[180px] truncate text-[#6680a0]" title={displayValue(patient.admission_reason)}>{displayValue(patient.admission_reason)}</span>
                    <span className="text-[#6680a0]">{formatAdmissionDate(patient.admitted_at)}</span>
                    <span className="w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{displayValue(patient.status)}</span>
                    <Link href={`/doctor/patients/${patient.patient_id}`} className="inline-flex w-fit items-center gap-2 rounded-full border border-[#cfe2f8] px-4 py-2 text-xs font-bold text-[#1976ed] transition hover:bg-[#edf6ff]"><Eye className="h-4 w-4" /> View <ChevronRight className="h-4 w-4" /></Link>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="mt-4 text-sm font-medium text-[#6680a0]">Showing {filteredPatients.length} currently admitted patients</p>
        </section>
      </div>
    </div>
  );
}
