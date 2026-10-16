"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Plus, X, Loader2, CheckCircle, AlertCircle,
  Search, RefreshCw, Copy, Check, Shield, Stethoscope, Briefcase
} from 'lucide-react';
import { staffService } from '@/services/staffService';
import { departmentService } from '@/services/departmentService';
import { StaffMember, CreateStaffPayload, Department } from '@/types';



export default function AdminStaff() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdStaff, setCreatedStaff] = useState<StaffMember | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('doctor');
  const [deptId, setDeptId] = useState<string>('1');
  const [specialty, setSpecialty] = useState('');

  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);



  // Fetch staff list & departments from backend
  const loadStaff = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [data, depts] = await Promise.all([
        staffService.getStaff(),
        departmentService.getAll().catch(() => []),
      ]);
      setStaffList(data);
      setDepartments(depts);
    } catch (err: unknown) {
      let msg = 'Failed to load staff records from server.';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string; message?: string } } };
        if (axiosErr.response?.data?.detail) msg = axiosErr.response.data.detail;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  // Handle Create Staff form submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const payload: CreateStaffPayload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        role: role.toLowerCase(),
        dept_id: deptId ? Number(deptId) : null,
        specialty: specialty.trim() || null,
      };

      const result = await staffService.createStaff(payload);
      setCreatedStaff(result);
      
      // Refresh list to include new staff member
      loadStaff();
    } catch (err: unknown) {
      let msg = 'Failed to create staff member. Please check details.';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string; message?: string } } };
        if (axiosErr.response?.data?.detail) msg = axiosErr.response.data.detail;
        else if (axiosErr.response?.data?.message) msg = axiosErr.response.data.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async (userId: number, isActive: boolean) => {
    setUpdatingUserId(userId);
    try {
      await staffService.updateStatus(userId, !isActive);
      setStaffList((prev) =>
        prev.map((s) => (s.user_id === userId ? { ...s, is_active: !isActive } : s))
      );
    } catch {
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Reset modal state
  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setRole('doctor');
    setDeptId('1');
    setSpecialty('');
    setFormError(null);
    setCreatedStaff(null);
    setIsModalOpen(false);
  };

  // Copy helper
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Filtered staff list
  const filteredStaff = staffList.filter((staff) => {
    const fullName = `${staff.first_name || ''} ${staff.last_name || ''}`.toLowerCase();
    const username = (staff.username || '').toLowerCase();
    const mail = (staff.email || '').toLowerCase();
    const spec = (staff.specialty || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      fullName.includes(query) ||
      username.includes(query) ||
      mail.includes(query) ||
      spec.includes(query);

    const matchesRole =
      roleFilter === 'ALL' || staff.role?.toUpperCase() === roleFilter.toUpperCase();

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (roleName: string) => {
    const r = (roleName || '').toUpperCase();
    switch (r) {
      case 'DOCTOR':
        return <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1"><Stethoscope className="w-3 h-3" /> DOCTOR</span>;
      case 'NURSE':
        return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1"><Briefcase className="w-3 h-3" /> NURSE</span>;
      case 'ADMIN':
        return <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1"><Shield className="w-3 h-3" /> ADMIN</span>;
      case 'RECEPTIONIST':
        return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1"><Users className="w-3 h-3" /> RECEPTIONIST</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{r}</span>;
    }
  };

  const deptMap = React.useMemo(() => {
    const map = new Map<number, string>();
    departments.forEach((d) => map.set(d.dept_id, d.dept_name));
    return map;
  }, [departments]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-[#0E4749] text-2xl tracking-tight">Staff Management</h3>
          <p className="text-sm text-[#5B6472] mt-0.5">Manage hospital personnel accounts, roles, and system access.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadStaff}
            disabled={isLoading}
            className="p-2.5 text-gray-600 bg-white border border-[#DCE3E0] hover:bg-gray-50 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => { setCreatedStaff(null); setFormError(null); setIsModalOpen(true); }}
            className="bg-[#0E4749] text-white px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm hover:bg-[#0a3335] transition-all hover:shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Staff Member
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <span className="text-sm">{error}</span>
          </div>
          <button onClick={loadStaff} className="text-xs font-bold underline hover:text-red-900">
            Retry
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-[#DCE3E0] bg-gray-50/70 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, username, email, specialty..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749] text-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-[#5B6472] uppercase tracking-wider">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white border border-[#DCE3E0] text-sm rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:border-[#0E4749]"
            >
              <option value="ALL">All Roles ({staffList.length})</option>
              <option value="DOCTOR">Doctors</option>
              <option value="NURSE">Nurses</option>
              <option value="RECEPTIONIST">Receptionists</option>
              <option value="ADMIN">Admins</option>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE3E0]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0E4749]" />
                    <p className="text-sm">Loading staff members from server...</p>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="font-semibold text-gray-700">No staff members found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {searchQuery ? 'Try adjusting your search criteria.' : 'Click "Add Staff Member" above to create one.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => {
                  const rawUserId = Number(staff.user_id ?? (staff as any).id);
                  const isActive = Boolean(staff.is_active);
                  const isUpdating = updatingUserId === rawUserId;
                  const deptName = staff.dept_id ? (deptMap.get(staff.dept_id) ?? `Dept #${staff.dept_id}`) : '—';

                  return (
                    <tr
                      key={rawUserId || staff.staff_id}
                      className="hover:bg-teal-50/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-bold text-gray-900">
                          {staff.first_name} {staff.last_name}
                        </div>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">
                          @{staff.username} • ID: #{staff.staff_id || rawUserId}
                        </div>
                      </td>
                      <td className="p-4">
                        {getRoleBadge(staff.role)}
                      </td>
                      <td className="p-4 text-[#5B6472]">
                        {staff.email}
                      </td>
                      <td className="p-4 text-gray-700 font-medium">
                        {deptName}
                      </td>
                      <td className="p-4 text-[#5B6472]">
                        {staff.specialty || '—'}
                      </td>
                      <td className="p-4 text-center">
                        {isUpdating ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#0E4749] mx-auto" />
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStatusToggle(rawUserId, isActive)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                            }`}
                            title={isActive ? 'Click to Deactivate' : 'Click to Activate'}
                          >
                            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {isActive ? 'Active' : 'Inactive'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-[#0E4749] text-white p-5 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-lg">Add New Staff Member</h4>
                <p className="text-teal-200 text-xs mt-0.5">Generates credentials and stores in database</p>
              </div>
              <button
                onClick={resetForm}
                className="text-teal-200 hover:text-white p-1 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Generated Credentials Success View */}
            {createdStaff ? (
              <div className="p-6 text-center space-y-5">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle className="w-8 h-8" />
                </div>

                <div>
                  <h4 className="text-xl font-bold text-gray-900">Staff Account Created!</h4>
                  <p className="text-sm text-[#5B6472] mt-1">
                    The backend has generated credentials for this employee. Please save or securely provide them.
                  </p>
                </div>

                {/* Credentials Card */}
                <div className="bg-gray-50 border border-[#DCE3E0] rounded-xl p-4 text-left space-y-3 font-sans">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#5B6472] font-medium">Full Name:</span>
                    <span className="font-bold text-gray-900">{createdStaff.first_name} {createdStaff.last_name}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#5B6472] font-medium">Username:</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-[#0E4749]">
                      <span>{createdStaff.username}</span>
                      <button
                        onClick={() => handleCopy(createdStaff.username, 'username')}
                        className="p-1 hover:bg-gray-200 rounded text-gray-500"
                        title="Copy username"
                      >
                        {copiedField === 'username' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#5B6472] font-medium">Role:</span>
                    <span className="font-bold uppercase text-[#0E4749]">{createdStaff.role}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#5B6472] font-medium">Staff ID:</span>
                    <span className="font-mono font-bold text-gray-800">#{createdStaff.staff_id || createdStaff.user_id}</span>
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
                          className="p-1 hover:bg-gray-200 rounded text-gray-500"
                          title="Copy password"
                        >
                          {copiedField === 'password' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
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
                          `MediCore HMS Login:\nUsername: ${createdStaff.username}\nPassword: ${createdStaff.raw_password}\nRole: ${createdStaff.role}`,
                          'all'
                        )
                      }
                      className="w-1/2 border border-[#0E4749] text-[#0E4749] hover:bg-teal-50 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {copiedField === 'all' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      {copiedField === 'all' ? 'Copied Details' : 'Copy Details'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-[#0E4749] hover:bg-[#0a3335] text-white py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Input Form */
              <form className="p-6 space-y-4" onSubmit={handleCreateSubmit}>
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
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
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
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
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full p-2.5 border border-[#DCE3E0] rounded-xl bg-white focus:outline-none focus:border-[#0E4749] text-sm"
                    >
                      <option value="doctor">Doctor</option>
                      <option value="nurse">Nurse</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">
                      Department (Optional)
                    </label>
                    <select
                      value={deptId}
                      onChange={(e) => setDeptId(e.target.value)}
                      className="w-full p-2.5 border border-[#DCE3E0] rounded-xl bg-white focus:outline-none focus:border-[#0E4749] text-sm"
                    >
                      <option value="">None / General</option>
                      {departments.map((d) => (
                        <option key={d.dept_id} value={d.dept_id}>
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
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="e.g. Cardiologist, Pediatrics, ICU"
                    className="w-full p-2.5 border border-[#DCE3E0] rounded-xl focus:outline-none focus:border-[#0E4749] text-sm"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-[#DCE3E0]">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-bold text-[#5B6472] hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 text-sm font-bold bg-[#E07856] hover:bg-[#c96749] text-white rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSubmitting ? 'Registering...' : 'Register Staff'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
