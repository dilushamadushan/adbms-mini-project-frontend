"use client";

import Link from "next/link";
import { CalendarDays, ChevronRight, Eye, Search, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { useEffect } from "react";
import { doctorService, type LabOrderPatient } from "@/services/doctorService";

export default function DoctorPatientSearch() {
  const [patients, setPatients] = useState<LabOrderPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState<"All" | "Male" | "Female">("All");
  const [dateFilter, setDateFilter] = useState("All Dates");
  useEffect(() => {
    doctorService.getLabOrderPatients()
      .then((response) => setPatients(response.data))
      .catch(() => setError("Unable to load patients from the server."))
      .finally(() => setLoading(false));
  }, []);

  const dateOptions = useMemo(
    () => ["All Dates", ...Array.from(new Set(patients.map((patient) => patient.appointment_date.slice(0, 4))))],
    [patients],
  );
  const latestPatientAppointments = useMemo(() => {
    const latest = new Map<number, LabOrderPatient>();
    patients.forEach((patient) => {
      if (!latest.has(patient.patient_id)) latest.set(patient.patient_id, patient);
    });
    return Array.from(latest.values());
  }, [patients]);
  const filteredPatients = useMemo(() => {
    const value = query.trim().toLowerCase();
    return latestPatientAppointments.filter((patient) => {
      const matchesSearch = !value || patient.patient_name.toLowerCase().includes(value);
      const matchesGender = gender === "All" || patient.gender === gender;
      const matchesDate = dateFilter === "All Dates" || patient.appointment_date.startsWith(dateFilter);
      return matchesSearch && matchesGender && matchesDate;
    });
  }, [dateFilter, gender, latestPatientAppointments, query]);

  const tone = (index: number) => ["bg-blue-100 text-blue-600", "bg-teal-100 text-teal-600", "bg-violet-100 text-violet-600", "bg-pink-100 text-pink-600"][index % 4];

  return (
    <div className="min-h-full bg-[#f4f9ff] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1220px] space-y-5">
        <section className="relative overflow-hidden rounded-2xl border border-[#e5effa] bg-white px-6 py-5 shadow-[0_4px_18px_rgba(61,121,177,0.08)]">
          <div className="absolute -right-8 -top-16 h-44 w-44 rounded-full bg-[#edf6ff]" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f2ff] text-[#1976ed]"><UsersRound className="h-8 w-8" strokeWidth={1.8} /></div>
            <div><h1 className="text-xl font-bold text-[#183b69]">Lab Orders</h1></div>
          </div>
        </section>
        <section className="rounded-2xl border border-[#e5effa] bg-white p-5 shadow-[0_4px_18px_rgba(61,121,177,0.08)]">
          <div className="flex flex-col gap-3 md:flex-row">
            <label className="relative flex-1"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6680a0]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or patient ID..." className="h-12 w-full rounded-xl border border-[#d9e6f3] pl-12 pr-4 text-sm text-[#294b73] outline-none focus:border-[#1976ed] focus:ring-4 focus:ring-[#1976ed]/10" /></label>
            <label className="relative">
              <select value={gender} onChange={(event) => setGender(event.target.value as "All" | "Male" | "Female")} className="h-12 appearance-none rounded-xl border border-[#d9e6f3] bg-white px-6 pr-10 text-sm font-semibold text-[#294b73] outline-none focus:border-[#1976ed]">
                <option value="All">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6680a0]">⌄</span>
            </label>
            <label className="relative">
              <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1976ed]" />
              <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="h-12 appearance-none rounded-xl border border-[#d9e6f3] bg-white pl-11 pr-10 text-sm font-semibold text-[#294b73] outline-none focus:border-[#1976ed]">
                {dateOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6680a0]">⌄</span>
            </label>
          </div>
        </section>
        <section className="rounded-2xl border border-[#e5effa] bg-white p-5 shadow-[0_4px_18px_rgba(61,121,177,0.08)]">
          <div className="mb-5"><h2 className="text-lg font-bold text-[#183b69]">Search for a Patient</h2></div>
          <div className="overflow-x-auto rounded-xl border border-[#dce9f6]">
            <div className="min-w-[920px]">
              <div className="grid grid-cols-[52px_1.45fr_1fr_0.7fr_0.8fr_0.9fr_1.2fr_1.2fr_120px_24px] items-center bg-[#eff6ff] px-4 py-3 text-xs font-bold text-[#375b85]"><span>#</span><span>Patient Name</span><span>Patient ID</span><span>Age</span><span>Gender</span><span>Blood Group</span><span>Phone</span><span>Last Visit</span><span>Action</span><span /></div>
              {loading && <div className="border-t border-[#e5effa] px-5 py-8 text-center text-sm text-[#6680a0]">Loading patients...</div>}
              {error && <div className="border-t border-[#e5effa] px-5 py-8 text-center text-sm text-red-600">{error}</div>}
              {!loading && !error && filteredPatients.map((patient, index) => {
                const initials = patient.patient_name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
                const params = new URLSearchParams({ patientId: String(patient.patient_id), patientName: patient.patient_name, age: String(patient.age ?? ""), bloodGroup: patient.blood_group ?? "", allergies: patient.allergies ?? "None", appointmentId: String(patient.appointment_id), appointmentDate: patient.appointment_date, appointmentStatus: patient.appointment_status });
                return <div key={`${patient.patient_id}-${patient.appointment_id}`} className="grid grid-cols-[52px_1.45fr_1fr_0.7fr_0.8fr_0.9fr_1.2fr_1.2fr_120px_24px] items-center border-t border-[#e5effa] px-4 py-3 text-sm"><span className="text-[#375b85]">{index + 1}</span><span className="flex items-center gap-3 font-semibold text-[#294b73]"><span className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${tone(index)}`}>{initials}</span>{patient.patient_name}</span><span className="text-[#6680a0]">{patient.patient_id}</span><span className="text-[#6680a0]">{patient.age ?? "—"}</span><span className="text-[#6680a0]">{patient.gender ?? "—"}</span><span><span className="rounded-full bg-[#ffe5ee] px-3 py-1 text-xs font-bold text-[#e3547d]">{patient.blood_group ?? "—"}</span></span><span className="text-[#6680a0]">—</span><span className="text-[#6680a0]">{patient.appointment_date}</span><Link href={`/doctor/labs?${params.toString()}`} className="inline-flex w-fit items-center gap-2 rounded-full border border-[#cfe2f8] px-4 py-2 text-xs font-bold text-[#1976ed] transition hover:bg-[#edf6ff]"><Eye className="h-4 w-4" /> View</Link><ChevronRight className="h-5 w-5 text-[#7893b0]" /></div>;
              })}
            </div>
          </div>
          <p className="mt-4 text-sm font-medium text-[#6680a0]">Showing {filteredPatients.length} of {latestPatientAppointments.length} patients</p>
        </section>
      </div>
    </div>
  );
}
