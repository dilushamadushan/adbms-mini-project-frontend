"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  CalendarDays,
  Calendar,
  CheckCircle2,
  Clock,
  Building2,
  User,
  Info,
  ChevronDown,
  Activity,
  Heart,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { appointmentService } from '@/services/appointmentService';
import { departmentService } from '@/services/departmentService';
import { staffService } from '@/services/staffService';
import { normalizeAppointment } from '@/lib/patientAppointments';
import type { Appointment, Department, StaffMember } from '@/types';

const TEMPORARY_CLINIC_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
];

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatTime(value: string) {
  if (!value) return '';
  const [hours, minutes] = value.split(':').map(Number);
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function providerName(provider: StaffMember) {
  return `Dr. ${provider.first_name} ${provider.last_name}`.trim();
}

export default function BookAppointment() {
  const { user, userName, isLoading: isAuthLoading } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');

  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [rescheduleId, setRescheduleId] = useState('');

  const today = new Date();
  const minDate = toDateKey(today);

  useEffect(() => {
    let isActive = true;
    async function loadBookingData() {
      const params = new URLSearchParams(window.location.search);
      const requestedDoctorId = params.get('doctorId');
      const requestedRescheduleId = params.get('rescheduleId');
      if (requestedRescheduleId) setRescheduleId(requestedRescheduleId);

      try {
        const [departmentResult, staffResult] = await Promise.allSettled([
          departmentService.getAll(),
          staffService.getStaff(),
        ]);
        if (!isActive) return;

        const loadedDepartments = departmentResult.status === 'fulfilled' ? departmentResult.value : [];
        const loadedStaff = staffResult.status === 'fulfilled' ? staffResult.value : [];
        setDepartments(loadedDepartments);
        setStaff(loadedStaff);

        if (departmentResult.status === 'rejected') {
          setCatalogError('Departments could not be loaded. Please try again later.');
          return;
        }
        if (staffResult.status === 'rejected') {
          setCatalogError('Doctors could not be loaded. Please try again later.');
          return;
        }

        // Set default department if available
        if (loadedDepartments.length > 0 && !selectedDepartmentId) {
          setSelectedDepartmentId(String(loadedDepartments[0].dept_id));
        }

        if (requestedRescheduleId) {
          const { data: currentAppointment } = await appointmentService.getById(requestedRescheduleId);
          if (!isActive) return;
          setSelectedDoctorId(String(currentAppointment.doctor_id));
          setSelectedDepartmentId(String(currentAppointment.dept_id));
          setSelectedDate(currentAppointment.apt_date ? currentAppointment.apt_date.split('T')[0] : '');
          setSelectedTime(currentAppointment.time_slot || '');
          return;
        }

        if (requestedDoctorId) {
          const requestedDoctor = loadedStaff.find(
            (provider) =>
              String(provider.staff_id) === requestedDoctorId ||
              String(provider.user_id) === requestedDoctorId
          );
          if (requestedDoctor) {
            setSelectedDoctorId(String(requestedDoctor.staff_id));
            if (requestedDoctor.dept_id) {
              setSelectedDepartmentId(String(requestedDoctor.dept_id));
            }
          }
        }
      } catch {
        if (isActive)
          setCatalogError('The appointment could not be loaded. Please try again later.');
      } finally {
        if (isActive) setCatalogLoading(false);
      }
    }

    void loadBookingData();
    return () => {
      isActive = false;
    };
  }, []);

  // Filter doctors according to selected department
  const filteredDoctors = staff.filter(
    (provider) =>
      provider.role.toLowerCase() === 'doctor' &&
      (!selectedDepartmentId || String(provider.dept_id ?? '') === selectedDepartmentId) &&
      provider.is_active !== false &&
      provider.is_active !== 0
  );

  // Auto-select doctor when department changes if current selected doctor doesn't belong to it
  useEffect(() => {
    if (filteredDoctors.length > 0) {
      if (!filteredDoctors.some((d) => String(d.staff_id) === selectedDoctorId)) {
        setSelectedDoctorId(String(filteredDoctors[0].staff_id));
      }
    } else {
      setSelectedDoctorId('');
    }
    setSelectedTime('');
  }, [selectedDepartmentId, staff]);

  // Set default appointment date to today if empty
  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(minDate);
    }
  }, [minDate]);

  const selectedDepartment = departments.find(
    (dept) => String(dept.dept_id) === selectedDepartmentId
  );
  const selectedDoctor = staff.find(
    (provider) => String(provider.staff_id) === selectedDoctorId
  );

  // Available slots for the selected date
  const availableTimes = selectedDate
    ? TEMPORARY_CLINIC_SLOTS.filter((time) => {
        if (selectedDate !== minDate) return true;
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes > today.getHours() * 60 + today.getMinutes();
      })
    : TEMPORARY_CLINIC_SLOTS;

  // Auto-select first available time slot if none is chosen
  useEffect(() => {
    if (availableTimes.length > 0 && !selectedTime) {
      setSelectedTime(availableTimes[0]);
    }
  }, [availableTimes, selectedTime]);

  async function handleBookAppointment() {
    if (!user?.user_id || !selectedDoctor || !selectedDepartment || !selectedDate || !selectedTime) {
      setBookingError('Please select department, doctor, date, and available time slot.');
      return;
    }
    setBooking(true);
    setBookingError('');
    try {
      const response = rescheduleId
        ? await appointmentService.reschedule(rescheduleId, selectedDate, selectedTime)
        : await appointmentService.create({
            doctor_id: selectedDoctor.staff_id,
            dept_id: selectedDepartment.dept_id,
            apt_date: selectedDate,
            time_slot: selectedTime,
          });
      const newAppointment = normalizeAppointment(response.data);
      setConfirmedAppointment(newAppointment);
    } catch {
      setBookingError('The appointment could not be saved. Please try again.');
    } finally {
      setBooking(false);
    }
  }

  if (confirmedAppointment) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-[#DCE3E0] bg-white p-8 text-center shadow-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">
          {rescheduleId ? 'Appointment Rescheduled!' : 'Appointment Booked!'}
        </h2>
        <p className="mt-2 text-sm text-[#5B6472]">
          {confirmedAppointment.reason || selectedDepartment?.dept_name} with{' '}
          {confirmedAppointment.doctorName || (selectedDoctor && providerName(selectedDoctor))} on{' '}
          <span className="font-semibold text-gray-900">{confirmedAppointment.date || selectedDate}</span> at{' '}
          <span className="font-semibold text-gray-900">{formatTime(confirmedAppointment.time || selectedTime)}</span>.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/patient/appointments"
            className="rounded-xl bg-[#0E8B8B] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#0b7070]"
          >
            View My Appointments
          </Link>
          <button
            onClick={() => {
              setConfirmedAppointment(null);
              setRescheduleId('');
            }}
            className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Book Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-120px)] w-full font-sans text-slate-800">
      {/* Decorative Top-Right Stethoscope Art / Wave */}
      <div className="pointer-events-none absolute right-4 top-0 hidden lg:block opacity-70">
        <svg width="220" height="180" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Stethoscope illustration */}
          <path
            d="M50 20 C50 45 65 60 80 60 C95 60 110 45 110 20"
            stroke="#38BDF8"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M80 60 L80 90 C80 120 135 120 135 85 L135 75"
            stroke="#38BDF8"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="50" cy="18" r="4" fill="#0284C7" />
          <circle cx="110" cy="18" r="4" fill="#0284C7" />
          <circle cx="135" cy="73" r="8" fill="#38BDF8" fillOpacity="0.3" stroke="#0284C7" strokeWidth="2.5" />
          {/* Heart */}
          <path
            d="M165 35 C165 30 160 25 153 25 C147 25 143 29 141 33 C139 29 135 25 129 25 C122 25 117 30 117 35 C117 46 130 55 141 62 C152 55 165 46 165 35 Z"
            fill="#2DD4BF"
            fillOpacity="0.75"
          />
        </svg>
      </div>

      {/* Page Header */}
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-[#0E8B8B]">
          <CalendarDays className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Book Appointment
          </h1>
         
        </div>
      </div>

      {catalogLoading || isAuthLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Loading departments and doctors…
        </div>
      ) : catalogError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">
          {catalogError}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Form Column */}
          <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-[0_4px_25px_rgba(0,0,0,0.03)] lg:col-span-7 xl:col-span-8">
            <div className="space-y-6">
              {/* Department field */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Building2 className="h-4 w-4" />
                  </div>
                  Department
                </label>
                <div className="relative">
                  <select
                    value={selectedDepartmentId}
                    onChange={(e) => setSelectedDepartmentId(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 pr-10 text-sm font-medium text-slate-800 transition focus:border-[#0E8B8B] focus:outline-none focus:ring-1 focus:ring-[#0E8B8B]"
                  >
                    {departments.map((dept) => (
                      <option key={dept.dept_id} value={dept.dept_id}>
                        {dept.dept_name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Doctor field */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <User className="h-4 w-4" />
                  </div>
                  Doctor
                </label>
                <div className="relative">
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 pr-10 text-sm font-medium text-slate-800 transition focus:border-[#0E8B8B] focus:outline-none focus:ring-1 focus:ring-[#0E8B8B]"
                  >
                    {filteredDoctors.length === 0 ? (
                      <option value="">No doctors available for this department</option>
                    ) : (
                      filteredDoctors.map((doc) => (
                        <option key={doc.staff_id} value={doc.staff_id}>
                          {providerName(doc)} ({doc.specialty || selectedDepartment?.dept_name || 'General'})
                        </option>
                      ))
                    )}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Appointment Date */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Calendar className="h-4 w-4" />
                  </div>
                  Appointment Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={minDate}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-800 transition focus:border-[#0E8B8B] focus:outline-none focus:ring-1 focus:ring-[#0E8B8B]"
                  />
                </div>
              </div>

              {bookingError && (
                <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">
                  {bookingError}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleBookAppointment}
                disabled={booking || !selectedTime}
                className="mt-2 flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#0E8B8B] py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-[#0b7373] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Calendar className="h-5 w-5" />
                {booking ? 'Booking…' : rescheduleId ? 'Confirm Reschedule' : 'Book Appointment'}
              </button>
            </div>
          </div>

          {/* Right Summary & Time Slots Column */}
          <div className="space-y-6 lg:col-span-5 xl:col-span-4">
            {/* Compact Appointment Summary Card */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-[#0E8B8B]">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Appointment Summary</h3>
                </div>
              </div>

              {/* Compact 2x2 Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Department */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
                  <div className="mb-1 flex items-center gap-1.5 text-slate-400">
                    <Building2 className="h-3.5 w-3.5" />
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Department</span>
                  </div>
                  <p className="truncate font-bold text-slate-800">
                    {selectedDepartment?.dept_name || '—'}
                  </p>
                </div>

                {/* Doctor */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
                  <div className="mb-1 flex items-center gap-1.5 text-slate-400">
                    <User className="h-3.5 w-3.5" />
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Doctor</span>
                  </div>
                  <p className="truncate font-bold text-slate-800" title={selectedDoctor ? providerName(selectedDoctor) : undefined}>
                    {selectedDoctor ? providerName(selectedDoctor) : '—'}
                  </p>
                </div>

                {/* Date */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
                  <div className="mb-1 flex items-center gap-1.5 text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Date</span>
                  </div>
                  <p className="font-bold text-slate-800">
                    {selectedDate || '—'}
                  </p>
                </div>

                {/* Selected Time */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
                  <div className="mb-1 flex items-center gap-1.5 text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Selected Time</span>
                  </div>
                  <p className="font-bold text-[#0E8B8B]">
                    {formatTime(selectedTime) || '—'}
                  </p>
                </div>
              </div>

              {/* Watermark */}
              <div className="pointer-events-none absolute -bottom-3 -right-3 opacity-20">
                <svg width="70" height="60" viewBox="0 0 100 80" fill="none">
                  <circle cx="50" cy="40" r="30" fill="#2DD4BF" fillOpacity="0.3" />
                  <path
                    d="M30 40 L42 40 L46 30 L52 52 L56 36 L60 44 L64 40 L70 40"
                    stroke="#0E8B8B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Available Time Slots Section Under Summary */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-[#0E8B8B]">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Available Time Slots</h4>
                    <p className="text-[11px] text-slate-400">Pick a time for {selectedDate || 'the selected day'}</p>
                  </div>
                </div>
              </div>

              {new Date(`${selectedDate}T12:00:00`).getDay() === 0 ||
              new Date(`${selectedDate}T12:00:00`).getDay() === 6 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500">
                  No appointments are available on weekends. Please pick a weekday.
                </p>
              ) : availableTimes.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500">
                  No open slots remaining on this date.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {availableTimes.map((time) => {
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => {
                          setSelectedTime(time);
                          setBookingError('');
                        }}
                        className={`flex items-center justify-center rounded-xl border py-2.5 px-3 text-xs font-semibold tabular-nums transition-all ${
                          isSelected
                            ? 'border-[#0E8B8B] bg-[#0E8B8B] text-white shadow-sm ring-2 ring-[#0E8B8B]/20 font-bold scale-[1.02]'
                            : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:border-[#0E8B8B] hover:bg-teal-50/60'
                        }`}
                      >
                        <span>{formatTime(time)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
