"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users, Plus, X, Loader2, CheckCircle, AlertCircle,
  Search, RefreshCw, Copy, Check, Shield, Stethoscope, Briefcase,
  Edit2, Trash2, Eye, UserCheck, UserX, AlertTriangle, Mail, Building2, Pill
} from 'lucide-react';
import { toast } from 'sonner';
import { staffService } from '@/services/staffService';
import { departmentService } from '@/services/departmentService';
import { StaffMember, CreateStaffPayload, UpdateStaffPayload, Department } from '@/types';

export default function AdminStaff() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Add Staff Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [addFormError, setAddFormError] = useState<string | null>(null);
  const [createdStaff, setCreatedStaff] = useState<StaffMember | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Add Form Fields
  const [addFirstName, setAddFirstName] = useState('');
  const [addLastName, setAddLastName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState('doctor');
  const [addDeptId, setAddDeptId] = useState<string>('');
  const [addSpecialty, setAddSpecialty] = useState('');

  // Edit Staff Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('doctor');
  const [editDeptId, setEditDeptId] = useState<string>('');
  const [editSpecialty, setEditSpecialty] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  // View Details Modal State
  const [viewingStaff, setViewingStaff] = useState<StaffMember | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Delete / Deactivate Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'soft' | 'hard'>('soft');

  // Status toggle in-flight tracking
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  // Helper to extract clean error messages from API calls
  const extractErrorMessage = (err: unknown, fallback: string): string => {
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosErr = err as { response?: { data?: { detail?: string; message?: string } } };
      if (axiosErr.response?.data?.detail) return axiosErr.response.data.detail;
      if (axiosErr.response?.data?.message) return axiosErr.response.data.message;
    } else if (err instanceof Error) {
      return err.message;
    }
    return fallback;
  };

  // Fetch staff list & departments
  const loadStaff = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [staffData, deptData] = await Promise.all([
        staffService.getStaff(),
        departmentService.getAll().catch(() => []),
      ]);
      setStaffList(staffData);
      setDepartments(deptData);
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Failed to load staff records from server.');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  // Department name lookup map
  const deptMap = useMemo(() => {
    const map = new Map<number, string>();
    departments.forEach((d) => map.set(d.dept_id, d.dept_name));
    return map;
  }, [departments]);

  // Quick stats counters
  const stats = useMemo(() => {
    const total = staffList.length;
    const active = staffList.filter((s) => Boolean(s.is_active)).length;
    const doctors = staffList.filter((s) => s.role?.toLowerCase() === 'doctor').length;
    const nurses = staffList.filter((s) => s.role?.toLowerCase() === 'nurse').length;
    return { total, active, doctors, nurses };
  }, [staffList]);

  // Filtered staff records
  const filteredStaff = useMemo(() => {
    return staffList.filter((staff) => {
      const fullName = `${staff.first_name || ''} ${staff.last_name || ''}`.toLowerCase();
      const username = (staff.username || '').toLowerCase();
      const mail = (staff.email || '').toLowerCase();
      const spec = (staff.specialty || '').toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        !searchQuery ||
        fullName.includes(query) ||
        username.includes(query) ||
        mail.includes(query) ||
        spec.includes(query);

      const matchesRole =
        roleFilter === 'ALL' || staff.role?.toUpperCase() === roleFilter.toUpperCase();

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && Boolean(staff.is_active)) ||
        (statusFilter === 'INACTIVE' && !staff.is_active);

      const matchesDept =
        deptFilter === 'ALL' ||
        String(staff.dept_id ?? '') === deptFilter;

      return matchesSearch && matchesRole && matchesStatus && matchesDept;
    });
  }, [staffList, searchQuery, roleFilter, statusFilter, deptFilter]);

  // Handle Add Staff submission
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddFormError(null);
    setIsSubmittingAdd(true);

    try {
      const payload: CreateStaffPayload = {
        first_name: addFirstName.trim(),
        last_name: addLastName.trim(),
        email: addEmail.trim(),
        role: addRole.toLowerCase(),
        dept_id: addDeptId ? Number(addDeptId) : null,
        specialty: addSpecialty.trim() || null,
      };

      const result = await staffService.createStaff(payload);
      setCreatedStaff(result);
      toast.success(`Staff member ${result.first_name} ${result.last_name} created successfully!`);
      loadStaff();
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Failed to create staff member. Please check details.');
      setAddFormError(msg);
      toast.error(msg);
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Open Edit Modal with existing values
  const handleOpenEdit = (staff: StaffMember) => {
    setEditingStaff(staff);
    setEditFirstName(staff.first_name || '');
    setEditLastName(staff.last_name || '');
    setEditEmail(staff.email || '');
    setEditRole(staff.role?.toLowerCase() || 'doctor');
    setEditDeptId(staff.dept_id ? String(staff.dept_id) : '');
    setEditSpecialty(staff.specialty || '');
    setEditIsActive(Boolean(staff.is_active));
    setEditFormError(null);
    setIsEditModalOpen(true);
  };

  // Handle Edit Staff submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    setEditFormError(null);
    setIsSubmittingEdit(true);

    const staffIdentifier = editingStaff.staff_id || editingStaff.user_id;

    try {
      const payload: UpdateStaffPayload = {
        first_name: editFirstName.trim(),
        last_name: editLastName.trim(),
        email: editEmail.trim(),
        role: editRole.toLowerCase(),
        dept_id: editDeptId ? Number(editDeptId) : null,
        specialty: editSpecialty.trim() || null,
        is_active: editIsActive,
      };

      await staffService.updateStaff(staffIdentifier, payload);
      toast.success('Staff details updated successfully!');
      setIsEditModalOpen(false);
      loadStaff();
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Failed to update staff member. Please check inputs.');
      setEditFormError(msg);
      toast.error(msg);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // View single staff details
  const handleViewDetails = async (staff: StaffMember) => {
    setViewingStaff(staff);
    setIsLoadingDetails(true);
    const identifier = staff.staff_id || staff.user_id;
    try {
      const freshData = await staffService.getStaffById(identifier);
      setViewingStaff(freshData);
    } catch {
      // Use existing staff data if fetch fails
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Quick toggle status button in table
  const handleStatusToggle = async (userId: number, currentActive: boolean) => {
    setUpdatingUserId(userId);
    const newStatus = !currentActive;
    try {
      await staffService.updateStatus(userId, newStatus);
      setStaffList((prev) =>
        prev.map((s) => (s.user_id === userId ? { ...s, is_active: newStatus } : s))
      );
      toast.success(`User status changed to ${newStatus ? 'Active' : 'Inactive'}.`);
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Failed to update user status.');
      toast.error(msg);
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Open Delete / Deactivate confirmation modal
  const handleOpenDelete = (staff: StaffMember, defaultMode: 'soft' | 'hard' = 'soft') => {
    setStaffToDelete(staff);
    setDeleteMode(defaultMode);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete / Deactivate action
  const handleConfirmDelete = async () => {
    if (!staffToDelete) return;
    setIsProcessingDelete(true);
    const identifier = staffToDelete.staff_id || staffToDelete.user_id;

    try {
      if (deleteMode === 'soft') {
        await staffService.deactivateStaff(identifier);
        toast.success(`Account for ${staffToDelete.first_name} ${staffToDelete.last_name} deactivated (Soft Deleted).`);
      } else {
        await staffService.deleteStaff(identifier);
        toast.success(`Staff member ${staffToDelete.first_name} ${staffToDelete.last_name} permanently deleted.`);
      }
      setIsDeleteModalOpen(false);
      setStaffToDelete(null);
      loadStaff();
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Failed to complete delete/deactivate request.');
      toast.error(msg);
    } finally {
      setIsProcessingDelete(false);
    }
  };

  // Reset Add Modal
  const resetAddForm = () => {
    setAddFirstName('');
    setAddLastName('');
    setAddEmail('');
    setAddRole('doctor');
    setAddDeptId('');
    setAddSpecialty('');
    setAddFormError(null);
    setCreatedStaff(null);
    setIsAddModalOpen(false);
  };

  // Clipboard copy helper
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.info('Copied to clipboard!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Role Badge Renderer
  const getRoleBadge = (roleName: string) => {
    const r = (roleName || '').toUpperCase();
    switch (r) {
      case 'DOCTOR':
        return (
          <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
            <Stethoscope className="w-3 h-3" /> DOCTOR
          </span>
        );
      case 'NURSE':
        return (
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
            <Briefcase className="w-3 h-3" /> NURSE
          </span>
        );
      case 'ADMIN':
        return (
          <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
            <Shield className="w-3 h-3" /> ADMIN
          </span>
        );
      case 'RECEPTIONIST':
        return (
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
            <Users className="w-3 h-3" /> RECEPTIONIST
          </span>
        );
      case 'PHARMACIST':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
            <Pill className="w-3 h-3" /> PHARMACIST
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
            {r}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-[#0E4749] text-2xl tracking-tight">Staff Management</h3>
          <p className="text-sm text-[#5B6472] mt-0.5">
            Create, update, monitor, and manage hospital personnel accounts and system permissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadStaff}
            disabled={isLoading}
            className="p-2.5 text-gray-600 bg-white border border-[#DCE3E0] hover:bg-gray-50 rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#0E4749]' : ''}`} />
          </button>
          <button
            onClick={() => {
              setCreatedStaff(null);
              setAddFormError(null);
              setIsAddModalOpen(true);
            }}
            className="bg-[#0E4749] text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm hover:bg-[#0a3335] transition-all hover:shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Staff Member
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-xs">
          <div className="flex items-center justify-between text-[#5B6472] mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Staff</span>
            <Users className="w-4 h-4 text-[#0E4749]" />
          </div>
          <div className="text-2xl font-black text-[#0E4749]">{stats.total}</div>
          <div className="text-xs text-gray-400 mt-0.5">Registered personnel</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-xs">
          <div className="flex items-center justify-between text-[#5B6472] mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Active Staff</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.active}</div>
          <div className="text-xs text-gray-400 mt-0.5">{stats.total - stats.active} inactive</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-xs">
          <div className="flex items-center justify-between text-[#5B6472] mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Doctors</span>
            <Stethoscope className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-700">{stats.doctors}</div>
          <div className="text-xs text-gray-400 mt-0.5">Medical practitioners</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-xs">
          <div className="flex items-center justify-between text-[#5B6472] mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Nurses</span>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700">{stats.nurses}</div>
          <div className="text-xs text-gray-400 mt-0.5">Nursing & care team</div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            onClick={loadStaff}
            className="text-xs font-bold underline hover:text-red-900 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-[#DCE3E0] bg-gray-50/70 flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="relative w-full lg:max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, username, email, specialty..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#DCE3E0] rounded-xl focus:outline-none focus:border-[#0E4749] text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white border border-[#DCE3E0] text-xs font-medium rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:border-[#0E4749]"
            >
              <option value="ALL">All Roles</option>
              <option value="DOCTOR">Doctors</option>
              <option value="NURSE">Nurses</option>
              <option value="RECEPTIONIST">Receptionists</option>
              <option value="ADMIN">Admins</option>
              <option value="PHARMACIST">Pharmacists</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-[#DCE3E0] text-xs font-medium rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:border-[#0E4749]"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>

            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-white border border-[#DCE3E0] text-xs font-medium rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:border-[#0E4749] max-w-[170px] truncate"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.dept_id} value={String(d.dept_id)}>
                  {d.dept_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0E4749] text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-semibold">Staff Member</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Department</th>
                <th className="p-4 font-semibold">Specialty</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE3E0]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0E4749]" />
                    <p className="text-sm">Loading staff members from server...</p>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-500">
                    <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="font-semibold text-gray-700">No staff members found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {searchQuery || roleFilter !== 'ALL' || statusFilter !== 'ALL'
                        ? 'Try adjusting your search filters.'
                        : 'Click "Add Staff Member" above to create one.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => {
                  const rawUserId = Number(staff.user_id ?? (staff as { id?: number }).id);
                  const identifier = staff.staff_id || rawUserId;
                  const isActive = Boolean(staff.is_active);
                  const isUpdating = updatingUserId === rawUserId;
                  const deptName = staff.dept_id ? (deptMap.get(staff.dept_id) ?? `Dept #${staff.dept_id}`) : '—';

                  return (
                    <tr
                      key={identifier}
                      className="hover:bg-teal-50/30 transition-colors group"
                    >
                      {/* Name & ID */}
                      <td className="p-4">
                        <div className="font-bold text-gray-900">
                          {staff.first_name} {staff.last_name}
                        </div>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">
                          @{staff.username || 'unknown'} • ID: #{identifier}
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="p-4">
                        {getRoleBadge(staff.role)}
                      </td>

                      {/* Email */}
                      <td className="p-4 text-[#5B6472]">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span>{staff.email}</span>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="p-4 text-gray-700 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          <span>{deptName}</span>
                        </div>
                      </td>

                      {/* Specialty */}
                      <td className="p-4 text-[#5B6472]">
                        {staff.specialty || '—'}
                      </td>

                      {/* Active Toggle */}
                      <td className="p-4 text-center">
                        {isUpdating ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#0E4749] mx-auto" />
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStatusToggle(rawUserId, isActive)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                            }`}
                            title={isActive ? 'Click to deactivate status' : 'Click to activate status'}
                          >
                            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {isActive ? 'Active' : 'Inactive'}
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View */}
                          <button
                            onClick={() => handleViewDetails(staff)}
                            className="p-1.5 text-gray-500 hover:text-[#0E4749] hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                            title="View Staff Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(staff)}
                            className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Staff Member"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete / Deactivate */}
                          <button
                            onClick={() => handleOpenDelete(staff, 'soft')}
                            className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Deactivate or Delete Staff"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ADD STAFF MODAL                                                        */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-[#0E4749] text-white p-5 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-lg">Add New Staff Member</h4>
                <p className="text-teal-200 text-xs mt-0.5">
                  Creates staff record and generates secure credentials
                </p>
              </div>
              <button
                onClick={resetAddForm}
                className="text-teal-200 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                disabled={isSubmittingAdd}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success View with Credentials */}
            {createdStaff ? (
              <div className="p-6 text-center space-y-5">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle className="w-8 h-8" />
                </div>

                <div>
                  <h4 className="text-xl font-bold text-gray-900">Staff Account Created!</h4>
                  <p className="text-sm text-[#5B6472] mt-1">
                    System credentials have been generated. Please copy and provide them to the employee.
                  </p>
                </div>

                {/* Credentials Card */}
                <div className="bg-gray-50 border border-[#DCE3E0] rounded-xl p-4 text-left space-y-3 font-sans">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#5B6472] font-medium">Full Name:</span>
                    <span className="font-bold text-gray-900">
                      {createdStaff.first_name} {createdStaff.last_name}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#5B6472] font-medium">Username:</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-[#0E4749]">
                      <span>{createdStaff.username}</span>
                      <button
                        onClick={() => handleCopy(createdStaff.username, 'username')}
                        className="p-1 hover:bg-gray-200 rounded text-gray-500 cursor-pointer"
                        title="Copy username"
                      >
                        {copiedField === 'username' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#5B6472] font-medium">Role:</span>
                    <span className="font-bold uppercase text-[#0E4749]">{createdStaff.role}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#5B6472] font-medium">Staff ID:</span>
                    <span className="font-mono font-bold text-gray-800">
                      #{createdStaff.staff_id || createdStaff.user_id}
                    </span>
                  </div>

                  {createdStaff.raw_password && (
                    <div className="flex justify-between items-center text-sm pt-3 border-t border-[#DCE3E0]">
                      <span className="text-[#5B6472] font-medium">Generated Password:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#E07856] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                          {createdStaff.raw_password}
                        </span>
                        <button
                          onClick={() => handleCopy(createdStaff.raw_password!, 'password')}
                          className="p-1 hover:bg-gray-200 rounded text-gray-500 cursor-pointer"
                          title="Copy password"
                        >
                          {copiedField === 'password' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {createdStaff.raw_password && (
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          `MediCore HMS Login:\nName: ${createdStaff.first_name} ${createdStaff.last_name}\nUsername: ${createdStaff.username}\nPassword: ${createdStaff.raw_password}\nRole: ${createdStaff.role}`,
                          'all'
                        )
                      }
                      className="w-1/2 border border-[#0E4749] text-[#0E4749] hover:bg-teal-50 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedField === 'all' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      {copiedField === 'all' ? 'Copied Details' : 'Copy All Details'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={resetAddForm}
                    className="flex-1 bg-[#0E4749] hover:bg-[#0a3335] text-white py-2.5 rounded-xl font-bold text-sm transition-colors shadow-xs cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Add Input Form */
              <form className="p-6 space-y-4" onSubmit={handleCreateSubmit}>
                {addFormError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{addFormError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={addFirstName}
                      onChange={(e) => setAddFirstName(e.target.value)}
                      placeholder="e.g. John"
                      className="w-full p-2.5 border border-[#DCE3E0] rounded-xl focus:outline-none focus:border-[#0E4749] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={addLastName}
                      onChange={(e) => setAddLastName(e.target.value)}
                      placeholder="e.g. Doe"
                      className="w-full p-2.5 border border-[#DCE3E0] rounded-xl focus:outline-none focus:border-[#0E4749] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="e.g. john.doe@hospital.com"
                    className="w-full p-2.5 border border-[#DCE3E0] rounded-xl focus:outline-none focus:border-[#0E4749] text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">
                      Role *
                    </label>
                    <select
                      required
                      value={addRole}
                      onChange={(e) => setAddRole(e.target.value)}
                      className="w-full p-2.5 border border-[#DCE3E0] rounded-xl bg-white focus:outline-none focus:border-[#0E4749] text-sm"
                    >
                      <option value="doctor">Doctor</option>
                      <option value="nurse">Nurse</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="admin">Administrator</option>
                      <option value="pharmacist">Pharmacist</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">
                      Department (Optional)
                    </label>
                    <select
                      value={addDeptId}
                      onChange={(e) => setAddDeptId(e.target.value)}
                      className="w-full p-2.5 border border-[#DCE3E0] rounded-xl bg-white focus:outline-none focus:border-[#0E4749] text-sm"
                    >
                      <option value="">None / General</option>
                      {departments.map((d) => (
                        <option key={d.dept_id} value={String(d.dept_id)}>
                          {d.dept_name} (ID: #{d.dept_id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">
                    Specialty (Optional)
                  </label>
                  <input
                    type="text"
                    value={addSpecialty}
                    onChange={(e) => setAddSpecialty(e.target.value)}
                    placeholder="e.g. Cardiology, Pediatrics, Emergency"
                    className="w-full p-2.5 border border-[#DCE3E0] rounded-xl focus:outline-none focus:border-[#0E4749] text-sm"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-[#DCE3E0]">
                  <button
                    type="button"
                    onClick={resetAddForm}
                    disabled={isSubmittingAdd}
                    className="px-4 py-2 text-sm font-bold text-[#5B6472] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAdd}
                    className="px-6 py-2.5 text-sm font-bold bg-[#E07856] hover:bg-[#c96749] text-white rounded-xl transition-all shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingAdd && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSubmittingAdd ? 'Registering...' : 'Register Staff'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EDIT STAFF MODAL                                                       */}
      {/* ========================================================================= */}
      {isEditModalOpen && editingStaff && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-[#0E4749] text-white p-5 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-lg">Edit Staff Member</h4>
                <p className="text-teal-200 text-xs mt-0.5">
                  Update details for #{editingStaff.staff_id || editingStaff.user_id} (@{editingStaff.username})
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-teal-200 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                disabled={isSubmittingEdit}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="p-6 space-y-4" onSubmit={handleEditSubmit}>
              {editFormError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editFormError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full p-2.5 border border-[#DCE3E0] rounded-xl focus:outline-none focus:border-[#0E4749] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full p-2.5 border border-[#DCE3E0] rounded-xl focus:outline-none focus:border-[#0E4749] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-2.5 border border-[#DCE3E0] rounded-xl focus:outline-none focus:border-[#0E4749] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">
                    Role *
                  </label>
                  <select
                    required
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full p-2.5 border border-[#DCE3E0] rounded-xl bg-white focus:outline-none focus:border-[#0E4749] text-sm"
                  >
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Nurse</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="admin">Administrator</option>
                    <option value="pharmacist">Pharmacist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">
                    Department
                  </label>
                  <select
                    value={editDeptId}
                    onChange={(e) => setEditDeptId(e.target.value)}
                    className="w-full p-2.5 border border-[#DCE3E0] rounded-xl bg-white focus:outline-none focus:border-[#0E4749] text-sm"
                  >
                    <option value="">None / General</option>
                    {departments.map((d) => (
                      <option key={d.dept_id} value={String(d.dept_id)}>
                        {d.dept_name} (ID: #{d.dept_id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">
                  Specialty
                </label>
                <input
                  type="text"
                  value={editSpecialty}
                  onChange={(e) => setEditSpecialty(e.target.value)}
                  placeholder="e.g. Cardiology, Neurology"
                  className="w-full p-2.5 border border-[#DCE3E0] rounded-xl focus:outline-none focus:border-[#0E4749] text-sm"
                />
              </div>

              {/* Status Switch */}
              <div className="pt-2 border-t border-[#DCE3E0] flex items-center justify-between">
                <div>
                  <label className="block text-sm font-bold text-gray-900">Active Account Status</label>
                  <p className="text-xs text-[#5B6472]">Allows the staff member to log in to the portal</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0E4749]"></div>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#DCE3E0]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSubmittingEdit}
                  className="px-4 py-2 text-sm font-bold text-[#5B6472] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-6 py-2.5 text-sm font-bold bg-[#0E4749] hover:bg-[#0a3335] text-white rounded-xl transition-all shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VIEW DETAILS MODAL                                                     */}
      {/* ========================================================================= */}
      {viewingStaff && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#0E4749] text-white p-5 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-lg">Staff Profile</h4>
                <p className="text-teal-200 text-xs mt-0.5">Detailed personnel record</p>
              </div>
              <button
                onClick={() => setViewingStaff(null)}
                className="text-teal-200 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {isLoadingDetails ? (
                <div className="py-8 text-center text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0E4749]" />
                  <p className="text-xs mt-2">Loading latest details...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 pb-4 border-b border-[#DCE3E0]">
                    <div className="w-14 h-14 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0E4749] font-bold text-xl">
                      {viewingStaff.first_name?.[0] || 'S'}{viewingStaff.last_name?.[0] || ''}
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900 text-lg">
                        {viewingStaff.first_name} {viewingStaff.last_name}
                      </h5>
                      <div className="flex items-center gap-2 mt-1">
                        {getRoleBadge(viewingStaff.role)}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          viewingStaff.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {viewingStaff.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-[#5B6472]">Staff ID</span>
                      <span className="font-mono font-bold text-gray-800">
                        #{viewingStaff.staff_id || viewingStaff.user_id}
                      </span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-[#5B6472]">User ID</span>
                      <span className="font-mono font-bold text-gray-800">
                        #{viewingStaff.user_id}
                      </span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-[#5B6472]">Username</span>
                      <span className="font-mono font-semibold text-[#0E4749]">
                        @{viewingStaff.username}
                      </span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-[#5B6472]">Email</span>
                      <span className="text-gray-800 font-medium">
                        {viewingStaff.email}
                      </span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-[#5B6472]">Department</span>
                      <span className="font-medium text-gray-800">
                        {viewingStaff.dept_id ? (deptMap.get(viewingStaff.dept_id) ?? `#${viewingStaff.dept_id}`) : 'None'}
                      </span>
                    </div>

                    <div className="flex justify-between py-1.5">
                      <span className="text-[#5B6472]">Specialty</span>
                      <span className="font-medium text-gray-800">
                        {viewingStaff.specialty || 'General / Unspecified'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2 border-t border-[#DCE3E0]">
                    <button
                      type="button"
                      onClick={() => {
                        const target = viewingStaff;
                        setViewingStaff(null);
                        handleOpenEdit(target);
                      }}
                      className="flex-1 border border-[#0E4749] text-[#0E4749] hover:bg-teal-50 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" /> Edit Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewingStaff(null)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DELETE / DEACTIVATE CONFIRMATION MODAL                                 */}
      {/* ========================================================================= */}
      {isDeleteModalOpen && staffToDelete && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
                deleteMode === 'hard' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
              }`}>
                {deleteMode === 'hard' ? <AlertTriangle className="w-8 h-8" /> : <UserX className="w-8 h-8" />}
              </div>

              <div>
                <h4 className="text-xl font-bold text-gray-900">
                  {deleteMode === 'hard' ? 'Permanent Delete Staff Member?' : 'Deactivate Staff Account?'}
                </h4>
                <p className="text-sm text-[#5B6472] mt-1">
                  Target: <span className="font-bold text-gray-800">{staffToDelete.first_name} {staffToDelete.last_name}</span> (ID: #{staffToDelete.staff_id || staffToDelete.user_id})
                </p>
              </div>

              {/* Mode selector pills */}
              <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
                <button
                  type="button"
                  onClick={() => setDeleteMode('soft')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    deleteMode === 'soft'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Soft Deactivate (Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteMode('hard')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    deleteMode === 'hard'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  Hard Delete
                </button>
              </div>

              {/* Informational description based on mode */}
              <div className="p-3 bg-gray-50 border border-[#DCE3E0] rounded-xl text-left text-xs text-[#5B6472] space-y-1">
                {deleteMode === 'soft' ? (
                  <>
                    <p className="font-bold text-gray-800 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Preserves Medical History
                    </p>
                    <p>
                      Sets <code className="bg-gray-200 px-1 rounded">is_active: false</code>. The user cannot log in, but existing patient appointments, prescriptions, and audit logs are safely kept.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-rose-700 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Irreversible Permanent Action
                    </p>
                    <p>
                      Completely drops the record from the database. Note: If medical appointments or records link to this staff member, database foreign key constraints may reject the hard delete.
                    </p>
                  </>
                )}
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setStaffToDelete(null);
                  }}
                  disabled={isProcessingDelete}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isProcessingDelete}
                  className={`flex-1 px-4 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                    deleteMode === 'hard'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-[#E07856] hover:bg-[#c96749]'
                  }`}
                >
                  {isProcessingDelete && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isProcessingDelete
                    ? 'Processing...'
                    : deleteMode === 'hard'
                    ? 'Delete Permanently'
                    : 'Deactivate Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
