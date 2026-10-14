import { doctor } from '@/lib/doctorDashboard';
import { DoctorDashboardView } from '@/components/features/doctor/DoctorDashboardView';

const DOCTOR_ID = 4; // TODO: replace with the logged-in doctor's id (from useAuth)

export default function DoctorDashboard() {
  return <DoctorDashboardView doctorId={DOCTOR_ID} doctorName={doctor.name} />;
}