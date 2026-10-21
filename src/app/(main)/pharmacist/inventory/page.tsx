"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Pill, Plus, RefreshCw, Search, AlertTriangle, AlertCircle,
  CheckCircle, ArrowDownToLine, Edit3, X, Calendar, DollarSign,
  Layers, PackageCheck, Loader2, ShoppingCart, FileText, Printer, Clock
} from 'lucide-react';
import {
  pharmacyService, Medicine, MedicinePayload, StockReceiptPayload,
  PurchaseOrder, PurchaseOrderPayload
} from '@/services/pharmacyService';
import { useAuth } from '@/hooks/useAuth';
import PurchaseOrderModal from '@/components/features/pharmacist/PurchaseOrderModal';

export default function PharmacistInventory() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);
  const [isReceiveStockOpen, setIsReceiveStockOpen] = useState(false);
  const [selectedMedForStock, setSelectedMedForStock] = useState<Medicine | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Restock Purchase Order States
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [selectedMedForOrder, setSelectedMedForOrder] = useState<Medicine | null>(null);
  const [orderQuantity, setOrderQuantity] = useState<number>(100);
  const [orderSupplier, setOrderSupplier] = useState('State Pharmaceuticals Corporation');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [activePrintOrder, setActivePrintOrder] = useState<PurchaseOrder | null>(null);
  const [isOrderListModalOpen, setIsOrderListModalOpen] = useState(false);
  const [ordersList, setOrdersList] = useState<PurchaseOrder[]>([]);

  // Medicine Form fields
  const [medName, setMedName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [stockQty, setStockQty] = useState<number>(0);
  const [reorderLevel, setReorderLevel] = useState<number>(20);
  const [expiryDate, setExpiryDate] = useState('');

  // Receive Stock Form fields
  const [receiveQty, setReceiveQty] = useState<number>(50);
  const [receiveExpiry, setReceiveExpiry] = useState('');

  // Minimum 1 day lead time date string (YYYY-MM-DD)
  const tomorrowDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await pharmacyService.getInventory(
        search.trim() || undefined,
        statusFilter === 'ALL' ? undefined : statusFilter
      );
      setMedicines(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load medicine inventory.');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  const loadOrders = async () => {
    try {
      const data = await pharmacyService.getOrders();
      setOrdersList(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    loadOrders();
  }, [loadData]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingMed(null);
    setMedName('');
    setGenericName('');
    setUnitPrice(25);
    setStockQty(50);
    setReorderLevel(20);
    setExpiryDate(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setIsAddEditOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (med: Medicine) => {
    setEditingMed(med);
    setMedName(med.med_name);
    setGenericName(med.generic_name || '');
    setUnitPrice(Number(med.unit_price));
    setStockQty(med.stock_qty);
    setReorderLevel(med.reorder_level);
    setExpiryDate(med.expiry_date ? med.expiry_date.slice(0, 10) : '');
    setIsAddEditOpen(true);
  };

  // Open Receive Stock Modal
  const handleOpenReceiveStock = (med?: Medicine) => {
    if (med) {
      setSelectedMedForStock(med);
    } else if (medicines.length > 0) {
      setSelectedMedForStock(medicines[0]);
    }
    setReceiveQty(50);
    setReceiveExpiry(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setIsReceiveStockOpen(true);
  };

  // Open Create Restock Order Modal
  const handleOpenCreateOrder = (med?: Medicine) => {
    if (med) {
      setSelectedMedForOrder(med);
    } else if (medicines.length > 0) {
      setSelectedMedForOrder(medicines[0]);
    }
    setOrderQuantity(100);
    setOrderSupplier('State Pharmaceuticals Corporation');
    // Default delivery date: 3 days in the future (exceeding min 1 day)
    setExpectedDeliveryDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setOrderNotes('Routine hospital clinical restock requisition.');
    setIsCreateOrderOpen(true);
  };

  // Submit Add or Edit Medicine
  const handleSubmitMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      if (editingMed) {
        await pharmacyService.updateMedicine(editingMed.medicine_id, {
          med_name: medName,
          generic_name: genericName || undefined,
          unit_price: Number(unitPrice),
          stock_qty: Number(stockQty),
          reorder_level: Number(reorderLevel),
          expiry_date: expiryDate
        });
        setActionSuccess(`Updated ${medName} successfully!`);
      } else {
        await pharmacyService.createMedicine({
          med_name: medName,
          generic_name: genericName || undefined,
          unit_price: Number(unitPrice),
          stock_qty: Number(stockQty),
          reorder_level: Number(reorderLevel),
          expiry_date: expiryDate
        });
        setActionSuccess(`Registered ${medName} to inventory!`);
      }
      setIsAddEditOpen(false);
      loadData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to save medicine details.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  // Submit Receive Stock
  const handleSubmitReceiveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedForStock) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const staffId = (user as any)?.staff_id || 5;
      await pharmacyService.receiveStock({
        medicine_id: selectedMedForStock.medicine_id,
        quantity: Number(receiveQty),
        expiry_date: receiveExpiry,
        received_by: staffId
      });
      setActionSuccess(`Received ${receiveQty} units of ${selectedMedForStock.med_name}! Stock updated automatically.`);
      setIsReceiveStockOpen(false);
      loadData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to record stock receipt.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  // Submit Create Restock Purchase Order
  const handleSubmitPurchaseOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedForOrder) return;

    // Validate min 1 day lead time
    if (expectedDeliveryDate < tomorrowDate) {
      setError('Restock lead time requires minimum 1 day in advance. Expected delivery cannot be today.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const staffId = (user as any)?.staff_id || 5;
      const orderData = await pharmacyService.createOrder({
        supplier_name: orderSupplier,
        expected_delivery_date: expectedDeliveryDate,
        notes: orderNotes,
        items: [
          {
            medicine_id: selectedMedForOrder.medicine_id,
            requested_quantity: Number(orderQuantity)
          }
        ]
      }, staffId);

      setIsCreateOrderOpen(false);
      setActionSuccess(`Purchase Order #${orderData.order_number} generated successfully! Opening document for print/PDF.`);
      loadOrders();
      // Immediately open printable order modal with 3 signature blocks
      setActivePrintOrder(orderData);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to generate restock purchase order.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  // Open past order for print
  const handleOpenPrintOrderById = async (orderId: number) => {
    try {
      const order = await pharmacyService.getOrder(orderId);
      setActivePrintOrder(order);
    } catch (err) {
      console.error(err);
    }
  };

  // Quick stats
  const totalCount = medicines.length;
  const lowStockCount = medicines.filter(m => (m.stock_status === 'LOW_STOCK' || m.stock_qty <= m.reorder_level)).length;
  const expiredCount = medicines.filter(m => m.stock_status === 'EXPIRED').length;
  const expiringSoonCount = medicines.filter(m => m.stock_status === 'EXPIRING_SOON').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-bold text-[#0E4749] text-2xl tracking-tight flex items-center gap-2">
            <Pill className="w-7 h-7 text-[#0E4749]" /> Medicine Inventory
          </h1>
          <p className="text-sm text-[#5B6472] mt-0.5">
            Manage medications, track batch expiry, and generate printable restock orders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsOrderListModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 border border-[#DCE3E0] bg-white hover:bg-gray-50 text-[#0E4749] rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <FileText className="w-4 h-4 text-teal-700" /> View Orders & Print
          </button>

          <button
            onClick={() => handleOpenCreateOrder()}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <ShoppingCart className="w-4 h-4" /> Place Restock Order
          </button>

          <button
            onClick={() => handleOpenReceiveStock()}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm transition"
          >
            <ArrowDownToLine className="w-4 h-4" /> Receive Stock
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#0E4749] hover:bg-[#093537] text-white rounded-lg text-sm font-medium shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Add Drug
          </button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {actionSuccess && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-[#0E4749]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0E4749]">{totalCount}</div>
            <div className="text-xs text-[#5B6472]">Total Products</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">{lowStockCount}</div>
            <div className="text-xs text-[#5B6472]">Low Stock Alert</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{expiringSoonCount}</div>
            <div className="text-xs text-[#5B6472]">Expiring in 30d</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{expiredCount}</div>
            <div className="text-xs text-[#5B6472]">Expired Batches</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search medicine or generic name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#DCE3E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E4749]/20 focus:border-[#0E4749]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-[#DCE3E0] rounded-lg text-sm text-[#0E4749] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#0E4749]/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="IN_STOCK">In Stock (Good)</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="EXPIRING_SOON">Expiring Soon</option>
            <option value="EXPIRED">Expired</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>

          <button
            onClick={() => loadData()}
            className="p-2 border border-[#DCE3E0] rounded-lg hover:bg-gray-50 transition text-[#5B6472]"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-[#5B6472]">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0E4749] mb-2" />
            Loading medications...
          </div>
        ) : medicines.length === 0 ? (
          <div className="p-12 text-center text-[#5B6472]">
            <Pill className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-medium text-[#0E4749]">No medicines found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or add a new medicine.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8F9FA] border-b border-[#DCE3E0] text-xs font-semibold text-[#5B6472] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Medicine Details</th>
                  <th className="py-3 px-4">Available Stock</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Batch Expiry</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE3E0]">
                {medicines.map((med) => {
                  const isLow = med.stock_qty <= med.reorder_level;
                  const days = med.days_to_expiry ?? 999;
                  return (
                    <tr key={med.medicine_id} className="hover:bg-[#F8FDFD] transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#0E4749]">{med.med_name}</div>
                        <div className="text-xs text-gray-500">{med.generic_name || '—'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${isLow ? 'text-amber-600' : 'text-gray-800'}`}>
                            {med.stock_qty}
                          </span>
                          <span className="text-xs text-gray-400">/ reorder at {med.reorder_level}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800">
                        Rs. {Number(med.unit_price).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-gray-700">{med.expiry_date ? med.expiry_date.slice(0, 10) : '—'}</div>
                        <div className="text-xs">
                          {med.stock_qty <= 0 ? (
                            <span className="text-gray-400 italic">No physical units</span>
                          ) : days < 0 ? (
                            <span className="text-red-600 font-semibold">Expired {Math.abs(days)}d ago</span>
                          ) : days <= 30 ? (
                            <span className="text-orange-600 font-medium">{days} days remaining</span>
                          ) : (
                            <span className="text-gray-400">{days} days remaining</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {med.stock_qty <= 0 ? (
                          <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                            Out of Stock
                          </span>
                        ) : days < 0 ? (
                          <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                            Expired
                          </span>
                        ) : isLow ? (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
                            Low Stock
                          </span>
                        ) : days <= 30 ? (
                          <span className="px-2.5 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                            Expiring Soon
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Restock Order Requisition Button */}
                          <button
                            onClick={() => handleOpenCreateOrder(med)}
                            className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition"
                            title="Generate Restock Requisition (PO)"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                          {/* Receive Stock Button */}
                          <button
                            onClick={() => handleOpenReceiveStock(med)}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                            title="Direct Restock (Receive)"
                          >
                            <ArrowDownToLine className="w-4 h-4" />
                          </button>
                          {/* Edit Details Button */}
                          <button
                            onClick={() => handleOpenEdit(med)}
                            className="p-1.5 text-[#0E4749] hover:bg-teal-50 rounded-lg transition"
                            title="Edit Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create Restock Purchase Order */}
      {isCreateOrderOpen && selectedMedForOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => setIsCreateOrderOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-[#0E4749] mb-1 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-600" />
              Prepare Restock Order Requisition
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Create an official procurement order for printing and authorizations.
            </p>

            <form onSubmit={handleSubmitPurchaseOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Medication to Restock</label>
                <select
                  value={selectedMedForOrder.medicine_id}
                  onChange={(e) => {
                    const found = medicines.find(m => m.medicine_id === parseInt(e.target.value));
                    if (found) setSelectedMedForOrder(found);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  {medicines.map((m) => (
                    <option key={m.medicine_id} value={m.medicine_id}>
                      {m.med_name} (Current: {m.stock_qty} / Reorder: {m.reorder_level})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Requested Quantity (Units) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Unit Price Estimate</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 font-semibold">
                    Rs. {Number(selectedMedForOrder.unit_price).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Lead Time Notice & Expected Delivery Date */}
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <Clock className="w-4 h-4 text-amber-700" />
                  Restock Lead Time: Minimum 1 Business Day
                </div>
                <p className="text-[11px] text-amber-800">
                  Due to procurement logistics and supplier dispatch verification, delivery requires at least 24 hours.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-amber-900 mb-1">
                    Expected Delivery Date (Min. Tomorrow) *
                  </label>
                  <input
                    type="date"
                    required
                    min={tomorrowDate}
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Supplier / Requisition Channel</label>
                <input
                  type="text"
                  required
                  value={orderSupplier}
                  onChange={(e) => setOrderSupplier(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Procurement Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Urgent stock replenishment for ICU ward"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-xs font-medium text-gray-700">
                <span>Estimated Requisition Cost:</span>
                <span className="font-bold text-base text-[#0E4749]">
                  Rs. {(Number(selectedMedForOrder.unit_price) * (orderQuantity || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateOrderOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg flex items-center gap-2 shadow-sm transition"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Generate Order Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Past Orders List to Print */}
      {isOrderListModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setIsOrderListModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-[#0E4749] mb-1 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-700" /> Restock Purchase Orders History
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Select any purchase order to print or save as an authorized PDF document.
            </p>

            <div className="overflow-y-auto flex-1 border border-gray-200 rounded-xl">
              {ordersList.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">
                  No purchase orders created yet. Click &quot;Place Restock Order&quot; to generate your first order.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b text-gray-600 uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Order No</th>
                      <th className="py-2.5 px-3">Order Date</th>
                      <th className="py-2.5 px-3">Delivery Date</th>
                      <th className="py-2.5 px-3">Supplier</th>
                      <th className="py-2.5 px-3 text-right">Total Amount</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ordersList.map((ord) => (
                      <tr key={ord.order_id} className="hover:bg-teal-50/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#0E4749]">{ord.order_number}</td>
                        <td className="py-2.5 px-3 text-gray-600">{new Date(ord.order_date).toLocaleDateString()}</td>
                        <td className="py-2.5 px-3 text-gray-800 font-medium">
                          {new Date(ord.expected_delivery_date).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600 truncate max-w-[150px]">{ord.supplier_name}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                          Rs. {Number(ord.total_cost).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => {
                              setIsOrderListModalOpen(false);
                              handleOpenPrintOrderById(ord.order_id);
                            }}
                            className="px-2.5 py-1 bg-[#0E4749] hover:bg-[#082e30] text-white rounded text-xs font-semibold flex items-center gap-1 ml-auto transition"
                          >
                            <Printer className="w-3.5 h-3.5" /> Print PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Official Printable PDF Document */}
      {activePrintOrder && (
        <PurchaseOrderModal
          order={activePrintOrder}
          onClose={() => setActivePrintOrder(null)}
          onOrderRestocked={() => {
            loadData();
            loadOrders();
          }}
        />
      )}


      {/* Modal: Add or Edit Medicine */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsAddEditOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-[#0E4749] mb-1">
              {editingMed ? 'Edit Medication' : 'Register New Medication'}
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Enter pricing, batch information, and reorder threshold.
            </p>

            <form onSubmit={handleSubmitMedicine} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Medicine Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amoxicillin 500mg"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E4749]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Generic Name</label>
                <input
                  type="text"
                  placeholder="e.g. Amoxicillin Trihydrate"
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E4749]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Unit Price (Rs.) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E4749]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Reorder Level *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E4749]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Current Stock *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockQty}
                    onChange={(e) => setStockQty(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E4749]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Batch Expiry *</label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E4749]/20"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm bg-[#0E4749] hover:bg-[#093537] text-white rounded-lg flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingMed ? 'Save Changes' : 'Add Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Direct Receive Stock */}
      {isReceiveStockOpen && selectedMedForStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsReceiveStockOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-[#0E4749] mb-1 flex items-center gap-2">
              <ArrowDownToLine className="w-5 h-5 text-emerald-600" /> Restock Medication
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Recording this receipt triggers an automatic stock increment in the database.
            </p>

            <form onSubmit={handleSubmitReceiveStock} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Medication</label>
                <select
                  value={selectedMedForStock.medicine_id}
                  onChange={(e) => {
                    const found = medicines.find(m => m.medicine_id === parseInt(e.target.value));
                    if (found) setSelectedMedForStock(found);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E4749]/20"
                >
                  {medicines.map((m) => (
                    <option key={m.medicine_id} value={m.medicine_id}>
                      {m.med_name} (Current: {m.stock_qty})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Quantity Received *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={receiveQty}
                    onChange={(e) => setReceiveQty(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Batch Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={receiveExpiry}
                    onChange={(e) => setReceiveExpiry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-xs text-emerald-800">
                New calculated stock will be: <strong className="text-emerald-900">{selectedMedForStock.stock_qty + (receiveQty || 0)} units</strong>.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsReceiveStockOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Stock Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
