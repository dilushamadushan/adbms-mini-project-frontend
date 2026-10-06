"use client";
import React, { useState } from 'react';
import { ChevronRight, Calendar, User, Clock, CheckCircle } from 'lucide-react';

export default function BookAppointment() {
  const [step, setStep] = useState(1);

  return (
    <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm overflow-hidden">
      <div className="bg-gray-50 p-4 border-b border-[#DCE3E0] flex items-center justify-between">
        <h3 className="font-bold text-[#0E4749]">Schedule New Appointment</h3>
        <div className="flex gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`w-2.5 h-2.5 rounded-full ${step >= s ? 'bg-[#E07856]' : 'bg-gray-300'}`}></div>
          ))}
        </div>
      </div>
      
      <div className="p-6">
        {step === 1 && (
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4">Select Department</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              {['General Medicine', 'Cardiology', 'Dermatology', 'Orthopedics'].map(dept => (
                <button key={dept} onClick={() => setStep(2)} className="p-4 border border-[#DCE3E0] rounded-xl text-left hover:border-[#0E4749] hover:bg-teal-50 transition-colors flex justify-between items-center">
                  <div className="font-bold text-gray-900">{dept}</div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} className="text-sm font-bold text-[#5B6472] mb-4 hover:text-[#0E4749]">&lt; Back to Departments</button>
            <h4 className="text-lg font-bold text-gray-900 mb-4">Select Provider & Time (Cardiology)</h4>
            
            <div className="mb-6 p-4 border border-[#DCE3E0] rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-[#0E4749]">Dr</div>
                <div>
                  <div className="font-bold text-gray-900">Dr. Sarah Jenkins</div>
                  <div className="text-xs text-[#5B6472]">Senior Cardiologist</div>
                </div>
              </div>
              
              <div className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2"><Calendar className="w-4 h-4"/> Tomorrow (Oct 25)</div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                <button className="py-2 border border-[#DCE3E0] rounded text-sm font-mono text-gray-400 bg-gray-50 cursor-not-allowed">09:00</button>
                <button className="py-2 border border-[#DCE3E0] rounded text-sm font-mono text-gray-400 bg-gray-50 cursor-not-allowed">09:30</button>
                <button onClick={() => setStep(3)} className="py-2 border border-[#0E4749] bg-white rounded text-sm font-mono font-bold text-[#0E4749] hover:bg-[#0E4749] hover:text-white transition-colors">10:00</button>
                <button onClick={() => setStep(3)} className="py-2 border border-[#0E4749] bg-white rounded text-sm font-mono font-bold text-[#0E4749] hover:bg-[#0E4749] hover:text-white transition-colors">11:30</button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h4>
            <p className="text-[#5B6472] mb-6">Your appointment with Dr. Sarah Jenkins is scheduled for Tomorrow at 10:00 AM.</p>
            <button onClick={() => setStep(1)} className="bg-[#0E4749] hover:bg-[#0a3335] text-white px-6 py-2.5 rounded-lg font-bold text-sm">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
