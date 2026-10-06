import React from 'react';

export function StatCard({ title, value, subtext, icon }: any) {
  return (
    <div className="bg-white p-5 rounded-xl border border-[#DCE3E0] shadow-sm flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-[#0E4749]">{value}</div>
      <div className="text-sm font-medium text-[#5B6472] mt-1">{title}</div>
      <div className="text-xs text-gray-400 mt-2">{subtext}</div>
    </div>
  );
}
