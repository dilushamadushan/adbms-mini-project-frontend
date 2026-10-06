import React from 'react';
import Link from 'next/link';
import { ShieldAlert, FileText, Pill } from 'lucide-react';
import { RecordEntry } from '@/components/features/records/RecordEntry';

export default function PatientRecordView({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      
      <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#DCE3E0] flex flex-wrap items-center justify-between gap-4 bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#0E4749] text-white flex items-center justify-center font-bold text-2xl">S</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Sarah Jenkins</h2>
              <div className="text-sm text-[#5B6472] font-mono">Patient ID: {params.id} • 42y • F • Blood: O+</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/doctor/write" className="bg-white border border-[#DCE3E0] hover:border-[#0E4749] text-[#0E4749] px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
              <FileText className="w-4 h-4" /> Add Diagnosis
            </Link>
            <Link href="/doctor/write" className="bg-[#E07856] hover:bg-[#c96749] text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
              <Pill className="w-4 h-4" /> Write Rx
            </Link>
          </div>
        </div>
        
        
        <div className="p-6 grid md:grid-cols-2 gap-6">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-amber-800 mb-1">Severe Allergies</div>
              <div className="text-sm text-amber-700 font-bold uppercase tracking-wide">Penicillin</div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-gray-50 border border-[#DCE3E0] p-3 rounded-lg flex-1">
              <div className="text-xs text-[#5B6472] font-bold uppercase mb-1">Last BP</div>
              <div className="text-xl font-bold text-[#0E4749] tabular-nums">120/80</div>
            </div>
            <div className="bg-gray-50 border border-[#DCE3E0] p-3 rounded-lg flex-1">
              <div className="text-xs text-[#5B6472] font-bold uppercase mb-1">Pulse</div>
              <div className="text-xl font-bold text-[#0E4749] tabular-nums">72 bpm</div>
            </div>
          </div>
        </div>
      </div>

      
      <h3 className="font-bold text-[#0E4749] text-lg">Visit History</h3>
      <div className="bg-white rounded-xl border border-[#DCE3E0] p-6 shadow-sm space-y-6">
        <RecordEntry 
          date="Oct 10, 2024" time="09:00 AM" 
          title="Post-Op Checkup" 
          desc="Incision site healing well. No signs of infection. Patient reports mild discomfort during physical therapy."
          vitals={{bp: "122/82", hr: "75bpm", temp: "98.4F"}}
          meds={[{name: "Ibuprofen", dose: "400mg"}]}
          doctor="Dr. Sarah Jenkins (You)"
        />
        <hr className="border-[#DCE3E0]" />
        <RecordEntry 
          date="Sep 25, 2024" time="11:30 AM" 
          title="Surgery: ACL Repair" 
          desc="Successful arthroscopic ACL reconstruction using patellar tendon autograft."
          doctor="Dr. Sarah Jenkins (You)"
        />
      </div>
    </div>
  );
}
