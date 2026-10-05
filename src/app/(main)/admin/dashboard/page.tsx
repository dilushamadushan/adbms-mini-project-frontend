import React from 'react';
import { Users, BedDouble, Calendar } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Patients" value="1,248" subtext="All time registered" icon={<Users className="w-5 h-5 text-[#0E4749]" />} />
        <StatCard title="Bed Occupancy" value="84%" subtext="42/50 Beds" icon={<BedDouble className="w-5 h-5 text-[#E07856]" />} />
        <StatCard title="Today's Appts" value="156" subtext="Across all depts" icon={<Calendar className="w-5 h-5 text-[#0E4749]" />} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 border border-[#DCE3E0] rounded-xl shadow-sm">
          <h4 className="font-bold text-[#0E4749] mb-4">Department Load (Mock Chart)</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="font-bold text-gray-900">Cardiology</span><span>82%</span></div>
              <div className="h-4 bg-gray-100 rounded overflow-hidden"><div className="h-full bg-[#0E4749] w-[82%]"></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="font-bold text-gray-900">Pediatrics</span><span>45%</span></div>
              <div className="h-4 bg-gray-100 rounded overflow-hidden"><div className="h-full bg-[#0E4749] w-[45%]"></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="font-bold text-gray-900">Emergency</span><span className="text-[#E07856]">98%</span></div>
              <div className="h-4 bg-gray-100 rounded overflow-hidden"><div className="h-full bg-[#E07856] w-[98%]"></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
