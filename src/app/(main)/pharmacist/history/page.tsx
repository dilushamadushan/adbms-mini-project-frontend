"use client";

import React from 'react';
import { History } from 'lucide-react';

export default function PharmacistHistory() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-bold text-[#0E4749] text-2xl tracking-tight flex items-center gap-2">
            <History className="w-7 h-7 text-[#0E4749]" /> Dispensing History
          </h1>
          <p className="text-sm text-[#5B6472] mt-0.5">
            Audit trail of all dispensed medications and pharmacist records.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm p-8 text-center">
        <p className="text-sm text-[#5B6472]">
          Dispensing History shell initialized. Ready for Screen 4: Dispensing History.
        </p>
      </div>
    </div>
  );
}
