"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Network, Plus, Users, X, Edit3, Trash2, FolderTree, 
  ChevronRight, ChevronDown, RefreshCw, AlertCircle, 
  CheckCircle2, CornerDownRight, Layers, Search, LayoutGrid, List
} from 'lucide-react';
import { departmentService } from '@/services/departmentService';
import { 
  Department, 
  DepartmentCatalogNode, 
  CreateDepartmentPayload, 
  UpdateDepartmentPayload 
} from '@/types';

export default function AdminDepartments() {
  const [catalog, setCatalog] = useState<DepartmentCatalogNode[]>([]);
  const [flatDepartments, setFlatDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'tree' | 'table'>('tree');
  const [searchQuery, setSearchQuery] = useState('');

  const [collapsedNodes, setCollapsedNodes] = useState<Record<number, boolean>>({});

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [parentPresetId, setParentPresetId] = useState<number | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [deptName, setDeptName] = useState('');
  const [parentDeptId, setParentDeptId] = useState<string>('');

  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [catalogData, flatData] = await Promise.all([
        departmentService.getCatalog(),
        departmentService.getAll(),
      ]);
      setCatalog(catalogData);
      setFlatDepartments(flatData);
    } catch (err: unknown) {
      let msg = 'Failed to load department hierarchy from server.';
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
    loadData();
  }, [loadData]);

  const toggleCollapse = (deptId: number) => {
    setCollapsedNodes(prev => ({
      ...prev,
      [deptId]: !prev[deptId],
    }));
  };

  const openCreateModal = (parentDeptIdNum: number | null = null) => {
    setEditingDept(null);
    setDeptName('');
    setParentPresetId(parentDeptIdNum);
    setParentDeptId(parentDeptIdNum ? String(parentDeptIdNum) : '');
    setModalError(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setDeptName(dept.dept_name);
    setParentPresetId(null);
    setParentDeptId(dept.parent_dept_id ? String(dept.parent_dept_id) : '');
    setModalError(null);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setFormSubmitting(true);

    const targetParent = parentDeptId ? Number(parentDeptId) : null;

    try {
      if (editingDept) {
        if (targetParent === editingDept.dept_id) {
          throw new Error('A department cannot be set as its own parent.');
        }

        const payload: UpdateDepartmentPayload = {
          dept_name: deptName.trim(),
          parent_dept_id: targetParent,
        };
        await departmentService.update(editingDept.dept_id, payload);
        setSuccessBanner(`Department "${deptName}" updated successfully.`);
      } else {
        const payload: CreateDepartmentPayload = {
          dept_name: deptName.trim(),
          parent_dept_id: targetParent,
        };
        await departmentService.create(payload);
        setSuccessBanner(`Department "${deptName}" created successfully.`);
      }

      setIsFormModalOpen(false);
      loadData();
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (err: unknown) {
      let msg = 'Failed to save department.';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string; message?: string } } };
        if (axiosErr.response?.data?.detail) msg = axiosErr.response.data.detail;
        else if (axiosErr.response?.data?.message) msg = axiosErr.response.data.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setModalError(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deptToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await departmentService.delete(deptToDelete.dept_id);
      setSuccessBanner(`Department "${deptToDelete.dept_name}" deleted.`);
      setDeptToDelete(null);
      loadData();
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (err: unknown) {
      let msg = 'Cannot delete department.';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string; message?: string } } };
        if (axiosErr.response?.data?.detail) {
          msg = axiosErr.response.data.detail;
        } else if (axiosErr.response?.data?.message) {
          msg = axiosErr.response.data.message;
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setDeleteError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const deptMap = React.useMemo(() => {
    const map = new Map<number, Department>();
    flatDepartments.forEach(d => map.set(d.dept_id, d));
    return map;
  }, [flatDepartments]);

  const filteredDepartments = flatDepartments.filter(d =>
    d.dept_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const rootCount = flatDepartments.filter(d => !d.parent_dept_id).length;
  const subCount = flatDepartments.filter(d => !!d.parent_dept_id).length;

  const renderCatalogNode = (node: DepartmentCatalogNode, depth = 0) => {
    const hasChildren = node.sub_departments && node.sub_departments.length > 0;
    const isCollapsed = !!collapsedNodes[node.dept_id];
    const isRoot = depth === 0;

    return (
      <div key={node.dept_id} className={`space-y-3 ${depth > 0 ? 'mt-3 pl-6 border-l-2 border-teal-700/20 relative' : ''}`}>
        {depth > 0 && (
          <div className="absolute w-4 h-0.5 bg-teal-700/20 -left-[2px] top-6" />
        )}

        <div 
          className={`border rounded-xl transition-all ${
            isRoot 
              ? 'border-[#0E4749]/30 bg-white shadow-sm hover:border-[#0E4749]' 
              : 'border-[#DCE3E0] bg-gray-50/70 hover:bg-white hover:border-[#0E4749]'
          } p-4`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleCollapse(node.dept_id)}
                  className="p-1 rounded hover:bg-gray-100 text-[#0E4749] transition-colors"
                  title={isCollapsed ? 'Expand sub-departments' : 'Collapse sub-departments'}
                >
                  {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              ) : (
                <div className="w-5 h-5 flex items-center justify-center text-gray-300">
                  <CornerDownRight className="w-4 h-4" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-base">{node.dept_name}</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                    ID #{node.dept_id}
                  </span>
                  {isRoot ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-[#0E4749] px-2 py-0.5 rounded-full">
                      Main Division
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                      Sub-Dept
                    </span>
                  )}
                </div>

                {node.parent_dept_id && deptMap.has(node.parent_dept_id) && (
                  <p className="text-xs text-[#5B6472] mt-0.5">
                    Parent: <span className="font-medium text-gray-800">{deptMap.get(node.parent_dept_id)?.dept_name}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={() => openCreateModal(node.dept_id)}
                className="text-xs font-semibold px-2.5 py-1.5 bg-teal-50 text-[#0E4749] border border-teal-200 hover:bg-[#0E4749] hover:text-white rounded-lg flex items-center gap-1 transition-all"
                title="Add Sub-Department under this department"
              >
                <Plus className="w-3.5 h-3.5" /> Sub-Dept
              </button>

              <button
                type="button"
                onClick={() => openEditModal(node)}
                className="p-1.5 text-gray-500 hover:text-[#0E4749] hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit Department"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => { setDeleteError(null); setDeptToDelete(node); }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Department"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {hasChildren && !isCollapsed && (
          <div className="space-y-3">
            {node.sub_departments!.map((child) => renderCatalogNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-[#0E4749] text-2xl tracking-tight">Hospital Departments</h3>
          <p className="text-sm text-[#5B6472] mt-0.5">
            Manage clinical divisions, sub-units, and organizational hierarchies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white border border-[#DCE3E0] rounded-lg p-0.5 flex shadow-xs">
            <button
              onClick={() => setViewMode('tree')}
              className={`p-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'tree' ? 'bg-[#0E4749] text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Hierarchy View"
            >
              <FolderTree className="w-4 h-4" /> Tree
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'table' ? 'bg-[#0E4749] text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" /> Flat List
            </button>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2.5 text-gray-600 bg-white border border-[#DCE3E0] hover:bg-gray-50 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            title="Refresh Catalog"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => openCreateModal(null)}
            className="bg-[#E07856] hover:bg-[#c96749] transition-all text-white px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Department
          </button>
        </div>
      </div>

      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span className="text-sm font-medium">{successBanner}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <span className="text-sm">{error}</span>
          </div>
          <button onClick={loadData} className="text-xs font-bold underline hover:text-red-900">
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-50 text-[#0E4749] rounded-xl flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{flatDepartments.length}</div>
            <div className="text-xs text-[#5B6472] uppercase font-semibold">Total Departments</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center font-bold">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{rootCount}</div>
            <div className="text-xs text-[#5B6472] uppercase font-semibold">Main Divisions (Root)</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center font-bold">
            <CornerDownRight className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{subCount}</div>
            <div className="text-xs text-[#5B6472] uppercase font-semibold">Nested Sub-Units</div>
          </div>
        </div>
      </div>

      {viewMode === 'tree' ? (
        <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#DCE3E0] pb-4">
            <div className="flex items-center gap-2 text-sm text-[#0E4749] font-bold">
              <Network className="w-4 h-4" />
              <span>Hierarchical Department Catalog</span>
            </div>
            <span className="text-xs text-gray-400">Click &ldquo;+ Sub-Dept&rdquo; on any department to nest under it</span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-gray-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0E4749]" />
              <p className="text-sm">Loading department catalog...</p>
            </div>
          ) : catalog.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Layers className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="font-semibold text-gray-700">No departments found in catalog</p>
              <button
                onClick={() => openCreateModal(null)}
                className="mt-3 text-sm font-bold text-[#E07856] hover:underline"
              >
                + Create the first department
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {catalog.map(rootNode => renderCatalogNode(rootNode, 0))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#DCE3E0] bg-gray-50/70 flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#DCE3E0] rounded-lg text-sm focus:outline-none focus:border-[#0E4749]"
              />
            </div>
            <div className="text-xs text-gray-500 font-medium">
              Showing {filteredDepartments.length} of {flatDepartments.length} departments
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0E4749] text-white text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-semibold">ID</th>
                  <th className="p-4 font-semibold">Department Name</th>
                  <th className="p-4 font-semibold">Parent Department</th>
                  <th className="p-4 font-semibold">Type</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE3E0]">
                {filteredDepartments.map(dept => {
                  const parent = dept.parent_dept_id ? deptMap.get(dept.parent_dept_id) : null;
                  return (
                    <tr key={dept.dept_id} className="hover:bg-teal-50/30 transition-colors">
                      <td className="p-4 font-mono font-bold text-gray-700">#{dept.dept_id}</td>
                      <td className="p-4 font-bold text-gray-900">{dept.dept_name}</td>
                      <td className="p-4 text-[#5B6472]">
                        {parent ? `${parent.dept_name} (#${parent.dept_id})` : <span className="text-gray-400">— None (Root)</span>}
                      </td>
                      <td className="p-4">
                        {dept.parent_dept_id ? (
                          <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                            Sub-Department
                          </span>
                        ) : (
                          <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                            Main Division
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openCreateModal(dept.dept_id)}
                            className="p-1.5 text-[#0E4749] hover:bg-teal-50 rounded-lg transition-colors"
                            title="Add Sub-Department"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(dept)}
                            className="p-1.5 text-gray-500 hover:text-[#0E4749] hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setDeleteError(null); setDeptToDelete(dept); }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isFormModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#0E4749] text-white p-5 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-lg">
                  {editingDept ? 'Edit Department' : parentPresetId ? 'Add Sub-Department' : 'Create New Department'}
                </h4>
                <p className="text-teal-200 text-xs mt-0.5">
                  {parentPresetId 
                    ? `Nesting under: ${deptMap.get(parentPresetId)?.dept_name || '#' + parentPresetId}`
                    : 'Manage hospital organizational structure'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="text-teal-200 hover:text-white p-1 rounded-lg transition-colors"
                disabled={formSubmitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="p-6 space-y-4" onSubmit={handleFormSubmit}>
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cardiology, Neuro Surgery"
                  value={deptName}
                  onChange={e => setDeptName(e.target.value)}
                  className="w-full p-2.5 border border-[#DCE3E0] rounded-xl focus:outline-none focus:border-[#0E4749] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">
                  Parent Department (Optional)
                </label>
                <select
                  value={parentDeptId}
                  onChange={e => setParentDeptId(e.target.value)}
                  className="w-full p-2.5 border border-[#DCE3E0] rounded-xl bg-white focus:outline-none focus:border-[#0E4749] text-sm text-gray-900"
                >
                  <option value="">-- No Parent (Root Division) --</option>
                  {flatDepartments
                    .filter(d => !editingDept || d.dept_id !== editingDept.dept_id)
                    .map(d => (
                      <option key={d.dept_id} value={d.dept_id}>
                        {d.dept_name} (ID: #{d.dept_id})
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1 italic">
                  Leave empty if this is a top-level hospital department.
                </p>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#DCE3E0]">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  disabled={formSubmitting}
                  className="px-4 py-2 text-sm font-bold text-[#5B6472] hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 text-sm font-bold bg-[#E07856] hover:bg-[#c96749] text-white rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {formSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {formSubmitting ? 'Saving...' : editingDept ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deptToDelete && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-red-600 text-white p-5 flex justify-between items-center">
              <h4 className="font-bold text-lg">Confirm Delete Department</h4>
              <button
                type="button"
                onClick={() => setDeptToDelete(null)}
                className="text-red-200 hover:text-white"
                disabled={isDeleting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {deleteError ? (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-bold">Deletion Blocked</p>
                    <p className="text-xs mt-0.5">{deleteError}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700">
                  Are you sure you want to delete <span className="font-bold text-gray-900">&ldquo;{deptToDelete.dept_name}&rdquo;</span> (ID: #{deptToDelete.dept_id})?
                </p>
              )}

              <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                Notice: The database procedure blocks deletion if sub-departments exist or if active staff members are assigned to this department.
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setDeptToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-5 py-2 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isDeleting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {isDeleting ? 'Deleting...' : 'Delete Department'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
