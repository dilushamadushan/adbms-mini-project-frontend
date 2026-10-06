import React from 'react';
import { AptCard } from '@/components/features/appointments/AptCard';

export default function Appointments() {
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-white border border-[#DCE3E0] rounded-lg text-sm font-medium shadow-sm w-full md:w-auto">Daily List</button>
        <button className="px-4 py-2 bg-transparent text-[#5B6472] rounded-lg text-sm font-medium w-full md:w-auto hover:bg-gray-100">New Booking</button>
      </div>
      
      <div className="bg-white rounded-xl border border-[#DCE3E0] p-6 shadow-sm">
        <h3 className="font-bold text-[#0E4749] mb-4">Scheduled Today</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <AptCard time="09:30 AM" patient="Sarah Jenkins" doctor="Dr. James Wilson" room="Room 402" status="CONFIRMED" />
          <AptCard time="10:15 AM" patient="Michael Chen" doctor="Dr. Sarah Miller" room="Room 105" status="PENDING" />
          <AptCard time="11:00 AM" patient="Robert Taylor" doctor="Dr. James Wilson" room="Room 402" status="CONFIRMED" />
        </div>
      </div>
    </div>
  );
}
