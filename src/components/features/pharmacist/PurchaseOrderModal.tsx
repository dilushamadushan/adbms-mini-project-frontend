"use client";

import React, { useRef } from 'react';
import { Printer, X, Download, ShieldCheck, CheckCircle2, Clock, Building2 } from 'lucide-react';
import { PurchaseOrder } from '@/services/pharmacyService';

interface PurchaseOrderModalProps {
  order: PurchaseOrder | null;
  onClose: () => void;
  onOrderRestocked?: () => void;
}

export default function PurchaseOrderModal({ order, onClose }: PurchaseOrderModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  const currentOrder = order;

  const handlePrint = () => {
    window.print();
  };

  const formattedOrderDate = new Date(currentOrder.order_date).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  const formattedDeliveryDate = new Date(currentOrder.expected_delivery_date).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  const isAlreadyReceived = currentOrder.status === 'RECEIVED';
  const isApprovedOrReceived = currentOrder.status === 'RECEIVED' || currentOrder.status === 'APPROVED' || currentOrder.status === 'ORDERED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      {/* Container */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Top Control Bar (Screen only, hidden on print) */}
        <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 print:hidden gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0E4749] text-base">Restock Order Requisition</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-[#0E4749]">
              {currentOrder.order_number}
            </span>
            {isAlreadyReceived ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Restocked
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                Awaiting Delivery
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-[#0E4749] hover:bg-[#082d2f] text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <Printer className="w-4 h-4" /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="overflow-y-auto p-8 print:p-0 print:overflow-visible flex-1" ref={printRef} id="printable-order-document">
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
              </div>

              <div className="text-right">
                <span className="inline-block uppercase tracking-widest text-xs font-bold px-3 py-1 bg-teal-50 text-[#0E4749] rounded border border-teal-200">
                  OFFICIAL PURCHASE ORDER
                </span>
                <div className="text-base font-bold text-gray-900 mt-2">
                  No: <span className="font-mono text-[#0E4749]">{currentOrder.order_number}</span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Order Date: {formattedOrderDate}</div>
              </div>
            </div>

            {/* Order Details & Supplier Info */}
            <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg text-xs print:bg-white print:border print:border-gray-200">
              <div>
                <div className="font-bold text-gray-700 uppercase tracking-wider mb-1 text-[11px]">Supplier / Vendor:</div>
                <div className="font-semibold text-gray-900 text-sm">{currentOrder.supplier_name}</div>
                <div className="text-gray-500 mt-0.5">Government Approved Pharmaceutical Supplier</div>
                <div className="text-gray-500">Ministry of Health Requisition Channel</div>
              </div>

              <div>
                <div className="font-bold text-gray-700 uppercase tracking-wider mb-1 text-[11px]">Procurement Terms:</div>
                <div className="flex justify-between py-0.5">
                  <span className="text-gray-500">Requested By:</span>
                  <span className="font-semibold text-gray-800">{currentOrder.pharmacist_name || 'Chief Pharmacist'}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-gray-500">Expected Delivery:</span>
                  <span className="font-semibold text-[#0E4749]">{formattedDeliveryDate}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-gray-500">Delivery Lead Time:</span>
                  <span className="font-medium text-emerald-700">Min. 1 Day (Std. Delivery)</span>
                </div>
              </div>
            </div>

            {/* Itemized Order Table */}
            <div>
              <div className="font-bold text-gray-800 text-sm mb-2 flex items-center justify-between">
                <span>Ordered Pharmaceutical Supplies</span>
                <span className="text-xs font-normal text-gray-500">Currency: Sri Lankan Rupees (Rs.)</span>
              </div>
              <table className="w-full text-left text-xs border border-gray-300">
                <thead className="bg-[#0E4749] text-white">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">Medicine Name & Strength</th>
                    <th className="py-2.5 px-3">Generic Name</th>
                    <th className="py-2.5 px-3 text-right">Requested Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price (Rs.)</th>
                    <th className="py-2.5 px-3 text-right">Subtotal (Rs.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(currentOrder.items || []).map((it, idx) => (
                    <tr key={it.item_id || idx} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 text-center text-gray-500 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-gray-900">{it.med_name}</td>
                      <td className="py-2.5 px-3 text-gray-500 italic">{it.generic_name || '—'}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#0E4749]">{it.requested_quantity} units</td>
                      <td className="py-2.5 px-3 text-right text-gray-700">Rs. {Math.round(Number(it.unit_price))}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-gray-900">Rs. {Number(it.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-300 font-bold text-gray-900">
                  <tr>
                    <td colSpan={5} className="py-3 px-3 text-right uppercase tracking-wider text-xs">
                      Grand Total Valuation:
                    </td>
                    <td className="py-3 px-3 text-right text-sm text-[#0E4749]">
                      Rs. {Number(currentOrder.total_cost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Special Instructions */}
            {currentOrder.notes && (
              <div className="p-3 bg-amber-50/50 border border-amber-200 rounded text-xs text-gray-700">
                <strong>Procurement & Handling Instructions:</strong> {currentOrder.notes}
              </div>
            )}

            {/* 3 OFFICIAL SIGNATURE BLOCKS */}
            <div className="pt-8 mt-10 border-t-2 border-gray-300">
              <div className="flex items-center justify-between mb-6">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  OFFICIAL AUTHORIZATIONS & STATUTORY SIGNATURES
                </div>
                {isApprovedOrReceived && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    All Statutory Approvals & Signatures Authenticated
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-6 text-center text-xs">
                {/* 1. Pharmacist */}
                <div className="flex flex-col items-center bg-gray-50/50 p-3 rounded-lg border border-gray-200 print:bg-white print:border-gray-300">
                  <div className="w-full border-b border-gray-400 pb-1 h-16 flex flex-col items-center justify-end relative">
                    {isApprovedOrReceived ? (
                      <>
                        <svg className="h-9 w-36 text-blue-900 stroke-current -rotate-2 drop-shadow-sm mb-1" viewBox="0 0 160 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 32 C18 10, 24 5, 28 35 C32 15, 38 10, 42 32 C48 20, 55 18, 58 30 C64 12, 75 14, 78 28 C85 24, 95 22, 105 28 C115 15, 125 12, 130 30 C135 25, 145 28, 155 35" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M5 28 C35 25, 80 27, 140 23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        <span className="font-serif italic font-semibold text-xs text-blue-950 absolute -bottom-1">
                          {currentOrder.pharmacist_name || 'Alex Taylor'}
                        </span>
                      </>
                    ) : (
                      <span className="font-serif italic text-sm text-gray-400">
                        {currentOrder.pharmacist_name || 'Pharmacist'}
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-gray-900 mt-2">1. PHARMACIST</div>
                  <div className="text-[11px] text-gray-700 font-semibold">{currentOrder.pharmacist_name || 'Alex Taylor'}, B.Pharm</div>
                  <div className="text-[10px] text-gray-500">Prepared & Verified Requisition</div>
                  {isApprovedOrReceived ? (
                    <div className="mt-1 flex flex-col items-center gap-0.5">
                      <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300">
                        ✓ Digitally Verified
                      </span>
                      <span className="text-[10px] font-semibold text-gray-700 mt-0.5">Date: {formattedOrderDate}</span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-gray-400 mt-1">Date: _______________</div>
                  )}
                </div>

                {/* 2. Chief Doctor */}
                <div className="flex flex-col items-center bg-gray-50/50 p-3 rounded-lg border border-gray-200 print:bg-white print:border-gray-300">
                  <div className="w-full border-b border-gray-400 pb-1 h-16 flex flex-col items-center justify-end relative">
                    {isApprovedOrReceived ? (
                      <>
                        <svg className="h-9 w-36 text-blue-900 stroke-current -rotate-1 drop-shadow-sm mb-1" viewBox="0 0 160 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 12 C12 36, 18 38, 26 22 C30 14, 38 10, 42 26 C46 36, 50 12, 58 10 C68 8, 72 32, 82 24 C90 18, 98 22, 108 18 C116 14, 124 28, 134 22 C142 16, 150 20, 156 32" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M8 36 C45 34, 95 35, 152 30" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        <span className="font-serif italic font-semibold text-xs text-blue-950 absolute -bottom-1">
                          Dr. J. Silva
                        </span>
                      </>
                    ) : (
                      <span className="font-serif italic text-xs text-gray-300">Signature</span>
                    )}
                  </div>
                  <div className="font-bold text-gray-900 mt-2">2. CHIEF DOCTOR</div>
                  <div className="text-[11px] text-gray-700 font-semibold">Dr. Johnathan Silva, MBBS, MD</div>
                  <div className="text-[10px] text-gray-500">Clinical Therapeutics Endorsement</div>
                  {isApprovedOrReceived ? (
                    <div className="mt-1 flex flex-col items-center gap-0.5">
                      <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300">
                        ✓ Clinically Approved
                      </span>
                      <span className="text-[10px] font-semibold text-gray-700 mt-0.5">Date: {formattedOrderDate}</span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-gray-400 mt-1">Date: _______________</div>
                  )}
                </div>

                {/* 3. Hospital Manager */}
                <div className="flex flex-col items-center bg-gray-50/50 p-3 rounded-lg border border-gray-200 print:bg-white print:border-gray-300">
                  <div className="w-full border-b border-gray-400 pb-1 h-16 flex flex-col items-center justify-end relative">
                    {isApprovedOrReceived ? (
                      <>
                        <svg className="h-9 w-36 text-blue-900 stroke-current rotate-1 drop-shadow-sm mb-1" viewBox="0 0 160 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15 28 C20 12, 28 8, 32 30 C38 14, 46 16, 52 28 C60 10, 72 12, 78 32 C86 20, 96 18, 106 30 C114 12, 128 14, 136 26 C144 20, 152 24, 155 34" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M12 34 C40 33, 90 32, 148 29" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        <span className="font-serif italic font-semibold text-xs text-blue-950 absolute -bottom-1">
                          Dr. Emily Stone
                        </span>
                      </>
                    ) : (
                      <span className="font-serif italic text-xs text-gray-300">Signature & Hospital Seal</span>
                    )}
                  </div>
                  <div className="font-bold text-gray-900 mt-2">3. HOSPITAL MANAGER</div>
                  <div className="text-[11px] text-gray-700 font-semibold">Dr. Emily Stone, MHA</div>
                  <div className="text-[10px] text-gray-500">Administrative Budget Authorization</div>
                  {isApprovedOrReceived ? (
                    <div className="mt-1 flex flex-col items-center gap-0.5">
                      <span className="inline-block text-[10px] font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded border border-teal-300">
                        ✓ Authorized & Sealed
                      </span>
                      <span className="text-[10px] font-semibold text-gray-700 mt-0.5">Date: {formattedOrderDate}</span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-gray-400 mt-1">Date: _______________</div>
                  )}
                </div>
              </div>

              {/* Official Hospital Seal Graphic when Approved / Received */}
              {isApprovedOrReceived && (
                <div className="mt-6 flex items-center justify-center gap-3 py-2.5 px-4 bg-teal-50/70 rounded-lg border border-dashed border-teal-300 text-teal-900 print:border-solid">
                  <div className="w-7 h-7 rounded-full border-2 border-teal-700 flex items-center justify-center font-bold text-xs text-teal-800 shrink-0">
                    ★
                  </div>
                  <div className="text-left text-xs">
                    <span className="font-black uppercase tracking-wider text-teal-950">
                      MEDICORE CENTRAL PHARMACY & HEALTHCARE SERVICES · OFFICIAL REQUISITION SEAL
                    </span>
                    <span className="text-teal-700 block text-[11px] mt-0.5">
                      Procurement Reference: {currentOrder.order_number} · All three statutory signatures authenticated and recorded.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
