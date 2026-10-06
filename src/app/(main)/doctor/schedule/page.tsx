import React from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

export default function DoctorSchedule() {
  const slots = [
    { time: "09:00 AM", status: "BOOKED", patient: "Sarah Jenkins" },
    { time: "09:30 AM", status: "OPEN", patient: "" },
    { time: "10:00 AM", status: "BOOKED", patient: "Michael Ross" },
    { time: "10:30 AM", status: "BOOKED", patient: "Emma Thompson" },
    { time: "11:00 AM", status: "OPEN", patient: "" },
    { time: "11:30 AM", status: "OPEN", patient: "" },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#DCE3E0] flex justify-between items-center bg-[#0E4749] text-white">
        <h3 className="font-bold flex items-center gap-2"><CalendarIcon className="w-5 h-5"/> Weekly Schedule</h3>
        <div className="text-sm font-medium text-teal-200">Oct 21 - Oct 25, 2024</div>
      </div>
      
      <div className="p-6">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-[#E07856]"/> Today's Slots</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {slots.map((slot, i) => (
            <div key={i} className={`p-4 rounded-lg border ${slot.status === 'BOOKED' ? 'border-[#0E4749] bg-teal-50' : 'border-[#DCE3E0] bg-gray-50 border-dashed'}`}>
              <div className="font-mono text-sm font-bold text-gray-700 mb-2">{slot.time}</div>
              {slot.status === 'BOOKED' ? (
                <div>
                  <div className="text-xs font-bold text-white bg-[#0E4749] px-2 py-0.5 rounded inline-block mb-1">BOOKED</div>
                  <div className="text-sm font-medium text-gray-900 line-clamp-1">{slot.patient}</div>
                </div>
              ) : (
                <div className="text-xs font-bold text-gray-400">OPEN SLOT</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
