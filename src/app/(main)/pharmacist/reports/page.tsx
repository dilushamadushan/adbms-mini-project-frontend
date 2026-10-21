"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, AlertTriangle, AlertCircle, TrendingUp, Calendar,
  DollarSign, Package, RefreshCw, Loader2, ArrowUpRight, CheckCircle2
} from 'lucide-react';
import {
  pharmacyService, LowStockAlert, ExpiringMedicine,
  TopDispensedMedicine, DailyDispensingReport, PharmacyDashboardKpis
} from '@/services/pharmacyService';

export default function PharmacistReports() {
  const [activeTab, setActiveTab] = useState<'alerts' | 'top_dispensed' | 'daily_report' | 'valuation'>('alerts');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [lowStock, setLowStock] = useState<LowStockAlert[]>([]);
  const [expiring, setExpiring] = useState<ExpiringMedicine[]>([]);
  const [topDispensed, setTopDispensed] = useState<TopDispensedMedicine[]>([]);
  const [dailyReport, setDailyReport] = useState<DailyDispensingReport[]>([]);
  const [kpis, setKpis] = useState<PharmacyDashboardKpis | null>(null);

  // Date filters for daily report
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadReportData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [lowStockData, expiringData, topData, dailyData, kpiData] = await Promise.all([
        pharmacyService.getLowStockAlerts().catch(() => []),
        pharmacyService.getExpiringMedicines(45).catch(() => []),
        pharmacyService.getTopDispensed(10).catch(() => []),
        pharmacyService.getDailyDispensing(startDate || undefined, endDate || undefined).catch(() => []),
        pharmacyService.getDashboardKpis().catch(() => null)
      ]);

      setLowStock(lowStockData);
      setExpiring(expiringData);
      setTopDispensed(topData);
      setDailyReport(dailyData);
      setKpis(kpiData);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to fetch reporting analytics.');
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  // Derived summaries
  const totalReportRevenue = dailyReport.reduce((acc, curr) => acc + Number(curr.total_revenue || 0), 0);
  const totalReportUnits = dailyReport.reduce((acc, curr) => acc + Number(curr.total_units || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-bold text-[#0E4749] text-2xl tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-[#0E4749]" /> Pharmacy Alerts & Reports
          </h1>
          <p className="text-sm text-[#5B6472] mt-0.5">
            Real-time stock depletion alerts, expiry tracking, and dispensing trends.
          </p>
        </div>
        <button
          onClick={() => loadReportData()}
          className="flex items-center gap-2 px-3 py-2 border border-[#DCE3E0] bg-white rounded-lg text-sm text-[#0E4749] font-medium hover:bg-gray-50 transition shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Reports
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Overview Strip */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#5B6472] mb-1">
              <span>Inventory Valuation</span>
              <DollarSign className="w-4 h-4 text-[#0E4749]" />
            </div>
            <div className="text-xl font-bold text-[#0E4749]">
              Rs. {Number(kpis.total_inventory_valuation || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">{kpis.total_stock_units} units in warehouse</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#5B6472] mb-1">
              <span>Low Stock Alerts</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-bold text-amber-600">{kpis.low_stock_count}</div>
            <div className="text-[11px] text-gray-400 mt-1">Below defined reorder level</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#5B6472] mb-1">
              <span>Expiry Risk Items</span>
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-xl font-bold text-red-600">
              {Number(kpis.expired_count) + Number(kpis.expiring_soon_count)}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">
              {kpis.expired_count} expired · {kpis.expiring_soon_count} in 30 days
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#5B6472] mb-1">
              <span>Today&apos;s Revenue</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-emerald-600">
              Rs. {Number(kpis.today_revenue || 0).toFixed(2)}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">{kpis.today_units_dispensed} units dispensed today</div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#DCE3E0] gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`pb-3 flex items-center gap-2 transition ${
            activeTab === 'alerts'
              ? 'border-b-2 border-[#0E4749] text-[#0E4749] font-bold'
              : 'text-[#5B6472] hover:text-[#0E4749]'
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Stock & Expiry Alerts ({lowStock.length + expiring.length})
        </button>

        <button
          onClick={() => setActiveTab('top_dispensed')}
          className={`pb-3 flex items-center gap-2 transition ${
            activeTab === 'top_dispensed'
              ? 'border-b-2 border-[#0E4749] text-[#0E4749] font-bold'
              : 'text-[#5B6472] hover:text-[#0E4749]'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Most Dispensed Drugs
        </button>

        <button
          onClick={() => setActiveTab('daily_report')}
          className={`pb-3 flex items-center gap-2 transition ${
            activeTab === 'daily_report'
              ? 'border-b-2 border-[#0E4749] text-[#0E4749] font-bold'
              : 'text-[#5B6472] hover:text-[#0E4749]'
          }`}
        >
          <Calendar className="w-4 h-4" /> Daily Dispensing Report
        </button>
      </div>

      {/* TAB 1: ALERTS (Low Stock & Expiry) */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Section A: Low Stock Alerts */}
          <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm p-5">
            <h2 className="text-base font-bold text-[#0E4749] flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Low Stock Medicines (Need Reordering)
            </h2>

            {lowStock.length === 0 ? (
              <div className="py-6 text-center text-sm text-[#5B6472] flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> All medicine stock levels are above their reorder thresholds.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F8F9FA] text-xs text-[#5B6472] uppercase border-b border-[#DCE3E0]">
                    <tr>
                      <th className="py-2.5 px-3">Medicine</th>
                      <th className="py-2.5 px-3">Remaining Stock</th>
                      <th className="py-2.5 px-3">Reorder Threshold</th>
                      <th className="py-2.5 px-3">Required Deficit</th>
                      <th className="py-2.5 px-3">Unit Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE3E0]">
                    {lowStock.map((item) => (
                      <tr key={item.medicine_id} className="hover:bg-amber-50/30">
                        <td className="py-2.5 px-3 font-semibold text-[#0E4749]">{item.med_name}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800 text-xs">
                            {item.stock_qty} units
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-600">{item.reorder_level} units</td>
                        <td className="py-2.5 px-3 font-semibold text-red-600">+{item.deficit_quantity} units</td>
                        <td className="py-2.5 px-3 text-gray-800">Rs. {Number(item.unit_price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section B: Expiry Alerts */}
          <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm p-5">
            <h2 className="text-base font-bold text-[#0E4749] flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Expired & Near-Expiry Batches (Within 45 Days)
            </h2>

            {expiring.length === 0 ? (
              <div className="py-6 text-center text-sm text-[#5B6472] flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> No medicines are expiring in the next 45 days.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F8F9FA] text-xs text-[#5B6472] uppercase border-b border-[#DCE3E0]">
                    <tr>
                      <th className="py-2.5 px-3">Medicine</th>
                      <th className="py-2.5 px-3">Expiry Date</th>
                      <th className="py-2.5 px-3">Days Left</th>
                      <th className="py-2.5 px-3">Stock at Risk</th>
                      <th className="py-2.5 px-3">Urgency Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE3E0]">
                    {expiring.map((item) => (
                      <tr key={item.medicine_id} className="hover:bg-red-50/20">
                        <td className="py-2.5 px-3 font-semibold text-[#0E4749]">{item.med_name}</td>
                        <td className="py-2.5 px-3 text-gray-700">{item.expiry_date.slice(0, 10)}</td>
                        <td className="py-2.5 px-3 font-semibold">
                          {item.days_left < 0 ? (
                            <span className="text-red-700">Expired {Math.abs(item.days_left)} days ago</span>
                          ) : (
                            <span className="text-orange-600">{item.days_left} days</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-gray-800">{item.stock_qty} units</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            item.urgency_status === 'EXPIRED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {item.urgency_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TOP DISPENSED MEDICINES */}
      {activeTab === 'top_dispensed' && (
        <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm p-5">
          <h2 className="text-base font-bold text-[#0E4749] flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            Top 10 Most Frequently Dispensed Medications
          </h2>

          {topDispensed.length === 0 ? (
            <div className="py-8 text-center text-sm text-[#5B6472]">No dispensation records found yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F8F9FA] text-xs text-[#5B6472] uppercase border-b border-[#DCE3E0]">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Medicine Name</th>
                    <th className="py-3 px-4">Generic Name</th>
                    <th className="py-3 px-4">Units Dispensed</th>
                    <th className="py-3 px-4">Prescription Count</th>
                    <th className="py-3 px-4">Current Stock</th>
                    <th className="py-3 px-4 text-right">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE3E0]">
                  {topDispensed.map((item, index) => (
                    <tr key={item.medicine_id} className="hover:bg-[#F8FDFD]">
                      <td className="py-3 px-4 font-bold text-[#0E4749]">#{index + 1}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{item.med_name}</td>
                      <td className="py-3 px-4 text-gray-500">{item.generic_name || '—'}</td>
                      <td className="py-3 px-4 font-bold text-teal-700">{item.total_units_dispensed}</td>
                      <td className="py-3 px-4 text-gray-600">{item.total_dispense_events}</td>
                      <td className="py-3 px-4 font-medium text-gray-700">{item.current_stock}</td>
                      <td className="py-3 px-4 text-right font-bold text-[#0E4749]">
                        Rs. {Number(item.total_revenue_generated).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DAILY DISPENSING REPORT */}
      {activeTab === 'daily_report' && (
        <div className="space-y-6">
          {/* Date Range Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-600">Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E4749]/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-600">End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E4749]/20"
              />
            </div>
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="text-xs text-[#0E4749] underline hover:text-black ml-auto"
            >
              Reset Filters
            </button>
          </div>

          {/* Period Highlights */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl">
              <div className="text-xs font-medium text-teal-800">Total Revenue in Period</div>
              <div className="text-2xl font-bold text-[#0E4749] mt-1">
                Rs. {totalReportRevenue.toFixed(2)}
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
              <div className="text-xs font-medium text-blue-800">Total Units Dispensed</div>
              <div className="text-2xl font-bold text-blue-900 mt-1">
                {totalReportUnits} units
              </div>
            </div>
          </div>

          {/* Daily Table */}
          <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm overflow-hidden">
            {dailyReport.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#5B6472]">No dispensing records in selected date range.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F8F9FA] text-xs text-[#5B6472] uppercase border-b border-[#DCE3E0]">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Prescriptions Dispensed</th>
                    <th className="py-3 px-4">Total Units Dispensed</th>
                    <th className="py-3 px-4 text-right">Daily Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE3E0]">
                  {dailyReport.map((day) => (
                    <tr key={String(day.report_date)} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold text-gray-800">
                        {String(day.report_date).slice(0, 10)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{day.total_dispensations} prescriptions</td>
                      <td className="py-3 px-4 font-bold text-teal-700">{day.total_units} units</td>
                      <td className="py-3 px-4 text-right font-bold text-[#0E4749]">
                        Rs. {Number(day.total_revenue).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
