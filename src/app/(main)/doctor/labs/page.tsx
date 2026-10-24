"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { doctorService, type PatientLabResult } from "@/services/doctorService";
import {
  Activity,
  Beaker,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock3,
  Droplets,
  FlaskConical,
  HeartPulse,
  TestTube2,
  UserRound,
  X,
} from "lucide-react";

type LabStatus = "Pending" | "Completed";

type LabResult = {
  id: number;
  test: string;
  date: string;
  status: LabStatus;
  result: string;
};

type Patient = {
  id: string;
  name: string;
  age: number;
  bloodGroup: string;
  allergies: string;
  appointmentId: string;
  appointmentDate: string;
  appointmentStatus: string;
};

const TEST_OPTIONS = [
  { value: "Blood Test", icon: Droplets, color: "text-rose-500 bg-rose-50" },
  { value: "Urine Test", icon: TestTube2, color: "text-blue-500 bg-blue-50" },
  { value: "X-Ray", icon: FlaskConical, color: "text-violet-500 bg-violet-50" },
  { value: "ECG", icon: HeartPulse, color: "text-teal-500 bg-teal-50" },
  { value: "Lipid Panel", icon: Droplets, color: "text-rose-500 bg-rose-50" },
  { value: "Thyroid Function Test", icon: FlaskConical, color: "text-violet-500 bg-violet-50" },
];

function testOption(test: string) {
  return TEST_OPTIONS.find((option) => option.value === test) ?? TEST_OPTIONS[0];
}

function formatLabDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function mapLabResult(result: PatientLabResult): LabResult {
  return {
    id: result.lab_id,
    test: result.test_type,
    date: formatLabDate(result.ordered_at),
    status: result.status.toLowerCase() === "completed" ? "Completed" : "Pending",
    result: result.result || "Waiting...",
  };
}

function formatCurrentDate() {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());
}

export default function DoctorLabs() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const selectedPatient = useMemo<Patient>(() => {
    return {
      id: searchParams.get("patientId") ?? "—",
      name: searchParams.get("patientName") ?? "Selected patient",
      age: Number(searchParams.get("age")) || 0,
      bloodGroup: searchParams.get("bloodGroup") ?? "—",
      allergies: searchParams.get("allergies") ?? "None",
      appointmentId: searchParams.get("appointmentId") ?? "—",
      appointmentDate: searchParams.get("appointmentDate") ?? "—",
      appointmentStatus: searchParams.get("appointmentStatus") ?? "—",
    };
  }, [searchParams]);
  const [selectedTest, setSelectedTest] = useState("Blood Test");
  const [results, setResults] = useState<LabResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const patientId = Number(selectedPatient.id);
    if (!patientId) {
      return;
    }

    doctorService.getPatientLabResults(patientId)
      .then((response) => setResults(response.data.map(mapLabResult)))
      .catch(() => setNotice("Unable to load this patient's lab results."))
      .finally(() => setLoadingResults(false));
  }, [selectedPatient.id]);

  const saveOrder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowConfirmation(true);
  };

  const confirmSaveOrder = async () => {
    const patientId = Number(selectedPatient.id);
    const doctorUserId = Number(user?.user_id);
    if (!patientId || !doctorUserId) {
      setShowConfirmation(false);
      setNotice("Unable to identify the patient or doctor.");
      return;
    }
    setSaving(true);
    try {
      const response = await doctorService.createLabOrder({
        patient_id: patientId,
        doctor_user_id: doctorUserId,
        test_type: selectedTest,
      });
      const saved = response.data;
      const nextOrder: LabResult = {
        id: saved.lab_id,
        test: saved.test_type,
        date: formatCurrentDate(),
        status: "Pending",
        result: saved.results_text || "Waiting...",
      };
      setResults((current) => [nextOrder, ...current]);
      setNotice("Lab order saved successfully!");
      setShowConfirmation(false);
    } catch (error) {
      const message = (error as { response?: { data?: { detail?: string } } }).response?.data?.detail;
      setNotice(message || "Unable to save lab order.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full bg-[#f4f9ff] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1220px] space-y-5">
        <section className="relative overflow-hidden rounded-2xl border border-[#e5effa] bg-white px-5 py-5 shadow-[0_4px_18px_rgba(61,121,177,0.08)] sm:px-7">
          <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-[#edf6ff]" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#e8f2ff] text-[#1976ed]">
              <UserRound className="h-9 w-9" strokeWidth={1.8} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-lg font-bold text-[#183b69]">
                <span>Patient:</span>
                <span>{selectedPatient.name}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#6680a0]">
                <span className="flex items-center gap-2"><ClipboardList className="h-4 w-4 text-[#1976ed]" /> Patient ID: {selectedPatient.id}</span>
                <span className="hidden h-4 w-px bg-[#cddbeb] sm:block" />
                <span className="flex items-center gap-2"><UserRound className="h-4 w-4 text-[#1976ed]" /> Age: {selectedPatient.age}</span>
                <span className="hidden h-4 w-px bg-[#cddbeb] sm:block" />
                <span className="flex items-center gap-2"><Droplets className="h-4 w-4 text-[#1976ed]" /> Blood: {selectedPatient.bloodGroup}</span>
                <span className="hidden h-4 w-px bg-[#cddbeb] sm:block" />
                <span>Allergies: {selectedPatient.allergies}</span>
              </div>
              <p className="mt-3 text-xs text-[#6680a0]">Appointment #{selectedPatient.appointmentId} · {selectedPatient.appointmentDate} · {selectedPatient.appointmentStatus}</p>
            </div>
          </div>
        </section>

        <section className="relative rounded-2xl border border-[#e5effa] bg-white p-5 shadow-[0_4px_18px_rgba(61,121,177,0.08)] sm:p-6">
          {notice && (
            <div role="status" className="absolute right-5 top-5 z-10 flex items-center gap-2 rounded-xl bg-[#e7fff1] px-4 py-3 text-sm font-semibold text-[#189657] shadow-sm sm:right-6 sm:top-6">
              <CheckCircle2 className="h-5 w-5" />
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notification"><X className="ml-2 h-4 w-4" /></button>
            </div>
          )}
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f2ff] text-[#1976ed]">
              <Beaker className="h-7 w-7" strokeWidth={1.8} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#183b69]">Order a Test</h1>
             
            </div>
          </div>
          <form onSubmit={saveOrder} className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <label className="block flex-1">
              <span className="mb-2 block text-sm font-semibold text-[#587391]">Test Type</span>
              <span className="relative block">
                <FlaskConical className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1976ed]" />
                <select
                  value={selectedTest}
                  onChange={(event) => setSelectedTest(event.target.value)}
                  className="h-12 w-full appearance-none rounded-xl border border-[#d9e6f3] bg-white pl-12 pr-10 text-sm font-medium text-[#294b73] outline-none transition focus:border-[#1976ed] focus:ring-4 focus:ring-[#1976ed]/10"
                >
                  {TEST_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.value}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6680a0]" />
              </span>
            </label>
            <button type="submit" className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1976ed] px-7 text-sm font-bold text-white shadow-[0_6px_14px_rgba(25,118,237,0.25)] transition hover:bg-[#1267d5] focus:outline-none focus:ring-4 focus:ring-[#1976ed]/20">
              <Activity className="h-4 w-4" /> Save Order
            </button>
          </form>
        </section>
        {showConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="text-lg font-bold text-[#183b69]">Confirm lab order</h2>
              <p className="mt-2 text-sm text-[#6680a0]">
                Save <strong>{selectedTest}</strong> for <strong>{selectedPatient.name}</strong>?
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowConfirmation(false)} disabled={saving} className="rounded-xl border border-[#d9e6f3] px-5 py-2.5 text-sm font-semibold text-[#587391]">Cancel</button>
                <button type="button" onClick={confirmSaveOrder} disabled={saving} className="rounded-xl bg-[#1976ed] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">{saving ? "Saving..." : "OK, Save Order"}</button>
              </div>
            </div>
          </div>
        )}

        <section className="rounded-2xl border border-[#e5effa] bg-white p-5 shadow-[0_4px_18px_rgba(61,121,177,0.08)] sm:p-6">
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f2ff] text-[#1976ed]">
              <ClipboardList className="h-7 w-7" strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#183b69]">Lab Results</h2>
           
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-[#dce9f6]">
            <div className="min-w-[690px]">
              <div className="grid grid-cols-[1.35fr_1.5fr_1fr_1.8fr_28px] bg-[#eff6ff] px-4 py-3 text-xs font-bold text-[#375b85] sm:px-5">
                <span>Test</span><span>Date</span><span>Status</span><span>Result</span><span />
              </div>
              {loadingResults && <div className="border-t border-[#e5effa] px-5 py-8 text-center text-sm text-[#6680a0]">Loading lab results...</div>}
              {!loadingResults && results.map((item) => {
                const option = testOption(item.test);
                const Icon = option.icon;
                const expanded = expandedId === item.id;
                return (
                  <React.Fragment key={`${item.id}-${item.test}-${item.date}`}>
                    <button type="button" onClick={() => setExpandedId(expanded ? null : item.id)} className="grid w-full grid-cols-[1.35fr_1.5fr_1fr_1.8fr_28px] items-center border-t border-[#e5effa] px-4 py-3 text-left transition hover:bg-[#f8fbff] sm:px-5">
                      <span className="flex items-center gap-3 text-sm font-semibold text-[#294b73]"><span className={`flex h-8 w-8 items-center justify-center rounded-full ${option.color}`}><Icon className="h-4 w-4" /></span>{item.test}</span>
                      <span className="text-sm text-[#6680a0]">{item.date}</span>
                      <span><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${item.status === "Completed" ? "bg-[#dcf9e9] text-[#1b9a5c]" : "bg-[#fff3d3] text-[#b98000]"}`}>{item.status === "Completed" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}{item.status}</span></span>
                      <span className="text-sm text-[#6680a0]">{item.result}</span>
                      <ChevronRight className={`h-5 w-5 text-[#7893b0] transition-transform ${expanded ? "rotate-90" : ""}`} />
                    </button>
                    {expanded && <div className="border-t border-[#e5effa] bg-[#f8fbff] px-5 py-3 text-sm text-[#587391]"><span className="font-semibold text-[#294b73]">Patient:</span> {selectedPatient.name} <span className="mx-3 text-[#b4c4d4]">|</span> <span className="font-semibold text-[#294b73]">Appointment:</span> #{selectedPatient.appointmentId} <span className="mx-3 text-[#b4c4d4]">|</span> <span className="font-semibold text-[#294b73]">Order:</span> {item.test}</div>}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          <p className="mt-4 text-sm font-medium text-[#6680a0]">{results.length} lab orders</p>
        </section>
      </div>
    </div>
  );
}
