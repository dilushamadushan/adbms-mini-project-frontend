import React from 'react';
import { User, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export function LabItem({ title, patient, date, status }: any) {
  const isCritical = status === 'Critical';
  const isDone = status === 'Completed';
  return (
    <div className="p-4 flex justify-between items-center hover:bg-gray-50">
      <div>
        <div className="text-xs font-mono text-[#5B6472] mb-0.5">#LAB-29X</div>
        <div className="font-bold text-gray-900">{title}</div>
        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <User className="w-3 h-3" /> {patient}
        </div>
      </div>
      <div className="text-right">
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border mb-1 ${
          isCritical ? 'bg-red-50 border-red-200 text-red-700' :
          isDone ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
          'bg-amber-50 border-amber-200 text-amber-700'
        }`}>
          {isDone ? <CheckCircle className="w-3 h-3" /> : (isCritical ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />)}
          {status}
        </span>
        <div className="text-xs text-gray-400 font-medium">{date}</div>
      </div>
    </div>
  );
}
