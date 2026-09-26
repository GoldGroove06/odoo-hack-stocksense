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
  Send,
  Navigation
} from 'lucide-react';
import { INITIAL_DELIVERIES_LIST, SAMPLE_CUSTOMERS, DISPATCH_STAFF, generateDeliveryReference } from './deliveryData';
import AddDeliveryProductModal from './AddDeliveryProductModal';
import CustomerModal from './CustomerModal';
import PrintDeliveryModal from './PrintDeliveryModal';
import DeliveriesListView from './DeliveriesListView';
import Navbar from '../../components/Navbar';

export default function DeliveryPage() {
  const [deliveriesList, setDeliveriesList] = useState(INITIAL_DELIVERIES_LIST);
  const [currentView, setCurrentView] = useState('list'); // 'list' (default land) | 'detail'
  const [delivery, setDelivery] = useState(INITIAL_DELIVERIES_LIST[0]);

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
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
    return delivery.items.reduce((acc, item) => acc + (parseFloat(item.totalPrice) || 0), 0);
  }, [delivery.items]);

  const taxAmount = useMemo(() => {
    return (subtotal * (delivery.taxRate || 0)) / 100;
  }, [subtotal, delivery.taxRate]);

  const grandTotal = useMemo(() => {
    return subtotal + taxAmount;
  }, [subtotal, taxAmount]);

  const totalUnits = useMemo(() => {
    return delivery.items.reduce((acc, item) => acc + (parseFloat(item.qty) || 0), 0);
  }, [delivery.items]);

  // Stage updates
  const handleStatusChange = (newStatus) => {
    const updated = {
      ...delivery,
      status: newStatus,
      movementStatus:
        newStatus === 'draft'
          ? 'creation'
          : newStatus === 'in_progress'
          ? 'moving'
          : newStatus === 'ready'
          ? 'packing'
          : newStatus === 'done'
          ? 'delivered'
          : delivery.movementStatus
    };
    setDelivery(updated);
    setDeliveriesList((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    showToast(`Delivery status updated to ${newStatus.toUpperCase()}`);
  };

  const handleMovementStatusChange = (newMovementStatus) => {
    let correspondingStatus = delivery.status;
    if (newMovementStatus === 'creation') correspondingStatus = 'draft';
    else if (newMovementStatus === 'packing') correspondingStatus = 'ready';
    else if (newMovementStatus === 'moving' || newMovementStatus === 'not_received') correspondingStatus = 'in_progress';
    else if (newMovementStatus === 'delivered') correspondingStatus = 'done';

    const updated = {
      ...delivery,
      movementStatus: newMovementStatus,
      status: correspondingStatus
    };
    setDelivery(updated);
    setDeliveriesList((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    showToast(`Dispatch tracking updated: ${newMovementStatus.replace('_', ' ')}`);
  };

  // Top Action handlers
  const handleValidate = () => {
    if (delivery.items.length === 0) {
      showToast('Please add at least one product before validating delivery!', 'error');
      return;
    }
    if (!delivery.customer?.name) {
      showToast('Please select a customer for delivery!', 'error');
      return;
    }

    const updated = {
      ...delivery,
      status: 'done',
      movementStatus: 'delivered'
    };
    setDelivery(updated);
    setDeliveriesList((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    showToast(`Delivery ${delivery.internalNumber} validated & stock dispatched!`, 'success');
  };

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  const handleCancelDelivery = () => {
    if (window.confirm('Are you sure you want to cancel this delivery order?')) {
      const updated = {
        ...delivery,
        status: 'cancelled'
      };
      setDelivery(updated);
      setDeliveriesList((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      showToast(`Delivery order ${delivery.internalNumber} marked as Cancelled`, 'info');
    }
  };

  const handleSelectDelivery = (selected) => {
    setDelivery(selected);
    setCurrentView('detail');
  };

  // Create new delivery with auto-increment ID format <Warehouse>/<Operation>/<ID> (e.g. WH/OUT/004)
  const handleCreateNewDelivery = () => {
    const nextId = deliveriesList.length + 1;
    const newRef = generateDeliveryReference('WH', 'OUT', nextId);

    const newDel = {
      id: `del-${Date.now()}`,
      warehouseCode: 'WH',
      operationCode: 'OUT',
      numericId: nextId,
      internalNumber: newRef,
      from: 'WH/Stock/Dispatch Bay 1',
      to: `${SAMPLE_CUSTOMERS[0].name} - ${SAMPLE_CUSTOMERS[0].city}`,
      contact: `${SAMPLE_CUSTOMERS[0].contactPerson} (${SAMPLE_CUSTOMERS[0].phone})`,
      sourceDocument: '',
      customerReference: '',
      createdOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      scheduledDate: new Date().toISOString().split('T')[0],
      responsible: DISPATCH_STAFF[0].name,
      responsibleId: DISPATCH_STAFF[0].id,
      status: 'draft',
      movementStatus: 'creation',
      shippingPolicy: 'As soon as possible',
      carrier: 'BlueDart Express Cargo',
      trackingNumber: '',
      vehicleNumber: '',
      warehouseLocation: 'WH/Stock/Dispatch Bay 1',
      notes: '',
      customer: SAMPLE_CUSTOMERS[0],
      taxRate: 18,
      items: []
    };

    setDeliveriesList([newDel, ...deliveriesList]);
    setDelivery(newDel);
    setCurrentView('detail');
    showToast(`Created new delivery order ${newRef}`);
  };

  // Item modifications
  const handleAddProduct = (newProduct) => {
    const updated = {
      ...delivery,
      items: [...delivery.items, newProduct]
    };
    setDelivery(updated);
    setDeliveriesList((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    showToast(`Added ${newProduct.productName} to delivery`);
  };

  const handleRemoveProduct = (itemId) => {
    const updated = {
      ...delivery,
      items: delivery.items.filter((item) => item.id !== itemId)
    };
    setDelivery(updated);
    setDeliveriesList((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    showToast('Product item removed from delivery', 'info');
  };

  const handleItemFieldChange = (itemId, field, value) => {
    const updatedItems = delivery.items.map((item) => {
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

    const updated = { ...delivery, items: updatedItems };
    setDelivery(updated);
    setDeliveriesList((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  const mainStages = [
    { key: 'draft', label: 'Draft' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'ready', label: 'Ready' },
    { key: 'done', label: 'Done' }
  ];

  const movementOptions = [
    { key: 'creation', label: 'Creation (Draft)', icon: FileText, color: 'text-slate-600 bg-slate-100' },
    { key: 'packing', label: 'Packing (Staged)', icon: Package, color: 'text-purple-700 bg-purple-50 border-purple-200' },
    { key: 'moving', label: 'Moving (Out for Delivery)', icon: Truck, color: 'text-blue-700 bg-blue-50 border-blue-200' },
    { key: 'not_received', label: 'Not Received (Transit Hold)', icon: AlertCircle, color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { key: 'delivered', label: 'Done (Delivered)', icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-24">
      <Navbar activePage="deliveries" />

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
                  className="px-2.5 py-1 rounded-lg font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Receipts (WH/IN)
                </a>
                <a
                  href="/deliveries"
                  className="px-2.5 py-1 rounded-lg font-medium text-emerald-700 bg-white shadow-2xs"
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
                    className="hover:text-emerald-600 underline font-medium cursor-pointer"
                  >
                    Deliveries
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-900 font-mono">{delivery.internalNumber}</span>
                  {delivery.status === 'cancelled' && (
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
                    onClick={handleCreateNewDelivery}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Delivery
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCreateNewDelivery}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Delivery
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
          <DeliveriesListView
            deliveries={deliveriesList}
            onSelectDelivery={handleSelectDelivery}
            onCreateNew={handleCreateNewDelivery}
            onPrintDelivery={(d) => {
              setDelivery(d);
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
                    disabled={delivery.status === 'done' || delivery.status === 'cancelled'}
                    className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer ${
                      delivery.status === 'done'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 opacity-80 cursor-default'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {delivery.status === 'done' ? 'Validated & Delivered' : 'Validate'}
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer active:scale-98"
                  >
                    <Printer className="w-4 h-4 text-slate-600" />
                    Print Delivery Slip
                  </button>

                  <button
                    onClick={handleCancelDelivery}
                    disabled={delivery.status === 'cancelled'}
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
                      const isActive = delivery.status === stage.key;
                      const isDone =
                        delivery.status === 'done' ||
                        (delivery.status === 'ready' && stage.key === 'draft') ||
                        (delivery.status === 'ready' && stage.key === 'in_progress') ||
                        (delivery.status === 'in_progress' && stage.key === 'draft');

                      return (
                        <button
                          key={stage.key}
                          onClick={() => handleStatusChange(stage.key)}
                          className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                            isActive
                              ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                              : isDone
                              ? 'text-slate-700 hover:text-slate-900'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive
                                ? 'bg-emerald-600'
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
                    Intermediate Dispatch Tracking:
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {movementOptions.map((opt) => {
                    const isSelected = delivery.movementStatus === opt.key;
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

            {/* Main Delivery Sheet Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              
              {/* Document Header Info Section */}
              <div className="p-6 sm:p-8 border-b border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 font-mono">
                      Outbound Delivery Order Reference
                    </span>
                    <div className="flex items-center gap-3 mt-1">
                      <input
                        type="text"
                        value={delivery.internalNumber}
                        onChange={(e) => setDelivery({ ...delivery, internalNumber: e.target.value })}
                        className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tracking-tight bg-transparent border-b border-dashed border-slate-300 hover:border-slate-400 focus:border-emerald-600 focus:outline-none px-1"
                        title="Format: <Warehouse>/<Operation>/<ID>"
                      />
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          delivery.status === 'done'
                            ? 'bg-emerald-100 text-emerald-800'
                            : delivery.status === 'ready'
                            ? 'bg-purple-100 text-purple-800'
                            : delivery.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {delivery.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Quick Info Stamps */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Created: <strong className="text-slate-700">{delivery.createdOn}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                  
                  {/* Deliver To (Customer) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        Deliver To (Customer) *
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCustomerModalOpen(true)}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Change / Edit
                      </button>
                    </div>
                    
                    <div
                      onClick={() => setIsCustomerModalOpen(true)}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl cursor-pointer transition-colors group"
                    >
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                        {delivery.customer?.name || 'Click to select customer'}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {delivery.customer?.shippingAddress || 'No shipping address set'}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                        <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          GST: {delivery.customer?.gstNumber || 'N/A'}
                        </span>
                        <span>Ph: {delivery.customer?.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Scheduled Delivery Date & Responsible */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Scheduled Delivery Date
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="date"
                          value={delivery.scheduledDate}
                          onChange={(e) => setDelivery({ ...delivery, scheduledDate: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Dispatch Responsible
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                          value={delivery.responsible}
                          onChange={(e) => setDelivery({ ...delivery, responsible: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                        >
                          {DISPATCH_STAFF.map((staff) => (
                            <option key={staff.id} value={staff.name}>
                              {staff.name} ({staff.role})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Source Document & From Location */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Source Document / Sale Order Ref
                      </label>
                      <div className="relative">
                        <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="e.g. SO-2026-0812"
                          value={delivery.sourceDocument}
                          onChange={(e) => setDelivery({ ...delivery, sourceDocument: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono text-slate-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        From (Warehouse Location)
                      </label>
                      <input
                        type="text"
                        value={delivery.warehouseLocation}
                        onChange={(e) => setDelivery({ ...delivery, warehouseLocation: e.target.value, from: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 font-mono text-xs"
                      />
                    </div>
                  </div>

                </div>

                {/* Carrier & Tracking details card */}
                <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-semibold">Carrier / Transporter:</span>
                    <input
                      type="text"
                      value={delivery.carrier}
                      onChange={(e) => setDelivery({ ...delivery, carrier: e.target.value })}
                      className="mt-1 font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 w-full focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Tracking / AWB Number:</span>
                    <input
                      type="text"
                      value={delivery.trackingNumber}
                      onChange={(e) => setDelivery({ ...delivery, trackingNumber: e.target.value })}
                      placeholder="e.g. BD-EXP-8891042"
                      className="mt-1 font-mono text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 w-full focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Dispatch Vehicle Number:</span>
                    <input
                      type="text"
                      value={delivery.vehicleNumber}
                      onChange={(e) => setDelivery({ ...delivery, vehicleNumber: e.target.value })}
                      placeholder="e.g. MH-12-QX-4890"
                      className="mt-1 font-mono text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 w-full focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Product / Goods Details Section */}
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Package className="w-4 h-4 text-emerald-600" />
                      Dispatched Products & Stock Lines
                    </h3>
                    <p className="text-xs text-slate-500">
                      Check items to deliver, verify demand quantities and pricing.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddProductOpen(true)}
                    className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
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
                          <th className="py-3 px-3.5 w-32 text-right">Price (₹)</th>
                          <th className="py-3 px-3.5 w-28 text-center">Unit</th>
                          <th className="py-3 px-3.5 w-28 text-right">Qty</th>
                          <th className="py-3 px-3.5 w-36 text-right font-semibold">Total Price</th>
                          <th className="py-3 px-2 w-12 text-center"></th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100 bg-white">
                        {delivery.items.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="py-12 text-center text-slate-400">
                              <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                              <p className="font-medium text-slate-600">No goods added for delivery</p>
                              <p className="text-xs text-slate-400 mt-1">
                                Click <strong className="text-emerald-600">Add New Product</strong> above to select items.
                              </p>
                            </td>
                          </tr>
                        ) : (
                          delivery.items.map((item, index) => (
                            <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                              <td className="py-3 px-3.5 text-center text-slate-400 font-mono text-xs">
                                {index + 1}
                              </td>

                              <td className="py-3 px-3.5">
                                <input
                                  type="text"
                                  value={item.productName}
                                  onChange={(e) => handleItemFieldChange(item.id, 'productName', e.target.value)}
                                  className="font-medium text-slate-900 w-full bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-200 focus:border-emerald-500 rounded px-1.5 py-0.5 focus:outline-none transition-colors"
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
                                  className="w-full text-right font-mono font-medium text-slate-800 bg-slate-50 group-hover:bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                              </td>

                              <td className="py-3 px-3.5 text-center">
                                <select
                                  value={item.unit}
                                  onChange={(e) => handleItemFieldChange(item.id, 'unit', e.target.value)}
                                  className="w-full text-center text-xs bg-slate-50 group-hover:bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-700"
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
                                  className="w-full text-right font-bold text-slate-900 bg-slate-50 group-hover:bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                        Delivery Instructions & Gate Pass Notes
                      </label>
                      <textarea
                        rows="3"
                        value={delivery.notes}
                        onChange={(e) => setDelivery({ ...delivery, notes: e.target.value })}
                        placeholder="Enter dispatch notes, customer gate instructions, special transport handling..."
                        className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700"
                      />
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>Total Unique Lines: <strong className="text-slate-800">{delivery.items.length}</strong></span>
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
                            value={delivery.taxRate}
                            onChange={(e) => setDelivery({ ...delivery, taxRate: parseFloat(e.target.value) || 0 })}
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
                        <span className="text-lg sm:text-xl font-bold font-mono text-emerald-700">
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
      <AddDeliveryProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onAddProduct={handleAddProduct}
      />

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        currentCustomer={delivery.customer}
        onSelectCustomer={(selectedCust) => {
          const updated = {
            ...delivery,
            customer: selectedCust,
            to: `${selectedCust.name} - ${selectedCust.city}`,
            contact: `${selectedCust.contactPerson} (${selectedCust.phone})`
          };
          setDelivery(updated);
          setDeliveriesList((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
          showToast(`Customer set to ${selectedCust.name}`);
        }}
      />

      <PrintDeliveryModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        delivery={delivery}
        subtotal={subtotal}
        taxAmount={taxAmount}
        grandTotal={grandTotal}
      />
    </div>
  );
}
