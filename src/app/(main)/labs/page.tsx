import React from 'react';
import { LabItem } from '@/components/features/labs/LabItem';

export default function Labs() {
  return (
    <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#DCE3E0] flex gap-4 bg-gray-50">
        <button className="text-sm font-semibold text-[#0E4749] border-b-2 border-[#0E4749] pb-1">Recent Lab Orders</button>
        <button className="text-sm font-medium text-[#5B6472] pb-1">Active</button>
        <button className="text-sm font-medium text-[#5B6472] pb-1">Finalized</button>
      </div>
      <div className="divide-y divide-[#DCE3E0]">
        <LabItem title="Complete Blood Count" patient="Robert Fox" date="Oct 24, 2023" status="Completed" />
        <LabItem title="Lipid Panel" patient="Jane Cooper" date="Oct 24, 2023" status="Critical" />
        <LabItem title="TSH (Thyroid)" patient="Guy Hawkins" date="Oct 23, 2023" status="Pending" />
        <LabItem title="Liver Function Test" patient="Eleanor Pena" date="Oct 23, 2023" status="In Progress" />
      </div>
    </div>
  );
}
