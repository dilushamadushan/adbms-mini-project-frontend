import { Role } from '@/types';

export const APP_CONFIG = {
  name: 'MediCore',
  version: '1.0.0',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',
} as const;

export const ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  NURSE: 'NURSE',
  RECEPTIONIST: 'RECEPTIONIST',
  PATIENT: 'PATIENT',
} as const satisfies Record<Role, Role>;

export const ROUTES: Record<Role, string> = {
  ADMIN: '/admin/dashboard',
  DOCTOR: '/doctor/dashboard',
  NURSE: '/nurse/dashboard',
  RECEPTIONIST: '/receptionist/dashboard',
  PATIENT: '/patient/dashboard',
};

export const LOCAL_STORAGE_KEYS = {
  ROLE: 'medicore_role',
  USER: 'medicore_user',
  TOKEN: 'medicore_token',
} as const;

export const STATUS_COLORS = {
  Critical: 'border-red-200 bg-red-50 text-red-700',
  Recovering: 'border-teal-200 bg-teal-50 text-teal-700',
  Stable: 'border-gray-200 bg-gray-50 text-gray-700',
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  PENDING: 'bg-amber-100 text-amber-700',
  URGENT: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
  COMPLETED: 'bg-blue-100 text-blue-700',
} as const;
