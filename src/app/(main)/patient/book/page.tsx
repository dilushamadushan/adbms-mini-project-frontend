"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Stethoscope } from 'lucide-react';
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

function addMonthsClamped(date: Date, months: number) {
  const targetMonth = date.getMonth() + months;
  const targetLastDay = new Date(date.getFullYear(), targetMonth + 1, 0).getDate();
  return new Date(date.getFullYear(), targetMonth, Math.min(date.getDate(), targetLastDay));
}

function formatTime(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function providerName(provider: StaffMember) {
  return `Dr. ${provider.first_name} ${provider.last_name}`.trim();
}

export default function BookAppointment() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [bookingStep, setBookingStep] = useState<'department' | 'doctor' | 'schedule'>('department');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedTime, setSelectedTime] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [rescheduleId, setRescheduleId] = useState('');

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

        if (requestedRescheduleId) {
          const { data: currentAppointment } = await appointmentService.getById(requestedRescheduleId);
          if (!isActive) return;
          const currentDoctor = loadedStaff.find(
            (provider) => String(provider.staff_id) === String(currentAppointment.doctor_id),
          );
          const currentDepartment = loadedDepartments.find(
            (department) => String(department.dept_id) === String(currentAppointment.dept_id),
          );
          if (!currentDoctor || !currentDepartment) {
            setCatalogError('The doctor or department for this appointment is no longer available.');
            return;
          }

          setSelectedDoctorId(String(currentAppointment.doctor_id));
          setSelectedDepartmentId(String(currentAppointment.dept_id));
          setBookingStep('schedule');
          return;
        }

        const requestedDoctor = loadedStaff.find((provider) => (
          String(provider.staff_id) === requestedDoctorId
          || String(provider.user_id) === requestedDoctorId
        ));
        if (requestedDoctor) {
          setSelectedDoctorId(String(requestedDoctor.staff_id));
          if (requestedDoctor.dept_id) {
            setSelectedDepartmentId(String(requestedDoctor.dept_id));
            setBookingStep('doctor');
          }
        }
      } catch {
        if (isActive) setCatalogError('The appointment could not be loaded for rescheduling. Please try again later.');
      } finally {
        if (isActive) setCatalogLoading(false);
      }
    }

    void loadBookingData();
    return () => { isActive = false; };
  }, []);

  const today = new Date();
  const minDate = toDateKey(today);
  const maxDate = toDateKey(addMonthsClamped(today, 2));
  const firstCalendarDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay();
  const daysInCalendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const calendarDays = Array.from(
    { length: firstCalendarDay + daysInCalendarMonth },
    (_, index) => index < firstCalendarDay ? null : index - firstCalendarDay + 1,
  );
  const minCalendarMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const maxCalendarMonth = new Date(new Date(`${maxDate}T12:00:00`).getFullYear(), new Date(`${maxDate}T12:00:00`).getMonth(), 1);
  const canGoToPreviousMonth = calendarMonth > minCalendarMonth;
  const canGoToNextMonth = calendarMonth < maxCalendarMonth;
  const selectedDepartment = departments.find((department) => String(department.dept_id) === selectedDepartmentId);
  const doctors = staff.filter((provider) => (
    provider.role.toLowerCase() === 'doctor'
    && String(provider.dept_id ?? '') === selectedDepartmentId
    && provider.is_active !== false
    && provider.is_active !== 0
  ));
  const selectedDoctor = staff.find((provider) => String(provider.staff_id) === selectedDoctorId);
  const availableTimes = selectedDate
    ? TEMPORARY_CLINIC_SLOTS.filter((time) => {
      if (selectedDate !== minDate) return true;
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes > today.getHours() * 60 + today.getMinutes();
    })
    : [];

  function chooseDepartment(departmentId: string) {
    setSelectedDepartmentId(departmentId);
    setSelectedDoctorId('');
    setSelectedDate('');
    setSelectedTime('');
    setBookingStep('doctor');
  }

  function chooseDoctor(doctorId: string) {
    setSelectedDoctorId(doctorId);
    setSelectedDate('');
    setSelectedTime('');
    setBookingStep('schedule');
  }

  function chooseDate(date: string) {
    setSelectedDate(date);
    setSelectedTime('');
    setBookingError('');
  }

  async function bookSelectedTime() {
    if (!user?.user_id || !selectedDoctor || !selectedDepartment || !selectedDate || !selectedTime) return;
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
      setBookingError('The time slot was selected, but the appointment could not be saved. Please check the database connection and try again.');
    } finally {
      setBooking(false);
    }
  }

  if (confirmedAppointment) {
    return (
      <section className="mx-auto max-w-2xl rounded-xl border border-[#DCE3E0] bg-white p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><CheckCircle2 className="h-8 w-8" /></span>
        <h2 className="mt-4 text-xl font-bold text-gray-900">{rescheduleId ? 'Appointment rescheduled' : 'Appointment booked'}</h2>
        <p className="mt-2 text-sm text-[#5B6472]">{confirmedAppointment.reason} with {confirmedAppointment.doctorName} on {new Date(`${confirmedAppointment.date}T12:00:00`).toLocaleDateString(undefined, { dateStyle: 'long' })} at {formatTime(confirmedAppointment.time)}.</p>
        <Link href="/patient/appointments" className="mt-6 inline-flex rounded-lg bg-[#0E4749] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a3335]">View my appointments</Link>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#5B6472]">Patient portal</p>
        <h2 className="mt-1 text-2xl font-bold text-[#0E4749]">{rescheduleId ? 'Reschedule an appointment' : 'Book an appointment'}</h2>
        {!rescheduleId && <p className="mt-2 max-w-2xl text-sm text-[#5B6472]">
          {bookingStep === 'department'
              ? 'Start by choosing the department you need.'
              : bookingStep === 'doctor'
                ? 'Choose a doctor from your selected department.'
                : 'Choose an available date and appointment time.'}
        </p>}
      </header>

      {catalogLoading || isAuthLoading ? (
        <p className="rounded-lg border border-[#DCE3E0] bg-white p-5 text-sm text-[#5B6472]">Loading departments and doctors…</p>
      ) : catalogError ? (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{catalogError}</p>
      ) : !user ? (
        <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">Sign in to book an appointment.</p>
      ) : (
        <>
          {bookingStep === 'department' && <section className="rounded-xl border border-[#DCE3E0] bg-white p-5 md:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-[#0E4749]"><Stethoscope className="h-5 w-5" /></span>
              <div>
                <h3 className="font-bold text-gray-900">Choose a department</h3>
                <p className="text-sm text-[#5B6472]">Select the team you need to see.</p>
              </div>
            </div>
            {departments.length === 0 ? (
              <p className="mt-4 text-sm text-[#5B6472]">No departments are currently available.</p>
            ) : (
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {departments.map((department) => {
                  const isSelected = selectedDepartmentId === String(department.dept_id);
                  return (
                    <button key={department.dept_id} type="button" aria-pressed={isSelected} onClick={() => chooseDepartment(String(department.dept_id))} className={`min-h-12 rounded-lg border px-4 py-3 text-left text-sm font-semibold transition-colors ${isSelected ? 'border-[#0E4749] bg-teal-50 text-[#0E4749]' : 'border-[#DCE3E0] text-gray-800 hover:border-[#0E4749]'}`}>
                      {department.dept_name}
                    </button>
                  );
                })}
              </div>
            )}
          </section>}

          {bookingStep === 'doctor' && selectedDepartment && (
            <section className="rounded-xl border border-[#DCE3E0] bg-white p-5 md:p-6">
              <button type="button" onClick={() => setBookingStep('department')} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0E4749] hover:underline">
                <ArrowLeft className="h-4 w-4" /> Back to departments
              </button>
              <h3 className="font-bold text-gray-900">Choose a doctor in {selectedDepartment.dept_name}</h3>
              {doctors.length === 0 ? (
                <p className="mt-3 text-sm text-[#5B6472]">No active doctors are listed for {selectedDepartment.dept_name}.</p>
              ) : (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {doctors.map((doctor) => {
                    const isSelected = selectedDoctorId === String(doctor.staff_id);
                    return (
                      <button key={doctor.staff_id} type="button" aria-pressed={isSelected} onClick={() => chooseDoctor(String(doctor.staff_id))} className={`flex min-h-16 items-center gap-3 rounded-lg border p-3 text-left transition-colors ${isSelected ? 'border-[#0E4749] bg-teal-50' : 'border-[#DCE3E0] hover:border-[#0E4749]'}`}>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-800">Dr</span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-gray-900">{providerName(doctor)}</span>
                          <span className="block truncate text-sm text-[#5B6472]">{doctor.specialty || selectedDepartment.dept_name}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {bookingStep === 'schedule' && selectedDoctor && (
            <section className="rounded-xl border border-[#DCE3E0] bg-white p-5 md:p-6">
              {rescheduleId ? (
                <div className="mb-5 grid gap-3 rounded-lg bg-teal-50 p-4 text-sm sm:grid-cols-2">
                  <div><span className="block text-xs font-semibold uppercase tracking-wide text-[#5B6472]">Department</span><span className="mt-1 block font-semibold text-[#0E4749]">{selectedDepartment?.dept_name}</span></div>
                  <div><span className="block text-xs font-semibold uppercase tracking-wide text-[#5B6472]">Doctor</span><span className="mt-1 block font-semibold text-[#0E4749]">{providerName(selectedDoctor)}</span></div>
                </div>
              ) : (
                <button type="button" onClick={() => setBookingStep('doctor')} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0E4749] hover:underline">
                  <ArrowLeft className="h-4 w-4" /> Back to doctors
                </button>
              )}
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-800"><CalendarDays className="h-5 w-5" /></span>
                <div>
                  <h3 className="font-bold text-gray-900">Choose a date and time</h3>
                  <p className="text-sm text-[#5B6472]">Appointments are shown up to two months ahead.</p>
                </div>
              </div>

              <div className="mt-5 max-w-md rounded-xl border border-[#DCE3E0] p-4" aria-label="Choose appointment date">
                <div className="mb-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                    disabled={!canGoToPreviousMonth}
                    aria-label="Previous month"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-[#0E4749] hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-40"
                  ><ChevronLeft className="h-5 w-5" /></button>
                  <h4 className="font-semibold text-gray-900">{calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h4>
                  <button
                    type="button"
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                    disabled={!canGoToNextMonth}
                    aria-label="Next month"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-[#0E4749] hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-40"
                  ><ChevronRight className="h-5 w-5" /></button>
                </div>
                <div className="grid grid-cols-7 text-center text-xs font-semibold text-[#5B6472]">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day} className="py-2">{day}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {calendarDays.map((day, index) => {
                    if (day === null) return <span key={`empty-${index}`} />;
                    const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                    const dateKey = toDateKey(date);
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    const isDisabled = dateKey < minDate || dateKey > maxDate || isWeekend;
                    const isSelected = selectedDate === dateKey;
                    return (
                      <button
                        key={dateKey}
                        type="button"
                        onClick={() => chooseDate(dateKey)}
                        disabled={isDisabled}
                        aria-label={date.toLocaleDateString(undefined, { dateStyle: 'full' })}
                        aria-pressed={isSelected}
                        className={`h-10 rounded-lg text-sm transition-colors disabled:cursor-not-allowed disabled:text-gray-300 ${isSelected ? 'bg-[#0E4749] font-bold text-white' : isDisabled ? '' : 'text-gray-800 hover:bg-teal-50'}`}
                      >{day}</button>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-[#5B6472]">Select a weekday within the next two months.</p>
                {selectedDate && <p className="mt-2 text-sm font-semibold text-[#0E4749]">{new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>}
              </div>

              {selectedDate && (
                <div className="mt-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="flex items-center gap-2 text-sm font-semibold text-gray-900"><Clock3 className="h-4 w-4 text-[#0E4749]" />Available times</p>
                    <p className="text-xs text-[#5B6472]">Temporary test slots · Weekdays</p>
                  </div>

                  {new Date(`${selectedDate}T12:00:00`).getDay() === 0 || new Date(`${selectedDate}T12:00:00`).getDay() === 6 ? (
                    <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-[#5B6472]">No appointments are offered on weekends. Choose a weekday.</p>
                  ) : availableTimes.length === 0 ? (
                    <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-[#5B6472]">No open times remain on this date. Choose another day.</p>
                  ) : (
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                      {availableTimes.map((time) => (
                        <button key={time} type="button" aria-pressed={selectedTime === time} onClick={() => { setSelectedTime(time); setBookingError(''); }} className={`min-h-11 rounded-lg border px-2 py-2 text-sm font-semibold tabular-nums transition-colors ${selectedTime === time ? 'border-[#0E4749] bg-[#0E4749] text-white' : 'border-[#DCE3E0] text-gray-800 hover:border-[#0E4749] hover:bg-teal-50'}`}>
                          {formatTime(time)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {bookingError && <p role="alert" className="mt-4 text-sm text-rose-700">{bookingError}</p>}
              {selectedTime && (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#DCE3E0] pt-5">
                  <p className="text-sm text-[#5B6472]">Selected: <span className="font-semibold text-gray-900">{new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, { dateStyle: 'medium' })} at {formatTime(selectedTime)}</span></p>
                  <button type="button" onClick={bookSelectedTime} disabled={booking} className="rounded-lg bg-[#0E4749] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a3335] disabled:cursor-not-allowed disabled:opacity-50">{booking ? 'Booking…' : rescheduleId ? 'Confirm reschedule' : 'Book this time'}</button>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
