import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { LoadBar } from '@/components/ui/LoadBar';

export default function AdminReports() {
  return (
    <div className="space-y-6">
      <h3 className="font-bold text-[#0E4749] text-xl">Hospital Reports</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        
        <div className="bg-white border border-[#DCE3E0] p-6 rounded-xl shadow-sm">
          <h4 className="font-bold text-[#0E4749] mb-6 flex items-center gap-2"><BarChart3 className="w-5 h-5"/> Department Workload</h4>
          <div className="space-y-6">
            <LoadBar label="Emergency (Critical)" percent={96} />
            <LoadBar label="Cardiology (High)" percent={82} />
            <LoadBar label="General Med (Moderate)" percent={65} />
            <LoadBar label="Orthopedics (Low)" percent={42} />
          </div>
        </div>

        
        <div className="bg-white border border-[#DCE3E0] p-6 rounded-xl shadow-sm">
          <h4 className="font-bold text-[#0E4749] mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5"/> Top Provider Workload</h4>
          <table className="w-full text-left text-sm">
            <thead className="text-gray-500 border-b border-[#DCE3E0]">
              <tr>
                <th className="pb-2 font-medium">Provider Name</th>
                <th className="pb-2 font-medium">Pts Seen</th>
                <th className="pb-2 font-medium text-right">Avg Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-3 font-bold text-gray-900">Dr. Sarah Jenkins</td>
                <td className="py-3">142</td>
                <td className="py-3 text-right text-[#5B6472]">18m</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-gray-900">Dr. James Miller</td>
                <td className="py-3">128</td>
                <td className="py-3 text-right text-[#5B6472]">22m</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-gray-900">Dr. Emily Chen</td>
                <td className="py-3">115</td>
                <td className="py-3 text-right text-[#5B6472]">15m</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
