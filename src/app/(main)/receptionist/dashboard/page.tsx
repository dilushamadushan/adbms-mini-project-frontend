import React from 'react';
import Link from 'next/link';
import { CalendarPlus } from 'lucide-react';

export default function ReceptionistDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-[#0E4749] text-xl">Today's Master Schedule</h3>
        <Link href="/receptionist/book" className="bg-[#E07856] hover:bg-[#c96749] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-md flex items-center gap-2">
          <CalendarPlus className="w-4 h-4" /> New Booking
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0E4749] text-white text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 font-semibold">Time</th>
              <th className="p-4 font-semibold">Doctor</th>
              <th className="p-4 font-semibold">Patient</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DCE3E0]">
            <tr className="hover:bg-gray-50">
              <td className="p-4 font-mono font-bold text-gray-700">09:00 AM</td>
              <td className="p-4 font-medium text-[#0E4749]">Dr. Sarah Jenkins</td>
              <td className="p-4 font-bold text-gray-900">Robert Fox</td>
              <td className="p-4"><span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">CHECKED IN</span></td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="p-4 font-mono font-bold text-gray-700">09:30 AM</td>
              <td className="p-4 font-medium text-[#0E4749]">Dr. James Miller</td>
              <td className="p-4 font-bold text-gray-900">Elena Rodriguez</td>
              <td className="p-4"><span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded">SCHEDULED</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
