import apiClient from '@/lib/apiClient';

export type LabOrderPatient = {
  patient_id: number;
  patient_name: string;
  age: number | null;
  gender?: string | null;
  blood_group: string | null;
  allergies: string | null;
  appointment_id: number;
  appointment_date: string;
  appointment_status: string;
};

export type CreatedLabOrder = {
  lab_id: number;
  patient_id: number;
  doctor_id: number;
  test_type: string;
  status: string;
  results_text: string;
};

export type PatientLabResult = {
  lab_id: number;
  patient_id: number;
  patient_name: string;
  age: number | null;
  blood_group: string | null;
  allergies: string | null;
  doctor_id?: number | null;
  doctor_name?: string | null;
  test_type: string;
  status: string;
  result: string;
  ordered_at?: string | null;
  updated_at?: string | null;
};
import { calcAge, formatTime } from '@/lib/dateUtils';
import type { ApiAppointment, AppointmentStatus, DoctorAppointment, DoctorUserAppointment } from '@/types/doctor';

export interface DoctorMedicine {
    medicine_id: number;
    med_name: string;
    generic_name: string | null;
}

const STATUS_MAP: Record<string, AppointmentStatus> = {
    completed: 'COMPLETED',
    scheduled: 'SCHEDULED',
    cancelled: 'CANCELLED'

};

function mapAppointment(a: ApiAppointment): DoctorAppointment {
    return {
        id: String(a.apt_id),
        date: a.apt_date ? String(a.apt_date).slice(0, 10) : '',
        timeSlot: a.time_slot || '',
        time: formatTime(a.time_slot),
        patientId: String(a.patient_id),
        patientName: a.patient_name,
        age: a.age ?? calcAge(a.dob),
        bloodGroup: a.blood_group ?? '—',
        allergies: a.allergies ?? 'None',
        reason: a.reason ?? a.dept_name ?? 'Consultation',
        status: STATUS_MAP[a.status?.toLowerCase()] ?? 'SCHEDULED',
    };
}

export const doctorService = {
  getLabOrderPatients: () =>
    apiClient.get<LabOrderPatient[]>('/doctor/lab-order-patients'),
  createLabOrder: (payload: { patient_id: number; doctor_user_id: number; test_type: string }) =>
    apiClient.post<CreatedLabOrder>('/doctor/lab-orders', payload),
  getPatientLabResults: (patientId: number) =>
    apiClient.get<PatientLabResult[]>(`/doctor/lab-orders/patient/${patientId}`),
    getAppointments: async (doctorId: number): Promise<DoctorAppointment[]> => {
        const res = await apiClient.get<ApiAppointment[]>(`/doctor/appointments/${doctorId}`);
        return (res.data || []).map(mapAppointment);
    },

    getUpcomingAppointments: async (doctorId: number): Promise<DoctorAppointment[]> => {
        const res = await apiClient.get<ApiAppointment[]>(`/doctor/upcoming-appointments/${doctorId}`);
        return (res.data || []).map((a) => ({
            ...mapAppointment(a),
            status: 'UPCOMING' as const,
        }));
    },

    getAppointmentCount: async (doctorId: number): Promise<number> => {
        const url = `/doctor/appointment-count/${doctorId}`;
        console.log('CALLING:', url);

        const res = await apiClient.get<number>(url);
        console.log('COUNT RESPONSE:', res.data);
        return res.data;
    },

    getCompletedAppointmentCount: async (doctorId: number): Promise<number> => {
        const url = `/doctor/appointment-count-completed/${doctorId}`;
        const res = await apiClient.get<number>(url);
        return res.data;
    },

    getTotalPatientsCount: async (doctorId: number): Promise<number> => {
        const url = `/doctor/patients-count/${doctorId}`;
        const res = await apiClient.get<number>(url);
        return res.data;
    },

    getAppointmentHistory: async (doctorId: number): Promise<DoctorAppointment[]> => {
        const res = await apiClient.get<ApiAppointment[]>(`/doctor/appointment-history/${doctorId}`);
        return (res.data || []).map(mapAppointment);
    },

    getAppointmentsByUser: async (userId: number): Promise<DoctorUserAppointment[]> => {
        const res = await apiClient.get<DoctorUserAppointment[]>(`/doctor/appointments-by-user/${userId}`);
        return res.data || [];
    },

    getMedicines: async (): Promise<DoctorMedicine[]> => {
        const res = await apiClient.get<DoctorMedicine[]>('/doctor/medicines');
        return res.data || [];
    },
};