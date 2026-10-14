import type { DoctorAppointment, DoctorProfile, DoctorStat } from '@/types/doctor';

export const doctor: DoctorProfile = { name: 'Dr. Nimal', specialty: 'Cardiologist' };

export const stats: DoctorStat[] = [
  { key: 'today', title: "Today's Appointments", value: 6, subtext: '2 completed • 4 upcoming', tone: 'blue' },
  { key: 'patients', title: 'Total Patients', value: 124, subtext: '(this month)', tone: 'green' },
  { key: 'followups', title: 'Pending Follow-ups', value: 3, subtext: 'need attention', tone: 'red' },
  { key: 'rx', title: 'Prescriptions Issued', value: 18, subtext: '(this week)', tone: 'purple' },
];

export const appointments: DoctorAppointment[] = [
  { id: '1', time: '09:00 AM', patientName: 'Nadeesha Silva', patientId: 'P-0023', age: 32, gender: 'Female', reason: 'Cardiac Checkup', status: 'COMPLETED' },
  { id: '2', time: '10:30 AM', patientName: 'Kasun Perera', patientId: 'P-0045', age: 45, gender: 'Male', reason: 'Follow-up', status: 'SCHEDULED' },
  { id: '3', time: '11:00 AM', patientName: 'Dilini Fernando', patientId: 'P-0078', age: 28, gender: 'Female', reason: 'Fever', status: 'SCHEDULED' },
  { id: '4', time: '02:00 PM', patientName: 'Saman Kumara', patientId: 'P-0102', age: 52, gender: 'Male', reason: 'Diabetes Checkup', status: 'SCHEDULED' },
  { id: '5', time: '03:30 PM', patientName: 'Tharushi Jayasinghe', patientId: 'P-0110', age: 36, gender: 'Female', reason: 'Consultation', status: 'CANCELLED' },
  { id: '6', time: '04:30 PM', patientName: 'Ravindu Madushanka', patientId: 'P-0124', age: 40, gender: 'Male', reason: 'Blood Test Review', status: 'UPCOMING' },
];