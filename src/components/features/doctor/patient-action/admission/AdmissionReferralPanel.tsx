'use client';

import React, { useState } from 'react';
import { BedDouble, LogOut, FileSearch, Pill } from 'lucide-react';
import { AdmitPatientForm } from './AdmitPatientForm';
import { DischargePatientForm } from './DischargePatientForm';
import { AdmissionDetailsView } from './AdmissionDetailsView';

type AdmissionViewTab = 'admit' | 'discharge' | 'details';

interface AdmissionReferralPanelProps {
  initialTab?: AdmissionViewTab;
  onAdmissionSubmit?: (data: any) => void | Promise<void>;
  onDischargeSubmit?: (data: any) => void | Promise<void>;
  onSwitchToPrescription?: () => void;
  isSubmitting?: boolean;
}

export function AdmissionReferralPanel({
  initialTab = 'discharge',
  onAdmissionSubmit,
  onDischargeSubmit,
  onSwitchToPrescription,
  isSubmitting = false,
}: AdmissionReferralPanelProps) {
  const [currentTab, setCurrentTab] = useState<AdmissionViewTab>(initialTab);

  const tabs: Array<{ id: AdmissionViewTab; label: string; icon: React.ElementType }> = [
    { id: 'admit', label: 'Admit', icon: BedDouble },
    { id: 'discharge', label: 'Discharge', icon: LogOut },
    { id: 'details', label: 'View Admission Details', icon: FileSearch },
  ];

  return (
    <div className="space-y-0">
      {/* 3 Tabs Row exactly as in the design screenshot */}
      <div className="grid grid-cols-3 rounded-t-xl border-t border-x border-[#DCE3E0] bg-gray-50/70 overflow-hidden">
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
        {currentTab === 'admit' && (
          <AdmitPatientForm
            onConfirmAdmit={(data) => {
              onAdmissionSubmit?.(data);
              setCurrentTab('details');
            }}
            isSubmitting={isSubmitting}
          />
        )}

        {currentTab === 'discharge' && (
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
          <AdmissionDetailsView />
        )}
      </div>
    </div>
  );
}
