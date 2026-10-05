import React from 'react';
import { AuditItem } from '@/components/features/admin/AuditItem';

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

      <div className="bg-white rounded-xl border border-[#DCE3E0] p-6 shadow-sm">
        <h3 className="font-bold text-[#0E4749] mb-4">Recent Audit Logs</h3>
        <div className="space-y-4">
          <AuditItem user="Dr. Sarah Jenkins" action="Modified Patient Prescription" resource="MED_DB_09" risk="MEDIUM" time="2m ago" />
          <AuditItem user="Nurse Michael Chen" action="Accessed Lab Result" resource="LAB_TESTS_V2" risk="LOW" time="15m ago" />
          <AuditItem user="System Admin" action="Exported Department Load Report" resource="REPORTS_CORE" risk="LOW" time="42m ago" />
          <AuditItem user="Database Service" action="Automatic Backup Failed" resource="BACKUP_NODE_A" risk="HIGH" time="1h ago" />
        </div>
      </div>
    </div>
  );
}
