import React from 'react';

export function LoadBar({ label, percent }: { label: string, percent: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-[#5B6472]">{label}</span>
      </div>
      <div className="h-4 bg-gray-100 rounded-sm overflow-hidden">
        <div className="h-full bg-[#0E4749] transition-all duration-1000" style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}
