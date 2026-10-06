import React from 'react';
import { Clock } from 'lucide-react';

export function PatientListItem({ name, id, details, status, date }: any) {
  return (
    <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#0E4749] text-white flex items-center justify-center font-bold text-lg">
          {name.charAt(0)}
        </div>
        <div>
          <div className="font-bold text-gray-900 text-sm md:text-base">{name}</div>
          <div className="text-xs text-[#5B6472] flex items-center gap-2 mt-1">
            <span className="font-mono bg-gray-100 px-1 rounded">{id}</span>
            <span>{details}</span>
          </div>
          <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Last visited {date}
          </div>
        </div>
      </div>
      <div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
          status === 'Critical' ? 'border-red-200 bg-red-50 text-red-700' :
          status === 'Recovering' ? 'border-teal-200 bg-teal-50 text-[#0E4749]' :
          'border-gray-200 bg-gray-50 text-gray-700'
        }`}>{status}</span>
      </div>
    </div>
  );
}
