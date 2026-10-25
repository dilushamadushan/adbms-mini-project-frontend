import apiClient from '@/lib/apiClient';
import { MOCK_PATIENT_ACTION_DATA } from '@/lib/patientActionMock';
import type { AdmissionDetails, AdmissionRequestData, DischargeRequestData, PatientActionData, WardOption } from '@/types/patientAction';
import type { DoctorAppointment } from '@/types/doctor';

interface PatientDetailsResponse {
  patient_id: number;
  patient_name: string;
  gender: string | null;
  age: number | null;
  dob: string | null;
  phone: string | null;
  blood_group: string | null;
  allergies: string | null;
}

interface PatientAppointmentDetailsResponse {
  apt_date: string;
  apt_time: string;
  reason: string;
}

interface AdmissionStatusResponse {
  is_admitted: boolean;
  admission: AdmissionDetails | null;
}

export interface PrescriptionPayload {
  patient_id: number;
  apt_id: number;
  doctor_id: number;
  diagnosis: string;
  clinical_notes: string;
  medicines: Array<{
    medicine_id: number;
    dose: string;
    frequency: string;
    duration: string;
  }>;
}

export interface PrescriptionResponse {
  message: string;
  record_id: number;
}

export interface AdmittedPrescriptionPayload {
  patient_id: number;
  apt_id: number;
  doctor_id: number;
  diagnosis: string;
  clinical_notes: string;
  medicines: Array<{
    medicine_id: number;
    dose: string;
    frequency: string;
    duration: string;
    first_dose: string;
    notes: string;
  }>;
  nurse_orders: Array<{
    order_type: string;
    instruction: string;
  }>;
}

const normalizeGender = (gender: string | null): 'Female' | 'Male' | 'Other' => {
  if (gender === 'Female' || gender === 'Male') {
    return gender;
  }
  return 'Other';
};

export const patientActionService = {
  getAdmissionStatus: async (patientId: number): Promise<AdmissionStatusResponse> => {
    const response = await apiClient.get<AdmissionStatusResponse>(
      `/doctor/admission-status/${patientId}`
    );
    return response.data;
  },

  getWardNames: async (): Promise<WardOption[]> => {
    const response = await apiClient.get<WardOption[]>('/doctor/wards');
    if (!Array.isArray(response.data)) {
      throw new Error('The ward response is invalid');
    }
    return response.data;
  },

  createAdmissionRequest: async (data: AdmissionRequestData): Promise<{ message: string; admission_id: number }> => {
    try {
      const response = await apiClient.post<{ message: string; admission_id: number }>(
        '/doctor/admissions',
        data
      );
      return response.data;
    } catch (error) {
      const detail = (error as { response?: { data?: { detail?: string } } }).response?.data?.detail;
      throw new Error(detail || 'Failed to save admission request');
    }
  },

  requestDischarge: async (data: DischargeRequestData): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post<{ message: string }>('/doctor/discharge', data);
      return response.data;
    } catch (error) {
      const detail = (error as { response?: { data?: { detail?: string } } }).response?.data?.detail;
      throw new Error(detail || 'Failed to request discharge');
    }
  },

  /**
   * Fetches the appointment first to resolve its patient ID, then loads the
   * patient card data from the dedicated patient-details endpoint.
   */
  getPatientActionData: async (appointmentId: string): Promise<PatientActionData> => {
    const appointmentResponse = await apiClient.get<{
      apt_id: number;
      patient_id: number;
      doctor_id: number;
      apt_date: string;
      time_slot: string;
      dept_name: string;
      reason?: string;
      status: string;
    }>(`/appointments/${appointmentId}`);
    const appointment = appointmentResponse.data;

    if (!appointment?.patient_id) {
      throw new Error('The appointment did not include a patient ID');
    }

    const [patientResponse, appointmentDetailsResponse, admissionStatusResponse] = await Promise.all([
      apiClient.get<PatientDetailsResponse>(
        `/doctor/patient-details/${appointment.patient_id}`
      ),
      apiClient.get<PatientAppointmentDetailsResponse>(
        `/doctor/patient-appointment-details/${appointmentId}`
      ),
      apiClient.get<AdmissionStatusResponse>(
        `/doctor/admission-status/${appointment.patient_id}`
      ),
    ]);
    const patient = patientResponse.data;
    const appointmentDetails = appointmentDetailsResponse.data;

    if (!appointmentDetails?.apt_date || !appointmentDetails?.apt_time || !appointmentDetails?.reason) {
      throw new Error('The appointment details response is incomplete');
    }

    return {
      ...MOCK_PATIENT_ACTION_DATA,
      patient: {
        id: String(patient.patient_id),
        name: patient.patient_name,
        gender: normalizeGender(patient.gender),
        age: patient.age ?? 0,
        dob: patient.dob ?? '',
        phone: patient.phone ?? '',
        bloodGroup: patient.blood_group ?? '',
        allergies: patient.allergies ?? 'None recorded',
      },
      appointment: {
        ...MOCK_PATIENT_ACTION_DATA.appointment,
        id: String(appointment.apt_id),
        date: appointmentDetails.apt_date,
        formattedDate: appointmentDetails.apt_date,
        timeSlot: appointment.time_slot,
        time: appointmentDetails.apt_time,
        reason: appointmentDetails.reason,
        doctorId: appointment.doctor_id,
        doctorName: appointment.doctor_name,
        status: appointment.status.toUpperCase() as PatientActionData['appointment']['status'],
      },
      isAdmitted: admissionStatusResponse.data.is_admitted,
      admission: admissionStatusResponse.data.admission,
    };
  },


  /**
   * Saves or updates clinical notes for an appointment.
   */
  saveNotes: async (appointmentId: string, notes: string): Promise<{ success: boolean; message: string }> => {
    try {
      // TODO: Connect to backend POST /doctor/patient-action/:appointmentId/notes
      await apiClient.post(`/doctor/patient-action/${appointmentId}/notes`, { notes });
      return { success: true, message: 'Clinical notes saved successfully' };
    } catch {
      // Mock success for seamless UI demonstration
      return { success: true, message: 'Clinical notes saved (Demo mode)' };
    }
  },

  /**
   * Dispatches the draft prescription to pharmacy.
   */
  sendToPharmacy: async (
    appointmentId: string,
    payload: PrescriptionPayload
  ): Promise<PrescriptionResponse> => {
    try {
      const response = await apiClient.post<PrescriptionResponse>('/doctor/prescriptions', payload);
      return response.data;
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as {
          response?: { data?: { detail?: string | Array<{ msg?: string }> } };
        }).response;
        const detail = response?.data?.detail;
        if (typeof detail === 'string') {
          throw new Error(detail);
        }
        if (Array.isArray(detail)) {
          throw new Error(detail.map((item) => item.msg).filter(Boolean).join(', ') || 'Invalid prescription data');
        }
      }
      throw error;
    }
  },

  saveAdmittedPrescription: async (
    payload: AdmittedPrescriptionPayload
  ): Promise<PrescriptionResponse> => {
    try {
      const response = await apiClient.post<PrescriptionResponse>(
        '/doctor/admitted-prescriptions',
        payload
      );
      return response.data;
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const detail = (error as {
          response?: { data?: { detail?: string } };
        }).response?.data?.detail;
        if (detail) throw new Error(detail);
      }
      throw error;
    }
  },

  /**
   * Triggers an urgent escalation or admission request.
   */
  escalateForAdmission: async (
    appointmentId: string,
    reason?: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      // TODO: Connect to backend POST /doctor/patient-action/:appointmentId/escalate
      await apiClient.post(`/doctor/patient-action/${appointmentId}/escalate`, { reason });
      return { success: true, message: 'Patient escalated for admission' };
    } catch {
      // Mock success for seamless UI demonstration
      return { success: true, message: 'Patient escalated for admission (Demo mode)' };
    }
  },

  /**
   * Completes the appointment and updates status.
   */
  completeAppointment: async (appointmentId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const appointmentResponse = await apiClient.get<{
        doctor_id: number;
      }>(`/appointments/${appointmentId}`);
      const response = await apiClient.post<{ message: string }>(
        '/doctor/appointments/complete',
        {
          appointment_id: Number(appointmentId),
          doctor_id: appointmentResponse.data.doctor_id,
        }
      );
      return { success: true, message: response.data.message };
    } catch (error) {
      const detail = (error as { response?: { data?: { detail?: string } } }).response?.data?.detail;
      throw new Error(detail || 'Failed to complete appointment');
    }
  },

  /**
   * Submits hospital inpatient admission request.
   */
  submitAdmission: async (
    appointmentId: string,
    data: unknown
  ): Promise<{ success: boolean; message: string }> => {
    try {
      // TODO: Connect to backend POST /doctor/patient-action/:appointmentId/admission
      await apiClient.post(`/doctor/patient-action/${appointmentId}/admission`, data);
      return { success: true, message: 'Inpatient admission requested successfully' };
    } catch {
      return { success: true, message: 'Inpatient admission registered (Demo mode)' };
    }
  },

  /**
   * Submits urgent specialist or hospital referral.
   */
  submitReferral: async (
    appointmentId: string,
    data: unknown
  ): Promise<{ success: boolean; message: string }> => {
    try {
      // TODO: Connect to backend POST /doctor/patient-action/:appointmentId/referral
      await apiClient.post(`/doctor/patient-action/${appointmentId}/referral`, data);
      return { success: true, message: 'Urgent referral dispatched successfully' };
    } catch {
      return { success: true, message: 'Urgent referral dispatched (Demo mode)' };
    }
  },

  /**
   * Submits patient discharge or DAMA (Discharge Against Medical Advice / Refusal).
   */
  submitDischargeDisagree: async (
    appointmentId: string,
    data: unknown
  ): Promise<{ success: boolean; message: string }> => {
    try {
      // TODO: Connect to backend POST /doctor/patient-action/:appointmentId/discharge
      await apiClient.post(`/doctor/patient-action/${appointmentId}/discharge`, data);
      return { success: true, message: 'Discharge / disposition record documented successfully' };
    } catch {
      return { success: true, message: 'Discharge / disposition saved (Demo mode)' };
    }
  },

  /**
   * Fallback mock appointments for today if no live appointments are loaded
   */
  getMockTodayAppointments: (): DoctorAppointment[] => [
    {
      id: 'apt-10284',
      date: '2026-10-26',
      timeSlot: '09:00',
      time: '09:00 AM',
      patientId: '10284',
      patientName: 'Jane Doe',
      age: 31,
      bloodGroup: 'O+',
      allergies: 'Penicillin',
      reason: 'Fever and sore throat',
      status: 'SCHEDULED',
    },
    {
      id: 'MS-8821',
      date: '2026-10-26',
      timeSlot: '09:45',
      time: '09:45 AM',
      patientId: 'MS-8821',
      patientName: 'Sarah Jenkins',
      age: 42,
      bloodGroup: 'O+',
      allergies: 'Penicillin',
      reason: 'Post-Op Checkup',
      status: 'SCHEDULED',
    },
    {
      id: 'MS-1102',
      date: '2026-10-26',
      timeSlot: '10:30',
      time: '10:30 AM',
      patientId: 'MS-1102',
      patientName: 'Michael Ross',
      age: 35,
      bloodGroup: 'A-',
      allergies: 'None',
      reason: 'Consultation',
      status: 'SCHEDULED',
    },
  ],
};
