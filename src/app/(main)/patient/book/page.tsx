"use client";

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Calendar,
  CheckCircle2,
  Clock,
  Building2,
  Stethoscope,
  User,
  Info,
  ChevronDown,
  Activity,
  Heart,
} from 'lucide-react';


import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { appointmentService } from '@/services/appointmentService';
import { departmentService } from '@/services/departmentService';
import { staffService } from '@/services/staffService';
import { patientService, type DoctorDepartmentItem } from '@/services/patientService';
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
  if (value.includes('AM') || value.includes('PM')) return value;
  const [hours, minutes] = value.split(':').map(Number);
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function to24HourTime(value: string) {
  if (!value) return '';
  if (!value.includes('AM') && !value.includes('PM')) {
    return value.length === 5 ? `${value}:00` : value;
  }
  const match = value.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return value;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${minutes}:00`;
}

function providerName(provider: StaffMember) {
  return `Dr. ${provider.first_name} ${provider.last_name}`.trim();
}

export default function BookAppointment() {
  const { user, userName, isLoading: isAuthLoading } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [doctorDepartments, setDoctorDepartments] = useState<DoctorDepartmentItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');

  // Minimum allowed date is today
  const minAllowedDate = useMemo(() => {
    return toDateKey(new Date());
  }, []);

  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [selectedTime, setSelectedTime] = useState('');

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState('');

  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [rescheduleId, setRescheduleId] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);


  const isSelectedDateToday = useMemo(() => {
    return selectedDate === minAllowedDate;
  }, [selectedDate, minAllowedDate]);

  const loadBookingData = useCallback(async () => {
    setCatalogLoading(true);
    setCatalogError('');

    const params = new URLSearchParams(window.location.search);
    const requestedDoctorId = params.get('doctorId');
    const requestedRescheduleId = params.get('rescheduleId');
    if (requestedRescheduleId) setRescheduleId(requestedRescheduleId);

    try {
      const [departmentResult, staffResult, doctorDeptResult] = await Promise.allSettled([
        departmentService.getAll(),
        staffService.getStaff(),
        patientService.getDoctorDepartments(),
      ]);

      const allDepartments = departmentResult.status === 'fulfilled' ? departmentResult.value : [];
      const loadedStaff = staffResult.status === 'fulfilled' ? staffResult.value : [];
      const loadedDoctorDepts = doctorDeptResult.status === 'fulfilled' ? doctorDeptResult.value : [];

      setStaff(loadedStaff);
      setDoctorDepartments(loadedDoctorDepts);

      // Only keep departments returned by the doctor-departments API
      const validDeptNames = new Set(
        loadedDoctorDepts.map((item) => item.department_name.trim().toLowerCase())
      );

      const filteredDeptList = validDeptNames.size > 0
        ? allDepartments.filter((dept) => validDeptNames.has(dept.dept_name.trim().toLowerCase()))
        : allDepartments;

      setDepartments(filteredDeptList);

      if (departmentResult.status === 'rejected') {
        setCatalogError('Departments could not be loaded. Please try again later.');
        return;
      }
      if (staffResult.status === 'rejected') {
        setCatalogError('Doctors could not be loaded. Please try again later.');
        return;
      }

      // Set default department if available and none selected
      setSelectedDepartmentId((curr) => {
        if (!curr && filteredDeptList.length > 0) {
          return String(filteredDeptList[0].dept_id);
        }
        return curr;
      });

      if (requestedRescheduleId) {
        const { data: currentAppointment } = await appointmentService.getById(requestedRescheduleId);
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
      setCatalogError('The appointment could not be loaded. Please try again later.');
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBookingData();
  }, [loadBookingData]);

  // Selected department object
  const selectedDepartment = useMemo(() => {
    return departments.find((dept) => String(dept.dept_id) === selectedDepartmentId);
  }, [departments, selectedDepartmentId]);

  // Doctors belonging to the selected department according to doctor-departments view
  const filteredDoctors = useMemo(() => {
    return staff.filter((provider) => {
      if (provider.role.toLowerCase() !== 'doctor') return false;
      if (provider.is_active === false || provider.is_active === 0) return false;
      if (!selectedDepartment) return true;

      // Check against doctor-departments data if available
      if (doctorDepartments.length > 0) {
        const providerFullName = `${provider.first_name} ${provider.last_name}`.trim().toLowerCase();
        const currentDeptName = selectedDepartment.dept_name.trim().toLowerCase();

        return doctorDepartments.some(
          (item) =>
            item.department_name.trim().toLowerCase() === currentDeptName &&
            (item.doctor_name.trim().toLowerCase() === providerFullName ||
             item.doctor_name.trim().toLowerCase().includes(providerFullName) ||
             providerFullName.includes(item.doctor_name.trim().toLowerCase()))
        );
      }

      return String(provider.dept_id ?? '') === selectedDepartmentId;
    });
  }, [staff, selectedDepartment, doctorDepartments, selectedDepartmentId]);

  // Auto-select doctor when department changes; does NOT re-trigger loop
  useEffect(() => {
    if (filteredDoctors.length > 0) {
      setSelectedDoctorId((prev) => {
        const exists = filteredDoctors.some((d) => String(d.staff_id) === prev);
        return exists ? prev : String(filteredDoctors[0].staff_id);
      });
    } else {
      setSelectedDoctorId('');
    }
    setSelectedTime('');
  }, [selectedDepartmentId, filteredDoctors]);

  // Set default appointment date to minAllowedDate if empty
  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(minAllowedDate);
    }
  }, [minAllowedDate, selectedDate]);

  const selectedDoctor = staff.find(
    (provider) => String(provider.staff_id) === selectedDoctorId
  );

  // Auto-fetch available slots when doctor, department, and valid date are all present
  useEffect(() => {
    // 1. Check all 3 requirements are present
    if (!selectedDoctor || !selectedDepartment || !selectedDate) {
      setAvailableSlots([]);
      setSlotsError('');
      setSelectedTime('');
      return;
    }

    // 2. Validate date: cannot be in the past
    const todayKey = toDateKey(new Date());
    if (selectedDate < todayKey) {
      setSlotsError('Appointment date cannot be in the past.');
      setAvailableSlots([]);
      setSelectedTime('');
      return;
    }

    // 3. All 3 requirements fulfilled & validated -> Auto call backend API
    let isCancelled = false;
    setSlotsLoading(true);
    setSlotsError('');

    const doctorName = `${selectedDoctor.first_name} ${selectedDoctor.last_name}`.trim();
    const departmentName = selectedDepartment.dept_name.trim();

    patientService
      .getAvailableSlots(doctorName, departmentName, selectedDate)
      .then((slots) => {
        if (isCancelled) return;
        const validSlots = slots || [];
        setAvailableSlots(validSlots);
        if (validSlots.length > 0) {
          setSelectedTime((curr) => (validSlots.includes(curr) ? curr : validSlots[0]));
        } else {
          setSelectedTime('');
        }
      })
      .catch((err: any) => {
        if (isCancelled) return;
        const msg =
          err?.response?.data?.detail ||
          err?.message ||
          'Failed to load available slots from server.';
        setSlotsError(msg);
        setAvailableSlots([]);
        setSelectedTime('');
      })
      .finally(() => {
        if (!isCancelled) {
          setSlotsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedDoctor, selectedDepartment, selectedDate]);

  function handleBookClick() {
    if (!user?.user_id || !selectedDoctor || !selectedDepartment || !selectedDate || !selectedTime) {
      const msg = 'Please select department, doctor, date, and available time slot.';
      setBookingError(msg);
      toast.error(msg);
      return;
    }
    const todayKey = toDateKey(new Date());
    if (selectedDate < todayKey) {
      const msg = 'Appointment date cannot be in the past.';
      setBookingError(msg);
      toast.error(msg);
      return;
    }
    setBookingError('');
    setShowConfirmModal(true);
  }

  async function handleConfirmBooking() {
    setShowConfirmModal(false);
    if (!user?.user_id || !selectedDoctor || !selectedDepartment || !selectedDate || !selectedTime) return;
    setBooking(true);
    setBookingError('');
    try {
      const formattedSlotTime = to24HourTime(selectedTime);
      if (rescheduleId) {
        const response = await appointmentService.reschedule(rescheduleId, selectedDate, formattedSlotTime);
        const newAppointment = normalizeAppointment(response.data);
        setConfirmedAppointment(newAppointment);
        toast.success('Appointment Rescheduled Successfully!');
      } else {
        const result = await patientService.bookAppointment({
          doctor_id: selectedDoctor.staff_id,
          dept_id: selectedDepartment.dept_id,
          apt_date: selectedDate,
          time_slot: formattedSlotTime,
        });
        setConfirmedAppointment({
          apt_id: result.apt_id,
          patient_id: result.patient_id,
          doctor_id: result.doctor_id,
          dept_id: result.dept_id,
          date: result.apt_date,
          time: result.time_slot,
          time_slot: result.time_slot,
          status: result.status,
          doctorName: providerName(selectedDoctor),
          departmentName: selectedDepartment.dept_name,
        } as unknown as Appointment);

        toast.success('Appointment Booked Successfully!', {
          duration: 4000,
        });
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'The appointment could not be saved. Please try again.';
      setBookingError(msg);
      toast.error('Booking Failed', {
        description: msg,
        duration: 5000,
      });
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
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-[#0E8B8B]">
            <CalendarDays className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Book Appointment
            </h1>
           
          </div>
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
                <div className="mb-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <Calendar className="h-4 w-4" />
                    </div>
                    Appointment Date
                  </label>
                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedDate(minAllowedDate)}
                      className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                        selectedDate === minAllowedDate
                          ? 'bg-[#0E8B8B] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const tmrw = new Date();
                        tmrw.setDate(tmrw.getDate() + 1);
                        setSelectedDate(toDateKey(tmrw));
                      }}
                      className="rounded-lg bg-slate-100 px-2.5 py-1 font-semibold text-slate-600 transition hover:bg-slate-200"
                    >
                      Tomorrow
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="date"
                    min={minAllowedDate}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-800 transition focus:border-[#0E8B8B] focus:outline-none focus:ring-1 focus:ring-[#0E8B8B]"
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-500">
                  Appointments must be booked at least 2 hours in advance.
                </p>
              </div>

              {bookingError && (
                <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">
                  {bookingError}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleBookClick}
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
                {slotsLoading && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-[#0E8B8B]">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#0E8B8B] border-t-transparent" />
                    Checking…
                  </span>
                )}
              </div>

              {slotsError ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-xs font-medium text-amber-800">
                  {slotsError}
                </div>
              ) : slotsLoading ? (
                <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 py-8 text-center text-xs text-slate-500">
                  <span className="mb-2 h-5 w-5 animate-spin rounded-full border-2 border-[#0E8B8B] border-t-transparent" />
                  <span>Checking live doctor availability…</span>
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500">
                  {!selectedDoctor || !selectedDepartment
                    ? 'Please select a department and doctor to see available slots.'
                    : isSelectedDateToday
                    ? 'No slots available for today. Please choose another date.'
                    : 'No available slots remaining for this doctor on this date.'}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {availableSlots.map((time) => {
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
                        <span>{time}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowConfirmModal(false)}
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-md rounded-2xl border border-white/20 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-[#0E8B8B]">
                <Calendar className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Confirm Appointment</h2>
                <p className="text-xs text-slate-500">Please review before confirming</p>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-3 px-6 py-5">
              <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Department</p>
                  <p className="text-sm font-semibold text-slate-800">{selectedDepartment?.dept_name ?? '—'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Doctor</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedDoctor ? providerName(selectedDoctor) : '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Date</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedDate
                      ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Time Slot</p>
                  <p className="text-sm font-semibold text-slate-800">{selectedTime || '—'}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95"
              >
                No, Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                className="flex-1 rounded-xl bg-[#0E8B8B] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0b7373] active:scale-95"
              >
                Yes, Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

