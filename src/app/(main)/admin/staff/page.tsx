"use client";
import React, { useState } from 'react';
import { Users, Plus, X, Loader2, CheckCircle } from 'lucide-react';

export default function AdminStaff() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState<{id: string, pass: string, role: string} | null>(null);

  
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dept, setDept] = useState("");
  const [specialty, setSpecialty] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    
    
    await new Promise(r => setTimeout(r, 1500)); 

    setIsLoading(false);
    
    
    const tempPass = Math.random().toString(36).slice(-8);
    const newId = 'STF-' + Math.floor(Math.random() * 10000);
    
    setSuccessData({ id: newId, pass: tempPass, role: role });
  };

  const handleStatusToggle = async (id: string, currentStatus: boolean) => {
    
    
    console.log(`PATCH /admin/staff/${id}/status -> ${!currentStatus}`);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setRole("");
    setDept("");
    setSpecialty("");
    setSuccessData(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-[#0E4749] text-xl">Staff Management</h3>
        <button 
          onClick={() => { setSuccessData(null); setIsModalOpen(true); }}
          className="bg-[#0E4749] text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm hover:bg-[#0a3335] transition-colors"
        >
          <Plus className="w-4 h-4"/> Add Staff
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#DCE3E0] bg-gray-50 flex items-center gap-4">
          <input type="text" placeholder="Search staff..." className="w-full max-w-md px-4 py-2 border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749] text-sm" />
        </div>
        
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0E4749] text-white text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Department</th>
              <th className="p-4 font-semibold text-center">Active Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DCE3E0]">
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="p-4 font-bold text-gray-900">Dr. Sarah Jenkins</td>
              <td className="p-4 text-[#5B6472]">s.jenkins@medicore.local</td>
              <td className="p-4"><span className="bg-teal-100 text-teal-800 text-xs font-bold px-2 py-0.5 rounded">DOCTOR</span></td>
              <td className="p-4 text-[#5B6472]">Cardiology</td>
              <td className="p-4 text-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked onChange={(e) => handleStatusToggle('STF-001', e.target.checked)} />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E07856]"></div>
                </label>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="p-4 font-bold text-gray-900">Nurse Michael Chen</td>
              <td className="p-4 text-[#5B6472]">m.chen@medicore.local</td>
              <td className="p-4"><span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded">NURSE</span></td>
              <td className="p-4 text-[#5B6472]">General Med A</td>
              <td className="p-4 text-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked onChange={(e) => handleStatusToggle('STF-002', e.target.checked)} />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E07856]"></div>
                </label>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 opacity-60 transition-colors">
              <td className="p-4 font-bold text-gray-900">Dr. James Miller</td>
              <td className="p-4 text-[#5B6472]">j.miller@medicore.local</td>
              <td className="p-4"><span className="bg-teal-100 text-teal-800 text-xs font-bold px-2 py-0.5 rounded">DOCTOR</span></td>
              <td className="p-4 text-[#5B6472]">Cardiology</td>
              <td className="p-4 text-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" onChange={(e) => handleStatusToggle('STF-003', e.target.checked)} />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E07856]"></div>
                </label>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#0E4749] text-white p-4 flex justify-between items-center">
              <h4 className="font-bold">Add New Staff Member</h4>
              <button onClick={resetForm} className="text-teal-200 hover:text-white" disabled={isLoading}><X className="w-5 h-5"/></button>
            </div>
            
            {successData ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Staff Registered</h4>
                <p className="text-sm text-[#5B6472] mb-6">Provide these credentials to the new employee.</p>
                
                <div className="bg-gray-50 border border-[#DCE3E0] rounded-lg p-4 text-left mb-6 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-[#5B6472]">Staff ID:</span> <span className="font-mono font-bold text-gray-900">{successData.id}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-[#5B6472]">Role:</span> <span className="font-bold text-[#0E4749]">{successData.role}</span></div>
                  <div className="flex justify-between text-sm pt-2 border-t border-[#DCE3E0]"><span className="text-[#5B6472]">Temp Password:</span> <span className="font-mono font-bold text-[#E07856]">{successData.pass}</span></div>
                </div>
                
                <button onClick={resetForm} className="w-full bg-[#0E4749] hover:bg-[#0a3335] text-white py-2.5 rounded-lg font-bold text-sm">
                  Close
                </button>
              </div>
            ) : (
              <form className="p-6 space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">Full Name</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full p-2.5 border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749] text-sm" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">Email Address</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2.5 border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749] text-sm" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">Role</label>
                  <select required value={role} onChange={e => setRole(e.target.value)} className="w-full p-2.5 border border-[#DCE3E0] rounded-lg bg-white focus:outline-none focus:border-[#0E4749] text-sm">
                    <option value="">Select a role...</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Receptionist">Receptionist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">Department</label>
                  <select required={role === 'Doctor'} value={dept} onChange={e => setDept(e.target.value)} className="w-full p-2.5 border border-[#DCE3E0] rounded-lg bg-white focus:outline-none focus:border-[#0E4749] text-sm">
                    <option value="">Select department...</option>
                    <option value="cardio">Cardiology</option>
                    <option value="genmed">General Medicine</option>
                    <option value="surgery">Surgery</option>
                  </select>
                </div>

                {role === 'Doctor' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">Specialty</label>
                    <input type="text" required value={specialty} onChange={e => setSpecialty(e.target.value)} className="w-full p-2.5 border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749] text-sm" />
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-2">
                  <button type="button" onClick={resetForm} disabled={isLoading} className="px-4 py-2 text-sm font-bold text-[#5B6472] hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" disabled={isLoading} className="px-6 py-2 text-sm font-bold bg-[#E07856] hover:bg-[#c96749] text-white rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50">
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isLoading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
