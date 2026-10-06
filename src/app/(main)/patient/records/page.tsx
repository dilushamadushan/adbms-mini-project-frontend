import React from 'react';
import { RecordEntry } from '@/components/features/records/RecordEntry';

export default function PatientRecords() {
  return (
    <div className="space-y-6">
      <h3 className="font-bold text-[#0E4749] text-xl mb-6">My Medical Records</h3>
      
      <div className="bg-white rounded-xl border border-[#DCE3E0] p-6 shadow-sm space-y-6">
        <RecordEntry 
          date="Oct 24, 2024" time="10:30 AM" 
          title="Routine Checkup" 
          desc="Patient reported mild fatigue. Recommended lifestyle adjustments and initiation of low-dose medication."
          vitals={{bp: "145/92", hr: "88bpm", temp: "98.6F"}}
          meds={[{name: "Lisinopril", dose: "10mg"}]}
          doctor="Dr. Sarah Chen"
        />
        <hr className="border-[#DCE3E0]" />
        <RecordEntry 
          date="Sep 12, 2024" time="02:15 PM" 
          title="Cardiology Consult" 
          desc="Routine quarterly check-up. Blood work ordered."
          vitals={{bp: "120/80", hr: "72bpm", temp: "98.2F"}}
          doctor="Dr. James Miller"
        />
      </div>
    </div>
  );
}
