"use client";
import React from 'react';
import { Activity, Thermometer, Heart, Save } from 'lucide-react';

export default function NurseBedDetail({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-xl border border-[#DCE3E0] p-6 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0E4749] mb-1">Bed {params.id}</h2>
          <div className="text-sm font-bold text-gray-900">Patient: Robert Jenkins</div>
          <div className="text-xs text-[#5B6472]">Admitted: Oct 20, 2024 • Attending: Dr. Sarah Jenkins</div>
        </div>
        <button className="bg-white border border-[#E07856] text-[#E07856] hover:bg-[#E07856] hover:text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">
          Mark for Discharge
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm overflow-hidden">
        <div className="bg-[#0E4749] text-white p-4 font-bold flex items-center gap-2">
          <Activity className="w-5 h-5"/> Vitals Entry
        </div>
        <form className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-2 flex items-center gap-1"><Heart className="w-3 h-3"/> Blood Pressure</label>
              <input type="text" placeholder="e.g. 120/80" className="w-full p-3 border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749] font-mono" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-2 flex items-center gap-1"><Activity className="w-3 h-3"/> Pulse (bpm)</label>
              <input type="number" placeholder="e.g. 72" className="w-full p-3 border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749] font-mono" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-2 flex items-center gap-1"><Thermometer className="w-3 h-3"/> Temp (°F)</label>
              <input type="number" step="0.1" placeholder="e.g. 98.6" className="w-full p-3 border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749] font-mono" />
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-[#DCE3E0]">
            <button type="button" className="bg-[#0E4749] hover:bg-[#0a3335] text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2">
              <Save className="w-4 h-4" /> Log Vitals (Now)
            </button>
          </div>
        </form>
      </div>
      
      
      <div className="bg-white rounded-xl border border-[#DCE3E0] p-6 shadow-sm">
        <h4 className="font-bold text-[#0E4749] mb-4">Recent Vitals</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm py-2 border-b border-gray-100">
            <span className="text-[#5B6472]">Today, 08:00 AM</span>
            <span className="font-mono font-bold text-gray-900">BP: 118/78, HR: 70, T: 98.4</span>
          </div>
          <div className="flex justify-between text-sm py-2 border-b border-gray-100">
            <span className="text-[#5B6472]">Yesterday, 08:00 PM</span>
            <span className="font-mono font-bold text-gray-900">BP: 122/80, HR: 74, T: 98.6</span>
          </div>
        </div>
      </div>
    </div>
  );
}
