export * from './api';
export * from './pharmacy';

export type Role = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST' | 'PATIENT' | 'PHARMACIST';

export interface AuthUser {
  user_id: number | string;
  username: string;
  role: Role;
  is_active: boolean;
  active_sessions?: number;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    user_id: number | string;
    username: string;
    role: string;
    is_active: boolean;
  };
}

export interface AuthContextType {
  user: AuthUser | null;
  role: Role | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshProfile: () => Promise<AuthUser | null>;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  valid: boolean;
  message: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  new_password: string;
  confirm_password?: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface StaffMember {
  user_id: number;
  staff_id: number;
  username: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  dept_id?: number | null;
  specialty?: string | null;
  raw_password?: string | null;
  is_active?: boolean | number;
}

export interface CreateStaffPayload {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  dept_id?: number | null;
  specialty?: string | null;
}

export interface UpdateUserStatusResponse {
  message: string;
  user_id: number;
  is_active: boolean;
}

export interface Department {
  dept_id: number;
  dept_name: string;
  parent_dept_id: number | null;
  created_at?: string;
  updated_at?: string;
  staff_count?: number;
}

export interface DepartmentCatalogNode {
  dept_id: number;
  dept_name: string;
  parent_dept_id: number | null;
  created_at?: string;
  updated_at?: string;
  sub_departments?: DepartmentCatalogNode[];
  staff_count?: number;
}

export interface CreateDepartmentPayload {
  dept_name: string;
  parent_dept_id: number | null;
}

export interface UpdateDepartmentPayload {
  dept_name: string;
  parent_dept_id?: number | null;
}

export interface DeleteDepartmentResponse {
  message: string;
  dept_id: number;
}

export interface Patient {
  id: string;
  name: string;
  mrn: string;
  dateOfBirth?: string;
  age?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  phone?: string;
  address?: string;
  allergies?: string[];
  status: 'Critical' | 'Recovering' | 'Stable';
  lastVisit?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'URGENT';
  reason: string;
  room?: string;
}

export interface LabOrder {
  id: string;
  title: string;
  patientId: string;
  patientName: string;
  doctorId?: string;
  date: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Critical';
  results?: Record<string, string>;
}

export interface DepartmentWorkloadItem {
  dept_id?: number;
  dept_name: string;
  workload_level?: string;
  progress_bar_pct: number;
  total_appointments?: number;
  workload_percentage?: number;
}

export interface ProviderWorkloadItem {
  provider_name: string;
  pts_seen: number;
  avg_time: string;
  workload_rank: number;
}

export interface WorkloadSummaryResponse {
  department_workload: DepartmentWorkloadItem[];
  top_providers: ProviderWorkloadItem[];
}

export interface WorkloadSummaryParams {
  top_n?: number;
  start_date?: string;
  end_date?: string;
}

export interface KpiBedDetails {
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
  cleaning_beds: number;
  occupancy_rate: number;
  formatted_occupancy: string;
}

export interface KpiAppointmentDetails {
  total_today: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  no_show: number;
}

export interface KpiOverviewResponse {
  total_patients: number;
  bed_occupancy_pct: number;
  bed_occupancy_formatted: string;
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
  todays_appointments: number;
  target_date: string;
  bed_details: KpiBedDetails;
  appointment_details: KpiAppointmentDetails;
}

export type AuditRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AuditLogItem {
  log_id: number;
  timestamp: string;
  actor_id?: number | null;
  actor: string;
  action: string;
  resource: string;
  risk: AuditRiskLevel;
  details?: Record<string, any> | string | null;
  ip_address?: string | null;
}

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  actor?: string;
  action?: string;
  risk?: string;
  resource?: string;
  date?: string;
  start_date?: string;
  end_date?: string;
}

export interface AuditLogResponse {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  items: AuditLogItem[];
}

export interface NotificationItem {
  notification_id: number;
  title: string;
  message: string;
  type: string;
  target_role?: string | null;
  target_user_id?: number | null;
  is_read: boolean;
  details?: Record<string, any> | null;
  created_at: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  total: number;
  unread_count: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  is_read?: boolean;
  type?: string;
  role?: string;
}

