'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Clock, ShieldAlert, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { auditService } from '@/services/auditService';
import { AuditLogItem } from '@/types';

function formatTimeAgo(dateStr: string): string {
  try {
    const date = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(date.getTime())) return dateStr;
    const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  } catch {
    return dateStr;
  }
}

export function RecentAuditLogs({ limit = 4 }: { limit?: number }) {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await auditService.getRecentLogs(limit);
      setLogs(data);
    } catch (err: unknown) {
      console.error('Failed to load recent audit logs:', err);
      setError('Unable to load recent audit logs');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="bg-white rounded-xl border border-[#DCE3E0] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#0E4749]" />
          <h3 className="font-bold text-[#0E4749]">Recent Audit Logs</h3>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            disabled={loading}
            title="Refresh logs"
            className="text-gray-400 hover:text-[#0E4749] transition-colors p-1"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/admin/audit"
            className="text-xs font-semibold text-[#0E4749] hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchLogs}
            className="underline font-bold hover:text-red-900"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-sm">
          No audit logs recorded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const actorInitial = (log.actor || 'S').charAt(0).toUpperCase();
            const risk = (log.risk || 'LOW').toUpperCase();
            const riskClass =
              risk === 'HIGH'
                ? 'bg-red-100 text-red-700'
                : risk === 'MEDIUM'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700';

            return (
              <div
                key={log.log_id}
                className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100"
              >
                <div className="w-10 h-10 rounded-full bg-[#0E4749] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
                  {actorInitial}
                </div>
                <div className="flex-1 min-width-0">
                  <div className="flex justify-between items-start">
                    <div className="font-bold text-gray-900 text-sm truncate pr-2">
                      {log.actor || 'System'}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                      <Clock className="w-3 h-3" /> {formatTimeAgo(log.timestamp)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 mt-0.5 truncate">{log.action}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                      {log.resource}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${riskClass}`}>
                      {risk}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
