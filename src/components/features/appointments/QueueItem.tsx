import React from 'react';

export function QueueItem({ time, patient, id, reason, status }: any) {
  const isUrgent = status === 'URGENT';
  return (
    <div className="flex items-start gap-4 p-4 border border-[#DCE3E0] rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors">
      <div className="w-16 flex-shrink-0 text-sm font-bold text-[#0E4749] pt-1">{time}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="font-bold text-gray-900">{patient}</div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isUrgent ? 'bg-red-100 text-red-700' : 
            status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>{status}</span>
        </div>
        <div className="text-xs text-[#5B6472] font-mono mb-1">{id}</div>
        <div className="text-sm text-gray-600">{reason}</div>
      </div>
    </div>
  );
}
