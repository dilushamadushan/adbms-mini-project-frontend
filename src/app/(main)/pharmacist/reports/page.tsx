"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, AlertTriangle, AlertCircle, TrendingUp, Calendar,
  Coins, Package, RefreshCw, Loader2, ArrowUpRight, CheckCircle2,
  Printer, FileText
} from 'lucide-react';
import {
  pharmacyService, LowStockAlert, ExpiringMedicine,
  TopDispensedMedicine, DailyDispensingReport, PharmacyDashboardKpis
} from '@/services/pharmacyService';
import DailyDispensingReportModal from '@/components/features/pharmacist/DailyDispensingReportModal';

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
  const [showReportModal, setShowReportModal] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Date range validation rules
  const dateValidationError = (() => {
    if (!startDate && !endDate) return null; // Initial state: neither date entered
    if (startDate && !endDate) return "End Date is missing. Please select an End Date to complete the report period.";
    if (!startDate && endDate) return "Start Date is missing. Please select a Start Date to complete the report period.";
    if (startDate > endDate) return "Invalid Date Range: Start Date cannot be later than End Date. Please fix the dates.";
    if (startDate > todayStr || endDate > todayStr) return "Invalid Date: Future dates cannot be selected. Please choose dates up to today.";
    return null;
  })();

  const isDateRangeValid = Boolean(startDate && endDate && !dateValidationError);

  const loadReportData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dailyPromise = (startDate && endDate && !dateValidationError)
        ? pharmacyService.getDailyDispensing(startDate, endDate).catch(() => [])
        : Promise.resolve([]);

      const [lowStockData, expiringData, topData, dailyData, kpiData] = await Promise.all([
        pharmacyService.getLowStockAlerts().catch(() => []),
        pharmacyService.getExpiringMedicines(45).catch(() => []),
        pharmacyService.getTopDispensed(10).catch(() => []),
        dailyPromise,
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
  }, [startDate, endDate, dateValidationError]);

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
              <Coins className="w-4 h-4 text-[#0E4749]" />
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

      {/* Navigation Buttons */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-gray-100/90 border border-[#DCE3E0] rounded-2xl w-fit shadow-xs">
        {/* Button 1: Stock & Expiry Alerts */}
        <button
          type="button"
          onClick={() => setActiveTab('alerts')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'alerts'
              ? 'bg-[#0E4749] text-white shadow-md shadow-[#0E4749]/20'
              : 'bg-white text-gray-700 hover:text-[#0E4749] hover:bg-white/90 border border-gray-200/60 shadow-xs'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'alerts' ? 'bg-white/15 text-amber-300' : 'bg-amber-50 text-amber-600'}`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <span>Stock & Expiry Alerts</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold leading-none ${
            activeTab === 'alerts'
              ? 'bg-amber-400 text-amber-950'
              : 'bg-amber-100 text-amber-800'
          }`}>
            {lowStock.length + expiring.length}
          </span>
        </button>

        {/* Button 2: Most Dispensed Drugs */}
        <button
          type="button"
          onClick={() => setActiveTab('top_dispensed')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'top_dispensed'
              ? 'bg-[#0E4749] text-white shadow-md shadow-[#0E4749]/20'
              : 'bg-white text-gray-700 hover:text-[#0E4749] hover:bg-white/90 border border-gray-200/60 shadow-xs'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'top_dispensed' ? 'bg-white/15 text-teal-200' : 'bg-teal-50 text-teal-700'}`}>
            <TrendingUp className="w-4 h-4" />
          </div>
          <span>Most Dispensed Drugs</span>
        </button>

        {/* Button 3: Daily Dispensing Report */}
        <button
          type="button"
          onClick={() => setActiveTab('daily_report')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'daily_report'
              ? 'bg-[#0E4749] text-white shadow-md shadow-[#0E4749]/20'
              : 'bg-white text-gray-700 hover:text-[#0E4749] hover:bg-white/90 border border-gray-200/60 shadow-xs'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'daily_report' ? 'bg-white/15 text-blue-200' : 'bg-blue-50 text-blue-700'}`}>
            <Calendar className="w-4 h-4" />
          </div>
          <span>Daily Dispensing Report</span>
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
                max={todayStr}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E4749]/20 ${
                  dateValidationError && !startDate ? 'border-amber-400 bg-amber-50/30' : 'border-gray-300'
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-600">End Date:</label>
              <input
                type="date"
                max={todayStr}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E4749]/20 ${
                  dateValidationError && !endDate ? 'border-amber-400 bg-amber-50/30' : 'border-gray-300'
                }`}
              />
            </div>
            <div className="ml-auto flex items-center gap-3">
              {(startDate || endDate) && (
                <button
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="text-xs text-[#0E4749] underline hover:text-black cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
              <button
                onClick={() => setShowReportModal(true)}
                disabled={!isDateRangeValid || dailyReport.length === 0}
                title={!isDateRangeValid ? "Select valid start and end dates to enable export" : "Download / Print PDF Report"}
                className="flex items-center gap-2 px-4 py-2 bg-[#0E4749] hover:bg-[#082d2f] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Download / Print PDF Report</span>
              </button>
            </div>
          </div>

          {/* Validation Error Alert Banner */}
          {dateValidationError && (
            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl text-amber-900 text-xs flex items-center justify-between gap-3 shadow-sm animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold block text-sm text-amber-950">Date Range Validation Notice</span>
                  <span className="text-amber-800 text-xs">{dateValidationError}</span>
                </div>
              </div>
              <button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg border border-amber-300 transition shrink-0 cursor-pointer"
              >
                Clear Dates
              </button>
            </div>
          )}

          {/* Empty Prompt State: Shown when no dates are selected yet */}
          {!startDate && !endDate && !dateValidationError && (
            <div className="bg-white rounded-xl border border-dashed border-[#DCE3E0] p-12 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-teal-50 text-[#0E4749] flex items-center justify-center mb-4">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-[#0E4749] text-base mb-1.5">Select Date Range to View Dispensing Report</h3>
              <p className="text-xs text-[#5B6472] max-w-md leading-relaxed">
                Daily dispensing records, medication unit counts, and revenue totals will only be displayed after selecting both a <strong>Start Date</strong> and an <strong>End Date</strong> above.
              </p>
            </div>
          )}

          {/* Report Results: Shown ONLY when both dates are provided and valid */}
          {isDateRangeValid && (
            <>
              {/* Period Highlights */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl">
                  <div className="text-xs font-medium text-teal-800">
                    Total Revenue in Period ({startDate} to {endDate})
                  </div>
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
                  <div className="py-12 text-center text-sm text-[#5B6472]">
                    <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-50" />
                    No dispensing records found for the period from <strong>{startDate}</strong> to <strong>{endDate}</strong>.
                  </div>
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
            </>
          )}
        </div>
      )}
      {/* Daily Dispensing Report PDF Export & Print Modal */}
      <DailyDispensingReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        dailyReport={dailyReport}
        startDate={startDate}
        endDate={endDate}
        totalRevenue={totalReportRevenue}
        totalUnits={totalReportUnits}
        pharmacistName="Alex Taylor, B.Pharm"
      />
    </div>
  );
}
