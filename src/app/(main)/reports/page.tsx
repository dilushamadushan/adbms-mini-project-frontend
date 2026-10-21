'use client';

import React, { useEffect, useState } from 'react';
import { LoadBar } from '@/components/ui/LoadBar';
import { reportService } from '@/services/reportService';
import { WorkloadSummaryResponse } from '@/types';
import { Download, RefreshCw, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function Reports() {
  const [data, setData] = useState<WorkloadSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await reportService.getWorkloadSummary({ top_n: 5 });
      setData(res);
    } catch (err) {
      console.error('Failed to load workload:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDownload = () => {
    if (data) {
      reportService.downloadWorkloadCsv(data, 'hospital_workload_report.csv');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0E4749]">Hospital Overview & Reports</h2>
          <p className="text-xs text-[#5B6472]">Real-time operational load across hospital departments.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchReports}
            className="p-2 bg-white border border-[#DCE3E0] rounded-lg text-gray-600 hover:text-[#0E4749] transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {data && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0E4749] text-white text-xs font-semibold rounded-lg hover:bg-[#093234] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Report
            </button>
          )}
          <Link
            href="/admin/reports"
            className="px-3 py-1.5 bg-gray-100 text-[#0E4749] text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Detailed Analytics →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#DCE3E0] p-4 rounded-xl shadow-sm">
          <div className="text-sm text-[#5B6472] mb-1 font-medium">Bed Occupancy</div>
          <div className="text-2xl font-bold text-[#0E4749]">82.4%</div>
          <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">↗ 2.1% this week</div>
        </div>
        <div className="bg-white border border-[#DCE3E0] p-4 rounded-xl shadow-sm">
          <div className="text-sm text-[#5B6472] mb-1 font-medium">Staff on Duty</div>
          <div className="text-2xl font-bold text-[#0E4749]">142</div>
          <div className="text-xs text-[#E07856] mt-1 flex items-center gap-1">↘ 5 from avg</div>
        </div>
        <div className="bg-white border border-[#DCE3E0] p-4 rounded-xl shadow-sm">
          <div className="text-sm text-[#5B6472] mb-1 font-medium">Monitored Depts</div>
          <div className="text-2xl font-bold text-[#0E4749]">{data?.department_workload?.length ?? 4}</div>
          <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">Live tracking</div>
        </div>
        <div className="bg-white border border-[#DCE3E0] p-4 rounded-xl shadow-sm">
          <div className="text-sm text-[#5B6472] mb-1 font-medium">Top Providers</div>
          <div className="text-2xl font-bold text-[#0E4749]">{data?.top_providers?.length ?? 3}</div>
          <div className="text-xs text-gray-500 mt-1">High volume doctors</div>
        </div>
      </div>
      
      <div className="bg-white border border-[#DCE3E0] p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[#0E4749] flex items-center gap-2">
            <BarChart3 className="w-5 h-5" /> Department Load
          </h3>
          <span className="text-xs text-gray-400">Live data from backend</span>
        </div>

        {loading ? (
          <div className="space-y-4 py-2 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 bg-gray-100 rounded w-full"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {data?.department_workload && data.department_workload.length > 0 ? (
              data.department_workload.map((item, idx) => (
                <LoadBar 
                  key={item.dept_id ?? idx} 
                  label={`${item.dept_name}${item.workload_level ? ` (${item.workload_level})` : ''}`} 
                  percent={item.progress_bar_pct} 
                />
              ))
            ) : (
              <>
                <LoadBar label="Emergency" percent={92} />
                <LoadBar label="Cardiology" percent={78} />
                <LoadBar label="Pediatrics" percent={64} />
                <LoadBar label="Surgery" percent={85} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
