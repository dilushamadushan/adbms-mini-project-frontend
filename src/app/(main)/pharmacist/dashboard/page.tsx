"use client";

import React from 'react';
import { ClipboardList } from 'lucide-react';

export default function PharmacistDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-bold text-[#0E4749] text-2xl tracking-tight flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-[#0E4749]" /> Pending Prescriptions
          </h1>
          <p className="text-sm text-[#5B6472] mt-0.5">
            Review doctor orders and safely dispense prescribed medications.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm p-8 text-center">
        <p className="text-sm text-[#5B6472]">
          Pharmacist shell initialized. Ready for Screen 1: Pending Prescriptions.
        </p>
      </div>
    </div>
  );
}
