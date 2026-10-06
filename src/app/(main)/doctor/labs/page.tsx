"use client";
import React, { useState } from 'react';
import { LabItem } from '@/components/features/labs/LabItem';
import { Plus, X, Search, Beaker, CheckCircle } from 'lucide-react';

export default function DoctorLabs() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsModalOpen(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-[#0E4749] text-xl">Lab Orders</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#E07856] hover:bg-[#c96749] text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4"/> Order New Test
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#DCE3E0] flex gap-4 bg-gray-50">
          <button className="text-sm font-semibold text-[#0E4749] border-b-2 border-[#0E4749] pb-1">Pending Results</button>
          <button className="text-sm font-medium text-[#5B6472] pb-1">Completed</button>
        </div>
        <div className="divide-y divide-[#DCE3E0]">
          <LabItem title="Lipid Panel" patient="Jane Cooper" date="Oct 24, 2024" status="Critical" />
          <LabItem title="TSH (Thyroid)" patient="Guy Hawkins" date="Oct 23, 2024" status="Pending" />
          <LabItem title="Complete Blood Count" patient="Sarah Jenkins" date="Oct 22, 2024" status="In Progress" />
        </div>
      </div>

      
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {isSuccess ? (
              <div className="p-10 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h4>
                <p className="text-sm text-gray-500">The lab request has been routed to the laboratory.</p>
              </div>
            ) : (
              <>
                <div className="bg-[#0E4749] text-white p-4 flex justify-between items-center">
                  <h4 className="font-bold flex items-center gap-2"><Beaker className="w-5 h-5"/> Order New Lab Test</h4>
                  <button onClick={() => setIsModalOpen(false)} className="text-teal-200 hover:text-white"><X className="w-5 h-5"/></button>
                </div>
                
                <form className="p-6 space-y-5" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">Select Patient</label>
                    <div className="relative">
                      <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <select required className="w-full pl-10 pr-4 py-3 border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749] text-sm appearance-none bg-white">
                        <option value="">Search by Name or MRN...</option>
                        <option value="MS-8821">Sarah Jenkins (MS-8821)</option>
                        <option value="MS-1102">Michael Ross (MS-1102)</option>
                        <option value="MS-4482">Emma Thompson (MS-4482)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">Test Category & Type</label>
                    <div className="grid grid-cols-2 gap-4">
                      <select required className="w-full p-3 border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749] text-sm bg-white">
                        <option value="">Category...</option>
                        <option value="blood">Blood Work</option>
                        <option value="urine">Urinalysis</option>
                        <option value="imaging">Imaging (X-Ray/MRI)</option>
                        <option value="pathology">Pathology</option>
                      </select>
                      <select required className="w-full p-3 border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749] text-sm bg-white">
                        <option value="">Specific Test...</option>
                        <option value="cbc">Complete Blood Count (CBC)</option>
                        <option value="bmp">Basic Metabolic Panel (BMP)</option>
                        <option value="lipid">Lipid Panel</option>
                        <option value="lft">Liver Function (LFT)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">Clinical Notes & Priority</label>
                    <textarea 
                      rows={3} 
                      placeholder="Add reason for testing or specific instructions for the lab..." 
                      className="w-full p-3 border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749] text-sm mb-3"
                    ></textarea>
                    
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input type="radio" name="priority" value="routine" defaultChecked className="text-[#0E4749] focus:ring-[#0E4749]" /> Routine
                      </label>
                      <label className="flex items-center gap-2 text-sm text-red-700 font-bold cursor-pointer">
                        <input type="radio" name="priority" value="stat" className="text-red-600 focus:ring-red-600" /> STAT (Urgent)
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-2 border-t border-[#DCE3E0]">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-[#5B6472] hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                    <button type="submit" className="px-6 py-2 text-sm font-bold bg-[#E07856] hover:bg-[#c96749] text-white rounded-lg transition-colors shadow-sm flex items-center gap-2">
                      Place Order
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
