import React from 'react';
import { Pill, RefreshCw } from 'lucide-react';

export default function PatientPrescriptions() {
  return (
    <div className="space-y-6">
      <h3 className="font-bold text-[#0E4749] text-xl mb-4">My Prescriptions</h3>
      
      <div className="grid gap-4">
        <div className="bg-white border border-[#DCE3E0] rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2"><Pill className="w-5 h-5 text-[#0E4749]"/> Lisinopril</h4>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Active</span>
          </div>
          <p className="text-sm text-[#5B6472] font-mono mb-4">10mg • Take 1 tablet daily with water</p>
          <div className="flex items-center justify-between pt-4 border-t border-[#DCE3E0]">
            <div className="text-xs text-gray-500">Prescribed by Dr. Sarah Chen</div>
            <button className="text-xs font-bold text-[#0E4749] flex items-center gap-1 hover:underline"><RefreshCw className="w-3 h-3"/> Request Refill</button>
          </div>
        </div>

        <div className="bg-white border border-[#DCE3E0] rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2"><Pill className="w-5 h-5 text-[#0E4749]"/> Vitamin D3</h4>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Active</span>
          </div>
          <p className="text-sm text-[#5B6472] font-mono mb-4">2000IU • Take 1 capsule daily</p>
          <div className="flex items-center justify-between pt-4 border-t border-[#DCE3E0]">
            <div className="text-xs text-gray-500">Prescribed by Dr. James Miller</div>
            <button className="text-xs font-bold text-[#0E4749] flex items-center gap-1 hover:underline"><RefreshCw className="w-3 h-3"/> Request Refill</button>
          </div>
        </div>
      </div>
    </div>
  );
}
