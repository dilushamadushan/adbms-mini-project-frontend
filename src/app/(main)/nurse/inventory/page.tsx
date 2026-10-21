"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { 
  nurseService, 
  WardInventoryItem,
  WardOverviewResponse,
  DashboardStatsResponse
} from '@/services/nurseService';
import { 
  Package, Plus, RefreshCw, CheckCircle2, Clock, 
  Truck, AlertCircle, Check, Search, ShieldCheck, 
  Layers, ShoppingCart, Sparkles
} from 'lucide-react';

const COMMON_WARD_SUPPLIES = [
  { name: 'Normal Saline 0.9% IV (500ml)', defaultQty: 20, category: 'IV Fluids' },
  { name: 'IV Cannula 20G (Pink)', defaultQty: 50, category: 'Consumables' },
  { name: 'IV Cannula 22G (Blue)', defaultQty: 50, category: 'Consumables' },
  { name: 'Disposable Syringes 5ml (Box of 100)', defaultQty: 2, category: 'Consumables' },
  { name: 'Disposable Syringes 10ml (Box of 100)', defaultQty: 2, category: 'Consumables' },
  { name: 'Sterile Surgical Gloves (Size 7.5 - Box)', defaultQty: 5, category: 'PPE' },
  { name: 'Gauze Swabs Sterile (Pack of 50)', defaultQty: 10, category: 'Wound Care' },
  { name: 'Blood Collection EDTA Tubes (Pack of 50)', defaultQty: 2, category: 'Lab Supplies' },
  { name: 'Paracetamol IV Infusion (100ml)', defaultQty: 15, category: 'Medication' },
  { name: 'Ceftriaxone 1g Vials', defaultQty: 10, category: 'Medication' },
];

export default function WardInventoryPage() {
  const [requests, setRequests] = useState<WardInventoryItem[]>([]);
  const [ward, setWard] = useState<WardOverviewResponse | null>(null);
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Requested' | 'Dispatched' | 'Received'>('ALL');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reqsRes, wardRes, statsRes] = await Promise.all([
        nurseService.getWardInventoryRequests(),
        nurseService.getWardOverview().catch(() => null),
        nurseService.getDashboardStats().catch(() => null),
      ]);
      setRequests(reqsRes);
      setWard(wardRes);
      setStats(statsRes);
    } catch (err: any) {
      console.error('Failed to load inventory requests:', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to load ward inventory data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectPreset = (item: typeof COMMON_WARD_SUPPLIES[0]) => {
    setItemName(item.name);
    setQuantity(item.defaultQty);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) {
      setError('Please specify an item name or select a common consumable preset.');
      return;
    }
    if (quantity <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await nurseService.requestWardStock({
        item_name: itemName.trim(),
        quantity: Number(quantity),
      });
      setSuccessMsg(`Requisition for ${quantity}x "${itemName.trim()}" dispatched to hospital pharmacy & stores.`);
      setItemName('');
      setQuantity(10);
      await loadData();
    } catch (err: any) {
      console.error('Failed to request stock:', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to submit inventory request.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch = r.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.requested_by_nurse && r.requested_by_nurse.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchQuery, statusFilter]);

  const countRequested = requests.filter(r => r.status === 'Requested').length;
  const countDispatched = requests.filter(r => r.status === 'Dispatched').length;
  const countReceived = requests.filter(r => r.status === 'Received').length;

  return (
    <div className="space-y-6">
      <div className="bg-[#0E4749] text-white p-6 rounded-xl relative overflow-hidden shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-teal-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-[#E07856]" />
              Ward Inventory & Consumables Requisition
            </span>
            <span className="bg-teal-800/90 text-teal-100 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-teal-700/60">
              {ward?.ward_name || 'Ward Station'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Ward Stock & Medicine Refill Orders
          </h1>
          <p className="text-teal-100/90 text-sm mt-1 max-w-2xl">
            Request essential ward supplies, sterile consumables, IV solutions, and urgent medication restocks directly from the Central Medical Store and Pharmacy.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 bg-teal-800/80 hover:bg-teal-700 text-white text-xs font-semibold px-3 py-2 rounded-lg border border-teal-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setStatusFilter(statusFilter === 'Requested' ? 'ALL' : 'Requested')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            statusFilter === 'Requested'
              ? 'bg-amber-50 border-amber-400 shadow-sm'
              : 'bg-white border-[#DCE3E0] hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5B6472]">Awaiting Dispatch</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">{countRequested}</div>
          <div className="text-[11px] text-amber-600 mt-1">Pending Pharmacy Review</div>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'Dispatched' ? 'ALL' : 'Dispatched')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            statusFilter === 'Dispatched'
              ? 'bg-blue-50 border-blue-400 shadow-sm'
              : 'bg-white border-[#DCE3E0] hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5B6472]">Dispatched / In Transit</span>
            <Truck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-2">{countDispatched}</div>
          <div className="text-[11px] text-blue-600 mt-1">En route to ward</div>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'Received' ? 'ALL' : 'Received')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            statusFilter === 'Received'
              ? 'bg-emerald-50 border-emerald-400 shadow-sm'
              : 'bg-white border-[#DCE3E0] hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5B6472]">Received & Stocked</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{countReceived}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Available in ward cupboard</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-[#DCE3E0] shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#DCE3E0]">
              <ShoppingCart className="w-5 h-5 text-[#0E4749]" />
              <h2 className="text-lg font-bold text-[#0E4749]">Order Consumables / Stock</h2>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5B6472] uppercase tracking-wider mb-1.5">
                  Item Description / Medicine Name
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Normal Saline 500ml, IV Cannula 20G, Gauze"
                  className="w-full text-xs p-2.5 border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749] text-gray-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5B6472] uppercase tracking-wider mb-1.5">
                  Quantity Required
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-32 text-xs p-2.5 border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749] font-bold text-[#0E4749]"
                    required
                  />
                  <div className="flex gap-1.5">
                    {[5, 10, 25, 50].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setQuantity(q)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium ${
                          quantity === q
                            ? 'bg-teal-50 border-[#0E4749] text-[#0E4749] font-bold'
                            : 'border-[#DCE3E0] text-[#5B6472] hover:bg-gray-50'
                        }`}
                      >
                        +{q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-[#0E4749] hover:bg-[#093233] text-white py-2.5 rounded-lg text-xs font-bold transition shadow-sm disabled:opacity-50"
              >
                <Plus className="w-4 h-4 text-[#E07856]" />
                {submitting ? 'Submitting Requisition...' : 'Submit Requisition to Pharmacy / Store'}
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#DCE3E0] shadow-sm">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#DCE3E0]">
              <Sparkles className="w-4 h-4 text-[#E07856]" />
              <h3 className="text-sm font-bold text-[#0E4749]">Common Ward Consumable Presets</h3>
            </div>
            <p className="text-xs text-[#5B6472] mb-3">
              Click an item below to quickly populate the order form with standard unit quantities.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_WARD_SUPPLIES.map((sup, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(sup)}
                  className="text-left text-xs bg-[#F8FAF9] hover:bg-teal-50 border border-[#DCE3E0] hover:border-teal-300 p-2 rounded-lg text-gray-700 transition flex items-center justify-between gap-2"
                >
                  <span className="font-medium text-gray-800">{sup.name}</span>
                  <span className="text-[10px] font-bold text-teal-700 bg-white px-1.5 py-0.5 rounded border border-teal-200">
                    {sup.defaultQty}x
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-[#DCE3E0] shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#DCE3E0]">
            <div>
              <h2 className="text-lg font-bold text-[#0E4749]">Requisition Log & Status</h2>
              <p className="text-xs text-[#5B6472]">Tracking requests made for {ward?.ward_name || 'Ward'}</p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#5B6472] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search items or nurse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs border border-[#DCE3E0] rounded-lg w-full sm:w-56 focus:outline-none focus:border-[#0E4749]"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center text-xs text-[#5B6472] gap-2 items-center">
              <RefreshCw className="w-4 h-4 animate-spin text-[#0E4749]" />
              Loading inventory records...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#5B6472]">
              {searchQuery || statusFilter !== 'ALL'
                ? 'No requisition records match your filter criteria.'
                : 'No inventory requests logged yet. Use the form on the left to submit a requisition.'}
            </div>
          ) : (
            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
              {filteredRequests.map((req) => {
                let badgeClass = 'bg-amber-100 text-amber-800 border-amber-200';
                let Icon = Clock;
                if (req.status === 'Dispatched') {
                  badgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
                  Icon = Truck;
                } else if (req.status === 'Received') {
                  badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                  Icon = CheckCircle2;
                }

                return (
                  <div
                    key={req.request_id}
                    className="p-3.5 rounded-xl border border-[#DCE3E0] bg-[#F8FAF9] hover:bg-white transition flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0E4749] truncate">
                          {req.item_name}
                        </span>
                        <span className="text-xs font-semibold bg-white text-[#0E4749] px-2 py-0.5 rounded border border-[#DCE3E0]">
                          Qty: {req.quantity}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#5B6472] flex items-center gap-3">
                        <span>Requested by: <strong>{req.requested_by_nurse || 'Staff Nurse'}</strong></span>
                        <span>•</span>
                        <span>{new Date(req.created_at).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${badgeClass}`}>
                        <Icon className="w-3 h-3" />
                        {req.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
