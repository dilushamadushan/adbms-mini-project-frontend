import apiClient from '@/lib/apiClient';
import { calcAge, formatTime } from '@/lib/dateUtils';
import type { ApiAppointment, AppointmentStatus, DoctorAppointment, DoctorUserAppointment } from '@/types/doctor';

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
};