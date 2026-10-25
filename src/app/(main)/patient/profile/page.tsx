"use client";

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Check,
  Edit2,
  Loader2,
  Lock,
  Mail,
  Phone,
  ShieldAlert,
  User,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { useAuth } from '@/hooks/useAuth';
import {
  patientService,
  type PatientProfile as PatientProfileData,
  type UpdatePatientProfilePayload,
} from '@/services/patientService';

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
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }
  return age;
}

interface ProfileFormData {
  first_name: string;
  last_name: string;
  dob: string;
  emergency_contact: string;
  email: string;
}

export default function PatientProfile() {
  const { user, isLoading: isAuthLoading, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<PatientProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: '',
    last_name: '',
    dob: '',
    emergency_contact: '',
    email: '',
  });

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (isAuthLoading || !user || user.role !== 'PATIENT') return;

    let isActive = true;
    patientService
      .getMyProfile()
      .then((data) => {
        if (isActive) {
          setProfile(data);
          setFormData({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            dob: data.dob ? data.dob.slice(0, 10) : '',
            emergency_contact: data.emergency_contact || '',
            email: data.email || '',
          });
        }
      })
      .catch(() => {
        if (isActive) setLoadError('Your profile could not be loaded. Please try again later.');
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [isAuthLoading, user]);

  const handleStartEdit = () => {
    if (!profile) return;
    setFormData({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      dob: profile.dob ? profile.dob.slice(0, 10) : '',
      emergency_contact: profile.emergency_contact || '',
      email: profile.email || '',
    });
    setFormError('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        dob: profile.dob ? profile.dob.slice(0, 10) : '',
        emergency_contact: profile.emergency_contact || '',
        email: profile.email || '',
      });
    }
    setFormError('');
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validations
    const trimmedFirstName = formData.first_name.trim();
    const trimmedLastName = formData.last_name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedEmergency = formData.emergency_contact.trim();

    if (!trimmedFirstName) {
      setFormError('First name is required.');
      return;
    }
    if (!trimmedLastName) {
      setFormError('Last name is required.');
      return;
    }

    if (trimmedEmail) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(trimmedEmail)) {
        setFormError('Please provide a valid email address.');
        return;
      }
    }

    if (formData.dob && formData.dob > todayStr) {
      setFormError('Date of birth cannot be in the future.');
      return;
    }

    // STRICTLY Allowed fields only:
    // first_name, last_name, dob, emergency_contact, email
    // Prohibited: blood_group, allergies (never included to avoid 400 Bad Request)
    const payload: UpdatePatientProfilePayload = {
      first_name: trimmedFirstName,
      last_name: trimmedLastName,
      ...(trimmedEmail ? { email: trimmedEmail } : {}),
      ...(formData.dob ? { dob: formData.dob } : {}),
      ...(trimmedEmergency ? { emergency_contact: trimmedEmergency } : {}),
    };

    setIsSaving(true);
    try {
      await patientService.updateMyProfile(payload);
      toast.success('Profile updated successfully');

      // Refresh patient profile data from server
      const freshData = await patientService.getMyProfile();
      setProfile(freshData);
      setFormData({
        first_name: freshData.first_name || '',
        last_name: freshData.last_name || '',
        dob: freshData.dob ? freshData.dob.slice(0, 10) : '',
        emergency_contact: freshData.emergency_contact || '',
        email: freshData.email || '',
      });

      // Also refresh auth user context if email/name changed
      await refreshProfile();
      setIsEditing(false);
    } catch (err: unknown) {
      let message = 'Failed to update profile. Please try again.';
      if (err instanceof AxiosError && err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData.detail === 'string') {
          message = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          message = errorData.detail.map((item: { msg?: string }) => item.msg || 'Invalid field').join(', ');
        } else if (errorData.message) {
          message = errorData.message;
        }
      }
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

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
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-[#0E4749]">My Profile</h3>
          <p className="text-sm text-[#5B6472]">Manage your personal details and view your clinical record</p>
        </div>
        {profile && !isEditing && (
          <button
            type="button"
            onClick={handleStartEdit}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0E4749] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#093537] focus:outline-none focus:ring-2 focus:ring-[#0E4749] focus:ring-offset-2"
          >
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </button>
        )}
      </div>

      {isAuthLoading || (user?.role === 'PATIENT' && isLoading) ? (
        <div className="flex items-center gap-3 rounded-xl border border-[#DCE3E0] bg-white p-8 text-sm text-[#5B6472] shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-[#0E4749]" />
          <span>Loading your profile…</span>
        </div>
      ) : loadError ? (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 shadow-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          <span>{loadError}</span>
        </div>
      ) : !profile ? (
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 shadow-sm">
          {user?.role === 'PATIENT'
            ? 'A patient profile could not be found for this account.'
            : 'Sign in as a patient to view your profile.'}
        </div>
      ) : isEditing ? (
        /* Edit Mode */
        <form onSubmit={handleSaveProfile} className="overflow-hidden rounded-xl border border-[#DCE3E0] bg-white shadow-sm">
          <div className="border-b border-[#DCE3E0] bg-gradient-to-r from-teal-50/50 to-gray-50 px-6 py-5">
            <h4 className="text-lg font-bold text-gray-900">Edit Profile Details</h4>
            <p className="text-xs text-[#5B6472]">Update your basic personal and contact information below</p>
          </div>

          {formError && (
            <div className="mx-6 mt-6 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="first_name" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="First name"
                    className="w-full rounded-lg border border-[#DCE3E0] bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 transition focus:border-[#0E4749] focus:outline-none focus:ring-1 focus:ring-[#0E4749]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="last_name" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Last name"
                    className="w-full rounded-lg border border-[#DCE3E0] bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 transition focus:border-[#0E4749] focus:outline-none focus:ring-1 focus:ring-[#0E4749]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@example.com"
                    className="w-full rounded-lg border border-[#DCE3E0] bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 transition focus:border-[#0E4749] focus:outline-none focus:ring-1 focus:ring-[#0E4749]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="dob" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    id="dob"
                    name="dob"
                    type="date"
                    max={todayStr}
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-[#DCE3E0] bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 transition focus:border-[#0E4749] focus:outline-none focus:ring-1 focus:ring-[#0E4749]"
                  />
                </div>
                <p className="mt-1 text-[11px] text-gray-500">YYYY-MM-DD (cannot be a future date)</p>
              </div>
            </div>

            <div>
              <label htmlFor="emergency_contact" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Emergency Contact Phone
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  id="emergency_contact"
                  name="emergency_contact"
                  type="tel"
                  value={formData.emergency_contact}
                  onChange={handleInputChange}
                  placeholder="e.g. 0771234567"
                  className="w-full rounded-lg border border-[#DCE3E0] bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 transition focus:border-[#0E4749] focus:outline-none focus:ring-1 focus:ring-[#0E4749]"
                />
              </div>
            </div>

            {/* Read-only Medical Fields Notice */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start gap-2.5">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                <div>
                  <h6 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Clinical Data (Non-Editable)
                  </h6>
                  <p className="mt-1 text-xs text-gray-600">
                    For patient safety, <strong>Blood Group</strong> ({profile.blood_group || 'Not recorded'}) and{' '}
                    <strong>Known Allergies</strong> ({profile.allergies || 'None'}) can only be modified by hospital clinical staff.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[#DCE3E0] bg-gray-50 px-6 py-4">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleCancelEdit}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0E4749] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#093537] focus:outline-none focus:ring-2 focus:ring-[#0E4749] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Read-Only View Mode */
        <section className="overflow-hidden rounded-xl border border-[#DCE3E0] bg-white shadow-sm">
          <div className="flex items-center gap-4 border-b border-[#DCE3E0] bg-gray-50 p-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#0E4749] text-2xl font-bold text-white shadow">
              {initials || <User className="h-8 w-8" />}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-2xl font-bold text-gray-900">{fullName}</h4>
              <p className="mt-1 flex items-center gap-2 text-sm text-[#5B6472]">
                <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="truncate">{profile.email || profile.username}</span>
              </p>
            </div>
          </div>

          <div className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-500">Date of Birth</div>
                <div className="font-medium text-gray-900">
                  {formatDate(profile.dob)}
                  {age !== null ? ` (${age} years)` : ''}
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <span>Blood Group</span>
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">Clinical</span>
                </div>
                <div className="font-bold text-red-600">{profile.blood_group || 'Not provided'}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm font-bold text-amber-800">Known Allergies</span>
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">Clinical</span>
                </div>
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
