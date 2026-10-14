'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Users,
  BedDouble,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  UserX,
  RefreshCw,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { reportService } from '@/services/reportService';
import { KpiOverviewResponse } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────
interface KpiCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  iconBg: string;
  loading?: boolean;
}

function KpiCard({ title, value, subtext, icon, iconBg, loading }: KpiCardProps) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon-wrap" style={{ background: iconBg }}>{icon}</div>
      <div className="kpi-body">
        <p className="kpi-label">{title}</p>
        {loading ? <div className="kpi-skeleton" /> : <p className="kpi-value">{value}</p>}
        {subtext && !loading && <p className="kpi-sub">{subtext}</p>}
      </div>
    </div>
  );
}

interface ApptPillProps {
  label: string;
  count: number;
  icon: React.ReactNode;
  bg: string;
}
function ApptPill({ label, count, icon, bg }: ApptPillProps) {
  return (
    <div className="appt-pill" style={{ background: bg }}>
      {icon}
      <div>
        <div className="appt-pill-count">{count}</div>
        <div className="appt-pill-label">{label}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────
export function KpiOverviewCards() {
  const [data, setData] = useState<KpiOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchKpi = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError(null);
      const result = await reportService.getKpiOverview();
      setData(result);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
            'Failed to load KPI data'
          : 'Failed to load KPI data';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchKpi();
    const id = setInterval(() => fetchKpi(true), 60_000);
    return () => clearInterval(id);
  }, [fetchKpi]);

  const bd = data?.bed_details;
  const ad = data?.appointment_details;
  const occupancyPct = bd?.occupancy_rate ?? 0;
  const occupancyColor =
    occupancyPct >= 90 ? '#ef4444' : occupancyPct >= 70 ? '#f97316' : '#10b981';

  return (
    <>
      <style>{`
        /* ── Stat card grid ── */
        .kpi-grid{display:grid;grid-template-columns:repeat(1,1fr);gap:1rem}
        @media(min-width:640px){.kpi-grid{grid-template-columns:repeat(3,1fr)}}
        .kpi-card{display:flex;align-items:center;gap:1rem;background:#fff;border:1px solid #e5e7eb;border-radius:1rem;padding:1.25rem 1.5rem;box-shadow:0 1px 4px rgba(0,0,0,.06);transition:box-shadow .2s,transform .2s}
        .kpi-card:hover{box-shadow:0 6px 20px rgba(0,0,0,.1);transform:translateY(-2px)}
        .kpi-icon-wrap{flex-shrink:0;width:3rem;height:3rem;border-radius:.75rem;display:flex;align-items:center;justify-content:center}
        .kpi-body{flex:1;min-width:0}
        .kpi-label{font-size:.7rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;margin-bottom:.25rem}
        .kpi-value{font-size:1.75rem;font-weight:800;color:#111827;line-height:1}
        .kpi-sub{font-size:.75rem;color:#9ca3af;margin-top:.25rem}
        .kpi-skeleton{height:2rem;width:80%;background:linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:.5rem}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

        /* ── Section card ── */
        .section-card{background:#fff;border:1px solid #e5e7eb;border-radius:1rem;padding:1.5rem;box-shadow:0 1px 4px rgba(0,0,0,.06)}
        .section-title{font-size:.95rem;font-weight:700;color:#0E4749;margin-bottom:.2rem}
        .section-sub{font-size:.75rem;color:#9ca3af}

        /* ── Bed chips ── */
        .bed-chip-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.6rem;margin-top:1rem}
        @media(max-width:400px){.bed-chip-grid{grid-template-columns:repeat(2,1fr)}}
        .bed-chip{text-align:center;padding:.6rem .4rem;border-radius:.75rem;border:1px solid transparent}
        .bed-chip-val{font-size:1.4rem;font-weight:800}
        .bed-chip-lbl{font-size:.6rem;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;margin-top:.15rem}

        /* ── Appt pills ── */
        .appt-pills{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:1rem}
        .appt-pill{display:flex;align-items:center;gap:.6rem;padding:.65rem .85rem;border-radius:.75rem;flex:1 1 100px}
        .appt-pill-count{font-size:1.25rem;font-weight:800;color:#111827}
        .appt-pill-label{font-size:.62rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#6b7280}

        /* ── Occupancy bar ── */
        .occ-bar-wrap{background:#f3f4f6;border-radius:999px;height:10px;overflow:hidden}
        .occ-bar{height:100%;border-radius:999px;transition:width .8s cubic-bezier(.4,0,.2,1)}

        /* ── Error ── */
        .kpi-error{display:flex;align-items:center;gap:.75rem;background:#fef2f2;border:1px solid #fecaca;border-radius:.75rem;padding:1rem 1.25rem;color:#b91c1c;font-size:.85rem}

        /* ── Refresh btn ── */
        .refresh-btn{display:inline-flex;align-items:center;gap:.4rem;font-size:.75rem;font-weight:600;color:#6b7280;background:none;border:1px solid #e5e7eb;border-radius:.5rem;padding:.3rem .75rem;cursor:pointer;transition:color .15s,border-color .15s}
        .refresh-btn:hover{color:#0E4749;border-color:#0E4749}
        .spin{animation:spin .8s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}

        /* ── Bottom 2-col ── */
        .kpi-bottom{display:grid;grid-template-columns:1fr;gap:1rem}
        @media(min-width:768px){.kpi-bottom{grid-template-columns:1fr 1fr}}
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0E4749', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
            <Activity style={{ width: 18, height: 18 }} />
            Hospital KPI Overview
          </h2>
          {lastUpdated && (
            <p style={{ fontSize: '.7rem', color: '#9ca3af', marginTop: '.1rem' }}>
              Updated {lastUpdated.toLocaleTimeString()}
              {data?.target_date ? ` · ${data.target_date}` : ''}
            </p>
          )}
        </div>
        <button className="refresh-btn" onClick={() => fetchKpi(true)} disabled={refreshing}>
          <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'spin')} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="kpi-error" style={{ marginBottom: '1rem' }}>
          <XCircle style={{ width: 18, height: 18, flexShrink: 0 }} />
          {error}
          <button
            onClick={() => fetchKpi()}
            style={{ marginLeft: 'auto', fontWeight: 700, textDecoration: 'underline', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Top 3 cards */}
      <div className="kpi-grid" style={{ marginBottom: '1rem' }}>
        <KpiCard
          title="Total Patients"
          value={data?.total_patients ?? '—'}
          subtext="All registered patients"
          icon={<Users style={{ width: 22, height: 22, color: '#0E4749' }} />}
          iconBg="rgba(14,71,73,.1)"
          loading={loading}
        />
        <KpiCard
          title="Bed Occupancy"
          value={data?.bed_occupancy_formatted ?? '—'}
          subtext={bd ? `${bd.occupied_beds} occupied · ${bd.available_beds} available` : undefined}
          icon={<BedDouble style={{ width: 22, height: 22, color: '#E07856' }} />}
          iconBg="rgba(224,120,86,.12)"
          loading={loading}
        />
        <KpiCard
          title="Today's Appointments"
          value={data?.todays_appointments ?? '—'}
          subtext={ad ? `${ad.completed} completed · ${ad.scheduled} scheduled` : undefined}
          icon={<CalendarCheck style={{ width: 22, height: 22, color: '#6366f1' }} />}
          iconBg="rgba(99,102,241,.1)"
          loading={loading}
        />
      </div>

      {/* Bottom two panels */}
      <div className="kpi-bottom">

        {/* Bed status breakdown */}
        <div className="section-card">
          <p className="section-title">🛏 Bed Status Breakdown</p>
          <p className="section-sub">Real-time ward capacity</p>

          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', marginBottom: '.35rem', fontWeight: 600, color: '#374151' }}>
              <span>Occupancy rate</span>
              <span style={{ color: occupancyColor }}>
                {loading ? '…' : (bd?.formatted_occupancy ?? '—')}
              </span>
            </div>
            <div className="occ-bar-wrap">
              <div className="occ-bar" style={{ width: loading ? '0%' : `${Math.min(occupancyPct, 100)}%`, background: occupancyColor }} />
            </div>
          </div>

          <div className="bed-chip-grid">
            {([
              { label: 'Total',    val: bd?.total_beds,    color: '#0E4749', bg: 'rgba(14,71,73,.07)' },
              { label: 'Occupied', val: bd?.occupied_beds, color: '#E07856', bg: 'rgba(224,120,86,.09)' },
              { label: 'Available',val: bd?.available_beds,color: '#10b981', bg: 'rgba(16,185,129,.08)' },
              { label: 'Cleaning', val: bd?.cleaning_beds, color: '#f59e0b', bg: 'rgba(245,158,11,.08)' },
            ] as const).map((chip) => (
              <div key={chip.label} className="bed-chip" style={{ background: chip.bg }}>
                {loading
                  ? <div className="kpi-skeleton" style={{ margin: '0 auto', width: '60%', height: '1.5rem' }} />
                  : <div className="bed-chip-val" style={{ color: chip.color }}>{chip.val ?? '—'}</div>
                }
                <div className="bed-chip-lbl">{chip.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Appointment breakdown */}
        <div className="section-card">
          <p className="section-title">📅 Appointment Breakdown</p>
          <p className="section-sub">Today&apos;s appointment status</p>

          {loading ? (
            <div style={{ display: 'flex', gap: '.6rem', marginTop: '1rem' }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="kpi-skeleton" style={{ height: 60, flex: 1 }} />
              ))}
            </div>
          ) : (
            <div className="appt-pills">
              <ApptPill label="Scheduled" count={ad?.scheduled ?? 0} bg="rgba(99,102,241,.07)"  icon={<Clock      style={{ width: 20, height: 20, color: '#6366f1', flexShrink: 0 }} />} />
              <ApptPill label="Completed" count={ad?.completed ?? 0} bg="rgba(16,185,129,.07)"  icon={<CheckCircle2 style={{ width: 20, height: 20, color: '#10b981', flexShrink: 0 }} />} />
              <ApptPill label="Cancelled" count={ad?.cancelled ?? 0} bg="rgba(239,68,68,.06)"   icon={<XCircle    style={{ width: 20, height: 20, color: '#ef4444', flexShrink: 0 }} />} />
              <ApptPill label="No-show"  count={ad?.no_show  ?? 0} bg="rgba(245,158,11,.07)"  icon={<UserX      style={{ width: 20, height: 20, color: '#f59e0b', flexShrink: 0 }} />} />
            </div>
          )}

          {/* Distribution bar */}
          {!loading && ad && ad.total_today > 0 && (
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ fontSize: '.7rem', color: '#9ca3af', marginBottom: '.35rem' }}>Distribution</div>
              <div style={{ display: 'flex', height: 10, borderRadius: 999, overflow: 'hidden', gap: 2 }}>
                {[
                  { pct: (ad.scheduled / ad.total_today) * 100, color: '#6366f1' },
                  { pct: (ad.completed / ad.total_today) * 100, color: '#10b981' },
                  { pct: (ad.cancelled / ad.total_today) * 100, color: '#ef4444' },
                  { pct: (ad.no_show  / ad.total_today) * 100, color: '#f59e0b' },
                ]
                  .filter((s) => s.pct > 0)
                  .map((seg, i) => (
                    <div key={i} style={{ height: '100%', width: `${seg.pct}%`, background: seg.color, borderRadius: 999, transition: 'width .8s' }} />
                  ))}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '.4rem', flexWrap: 'wrap' }}>
                {[
                  { label: 'Scheduled', color: '#6366f1' },
                  { label: 'Completed', color: '#10b981' },
                  { label: 'Cancelled', color: '#ef4444' },
                  { label: 'No-show',  color: '#f59e0b' },
                ].map((l) => (
                  <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.65rem', color: '#6b7280' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, display: 'inline-block' }} />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!loading && ad && ad.total_today === 0 && (
            <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '.8rem', marginTop: '1.5rem', padding: '1rem' }}>
              No appointments recorded for today.
            </div>
          )}
        </div>
      </div>
      {/* Unused import suppression */}
      <span style={{ display: 'none' }}><TrendingUp /></span>
    </>
  );
}
