import React, { useState, useMemo } from 'react';
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
import { INITIAL_RECEIPTS_LIST, SAMPLE_SUPPLIERS, STAFF_MEMBERS, generateReference } from './receiptData';
import AddProductModal from './AddProductModal';
import SupplierModal from './SupplierModal';
import PrintReceiptModal from './PrintReceiptModal';
import ReceiptsListView from './ReceiptsListView';
import Navbar from '../../components/Navbar';

export default function ReceiptPage() {
  const [receiptsList, setReceiptsList] = useState(INITIAL_RECEIPTS_LIST);
  const [currentView, setCurrentView] = useState('list'); // 'list' (default land) | 'detail'
  const [receipt, setReceipt] = useState(INITIAL_RECEIPTS_LIST[0]);
  
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

  // Financial calculations
  const subtotal = useMemo(() => {
    return receipt.items.reduce((acc, item) => acc + (parseFloat(item.totalPrice) || 0), 0);
  }, [receipt.items]);

  const taxAmount = useMemo(() => {
    return (subtotal * (receipt.taxRate || 0)) / 100;
  }, [subtotal, receipt.taxRate]);

  const grandTotal = useMemo(() => {
    return subtotal + taxAmount;
  }, [subtotal, taxAmount]);

  const totalUnits = useMemo(() => {
    return receipt.items.reduce((acc, item) => acc + (parseFloat(item.qty) || 0), 0);
  }, [receipt.items]);

  // Stage updates
  const handleStatusChange = (newStatus) => {
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
    // Update in list
    setReceiptsList((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
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
  const handleValidate = () => {
    if (receipt.items.length === 0) {
      showToast('Please add at least one product before validating!', 'error');
      return;
    }
    if (!receipt.supplier?.name) {
      showToast('Please select a supplier before validating!', 'error');
      return;
    }

    const updated = {
      ...receipt,
      status: 'done',
      movementStatus: 'received'
    };
    setReceipt(updated);
    setReceiptsList((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    showToast(`Receipt ${receipt.internalNumber} validated & inventory updated successfully!`, 'success');
  };

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  const handleCancelReceipt = () => {
    if (window.confirm('Are you sure you want to cancel this receipt?')) {
      const updated = {
        ...receipt,
        status: 'cancelled'
      };
      setReceipt(updated);
      setReceiptsList((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      showToast(`Receipt ${receipt.internalNumber} marked as Cancelled`, 'info');
    }
  };

  // Open detail view for a selected receipt
  const handleSelectReceipt = (selected) => {
    setReceipt(selected);
    setCurrentView('detail');
  };

  // Create new receipt with auto-increment ID format <Warehouse>/<Operation>/<ID> (e.g. WH/IN/005)
  const handleCreateNewReceipt = () => {
    const nextId = receiptsList.length + 1;
    const newRef = generateReference('WH', 'IN', nextId);

    const newRec = {
      id: `rec-${Date.now()}`,
      warehouseCode: 'WH',
      operationCode: 'IN',
      numericId: nextId,
      internalNumber: newRef,
      from: SAMPLE_SUPPLIERS[0].name,
      to: 'WH/Stock/Main Bay A1',
      contact: `${SAMPLE_SUPPLIERS[0].contactPerson} (${SAMPLE_SUPPLIERS[0].phone})`,
      sellerBillNumber: '',
      createdOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      scheduledDate: new Date().toISOString().split('T')[0],
      responsible: STAFF_MEMBERS[0].name,
      responsibleId: STAFF_MEMBERS[0].id,
      status: 'draft',
      movementStatus: 'creation',
      sourceDocument: '',
      warehouseLocation: 'WH/Stock/Main Bay A1',
      notes: '',
      manufacturingOrder: null,
      supplier: SAMPLE_SUPPLIERS[0],
      taxRate: 18,
      items: []
    };

    setReceiptsList([newRec, ...receiptsList]);
    setReceipt(newRec);
    setCurrentView('detail');
    showToast(`Created new receipt ${newRef}`);
  };

  // Item modifications
  const handleAddProduct = (newProduct) => {
    const updated = {
      ...receipt,
      items: [...receipt.items, newProduct]
    };
    setReceipt(updated);
    setReceiptsList((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    showToast(`Added ${newProduct.productName} to receipt`);
  };

  const handleRemoveProduct = (itemId) => {
    const updated = {
      ...receipt,
      items: receipt.items.filter((item) => item.id !== itemId)
    };
    setReceipt(updated);
    setReceiptsList((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    showToast('Product item removed from receipt', 'info');
  };

  const handleItemFieldChange = (itemId, field, value) => {
    const updatedItems = receipt.items.map((item) => {
      if (item.id === itemId) {
        const up = { ...item, [field]: value };
        if (field === 'cost' || field === 'qty') {
          const cost = field === 'cost' ? parseFloat(value) || 0 : item.cost;
          const qty = field === 'qty' ? parseFloat(value) || 0 : item.qty;
          up.totalPrice = cost * qty;
        }
        return up;
      }
      return item;
    });

    const updated = { ...receipt, items: updatedItems };
    setReceipt(updated);
    setReceiptsList((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
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
                  <span className="font-semibold text-slate-900 font-mono">{receipt.internalNumber}</span>
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
            onSelectReceipt={handleSelectReceipt}
            onCreateNew={handleCreateNewReceipt}
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
                
                {/* Top Bar Options (Left): Validate, Print, Cancel */}
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
                    {receipt.status === 'done' ? 'Validated & Done' : 'Validate'}
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
                </div>

                {/* Status Pipeline (Right): Draft -> In Progress -> Ready -> Done */}
                <div className="flex items-center overflow-x-auto pb-1 lg:pb-0">
                  <div className="inline-flex bg-slate-100/80 p-1 rounded-xl border border-slate-200 text-xs">
                    {mainStages.map((stage) => {
                      const isActive = receipt.status === stage.key;
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
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Intermediate Tracking Status:
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {movementOptions.map((opt) => {
                    const isSelected = receipt.movementStatus === opt.key;
                    const IconComponent = opt.icon;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleMovementStatusChange(opt.key)}
                        className={`px-2.5 py-1 text-xs rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? `${opt.color} font-semibold ring-1 ring-slate-400/40 shadow-xs`
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                        }`}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Main Receipt Sheet Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              
              {/* Document Header Info Section */}
              <div className="p-6 sm:p-8 border-b border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 font-mono">
                      Inventory Receipt / GRN Reference
                    </span>
                    <div className="flex items-center gap-3 mt-1">
                      <input
                        type="text"
                        value={receipt.internalNumber}
                        onChange={(e) => setReceipt({ ...receipt, internalNumber: e.target.value })}
                        className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tracking-tight bg-transparent border-b border-dashed border-slate-300 hover:border-slate-400 focus:border-indigo-600 focus:outline-none px-1"
                        title="Format: <Warehouse>/<Operation>/<ID>"
                      />
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          receipt.status === 'done'
                            ? 'bg-emerald-100 text-emerald-800'
                            : receipt.status === 'ready'
                            ? 'bg-purple-100 text-purple-800'
                            : receipt.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {receipt.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Quick Info Stamps */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Created: <strong className="text-slate-700">{receipt.createdOn}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Form Fields Grid: Receive from, Schedule date, Responsible, Internal receipt number, Created on, Seller bill number */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                  
                  {/* Receive From (Supplier) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        Receive From (Supplier) *
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsSupplierModalOpen(true)}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Change / Edit
                      </button>
                    </div>
                    
                    <div
                      onClick={() => setIsSupplierModalOpen(true)}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl cursor-pointer transition-colors group"
                    >
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {receipt.supplier?.name || 'Click to select supplier'}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {receipt.supplier?.address || 'No address set'}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                        <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          GST: {receipt.supplier?.gstNumber || 'N/A'}
                        </span>
                        <span>Ph: {receipt.supplier?.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Scheduled Date & Responsible Person */}
                  <div className="space-y-4">
                    {/* Scheduled Date */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Scheduled Date
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="date"
                          value={receipt.scheduledDate}
                          onChange={(e) => setReceipt({ ...receipt, scheduledDate: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Responsible Staff */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Responsible Person
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                          value={receipt.responsible}
                          onChange={(e) => setReceipt({ ...receipt, responsible: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                        >
                          {STAFF_MEMBERS.map((staff) => (
                            <option key={staff.id} value={staff.name}>
                              {staff.name} ({staff.role})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Seller Bill Number & Destination Warehouse */}
                  <div className="space-y-4">
                    {/* Seller Bill Number */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Seller Bill Number / Invoice Ref
                      </label>
                      <div className="relative">
                        <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="e.g. INV-2026-8891"
                          value={receipt.sellerBillNumber}
                          onChange={(e) => setReceipt({ ...receipt, sellerBillNumber: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Destination Warehouse Location (To) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        To (Location of Warehouse)
                      </label>
                      <input
                        type="text"
                        value={receipt.warehouseLocation}
                        onChange={(e) => setReceipt({ ...receipt, warehouseLocation: e.target.value, to: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 font-mono text-xs"
                      />
                    </div>
                  </div>

                </div>

                {/* Linked Manufacturing Order & Work Orders Section */}
                {receipt.manufacturingOrder && (
                  <div className="mt-6 p-4 rounded-xl bg-purple-50/50 border border-purple-200/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                          <Cpu className="w-3.5 h-3.5" />
                        </span>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900">
                            Linked Manufacturing Order: {receipt.manufacturingOrder.moNumber}
                          </h4>
                          <p className="text-xs text-purple-700">
                            Product: <strong className="text-purple-900">{receipt.manufacturingOrder.productName}</strong> (Target Qty: {receipt.manufacturingOrder.targetQty} Units)
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full">
                        {receipt.manufacturingOrder.workOrders.length} Work Orders Linked
                      </span>
                    </div>

                    {/* Work Orders List */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      {receipt.manufacturingOrder.workOrders.map((wo) => (
                        <div key={wo.id} className="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs space-y-1.5 text-xs">
                          <div className="flex items-center justify-between font-medium text-slate-800">
                            <span className="font-mono font-bold text-purple-800">{wo.id}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              wo.status === 'Done'
                                ? 'bg-emerald-100 text-emerald-800'
                                : wo.status === 'In Progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {wo.status}
                            </span>
                          </div>
                          <p className="font-medium text-slate-900">{wo.name}</p>
                          <div className="text-[11px] text-slate-500 flex justify-between items-center pt-1 border-t border-slate-100">
                            <span>{wo.workstation}</span>
                            <span className="font-mono font-bold text-purple-700">{wo.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Product / Goods Details Section */}
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Package className="w-4 h-4 text-indigo-600" />
                      Product & Goods Details
                    </h3>
                    <p className="text-xs text-slate-500">
                      Manage received goods, verify unit costs, units of measure, and quantities.
                    </p>
                  </div>

                  {/* ADD NEW PRODUCT BUTTON */}
                  <button
                    type="button"
                    onClick={() => setIsAddProductOpen(true)}
                    className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Product
                  </button>
                </div>

                {/* Goods Details Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-3.5 w-10 text-center text-slate-400">#</th>
                          <th className="py-3 px-3.5 min-w-[220px]">Product</th>
                          <th className="py-3 px-3.5 w-32 text-right">Cost (₹)</th>
                          <th className="py-3 px-3.5 w-28 text-center">Unit</th>
                          <th className="py-3 px-3.5 w-28 text-right">Qty</th>
                          <th className="py-3 px-3.5 w-36 text-right font-semibold">Total Price</th>
                          <th className="py-3 px-2 w-12 text-center"></th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100 bg-white">
                        {receipt.items.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="py-12 text-center text-slate-400">
                              <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                              <p className="font-medium text-slate-600">No goods added yet</p>
                              <p className="text-xs text-slate-400 mt-1">
                                Click <strong className="text-indigo-600">Add New Product</strong> above to add receipt lines.
                              </p>
                            </td>
                          </tr>
                        ) : (
                          receipt.items.map((item, index) => (
                            <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                              <td className="py-3 px-3.5 text-center text-slate-400 font-mono text-xs">
                                {index + 1}
                              </td>

                              <td className="py-3 px-3.5">
                                <input
                                  type="text"
                                  value={item.productName}
                                  onChange={(e) => handleItemFieldChange(item.id, 'productName', e.target.value)}
                                  className="font-medium text-slate-900 w-full bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-200 focus:border-indigo-500 rounded px-1.5 py-0.5 focus:outline-none transition-colors"
                                />
                                <div className="text-[11px] text-slate-400 font-mono px-1.5">
                                  SKU: {item.sku}
                                </div>
                              </td>

                              <td className="py-3 px-3.5 text-right">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.cost}
                                  onChange={(e) => handleItemFieldChange(item.id, 'cost', e.target.value)}
                                  className="w-full text-right font-mono font-medium text-slate-800 bg-slate-50 group-hover:bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                              </td>

                              <td className="py-3 px-3.5 text-center">
                                <select
                                  value={item.unit}
                                  onChange={(e) => handleItemFieldChange(item.id, 'unit', e.target.value)}
                                  className="w-full text-center text-xs bg-slate-50 group-hover:bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
                                >
                                  <option value="Units">Units</option>
                                  <option value="Pcs">Pcs</option>
                                  <option value="Kg">Kg</option>
                                  <option value="Box">Box</option>
                                  <option value="Cartridge">Cartridge</option>
                                  <option value="Drum">Drum</option>
                                  <option value="Liters">Liters</option>
                                  <option value="Meters">Meters</option>
                                </select>
                              </td>

                              <td className="py-3 px-3.5 text-right">
                                <input
                                  type="number"
                                  min="1"
                                  step="1"
                                  value={item.qty}
                                  onChange={(e) => handleItemFieldChange(item.id, 'qty', e.target.value)}
                                  className="w-full text-right font-bold text-slate-900 bg-slate-50 group-hover:bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                              </td>

                              <td className="py-3 px-3.5 text-right font-semibold font-mono text-slate-900">
                                ₹{(parseFloat(item.totalPrice) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>

                              <td className="py-3 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProduct(item.id)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete row"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom Row: Notes + Financial Summary Card */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
                  
                  {/* Left Column: Notes & Remarks */}
                  <div className="lg:col-span-7 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Warehouse Receipt Notes & Special Instructions
                      </label>
                      <textarea
                        rows="3"
                        value={receipt.notes}
                        onChange={(e) => setReceipt({ ...receipt, notes: e.target.value })}
                        placeholder="Enter any package damages, verification remarks, seal numbers, or delivery notes..."
                        className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                      />
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>Total Unique Lines: <strong className="text-slate-800">{receipt.items.length}</strong></span>
                      </div>
                      <span>•</span>
                      <div>
                        <span>Total Quantity: <strong className="text-slate-800">{totalUnits} units</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Financial Summary Card */}
                  <div className="lg:col-span-5 bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Financial Summary
                    </h4>

                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between text-slate-600">
                        <span>Untaxed Amount (Subtotal):</span>
                        <span className="font-semibold text-slate-800 font-mono">
                          ₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <span>GST Rate:</span>
                          <select
                            value={receipt.taxRate}
                            onChange={(e) => setReceipt({ ...receipt, taxRate: parseFloat(e.target.value) || 0 })}
                            className="text-xs bg-white border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none font-medium"
                          >
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18">18% (Standard)</option>
                            <option value="28">28%</option>
                          </select>
                        </div>
                        <span className="font-semibold text-slate-800 font-mono">
                          ₹{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                        <div>
                          <span className="text-sm font-bold text-slate-900 block">Total Price:</span>
                          <span className="text-[11px] text-slate-500">Including all applicable taxes</span>
                        </div>
                        <span className="text-lg sm:text-xl font-bold font-mono text-indigo-700">
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
          const updated = {
            ...receipt,
            supplier: selectedSup,
            from: selectedSup.name,
            contact: `${selectedSup.contactPerson} (${selectedSup.phone})`
          };
          setReceipt(updated);
          setReceiptsList((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
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
