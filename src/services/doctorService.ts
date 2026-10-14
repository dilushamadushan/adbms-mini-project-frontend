import apiClient from '@/lib/apiClient';
import { calcAge, formatTime } from '@/lib/dateUtils';
import type { ApiAppointment, AppointmentStatus, DoctorAppointment } from '@/types/doctor';

const STATUS_MAP: Record<string, AppointmentStatus> = {
    completed: 'COMPLETED',
    scheduled: 'SCHEDULED',
    cancelled: 'CANCELLED'
   
};

function mapAppointment(a: ApiAppointment): DoctorAppointment {
    return {
        id: String(a.apt_id),
        date: a.apt_date.slice(0, 10),
        timeSlot: a.time_slot,
        time: formatTime(a.time_slot),
        patientId: String(a.patient_id),
        patientName: a.patient_name,
        age: calcAge(a.dob),
        bloodGroup: a.blood_group ?? '—',
        allergies: a.allergies ?? 'None',
        reason: a.dept_name,
        status: STATUS_MAP[a.status?.toLowerCase()] ?? 'SCHEDULED',
    };
}

export const doctorService = {
    getAppointments: async (doctorId: number): Promise<DoctorAppointment[]> => {
        const res = await apiClient.get<ApiAppointment[]>(`/doctor/appointments/${doctorId}`);
        return (res.data || []).map(mapAppointment);
    },

    getAppointmentCount: async (doctorId: number): Promise<number> => {
        const url = `/doctor/appointment-count/${doctorId}`;
        console.log('CALLING:', url);

        const res = await apiClient.get<number>(url);
        console.log('COUNT RESPONSE:', res.data);
        return res.data;
    },

    getAppointmentHistory: async (doctorId: number): Promise<DoctorAppointment[]> => {
        const res = await apiClient.get<ApiAppointment[]>(`/doctor/appointment-history/${doctorId}`);
        return (res.data || []).map(mapAppointment);
    },
};