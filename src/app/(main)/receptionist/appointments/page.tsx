"use client";

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { CalendarClock, RefreshCw, UserPlus, X } from 'lucide-react';
import { receptionistService, type RecepAppointmentRecord, type RecepPatientRecord } from '@/services/receptionistService';
import { departmentService } from '@/services/departmentService';
import { staffService } from '@/services/staffService';
import type { Department, StaffMember } from '@/types';

const SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function displayTime(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function ReceptionistAppointments() {
  const [patients, setPatients] = useState<RecepPatientRecord[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [appointments, setAppointments] = useState<RecepAppointmentRecord[]>([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterPatientName, setFilterPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [patientQuery, setPatientQuery] = useState('');
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
  const [departmentId, setDepartmentId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState(todayKey());
  const [time, setTime] = useState(SLOTS[0]);
  const [editing, setEditing] = useState<number | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState(SLOTS[0]);
  const [newPatient, setNewPatient] = useState({
    first_name: '',
    last_name: '',
    email: '',
    dob: '',
    blood_group: 'Unknown',
    emergency_contact: '',
    allergies: '',
  });
  const [patientError, setPatientError] = useState('');
  const [patientSuccess, setPatientSuccess] = useState('');
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingAppointments, setIsRefreshingAppointments] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPatient, setSavingPatient] = useState(false);

  const doctors = useMemo(() => staff.filter((member) => (
    member.role.toLowerCase() === 'doctor'
    && String(member.dept_id ?? '') === departmentId
    && member.is_active !== false && member.is_active !== 0
  )), [staff, departmentId]);

  const matchingPatients = useMemo(() => {
    const query = patientQuery.trim().toLocaleLowerCase();
    if (!query) return [];
    return patients.filter((patient) => (
      `${patient.first_name} ${patient.last_name}`.toLocaleLowerCase().includes(query)
    ));
  }, [patients, patientQuery]);

  async function loadAppointments(date = filterDate, patientName = filterPatientName) {
    setError('');
    setIsRefreshingAppointments(true);
    try {
      setAppointments(await receptionistService.getAppointments({
        date: date || undefined,
        patientName: patientName.trim() || undefined,
      }));
    } catch {
      setError('Appointments could not be loaded.');
    } finally {
      setIsRefreshingAppointments(false);
    }
  }

  async function applyDateFilter(value: string) {
    setFilterDate(value);
    await loadAppointments(value, filterPatientName);
  }

  async function refreshAllAppointments() {
    setFilterDate('');
    setFilterPatientName('');
    await loadAppointments('', '');
  }

  useEffect(() => {
    Promise.all([
      receptionistService.getPatients(),
      departmentService.getAll(),
      staffService.getStaff(),
      receptionistService.getAppointments(),
    ])
      .then(([patientRows, departmentRows, staffRows, appointmentRows]) => {
        setPatients(patientRows);
        setDepartments(departmentRows);
        setStaff(staffRows);
        setAppointments(appointmentRows);
      })
      .catch(() => setError('Appointments or booking data could not be loaded.'))
      .finally(() => setIsLoading(false));
  }, []);

  async function book(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setBookingSuccess('');
    try {
      const createdAppointment = await receptionistService.createAppointment({
        patient_id: Number(patientId),
        doctor_id: Number(doctorId),
        dept_id: Number(departmentId),
        apt_date: date,
        time_slot: time,
      });
      setBookingSuccess(
        `Appointment booked successfully for ${createdAppointment.patient_name} with ${createdAppointment.doctor_name} on ${createdAppointment.apt_date} at ${displayTime(createdAppointment.time_slot)}.`,
      );
      setPatientId('');
      setPatientQuery('');
      await loadAppointments();
    } catch {
      setError('Booking failed. Confirm the patient, department, doctor, date, and available time.');
    } finally {
      setSaving(false);
    }
  }

  async function registerPatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingPatient(true);
    setPatientError('');
    setPatientSuccess('');
    try {
      const createdPatient = await receptionistService.registerPatient({
        ...newPatient,
        first_name: newPatient.first_name.trim(),
        last_name: newPatient.last_name.trim(),
        email: newPatient.email.trim(),
        emergency_contact: newPatient.emergency_contact.trim(),
        allergies: newPatient.allergies.trim() || 'Unknown',
      });
      setPatients((current) => [...current, createdPatient]);
      setPatientId(String(createdPatient.patient_id));
      setPatientQuery(`${createdPatient.first_name} ${createdPatient.last_name}`);
      setShowPatientSuggestions(false);
      setNewPatient({
        first_name: '',
        last_name: '',
        email: '',
        dob: '',
        blood_group: 'Unknown',
        emergency_contact: '',
        allergies: '',
      });
      setPatientSuccess(`${createdPatient.first_name} ${createdPatient.last_name} was added and selected for booking.`);
    } catch {
      setPatientError('Patient registration failed. Check that the email is not already registered.');
    } finally {
      setSavingPatient(false);
    }
  }

  async function saveReschedule(appointmentId: number) {
    setSaving(true);
    setError('');
    try {
      await receptionistService.rescheduleAppointment(appointmentId, editDate, editTime);
      setEditing(null);
      await loadAppointments();
    } catch {
      setError('Appointment could not be rescheduled. The new time may already be booked.');
    } finally {
      setSaving(false);
    }
  }

  async function cancelAppointment(appointmentId: number) {
    setError('');
    try {
      await receptionistService.updateAppointmentStatus(appointmentId, 'Cancelled');
      await loadAppointments();
    } catch {
      setError('Appointment could not be cancelled.');
    }
  }

  return (
    <div className="space-y-6">
      <header><p className="text-sm font-semibold uppercase tracking-wide text-[#5B6472]">Reception</p><h2 className="mt-1 text-2xl font-bold text-[#0E4749]">Manage Appointments</h2></header>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(260px,3fr)]">
      <div className="min-w-0 space-y-6">
      {bookingSuccess && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">{bookingSuccess}</p>}
      <form onSubmit={book} className="grid w-full grid-cols-1 gap-5 rounded-2xl border border-[#DCE3E0] bg-white p-6 shadow-sm md:p-8">
        <div className="border-b border-[#E8EDEA] pb-4">
          <h3 className="text-lg font-bold text-[#0E4749]">Book an appointment</h3>
          <p className="mt-1 text-sm font-normal text-[#5B6472]">Choose a patient, department, doctor, date, and time.</p>
        </div>
        <div className="relative">
          <label htmlFor="appointment-patient" className="block text-sm font-semibold">Patient
            <input
              id="appointment-patient"
              required
              autoComplete="off"
              value={patientQuery}
              onFocus={() => setShowPatientSuggestions(true)}
              onChange={(event) => {
                setPatientQuery(event.target.value);
                setPatientId('');
                setShowPatientSuggestions(true);
              }}
              placeholder="Patient name"
              className="mt-2 w-full rounded-lg border border-[#DCE3E0] bg-white p-3 font-normal focus:border-[#0E4749] focus:outline-none focus:ring-2 focus:ring-teal-900/10"
            />
          </label>
          {showPatientSuggestions && patientQuery.trim() && (
            <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-[#DCE3E0] bg-white py-1 shadow-lg">
              {matchingPatients.length ? matchingPatients.map((patient) => (
                <li key={patient.patient_id}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setPatientId(String(patient.patient_id));
                      setPatientQuery(`${patient.first_name} ${patient.last_name}`);
                      setShowPatientSuggestions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-teal-50"
                  >
                    {patient.first_name} {patient.last_name}
                  </button>
                </li>
              )) : (
                <li className="px-3 py-2 text-sm text-[#5B6472]">No matching patient found.</li>
              )}
            </ul>
          )}
        </div>
        <label className="text-sm font-semibold">Department
          <select required value={departmentId} onChange={(event) => { setDepartmentId(event.target.value); setDoctorId(''); }} className="mt-2 w-full rounded-lg border border-[#DCE3E0] bg-white p-3 font-normal focus:border-[#0E4749] focus:outline-none focus:ring-2 focus:ring-teal-900/10"><option value="">Select department</option>{departments.map((d) => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}</select>
        </label>
        <label className="text-sm font-semibold">Doctor
          <select required value={doctorId} onChange={(event) => setDoctorId(event.target.value)} disabled={!departmentId} className="mt-2 w-full rounded-lg border border-[#DCE3E0] bg-white p-3 font-normal focus:border-[#0E4749] focus:outline-none focus:ring-2 focus:ring-teal-900/10 disabled:cursor-not-allowed disabled:bg-gray-50"><option value="">Select doctor</option>{doctors.map((d) => <option key={d.staff_id} value={d.staff_id}>Dr. {d.first_name} {d.last_name}</option>)}</select>
        </label>
        <label className="text-sm font-semibold">Date
          <input required type="date" min={todayKey()} value={date} onChange={(event) => setDate(event.target.value)} className="mt-2 w-full rounded-lg border border-[#DCE3E0] bg-white p-3 font-normal focus:border-[#0E4749] focus:outline-none focus:ring-2 focus:ring-teal-900/10" />
        </label>
        <label className="text-sm font-semibold">Time
          <select required value={time} onChange={(event) => setTime(event.target.value)} className="mt-2 w-full rounded-lg border border-[#DCE3E0] bg-white p-3 font-normal focus:border-[#0E4749] focus:outline-none focus:ring-2 focus:ring-teal-900/10">{SLOTS.map((slot) => <option key={slot} value={slot}>{displayTime(slot)}</option>)}</select>
        </label>
        <button disabled={saving} className="mt-1 w-full rounded-lg bg-[#0E4749] p-3.5 font-bold text-white transition-colors hover:bg-[#0a383a] disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Saving…' : 'Book appointment'}</button>
      </form>
      {error && <p role="alert" className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
      </div>
      <aside className="min-w-0 rounded-2xl border border-[#DCE3E0] bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3 border-b border-[#E8EDEA] pb-4">
          <span className="rounded-lg bg-teal-50 p-2.5 text-[#0E4749]"><UserPlus className="h-5 w-5" /></span>
          <div><h3 className="font-bold text-[#0E4749]">Add patient</h3><p className="mt-1 text-xs text-[#5B6472]">Register a patient without leaving this page.</p></div>
        </div>
        <form onSubmit={registerPatient} className="space-y-4">
          <label className="block text-sm font-semibold">First name
            <input required maxLength={100} value={newPatient.first_name} onChange={(event) => setNewPatient((current) => ({ ...current, first_name: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-[#DCE3E0] p-2.5 font-normal focus:border-[#0E4749] focus:outline-none" />
          </label>
          <label className="block text-sm font-semibold">Last name
            <input required maxLength={100} value={newPatient.last_name} onChange={(event) => setNewPatient((current) => ({ ...current, last_name: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-[#DCE3E0] p-2.5 font-normal focus:border-[#0E4749] focus:outline-none" />
          </label>
          <label className="block text-sm font-semibold">Email
            <input required type="email" value={newPatient.email} onChange={(event) => setNewPatient((current) => ({ ...current, email: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-[#DCE3E0] p-2.5 font-normal focus:border-[#0E4749] focus:outline-none" />
          </label>
          <label className="block text-sm font-semibold">Date of birth
            <input required type="date" max={todayKey()} value={newPatient.dob} onChange={(event) => setNewPatient((current) => ({ ...current, dob: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-[#DCE3E0] bg-white p-2.5 font-normal focus:border-[#0E4749] focus:outline-none" />
          </label>
          <label className="block text-sm font-semibold">Emergency contact
            <input required maxLength={20} value={newPatient.emergency_contact} onChange={(event) => setNewPatient((current) => ({ ...current, emergency_contact: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-[#DCE3E0] p-2.5 font-normal focus:border-[#0E4749] focus:outline-none" />
          </label>
          <label className="block text-sm font-semibold">Blood group
            <select value={newPatient.blood_group} onChange={(event) => setNewPatient((current) => ({ ...current, blood_group: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-[#DCE3E0] bg-white p-2.5 font-normal focus:border-[#0E4749] focus:outline-none">
              <option>Unknown</option>{['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((group) => <option key={group}>{group}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold">Allergies
            <textarea rows={2} maxLength={2000} value={newPatient.allergies} onChange={(event) => setNewPatient((current) => ({ ...current, allergies: event.target.value }))} placeholder="None or Unknown" className="mt-1.5 w-full rounded-lg border border-[#DCE3E0] p-2.5 font-normal focus:border-[#0E4749] focus:outline-none" />
          </label>
          {patientError && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{patientError}</p>}
          {patientSuccess && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700">{patientSuccess}</p>}
          <button disabled={savingPatient} className="w-full rounded-lg bg-[#E07856] p-3 font-bold text-white transition-colors hover:bg-[#c96749] disabled:cursor-not-allowed disabled:opacity-50">{savingPatient ? 'Adding patient…' : 'Add patient'}</button>
        </form>
      </aside>
      </div>

      <section className="overflow-hidden rounded-xl border border-[#DCE3E0] bg-white">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#DCE3E0] p-5">
          <div><h3 className="font-bold text-[#0E4749]">Appointment list</h3><p className="mt-1 text-xs text-[#5B6472]">Leave the date blank to view all appointments.</p></div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-xs font-semibold text-[#5B6472]">Filter date<input type="date" value={filterDate} onChange={(event) => void applyDateFilter(event.target.value)} className="mt-1 block rounded-lg border border-[#DCE3E0] p-2 text-sm text-gray-900" /></label>
            <label className="text-xs font-semibold text-[#5B6472]">Patient name<input type="search" value={filterPatientName} onChange={(event) => setFilterPatientName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void loadAppointments(); }} placeholder="Search patient name" className="mt-1 block rounded-lg border border-[#DCE3E0] p-2 text-sm text-gray-900" /></label>
            <button type="button" onClick={() => void refreshAllAppointments()} disabled={isLoading || isRefreshingAppointments} className="inline-flex items-center gap-2 rounded-lg bg-[#0E4749] px-3 py-2 text-sm font-semibold text-white hover:bg-[#093234] disabled:cursor-not-allowed disabled:opacity-50">
              <RefreshCw className={`h-4 w-4 ${isRefreshingAppointments ? 'animate-spin' : ''}`} />
              {isRefreshingAppointments ? 'Refreshing…' : 'Refresh all'}
            </button>
          </div>
        </div>
        {isLoading ? <p className="p-5 text-sm text-[#5B6472]">Loading appointments…</p> : appointments.length ? (
          <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-[#5B6472]"><tr><th className="p-4">Patient</th><th className="p-4">Doctor / department</th><th className="p-4">Date</th><th className="p-4">Time</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead>
            <tbody className="divide-y divide-[#DCE3E0]">{appointments.map((appointment) => <tr key={appointment.apt_id}>
              <td className="p-4 font-semibold">{appointment.patient_name}</td>
              <td className="p-4">{appointment.doctor_name}<span className="block text-xs text-[#5B6472]">{appointment.dept_name}</span></td>
              <td className="p-4">{editing === appointment.apt_id ? <input type="date" min={todayKey()} value={editDate} onChange={(event) => setEditDate(event.target.value)} className="rounded border p-2" /> : appointment.apt_date.slice(0, 10)}</td>
              <td className="p-4">{editing === appointment.apt_id ? <select value={editTime} onChange={(event) => setEditTime(event.target.value)} className="rounded border bg-white p-2">{SLOTS.map((slot) => <option key={slot}>{slot}</option>)}</select> : displayTime(appointment.time_slot)}</td>
              <td className="p-4">{appointment.status}</td>
              <td className="p-4"><div className="flex gap-2">
                {editing === appointment.apt_id ? <><button type="button" disabled={saving || !editDate} onClick={() => void saveReschedule(appointment.apt_id)} className="rounded bg-teal-50 px-2 py-1 font-semibold text-[#0E4749]">Save</button><button type="button" onClick={() => setEditing(null)} className="rounded border px-2 py-1">Back</button></> : appointment.status.toLowerCase() === 'scheduled' ? <>
                  <button type="button" onClick={() => { setEditing(appointment.apt_id); setEditDate(appointment.apt_date.slice(0, 10)); setEditTime(appointment.time_slot.slice(0, 5)); }} title="Reschedule" className="rounded border border-[#DCE3E0] p-2 text-[#0E4749]"><RefreshCw className="h-4 w-4" /></button>
                  <button type="button" onClick={() => void cancelAppointment(appointment.apt_id)} title="Cancel" className="rounded border border-rose-200 p-2 text-rose-700"><X className="h-4 w-4" /></button>
                </> : <span className="text-xs text-[#5B6472]">—</span>}
              </div></td>
            </tr>)}</tbody>
          </table></div>
        ) : <p className="p-5 text-sm text-[#5B6472]">No appointments found.</p>}
      </section>
      <div className="flex items-center gap-2 text-xs text-[#5B6472]"><CalendarClock className="h-4 w-4" />Appointments are offered weekdays, 9 AM–5 PM.</div>
    </div>
  );
}
