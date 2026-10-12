export * from './api';

export type Role = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST' | 'PATIENT';

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
