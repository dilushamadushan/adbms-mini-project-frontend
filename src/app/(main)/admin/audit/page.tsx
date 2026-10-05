import React from 'react';

export default function AdminAudit() {
  return (
    <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#DCE3E0] bg-[#0E4749] text-white font-bold">System Audit Logs</div>
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-xs">
          <tr>
            <th className="p-4">Timestamp</th>
            <th className="p-4">Actor</th>
            <th className="p-4">Action</th>
            <th className="p-4">Resource Details (JSON)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#DCE3E0] font-mono">
          <tr className="hover:bg-gray-50">
            <td className="p-4 text-xs">2024-10-24 14:02:11</td>
            <td className="p-4 text-[#0E4749] font-bold">doc_sjenkins</td>
            <td className="p-4"><span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded text-xs font-bold">INSERT_DIAGNOSIS</span></td>
            <td className="p-4 text-xs text-gray-500">{'{ "patient_id": "MS-8821", "visit_id": 992 }'}</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="p-4 text-xs">2024-10-24 13:45:00</td>
            <td className="p-4 text-amber-700 font-bold">SYS_DB_EVENT</td>
            <td className="p-4"><span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-bold">PARTITION_ROTATE</span></td>
            <td className="p-4 text-xs text-gray-500">{'{ "table": "audit_logs", "status": "SUCCESS" }'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
