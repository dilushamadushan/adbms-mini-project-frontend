"use client";
import React, { useState } from 'react';
import { Network, Plus, Users, X } from 'lucide-react';

export default function AdminDepartments() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-[#0E4749] text-xl">Hospital Departments</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#E07856] hover:bg-[#c96749] transition-colors text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4"/> Add Department
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm p-6">
        <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Network className="w-4 h-4" /> Visual Hierarchy (Recursive CTE Simulation)
        </div>

        <div className="space-y-4">
          
          <div className="border border-[#0E4749] rounded-lg p-4 bg-teal-50 relative">
            <div className="flex justify-between items-center">
              <div className="font-bold text-lg text-[#0E4749]">Internal Medicine</div>
              <div className="flex items-center gap-2 text-sm text-[#0E4749] font-bold">
                <Users className="w-4 h-4"/> 42 Staff
                <button className="ml-2 text-xs text-[#0E4749] hover:underline">Edit</button>
              </div>
            </div>
          </div>
          
          
          <div className="pl-8 border-l-2 border-gray-200 ml-4 space-y-4">
            <div className="border border-[#DCE3E0] rounded-lg p-4 bg-white relative hover:border-[#0E4749] transition-colors group">
              <div className="absolute w-8 h-0.5 bg-gray-200 -left-8 top-1/2"></div>
              <div className="flex justify-between items-center">
                <div className="font-bold text-gray-900">Cardiology</div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="w-4 h-4"/> 12 Staff
                  <button className="ml-2 text-xs font-bold text-[#0E4749] opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
                </div>
              </div>
            </div>

            <div className="border border-[#DCE3E0] rounded-lg p-4 bg-white relative hover:border-[#0E4749] transition-colors group">
              <div className="absolute w-8 h-0.5 bg-gray-200 -left-8 top-1/2"></div>
              <div className="flex justify-between items-center">
                <div className="font-bold text-gray-900">Gastroenterology</div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="w-4 h-4"/> 8 Staff
                  <button className="ml-2 text-xs font-bold text-[#0E4749] opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
                </div>
              </div>
            </div>
            
            <div className="border border-[#DCE3E0] rounded-lg p-4 bg-white relative hover:border-[#0E4749] transition-colors group">
              <div className="absolute w-8 h-0.5 bg-gray-200 -left-8 top-1/2"></div>
              <div className="flex justify-between items-center">
                <div className="font-bold text-gray-900">General Medicine</div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="w-4 h-4"/> 22 Staff
                  <button className="ml-2 text-xs font-bold text-[#0E4749] opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-[#0E4749] rounded-lg p-4 bg-teal-50 mt-8 relative">
            <div className="flex justify-between items-center">
              <div className="font-bold text-lg text-[#0E4749]">Surgery</div>
              <div className="flex items-center gap-2 text-sm text-[#0E4749] font-bold">
                <Users className="w-4 h-4"/> 30 Staff
                <button className="ml-2 text-xs text-[#0E4749] hover:underline">Edit</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#0E4749] text-white p-4 flex justify-between items-center">
              <h4 className="font-bold">Create New Department</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-teal-200 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            
            <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
              <div>
                <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">Department Name</label>
                <input type="text" placeholder="e.g. Pediatrics" required className="w-full p-2 border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749] text-sm" />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">Parent Department (Optional)</label>
                <select className="w-full p-2 border border-[#DCE3E0] rounded-lg bg-white focus:outline-none focus:border-[#0E4749] text-sm text-gray-900">
                  <option value="">-- No Parent (Root Level) --</option>
                  <option value="internal">Internal Medicine</option>
                  <option value="surgery">Surgery</option>
                </select>
                <p className="text-[10px] text-gray-500 mt-1 italic">Selecting a parent nests this under an existing department.</p>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-[#5B6472] hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold bg-[#E07856] hover:bg-[#c96749] text-white rounded-lg transition-colors shadow-sm">Save Department</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
