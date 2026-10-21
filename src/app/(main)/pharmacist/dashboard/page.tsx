"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Pill, AlertTriangle, AlertCircle, TrendingUp, BarChart3,
  ArrowRight, DollarSign, Layers, Plus, ArrowDownToLine, CheckCircle2,
  Calendar
} from 'lucide-react';
import { pharmacyService, PharmacyDashboardKpis, Medicine } from '@/services/pharmacyService';
import { useAuth } from '@/hooks/useAuth';

export default function PharmacistDashboard() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<PharmacyDashboardKpis | null>(null);
  const [recentMeds, setRecentMeds] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      try {
        const [kpiData, invData] = await Promise.all([
          pharmacyService.getDashboardKpis().catch(() => null),
          pharmacyService.getInventory(undefined, undefined).catch(() => [])
        ]);
        setKpis(kpiData);
        setRecentMeds(invData.slice(0, 6));
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const hasUrgentAlerts = kpis && (Number(kpis.low_stock_count) > 0 || Number(kpis.expired_count) > 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0E4749] to-[#002626] rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white mb-2">
            Hospital Pharmacy Operations
          </span>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.username || 'Pharmacist'}
          </h1>
          <p className="text-teal-100 text-sm mt-1">
            Real-time control over medicine stocks, automated alerts, and daily dispensing reports.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/pharmacist/inventory"
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-[#0E4749] font-semibold rounded-lg text-sm shadow hover:bg-gray-100 transition"
          >
            <Pill className="w-4 h-4" /> Go to Inventory
          </Link>
          <Link
            href="/pharmacist/reports"
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-800 text-white font-semibold rounded-lg text-sm border border-teal-600 hover:bg-teal-700 transition"
          >
            <BarChart3 className="w-4 h-4" /> View Reports
          </Link>
        </div>
      </div>

      {/* Urgent Warning Banner if there are low stock or expired drugs */}
      {hasUrgentAlerts && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">Immediate Action Required</h3>
              <p className="text-xs text-amber-700">
                You have {kpis?.low_stock_count} medicines below reorder level and {kpis?.expired_count} expired medicines in the pharmacy.
              </p>
            </div>
          </div>
          <Link
            href="/pharmacist/reports"
            className="text-xs font-bold text-amber-800 bg-amber-200/60 hover:bg-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition shrink-0"
          >
            Review Alerts <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#DCE3E0] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#5B6472]">
            <span>Inventory Value</span>
            <DollarSign className="w-4 h-4 text-[#0E4749]" />
          </div>
          <div className="text-2xl font-bold text-[#0E4749] mt-2">
            Rs. {Number(kpis?.total_inventory_valuation || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-gray-400 mt-1">{kpis?.total_stock_units ?? 0} total units in stock</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#DCE3E0] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#5B6472]">
            <span>Low Stock Items</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">
            {kpis?.low_stock_count ?? 0}
          </div>
          <div className="text-xs text-amber-700/80 mt-1">Requires purchase orders</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#DCE3E0] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#5B6472]">
            <span>Expiring Soon (30d)</span>
            <Calendar className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-orange-600 mt-2">
            {kpis?.expiring_soon_count ?? 0}
          </div>
          <div className="text-xs text-orange-700/80 mt-1">Plus {kpis?.expired_count ?? 0} expired</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#DCE3E0] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#5B6472]">
            <span>Today&apos;s Dispensed</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">
            {kpis?.today_units_dispensed ?? 0}
          </div>
          <div className="text-xs text-emerald-700 mt-1">Rs. {Number(kpis?.today_revenue || 0).toFixed(2)} generated</div>
        </div>
      </div>

      {/* Quick Access to Inventory */}
      <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[#0E4749] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#0E4749]" /> Quick Inventory Overview
            </h2>
            <p className="text-xs text-[#5B6472] mt-0.5">Top medications in stock with real-time health indicator.</p>
          </div>
          <Link
            href="/pharmacist/inventory"
            className="text-xs font-semibold text-[#0E4749] hover:underline flex items-center gap-1"
          >
            Manage All Inventory <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8F9FA] text-xs font-semibold text-[#5B6472] uppercase border-b border-[#DCE3E0]">
              <tr>
                <th className="py-2.5 px-3">Medicine</th>
                <th className="py-2.5 px-3">Available Stock</th>
                <th className="py-2.5 px-3">Unit Price</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE3E0]">
              {recentMeds.map((m) => (
                <tr key={m.medicine_id} className="hover:bg-gray-50/60">
                  <td className="py-2.5 px-3 font-semibold text-gray-900">{m.med_name}</td>
                  <td className="py-2.5 px-3 font-medium text-gray-700">{m.stock_qty} units</td>
                  <td className="py-2.5 px-3 text-gray-800">Rs. {Number(m.unit_price).toFixed(2)}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      m.stock_qty <= m.reorder_level ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {m.stock_qty <= m.reorder_level ? 'Low Stock' : 'Good'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
