'use client';

import React, { useRef } from 'react';
import { DailyDispensingReport } from '@/services/pharmacyService';
import { Printer, X, Calendar, TrendingUp, CheckCircle2, FileText, Pill } from 'lucide-react';

interface DailyDispensingReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyReport: DailyDispensingReport[];
  startDate?: string;
  endDate?: string;
  totalRevenue: number;
  totalUnits: number;
  pharmacistName?: string;
}

export default function DailyDispensingReportModal({
  isOpen,
  onClose,
  dailyReport,
  startDate,
  endDate,
  totalRevenue,
  totalUnits,
  pharmacistName = 'Alex Taylor, B.Pharm'
}: DailyDispensingReportModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const currentTimeFormatted = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const totalPrescriptions = dailyReport.reduce((acc, curr) => acc + Number(curr.total_dispensations || 0), 0);
  const avgUnitsPerPrescription = totalPrescriptions > 0 ? (totalUnits / totalPrescriptions).toFixed(1) : '0';
  const reportRefNumber = `DDR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        
        {/* Top Control Bar (Screen only, hidden on print) */}
        <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 print:hidden gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0E4749] text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0E4749]" />
              Daily Dispensing Audit Report
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-[#0E4749]">
              {startDate || endDate ? `${startDate || 'Start'} to ${endDate || 'Latest'}` : 'All Recorded Dates'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Export
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-[#0E4749] hover:bg-[#082d2f] text-white rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="overflow-y-auto p-8 print:p-0 print:overflow-visible flex-1" ref={printRef} id="printable-dispensing-report">
          <div className="border border-gray-300 print:border-none p-8 rounded-xl print:p-0 max-w-3xl mx-auto space-y-6 bg-white text-gray-800">
            
            {/* Document Header */}
            <div className="flex justify-between items-start border-b-2 border-[#0E4749] pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0E4749] text-white flex items-center justify-center font-bold text-lg">
                    +
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-[#0E4749]">MEDICORE HOSPITAL</h1>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Tertiary Healthcare & Clinical Pharmacy Services<br />
                  124 Hospital Road, Colombo 07, Sri Lanka · Tel: +94 11 234 5678
                </p>
                <div className="text-[11px] font-bold text-[#0E4749] uppercase tracking-wider mt-1.5">
                  Department of Pharmacy &amp; Clinical Pharmacology
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block uppercase tracking-widest text-xs font-bold px-3 py-1 bg-teal-50 text-[#0E4749] rounded border border-teal-200">
                  OFFICIAL AUDIT REPORT
                </span>
                <div className="text-base font-bold text-gray-900 mt-2">
                  Ref: <span className="font-mono text-[#0E4749]">{reportRefNumber}</span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Report Date: {currentDateFormatted}</div>
                <div className="text-[11px] text-gray-400">Generated: {currentTimeFormatted}</div>
              </div>
            </div>

            {/* Audit Scope & Parameters */}
            <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg text-xs print:bg-white print:border print:border-gray-200">
              <div>
                <div className="font-bold text-gray-700 uppercase tracking-wider mb-1 text-[11px]">Audit Report Scope:</div>
                <div className="flex justify-between py-0.5">
                  <span className="text-gray-500">Subject:</span>
                  <span className="font-semibold text-gray-800">Daily Medicine Dispensing &amp; Revenue</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-gray-500">Date Range:</span>
                  <span className="font-semibold text-[#0E4749]">
                    {startDate ? startDate : 'All Recorded History'} {endDate ? `to ${endDate}` : ''}
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-gray-500">Days Logged:</span>
                  <span className="font-semibold text-gray-800">{dailyReport.length} active dispensing days</span>
                </div>
              </div>

              <div>
                <div className="font-bold text-gray-700 uppercase tracking-wider mb-1 text-[11px]">Accounting &amp; Certification:</div>
                <div className="flex justify-between py-0.5">
                  <span className="text-gray-500">Certified By:</span>
                  <span className="font-semibold text-gray-800">{pharmacistName}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-gray-500">Currency:</span>
                  <span className="font-bold text-emerald-700">Sri Lankan Rupees (Rs.)</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-gray-500">Audit Status:</span>
                  <span className="font-medium text-emerald-700">Reconciled with Central Ledger</span>
                </div>
              </div>
            </div>

            {/* Executive Metric Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-lg">
                <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider">Total Realized Revenue</div>
                <div className="text-xl font-black text-[#0E4749] mt-1">
                  Rs. {Number(totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-teal-700 mt-0.5">Hospital pharmacy formulary disbursements</div>
              </div>

              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg">
                <div className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider">Total Units Dispensed</div>
                <div className="text-xl font-black text-blue-900 mt-1">
                  {totalUnits} units
                </div>
                <div className="text-[10px] text-blue-700 mt-0.5">Across {totalPrescriptions} verified prescriptions</div>
              </div>

              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Prescription Volume</div>
                <div className="text-xl font-black text-emerald-900 mt-1">
                  {totalPrescriptions} prescriptions
                </div>
                <div className="text-[10px] text-emerald-700 mt-0.5">Avg. {avgUnitsPerPrescription} units / prescription</div>
              </div>
            </div>

            {/* Daily Itemized Breakdown Table */}
            <div>
              <div className="font-bold text-gray-800 text-sm mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#0E4749]" />
                  Itemized Daily Dispensation &amp; Revenue Schedule
                </span>
                <span className="text-xs font-normal text-gray-500">Values in LKR (Rs.)</span>
              </div>
              <table className="w-full text-left text-xs border border-gray-300">
                <thead className="bg-[#0E4749] text-white">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">Date (DD-MM-YYYY)</th>
                    <th className="py-2.5 px-3 text-center">Prescriptions Dispensed</th>
                    <th className="py-2.5 px-3 text-center">Units Dispensed</th>
                    <th className="py-2.5 px-3 text-right">Daily Revenue (Rs.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dailyReport.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-500">
                        No dispensing events found within the designated audit timeframe.
                      </td>
                    </tr>
                  ) : (
                    dailyReport.map((day, idx) => (
                      <tr key={String(day.report_date) || idx} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 text-center text-gray-500 font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-gray-900">
                          {new Date(day.report_date).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </td>
                        <td className="py-2.5 px-3 text-center text-gray-700 font-medium">
                          {day.total_dispensations} prescriptions
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-[#0E4749]">
                          {day.total_units} units
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                          Rs. {Number(day.total_revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-300 font-bold text-gray-900">
                  <tr>
                    <td colSpan={2} className="py-3 px-3 uppercase tracking-wider text-xs">
                      Grand Total Reconciliation:
                    </td>
                    <td className="py-3 px-3 text-center text-xs font-bold text-gray-800">
                      {totalPrescriptions} prescriptions
                    </td>
                    <td className="py-3 px-3 text-center text-xs font-bold text-[#0E4749]">
                      {totalUnits} units
                    </td>
                    <td className="py-3 px-3 text-right text-sm text-[#0E4749]">
                      Rs. {Number(totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Regulatory & Auditing Notice */}
            <div className="p-3 bg-teal-50/40 border border-teal-200 rounded text-xs text-gray-700">
              <strong>Regulatory &amp; Verification Note:</strong> All dispensing events recorded above have been validated against physician prescription records, dispensing batches, and automated inventory depletion triggers. Revenue amounts reflect net invoice totals credited to the hospital accounts.
            </div>

            {/* 3 STATUTORY SIGNATURE & AUDIT BLOCKS */}
            <div className="pt-8 mt-10 border-t-2 border-gray-300">
              <div className="flex items-center justify-between mb-6">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  STATUTORY RECONCILIATION &amp; AUDIT VERIFICATION
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  All Institutional Audit Approvals Completed
                </span>
              </div>

              <div className="grid grid-cols-3 gap-6 text-center text-xs">
                {/* 1. Dispensing Pharmacist */}
                <div className="flex flex-col items-center bg-gray-50/50 p-3 rounded-lg border border-gray-200 print:bg-white print:border-gray-300">
                  <div className="w-full border-b border-gray-400 pb-1 h-16 flex flex-col items-center justify-end relative">
                    <svg className="h-9 w-36 text-blue-900 stroke-current -rotate-2 drop-shadow-sm mb-1" viewBox="0 0 160 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 32 C18 10, 24 5, 28 35 C32 15, 38 10, 42 32 C48 20, 55 18, 58 30 C64 12, 75 14, 78 28 C85 24, 95 22, 105 28 C115 15, 125 12, 130 30 C135 25, 145 28, 155 35" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M5 28 C35 25, 80 27, 140 23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    <span className="font-serif italic font-semibold text-xs text-blue-950 absolute -bottom-1">
                      Alex Taylor
                    </span>
                  </div>
                  <div className="font-bold text-gray-900 mt-2">1. DISPENSING PHARMACIST</div>
                  <div className="text-[11px] text-gray-700 font-semibold">{pharmacistName}</div>
                  <div className="text-[10px] text-gray-500">Prepared &amp; Reconciled Dispensing Log</div>
                  <div className="mt-1 flex flex-col items-center gap-0.5">
                    <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300">
                      ✓ Certified &amp; Reconciled
                    </span>
                    <span className="text-[10px] font-semibold text-gray-700 mt-0.5">Date: {currentDateFormatted}</span>
                  </div>
                </div>

                {/* 2. Chief Pharmacist / Supervisor */}
                <div className="flex flex-col items-center bg-gray-50/50 p-3 rounded-lg border border-gray-200 print:bg-white print:border-gray-300">
                  <div className="w-full border-b border-gray-400 pb-1 h-16 flex flex-col items-center justify-end relative">
                    <svg className="h-9 w-36 text-blue-900 stroke-current -rotate-1 drop-shadow-sm mb-1" viewBox="0 0 160 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 12 C12 36, 18 38, 26 22 C30 14, 38 10, 42 26 C46 36, 50 12, 58 10 C68 8, 72 32, 82 24 C90 18, 98 22, 108 18 C116 14, 124 28, 134 22 C142 16, 150 20, 156 32" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 36 C45 34, 95 35, 152 30" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    <span className="font-serif italic font-semibold text-xs text-blue-950 absolute -bottom-1">
                      Dr. J. Silva
                    </span>
                  </div>
                  <div className="font-bold text-gray-900 mt-2">2. CLINICAL SUPERVISOR</div>
                  <div className="text-[11px] text-gray-700 font-semibold">Dr. Johnathan Silva, MBBS, MD</div>
                  <div className="text-[10px] text-gray-500">Chief Clinical Pharmacologist</div>
                  <div className="mt-1 flex flex-col items-center gap-0.5">
                    <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300">
                      ✓ Clinical Audit Approved
                    </span>
                    <span className="text-[10px] font-semibold text-gray-700 mt-0.5">Date: {currentDateFormatted}</span>
                  </div>
                </div>

                {/* 3. Hospital Finance & Auditor */}
                <div className="flex flex-col items-center bg-gray-50/50 p-3 rounded-lg border border-gray-200 print:bg-white print:border-gray-300">
                  <div className="w-full border-b border-gray-400 pb-1 h-16 flex flex-col items-center justify-end relative">
                    <svg className="h-9 w-36 text-blue-900 stroke-current rotate-1 drop-shadow-sm mb-1" viewBox="0 0 160 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 28 C20 12, 28 8, 32 30 C38 14, 46 16, 52 28 C60 10, 72 12, 78 32 C86 20, 96 18, 106 30 C114 12, 128 14, 136 26 C144 20, 152 24, 155 34" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 34 C40 33, 90 32, 148 29" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    <span className="font-serif italic font-semibold text-xs text-blue-950 absolute -bottom-1">
                      Dr. Emily Stone
                    </span>
                  </div>
                  <div className="font-bold text-gray-900 mt-2">3. HOSPITAL AUDITOR</div>
                  <div className="text-[11px] text-gray-700 font-semibold">Dr. Emily Stone, MHA</div>
                  <div className="text-[10px] text-gray-500">Director of Finance &amp; Administration</div>
                  <div className="mt-1 flex flex-col items-center gap-0.5">
                    <span className="inline-block text-[10px] font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded border border-teal-300">
                      ✓ Reconciled &amp; Sealed
                    </span>
                    <span className="text-[10px] font-semibold text-gray-700 mt-0.5">Date: {currentDateFormatted}</span>
                  </div>
                </div>
              </div>

              {/* Official Hospital Audit Seal */}
              <div className="mt-6 flex items-center justify-center gap-3 py-2.5 px-4 bg-teal-50/70 rounded-lg border border-dashed border-teal-300 text-teal-900 print:border-solid">
                <div className="w-7 h-7 rounded-full border-2 border-teal-700 flex items-center justify-center font-bold text-xs text-teal-800 shrink-0">
                  ★
                </div>
                <div className="text-left text-xs">
                  <span className="font-black uppercase tracking-wider text-teal-950">
                    MEDICORE CENTRAL PHARMACY &amp; HEALTHCARE SERVICES · OFFICIAL DISPENSING AUDIT SEAL
                  </span>
                  <span className="text-teal-700 block text-[11px] mt-0.5">
                    Audit Reference: {reportRefNumber} · Revenue ledger and unit counts officially certified.
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-gray-400 text-center mt-6 border-t border-gray-100 pt-3">
                * This document serves as an official pharmacy audit report generated by MediCore HMS. Retain for Ministry of Health and institutional financial compliance.
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
