"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Pill, Plus, RefreshCw, Search, AlertTriangle, AlertCircle,
  CheckCircle, ArrowDownToLine, Edit3, X, Calendar, DollarSign,
  Layers, PackageCheck, Loader2, ShoppingCart, FileText, Printer, Clock,
  History, Truck, ArrowUpRight, ShieldCheck, Lock, CheckCircle2
} from 'lucide-react';
import {
  pharmacyService, Medicine, MedicinePayload, StockReceiptPayload, StockReceiptItem,
  PurchaseOrder, PurchaseOrderPayload
} from '@/services/pharmacyService';
import { useAuth } from '@/hooks/useAuth';
import PurchaseOrderModal from '@/components/features/pharmacist/PurchaseOrderModal';

interface PendingOrderItem {
  order_id: number;
  order_number: string;
  supplier_name: string;
  order_date: string;
  expected_delivery_date: string;
  item_id?: number;
  medicine_id: number;
  med_name: string;
  generic_name?: string | null;
  requested_quantity: number;
  unit_price: number;
  current_stock: number;
}

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
  const [selectedOrderedItem, setSelectedOrderedItem] = useState<PendingOrderItem | null>(null);
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

  // Navigation Tabs & Restock History States
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'receipts'>('inventory');
  const [receiptsList, setReceiptsList] = useState<StockReceiptItem[]>([]);
  const [isLoadingReceipts, setIsLoadingReceipts] = useState<boolean>(false);
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [receiptSearch, setReceiptSearch] = useState<string>('');

  // Medicine Form fields
  const [medName, setMedName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [reorderLevel, setReorderLevel] = useState<number>(20);
  const [stockQty, setStockQty] = useState<number>(50);
  const [expiryDate, setExpiryDate] = useState('');

  // Receive Stock Form fields
  const [receiveQty, setReceiveQty] = useState<number>(50);
  const [receiveExpiry, setReceiveExpiry] = useState('');

  // Minimum 1 day lead time date string (YYYY-MM-DD)
  const minLeadTimeDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];

  // Helper: Enforce 1-day supplier transit lead time rule before an order can be confirmed/received
  const getOrderLeadStatus = (orderDateStr?: string, expectedDeliveryStr?: string) => {
    if (!orderDateStr) return { daysElapsed: 99, daysRemaining: 0, isEligible: true };
    const orderDate = new Date(orderDateStr);
    const now = new Date();
    // Compare date parts
    const orderDay = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffMs = today.getTime() - orderDay.getTime();
    const daysElapsed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, 1 - daysElapsed);
    const isDeliveryDue = expectedDeliveryStr ? new Date(expectedDeliveryStr) <= today : false;
    const isEligible = daysElapsed >= 1 || isDeliveryDue;
    return {
      daysElapsed,
      daysRemaining: isEligible ? 0 : daysRemaining,
      isEligible
    };
  };

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

  const loadReceipts = useCallback(async () => {
    setIsLoadingReceipts(true);
    try {
      const data = await pharmacyService.getStockReceipts(100);
      setReceiptsList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingReceipts(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadOrders();
    loadReceipts();
  }, [loadData, loadReceipts]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingMed(null);
    setMedName('');
    setGenericName('');
    setUnitPrice(25);
    setReorderLevel(20);
    setStockQty(50);
    setExpiryDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setIsAddEditOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (med: Medicine) => {
    setEditingMed(med);
    setMedName(med.med_name);
    setGenericName(med.generic_name || '');
    setUnitPrice(Number(med.unit_price));
    setReorderLevel(med.reorder_level);
    setStockQty(med.stock_qty);
    setExpiryDate(med.expiry_date ? med.expiry_date.slice(0, 10) : '');
    setIsAddEditOpen(true);
  };

  // Filter for ordered medicines from active/pending purchase orders awaiting restocking
  const pendingOrderedItems: PendingOrderItem[] = React.useMemo(() => {
    const list: PendingOrderItem[] = [];
    const activeOrders = ordersList.filter(o => o.status !== 'RECEIVED' && o.status !== 'CANCELLED');
    for (const ord of activeOrders) {
      if (ord.items && ord.items.length > 0) {
        for (const it of ord.items) {
          const med = medicines.find(m => m.medicine_id === it.medicine_id);
          list.push({
            order_id: ord.order_id,
            order_number: ord.order_number,
            supplier_name: ord.supplier_name,
            order_date: ord.order_date,
            expected_delivery_date: ord.expected_delivery_date,
            item_id: it.item_id,
            medicine_id: it.medicine_id,
            med_name: it.med_name || med?.med_name || `Medicine #${it.medicine_id}`,
            generic_name: it.generic_name || med?.generic_name,
            requested_quantity: it.requested_quantity,
            unit_price: Number(it.unit_price || med?.unit_price || 0),
            current_stock: med ? med.stock_qty : 0
          });
        }
      }
    }
    return list;
  }, [ordersList, medicines]);

  // Filtered Orders for the Orders Tab
  const filteredOrders = React.useMemo(() => {
    return ordersList.filter(o => {
      const matchesStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
      const q = orderSearch.toLowerCase().trim();
      const matchesSearch = !q || (
        o.order_number.toLowerCase().includes(q) ||
        o.supplier_name.toLowerCase().includes(q) ||
        (o.items && o.items.some(it => it.med_name.toLowerCase().includes(q)))
      );
      return matchesStatus && matchesSearch;
    });
  }, [ordersList, orderStatusFilter, orderSearch]);

  // Filtered Receipts for the Receipts Tab
  const filteredReceipts = React.useMemo(() => {
    const q = receiptSearch.toLowerCase().trim();
    if (!q) return receiptsList;
    return receiptsList.filter(r =>
      r.med_name.toLowerCase().includes(q) ||
      (r.generic_name && r.generic_name.toLowerCase().includes(q)) ||
      (r.received_by_name && r.received_by_name.toLowerCase().includes(q))
    );
  }, [receiptsList, receiptSearch]);

  // Open Receive Stock Modal - ONLY allows restocking from placed purchase orders
  const handleOpenReceiveStock = (med?: Medicine) => {
    setError(null);
    if (pendingOrderedItems.length === 0) {
      setSelectedOrderedItem(null);
      setIsReceiveStockOpen(true);
      return;
    }

    if (med) {
      const match = pendingOrderedItems.find(i => i.medicine_id === med.medicine_id);
      if (match) {
        setSelectedOrderedItem(match);
        setReceiveQty(match.requested_quantity);
        setReceiveExpiry(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        setIsReceiveStockOpen(true);
      } else {
        // Enforce hospital order-first rule:
        setError(`"${med.med_name}" does not have an active purchase order. Restock can only be recorded after placing an order with a supplier.`);
        handleOpenCreateOrder(med);
      }
    } else {
      setSelectedOrderedItem(pendingOrderedItems[0]);
      setReceiveQty(pendingOrderedItems[0].requested_quantity);
      setReceiveExpiry(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setIsReceiveStockOpen(true);
    }
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
    // Default delivery date: 1 day in the future (minimum 1 day lead time)
    setExpectedDeliveryDate(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setOrderNotes('Routine hospital clinical restock requisition.');
    setIsCreateOrderOpen(true);
  };

  // Submit Add or Edit Medicine
  const handleSubmitMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (expiryDate && expiryDate < todayStr) {
      setError('Batch Expiry Date cannot be a past date. Please select a valid future date.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      if (editingMed) {
        await pharmacyService.updateMedicine(editingMed.medicine_id, {
          med_name: medName,
          generic_name: genericName || undefined,
          unit_price: Number(unitPrice),
          reorder_level: Number(reorderLevel),
          stock_qty: Number(stockQty),
          expiry_date: expiryDate || undefined
        });
        setActionSuccess(`Updated ${medName} successfully!`);
      } else {
        await pharmacyService.createMedicine({
          med_name: medName,
          generic_name: genericName || undefined,
          unit_price: Number(unitPrice),
          reorder_level: Number(reorderLevel),
          stock_qty: Number(stockQty) || 0,
          expiry_date: expiryDate || undefined
        });
        setActionSuccess(`Registered ${medName} with ${stockQty || 0} units stock!`);
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
    if (!selectedOrderedItem) return;
    
    // Check 1-day transit lead time rule
    const lead = getOrderLeadStatus(selectedOrderedItem.order_date, selectedOrderedItem.expected_delivery_date);
    if (!lead.isEligible) {
      setError(`Cannot confirm stock receipt before 1 day from the order date. Shipment is still in transit from the supplier.`);
      return;
    }

    if (receiveExpiry && receiveExpiry < todayStr) {
      setError('Batch Expiry Date cannot be a past date. Please select a valid future date.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const staffId = (user as any)?.staff_id || 5;
      await pharmacyService.receiveStock({
        medicine_id: selectedOrderedItem.medicine_id,
        quantity: Number(receiveQty),
        expiry_date: receiveExpiry,
        received_by: staffId
      });

      // Mark the parent purchase order as RECEIVED upon confirmation
      if (selectedOrderedItem.order_id) {
        try {
          await pharmacyService.updateOrderStatus(selectedOrderedItem.order_id, 'RECEIVED');
          setOrdersList(prev => prev.map(o => o.order_id === selectedOrderedItem.order_id ? { ...o, status: 'RECEIVED' } : o));
        } catch (statusErr) {
          console.warn('Failed to update purchase order status:', statusErr);
        }
      }

      setActionSuccess(
        `Successfully received and restocked ${receiveQty} units of ${selectedOrderedItem.med_name} from Order #${selectedOrderedItem.order_number}!`
      );
      setIsReceiveStockOpen(false);
      await loadData();
      await loadOrders();
      await loadReceipts();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to record stock receipt.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  // Restock entire order at once if needed
  const handleRestockEntireOrder = async (orderId: number) => {
    const ord = ordersList.find(o => o.order_id === orderId);
    if (ord) {
      const lead = getOrderLeadStatus(ord.order_date, ord.expected_delivery_date);
      if (!lead.isEligible) {
        setError(`Cannot confirm restock before 1 day from the order date. Shipment is still in transit from the supplier.`);
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const staffId = (user as any)?.staff_id || 5;
      await pharmacyService.restockDeliveredOrder(orderId, staffId, receiveExpiry);
      setActionSuccess(`All items in Order #${ord?.order_number || orderId} successfully received and restocked into inventory!`);
      setIsReceiveStockOpen(false);
      await loadData();
      await loadOrders();
      await loadReceipts();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to restock order.');
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
    if (expectedDeliveryDate < minLeadTimeDate) {
      setError('Restock lead time requires minimum 1 day in advance.');
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
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-semibold shadow-sm transition cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-500/20'
                : 'border-[#DCE3E0] bg-white hover:bg-gray-50 text-gray-700'
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-amber-600" /> Restock Orders
            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
              {ordersList.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('receipts');
              if (receiptsList.length === 0) loadReceipts();
            }}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-semibold shadow-sm transition cursor-pointer ${
              activeTab === 'receipts'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-500/20'
                : 'border-[#DCE3E0] bg-white hover:bg-gray-50 text-gray-700'
            }`}
          >
            <History className="w-4 h-4 text-emerald-600" /> Restock History
            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
              {receiptsList.length}
            </span>
          </button>

          <button
            onClick={() => handleOpenCreateOrder()}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Place Restock Order
          </button>

          <button
            onClick={() => handleOpenReceiveStock()}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm transition cursor-pointer"
          >
            <ArrowDownToLine className="w-4 h-4" /> Receive Stock
            {pendingOrderedItems.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 bg-white text-emerald-800 text-[10px] font-bold rounded-full leading-none">
                {pendingOrderedItems.length}
              </span>
            )}
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setActiveTab('inventory')}
          className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm flex items-center gap-3 cursor-pointer hover:border-teal-400 transition"
        >
          <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-[#0E4749]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0E4749]">{totalCount}</div>
            <div className="text-xs text-[#5B6472]">Active Medications</div>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('orders')}
          className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm flex items-center gap-3 cursor-pointer hover:border-amber-400 transition"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">{ordersList.length}</div>
            <div className="text-xs text-[#5B6472]">
              Restock Orders ({pendingOrderedItems.length} awaiting delivery)
            </div>
          </div>
        </div>

        <div 
          onClick={() => {
            setActiveTab('receipts');
            if (receiptsList.length === 0) loadReceipts();
          }}
          className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm flex items-center gap-3 cursor-pointer hover:border-emerald-400 transition"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">{receiptsList.length}</div>
            <div className="text-xs text-[#5B6472]">Stock Receipt Batches Logged</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#DCE3E0] gap-2 pt-2 bg-white px-4 rounded-t-xl">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 pb-3.5 px-4 font-semibold text-sm border-b-2 transition cursor-pointer ${
            activeTab === 'inventory'
              ? 'border-[#0E4749] text-[#0E4749]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Layers className="w-4 h-4" /> Medication Catalog
          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 font-bold">
            {medicines.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 pb-3.5 px-4 font-semibold text-sm border-b-2 transition cursor-pointer ${
            activeTab === 'orders'
              ? 'border-[#0E4749] text-[#0E4749]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ShoppingCart className="w-4 h-4" /> Restock Purchase Orders
          <span className="px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-800 font-bold border border-amber-200">
            {ordersList.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('receipts');
            if (receiptsList.length === 0) loadReceipts();
          }}
          className={`flex items-center gap-2 pb-3.5 px-4 font-semibold text-sm border-b-2 transition cursor-pointer ${
            activeTab === 'receipts'
              ? 'border-[#0E4749] text-[#0E4749]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <History className="w-4 h-4" /> Received Stock History
          <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
            {receiptsList.length}
          </span>
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* TAB 1: ACTIVE MEDICATION INVENTORY */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'inventory' && (
        <>
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

              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-3.5 py-2 bg-[#0E4749] hover:bg-[#093537] text-white rounded-lg text-sm font-semibold shadow-sm transition ml-auto sm:ml-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Drug
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
                      const pendingRestockItem = pendingOrderedItems.find(i => i.medicine_id === med.medicine_id);
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
                            Rs. {Math.round(Number(med.unit_price))}
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
                                className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                                title="Generate Restock Requisition (PO)"
                              >
                                <ShoppingCart className="w-4 h-4" />
                              </button>
                              {/* Receive Stock Button - Only shown when restock is pending/ordered */}
                              {pendingRestockItem && (() => {
                                const lead = getOrderLeadStatus(pendingRestockItem.order_date, pendingRestockItem.expected_delivery_date);
                                if (!lead.isEligible) {
                                  return (
                                    <span
                                      className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-300/80 rounded-full shadow-2xs"
                                      title={`Requisition placed on ${new Date(pendingRestockItem.order_date).toLocaleDateString()}. En route with supplier (1-day lead time window).`}
                                    >
                                      <Truck className="w-3 h-3 text-amber-600 animate-pulse" /> In Transit
                                    </span>
                                  );
                                }
                                return (
                                  <button
                                    onClick={() => handleOpenReceiveStock(med)}
                                    className="p-1.5 text-emerald-700 hover:bg-emerald-100 bg-emerald-50 rounded-lg transition cursor-pointer"
                                    title={`Receive Arrived Restock (${pendingRestockItem.requested_quantity} units - PO: ${pendingRestockItem.order_number})`}
                                  >
                                    <ArrowDownToLine className="w-4 h-4" />
                                  </button>
                                );
                              })()}
                              {/* Edit Details Button */}
                              <button
                                onClick={() => handleOpenEdit(med)}
                                className="p-1.5 text-[#0E4749] hover:bg-teal-50 rounded-lg transition cursor-pointer"
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
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 2: RESTOCK PURCHASE ORDERS HISTORY */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Orders Filter & Controls */}
          <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search PO #, supplier, or medicine..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-[#DCE3E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E4749]/20"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3 py-2 border border-[#DCE3E0] rounded-lg text-sm text-[#0E4749] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#0E4749]/20"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING_APPROVAL">Awaiting Delivery</option>
                <option value="ORDERED">In Transit</option>
                <option value="RECEIVED">Received & In-Stock</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <button
                onClick={() => loadOrders()}
                className="p-2 border border-[#DCE3E0] rounded-lg hover:bg-gray-50 transition text-[#5B6472] cursor-pointer"
                title="Refresh Orders"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleOpenCreateOrder()}
                className="flex items-center gap-2 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold shadow-sm transition ml-auto sm:ml-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Place Restock Order
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm overflow-hidden">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-[#5B6472]">
                <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="font-medium text-[#0E4749]">No purchase orders found</p>
                <p className="text-xs text-gray-400 mt-1">
                  Click &quot;Place Restock Order&quot; to requisition new medicine stock from a supplier.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F9FA] border-b text-gray-600 uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Order Number</th>
                      <th className="py-3 px-4">Ordered Medicines</th>
                      <th className="py-3 px-4">Order Date</th>
                      <th className="py-3 px-4">Expected Delivery</th>
                      <th className="py-3 px-4">Supplier</th>
                      <th className="py-3 px-4 text-right">Total Cost</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.order_id} className="hover:bg-teal-50/30 transition">
                        <td className="py-3 px-4 font-mono font-bold text-[#0E4749] whitespace-nowrap">
                          {ord.order_number}
                        </td>
                        <td className="py-3 px-4">
                          {ord.items && ord.items.length > 0 ? (
                            <div className="space-y-1">
                              {ord.items.map((it, idx) => (
                                <div key={idx} className="flex items-center gap-1.5">
                                  <Pill className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                                  <span className="font-semibold text-gray-900">{it.med_name}</span>
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-teal-50 text-teal-800 rounded border border-teal-200/60 whitespace-nowrap">
                                    {it.requested_quantity} units
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">No medicines listed</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                          {new Date(ord.order_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-gray-800 font-medium whitespace-nowrap">
                          {new Date(ord.expected_delivery_date).toLocaleDateString()}
                          {ord.lead_time_days != null && (
                            <span className="ml-1 text-[10px] text-gray-400">({ord.lead_time_days}d lead)</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600 truncate max-w-[150px]" title={ord.supplier_name}>
                          {ord.supplier_name}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-gray-900 whitespace-nowrap">
                          Rs. {Math.round(Number(ord.total_cost))}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            ord.status === 'RECEIVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-800'
                              : ord.status === 'ORDERED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.status === 'RECEIVED'
                              ? 'Received'
                              : ord.status === 'CANCELLED'
                              ? 'Cancelled'
                              : ord.status === 'ORDERED'
                              ? 'In Transit'
                              : 'Awaiting Delivery'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {ord.status !== 'RECEIVED' && ord.status !== 'CANCELLED' && (() => {
                              const lead = getOrderLeadStatus(ord.order_date, ord.expected_delivery_date);
                              if (!lead.isEligible) {
                                return (
                                  <span
                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-full text-[11px] font-bold shadow-2xs whitespace-nowrap"
                                    title={`Requisition placed on ${new Date(ord.order_date).toLocaleDateString()}. En route with supplier under statutory 1-day transit protocol.`}
                                  >
                                    <Truck className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> In Transit (1d Window)
                                  </span>
                                );
                              }
                              return (
                                <button
                                  onClick={() => {
                                    const med = medicines.find(m => m.medicine_id === ord.items?.[0]?.medicine_id);
                                    handleOpenReceiveStock(med);
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                                  title="Receive and restock order into active inventory"
                                >
                                  <ArrowDownToLine className="w-3.5 h-3.5" /> Receive
                                </button>
                              );
                            })()}
                            <button
                              onClick={() => handleOpenPrintOrderById(ord.order_id)}
                              className="px-2.5 py-1 bg-[#0E4749] hover:bg-[#082e30] text-white rounded text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                              title="Print official requisition document"
                            >
                              <Printer className="w-3.5 h-3.5" /> Print PDF
                            </button>
                          </div>
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

      {/* ------------------------------------------------------------------ */}
      {/* TAB 3: RECEIVED STOCK HISTORY LOG */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'receipts' && (
        <div className="space-y-4">
          {/* Receipts Filter & Controls */}
          <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search medicine or received by..."
                value={receiptSearch}
                onChange={(e) => setReceiptSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-[#DCE3E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E4749]/20"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="text-xs text-gray-500 font-medium">
                Total Restocked Units: <strong className="text-emerald-700 font-bold">{receiptsList.reduce((acc, r) => acc + Number(r.quantity || 0), 0)} units</strong>
              </div>

              <button
                onClick={() => loadReceipts()}
                disabled={isLoadingReceipts}
                className="flex items-center gap-1.5 px-3 py-2 border border-[#DCE3E0] rounded-lg hover:bg-gray-50 transition text-[#5B6472] text-xs font-semibold cursor-pointer"
                title="Refresh Receipts"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingReceipts ? 'animate-spin' : ''}`} /> Refresh
              </button>

              <button
                onClick={() => handleOpenReceiveStock()}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition ml-auto sm:ml-1 cursor-pointer"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" /> Record Stock Receipt
              </button>
            </div>
          </div>

          {/* Receipts Table */}
          <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm overflow-hidden">
            {isLoadingReceipts ? (
              <div className="p-12 text-center text-[#5B6472]">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0E4749] mb-2" />
                Loading stock receipt history...
              </div>
            ) : filteredReceipts.length === 0 ? (
              <div className="p-12 text-center text-[#5B6472]">
                <History className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="font-medium text-[#0E4749]">No stock receipts logged yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Deliveries received from suppliers will be automatically audited and recorded here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F9FA] border-b text-gray-600 uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Receipt ID</th>
                      <th className="py-3 px-4">Medicine Details</th>
                      <th className="py-3 px-4">Restocked Quantity</th>
                      <th className="py-3 px-4">Batch Expiry Date</th>
                      <th className="py-3 px-4">Received By (Staff)</th>
                      <th className="py-3 px-4 text-right">Received Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredReceipts.map((rcpt) => (
                      <tr key={rcpt.receipt_id} className="hover:bg-emerald-50/20 transition">
                        <td className="py-3 px-4 font-mono font-bold text-gray-700 whitespace-nowrap">
                          #SR-{rcpt.receipt_id}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center text-teal-800 shrink-0">
                              <Pill className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-[#0E4749]">{rcpt.med_name}</div>
                              <div className="text-[11px] text-gray-500">{rcpt.generic_name || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                            <ArrowDownToLine className="w-3 h-3" /> +{rcpt.quantity} units
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-800">
                            {rcpt.expiry_date ? String(rcpt.expiry_date).slice(0, 10) : '—'}
                          </div>
                          <div className="text-[10px] text-gray-400">Restocked batch expiration</div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-medium text-gray-700">
                          {rcpt.received_by_name || `Staff #${rcpt.received_by}`}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600 whitespace-nowrap">
                          <div className="font-medium">
                            {rcpt.received_at ? new Date(rcpt.received_at).toLocaleDateString() : '—'}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {rcpt.received_at ? new Date(rcpt.received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </div>
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
                    Rs. {Math.round(Number(selectedMedForOrder.unit_price))}
                  </div>
                </div>
              </div>

              {/* Lead Time Notice & Expected Delivery Date */}
              <div className="bg-amber-50/80 border border-amber-200 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <Clock className="w-4 h-4 text-amber-700" />
                  Restock Lead Time: Minimum 1 Day (Supplier Transit & Inspection)
                </div>
                <p className="text-[11px] text-amber-800">
                  In compliance with hospital clinical procurement policies, restock orders require a minimum 1-day lead time.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-amber-900 mb-1">
                    Expected Delivery Date (Min. 1 Day) *
                  </label>
                  <input
                    type="date"
                    required
                    min={minLeadTimeDate}
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
                  Rs. {Math.round(Number(selectedMedForOrder.unit_price) * (orderQuantity || 0)).toLocaleString()}
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6 relative max-h-[85vh] flex flex-col">
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
                      <th className="py-2.5 px-3">Ordered Medicine</th>
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
                        <td className="py-2.5 px-3 font-mono font-bold text-[#0E4749] whitespace-nowrap">{ord.order_number}</td>
                        <td className="py-2.5 px-3">
                          {ord.items && ord.items.length > 0 ? (
                            <div className="space-y-1">
                              {ord.items.map((it, idx) => (
                                <div key={idx} className="flex items-center gap-1.5">
                                  <Pill className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                                  <span className="font-semibold text-gray-900">{it.med_name}</span>
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-teal-50 text-teal-800 rounded border border-teal-200/60 whitespace-nowrap">
                                    {it.requested_quantity} units
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">No medicines listed</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600 whitespace-nowrap">{new Date(ord.order_date).toLocaleDateString()}</td>
                        <td className="py-2.5 px-3 text-gray-800 font-medium whitespace-nowrap">
                          {new Date(ord.expected_delivery_date).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600 truncate max-w-[140px]" title={ord.supplier_name}>{ord.supplier_name}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-gray-900 whitespace-nowrap">
                          Rs. {Math.round(Number(ord.total_cost))}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.status === 'RECEIVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-800'
                              : ord.status === 'ORDERED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.status === 'RECEIVED'
                              ? 'Received'
                              : ord.status === 'CANCELLED'
                              ? 'Cancelled'
                              : ord.status === 'ORDERED'
                              ? 'In Transit'
                              : 'Awaiting Delivery'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
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
              Enter medicine name, pricing, and reorder threshold.
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
                    step="1"
                    min="1"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Math.round(parseFloat(e.target.value) || 0))}
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">Current Stock (Units) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockQty}
                    onChange={(e) => setStockQty(parseInt(e.target.value) || 0)}
                    placeholder="e.g. 50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0E4749]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Batch Expiry Date (Optional)</label>
                  <input
                    type="date"
                    min={todayStr}
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

      {/* Modal: Receive Stock - Strictly for Ordered Medications */}
      {isReceiveStockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => setIsReceiveStockOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            {pendingOrderedItems.length === 0 || !selectedOrderedItem ? (
              /* Empty state: No pending restock orders */
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-[#0E4749]">
                  No Pending Restock Orders
                </h2>
                <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                  Stock can only be received for medicines that have been ordered from a supplier through an official Restock Purchase Order. Currently, there are no active orders awaiting delivery.
                </p>
                <div className="flex justify-center gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setIsReceiveStockOpen(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsReceiveStockOpen(false);
                      handleOpenCreateOrder();
                    }}
                    className="px-4 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg flex items-center gap-2 shadow-sm transition"
                  >
                    <ShoppingCart className="w-4 h-4" /> Place Restock Order
                  </button>
                </div>
              </div>
            ) : (
              /* Form state: Select from ordered items only */
              <>
                <h2 className="text-lg font-bold text-[#0E4749] mb-1 flex items-center gap-2">
                  <ArrowDownToLine className="w-5 h-5 text-emerald-600" /> Restock Ordered Medication
                </h2>
                <p className="text-xs text-gray-500 mb-4">
                  Select medication received from an approved purchase order to record stock receipt.
                </p>

                <form onSubmit={handleSubmitReceiveStock} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Ordered Medication from Supplier *
                    </label>
                    <select
                      value={`${selectedOrderedItem.order_id}-${selectedOrderedItem.medicine_id}`}
                      onChange={(e) => {
                        const [oId, mId] = e.target.value.split('-').map(Number);
                        const found = pendingOrderedItems.find(i => i.order_id === oId && i.medicine_id === mId);
                        if (found) {
                          setSelectedOrderedItem(found);
                          setReceiveQty(found.requested_quantity);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {pendingOrderedItems.map((item) => (
                        <option
                          key={`${item.order_id}-${item.medicine_id}`}
                          value={`${item.order_id}-${item.medicine_id}`}
                        >
                          {item.order_number}: {item.med_name} (Ordered: {item.requested_quantity} units)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Order Context Pill */}
                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs space-y-1">
                    <div className="flex justify-between items-center text-[#0E4749] font-bold">
                      <span>Order: {selectedOrderedItem.order_number}</span>
                      <span className="font-mono bg-teal-100 text-teal-800 px-2 py-0.5 rounded text-[11px]">
                        Expected: {new Date(selectedOrderedItem.expected_delivery_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-teal-900 text-[11px]">
                      Supplier: <strong>{selectedOrderedItem.supplier_name}</strong>
                    </div>
                    <div className="text-teal-800 text-[11px]">
                      Ordered: <strong>{selectedOrderedItem.requested_quantity} units</strong> • Current In-Stock: <strong>{selectedOrderedItem.current_stock} units</strong>
                    </div>
                  </div>

                  {/* 1-Day Transit Lead Time Warning Banner */}
                  {(() => {
                    const lead = getOrderLeadStatus(selectedOrderedItem.order_date, selectedOrderedItem.expected_delivery_date);
                    if (!lead.isEligible) {
                      return (
                        <div className="bg-amber-50 border border-amber-300 rounded-xl px-3.5 py-2.5 text-xs text-amber-900 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="font-bold text-amber-900">
                            Shipment Still In Transit ({lead.daysRemaining} {lead.daysRemaining === 1 ? 'day' : 'days'} remaining)
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Quantity Received *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={receiveQty}
                        onChange={(e) => setReceiveQty(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <p className="text-[10px] text-gray-500 mt-0.5">Delivered units from supplier</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Batch Expiry Date *</label>
                      <input
                        type="date"
                        required
                        min={todayStr}
                        value={receiveExpiry}
                        onChange={(e) => setReceiveExpiry(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <p className="text-[10px] text-gray-500 mt-0.5">Package expiration date</p>
                    </div>
                  </div>

                  {/* Calculated Stock Banner */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex justify-between items-center">
                    <span>New calculated stock:</span>
                    <span className="font-bold text-sm text-emerald-800">
                      {selectedOrderedItem.current_stock + (receiveQty || 0)} units
                      <span className="text-[11px] font-normal text-emerald-700 ml-1">
                        ({selectedOrderedItem.current_stock} + {receiveQty || 0})
                      </span>
                    </span>
                  </div>

                  {/* Fast Restock Entire Order Button if order has multiple items */}
                  {(() => {
                    const parentOrder = ordersList.find(o => o.order_id === selectedOrderedItem.order_id);
                    const lead = getOrderLeadStatus(selectedOrderedItem.order_date, selectedOrderedItem.expected_delivery_date);
                    if (parentOrder && parentOrder.items && parentOrder.items.length > 1) {
                      return (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 flex items-center justify-between text-xs">
                          <span className="text-gray-600 font-medium">
                            Order contains <strong>{parentOrder.items.length} items</strong>
                          </span>
                          <button
                            type="button"
                            disabled={isSubmitting || !lead.isEligible}
                            onClick={() => handleRestockEntireOrder(selectedOrderedItem.order_id)}
                            className={`px-2.5 py-1 text-white rounded font-semibold text-[11px] transition flex items-center gap-1 ${
                              !lead.isEligible
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-emerald-700 hover:bg-emerald-800 cursor-pointer'
                            }`}
                          >
                            <PackageCheck className="w-3.5 h-3.5" /> Restock Entire Order ({parentOrder.items.length})
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="flex justify-end gap-2 pt-3 border-t">
                    <button
                      type="button"
                      onClick={() => setIsReceiveStockOpen(false)}
                      className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    {(() => {
                      const lead = getOrderLeadStatus(selectedOrderedItem.order_date, selectedOrderedItem.expected_delivery_date);
                      return (
                        <button
                          type="submit"
                          disabled={isSubmitting || !lead.isEligible}
                          className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 shadow-sm transition ${
                            !lead.isEligible
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                          }`}
                        >
                          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                          {!lead.isEligible ? `In Transit (${lead.daysRemaining}d remaining)` : 'Confirm Stock Receipt'}
                        </button>
                      );
                    })()}
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
