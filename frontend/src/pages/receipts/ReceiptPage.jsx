import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle2,
  Printer,
  XCircle,
  Plus,
  Trash2,
  Calendar,
  User,
  Building2,
  FileText,
  Clock,
  ArrowRight,
  ArrowLeft,
  Truck,
  RotateCcw,
  Save,
  Copy,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
  Info,
  Cpu,
  ListOrdered
} from 'lucide-react';
import { receiptApi, supplierApi, warehouseApi, productApi } from '../../services/api';
import AddProductModal from './AddProductModal';
import SupplierModal from './SupplierModal';
import PrintReceiptModal from './PrintReceiptModal';
import ReceiptsListView from './ReceiptsListView';
import Navbar from '../../components/Navbar';

export default function ReceiptPage() {
  const [receiptsList, setReceiptsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('list'); // 'list' (default land) | 'detail'
  
  const [receipt, setReceipt] = useState({
    id: null,
    internalNumber: 'WH/IN/001',
    status: 'draft',
    movementStatus: 'creation',
    from: '',
    to: 'Central Stock Room',
    contact: '',
    sellerBillNumber: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    responsible: 'Rohit Maurya',
    sourceDocument: '',
    warehouseLocation: 'Central Stock Room',
    notes: '',
    moNumber: '',
    supplier: null,
    warehouse: null,
    taxRate: 18,
    items: []
  });

  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Fetch receipts and master records
  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const [resReceipts, resSuppliers, resWarehouses] = await Promise.all([
        receiptApi.getAll().catch(() => ({ data: [] })),
        supplierApi.getAll().catch(() => ({ data: [] })),
        warehouseApi.getAll().catch(() => ({ data: [] }))
      ]);

      const formatted = (resReceipts.data || []).map((r) => ({
        id: r.id,
        internalNumber: r.reference,
        reference: r.reference,
        status: r.status || 'draft',
        movementStatus: r.status === 'done' ? 'received' : r.status === 'ready' ? 'arrived' : r.status === 'in_progress' ? 'moving' : 'creation',
        from: r.receiveFrom || (r.supplier ? r.supplier.name : 'Vendor / Supplier'),
        to: r.warehouse ? r.warehouse.name : 'Central Stock Room',
        contact: r.supplier ? `${r.supplier.contactPerson || ''} (${r.supplier.phone || ''})` : r.responsible,
        sellerBillNumber: r.sellerBillNumber || '',
        scheduledDate: r.scheduledDate || '',
        responsible: r.responsible || 'Rohit Maurya',
        sourceDocument: r.sourceDocument || '',
        warehouseLocation: r.warehouse ? r.warehouse.name : 'Central Stock Room',
        notes: r.internalNotes || '',
        moNumber: r.moNumber || '',
        supplier: r.supplier,
        warehouse: r.warehouse,
        taxRate: r.taxRate || 18,
        taxAmount: r.taxAmount || 0,
        subtotal: r.subtotal || 0,
        totalAmount: r.totalAmount || 0,
        items: (r.items || []).map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.name,
          name: item.name,
          sku: item.sku || '',
          qty: item.quantity,
          quantity: item.quantity,
          receivedQty: item.receivedQty || 0,
          cost: item.unitCost,
          unitCost: item.unitCost,
          totalPrice: item.totalPrice,
          unit: item.unit || 'Units'
        }))
      }));

      setReceiptsList(formatted);
      setSuppliers(resSuppliers.data || []);
      setWarehouses(resWarehouses.data || []);
    } catch (err) {
      console.error('Failed to load receipts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  // Financial calculations
  const subtotal = useMemo(() => {
    return (receipt.items || []).reduce((acc, item) => acc + (parseFloat(item.totalPrice) || (parseFloat(item.qty || item.quantity || 0) * parseFloat(item.cost || item.unitCost || 0))), 0);
  }, [receipt.items]);

  const taxAmount = useMemo(() => {
    return (subtotal * (receipt.taxRate || 0)) / 100;
  }, [subtotal, receipt.taxRate]);

  const grandTotal = useMemo(() => {
    return subtotal + taxAmount;
  }, [subtotal, taxAmount]);

  const totalUnits = useMemo(() => {
    return (receipt.items || []).reduce((acc, item) => acc + (parseFloat(item.qty || item.quantity) || 0), 0);
  }, [receipt.items]);

  // Stage updates
  const handleStatusChange = async (newStatus) => {
    const updated = {
      ...receipt,
      status: newStatus,
      movementStatus:
        newStatus === 'draft'
          ? 'creation'
          : newStatus === 'ready'
          ? 'arrived'
          : newStatus === 'done'
          ? 'received'
          : receipt.movementStatus
    };
    setReceipt(updated);
    setReceiptsList((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));

    if (receipt.id) {
      try {
        await receiptApi.update(receipt.id, { status: newStatus });
      } catch (e) {
        console.warn('Failed to persist status change:', e);
      }
    }
    showToast(`Receipt stage updated to ${newStatus.toUpperCase()}`);
  };

  const handleMovementStatusChange = (newMovementStatus) => {
    let correspondingStatus = receipt.status;
    if (newMovementStatus === 'creation') correspondingStatus = 'draft';
    else if (newMovementStatus === 'moving' || newMovementStatus === 'not_received') correspondingStatus = 'in_progress';
    else if (newMovementStatus === 'arrived') correspondingStatus = 'ready';
    else if (newMovementStatus === 'received') correspondingStatus = 'done';

    const updated = {
      ...receipt,
      movementStatus: newMovementStatus,
      status: correspondingStatus
    };
    setReceipt(updated);
    setReceiptsList((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    showToast(`Movement tracking updated: ${newMovementStatus.replace('_', ' ')}`);
  };

  // Top action handlers
  const handleValidate = async () => {
    if (!receipt.items || receipt.items.length === 0) {
      showToast('Please add at least one product before validating!', 'error');
      return;
    }

    try {
      if (receipt.isNew || !receipt.id) {
        // Save first then validate
        const payload = {
          status: 'done',
          scheduledDate: receipt.scheduledDate,
          receiveFrom: receipt.from || receipt.supplier?.name || 'Vendor',
          responsible: receipt.responsible,
          sellerBillNumber: receipt.sellerBillNumber,
          internalNotes: receipt.notes,
          subtotal,
          taxRate: receipt.taxRate,
          taxAmount,
          totalAmount: grandTotal,
          supplierId: receipt.supplier?.id || null,
          warehouseId: receipt.warehouse?.id || null,
          moNumber: receipt.moNumber || null,
          items: receipt.items.map((i) => ({
            productId: i.productId || null,
            name: i.productName || i.name,
            sku: i.sku || null,
            quantity: parseFloat(i.qty || i.quantity) || 1,
            unitCost: parseFloat(i.cost || i.unitCost) || 0,
            totalPrice: parseFloat(i.totalPrice) || 0,
            unit: i.unit || 'Units'
          }))
        };
        const created = await receiptApi.create(payload);
        const valRes = await receiptApi.validate(created.data.id);
        showToast(`Receipt ${valRes.data.reference} validated & stock increased!`, 'success');
        await fetchReceipts();
        setCurrentView('list');
      } else {
        const valRes = await receiptApi.validate(receipt.id);
        const updated = { ...receipt, status: 'done', movementStatus: 'received' };
        setReceipt(updated);
        showToast(`Receipt ${valRes.data.reference} validated & inventory updated successfully!`, 'success');
        await fetchReceipts();
      }
    } catch (err) {
      showToast(err.message || 'Validation failed', 'error');
    }
  };

  const handleSaveReceipt = async () => {
    try {
      const payload = {
        status: receipt.status || 'draft',
        scheduledDate: receipt.scheduledDate,
        receiveFrom: receipt.from || receipt.supplier?.name || 'Vendor',
        responsible: receipt.responsible || 'Rohit Maurya',
        sellerBillNumber: receipt.sellerBillNumber,
        internalNotes: receipt.notes,
        subtotal,
        taxRate: receipt.taxRate,
        taxAmount,
        totalAmount: grandTotal,
        supplierId: receipt.supplier?.id || null,
        warehouseId: receipt.warehouse?.id || null,
        moNumber: receipt.moNumber || null,
        items: receipt.items.map((i) => ({
          productId: i.productId || null,
          name: i.productName || i.name,
          sku: i.sku || null,
          quantity: parseFloat(i.qty || i.quantity) || 1,
          unitCost: parseFloat(i.cost || i.unitCost) || 0,
          totalPrice: parseFloat(i.totalPrice) || 0,
          unit: i.unit || 'Units'
        }))
      };

      if (receipt.isNew || !receipt.id) {
        const res = await receiptApi.create(payload);
        showToast(`Receipt ${res.data.reference} saved successfully!`);
        await fetchReceipts();
        setCurrentView('list');
      } else {
        await receiptApi.update(receipt.id, payload);
        showToast(`Receipt ${receipt.internalNumber} updated successfully!`);
        await fetchReceipts();
      }
    } catch (err) {
      showToast(err.message || 'Failed to save receipt', 'error');
    }
  };

  const handleDeleteReceipt = async (id, ref) => {
    if (window.confirm(`Are you sure you want to delete receipt ${ref}?`)) {
      try {
        await receiptApi.delete(id);
        showToast(`Receipt ${ref} deleted successfully`);
        await fetchReceipts();
        if (receipt.id === id) {
          setCurrentView('list');
        }
      } catch (err) {
        showToast(err.message || 'Failed to delete receipt', 'error');
      }
    }
  };

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  const handleCancelReceipt = async () => {
    if (window.confirm('Are you sure you want to cancel this receipt?')) {
      const updated = {
        ...receipt,
        status: 'cancelled'
      };
      setReceipt(updated);
      setReceiptsList((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      if (receipt.id) {
        try {
          await receiptApi.update(receipt.id, { status: 'cancelled' });
        } catch (e) {
          console.warn(e);
        }
      }
      showToast(`Receipt ${receipt.internalNumber} marked as Cancelled`, 'info');
    }
  };

  // Open detail view for a selected receipt
  const handleSelectReceipt = (selected) => {
    setReceipt({ ...selected, isNew: false });
    setCurrentView('detail');
  };

  // Create new receipt draft
  const handleCreateNewReceipt = () => {
    const nextNumeric = receiptsList.length + 1;
    const nextRef = `WH/IN/${String(nextNumeric).padStart(3, '0')}`;

    const newRec = {
      id: null,
      isNew: true,
      internalNumber: nextRef,
      reference: nextRef,
      from: suppliers[0]?.name || 'Supplier / Vendor',
      to: warehouses[0]?.name || 'Central Stock Room',
      contact: suppliers[0] ? `${suppliers[0].contactPerson || ''} (${suppliers[0].phone || ''})` : 'Rohit Maurya',
      sellerBillNumber: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      responsible: 'Rohit Maurya',
      status: 'draft',
      movementStatus: 'creation',
      sourceDocument: '',
      warehouseLocation: warehouses[0]?.name || 'Central Stock Room',
      notes: '',
      moNumber: '',
      supplier: suppliers[0] || null,
      warehouse: warehouses[0] || null,
      taxRate: 18,
      items: []
    };

    setReceipt(newRec);
    setCurrentView('detail');
    showToast(`Draft receipt ${nextRef} initialized`);
  };

  // Item modifications
  const handleAddProduct = (newProduct) => {
    const qty = parseFloat(newProduct.qty) || 1;
    const cost = parseFloat(newProduct.cost) || 0;
    const item = {
      id: `temp-${Date.now()}`,
      productId: newProduct.productId || null,
      productName: newProduct.productName,
      name: newProduct.productName,
      sku: newProduct.sku || '',
      qty,
      quantity: qty,
      cost,
      unitCost: cost,
      totalPrice: qty * cost,
      unit: newProduct.unit || 'Units'
    };

    const updated = {
      ...receipt,
      items: [...(receipt.items || []), item]
    };
    setReceipt(updated);
    showToast(`Added ${newProduct.productName} to receipt`);
  };

  const handleRemoveProduct = (itemId) => {
    const updated = {
      ...receipt,
      items: (receipt.items || []).filter((item) => item.id !== itemId)
    };
    setReceipt(updated);
    showToast('Product item removed from receipt', 'info');
  };

  const handleItemFieldChange = (itemId, field, value) => {
    const updatedItems = (receipt.items || []).map((item) => {
      if (item.id === itemId) {
        const up = { ...item, [field]: value };
        if (field === 'cost' || field === 'qty' || field === 'unitCost' || field === 'quantity') {
          const cost = parseFloat(up.cost || up.unitCost) || 0;
          const qty = parseFloat(up.qty || up.quantity) || 0;
          up.totalPrice = cost * qty;
        }
        return up;
      }
      return item;
    });

    const updated = { ...receipt, items: updatedItems };
    setReceipt(updated);
  };

  // Status step configuration
  const mainStages = [
    { key: 'draft', label: 'Draft' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'ready', label: 'Ready' },
    { key: 'done', label: 'Done' }
  ];

  const movementOptions = [
    { key: 'creation', label: 'Creation (Draft)', icon: FileText, color: 'text-slate-600 bg-slate-100' },
    { key: 'moving', label: 'Moving (In Transit)', icon: Truck, color: 'text-blue-700 bg-blue-50 border-blue-200' },
    { key: 'not_received', label: 'Not Received (Pending Gate)', icon: AlertCircle, color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { key: 'arrived', label: 'Ready (Inspected)', icon: ShieldCheck, color: 'text-purple-700 bg-purple-50 border-purple-200' },
    { key: 'received', label: 'Done (Stock Received)', icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-24">
      <Navbar activePage="receipts" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2.5 ${
              toastMessage.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : toastMessage.type === 'info'
                ? 'bg-sky-50 border-sky-200 text-sky-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <XCircle className="w-4 h-4 text-rose-600" />
            ) : toastMessage.type === 'info' ? (
              <Info className="w-4 h-4 text-sky-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar / Module Switcher */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3">
            
            {/* Module Switcher Tabs */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <a
                  href="/receipts"
                  className="px-2.5 py-1 rounded-lg font-medium text-indigo-700 bg-white shadow-2xs"
                >
                  Receipts (WH/IN)
                </a>
                <a
                  href="/deliveries"
                  className="px-2.5 py-1 rounded-lg font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Deliveries (WH/OUT)
                </a>
                <a
                  href="/movements"
                  className="px-2.5 py-1 rounded-lg font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Stock Movements
                </a>
              </div>

              {currentView === 'detail' && (
                <div className="flex items-center gap-1.5 text-slate-500">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <button
                    onClick={() => setCurrentView('list')}
                    className="hover:text-indigo-600 underline font-medium cursor-pointer"
                  >
                    Receipts
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-900 font-mono">{receipt.internalNumber || receipt.reference}</span>
                  {receipt.status === 'cancelled' && (
                    <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 uppercase">
                      Cancelled
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {currentView === 'detail' ? (
                <>
                  <button
                    onClick={() => setCurrentView('list')}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to List
                  </button>
                  <button
                    onClick={handleCreateNewReceipt}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Receipt
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCreateNewReceipt}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Receipt
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentView === 'list' ? (
          /* DEFAULT: Land on List View */
          <ReceiptsListView
            receipts={receiptsList}
            loading={loading}
            onSelectReceipt={handleSelectReceipt}
            onCreateNew={handleCreateNewReceipt}
            onDeleteReceipt={handleDeleteReceipt}
            onPrintReceipt={(r) => {
              setReceipt(r);
              setIsPrintModalOpen(true);
            }}
          />
        ) : (
          /* DETAIL / FORM VIEW */
          <div className="space-y-6">
            
            {/* Master Control Card (Top Bar Options + Status Pipeline) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Top Bar Options (Left): Validate, Save, Print, Cancel, Delete */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={handleValidate}
                    disabled={receipt.status === 'done' || receipt.status === 'cancelled'}
                    className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer ${
                      receipt.status === 'done'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 opacity-80 cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-98'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {receipt.status === 'done' ? 'Validated & Done' : 'Validate & Increase Stock'}
                  </button>

                  <button
                    onClick={handleSaveReceipt}
                    className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer active:scale-98"
                  >
                    <Save className="w-4 h-4 text-slate-600" />
                    Save Draft
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer active:scale-98"
                  >
                    <Printer className="w-4 h-4 text-slate-600" />
                    Print GRN
                  </button>

                  <button
                    onClick={handleCancelReceipt}
                    disabled={receipt.status === 'cancelled'}
                    className="px-3.5 py-2 text-xs sm:text-sm font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel
                  </button>

                  {receipt.id && (
                    <button
                      onClick={() => handleDeleteReceipt(receipt.id, receipt.internalNumber || receipt.reference)}
                      className="px-3.5 py-2 text-xs sm:text-sm font-medium text-rose-700 hover:bg-rose-100/70 border border-rose-300 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>

                {/* Status Pipeline (Right): Draft -> In Progress -> Ready -> Done */}
                <div className="flex items-center overflow-x-auto pb-1 lg:pb-0">
                  <div className="inline-flex bg-slate-100/80 p-1 rounded-xl border border-slate-200 text-xs">
                    {mainStages.map((stage) => {
                      const isActive = (receipt.status || 'draft') === stage.key;
                      const isDone =
                        receipt.status === 'done' ||
                        (receipt.status === 'ready' && stage.key === 'draft') ||
                        (receipt.status === 'ready' && stage.key === 'in_progress') ||
                        (receipt.status === 'in_progress' && stage.key === 'draft');

                      return (
                        <button
                          key={stage.key}
                          onClick={() => handleStatusChange(stage.key)}
                          className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                            isActive
                              ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                              : isDone
                              ? 'text-slate-700 hover:text-slate-900'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive
                                ? 'bg-indigo-600'
                                : isDone
                                ? 'bg-emerald-500'
                                : 'bg-slate-300'
                            }`}
                          />
                          {stage.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Intermediate Status Tracking Pipeline */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                    Movement Lifecycle:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {movementOptions.map((opt) => {
                    const isSelected = receipt.movementStatus === opt.key;
                    const IconComp = opt.icon;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleMovementStatusChange(opt.key)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? `${opt.color} shadow-xs font-bold ring-2 ring-indigo-500/20`
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Document Details & Product Lines */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-6 space-y-6">
                
                {/* Header Reference & Bill info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                      Warehouse Inward Reference
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 mt-1">
                      {receipt.internalNumber || receipt.reference}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Scheduled Receive Date</span>
                      <span className="text-sm font-semibold text-slate-800 font-mono">
                        {receipt.scheduledDate || 'Today'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Receive From (Supplier Selection) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Receive From (Supplier / Source) <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={receipt.from || receipt.supplier?.name || ''}
                        onChange={(e) => setReceipt({ ...receipt, from: e.target.value })}
                        placeholder="Select or enter supplier name..."
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => setIsSupplierModalOpen(true)}
                        className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Pick from registered supplier directory"
                      >
                        <Building2 className="w-4 h-4" />
                        Pick
                      </button>
                    </div>
                  </div>

                  {/* Destination Location */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Destination (To Warehouse Location) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={receipt.warehouse?.id || ''}
                      onChange={(e) => {
                        const wh = warehouses.find((w) => w.id === parseInt(e.target.value));
                        setReceipt({
                          ...receipt,
                          warehouse: wh || null,
                          to: wh ? wh.name : 'Central Stock Room'
                        });
                      }}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800"
                    >
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.shortcode || 'WH'})
                        </option>
                      ))}
                      {warehouses.length === 0 && (
                        <option value="">Central Stock Room (Default)</option>
                      )}
                    </select>
                  </div>

                  {/* Scheduled Date */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Scheduled Date
                    </label>
                    <input
                      type="date"
                      value={receipt.scheduledDate || ''}
                      onChange={(e) => setReceipt({ ...receipt, scheduledDate: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800"
                    />
                  </div>

                  {/* Responsible Staff */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Responsible Person
                    </label>
                    <input
                      type="text"
                      value={receipt.responsible || 'Rohit Maurya'}
                      onChange={(e) => setReceipt({ ...receipt, responsible: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-medium text-slate-800"
                    />
                  </div>

                  {/* Seller Bill / Invoice No. */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Seller Bill / Invoice Ref
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. INV-2026-9812"
                      value={receipt.sellerBillNumber || ''}
                      onChange={(e) => setReceipt({ ...receipt, sellerBillNumber: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-mono text-slate-800"
                    />
                  </div>

                  {/* Work Order / MO Reference */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Linked MO Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MO-2026-001"
                      value={receipt.moNumber || ''}
                      onChange={(e) => setReceipt({ ...receipt, moNumber: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-mono text-slate-800"
                    />
                  </div>

                </div>

                {/* Product Items Table */}
                <div className="pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Received Products & Components</h3>
                      <p className="text-xs text-slate-500">Products checked against vendor delivery challan</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddProductOpen(true)}
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Product Line
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Product Name</th>
                          <th className="py-2.5 px-3 w-32">SKU</th>
                          <th className="py-2.5 px-3 w-28 text-right">Quantity</th>
                          <th className="py-2.5 px-3 w-24">Unit</th>
                          <th className="py-2.5 px-3 w-32 text-right">Unit Cost (₹)</th>
                          <th className="py-2.5 px-3 w-32 text-right">Total Price (₹)</th>
                          <th className="py-2.5 px-2 w-10"></th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100 bg-white">
                        {(!receipt.items || receipt.items.length === 0) ? (
                          <tr>
                            <td colSpan="7" className="py-8 text-center text-slate-400">
                              <Package className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                              <p className="font-medium text-slate-600 text-xs">No products in this receipt</p>
                              <button
                                type="button"
                                onClick={() => setIsAddProductOpen(true)}
                                className="text-xs font-semibold text-indigo-600 hover:underline mt-1 inline-block cursor-pointer"
                              >
                                + Add First Item
                              </button>
                            </td>
                          </tr>
                        ) : (
                          receipt.items.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-2.5 px-3 font-medium text-slate-800">
                                {item.productName || item.name}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-xs text-slate-500">
                                {item.sku || '—'}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.qty || item.quantity || 1}
                                  onChange={(e) => handleItemFieldChange(item.id, 'qty', e.target.value)}
                                  className="w-20 px-2 py-1 text-right text-xs bg-slate-50 border border-slate-200 rounded font-semibold text-slate-800"
                                />
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 text-xs">
                                {item.unit || 'Units'}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                                <input
                                  type="number"
                                  min="0"
                                  value={item.cost || item.unitCost || 0}
                                  onChange={(e) => handleItemFieldChange(item.id, 'cost', e.target.value)}
                                  className="w-24 px-2 py-1 text-right text-xs bg-slate-50 border border-slate-200 rounded font-mono text-slate-800"
                                />
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                                ₹{(item.totalPrice || (parseFloat(item.qty || item.quantity || 1) * parseFloat(item.cost || item.unitCost || 0))).toLocaleString()}
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProduct(item.id)}
                                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom Row: Notes & Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
                  <div className="lg:col-span-7 space-y-3">
                    <label className="block text-xs font-semibold text-slate-700">
                      Receipt Remarks & Inspection Notes
                    </label>
                    <textarea
                      rows="3"
                      value={receipt.notes || ''}
                      onChange={(e) => setReceipt({ ...receipt, notes: e.target.value })}
                      placeholder="Enter verification remarks, seal numbers, batch codes..."
                      className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div className="lg:col-span-5 bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Financial Summary
                    </h4>

                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal:</span>
                        <span className="font-semibold text-slate-800 font-mono">
                          ₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span>GST (18%):</span>
                        <span className="font-semibold text-slate-800 font-mono">
                          ₹{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                        <span className="text-sm font-bold text-slate-900">Total Valuation:</span>
                        <span className="text-lg font-bold font-mono text-indigo-700">
                          ₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onAddProduct={handleAddProduct}
      />

      <SupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        currentSupplier={receipt.supplier}
        onSelectSupplier={(selectedSup) => {
          setReceipt({
            ...receipt,
            supplier: selectedSup,
            from: selectedSup.name,
            contact: `${selectedSup.contactPerson || ''} (${selectedSup.phone || ''})`
          });
          showToast(`Supplier set to ${selectedSup.name}`);
        }}
      />

      <PrintReceiptModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        receipt={receipt}
        subtotal={subtotal}
        taxAmount={taxAmount}
        grandTotal={grandTotal}
      />
    </div>
  );
}
