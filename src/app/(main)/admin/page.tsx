import React from 'react';
import { RecentAuditLogs } from '@/components/features/admin/RecentAuditLogs';

export default function Admin() {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div> SYSTEM STATUS: OPTIMAL
        </div>
        <h2 className="text-2xl font-bold">Health Monitoring</h2>
        <p className="text-slate-400 text-sm">Real-time infrastructure & service integrity checks.</p>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/10 p-4 rounded-lg">
            <div className="text-slate-300 text-xs mb-1">API LATENCY</div>
            <div className="text-2xl font-bold">42ms</div>
          </div>
          <div className="bg-white/10 p-4 rounded-lg">
            <div className="text-slate-300 text-xs mb-1">SERVER LOAD</div>
            <div className="text-2xl font-bold">68%</div>
          </div>
        </div>
      </div>

      <RecentAuditLogs limit={4} />
    </div>
  );
}

