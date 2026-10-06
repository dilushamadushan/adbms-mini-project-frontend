import React from 'react';
import { RecordEntry } from '@/components/features/records/RecordEntry';

export default function Records() {
  return (
    <div className="space-y-6">
      <div className="bg-[#0E4749] text-white p-6 rounded-xl flex items-center gap-4 shadow-sm">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">RS</div>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            Robert J. Sterling <span className="text-xs bg-white/20 px-2 py-1 rounded font-normal tabular-nums">ID: 8821-X</span>
          </h2>
          <p className="text-teal-100 text-sm mt-1">42 YRS • MALE • BLOOD: A-</p>
          <p className="text-teal-200 text-xs mt-1">⚠ Allergies: Penicillin, Peanuts</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#DCE3E0] p-6 shadow-sm space-y-6">
        <RecordEntry 
          date="Oct 24, 2024" time="10:30 AM" 
          title="Diagnosis" 
          desc="Patient presents with persistent mild hypertension. EKG shows normal rhythm but slightly elevated sinus rate. Recommended lifestyle adjustments and initiation of low-dose medication."
          vitals={{bp: "145/92", hr: "88bpm", temp: "98.6F"}}
          meds={[{name: "Lisinopril", dose: "10mg"}, {name: "Amlodipine", dose: "5mg"}]}
          doctor="Dr. Sarah Chen"
        />
        <hr className="border-[#DCE3E0]" />
        <RecordEntry 
          date="Sep 12, 2024" time="02:15 PM" 
          title="Follow-up" 
          desc="Routine quarterly check-up. Patient reporting improved sleep patterns after adjusted schedule. Physical examination unremarkable. Blood work ordered."
          vitals={{bp: "120/80", hr: "72bpm", temp: "98.2F"}}
          doctor="Dr. James Miller"
        />
      </div>
    </div>
  );
}
