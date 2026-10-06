import React from 'react';
import { Plus } from 'lucide-react';
import { PatientListItem } from '@/components/features/patients/PatientListItem';

export default function Patients() {
  return (
    <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#DCE3E0] flex justify-between items-center bg-gray-50">
        <span className="text-sm font-medium text-[#5B6472]">3 PATIENTS FOUND</span>
        <button className="bg-[#0E4749] text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1">
          <Plus className="w-4 h-4" /> New Patient
        </button>
      </div>
      <div className="divide-y divide-[#DCE3E0]">
        <PatientListItem name="Robert C. Miller" id="MS-8821" details="64y • M • A+" status="Critical" date="2024-05-20" />
        <PatientListItem name="Elena Rodriguez" id="MS-4490" details="28y • F • O-" status="Stable" date="2024-05-18" />
        <PatientListItem name="Samuel Lee" id="MS-2215" details="41y • M • B+" status="Recovering" date="2024-05-15" />
      </div>
    </div>
  );
}
