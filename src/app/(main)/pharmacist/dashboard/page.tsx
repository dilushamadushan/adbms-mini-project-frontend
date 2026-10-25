"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Pill, AlertTriangle, AlertCircle, TrendingUp, BarChart3,
  ArrowRight, Coins, Layers, CheckCircle2, Calendar,
  ClipboardList, Search, User, Stethoscope, Clock, ShieldAlert,
  Loader2, X, PackageCheck, RefreshCw
} from 'lucide-react';
import {
  pharmacyService, PharmacyDashboardKpis, Medicine, PrescriptionQueueItem
} from '@/services/pharmacyService';
import { useAuth } from '@/hooks/useAuth';

export default function PharmacistDashboard() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<PharmacyDashboardKpis | null>(null);
  const [fullInventory, setFullInventory] = useState<Medicine[]>([]);
  const [inventorySearch, setInventorySearch] = useState('');
  const [pendingQueue, setPendingQueue] = useState<PrescriptionQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Dispense modal state
  const [selectedRx, setSelectedRx] = useState<PrescriptionQueueItem | null>(null);
  const [dispenseQty, setDispenseQty] = useState<number>(10);
  const [isDispensing, setIsDispensing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [kpiData, invData, queueData] = await Promise.all([
        pharmacyService.getDashboardKpis().catch(() => null),
        pharmacyService.getInventory(undefined, undefined).catch(() => []),
        pharmacyService.getPendingPrescriptions().catch(() => [])
      ]);
      setKpis(kpiData);
      setFullInventory(invData);
      setPendingQueue(queueData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    // Auto-refresh queue every 10 seconds to pick up doctor prescriptions immediately
    const interval = setInterval(() => {
      loadDashboardData();
    }, 10000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  // Open Dispense Modal with smart default quantity and medicine auto-mapping
  const handleOpenDispenseModal = (rx: PrescriptionQueueItem) => {
    let itemToSelect: PrescriptionQueueItem = { ...rx };
    
    // Fallback drug matching if medicine_id was not automatically mapped
    if (!itemToSelect.medicine_id && fullInventory.length > 0) {
      const firstWord = rx.med_name.split(' ')[0].toLowerCase();
      const matched = fullInventory.find(m => 
        m.med_name.toLowerCase().includes(rx.med_name.toLowerCase()) ||
        rx.med_name.toLowerCase().includes(m.med_name.toLowerCase()) ||
        (firstWord.length > 2 && m.med_name.toLowerCase().includes(firstWord)) ||
        (m.generic_name && m.generic_name.toLowerCase().includes(firstWord))
      );
      if (matched) {
        itemToSelect = {
          ...itemToSelect,
          medicine_id: matched.medicine_id,
          inventory_med_name: matched.med_name,
          stock_qty: matched.stock_qty,
          unit_price: matched.unit_price,
        };
      }
    }

    setSelectedRx(itemToSelect);
    setActionError(null);
    setActionSuccess(null);

    // Smart default quantity estimation
    let suggestedQty = 10;
    if (rx.duration) {
      const match = rx.duration.match(/\d+/);
      if (match) {
        const days = parseInt(match[0], 10);
        if (rx.dosage.toLowerCase().includes('tds') || rx.dosage.toLowerCase().includes('3 times')) {
          suggestedQty = days * 3;
        } else if (rx.dosage.toLowerCase().includes('bd') || rx.dosage.toLowerCase().includes('twice')) {
          suggestedQty = days * 2;
        } else if (rx.dosage.toLowerCase().includes('qds') || rx.dosage.toLowerCase().includes('4 times')) {
          suggestedQty = days * 4;
        } else {
          suggestedQty = days;
        }
      }
    }
    setDispenseQty(suggestedQty > 0 ? suggestedQty : 10);
  };

  // Confirm Dispense & Deduct Stock
  const handleConfirmDispense = async () => {
    if (!selectedRx) return;
    if (!selectedRx.medicine_id) {
      setActionError("Cannot dispense: Prescribed medication is not mapped to an active pharmacy inventory item.");
      return;
    }
    if (dispenseQty <= 0) {
      setActionError("Please specify a valid quantity greater than zero.");
      return;
    }
    if (selectedRx.stock_qty !== undefined && selectedRx.stock_qty < dispenseQty) {
      setActionError(`Insufficient stock. Only ${selectedRx.stock_qty} units available in inventory.`);
      return;
    }

    setIsDispensing(true);
    setActionError(null);
    try {
      const staffId = (user as any)?.staff_id || 5;
      const res = await pharmacyService.dispensePrescription(selectedRx.rx_id, {
        medicine_id: selectedRx.medicine_id,
        quantity: dispenseQty,
        pharmacist_id: staffId
      });

      setActionSuccess(
        `Successfully issued ${dispenseQty} units of "${selectedRx.med_name}" to ${selectedRx.patient_name}. Inventory stock has been automatically updated!`
      );
      setSelectedRx(null);
      await loadDashboardData();
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || "Failed to confirm dispensation.");
    } finally {
      setIsDispensing(false);
    }
  };

  const filteredQueue = pendingQueue.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.patient_name.toLowerCase().includes(q) ||
      item.med_name.toLowerCase().includes(q) ||
      item.doctor_name.toLowerCase().includes(q)
    );
  });

  const filteredInventory = fullInventory.filter(item => {
    const q = inventorySearch.toLowerCase();
    return (
      item.med_name.toLowerCase().includes(q) ||
      (item.generic_name && item.generic_name.toLowerCase().includes(q))
    );
  });

  const hasUrgentAlerts = kpis && (Number(kpis.low_stock_count) > 0 || Number(kpis.expired_count) > 0);

  // User clean display name (e.g. 'pharmacist.alex' -> 'Alex')
  const rawName = user?.username ? user.username.split('.').pop() || user.username : 'Alex';
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0E4749] to-[#002626] rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">
              Hospital Pharmacy Operations
            </span>
            {pendingQueue.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-950 flex items-center gap-1 animate-pulse">
                <ClipboardList className="w-3.5 h-3.5" /> {pendingQueue.length} Pending Prescriptions
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-teal-100 text-sm mt-1">
            Doctor prescription intake, automated inventory deduction, and stock controls.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/pharmacist/inventory"
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-[#0E4749] font-semibold rounded-lg text-sm shadow hover:bg-gray-100 transition"
          >
            <Pill className="w-4 h-4" /> Go to Inventory
          </Link>
          <Link
            href="/pharmacist/history"
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-800 text-white font-semibold rounded-lg text-sm border border-teal-600 hover:bg-teal-700 transition"
          >
            <Clock className="w-4 h-4" /> Dispensing History
          </Link>
          <Link
            href="/pharmacist/reports"
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-800 text-white font-semibold rounded-lg text-sm border border-teal-600 hover:bg-teal-700 transition"
          >
            <BarChart3 className="w-4 h-4" /> Reports
          </Link>
        </div>
      </div>

      {/* Action Notification Messages */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-sm flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-xl text-sm flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span className="font-medium">{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-700 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
            <Coins className="w-4 h-4 text-[#0E4749]" />
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

      {/* CORE SECTION: DOCTOR PRESCRIPTIONS QUEUE */}
      <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#0E4749] flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#0E4749]" />
              Doctor Prescriptions Intake Queue
            </h2>
            <p className="text-xs text-[#5B6472] mt-0.5">
              Prescriptions sent directly by examining doctors. Issue medications to deduct inventory automatically.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search patient, doctor, drug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E4749]/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 text-[#0E4749] rounded-lg border border-teal-200 shrink-0">
                {filteredQueue.length} Pending
              </span>
              <button
                onClick={() => loadDashboardData()}
                disabled={isLoading}
                className="p-1.5 text-gray-600 hover:text-[#0E4749] hover:bg-gray-100 rounded-lg transition border border-gray-200 bg-white"
                title="Refresh doctor prescriptions queue"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#0E4749]' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Prescription Queue List */}
        {isLoading ? (
          <div className="py-12 text-center text-sm text-[#5B6472] flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#0E4749]" /> Loading doctor prescription queue...
          </div>
        ) : filteredQueue.length === 0 ? (
          <div className="py-12 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200 p-8">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-80" />
            <h4 className="text-sm font-bold text-gray-800">No Pending Prescriptions in Queue</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
              All prescriptions sent by doctors have been dispensed. When an examining doctor submits a prescription, it will appear here instantly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredQueue.map((rx) => {
              const hasAllergy = rx.allergies && rx.allergies.toLowerCase() !== 'none' && rx.allergies.trim() !== '';
              const isMapped = rx.medicine_id !== undefined && rx.medicine_id !== null;
              const inStock = isMapped && rx.stock_qty !== undefined && rx.stock_qty > 0;

              return (
                <div
                  key={rx.rx_id}
                  className="p-4 rounded-xl border border-gray-200 bg-white hover:border-[#0E4749]/40 transition shadow-sm space-y-3"
                >
                  {/* Card Header: Patient & Prescribing Doctor */}
                  <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-bold text-gray-900 text-sm">{rx.patient_name}</span>
                        <span className="text-[11px] text-gray-400 font-mono">#PT-{rx.patient_id}</span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                        <span>Prescribed by <strong>Dr. {rx.doctor_name}</strong></span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                        Pending Dispense
                      </span>
                      {rx.prescribed_at && (
                        <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" />
                          {new Date(rx.prescribed_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Allergy Alert Banner */}
                  {hasAllergy && (
                    <div className="px-2.5 py-1 bg-red-50 border border-red-200 rounded text-[11px] text-red-800 flex items-center gap-1.5 font-medium">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>Patient Allergy Alert: <strong>{rx.allergies}</strong></span>
                    </div>
                  )}

                  {/* Medication Details */}
                  <div className="bg-gray-50/70 p-3 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-[#0E4749]" />
                        {rx.med_name}
                      </span>
                      <span className="font-semibold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded text-[11px]">
                        {rx.dosage}
                      </span>
                    </div>
                    {rx.duration && (
                      <div className="text-gray-500 text-[11px]">
                        Treatment Duration: <strong className="text-gray-700">{rx.duration}</strong>
                      </div>
                    )}
                  </div>

                  {/* Inventory Match & Dispense Action */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs">
                      <div className="text-[11px] text-gray-500">Inventory Status:</div>
                      {!isMapped ? (
                        <div className="font-semibold text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          <span>Assign Stock Drug</span>
                        </div>
                      ) : inStock ? (
                        <div className="font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{rx.stock_qty} in stock</span>
                        </div>
                      ) : (
                        <div className="font-semibold text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>Out of Stock</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenDispenseModal(rx)}
                      disabled={isMapped && !inStock}
                      className="px-3.5 py-2 bg-[#0E4749] hover:bg-[#082d2f] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>Dispense &amp; Issue</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FULL PHARMACY INVENTORY */}
      <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-[#0E4749] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#0E4749]" /> Pharmacy Medicine Inventory
            </h2>
            <p className="text-xs text-[#5B6472] mt-0.5">
              Complete inventory of all active hospital medicines, current stock, and batch expiries.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search inventory drugs..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E4749]/20"
              />
            </div>
            <Link
              href="/pharmacist/inventory"
              className="text-xs font-semibold px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-[#0E4749] rounded-lg border border-teal-200 transition flex items-center gap-1 shrink-0"
            >
              <span>Manage Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[460px] overflow-y-auto border border-gray-100 rounded-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8F9FA] text-xs font-semibold text-[#5B6472] uppercase border-b border-[#DCE3E0] sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="py-2.5 px-3">Medicine</th>
                <th className="py-2.5 px-3">Available Stock</th>
                <th className="py-2.5 px-3">Reorder Threshold</th>
                <th className="py-2.5 px-3">Batch Expiry</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE3E0]">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-gray-400">
                    No matching medicines found in inventory.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((m) => {
                  const isLow = m.stock_qty <= m.reorder_level;
                  const days = m.days_to_expiry ?? 999;
                  return (
                    <tr key={m.medicine_id} className="hover:bg-gray-50/60 transition">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-gray-900">{m.med_name}</div>
                        <div className="text-[11px] text-gray-500">{m.generic_name || '—'}</div>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-gray-800">
                        <span className={m.stock_qty <= 0 ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-emerald-700'}>
                          {m.stock_qty} units
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-gray-600">
                        {m.reorder_level} units
                      </td>
                      <td className="py-2.5 px-3 text-xs">
                        <div className="text-gray-700 font-medium">
                          {m.expiry_date ? m.expiry_date.slice(0, 10) : '—'}
                        </div>
                        {m.stock_qty <= 0 ? (
                          <span className="text-gray-400 text-[10px]">No physical stock</span>
                        ) : days < 0 ? (
                          <span className="text-red-600 font-bold text-[10px]">Expired</span>
                        ) : days <= 30 ? (
                          <span className="text-orange-600 text-[10px]">{days}d remaining</span>
                        ) : (
                          <span className="text-gray-400 text-[10px]">{days}d remaining</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          m.stock_qty <= 0
                            ? 'bg-red-100 text-red-800'
                            : days < 0
                            ? 'bg-red-100 text-red-800'
                            : isLow
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {m.stock_qty <= 0
                            ? 'Out of Stock'
                            : days < 0
                            ? 'Expired'
                            : isLow
                            ? 'Low Stock'
                            : 'Good'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DISPENSE CONFIRMATION MODAL */}
      {selectedRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden my-auto border border-gray-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#0E4749] text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <PackageCheck className="w-5 h-5" />
                  Confirm Medicine Dispensing
                </h3>
                <p className="text-teal-100 text-xs mt-0.5">
                  Verify prescription details before issuing to patient
                </p>
              </div>
              <button
                onClick={() => setSelectedRx(null)}
                className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Patient & Doctor Card */}
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl text-xs border border-gray-200">
                <div>
                  <div className="text-gray-500 uppercase font-bold text-[10px]">Patient:</div>
                  <div className="font-bold text-gray-900 text-sm mt-0.5">{selectedRx.patient_name}</div>
                  <div className="text-gray-400 text-[11px]">Patient ID: #{selectedRx.patient_id}</div>
                </div>
                <div>
                  <div className="text-gray-500 uppercase font-bold text-[10px]">Prescribing Physician:</div>
                  <div className="font-bold text-[#0E4749] text-sm mt-0.5">Dr. {selectedRx.doctor_name}</div>
                  <div className="text-gray-400 text-[11px]">Ref: Rx-{selectedRx.rx_id}</div>
                </div>
              </div>

              {/* Allergy Warning if any */}
              {selectedRx.allergies && selectedRx.allergies.toLowerCase() !== 'none' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Patient Allergy Caution</span>
                    <span>Patient is allergic to: <strong>{selectedRx.allergies}</strong>. Ensure compatibility before dispensing.</span>
                  </div>
                </div>
              )}

              {/* Prescribed Drug & Inventory Drug Selection */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Doctor&apos;s Prescribed Medicine:</div>
                    <div className="font-black text-gray-900 text-base">{selectedRx.med_name}</div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Dosage: <strong>{selectedRx.dosage}</strong>
                      {selectedRx.duration && <span> · Duration: <strong>{selectedRx.duration}</strong></span>}
                    </div>
                  </div>
                </div>

                {/* Inventory Drug Match Selector */}
                <div className="pt-2 border-t border-gray-100">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">
                    Dispensing Inventory Drug:
                  </label>
                  <select
                    value={selectedRx.medicine_id || ''}
                    onChange={(e) => {
                      const newMedId = Number(e.target.value);
                      const matched = fullInventory.find(m => m.medicine_id === newMedId);
                      if (matched) {
                        setSelectedRx({
                          ...selectedRx,
                          medicine_id: matched.medicine_id,
                          inventory_med_name: matched.med_name,
                          stock_qty: matched.stock_qty,
                          unit_price: matched.unit_price,
                        });
                      }
                    }}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 font-medium bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0E4749]/30"
                  >
                    <option value="">-- Select Inventory Medicine --</option>
                    {fullInventory.map((med) => (
                      <option key={med.medicine_id} value={med.medicine_id}>
                        {med.med_name} (In Stock: {med.stock_qty} | Rs. {Number(med.unit_price).toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-between text-xs text-gray-600 pt-1">
                  <span>Available Inventory Stock:</span>
                  <span className={`font-bold ${selectedRx.stock_qty && selectedRx.stock_qty > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {selectedRx.stock_qty ?? 0} units available
                  </span>
                </div>
              </div>

              {/* Quantity to Dispense */}
              <div className="bg-teal-50/50 border border-teal-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-800 block">Quantity to Dispense (Units):</label>
                    <span className="text-[11px] text-gray-500">Calculated from doctor&apos;s prescribed duration</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={selectedRx.stock_qty || 999}
                    value={dispenseQty}
                    onChange={(e) => setDispenseQty(parseInt(e.target.value, 10) || 1)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center font-bold text-base text-[#0E4749] bg-white focus:outline-none focus:ring-2 focus:ring-[#0E4749]"
                  />
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedRx(null)}
                className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDispense}
                disabled={isDispensing}
                className="px-5 py-2 bg-[#0E4749] hover:bg-[#082d2f] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow transition cursor-pointer"
              >
                {isDispensing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deducting Stock &amp; Dispensing…</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Dispense &amp; Deduct Stock</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
