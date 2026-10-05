import React from 'react';
import { BedCard } from '@/components/features/beds/BedCard';

export default function Admissions() {
  return (
    <div className="space-y-6">
      <div className="bg-[#0E4749] text-white p-6 rounded-xl relative overflow-hidden shadow-sm">
        <div className="relative z-10">
          <div className="text-teal-200 text-sm font-medium uppercase tracking-wider mb-1">Real-Time Capacity</div>
          <h2 className="text-2xl font-bold">Facility Census: 84% Occupied</h2>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-teal-800 to-transparent opacity-50"></div>
      </div>

      <div>
        <h3 className="font-bold text-[#0E4749] mb-4 flex items-center justify-between">
          General Medicine A
          <span className="text-xs font-normal text-[#5B6472] bg-gray-100 px-2 py-1 rounded">Inpatient</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <BedCard id="A-101" patient="Robert Jenkins" status="STABLE" />
          <BedCard id="A-102" patient="Sarah Miller" status="MODERATE" />
          <BedCard id="A-103" status="AVAILABLE" />
          <BedCard id="A-104" status="CLEANING" />
          <BedCard id="A-105" patient="Michael Chen" status="CRITICAL" />
          <BedCard id="A-106" patient="Incoming: Elena R." status="INCOMING" time="ETD: 18:00" />
        </div>
      </div>
    </div>
  );
}
