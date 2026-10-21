'use client';

import React, { useState } from 'react';
import { BedDouble, LogOut, FileSearch, Pill } from 'lucide-react';
import { AdmitPatientForm } from './AdmitPatientForm';
import { DischargePatientForm } from './DischargePatientForm';
import { AdmissionDetailsView } from './AdmissionDetailsView';
import type { AdmissionDetails } from '@/types/patientAction';

type AdmissionViewTab = 'admit' | 'discharge' | 'details';

interface AdmissionReferralPanelProps {
  patientId: number;
  patientName: string;
  patientGender: string;
  doctorId: number;
  doctorName: string;
  userId: number;
  admissionReason: string;
  admission: AdmissionDetails | null;
  isAdmitted: boolean;
  initialTab?: AdmissionViewTab;
  onAdmissionSubmit?: (data: any) => void | Promise<void>;
  onDischargeSubmit?: (data: any) => void | Promise<void>;
  onAdmissionSubmit?: (data: import('@/types/patientAction').AdmissionRequestData) => Promise<void>;
  onDischargeSubmit?: (data: unknown) => void;
  onSwitchToPrescription?: () => void;
  isSubmitting?: boolean;
}

export function AdmissionReferralPanel({
  initialTab = 'discharge',
  patientId,
  patientName,
  patientGender,
  doctorId,
  doctorName,
  userId,
  admissionReason,
  admission,
  isAdmitted,
  onAdmissionSubmit,
  onDischargeSubmit,
  onSwitchToPrescription,
  isSubmitting = false,
}: AdmissionReferralPanelProps) {
  const [currentTab, setCurrentTab] = useState<AdmissionViewTab>(initialTab);

  React.useEffect(() => {
    setCurrentTab(isAdmitted ? 'discharge' : 'admit');
  }, [isAdmitted]);

  const tabs: Array<{ id: AdmissionViewTab; label: string; icon: React.ElementType }> = [
    ...(!isAdmitted ? [{ id: 'admit' as const, label: 'Admit', icon: BedDouble }] : []),
    ...(isAdmitted ? [{ id: 'discharge' as const, label: 'Discharge', icon: LogOut }] : []),
    { id: 'details', label: 'View Admission Details', icon: FileSearch },
  ];

  return (
    <div className="space-y-0">
      {/* 3 Tabs Row exactly as in the design screenshot */}
      <div className={`grid ${tabs.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} rounded-t-xl border-t border-x border-[#DCE3E0] bg-gray-50/70 overflow-hidden`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCurrentTab(tab.id)}
              className={`flex items-center justify-center gap-2 py-3 px-3 text-xs font-bold transition-all border-b-2 ${
                isActive
                  ? 'bg-white text-[#0E4749] border-[#0E4749] shadow-sm'
                  : 'text-[#5B6472] border-transparent hover:text-gray-900 hover:bg-gray-100/60'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-[#0E4749]' : 'text-blue-500'}`} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Card directly underneath */}
      <div className="rounded-b-xl border border-[#DCE3E0] bg-white p-5 shadow-sm space-y-4">
        {!isAdmitted && currentTab === 'admit' && (
          <AdmitPatientForm
            patientName={patientName}
            patientGender={patientGender}
            doctorId={doctorId}
            doctorName={doctorName}
            admissionReason={admissionReason}
            userId={userId}
            patientId={patientId}
            onConfirmAdmit={async (data) => {
              await onAdmissionSubmit?.(data);
              setCurrentTab('details');
            }}
            isSubmitting={isSubmitting}
          />
        )}

        {isAdmitted && currentTab === 'discharge' && (
          <DischargePatientForm
            onConfirmDischarge={(data) => {
              onDischargeSubmit?.(data);
              onSwitchToPrescription?.();
            }}
            onCancel={onSwitchToPrescription}
            isSubmitting={isSubmitting}
          />
        )}

        {currentTab === 'details' && (
          <AdmissionDetailsView admission={admission} />
        )}
      </div>
    </div>
  );
}
