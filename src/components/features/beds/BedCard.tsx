import React from 'react';
import { AlertCircle } from 'lucide-react';

export function BedCard({ id, patient, status, time }: any) {
  let borderColor = "border-[#DCE3E0]";
  let statusColor = "text-[#5B6472]";
  let dotColor = "bg-gray-300";
  let bgColor = "bg-white";

  if (status === "CRITICAL") {
    borderColor = "border-[#E07856]";
    statusColor = "text-[#E07856]";
    dotColor = "bg-[#E07856]";
    bgColor = "bg-red-50/30";
  } else if (status === "STABLE" || status === "MODERATE") {
    borderColor = "border-[#0E4749]";
    statusColor = "text-[#0E4749]";
    dotColor = "bg-[#0E4749]";
  } else if (status === "AVAILABLE") {
    borderColor = "border-emerald-200";
    statusColor = "text-emerald-600";
    dotColor = "bg-emerald-500";
  } else if (status === "CLEANING") {
    borderColor = "border-amber-200";
    statusColor = "text-amber-600";
    dotColor = "bg-amber-400";
  }

  return (
    <div className={`border ${borderColor} ${bgColor} rounded-xl p-4 flex flex-col justify-between min-h-[120px] shadow-sm relative`}>
      {status === 'CRITICAL' && <AlertCircle className="w-4 h-4 text-[#E07856] absolute top-4 right-4 opacity-50" />}
      <div>
        <div className="font-bold text-gray-900">{id}</div>
        {patient && <div className="text-sm font-medium text-[#0E4749] mt-1 line-clamp-1">{patient}</div>}
        {time && <div className="text-xs text-gray-500 mt-1">{time}</div>}
      </div>
      <div className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mt-4 ${statusColor}`}>
        <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
        {status}
      </div>
    </div>
  );
}
