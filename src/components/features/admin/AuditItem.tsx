import React from 'react';
import { Clock } from 'lucide-react';

export function AuditItem({ user, action, resource, risk, time }: any) {
  return (
    <div className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="w-10 h-10 rounded-full bg-[#0E4749] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
        {user.charAt(0)}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div className="font-bold text-gray-900 text-sm">{user}</div>
          <div className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {time}</div>
        </div>
        <div className="text-sm text-gray-700 mt-0.5">{action}</div>
        <div className="flex gap-2 mt-2">
          <span className="text-[10px] font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{resource}</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
            risk === 'HIGH' ? 'bg-red-100 text-red-700' : 
            risk === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
          }`}>{risk}</span>
        </div>
      </div>
    </div>
  );
}
