"use client";

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { Hospital } from 'lucide-react';
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

function admissionNeedsGuardian(admission: AdmissionRecord): boolean {
  return !admission.guardian_name?.trim()
    || !admission.guardian_relationship?.trim()
    || !admission.guardian_contact?.trim();
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
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingAdmissions, setIsRefreshingAdmissions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccessCooldown, setIsSuccessCooldown] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedPatient = patients.find((patient) => String(patient.patient_id) === patientId);
  const selectedActiveAdmission = admittedPatients.find(
    (admission) => admission.patient_id === Number(patientId),
  );
  const selectedGuardianAdmission = selectedActiveAdmission && admissionNeedsGuardian(selectedActiveAdmission)
    ? selectedActiveAdmission
    : null;
  const guardianMissingAdmissions = admittedPatients
    .filter(admissionNeedsGuardian)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
    const activeAdmission = admittedPatients.find((admission) => admission.patient_id === patient.patient_id);
    if (activeAdmission) {
      setWardId(String(activeAdmission.ward_id));
      setDoctorId(String(activeAdmission.admitted_doctor_id));
      setGender(activeAdmission.gender || '');
      setReason(activeAdmission.admission_reason);
      setGuardianName(activeAdmission.guardian_name || '');
      setGuardianRelationship(activeAdmission.guardian_relationship || '');
      setGuardianContact(activeAdmission.guardian_contact || '');
    } else {
      setWardId('');
      setDoctorId('');
      setGender('');
      setReason('');
      setGuardianName('');
      setGuardianRelationship('');
      setGuardianContact('');
    }
    setError('');
    setSuccess('');
  }

  async function submitAdmission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!patientId) {
      setError('Select a patient from the name suggestions before submitting.');
      return;
    }
    if (!guardianName.trim() || !guardianRelationship || !guardianContact.trim()) {
      setError('Complete all required guardian fields.');
      return;
    }
    if (!selectedGuardianAdmission && selectedActiveAdmission) {
      setError('This patient already has an active admission.');
      return;
    }
    if (!selectedGuardianAdmission && (!wardId || !doctorId || !gender || !reason.trim())) {
      setError('Complete all required admission and guardian fields.');
      return;
    }
    if (!phonePattern.test(guardianContact.trim())) {
      setError('Enter a valid guardian contact number (7–20 digits, with optional +, spaces, parentheses, dots, or hyphens).');
      return;
    }

    setIsSaving(true);
    try {
      if (selectedGuardianAdmission) {
        const admission = await receptionistService.completeAdmissionGuardian(
          selectedGuardianAdmission.admission_id,
          {
            guardian_name: guardianName.trim(),
            guardian_relationship: guardianRelationship,
            guardian_contact: guardianContact.trim(),
          },
        );
        setAdmittedPatients((current) => current.map((currentAdmission) => (
          currentAdmission.admission_id === admission.admission_id ? admission : currentAdmission
        )));
        setSuccess(`Guardian details saved for ${admission.patient_name}. The existing admission was updated.`);
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
        return;
      }

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
        } else if (detail !== undefined && detail !== null) {
          setError(JSON.stringify(detail));
        } else if (caught.response?.status && caught.response.status >= 500) {
          setError('The server could not save the admission. Check that the Admissions table has the latest receptionist columns and review the backend error log.');
        } else if (caught.response?.status) {
          setError(`The admission request failed with HTTP ${caught.response.status}. Check the selected patient, ward, doctor, and guardian details.`);
        } else {
          setError('The server could not be reached. Check your connection and try again.');
        }
      } else {
        setError('An unexpected error prevented the admission from being saved.');
      }
    } finally {
      setIsSaving(false);
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
            <p className="mt-1 text-sm text-[#5B6472]">Select a patient by name or choose one from the list of active admissions missing guardian details.</p>
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
                setWardId('');
                setDoctorId('');
                setGender('');
                setReason('');
                setGuardianName('');
                setGuardianRelationship('');
                setGuardianContact('');
                setShowPatientSuggestions(true);
              }}
              placeholder="Patient name"
              className={inputClass}
            />
            {showPatientSuggestions && patientQuery.trim() && (
              <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-[#DCE3E0] bg-white py-1 shadow-lg">
                {matchingPatients.length ? matchingPatients.map((patient) => {
                  const activeAdmission = admittedPatients.find(
                    (admission) => admission.patient_id === patient.patient_id,
                  );
                  return (
                    <li key={patient.patient_id}>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => selectPatient(patient)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-teal-50"
                      >
                        <span>{patient.first_name} {patient.last_name}</span>
                        {activeAdmission && (
                          <span className="ml-2 text-xs font-semibold text-amber-700">
                            {admissionNeedsGuardian(activeAdmission) ? 'Guardian details required' : 'Already admitted'}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                }                ) : <li className="px-3 py-2 text-sm text-[#5B6472]">No matching patient found.</li>}
              </ul>
            )}
          </div>

          {selectedGuardianAdmission && (
            <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Add guardian details to complete this patient’s admission in {selectedGuardianAdmission.ward_name}
              {' '}({selectedGuardianAdmission.status}). The existing admission details are filled in below.
            </p>
          )}
          {selectedActiveAdmission && !selectedGuardianAdmission && (
            <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              This patient already has an active admission in {selectedActiveAdmission.ward_name}
              {' '}({selectedActiveAdmission.status}).
            </p>
          )}

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
              <select required={!selectedActiveAdmission} disabled={Boolean(selectedActiveAdmission)} value={selectedActiveAdmission ? String(selectedActiveAdmission.ward_id) : wardId} onChange={(event) => setWardId(event.target.value)} className={inputClass}>
                <option value="">Select a ward</option>
                {selectedActiveAdmission && !wards.some((ward) => ward.ward_id === selectedActiveAdmission.ward_id) && (
                  <option value={selectedActiveAdmission.ward_id}>{selectedActiveAdmission.ward_name}</option>
                )}
                {wards.map((ward) => <option key={ward.ward_id} value={ward.ward_id}>{ward.ward_name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">Admitting doctor
              <select required={!selectedActiveAdmission} disabled={Boolean(selectedActiveAdmission)} value={selectedActiveAdmission ? String(selectedActiveAdmission.admitted_doctor_id) : doctorId} onChange={(event) => setDoctorId(event.target.value)} className={inputClass}>
                <option value="">Select a doctor</option>
                {selectedActiveAdmission && !doctors.some((doctor) => doctor.staff_id === selectedActiveAdmission.admitted_doctor_id) && (
                  <option value={selectedActiveAdmission.admitted_doctor_id}>{selectedActiveAdmission.admitted_doctor_name}</option>
                )}
                {doctors.map((doctor) => <option key={doctor.staff_id} value={doctor.staff_id}>Dr. {doctor.first_name} {doctor.last_name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">Gender
              <select required={!selectedActiveAdmission} disabled={Boolean(selectedActiveAdmission)} value={selectedActiveAdmission?.gender || gender} onChange={(event) => setGender(event.target.value as 'Female' | 'Male' | '')} className={inputClass}>
                <option value="">Select gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </label>
          </div>

          <label className="block text-sm font-semibold">Admission reason
            <textarea required={!selectedActiveAdmission} readOnly={Boolean(selectedActiveAdmission)} minLength={1} maxLength={4000} rows={3} value={selectedActiveAdmission?.admission_reason ?? reason} onChange={(event) => setReason(event.target.value)} className={inputClass} />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold">Guardian name
              <input required maxLength={200} readOnly={Boolean(selectedActiveAdmission && !selectedGuardianAdmission)} value={guardianName} onChange={(event) => setGuardianName(event.target.value)} className={inputClass} />
            </label>
            <label className="block text-sm font-semibold">Guardian relationship
              <select required disabled={Boolean(selectedActiveAdmission && !selectedGuardianAdmission)} value={guardianRelationship} onChange={(event) => setGuardianRelationship(event.target.value)} className={inputClass}>
                <option value="">Select relationship</option>
                {['Guardian', 'Mother', 'Father', 'Spouse', 'Son', 'Daughter', 'Sibling', 'Legal guardian'].map((relationship) => <option key={relationship}>{relationship}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">Guardian contact number
              <input required type="tel" minLength={7} maxLength={20} pattern="[+]?[0-9 () .-]{7,20}" readOnly={Boolean(selectedActiveAdmission && !selectedGuardianAdmission)} value={guardianContact} onChange={(event) => setGuardianContact(event.target.value)} className={inputClass} />
            </label>
          </div>

          {!selectedGuardianAdmission && <p className="text-sm text-[#5B6472]">A nurse will assign a bed in the selected ward after admission.</p>}
          {!selectedGuardianAdmission && !wards.length && <p className="text-sm text-amber-700">There are no wards available for admission.</p>}
          {!selectedGuardianAdmission && !doctors.length && <p className="text-sm text-amber-700">There are no active doctors available to select.</p>}
          {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          {success && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{success}</p>}
          <button disabled={isSaving || isSuccessCooldown || !patientId || (Boolean(selectedActiveAdmission) && !selectedGuardianAdmission) || (!selectedGuardianAdmission && (!wards.length || !doctors.length))} className="w-full rounded-lg bg-[#0E4749] p-3.5 font-bold text-white transition-colors hover:bg-[#0a383a] disabled:cursor-not-allowed disabled:opacity-50">
            {isSaving ? 'Saving…' : isSuccessCooldown ? 'Saved' : selectedGuardianAdmission ? 'Save guardian details' : selectedActiveAdmission ? 'Already admitted' : 'Confirm admission'}
          </button>
        </form>

        <aside className="min-w-0 rounded-2xl border border-[#DCE3E0] bg-white p-5 shadow-sm">
          <div className="mb-4 border-b border-[#E8EDEA] pb-4">
            <h3 className="font-bold text-[#0E4749]">Patients missing guardian details</h3>
            <p className="mt-1 text-xs text-[#5B6472]">Active admissions, newest first by record creation time.</p>
          </div>
          {guardianMissingAdmissions.length ? (
            <ul className="max-h-[32rem] space-y-2 overflow-y-auto">
              {guardianMissingAdmissions.map((admission) => {
                const patient = patients.find((item) => item.patient_id === admission.patient_id);
                return (
                  <li key={admission.admission_id}>
                    <button
                      type="button"
                      disabled={!patient}
                      onClick={() => {
                        if (patient) selectPatient(patient);
                        else setError(`Patient details for ${admission.patient_name} could not be loaded.`);
                      }}
                      className="w-full rounded-lg border border-[#DCE3E0] p-3 text-left hover:border-[#0E4749] hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="block font-semibold text-[#0E4749]">{admission.patient_name}</span>
                      <span className="mt-1 block text-xs text-[#5B6472]">{admission.ward_name} · {admission.status}</span>
                      <time className="mt-1 block text-xs text-[#5B6472]" dateTime={admission.created_at}>
                        Created {new Date(admission.created_at).toLocaleString()}
                      </time>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-4 text-center text-sm text-[#5B6472]">No active admissions are missing guardian details.</p>
          )}
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
                  <th className="p-4">Guardian name</th>
                  <th className="p-4">Guardian phone</th>
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
                    <td className="p-4">{admission.guardian_name || 'Not provided'}</td>
                    <td className="p-4">{admission.guardian_contact || 'Not provided'}</td>
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
