'use client';

import React, { useEffect, useState } from 'react';
import { BedDouble, Check } from 'lucide-react';
import { toast } from 'sonner';
import { patientActionService } from '@/services/patientActionService';
import type { AdmissionRequestData, WardOption } from '@/types/patientAction';

interface AdmitPatientFormProps {
  patientId: number;
  patientName: string;
  patientGender: string;
  doctorId: number;
  doctorName: string;
  admissionReason: string;
  userId: number;
  onConfirmAdmit: (data: AdmissionRequestData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function AdmitPatientForm({
  patientName: initialPatientName,
  patientGender,
  patientId,
  doctorId,
  doctorName,
  admissionReason,
  userId,
  onConfirmAdmit,
  onCancel,
  isSubmitting = false,
}: AdmitPatientFormProps) {
  const [patientName, setPatientName] = useState(initialPatientName);
  const [reason, setReason] = useState(admissionReason);
  const [gender, setGender] = useState(patientGender);
  const [wardId, setWardId] = useState<number | ''>('');
  const [wardNames, setWardNames] = useState<WardOption[]>([]);
  const [wardError, setWardError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    let active = true;
    setWardError(null);

    patientActionService
      .getWardNames()
      .then((names) => {
        if (active) {
          setWardNames(names);
          if (names.length > 0) {
            setWardId(names[0].ward_id);
          }
        }
      })
      .catch(() => {
        if (active) {
          setWardError('Unable to load available wards');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaved(false);
    if (!patientId || !gender || wardId === '' || !reason.trim() || !doctorId || !userId) {
      const message = 'Patient, gender, ward, reason, doctor, and user are required.';
      setFormError(message);
      toast.error(message);
      return;
    }
    setShowConfirmation(true);
  };

  const confirmAdmission = async () => {
    setShowConfirmation(false);
    try {
      await onConfirmAdmit({
        patient_id: patientId,
        gender,
        ward_id: wardId,
        reason: reason.trim(),
        doctor_id: doctorId,
        user_id: userId,
      });
      setSaved(true);
      setReason('');
      toast.success('Admission request saved');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save admission request';
      setFormError(message);
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
        <BedDouble className="h-4 w-4 text-[#0E4749]" />
        <span>Inpatient Admission Request</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-700 font-semibold mb-1">Patient Name</label>
          <input
            type="text"
            value={patientName}
            className="w-full rounded-lg border border-slate-200 py-1.5 px-2.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#0E4749]"
            readOnly
            required
          />
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-1">Patient Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-1.5 px-2.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#0E4749]"
          >
            {!['Female', 'Male', 'Other'].includes(patientGender) && (
              <option value={patientGender}>{patientGender}</option>
            )}
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-1">Ward</label>
          <select
            value={wardId}
            onChange={(e) => setWardId(Number(e.target.value))}
            disabled={wardNames.length === 0}
            className="w-full rounded-lg border border-slate-200 py-1.5 px-2.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#0E4749]"
          >
            {wardNames.length === 0 && <option value="">Loading wards...</option>}
            {wardNames.map((ward) => (
              <option key={ward.ward_id} value={ward.ward_id}>{ward.ward_name}</option>
            ))}
          </select>
          {wardError && <p className="mt-1 text-[11px] text-red-600">{wardError}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-slate-700 font-semibold mb-1">Reason for Admission</label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for admission"
            className="w-full resize-y rounded-lg border border-slate-200 px-2.5 py-2 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#0E4749]"
            required
          />
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-1">Attending / Responsible Doctor</label>
          <select
            value={doctorId}
            disabled
            className="w-full rounded-lg border border-slate-200 py-1.5 px-2.5 text-xs text-slate-800 bg-slate-50 focus:outline-none focus:border-[#0E4749]"
          >
            <option value={doctorId}>{doctorName}</option>
          </select>
        </div>
      </div>

      {formError && <p className="text-xs font-medium text-red-600">{formError}</p>}
      {saved && <p className="text-xs font-medium text-emerald-600">Admission request saved</p>}

      <div className="flex justify-end gap-2.5 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0E4749] px-4 py-1.5 text-xs font-bold text-white hover:bg-teal-900 transition-colors shadow-sm disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" />
          {isSubmitting ? 'Saving...' : 'Confirm Admission'}
        </button>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-[2px]">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admission-confirmation-title"
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-teal-50 text-[#0E4749]">
                <BedDouble className="h-5 w-5" />
              </div>
              <div>
                <h3 id="admission-confirmation-title" className="text-sm font-bold text-slate-900">
                  Confirm Admission Request
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Submit an admission request for <span className="font-semibold text-slate-700">{patientName}</span>?
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Ward:</span>{' '}
              {wardNames.find((ward) => ward.ward_id === wardId)?.ward_name || 'Selected ward'}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAdmission}
                disabled={isSubmitting}
                className="rounded-lg bg-[#0E4749] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-teal-900 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Confirm Admission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
