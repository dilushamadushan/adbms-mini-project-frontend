import apiClient from '@/lib/apiClient';
import { AuditLogItem, AuditLogFilters, AuditLogResponse } from '@/types';

export const auditService = {
  getRecentLogs: async (limit = 4): Promise<AuditLogItem[]> => {
    try {
      const response = await apiClient.get<AuditLogItem[] | AuditLogResponse>('/audit-logs/recent', {
        params: { limit },
      });
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data?.items ?? [];
    } catch {
      const fallback = await apiClient.get<AuditLogResponse | AuditLogItem[]>('/audit-logs', {
        params: { page: 1, limit },
      });
      if (Array.isArray(fallback.data)) {
        return fallback.data.slice(0, limit);
      }
      return fallback.data?.items ?? [];
    }
  },

  getAuditLogs: async (filters: AuditLogFilters = {}): Promise<AuditLogResponse> => {
    const response = await apiClient.get<AuditLogResponse>('/audit-logs', {
      params: filters,
    });
    if (Array.isArray(response.data)) {
      const items = response.data as AuditLogItem[];
      return {
        total: items.length,
        page: filters.page || 1,
        limit: filters.limit || 20,
        total_pages: Math.ceil(items.length / (filters.limit || 20)) || 1,
        items,
      };
    }
    return response.data;
  },

  getAuditLogById: async (logId: number | string): Promise<AuditLogItem> => {
    const response = await apiClient.get<AuditLogItem>(`/audit-logs/${logId}`);
    return response.data;
  },

  exportAuditLogsCsv: async (filters: AuditLogFilters = {}, filename = 'audit_logs.csv'): Promise<void> => {
    try {
      const response = await apiClient.get('/audit-logs/export', {
        params: filters,
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      const res = await auditService.getAuditLogs({ ...filters, limit: 1000, page: 1 });
      const headers = ['Log ID', 'Timestamp', 'Actor', 'Action', 'Resource', 'Risk', 'Details'];
      const rows = res.items.map((i) => [
        i.log_id,
        `"${i.timestamp}"`,
        `"${(i.actor || '').replace(/"/g, '""')}"`,
        `"${(i.action || '').replace(/"/g, '""')}"`,
        `"${(i.resource || '').replace(/"/g, '""')}"`,
        `"${i.risk || 'LOW'}"`,
        `"${JSON.stringify(i.details || {}).replace(/"/g, '""')}"`,
      ]);
      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  },
};

