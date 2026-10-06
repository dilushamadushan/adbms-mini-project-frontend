import React from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { PatientListItem } from '@/components/features/patients/PatientListItem';

export default function DoctorPatientSearch() {
  return (
    <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#DCE3E0] bg-gray-50 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search patients by name or MRN..." className="w-full pl-10 pr-4 py-2 border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749] text-sm" />
        </div>
        <button className="bg-[#0E4749] text-white px-6 py-2 rounded-lg font-bold text-sm">Search</button>
      </div>
      
      <div className="divide-y divide-[#DCE3E0]">
        <Link href="/doctor/patients/MS-8821" className="block"><PatientListItem name="Sarah Jenkins" id="MS-8821" details="42y • F • O+" status="Stable" date="Oct 10, 2024" /></Link>
        <Link href="/doctor/patients/MS-1102" className="block"><PatientListItem name="Michael Ross" id="MS-1102" details="35y • M • A-" status="Stable" date="Sep 01, 2024" /></Link>
      </div>
    </div>
  );
}
