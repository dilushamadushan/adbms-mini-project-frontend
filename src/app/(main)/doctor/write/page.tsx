"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pill, Plus, Save, User, CheckCircle, Trash2 } from 'lucide-react';

export default function WriteDiagnosis() {
  const router = useRouter();
  const [meds, setMeds] = useState([{ name: '', dose: '', duration: '' }]);
  const [isSuccess, setIsSuccess] = useState(false);

  const addMed = () => setMeds([...meds, { name: '', dose: '', duration: '' }]);
  const removeMed = (index: number) => setMeds(meds.filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSuccess(true);
    setTimeout(() => {
      router.push('/doctor/patients/MS-8821');
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Record Signed & Saved!</h2>
        <p className="text-[#5B6472]">Redirecting back to patient profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#0E4749]"></div>
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#DCE3E0]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center border border-teal-100">
              <User className="w-6 h-6 text-[#0E4749]" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-lg">Sarah Jenkins</div>
              <div className="text-sm text-[#5B6472] font-mono flex items-center gap-2">
                MS-8821 <span className="text-gray-300">|</span> 42y Female
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-[#5B6472] uppercase mb-1">Today's Date</div>
            <div className="font-mono text-sm text-gray-900">Oct 24, 2024</div>
          </div>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-bold text-[#0E4749] uppercase tracking-wider mb-2">Clinical Diagnosis & Notes</label>
            <textarea 
              rows={5}
              required
              placeholder="Enter detailed clinical findings, symptoms, and diagnosis..."
              className="w-full p-4 border border-[#DCE3E0] rounded-xl focus:outline-none focus:border-[#0E4749] text-sm resize-y leading-relaxed"
            ></textarea>
          </div>

          <div className="bg-gray-50 p-5 rounded-xl border border-[#DCE3E0]">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-bold text-[#0E4749] uppercase tracking-wider flex items-center gap-2">
                <Pill className="w-4 h-4"/> Prescription Builder
              </label>
              <button type="button" onClick={addMed} className="text-xs font-bold bg-white border border-[#DCE3E0] px-3 py-1.5 rounded-lg text-[#0E4749] flex items-center gap-1 hover:border-[#0E4749] transition-colors shadow-sm">
                <Plus className="w-3 h-3" /> ADD MEDICATION
              </button>
            </div>
            
            <div className="space-y-3">
              {meds.map((m, i) => (
                <div key={i} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-[#DCE3E0] shadow-sm animate-in slide-in-from-left-4 duration-200">
                  <div className="w-6 text-center text-xs font-bold text-gray-400">{i + 1}.</div>
                  <input type="text" required placeholder="Medicine Name (e.g. Amoxicillin)" className="flex-[2] p-2 bg-transparent focus:outline-none focus:border-b-2 focus:border-[#0E4749] text-sm font-medium" />
                  <div className="w-[1px] h-6 bg-gray-200"></div>
                  <input type="text" required placeholder="Dose (e.g. 500mg)" className="flex-1 p-2 bg-transparent focus:outline-none focus:border-b-2 focus:border-[#0E4749] text-sm" />
                  <div className="w-[1px] h-6 bg-gray-200"></div>
                  <input type="text" required placeholder="Duration (e.g. 7 Days)" className="flex-1 p-2 bg-transparent focus:outline-none focus:border-b-2 focus:border-[#0E4749] text-sm" />
                  
                  <button 
                    type="button" 
                    onClick={() => removeMed(i)} 
                    disabled={meds.length === 1}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-[#DCE3E0]">
            <button type="button" onClick={() => router.back()} className="px-6 py-2.5 text-sm font-bold text-[#5B6472] hover:bg-gray-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" className="bg-[#0E4749] hover:bg-[#0a3335] text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition-all hover:shadow-lg transform hover:-translate-y-0.5">
              <Save className="w-4 h-4" /> Save & Sign Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
