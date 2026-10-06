import React from 'react';
import Link from 'next/link';
import { Users, ClipboardList } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { QueueItem } from '@/components/features/appointments/QueueItem';

export default function DoctorDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard title="Patients Seen Today" value="8" subtext="4 remaining" icon={<Users className="w-5 h-5 text-[#0E4749]" />} />
        <StatCard title="Pending Lab Results" value="3" subtext="Requires review" icon={<ClipboardList className="w-5 h-5 text-[#E07856]" />} />
      </div>

      <div className="bg-white rounded-xl border border-[#DCE3E0] p-6 shadow-sm">
        <h3 className="font-bold text-[#0E4749] mb-6">Today's Appointment Queue</h3>
        <div className="space-y-4">
          <Link href="/doctor/patients/MS-8821" className="block">
            <QueueItem time="09:30 AM" patient="Sarah Jenkins" id="MS-8821" reason="Post-Op Checkup" status="URGENT" />
          </Link>
          <Link href="/doctor/patients/MS-1102" className="block">
            <QueueItem time="10:15 AM" patient="Michael Ross" id="MS-1102" reason="General Consultation" status="CONFIRMED" />
          </Link>
          <Link href="/doctor/patients/MS-4482" className="block opacity-50">
            <QueueItem time="08:00 AM" patient="Emma Thompson" id="MS-4482" reason="Lab Results Review" status="COMPLETED" />
          </Link>
        </div>
      </div>
    </div>
  );
}
