"use client";

import { useEffect, useState } from 'react';
import { Phone, ShieldAlert, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { patientService, type PatientProfile as PatientProfileData } from '@/services/patientService';

function formatDate(value: string | null) {
  if (!value) return 'Not provided';
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? 'Not provided'
    : date.toLocaleDateString(undefined, { dateStyle: 'long' });
}

function calculateAge(value: string | null) {
  if (!value) return null;
  const birthDate = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  if (
    today.getMonth() < birthDate.getMonth()
    || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }
  return age;
}

export default function PatientProfile() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [profile, setProfile] = useState<PatientProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (isAuthLoading || !user || user.role !== 'PATIENT') return;

    let isActive = true;
    patientService.getMyProfile()
      .then((data) => {
        if (isActive) setProfile(data);
      })
      .catch(() => {
        if (isActive) setLoadError('Your profile could not be loaded. Please try again later.');
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => { isActive = false; };
  }, [isAuthLoading, user]);

  const fullName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : '';
  const age = calculateAge(profile?.dob ?? null);
  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="max-w-2xl space-y-6">
      <h3 className="text-xl font-bold text-[#0E4749]">My Profile</h3>

      {isAuthLoading || (user?.role === 'PATIENT' && isLoading) ? (
        <p className="rounded-lg border border-[#DCE3E0] bg-white p-5 text-sm text-[#5B6472]">Loading your profile…</p>
      ) : loadError ? (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{loadError}</p>
      ) : !profile ? (
        <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          {user?.role === 'PATIENT' ? 'A patient profile could not be found for this account.' : 'Sign in as a patient to view your profile.'}
        </p>
      ) : (
        <section className="overflow-hidden rounded-xl border border-[#DCE3E0] bg-white shadow-sm">
          <div className="flex items-center gap-4 border-b border-[#DCE3E0] bg-gray-50 p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0E4749] text-2xl font-bold text-white">
              {initials || <User className="h-8 w-8" />}
            </div>
            <div>
              <h4 className="text-2xl font-bold text-gray-900">{fullName}</h4>
              <p className="mt-1 text-sm text-[#5B6472]">{profile.email || profile.username}</p>
            </div>
          </div>

          <div className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-500">Date of Birth</div>
                <div className="font-medium text-gray-900">
                  {formatDate(profile.dob)}{age !== null ? ` (${age} years)` : ''}
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-500">Blood Group</div>
                <div className="font-bold text-red-600">{profile.blood_group || 'Not provided'}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <div className="mb-1 text-sm font-bold text-amber-800">Known Allergies</div>
                <div className="text-sm text-amber-700">{profile.allergies || 'None recorded'}</div>
              </div>
            </div>

            <div className="border-t border-[#DCE3E0] pt-4">
              <h5 className="mb-3 flex items-center gap-2 font-bold text-gray-900">
                <Phone className="h-4 w-4 text-[#0E4749]" /> Emergency Contact
              </h5>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Phone</div>
              <div className="mt-1 font-mono font-medium text-gray-900">
                {profile.emergency_contact || 'Not provided'}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
