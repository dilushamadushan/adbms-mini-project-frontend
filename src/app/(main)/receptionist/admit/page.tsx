"use client";

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { Hospital, UserPlus } from 'lucide-react';
import {
  receptionistService,
  type AdmissionRecord,
  type RecepPatientRecord,
  type WardRecord,
} from '@/services/receptionistService';
import { staffService } from '@/services/staffService';
import type { StaffMember } from '@/types';

const inputClass = 'mt-1.5 w-full rounded-lg border border-[#DCE3E0] bg-white p-3 font-normal focus:border-[#0E4749] focus:outline-none focus:ring-2 focus:ring-teal-900/10';
const phonePattern = /^\+?[0-9\s().-]{7,20}$/;

function calculateAge(dob: string | null | undefined): string {
  if (!dob) return '—';
  const birthDate = new Date(`${dob.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) return '—';

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const beforeBirthday = today.getMonth() < birthDate.getMonth()
    || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 ? String(age) : '—';
}

export default function ReceptionistAdmit() {
  const [patients, setPatients] = useState<RecepPatientRecord[]>([]);
  const [admittedPatients, setAdmittedPatients] = useState<AdmissionRecord[]>([]);
  const [wards, setWards] = useState<WardRecord[]>([]);
  const [doctors, setDoctors] = useState<StaffMember[]>([]);
  const [patientQuery, setPatientQuery] = useState('');
  const [patientId, setPatientId] = useState('');
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
  const [wardId, setWardId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [gender, setGender] = useState<'Female' | 'Male' | ''>('');
  const [reason, setReason] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelationship, setGuardianRelationship] = useState('');
  const [guardianContact, setGuardianContact] = useState('');
  const [newPatient, setNewPatient] = useState({
    first_name: '',
    last_name: '',
    email: '',
    dob: '',
    blood_group: 'Unknown',
    emergency_contact: '',
    allergies: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingAdmissions, setIsRefreshingAdmissions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccessCooldown, setIsSuccessCooldown] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [patientError, setPatientError] = useState('');
  const [patientSuccess, setPatientSuccess] = useState('');

  const selectedPatient = patients.find((patient) => String(patient.patient_id) === patientId);
  const matchingPatients = useMemo(() => {
    const query = patientQuery.trim().toLocaleLowerCase();
    if (!query) return [];
    return patients.filter((patient) => (
      `${patient.first_name} ${patient.last_name}`.toLocaleLowerCase().includes(query)
    )).slice(0, 8);
  }, [patients, patientQuery]);

  useEffect(() => {
    if (!isSuccessCooldown) return undefined;

    const timeoutId = window.setTimeout(() => {
      setSuccess('');
      setIsSuccessCooldown(false);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [isSuccessCooldown]);

  useEffect(() => {
    Promise.all([
      receptionistService.getPatients(),
      receptionistService.getWards(),
      staffService.getStaff(),
      receptionistService.getAdmissions(true),
    ])
      .then(([patientRows, wardRows, staffRows, admissionRows]) => {
        setPatients(patientRows);
        setWards(wardRows);
        setAdmittedPatients(admissionRows.filter((admission) => admission.status !== 'Discharged'));
        setDoctors(staffRows.filter((member) => (
          member.role.toLowerCase() === 'doctor'
          && member.is_active !== false
          && member.is_active !== 0
        )));
      })
      .catch(() => setError('Patient, ward, and doctor records could not be loaded.'))
      .finally(() => setIsLoading(false));
  }, []);

  async function refreshAdmittedPatients() {
    setIsRefreshingAdmissions(true);
    try {
      const records = await receptionistService.getAdmissions(true);
      setAdmittedPatients(records.filter((admission) => admission.status !== 'Discharged'));
    } catch {
      setError('Admitted patient records could not be refreshed.');
    } finally {
      setIsRefreshingAdmissions(false);
    }
  }

  function selectPatient(patient: RecepPatientRecord) {
    setPatientId(String(patient.patient_id));
    setPatientQuery(`${patient.first_name} ${patient.last_name}`);
    setShowPatientSuggestions(false);
  }

  async function submitAdmission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!patientId) {
      setError('Select a patient from the name suggestions before submitting.');
      return;
    }
    if (!wardId || !doctorId || !gender || !reason.trim() || !guardianName.trim() || !guardianRelationship || !guardianContact.trim()) {
      setError('Complete all required admission and guardian fields.');
      return;
    }
    if (!phonePattern.test(guardianContact.trim())) {
      setError('Enter a valid guardian contact number (7–20 digits, with optional +, spaces, parentheses, dots, or hyphens).');
      return;
    }

    setIsSaving(true);
    try {
      const admission = await receptionistService.admitPatient({
        patient_id: Number(patientId),
        ward_id: Number(wardId),
        admitted_doctor_id: Number(doctorId),
        gender,
        admission_reason: reason.trim(),
        guardian_name: guardianName.trim(),
        guardian_relationship: guardianRelationship,
        guardian_contact: guardianContact.trim(),
      });
      setSuccess(`Admission recorded for ${admission.patient_name} in ${admission.ward_name}. A nurse will assign a bed.`);
      setIsSuccessCooldown(true);
      setPatientId('');
      setPatientQuery('');
      setWardId('');
      setDoctorId('');
      setGender('');
      setReason('');
      setGuardianName('');
      setGuardianRelationship('');
      setGuardianContact('');
    } catch (caught: unknown) {
      if (isAxiosError(caught)) {
        const detail: unknown = caught.response?.data?.detail;
        if (typeof detail === 'string') {
          setError(detail);
        } else if (Array.isArray(detail)) {
          setError(detail.map((item) => (
            typeof item === 'object' && item !== null && 'msg' in item
              ? String(item.msg)
              : 'Invalid admission field'
          )).join('. '));
        } else if (caught.response?.status && caught.response.status >= 500) {
          setError('The server could not save the admission. Check that the Admissions table has the latest receptionist columns and review the backend error log.');
        } else {
          setError('The admission request was rejected. Verify the selected patient, ward, doctor, and guardian details.');
        }
      } else {
        setError('An unexpected error prevented the admission from being saved.');
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function registerPatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsRegistering(true);
    setPatientError('');
    setPatientSuccess('');
    try {
      const patient = await receptionistService.registerPatient({
        ...newPatient,
        first_name: newPatient.first_name.trim(),
        last_name: newPatient.last_name.trim(),
        email: newPatient.email.trim(),
        emergency_contact: newPatient.emergency_contact.trim(),
        allergies: newPatient.allergies.trim() || 'Unknown',
      });
      setPatients((current) => [...current, patient]);
      selectPatient(patient);
      setNewPatient({
        first_name: '',
        last_name: '',
        email: '',
        dob: '',
        blood_group: 'Unknown',
        emergency_contact: '',
        allergies: '',
      });
      setPatientSuccess(`${patient.first_name} ${patient.last_name} was added and selected for admission.`);
    } catch {
      setPatientError('Patient registration failed. Check that the email is not already registered.');
    } finally {
      setIsRegistering(false);
    }
  }

  if (isLoading) return <p className="rounded-lg border border-[#DCE3E0] bg-white p-5 text-sm text-[#5B6472]">Loading patients, wards, and doctors…</p>;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#5B6472]">Reception</p>
        <h2 className="mt-1 text-2xl font-bold text-[#0E4749]">Admit Patient</h2>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
        <form onSubmit={submitAdmission} className="min-w-0 space-y-5 rounded-2xl border border-[#DCE3E0] bg-white p-6 shadow-sm md:p-8">
          <div className="border-b border-[#E8EDEA] pb-4">
            <h3 className="text-lg font-bold text-[#0E4749]">Admission details</h3>
            <p className="mt-1 text-sm text-[#5B6472]">Select a patient by name. Patient details are filled from their record.</p>
          </div>

          <div className="relative">
            <label htmlFor="admission-patient" className="block text-sm font-semibold">Patient name</label>
            <input
              id="admission-patient"
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
              className={inputClass}
            />
            {showPatientSuggestions && patientQuery.trim() && (
              <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-[#DCE3E0] bg-white py-1 shadow-lg">
                {matchingPatients.length ? matchingPatients.map((patient) => (
                  <li key={patient.patient_id}>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectPatient(patient)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-teal-50"
                    >
                      {patient.first_name} {patient.last_name}
                    </button>
                  </li>
                )) : <li className="px-3 py-2 text-sm text-[#5B6472]">No matching patient. Add them using the form on the right.</li>}
              </ul>
            )}
          </div>

          {selectedPatient && (
            <section aria-label="Patient details" className="grid gap-3 rounded-xl bg-[#F6F8F7] p-4 sm:grid-cols-2 xl:grid-cols-4">
              <p className="text-sm"><span className="block text-xs text-[#5B6472]">Age</span><strong>{calculateAge(selectedPatient.dob)}</strong></p>
              <p className="text-sm"><span className="block text-xs text-[#5B6472]">Blood group</span><strong>{selectedPatient.blood_group || 'Unknown'}</strong></p>
              <p className="text-sm"><span className="block text-xs text-[#5B6472]">Allergies</span><strong>{selectedPatient.allergies || 'Unknown'}</strong></p>
              <p className="text-sm"><span className="block text-xs text-[#5B6472]">Patient phone</span><strong>{selectedPatient.emergency_contact || 'Not provided'}</strong></p>
            </section>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold">Ward
              <select required value={wardId} onChange={(event) => setWardId(event.target.value)} className={inputClass}>
                <option value="">Select a ward</option>
                {wards.map((ward) => <option key={ward.ward_id} value={ward.ward_id}>{ward.ward_name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">Admitting doctor
              <select required value={doctorId} onChange={(event) => setDoctorId(event.target.value)} className={inputClass}>
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => <option key={doctor.staff_id} value={doctor.staff_id}>Dr. {doctor.first_name} {doctor.last_name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">Gender
              <select required value={gender} onChange={(event) => setGender(event.target.value as 'Female' | 'Male' | '')} className={inputClass}>
                <option value="">Select gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </label>
          </div>

          <label className="block text-sm font-semibold">Admission reason
            <textarea required minLength={1} maxLength={4000} rows={3} value={reason} onChange={(event) => setReason(event.target.value)} className={inputClass} />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold">Guardian name
              <input required maxLength={200} value={guardianName} onChange={(event) => setGuardianName(event.target.value)} className={inputClass} />
            </label>
            <label className="block text-sm font-semibold">Guardian relationship
              <select required value={guardianRelationship} onChange={(event) => setGuardianRelationship(event.target.value)} className={inputClass}>
                <option value="">Select relationship</option>
                {['Mother', 'Father', 'Spouse', 'Son', 'Daughter', 'Sibling', 'Legal guardian'].map((relationship) => <option key={relationship}>{relationship}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">Guardian contact number
              <input required type="tel" minLength={7} maxLength={20} pattern="[+]?[0-9 () .-]{7,20}" value={guardianContact} onChange={(event) => setGuardianContact(event.target.value)} className={inputClass} />
            </label>
          </div>

          <p className="text-sm text-[#5B6472]">A nurse will assign a bed in the selected ward after admission.</p>
          {!wards.length && <p className="text-sm text-amber-700">There are no wards available for admission.</p>}
          {!doctors.length && <p className="text-sm text-amber-700">There are no active doctors available to select.</p>}
          {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          {success && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{success}</p>}
          <button disabled={isSaving || isSuccessCooldown || !patientId || !wards.length || !doctors.length} className="w-full rounded-lg bg-[#0E4749] p-3.5 font-bold text-white transition-colors hover:bg-[#0a383a] disabled:cursor-not-allowed disabled:opacity-50">
            {isSaving ? 'Saving admission…' : isSuccessCooldown ? 'Admission recorded' : 'Confirm admission'}
          </button>
        </form>

        <aside className="min-w-0 rounded-2xl border border-[#DCE3E0] bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3 border-b border-[#E8EDEA] pb-4">
            <span className="rounded-lg bg-teal-50 p-2.5 text-[#0E4749]"><UserPlus className="h-5 w-5" /></span>
            <div><h3 className="font-bold text-[#0E4749]">Add patient</h3><p className="mt-1 text-xs text-[#5B6472]">Register a new patient here.</p></div>
          </div>
          <form onSubmit={registerPatient} className="space-y-4">
            <label className="block text-sm font-semibold">First name
              <input required maxLength={100} value={newPatient.first_name} onChange={(event) => setNewPatient((current) => ({ ...current, first_name: event.target.value }))} className={inputClass} />
            </label>
            <label className="block text-sm font-semibold">Last name
              <input required maxLength={100} value={newPatient.last_name} onChange={(event) => setNewPatient((current) => ({ ...current, last_name: event.target.value }))} className={inputClass} />
            </label>
            <label className="block text-sm font-semibold">Email
              <input required type="email" value={newPatient.email} onChange={(event) => setNewPatient((current) => ({ ...current, email: event.target.value }))} className={inputClass} />
            </label>
            <label className="block text-sm font-semibold">Date of birth
              <input required type="date" max={new Date().toISOString().slice(0, 10)} value={newPatient.dob} onChange={(event) => setNewPatient((current) => ({ ...current, dob: event.target.value }))} className={inputClass} />
            </label>
            <label className="block text-sm font-semibold">Patient phone
              <input required maxLength={20} value={newPatient.emergency_contact} onChange={(event) => setNewPatient((current) => ({ ...current, emergency_contact: event.target.value }))} className={inputClass} />
            </label>
            <label className="block text-sm font-semibold">Blood group
              <select value={newPatient.blood_group} onChange={(event) => setNewPatient((current) => ({ ...current, blood_group: event.target.value }))} className={inputClass}>
                <option>Unknown</option>
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((group) => <option key={group}>{group}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">Allergies
              <textarea rows={2} maxLength={2000} value={newPatient.allergies} onChange={(event) => setNewPatient((current) => ({ ...current, allergies: event.target.value }))} placeholder="Enter None or Unknown if applicable" className={inputClass} />
            </label>
            {patientError && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{patientError}</p>}
            {patientSuccess && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700">{patientSuccess}</p>}
            <button disabled={isRegistering} className="w-full rounded-lg bg-[#E07856] p-3 font-bold text-white transition-colors hover:bg-[#c96749] disabled:cursor-not-allowed disabled:opacity-50">
              {isRegistering ? 'Adding patient…' : 'Add patient'}
            </button>
          </form>
        </aside>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#DCE3E0] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCE3E0] p-5">
          <div>
            <h3 className="font-bold text-[#0E4749]">Active admissions</h3>
            <p className="mt-1 text-sm text-[#5B6472]">Includes pending admissions awaiting bed assignment and patients already assigned to a bed.</p>
          </div>
          <button
            type="button"
            onClick={() => void refreshAdmittedPatients()}
            disabled={isRefreshingAdmissions}
            className="rounded-lg border border-[#DCE3E0] px-4 py-2 text-sm font-semibold text-[#0E4749] hover:bg-teal-50 disabled:opacity-50"
          >
            {isRefreshingAdmissions ? 'Refreshing…' : 'Refresh list'}
          </button>
        </div>
        {admittedPatients.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-[#5B6472]">
                <tr>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Ward / bed</th>
                  <th className="p-4">Admitting doctor</th>
                  <th className="p-4">Admitted</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE3E0]">
                {admittedPatients.map((admission) => (
                  <tr key={admission.admission_id}>
                    <td className="p-4">
                      <span className="flex items-center gap-2 font-semibold text-gray-900">
                        <Hospital className="h-4 w-4 text-[#0E4749]" />
                        {admission.patient_name}
                      </span>
                    </td>
                    <td className="p-4">{admission.ward_name} · {admission.bed_number ? `Bed ${admission.bed_number}` : 'Bed pending'}</td>
                    <td className="p-4">{admission.admitted_doctor_name}</td>
                    <td className="p-4">{new Date(admission.admitted_at).toLocaleDateString()}</td>
                    <td className="p-4">{admission.status}</td>
                    <td className="max-w-sm p-4">{admission.admission_reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-6 text-center text-sm text-[#5B6472]">          No active admissions found.</p>
        )}
      </section>
    </div>
  );
}
