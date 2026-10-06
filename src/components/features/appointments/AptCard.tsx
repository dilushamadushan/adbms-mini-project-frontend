import React from 'react';
import { Clock, ClipboardList } from 'lucide-react';

export function AptCard({ time, patient, doctor, room, status }: any) {
  return (
    <div className="border border-[#DCE3E0] rounded-xl p-4 shadow-sm relative overflow-hidden bg-white">
      <div className={`absolute top-0 left-0 w-1 h-full ${status === 'CONFIRMED' ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-xs font-mono text-[#5B6472] mb-1">APT-882X</div>
          <div className="font-bold text-[#0E4749]">{patient}</div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
          status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
          'bg-amber-50 text-amber-700 border border-amber-200'
        }`}>{status}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <div className="text-gray-500 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> Time</div>
          <div className="font-medium">{time}</div>
        </div>
        <div>
          <div className="text-gray-500 text-xs flex items-center gap-1"><ClipboardList className="w-3 h-3" /> Location</div>
          <div className="font-medium">{room}</div>
        </div>
      </div>
      <div className="pt-3 border-t border-[#DCE3E0] flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-[#0E4749]">D</div>
        <div className="text-sm font-medium text-gray-700">{doctor}</div>
      </div>
    </div>
  );
}
