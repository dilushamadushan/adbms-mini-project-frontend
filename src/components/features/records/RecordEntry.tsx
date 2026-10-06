import React from 'react';
import { Calendar, Clock } from 'lucide-react';

export function RecordEntry({ date, time, title, desc, vitals, meds, doctor }: any) {
  return (
    <div className="pl-4 border-l-2 border-[#DCE3E0] relative pb-6 last:pb-0">
      <div className="absolute w-3 h-3 bg-[#0E4749] rounded-full -left-[7px] top-1"></div>
      <div className="flex flex-wrap gap-4 text-xs font-medium text-[#5B6472] mb-2">
        <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {date}</div>
        <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {time}</div>
      </div>
      <h4 className="font-bold text-gray-900 text-lg mb-2">{title}</h4>
      <p className="text-sm text-gray-600 italic mb-4">{desc}</p>
      
      {vitals && (
        <div className="flex gap-2 mb-4">
          {Object.entries(vitals).map(([k, v]) => (
            <div key={k} className="bg-gray-50 border border-[#DCE3E0] rounded px-2 py-1 text-xs">
              <span className="text-[#5B6472] font-semibold uppercase mr-1">{k}</span>
              <span className="font-bold text-gray-900">{v as string}</span>
            </div>
          ))}
        </div>
      )}

      {meds && (
        <div className="bg-gray-50 p-3 rounded-lg border border-[#DCE3E0] mb-4">
          <div className="text-xs font-bold text-[#5B6472] uppercase mb-2 flex items-center gap-1">
            PRESCRIBED MEDICATIONS
          </div>
          {meds.map((m: any, i: number) => (
            <div key={i} className="flex justify-between items-center text-sm py-1 border-b border-gray-200 last:border-0">
              <span className="font-semibold text-[#0E4749]">{m.name}</span>
              <span className="font-mono text-gray-600 bg-white px-1.5 rounded">{m.dose}</span>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex justify-between items-center pt-2">
        <div className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs">Dr</div>
          {doctor}
        </div>
        <button className="text-xs font-bold text-[#0E4749] uppercase tracking-wider">Details &gt;</button>
      </div>
    </div>
  );
}
