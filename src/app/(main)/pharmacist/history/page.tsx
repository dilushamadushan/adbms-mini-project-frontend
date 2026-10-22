"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  History, Search, RefreshCw, Loader2, Pill, User, Stethoscope,
  Calendar, CheckCircle2, Coins, TrendingUp
} from 'lucide-react';
import { pharmacyService, DispensationHistoryRecord } from '@/services/pharmacyService';

export default function PharmacistHistory() {
  const [history, setHistory] = useState<DispensationHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await pharmacyService.getDispensationsHistory(100);
      setHistory(data);
    } catch {
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filteredHistory = history.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.patient_name.toLowerCase().includes(q) ||
      item.med_name.toLowerCase().includes(q) ||
      item.doctor_name.toLowerCase().includes(q) ||
      item.pharmacist_name.toLowerCase().includes(q)
    );
  });

  const totalRevenue = filteredHistory.reduce((acc, curr) => acc + Number(curr.total_revenue || 0), 0);
  const totalUnits = filteredHistory.reduce((acc, curr) => acc + Number(curr.quantity || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-bold text-[#0E4749] text-2xl tracking-tight flex items-center gap-2">
            <History className="w-7 h-7 text-[#0E4749]" /> Dispensing Audit History
          </h1>
          <p className="text-sm text-[#5B6472] mt-0.5">
            Complete audit trail of all prescription dispensations, issued quantities, and revenue.
          </p>
        </div>

        <button
          onClick={loadHistory}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 border border-[#DCE3E0] bg-white rounded-lg text-sm text-[#0E4749] font-medium hover:bg-gray-50 transition shadow-sm cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh History
        </button>
      </div>

      {/* Highlights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#5B6472] mb-1">
            <span>Total Dispensations</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{filteredHistory.length}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Recorded patient issuances</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#5B6472] mb-1">
            <span>Total Units Issued</span>
            <Pill className="w-4 h-4 text-[#0E4749]" />
          </div>
          <div className="text-2xl font-bold text-[#0E4749]">{totalUnits} units</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Deducted from pharmacy inventory</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#5B6472] mb-1">
            <span>Total Realized Revenue</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            Rs. {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">Credited to hospital formulary</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by patient, medicine, or doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E4749]/20"
            />
          </div>

          <span className="text-xs text-gray-500">
            Showing <strong>{filteredHistory.length}</strong> dispensation logs
          </span>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="py-16 text-center text-sm text-[#5B6472] flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#0E4749]" /> Loading dispensation logs...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#5B6472] bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <History className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-gray-800">No Dispensing Records Found</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {searchQuery ? 'Try clearing your search query.' : 'Prescriptions dispensed from the queue will be recorded here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-[11px] text-[#5B6472] uppercase font-bold border-b border-[#DCE3E0]">
                <tr>
                  <th className="py-3 px-3 w-14 text-center">Ref #</th>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Prescribed Medicine</th>
                  <th className="py-3 px-3 text-center">Quantity</th>
                  <th className="py-3 px-3 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Total (Rs.)</th>
                  <th className="py-3 px-4">Prescribing Doctor</th>
                  <th className="py-3 px-4">Dispensing Pharmacist</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE3E0]">
                {filteredHistory.map((item) => (
                  <tr key={item.dispense_id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3 px-3 text-center font-mono text-gray-500">
                      #{item.dispense_id}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap">
                      {new Date(item.dispensed_at).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                      <span className="text-[10px] text-gray-400 block">
                        {new Date(item.dispensed_at).toLocaleTimeString('en-US', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span>{item.patient_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#0E4749]">
                      <div className="flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 text-[#0E4749]" />
                        <span>{item.med_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-teal-800">
                      {item.quantity} units
                    </td>
                    <td className="py-3 px-3 text-right text-gray-600">
                      Rs. {Number(item.unit_price_at_sale).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-[#0E4749]">
                      Rs. {Number(item.total_revenue).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      <div className="flex items-center gap-1">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                        <span>Dr. {item.doctor_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-[11px] font-medium">
                        {item.pharmacist_name}
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
  );
}
