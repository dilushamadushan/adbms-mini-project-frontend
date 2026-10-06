import React from 'react';
import { LoadBar } from '@/components/ui/LoadBar';

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#DCE3E0] p-4 rounded-xl shadow-sm">
          <div className="text-sm text-[#5B6472] mb-1 font-medium">Bed Occupancy</div>
          <div className="text-2xl font-bold text-[#0E4749]">82.4%</div>
          <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">↗ 2.1% this week</div>
        </div>
        <div className="bg-white border border-[#DCE3E0] p-4 rounded-xl shadow-sm">
          <div className="text-sm text-[#5B6472] mb-1 font-medium">Staff on Duty</div>
          <div className="text-2xl font-bold text-[#0E4749]">142</div>
          <div className="text-xs text-[#E07856] mt-1 flex items-center gap-1">↘ 5 from avg</div>
        </div>
      </div>
      
      <div className="bg-white border border-[#DCE3E0] p-6 rounded-xl shadow-sm">
        <h3 className="font-bold text-[#0E4749] mb-4">Department Load</h3>
        <div className="space-y-4">
          <LoadBar label="Emergency" percent={92} />
          <LoadBar label="Cardiology" percent={78} />
          <LoadBar label="Pediatrics" percent={64} />
          <LoadBar label="Surgery" percent={85} />
        </div>
      </div>
    </div>
  );
}
