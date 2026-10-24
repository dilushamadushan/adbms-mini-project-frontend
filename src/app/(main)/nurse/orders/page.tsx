"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ClipboardList, CheckCircle2, Clock, Check, 
  Search, RefreshCw, AlertTriangle, ArrowRight, User
} from 'lucide-react';
import { nurseService } from '@/services/nurseService';

export default function NurseDoctorOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Acknowledged' | 'Done'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await nurseService.getWardDoctorOrders();
      setOrders(data);
    } catch (err: any) {
      setToast({ type: 'error', message: err?.response?.data?.detail || 'Failed to fetch doctor orders.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: number, newStatus: 'Acknowledged' | 'Done') => {
    setActionLoading(orderId);
    try {
      await nurseService.updateDoctorOrderStatus(orderId, newStatus);
      await fetchOrders();
      setToast({ type: 'success', message: `Order #${orderId} marked as ${newStatus}.` });
      setTimeout(() => setToast(null), 3500);
    } catch (err: any) {
      setToast({ type: 'error', message: err?.response?.data?.detail || 'Failed to update order status.' });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesStatus = filterStatus === 'All' ? true : ord.status === filterStatus;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery = 
      !query ||
      (ord.patient_name && ord.patient_name.toLowerCase().includes(query)) ||
      (ord.bed_number && ord.bed_number.toLowerCase().includes(query)) ||
      (ord.instruction && ord.instruction.toLowerCase().includes(query)) ||
      (ord.order_type && ord.order_type.toLowerCase().includes(query)) ||
      (ord.doctor_name && ord.doctor_name.toLowerCase().includes(query));
    return matchesStatus && matchesQuery;
  });

  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const ackCount = orders.filter((o) => o.status === 'Acknowledged').length;
  const doneCount = orders.filter((o) => o.status === 'Done').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 p-4 rounded-xl border-2 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-red-50 border-red-300 text-red-950'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-[#0E4749]" />
            <h1 className="text-2xl font-bold text-[#0E4749] tracking-tight">Doctor Orders Management</h1>
          </div>
          <p className="text-xs text-[#5B6472] mt-1">
            Ward-wide clinical physician orders, acknowledgments, and discharge task completion.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="self-start sm:self-auto bg-white border border-[#DCE3E0] hover:bg-teal-50 text-[#0E4749] px-4 py-2 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Feed
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-[#0E4749]">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#0E4749]">{orders.length}</div>
            <div className="text-[11px] font-semibold text-[#5B6472]">Total Orders</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-amber-700">{pendingCount}</div>
            <div className="text-[11px] font-semibold text-[#5B6472]">Pending Action</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-blue-700">{ackCount}</div>
            <div className="text-[11px] font-semibold text-[#5B6472]">Acknowledged</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-700">{doneCount}</div>
            <div className="text-[11px] font-semibold text-[#5B6472]">Completed (Done)</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#DCE3E0] p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-[#F8FAF9] border border-[#DCE3E0] rounded-xl self-start">
            {(['All', 'Pending', 'Acknowledged', 'Done'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterStatus === st
                    ? 'bg-[#0E4749] text-white shadow-2xs'
                    : 'text-[#5B6472] hover:text-[#0E4749] hover:bg-gray-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient, bed, doctor..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#DCE3E0] rounded-xl focus:outline-none focus:border-[#0E4749] bg-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0E4749]" />
            <span>Loading ward doctor orders...</span>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-3">
            {filteredOrders.map((ord) => {
              const isPending = ord.status === 'Pending';
              const isAck = ord.status === 'Acknowledged';
              const isDone = ord.status === 'Done';

              return (
                <div
                  key={ord.order_id}
                  className={`p-4 rounded-xl border transition ${
                    isDone
                      ? 'bg-gray-50/60 border-gray-200 opacity-80'
                      : isPending
                      ? 'bg-amber-50/50 border-amber-300'
                      : 'bg-white border-[#DCE3E0]'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-[#0E4749]">{ord.patient_name}</span>
                        {ord.bed_number && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-[#0E4749] border border-teal-200">
                            Bed {ord.bed_number}
                          </span>
                        )}
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {ord.order_type}
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isDone ? 'bg-emerald-100 text-emerald-800' :
                          isPending ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {ord.status}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-gray-900 leading-relaxed">{ord.instruction}</p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#5B6472] pt-0.5">
                        <span>Ordered by: <strong>{ord.doctor_name || 'Physician'}</strong></span>
                        <span>•</span>
                        <span>Time: {ord.created_at}</span>
                        {ord.acknowledged_by_name && (
                          <>
                            <span>•</span>
                            <span>Ack by: {ord.acknowledged_by_name} ({ord.acknowledged_at})</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 self-end lg:self-center">
                      {isPending && (
                        <button
                          onClick={() => handleUpdateStatus(ord.order_id, 'Acknowledged')}
                          disabled={actionLoading === ord.order_id}
                          className="bg-teal-700 hover:bg-teal-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-2xs transition disabled:opacity-50"
                        >
                          Acknowledge
                        </button>
                      )}
                      {!isDone && (
                        <button
                          onClick={() => handleUpdateStatus(ord.order_id, 'Done')}
                          disabled={actionLoading === ord.order_id}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1 transition disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" /> Mark Done
                        </button>
                      )}
                      {ord.bed_number && (
                        <Link
                          href={ord.bed_id ? `/nurse/bed/${ord.bed_id}?tab=orders` : '/nurse/dashboard'}
                          className="text-xs font-semibold text-[#0E4749] hover:bg-teal-50 border border-[#DCE3E0] px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                        >
                          View Bed <ArrowRight className="w-3 h-3 text-[#E07856]" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 text-xs italic">
            No doctor orders match your search or filter.
          </div>
        )}
      </div>
    </div>
  );
}
