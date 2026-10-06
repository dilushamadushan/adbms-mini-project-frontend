import React from 'react';
import { PatientListItem } from '@/components/features/patients/PatientListItem';

export default function NursePatientsList() {
  return (
    <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#DCE3E0] flex justify-between items-center bg-gray-50">
        <span className="text-sm font-medium text-[#5B6472]">12 ADMITTED PATIENTS</span>
      </div>
      <div className="divide-y divide-[#DCE3E0]">
        <PatientListItem name="Robert Jenkins" id="Bed A-101" details="General Med" status="Stable" date="Oct 20, 2024" />
        <PatientListItem name="Michael Chen" id="Bed A-104" details="General Med" status="Critical" date="Oct 24, 2024" />
      </div>
    </div>
  );
}
