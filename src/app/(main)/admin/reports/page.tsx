'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  RefreshCw, 
  Calendar, 
  AlertCircle, 
  Building2, 
  Users, 
  Activity, 
  Printer,
  ChevronDown
} from 'lucide-react';
import { LoadBar } from '@/components/ui/LoadBar';
import { reportService } from '@/services/reportService';
import { WorkloadSummaryResponse } from '@/types';

export default function AdminReports() {
  const [data, setData] = useState<WorkloadSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [topN, setTopN] = useState<number>(5);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportService.getWorkloadSummary({
        top_n: topN,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      setData(result);
    } catch (err: unknown) {
      console.error('Failed to load workload reports:', err);
      const message = err instanceof Error ? err.message : 'Unable to connect to backend reporting service.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [topN, startDate, endDate]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDownloadCsv = () => {
    if (!data) return;
    setIsExporting(true);
    try {
      const filename = `workload_report_${new Date().toISOString().split('T')[0]}.csv`;
      reportService.downloadWorkloadCsv(data, filename);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper for badge colors based on workload level
  const getWorkloadLevelBadge = (level?: string) => {
    const norm = (level || '').toLowerCase();
    if (norm === 'critical') {
      return {
        badge: 'bg-red-50 text-red-700 border-red-200',
        bar: 'bg-red-600',
      };
    }
    if (norm === 'high') {
      return {
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        bar: 'bg-amber-500',
      };
    }
    if (norm === 'moderate') {
      return {
        badge: 'bg-sky-50 text-sky-700 border-sky-200',
        bar: 'bg-sky-600',
      };
    }
    return {
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      bar: 'bg-emerald-600',
    };
  };

  // Calculate summary metrics
  const totalAppointments = data?.department_workload?.reduce(
    (acc, curr) => acc + (curr.total_appointments || 0), 
    0
  ) ?? 0;

  const topDepartment = data?.department_workload && data.department_workload.length > 0
    ? [...data.department_workload].sort((a, b) => (b.progress_bar_pct || 0) - (a.progress_bar_pct || 0))[0]
    : null;

  const totalPtsSeenByTopProviders = data?.top_providers?.reduce(
    (acc, curr) => acc + (curr.pts_seen || 0),
    0
  ) ?? 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DCE3E0] pb-5">
        <div>
          <h2 className="text-2xl font-bold text-[#0E4749]">Hospital Reports & Analytics</h2>
          <p className="text-sm text-[#5B6472] mt-0.5">
            Real-time department workload distribution and provider consult performance.
          </p>
        </div>

        {/* Filter and Download Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Top N Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-[#DCE3E0] rounded-lg px-2.5 py-1.5 text-xs text-gray-700">
            <span className="text-gray-500 font-medium">Top:</span>
            <select
              value={topN}
              onChange={(e) => setTopN(Number(e.target.value))}
              className="bg-transparent font-semibold outline-none cursor-pointer"
            >
              <option value={3}>3 Providers</option>
              <option value={5}>5 Providers</option>
              <option value={10}>10 Providers</option>
            </select>
          </div>

          {/* Date Range Inputs */}
          <div className="hidden lg:flex items-center gap-2 bg-white border border-[#DCE3E0] rounded-lg px-2.5 py-1.5 text-xs text-gray-600">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="outline-none bg-transparent text-xs"
              placeholder="Start"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="outline-none bg-transparent text-xs"
              placeholder="End"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchReports()}
            disabled={loading}
            className="p-2 bg-white border border-[#DCE3E0] rounded-lg text-gray-600 hover:text-[#0E4749] hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#0E4749]' : ''}`} />
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="p-2 bg-white border border-[#DCE3E0] rounded-lg text-gray-600 hover:text-[#0E4749] hover:bg-gray-50 transition-colors"
            title="Print Report"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Download CSV Button */}
          <button
            onClick={handleDownloadCsv}
            disabled={!data || loading || isExporting}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#0E4749] text-white text-xs font-semibold rounded-lg hover:bg-[#093234] transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {isExporting ? 'Exporting...' : 'Download Report'}
          </button>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Failed to fetch live report data</h4>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => fetchReports()}
            className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Quick Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#DCE3E0] p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-sm text-[#5B6472] mb-1 font-medium">
            <span>Total Appointments</span>
            <Activity className="w-4 h-4 text-[#0E4749]" />
          </div>
          <div className="text-2xl font-bold text-[#0E4749]">
            {loading ? '...' : totalAppointments.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">Across all departments</div>
        </div>

        <div className="bg-white border border-[#DCE3E0] p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-sm text-[#5B6472] mb-1 font-medium">
            <span>Peak Department</span>
            <Building2 className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-xl font-bold text-[#0E4749] truncate">
            {loading ? '...' : topDepartment?.dept_name || 'N/A'}
          </div>
          <div className="text-xs text-red-600 mt-1 font-medium">
            {topDepartment ? `${topDepartment.progress_bar_pct}% capacity` : 'No data'}
          </div>
        </div>

        <div className="bg-white border border-[#DCE3E0] p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-sm text-[#5B6472] mb-1 font-medium">
            <span>Departments Monitored</span>
            <BarChart3 className="w-4 h-4 text-[#0E4749]" />
          </div>
          <div className="text-2xl font-bold text-[#0E4749]">
            {loading ? '...' : data?.department_workload?.length ?? 0}
          </div>
          <div className="text-xs text-emerald-600 mt-1 font-medium">Live tracking active</div>
        </div>

        <div className="bg-white border border-[#DCE3E0] p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-sm text-[#5B6472] mb-1 font-medium">
            <span>Top Provider Pts Seen</span>
            <Users className="w-4 h-4 text-[#0E4749]" />
          </div>
          <div className="text-2xl font-bold text-[#0E4749]">
            {loading ? '...' : totalPtsSeenByTopProviders}
          </div>
          <div className="text-xs text-gray-500 mt-1">Sum of top {topN} doctors</div>
        </div>
      </div>

      {/* Main 2 Cards: Department Workload & Top Provider Workload */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* CARD 1: Department Workload */}
        <div className="bg-white border border-[#DCE3E0] p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-[#0E4749] text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#0E4749]" /> 
                Department Workload
              </h4>
              <span className="text-xs text-gray-500 font-medium bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                {data?.department_workload?.length || 0} Units
              </span>
            </div>

            {loading ? (
              <div className="space-y-6 py-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-100 rounded-full w-full"></div>
                  </div>
                ))}
              </div>
            ) : !data?.department_workload || data.department_workload.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                No department workload records found.
              </div>
            ) : (
              <div className="space-y-6">
                {data.department_workload.map((dept, idx) => {
                  const style = getWorkloadLevelBadge(dept.workload_level);
                  const title = dept.workload_level 
                    ? `${dept.dept_name} (${dept.workload_level})`
                    : dept.dept_name;

                  return (
                    <div key={dept.dept_id ?? idx} className="space-y-1">
                      <div className="flex justify-between items-center text-sm mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">{dept.dept_name}</span>
                          {dept.workload_level && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${style.badge}`}>
                              {dept.workload_level}
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                          {dept.total_appointments != null && (
                            <span className="text-gray-500 font-normal">
                              {dept.total_appointments} appts
                            </span>
                          )}
                          <span>{dept.progress_bar_pct}%</span>
                        </div>
                      </div>

                      {/* Progress Bar with dynamically styled width */}
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-700 rounded-full ${style.bar}`}
                          style={{ width: `${Math.min(100, Math.max(0, dept.progress_bar_pct))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#DCE3E0] flex items-center justify-between text-xs text-gray-500">
            <span>Live status from /reports/workload-summary</span>
            <span className="font-medium text-[#0E4749]">Auto-refreshed</span>
          </div>
        </div>

        {/* CARD 2: Top Provider Workload */}
        <div className="bg-white border border-[#DCE3E0] p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-[#0E4749] text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#0E4749]" /> 
                Top Provider Workload
              </h4>
              <span className="text-xs text-gray-500 font-medium bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                Ranked 1 to {data?.top_providers?.length || 0}
              </span>
            </div>

            {loading ? (
              <div className="space-y-4 py-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded-lg w-full"></div>
                ))}
              </div>
            ) : !data?.top_providers || data.top_providers.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                No provider workload statistics recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-gray-500 border-b border-[#DCE3E0]">
                    <tr>
                      <th className="pb-3 font-semibold text-xs uppercase tracking-wider text-gray-400">#</th>
                      <th className="pb-3 font-semibold text-xs uppercase tracking-wider text-gray-500">Provider Name</th>
                      <th className="pb-3 font-semibold text-xs uppercase tracking-wider text-gray-500">Pts Seen</th>
                      <th className="pb-3 font-semibold text-xs uppercase tracking-wider text-gray-500 text-right">Avg Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.top_providers.map((provider, idx) => {
                      const rank = provider.workload_rank ?? idx + 1;
                      const rankBadge =
                        rank === 1
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : rank === 2
                          ? 'bg-slate-100 text-slate-800 border-slate-300'
                          : rank === 3
                          ? 'bg-orange-100 text-orange-800 border-orange-300'
                          : 'bg-gray-50 text-gray-600 border-gray-200';

                      return (
                        <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3.5 pr-2">
                            <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full border ${rankBadge}`}>
                              {rank}
                            </span>
                          </td>
                          <td className="py-3.5 font-bold text-gray-900">
                            {provider.provider_name}
                          </td>
                          <td className="py-3.5">
                            <span className="font-semibold text-gray-800">{provider.pts_seen}</span>
                            <span className="text-xs text-gray-400 ml-1">pts</span>
                          </td>
                          <td className="py-3.5 text-right font-medium text-[#5B6472]">
                            <span className="inline-block bg-gray-100 px-2 py-0.5 rounded text-xs">
                              {provider.avg_time}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#DCE3E0] flex items-center justify-between text-xs text-gray-500">
            <span>Sorted by workload rank & consultations</span>
            <button
              onClick={handleDownloadCsv}
              className="text-[#0E4749] font-semibold hover:underline flex items-center gap-1"
            >
              <Download className="w-3 h-3" /> Export data
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
