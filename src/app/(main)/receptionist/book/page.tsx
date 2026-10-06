"use client";
import React, { useState } from 'react';
import { Loader2, CheckCircle, UserPlus, FileText } from 'lucide-react';

export default function ReceptionistBook() {
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState<{id: string, pass: string} | null>(null);

  
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [blood, setBlood] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [emContact, setEmContact] = useState("");
  const [allergies, setAllergies] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    
    
    await new Promise(r => setTimeout(r, 1500)); 

    setIsLoading(false);
    
    
    const tempPass = Math.random().toString(36).slice(-8);
    const newId = 'PT-' + Math.floor(Math.random() * 100000);
    
    setSuccessData({ id: newId, pass: tempPass });
  };

  const resetForm = () => {
    setName(""); setDob(""); setGender(""); setBlood("");
    setPhone(""); setEmail(""); setEmContact(""); setAllergies("");
    setSuccessData(null);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h3 className="font-bold text-[#0E4749] text-xl">Patient Registration</h3>
      
      <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm overflow-hidden">
        <div className="bg-[#0E4749] text-white p-4 font-bold flex items-center gap-2">
          <UserPlus className="w-5 h-5"/> New Patient Intake Form
        </div>
        
        {successData ? (
           <div className="p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">Patient Registered Successfully</h4>
            <p className="text-[#5B6472] mb-8">Please provide these temporary login credentials to the patient.</p>
            
            <div className="bg-gray-50 border border-[#DCE3E0] rounded-xl p-6 w-full max-w-md text-left mb-8 shadow-inner">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-[#5B6472] font-medium">Patient ID:</span> 
                <span className="font-mono text-lg font-bold text-[#0E4749]">{successData.id}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[#5B6472] font-medium">Portal Password:</span> 
                <span className="font-mono text-lg font-bold text-[#E07856]">{successData.pass}</span>
              </div>
            </div>
            
            <button onClick={resetForm} className="bg-[#0E4749] hover:bg-[#0a3335] text-white px-8 py-3 rounded-xl font-bold transition-colors">
              Register Another Patient
            </button>
          </div>
        ) : (
          <form className="p-8" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
              
              
              <div className="space-y-6">
                <h4 className="text-sm font-bold text-[#5B6472] uppercase tracking-wider border-b border-[#DCE3E0] pb-2 flex items-center gap-2">
                  <UserPlus className="w-4 h-4"/> Basic Info
                </h4>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name <span className="text-[#E07856]">*</span></label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Date of Birth <span className="text-[#E07856]">*</span></label>
                    <input type="date" required value={dob} onChange={e => setDob(e.target.value)} className="w-full p-3 border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749] bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Gender <span className="text-[#E07856]">*</span></label>
                    <select required value={gender} onChange={e => setGender(e.target.value)} className="w-full p-3 border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749] bg-white">
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              
              <div className="space-y-6">
                <h4 className="text-sm font-bold text-[#5B6472] uppercase tracking-wider border-b border-[#DCE3E0] pb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4"/> Contact & Medical
                </h4>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address <span className="text-[#E07856]">*</span></label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Will be used for portal login" className="w-full p-3 border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number <span className="text-[#E07856]">*</span></label>
                    <input type="tel" required pattern="[0-9\-+() ]+" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 000-0000" className="w-full p-3 border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Blood Group</label>
                    <select value={blood} onChange={e => setBlood(e.target.value)} className="w-full p-3 border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749] bg-white">
                      <option value="">Unknown</option>
                      <option value="A+">A+</option><option value="A-">A-</option>
                      <option value="B+">B+</option><option value="B-">B-</option>
                      <option value="O+">O+</option><option value="O-">O-</option>
                      <option value="AB+">AB+</option><option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 grid md:grid-cols-2 gap-x-8 gap-y-6 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Emergency Contact <span className="text-[#E07856]">*</span></label>
                  <input type="text" required value={emContact} onChange={e => setEmContact(e.target.value)} placeholder="Name & Phone Number" className="w-full p-3 border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Known Allergies</label>
                  <input type="text" value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="Comma separated list..." className="w-full p-3 border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749]" />
                </div>
              </div>

            </div>

            <div className="pt-8 mt-8 border-t border-[#DCE3E0] flex justify-end gap-4">
              <button type="button" onClick={resetForm} disabled={isLoading} className="px-6 py-3 font-bold text-[#5B6472] hover:bg-gray-100 rounded-xl transition-colors">
                Clear Form
              </button>
              <button type="submit" disabled={isLoading} className="bg-[#E07856] hover:bg-[#c96749] text-white px-8 py-3 rounded-xl font-bold shadow-md transition-colors flex items-center gap-2 disabled:opacity-50">
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isLoading ? 'Registering...' : 'Register Patient'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
