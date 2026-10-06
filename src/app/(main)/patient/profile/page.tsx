import React from 'react';
import { User, ShieldAlert, Phone } from 'lucide-react';

export default function PatientProfile() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h3 className="font-bold text-[#0E4749] text-xl mb-4">My Profile</h3>
      
      <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#DCE3E0] flex items-center gap-4 bg-gray-50">
          <div className="w-20 h-20 rounded-full bg-[#0E4749] text-white flex items-center justify-center font-bold text-3xl">R</div>
          <div>
            <h4 className="text-2xl font-bold text-gray-900">Robert C. Miller</h4>
            <div className="text-sm text-[#5B6472] font-mono">Patient ID: MS-8821</div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Date of Birth</div>
              <div className="font-medium text-gray-900">1960-05-14 (64y)</div>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Blood Group</div>
              <div className="font-medium text-red-600 font-bold">A-</div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-amber-800 mb-1">Known Allergies</div>
              <div className="text-sm text-amber-700">Penicillin, Peanuts (Severe)</div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#DCE3E0]">
            <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Phone className="w-4 h-4 text-[#0E4749]"/> Emergency Contact</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Name</div>
                <div className="font-medium text-gray-900">Sarah Miller (Daughter)</div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone</div>
                <div className="font-medium font-mono text-gray-900">+1 (555) 019-8234</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
