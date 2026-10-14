import React from 'react';
import { KpiOverviewCards } from '@/components/features/admin/KpiOverviewCards';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <KpiOverviewCards />

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 border border-[#DCE3E0] rounded-xl shadow-sm">
          <h4 className="font-bold text-[#0E4749] mb-4">Department Load</h4>
          <div className="space-y-4">
            {[
              { name: 'Cardiology', pct: 82, color: '#0E4749' },
              { name: 'Pediatrics', pct: 45, color: '#0E4749' },
              { name: 'Emergency', pct: 98, color: '#E07856' },
            ].map((dept) => (
              <div key={dept.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold text-gray-900">{dept.name}</span>
                  <span style={{ color: dept.color }}>{dept.pct}%</span>
                </div>
                <div className="h-4 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="h-full rounded"
                    style={{ width: `${dept.pct}%`, background: dept.color, transition: 'width .8s' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

