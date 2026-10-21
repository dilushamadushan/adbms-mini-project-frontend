"use client";

import { useState, type FormEvent } from 'react';
import { CheckCircle, Loader2, UserPlus } from 'lucide-react';
import { receptionistService, type RecepPatientRecord } from '@/services/receptionistService';

export default function ReceptionistPatientRegistration() {
  const [isLoading, setIsLoading] = useState(false);
  const [registeredPatient, setRegisteredPatient] = useState<RecepPatientRecord | null>(null);
  const [error, setError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('Unknown');
  const [email, setEmail] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [allergies, setAllergies] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const created = await receptionistService.registerPatient({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        dob,
        blood_group: bloodGroup,
        emergency_contact: emergencyContact.trim(),
        allergies: allergies.trim() || 'Unknown',
      });
      setRegisteredPatient(created);
    } catch {
      setError('Patient registration failed. Check that the email is not already registered and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setFirstName('');
    setLastName('');
    setDob('');
    setBloodGroup('Unknown');
    setEmail('');
    setEmergencyContact('');
    setAllergies('');
    setRegisteredPatient(null);
    setError('');
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h3 className="text-xl font-bold text-[#0E4749]">Patient Registration</h3>
      <section className="overflow-hidden rounded-xl border border-[#DCE3E0] bg-white shadow-sm">
        <div className="flex items-center gap-2 bg-[#0E4749] p-4 font-bold text-white">
          <UserPlus className="h-5 w-5" /> New Patient Intake Form
        </div>

        {registeredPatient ? (
          <div className="flex flex-col items-center p-8 text-center md:p-12">
            <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-9 w-9 text-emerald-600" />
            </span>
            <h4 className="text-2xl font-bold text-gray-900">Patient registered</h4>
            <p className="mt-2 text-sm text-[#5B6472]">The patient record has been saved to the database.</p>
            <div className="mt-6 w-full max-w-md rounded-xl border border-[#DCE3E0] bg-gray-50 p-5 text-left">
              <p className="py-2 text-sm"><span className="font-semibold">Patient:</span> {registeredPatient.first_name} {registeredPatient.last_name}</p>
              <p className="border-t border-gray-200 py-2 text-sm"><span className="font-semibold">Portal username:</span> {registeredPatient.username}</p>
              {registeredPatient.raw_password && <p className="border-t border-gray-200 py-2 text-sm"><span className="font-semibold">Temporary password:</span> <span className="font-mono">{registeredPatient.raw_password}</span></p>}
            </div>
            <button type="button" onClick={resetForm} className="mt-6 rounded-lg bg-[#0E4749] px-6 py-3 font-bold text-white hover:bg-[#0a3335]">
              Register another patient
            </button>
          </div>
        ) : (
          <form className="space-y-6 p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block text-sm font-semibold text-gray-800">
                First name
                <input required maxLength={100} value={firstName} onChange={(event) => setFirstName(event.target.value)} className="mt-2 w-full rounded-lg border border-[#DCE3E0] p-3 font-normal focus:border-[#0E4749] focus:outline-none" />
              </label>
              <label className="block text-sm font-semibold text-gray-800">
                Last name
                <input required maxLength={100} value={lastName} onChange={(event) => setLastName(event.target.value)} className="mt-2 w-full rounded-lg border border-[#DCE3E0] p-3 font-normal focus:border-[#0E4749] focus:outline-none" />
              </label>
              <label className="block text-sm font-semibold text-gray-800">
                Date of birth
                <input required type="date" max={new Date().toISOString().slice(0, 10)} value={dob} onChange={(event) => setDob(event.target.value)} className="mt-2 w-full rounded-lg border border-[#DCE3E0] bg-white p-3 font-normal focus:border-[#0E4749] focus:outline-none" />
              </label>
              <label className="block text-sm font-semibold text-gray-800">
                Blood group
                <select value={bloodGroup} onChange={(event) => setBloodGroup(event.target.value)} className="mt-2 w-full rounded-lg border border-[#DCE3E0] bg-white p-3 font-normal focus:border-[#0E4749] focus:outline-none">
                  <option>Unknown</option>
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((group) => <option key={group}>{group}</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold text-gray-800">
                Emergency contact
                <input required maxLength={20} value={emergencyContact} onChange={(event) => setEmergencyContact(event.target.value)} placeholder="Phone number" className="mt-2 w-full rounded-lg border border-[#DCE3E0] p-3 font-normal focus:border-[#0E4749] focus:outline-none" />
              </label>
              <label className="block text-sm font-semibold text-gray-800">
                Email for patient portal
                <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-[#DCE3E0] p-3 font-normal focus:border-[#0E4749] focus:outline-none" />
              </label>
              <label className="block text-sm font-semibold text-gray-800 md:col-span-2">
                Allergies
                <textarea rows={3} maxLength={2000} value={allergies} onChange={(event) => setAllergies(event.target.value)} placeholder="List allergies, or enter None or Unknown." className="mt-2 w-full rounded-lg border border-[#DCE3E0] p-3 font-normal focus:border-[#0E4749] focus:outline-none" />
                <span className="mt-1 block text-xs font-normal text-[#5B6472]">Enter “None” or “Unknown” if there are no confirmed allergy details.</span>
              </label>
            </div>
            {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
            <div className="flex justify-end gap-3 border-t border-[#DCE3E0] pt-5">
              <button type="button" onClick={resetForm} disabled={isLoading} className="rounded-lg px-5 py-3 font-semibold text-[#5B6472] hover:bg-gray-100 disabled:opacity-50">Clear form</button>
              <button type="submit" disabled={isLoading} className="flex items-center gap-2 rounded-lg bg-[#E07856] px-6 py-3 font-bold text-white hover:bg-[#c96749] disabled:opacity-50">
                {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                {isLoading ? 'Registering…' : 'Register patient'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
