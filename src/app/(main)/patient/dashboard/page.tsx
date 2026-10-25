'use client';

import { useAuth } from '@/hooks/useAuth';
import { PatientDashboardView } from '@/components/features/patient/PatientDashboardView';

export default function PatientDashboard() {
  const { user, userName, isLoading } = useAuth();

  if (isLoading || !user) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <PatientDashboardView
      patientId={user.user_id}
      patientName={userName || user.username}
    />
  );
}
