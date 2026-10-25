"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarCheck2,
  CalendarDays,
  ChevronRight,
  CircleDashed,
  Clock3,
  Droplets,
  HeartPulse,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { doctorService, type DoctorCurrentScheduleSlot } from "@/services/doctorService";

type ScheduleFilter = "ALL" | "BOOKED" | "OPEN";

const patientColors = [
  "bg-rose-100 text-rose-600",
  "bg-blue-100 text-blue-600",
  "bg-violet-100 text-violet-600",
  "bg-amber-100 text-amber-600",
];

function formatDate(value: string | undefined) {
  if (!value) return "Current schedule";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function DoctorSchedule() {
  const { user } = useAuth();
  const router = useRouter();
  const [slots, setSlots] = useState<DoctorCurrentScheduleSlot[]>([]);
  const [filter, setFilter] = useState<ScheduleFilter>("ALL");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.user_id) return;
    let active = true;
    doctorService.getCurrentScheduleByUser(Number(user.user_id))
      .then((response) => {
        if (active) setSlots(response.data);
      })
      .catch(() => {
        if (active) setError("Unable to load the current schedule.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user?.user_id]);

  const filteredSlots = useMemo(
    () => slots.filter((slot) => filter === "ALL" || slot.slot_status === filter),
    [filter, slots],
  );
  const pageSize = 8;
  const pageCount = Math.max(1, Math.ceil(filteredSlots.length / pageSize));
  const visibleSlots = filteredSlots.slice((page - 1) * pageSize, page * pageSize);
  const bookedCount = slots.filter((slot) => slot.slot_status === "BOOKED").length;
  const openCount = slots.filter((slot) => slot.slot_status === "OPEN").length;
  const scheduleDate = slots[0]?.appointment_date;

  return (
    <div className="min-h-full bg-[#f4f9ff] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1220px] space-y-5">
        <section className="relative overflow-hidden rounded-2xl border border-[#b9e7ea] bg-gradient-to-br from-white via-[#f4ffff] to-[#e5f8fa] shadow-[0_8px_26px_rgba(34,142,161,0.14)]">
          <div className="absolute -left-12 -top-16 h-44 w-44 rounded-full bg-[#c7f4ef]/60" />
          <div className="absolute inset-y-0 right-0 w-[44%] bg-gradient-to-l from-[#dff4f5] via-[#e8f7fa]/80 to-transparent" />
          <div className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 items-center gap-3 text-[#0e727c]/35 sm:flex">
            <div className="relative flex h-28 w-44 items-center justify-center">
              <div className="absolute h-24 w-24 rounded-full border-[3px] border-[#6ac8c8]/30" />
              <div className="absolute -right-2 top-2 h-10 w-10 rounded-full bg-white/45" />
              <Stethoscope className="relative h-24 w-24 -rotate-[12deg]" strokeWidth={1.35} />
            </div>
          </div>
          <div className="relative flex min-h-[150px] items-center px-6 py-6 sm:px-8">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#11b9ad] to-[#1684a8] text-white shadow-lg shadow-[#26aaa3]/30">
                <CalendarDays className="h-8 w-8" strokeWidth={1.8} />
                <HeartPulse className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-white p-1 text-[#ef7d74] shadow" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-[#164d69]">Weekly Schedule</h1>
                <p className="mt-1 text-xs text-[#7893a9]">Your appointment slots for today.</p>
              </div>
              <div className="flex items-center rounded-xl border border-[#bde4e7] bg-white px-3 py-2 text-xs font-semibold text-[#4e7890] shadow-sm">
                <CalendarDays className="mr-2 h-3.5 w-3.5 text-[#159da0]" />
                {formatDate(scheduleDate)}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#e0edf3] bg-white p-5 shadow-[0_8px_24px_rgba(61,121,177,0.09)] sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-[#28617b]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e4fbf7] text-[#10a49c]"><Clock3 className="h-5 w-5" /></div>
              <div><h2 className="text-base font-extrabold">Today&apos;s Slots</h2><p className="text-[10px] text-[#89a1af]">Manage your appointments</p></div>
            </div>
            <div className="flex gap-2 text-[10px] font-bold">
              <button type="button" onClick={() => { setFilter("BOOKED"); setPage(1); }} className={`flex items-center gap-1 rounded-full px-3 py-1.5 ${filter === "BOOKED" ? "bg-[#bcefe5] text-[#08786e]" : "bg-[#e5faf5] text-[#128c80]"}`}><BadgeCheck className="h-3.5 w-3.5" /> {bookedCount} Booked</button>
              <button type="button" onClick={() => { setFilter("OPEN"); setPage(1); }} className={`flex items-center gap-1 rounded-full px-3 py-1.5 ${filter === "OPEN" ? "bg-[#ffe4b6] text-[#a76d13]" : "bg-[#fff4df] text-[#c1872c]"}`}><CircleDashed className="h-3.5 w-3.5" /> {openCount} Open</button>
              <button type="button" onClick={() => { setFilter("ALL"); setPage(1); }} className={`rounded-full px-3 py-1.5 ${filter === "ALL" ? "bg-[#dcecff] text-[#2869a0]" : "bg-[#f0f5f8] text-[#668396]"}`}>All</button>
            </div>
          </div>

          {loading && <div className="py-12 text-center text-sm text-[#7893a9]">Loading schedule...</div>}
          {error && <div className="py-12 text-center text-sm text-red-600">{error}</div>}
          {!loading && !error && (
            <>
              <div className="mx-auto grid max-w-[1080px] gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {visibleSlots.map((slot, index) => {
                  const booked = slot.slot_status === "BOOKED" || Boolean(slot.apt_id) || Boolean(slot.patient_name);
                  const patientName = slot.patient_name || "";
                  const openPatientAction = () => {
                    if (booked && slot.apt_id) {
                      router.push(`/doctor/patient-action/${slot.apt_id}`);
                    }
                  };
                  return (
                    <article
                      key={`${slot.appointment_time}-${slot.appointment_date}`}
                      onClick={openPatientAction}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openPatientAction();
                        }
                      }}
                      role={booked && slot.apt_id ? "link" : undefined}
                      tabIndex={booked && slot.apt_id ? 0 : undefined}
                      className={`relative min-h-[160px] overflow-hidden rounded-2xl border p-3 pl-[70px] shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md ${booked ? "cursor-pointer border-[#bcece6] bg-gradient-to-br from-[#f0fffc] to-[#f5fbff]" : "border-[#e2eaf0] bg-gradient-to-br from-[#fffdfa] to-[#f8fbfd]"}`}
                    >
                      <div className={`absolute left-0 top-0 h-full w-[56px] pt-4 text-center ${booked ? "bg-gradient-to-b from-[#dff8f2] to-[#eafaff]" : "bg-gradient-to-b from-[#fff1d9] to-[#fff8ec]"}`}>
                        {booked ? <Stethoscope className="mx-auto mb-2 h-5 w-5 text-[#10a49c]" /> : <Clock3 className="mx-auto mb-2 h-5 w-5 text-[#dd9b38]" />}
                        <div className={`text-sm font-extrabold ${booked ? "text-[#267c8d]" : "text-[#bd8430]"}`}>{slot.appointment_time.split(" ")[0]}</div>
                        <div className={`text-[10px] font-bold ${booked ? "text-[#267c8d]" : "text-[#bd8430]"}`}>{slot.appointment_time.split(" ")[1]}</div>
                      </div>
                      <ChevronRight className="absolute right-3 top-4 h-4 w-4 text-[#85aabb]" />
                      {booked && slot.apt_id ? (
                        <Link
                          href={`/doctor/patient-action/${slot.apt_id}`}
                          className="flex w-fit items-center gap-1 rounded-full bg-[#c9f0e9] px-2 py-1 text-[9px] font-bold text-[#127d77] shadow-sm transition hover:bg-[#aee9dc]"
                        >
                          <CalendarCheck2 className="h-3 w-3" /> BOOKED
                        </Link>
                      ) : (
                        <span className="flex w-fit items-center gap-1 rounded-full border border-[#f1d7a9] bg-[#fff9ed] px-2 py-1 text-[9px] font-bold text-[#bd8430] shadow-sm">
                          <CircleDashed className="h-3 w-3" /> OPEN SLOT
                        </span>
                      )}
                      {booked ? (
                        <>
                          <div className="mt-3 flex items-center gap-2">
                            <span className={`flex h-8 w-8 items-center justify-center rounded-full text-[9px] font-bold shadow-sm ${patientColors[index % patientColors.length]}`}><UserRound className="h-3.5 w-3.5" /></span>
                            <p className="truncate text-xs font-bold text-[#28516d]">{patientName}</p>
                          </div>
                          <p className="mt-2 flex items-center gap-1 text-[10px] text-[#7794a4]"><CalendarDays className="h-3 w-3 text-[#159da0]" />{formatDate(slot.appointment_date)}</p>
                          {slot.apt_id && <Link href={`/doctor/patient-action/${slot.apt_id}`} className="mt-3 inline-flex items-center gap-1 rounded-full border border-[#a9e3df] bg-white px-3 py-1.5 text-[9px] font-bold text-[#168b8a] hover:bg-[#e8fbf8]"><UserRound className="h-3 w-3" /> View Patient <ArrowRight className="h-3 w-3" /></Link>}
                        </>
                      ) : (
                        <p className="mt-8 flex items-center gap-1 text-[10px] text-[#8296a3]"><Droplets className="h-3 w-3 text-[#e5a238]" />Available for next patient</p>
                      )}
                    </article>
                  );
                })}
              </div>
              {visibleSlots.length === 0 && <div className="py-12 text-center text-sm text-[#7893a9]">No slots in this view.</div>}
              <div className="mt-5 flex items-center justify-between border-t border-[#edf2f5] pt-4">
                <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="inline-flex items-center gap-1 rounded-full border border-[#d7e7ed] px-3 py-1.5 text-xs font-bold text-[#50819a] disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft className="h-3.5 w-3.5" /> Previous</button>
                <span className="text-xs font-semibold text-[#7893a9]">Page {page} of {pageCount}</span>
                <button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)} className="inline-flex items-center gap-1 rounded-full border border-[#d7e7ed] px-3 py-1.5 text-xs font-bold text-[#50819a] disabled:cursor-not-allowed disabled:opacity-40">Next <ArrowRight className="h-3.5 w-3.5" /></button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
