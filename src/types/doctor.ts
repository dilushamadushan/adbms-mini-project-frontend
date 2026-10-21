export type AppointmentStatus = 'COMPLETED' | 'SCHEDULED' | 'CANCELLED' | 'UPCOMING';

export interface ApiAppointment {
    apt_id: number;
    patient_id: number;
    patient_name: string;
    dob?: string | null;
    age?: number | string | null;
    blood_group?: string | null;
    allergies?: string | null;
    dept_id?: number;
    dept_name?: string;
    apt_date: string;   // "2026-10-13"
    time_slot: string;  // "10:00"
    status: string;     // "Scheduled" | "Completed" | ...
    reason?: string | null;
}

export interface DoctorAppointment {
    id: string;
    date: string;        // "YYYY-MM-DD"
    timeSlot: string;    // raw "10:00", used for sorting
    time: string;        // display "10:00 AM"
    patientId: string;
    patientName: string;
    age: number | string;
    gender?: string;
    bloodGroup: string;
    allergies: string;
    reason: string;      // department name
    status: AppointmentStatus;
}

export type StatTone = 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'amber';


export interface DoctorStat {
    key: string;
    title: string;
    value: number | string;
    subtext: string;
    tone: StatTone;
}

export interface DoctorProfile {
    name: string;
    specialty: string;
}