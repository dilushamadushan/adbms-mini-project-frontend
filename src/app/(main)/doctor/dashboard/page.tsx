'use client';

import { useAuth } from '@/hooks/useAuth';
import { DoctorDashboardView } from '@/components/features/doctor/DoctorDashboardView';


export default function DoctorDashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return <p className="text-sm text-slate-500">Loading…</p>;

return <DoctorDashboardView doctorId={Number(user.user_id)} doctorName={user.username} />;
}