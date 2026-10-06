import React from 'react';
import { Calendar, Clock, MapPin, XCircle } from 'lucide-react';

export default function PatientAppointments() {
  return (
    <div className="space-y-6">
      <h3 className="font-bold text-[#0E4749] text-xl">My Appointments</h3>
      
      <div className="space-y-4">
        
        <div className="bg-white border border-[#DCE3E0] rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mb-2">SCHEDULED</div>
              <div className="font-bold text-gray-900 text-lg">General Checkup</div>
              <div className="text-sm font-medium text-[#0E4749]">Dr. Sarah Jenkins</div>
            </div>
            <button className="text-sm text-red-600 font-bold hover:underline flex items-center gap-1">
              <XCircle className="w-4 h-4"/> Cancel
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded-lg border border-[#DCE3E0]">
            <div>
              <div className="text-gray-500 text-xs flex items-center gap-1"><Calendar className="w-3 h-3" /> Date & Time</div>
              <div className="font-medium">Oct 25, 10:00 AM</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</div>
              <div className="font-medium">Room 402, Main Wing</div>
            </div>
          </div>
        </div>

        
        <div className="bg-gray-50 border border-[#DCE3E0] rounded-xl p-5 relative overflow-hidden opacity-75">
          <div className="absolute top-0 left-0 w-1 h-full bg-gray-400"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-xs font-bold text-gray-600 bg-gray-200 px-2 py-0.5 rounded border border-gray-300 inline-block mb-2">COMPLETED</div>
              <div className="font-bold text-gray-900 text-lg">Cardiology Consult</div>
              <div className="text-sm font-medium text-[#0E4749]">Dr. James Miller</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm p-3">
            <div>
              <div className="text-gray-500 text-xs flex items-center gap-1"><Calendar className="w-3 h-3" /> Date & Time</div>
              <div className="font-medium">Sep 12, 02:15 PM</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
