import React from 'react';

export default function ReceptionistAdmit() {
  return (
    <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm overflow-hidden max-w-3xl">
      <div className="bg-[#0E4749] text-white p-4 font-bold">Admit Patient to Ward</div>
      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-bold text-[#0E4749] uppercase tracking-wider mb-2">Select Patient</label>
          <input type="text" placeholder="Search patient..." className="w-full p-4 border border-[#DCE3E0] rounded-xl focus:outline-none focus:border-[#0E4749] text-lg" />
        </div>
        <div className="grid grid-cols-2 gap-4">
           <div>
            <label className="block text-sm font-bold text-[#0E4749] uppercase tracking-wider mb-2">Ward</label>
            <select className="w-full p-4 border border-[#DCE3E0] rounded-xl bg-white focus:outline-none focus:border-[#0E4749] text-lg">
              <option>General Med A</option>
              <option>ICU</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#0E4749] uppercase tracking-wider mb-2">Available Bed</label>
            <select className="w-full p-4 border border-[#DCE3E0] rounded-xl bg-white focus:outline-none focus:border-[#0E4749] text-lg">
              <option>A-103 (Open)</option>
              <option>A-107 (Open)</option>
            </select>
          </div>
        </div>
        <button className="w-full bg-[#E07856] text-white font-bold py-4 rounded-xl text-lg mt-4">Confirm Admission</button>
      </div>
    </div>
  );
}
