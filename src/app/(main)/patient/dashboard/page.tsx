import React from 'react';
import Link from 'next/link';
import { Calendar, Pill, Clock, ArrowRight, User } from 'lucide-react';

export default function PatientDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-[#0E4749] text-white p-6 rounded-xl shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">Hello, Robert</h2>
          <p className="text-teal-100">Welcome to your MediCore patient portal.</p>
          <div className="mt-6 flex gap-4">
            <Link href="/patient/book" className="bg-[#E07856] hover:bg-[#c96749] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-md">
              Book Appointment
            </Link>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-teal-800 to-transparent opacity-50"></div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#DCE3E0] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-[#0E4749] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#E07856]" /> 
              Upcoming Appointment
            </h3>
          </div>
          <div className="p-4 border border-[#DCE3E0] rounded-lg bg-gray-50">
            <div className="font-bold text-gray-900 text-lg mb-1">General Checkup</div>
            <div className="text-sm text-[#5B6472] mb-3 flex items-center gap-1">
              <Clock className="w-4 h-4" /> Tomorrow, 10:00 AM
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-[#DCE3E0]">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-[#0E4749]">Dr</div>
              <div className="text-sm font-medium text-gray-900">Dr. Sarah Jenkins</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#DCE3E0] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-[#0E4749] flex items-center gap-2">
              <Pill className="w-5 h-5 text-[#0E4749]" /> 
              Active Prescriptions
            </h3>
            <Link href="/patient/prescriptions" className="text-sm font-bold text-[#0E4749] hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 border border-[#DCE3E0] rounded-lg hover:bg-gray-50">
              <div>
                <div className="font-bold text-gray-900 text-sm">Lisinopril</div>
                <div className="text-xs text-[#5B6472] font-mono">10mg • 1x Daily</div>
              </div>
              <div className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Active</div>
            </div>
            <div className="flex justify-between items-center p-3 border border-[#DCE3E0] rounded-lg hover:bg-gray-50">
              <div>
                <div className="font-bold text-gray-900 text-sm">Vitamin D3</div>
                <div className="text-xs text-[#5B6472] font-mono">2000IU • 1x Daily</div>
              </div>
              <div className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
