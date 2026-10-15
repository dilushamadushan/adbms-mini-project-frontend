'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  X,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  AlertCircle,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { auditService } from '@/services/auditService';
import { AuditLogItem, AuditLogFilters } from '@/types';

export default function AdminAudit() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Filters state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [actorFilter, setActorFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Modal state
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: AuditLogFilters = {
        page,
        limit,
        actor: actorFilter.trim() || undefined,
        action: actionFilter.trim() || undefined,
        risk: riskFilter !== 'ALL' ? riskFilter : undefined,
        date: dateFilter || undefined,
      };

      const res = await auditService.getAuditLogs(filters);
      setLogs(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || Math.ceil((res.total || 0) / limit) || 1);
    } catch (err: unknown) {
      console.error('Failed to load audit logs:', err);
      setError('Failed to fetch audit logs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, actorFilter, actionFilter, riskFilter, dateFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const filters: AuditLogFilters = {
        actor: actorFilter.trim() || undefined,
        action: actionFilter.trim() || undefined,
        risk: riskFilter !== 'ALL' ? riskFilter : undefined,
        date: dateFilter || undefined,
      };
      await auditService.exportAuditLogsCsv(filters);
    } catch (err) {
      console.error('Failed to export CSV:', err);
      alert('Failed to export audit logs CSV');
    } finally {
      setExporting(false);
    }
  };

  const handleCopyJson = () => {
    if (!selectedLog) return;
    const jsonStr =
      typeof selectedLog.details === 'string'
        ? selectedLog.details
        : JSON.stringify(selectedLog.details, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearFilters = () => {
    setActorFilter('');
    setActionFilter('');
    setRiskFilter('ALL');
    setDateFilter('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    actorFilter || actionFilter || riskFilter !== 'ALL' || dateFilter
  );

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0E4749]">System Audit Logs</h1>
            <span className="bg-[#0E4749]/10 text-[#0E4749] text-xs font-bold px-2.5 py-0.5 rounded-full">
              {total} Total
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Track user activities, clinical modifications, and security events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchLogs()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#0E4749]' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExportCsv}
            disabled={exporting || loading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0E4749] text-white rounded-lg text-sm font-semibold hover:bg-[#0E4749]/90 transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className={`w-4 h-4 ${exporting ? 'animate-bounce' : ''}`} />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Filter Audit Logs
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-[#E07856] hover:underline font-bold text-xs"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Actor search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Actor / User..."
              value={actorFilter}
              onChange={(e) => {
                setActorFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E4749]/20 focus:border-[#0E4749]"
            />
          </div>

          {/* Action search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by Action..."
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E4749]/20 focus:border-[#0E4749]"
            />
          </div>

          {/* Risk Level */}
          <div>
            <select
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E4749]/20 focus:border-[#0E4749] bg-white text-gray-700"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
            </select>
          </div>

          {/* Date Picker */}
          <div className="relative">
            <CalendarIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E4749]/20 focus:border-[#0E4749] bg-white text-gray-700"
            />
          </div>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchLogs()}
            className="underline font-bold hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Table Container ── */}
      <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0E4749] text-white text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Action</th>
                <th className="p-4">Resource</th>
                <th className="p-4">Risk</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE3E0]">
              {loading ? (
                [...Array(limit)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-28" /></td>
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-36" /></td>
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-14" /></td>
                    <td className="p-4 text-right"><div className="h-4 bg-gray-200 rounded w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400">
                    <ShieldAlert className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    No audit records match your criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const risk = (log.risk || 'LOW').toUpperCase();
                  const riskBadge =
                    risk === 'HIGH'
                      ? 'bg-red-100 text-red-800 border-red-200'
                      : risk === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-200';

                  return (
                    <tr key={log.log_id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-mono text-xs text-gray-600 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="p-4 font-semibold text-[#0E4749] whitespace-nowrap">
                        {log.actor || 'System'}
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-medium">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs text-gray-600">
                        {log.resource}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${riskBadge}`}
                        >
                          {risk}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0E4749] hover:underline bg-[#0E4749]/5 hover:bg-[#0E4749]/10 px-2.5 py-1 rounded transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View JSON
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ── */}
        <div className="p-4 border-t border-[#DCE3E0] bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="border border-gray-300 rounded px-2 py-1 bg-white text-gray-700"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="ml-2">
              Showing {logs.length > 0 ? (page - 1) * limit + 1 : 0} -{' '}
              {Math.min(page * limit, total)} of {total} entries
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1 || loading}
              className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-40 transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-gray-800">
              Page {page} of {Math.max(totalPages, 1)}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages || loading}
              className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-40 transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── JSON Detail Modal ── */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-gray-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[#0E4749]">
                    Log #{selectedLog.log_id} — {selectedLog.action}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      selectedLog.risk === 'HIGH'
                        ? 'bg-red-100 text-red-700'
                        : selectedLog.risk === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {selectedLog.risk}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Actor: <strong className="text-gray-700">{selectedLog.actor}</strong> · Time: {selectedLog.timestamp}
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-200/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div>
                  <span className="text-gray-400">Target Resource:</span>
                  <p className="font-mono font-semibold text-gray-800">{selectedLog.resource}</p>
                </div>
                <div>
                  <span className="text-gray-400">IP Address:</span>
                  <p className="font-mono font-semibold text-gray-800">{selectedLog.ip_address || 'Internal / N/A'}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-700">Raw Details (JSON)</span>
                  <button
                    onClick={handleCopyJson}
                    className="flex items-center gap-1 text-xs text-[#0E4749] hover:underline font-semibold"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy JSON
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-slate-900 text-emerald-400 p-4 rounded-lg font-mono text-xs overflow-x-auto border border-slate-800">
                  {typeof selectedLog.details === 'string'
                    ? selectedLog.details
                    : JSON.stringify(selectedLog.details, null, 2) || '{}'}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-right">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

