import apiClient from '@/lib/apiClient';
import { WorkloadSummaryResponse, WorkloadSummaryParams, KpiOverviewResponse } from '@/types';

export const reportService = {

  getKpiOverview: async (date?: string): Promise<KpiOverviewResponse> => {
    const response = await apiClient.get<KpiOverviewResponse>('/reports/kpi-overview', {
      params: date ? { date } : undefined,
    });
    return response.data;
  },


  getWorkloadSummary: async (params?: WorkloadSummaryParams): Promise<WorkloadSummaryResponse> => {
    const response = await apiClient.get<WorkloadSummaryResponse>('/reports/workload-summary', {
      params,
    });
    return response.data;
  },


  getDepartmentWorkload: async (): Promise<{ total_departments: number; departments: any[] }> => {
    const response = await apiClient.get('/reports/departments/workload');
    return response.data;
  },


  getProviderWorkload: async (limit = 5): Promise<{ total_providers_ranked: number; providers: any[] }> => {
    const response = await apiClient.get('/reports/providers/workload', {
      params: { limit },
    });
    return response.data;
  },


  downloadWorkloadCsv: (data: WorkloadSummaryResponse, filename = 'hospital_workload_report.csv') => {
    const lines: string[] = [];

    lines.push('=== HOSPITAL WORKLOAD REPORT ===');
    lines.push(`Generated At: ${new Date().toLocaleString()}`);
    lines.push('');
    lines.push('--- DEPARTMENT WORKLOAD ---');
    lines.push('Department ID,Department Name,Workload Level,Progress %,Appointments,Workload %');

    (data.department_workload || []).forEach((d) => {
      lines.push(
        [
          d.dept_id ?? '',
          `"${d.dept_name.replace(/"/g, '""')}"`,
          `"${(d.workload_level || 'Normal').replace(/"/g, '""')}"`,
          d.progress_bar_pct ?? 0,
          d.total_appointments ?? 0,
          d.workload_percentage != null ? `${d.workload_percentage}%` : '',
        ].join(',')
      );
    });

    lines.push('');
    lines.push('--- TOP PROVIDER WORKLOAD ---');
    lines.push('Workload Rank,Provider Name,Patients Seen,Avg Consult Time');

    (data.top_providers || []).forEach((p) => {
      lines.push(
        [
          p.workload_rank ?? '',
          `"${p.provider_name.replace(/"/g, '""')}"`,
          p.pts_seen ?? 0,
          `"${(p.avg_time || '').replace(/"/g, '""')}"`,
        ].join(',')
      );
    });

    const csvContent = lines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
