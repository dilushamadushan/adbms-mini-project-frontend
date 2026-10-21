"use client";

import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function PharmacistReports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-bold text-[#0E4749] text-2xl tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-[#0E4749]" /> Pharmacy Analytics & Reports
          </h1>
          <p className="text-sm text-[#5B6472] mt-0.5">
            Dispensing statistics, revenue rollup, and critical stock depletion forecasts.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm p-8 text-center">
        <p className="text-sm text-[#5B6472]">
          Reports shell initialized. Ready for Screen 5: Reports.
        </p>
      </div>
    </div>
  );
}
