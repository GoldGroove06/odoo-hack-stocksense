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
  Send,
  Navigation,
  Box
} from 'lucide-react';
import { deliveryApi, customerApi, warehouseApi, productApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AddDeliveryProductModal from './AddDeliveryProductModal';
import CustomerModal from './CustomerModal';
import PrintDeliveryModal from './PrintDeliveryModal';
import DeliveriesListView from './DeliveriesListView';
import Navbar from '../../components/Navbar';

export default function DeliveryPage() {
  const { user } = useAuth();
  const loggedInUserName = user?.name || 'Warehouse Staff';

  const [deliveriesList, setDeliveriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('list'); // 'list' (default land) | 'detail'
  
  const [delivery, setDelivery] = useState({
    id: null,
    internalNumber: 'WH/OUT/001',
    status: 'draft',
    movementStatus: 'creation',
    destination: '',
    to: '',
    from: 'Central Stock Room',
    contact: '',
    carrier: 'Internal Logistics',
    trackingNumber: '',
    vehicleNumber: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    responsible: loggedInUserName,
    sourceDocument: '',
    customerNotes: '',
    customer: null,
    warehouse: null,
    taxRate: 18,
    items: []
  });

  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

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

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const [resDeliveries, resCustomers, resWarehouses] = await Promise.all([
        deliveryApi.getAll().catch(() => ({ data: [] })),
        customerApi.getAll().catch(() => ({ data: [] })),
        warehouseApi.getAll().catch(() => ({ data: [] }))
      ]);

      const formatted = (resDeliveries.data || []).map((d) => ({
        id: d.id,
        internalNumber: d.reference,
        reference: d.reference,
        status: d.status || 'draft',
        movementStatus: d.status === 'done' ? 'delivered' : d.status === 'ready' ? 'packing' : d.status === 'in_progress' ? 'moving' : 'creation',
        destination: d.destination || '',
        to: d.destination || (d.customer ? d.customer.name : 'Customer Destination'),
        from: d.warehouse ? d.warehouse.name : 'Central Stock Room',
        contact: d.customer ? `${d.customer.contactPerson || ''} (${d.customer.phone || ''})` : d.responsible,
        carrier: d.carrier || 'Internal Logistics',
        trackingNumber: d.trackingNumber || '',
        vehicleNumber: d.vehicleNumber || '',
        scheduledDate: d.scheduledDate || '',
        responsible: d.responsible || loggedInUserName,
        sourceDocument: d.sourceDocument || '',
        customerNotes: d.customerNotes || '',
        moNumber: d.moNumber || '',
        customer: d.customer,
        warehouse: d.warehouse,
        taxRate: d.taxRate || 18,
        taxAmount: d.taxAmount || 0,
        subtotal: d.subtotal || 0,
        totalAmount: d.totalAmount || 0,
        items: (d.items || []).map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.name,
          name: item.name,
          sku: item.sku || '',
          qty: item.quantity,
          quantity: item.quantity,
          deliveredQty: item.deliveredQty || 0,
          cost: item.unitCost,
          unitCost: item.unitCost,
          totalPrice: item.totalPrice,
          unit: item.unit || 'Units'
        }))
      }));

      setDeliveriesList(formatted);
      setCustomers(resCustomers.data || []);
      setWarehouses(resWarehouses.data || []);
    } catch (err) {
      console.error('Failed to load deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  // Financial calculations
  const subtotal = useMemo(() => {
    return (delivery.items || []).reduce((acc, item) => acc + (parseFloat(item.totalPrice) || (parseFloat(item.qty || item.quantity || 0) * parseFloat(item.cost || item.unitCost || 0))), 0);
  }, [delivery.items]);

  const taxAmount = useMemo(() => {
    return (subtotal * (delivery.taxRate || 0)) / 100;
  }, [subtotal, delivery.taxRate]);

  const grandTotal = useMemo(() => {
    return subtotal + taxAmount;
  }, [subtotal, taxAmount]);

  const totalUnits = useMemo(() => {
    return (delivery.items || []).reduce((acc, item) => acc + (parseFloat(item.qty || item.quantity) || 0), 0);
  }, [delivery.items]);

  // Stage updates
  const handleStatusChange = async (newStatus) => {
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

    if (delivery.id) {
      try {
        await deliveryApi.update(delivery.id, { status: newStatus });
      } catch (e) {
        console.warn(e);
      }
    }
    showToast(`Delivery status updated to ${newStatus.toUpperCase()}`);
  };

  const handlePick = async () => {
    if (!delivery.id) {
      await handleSaveDelivery();
      return;
    }
    try {
      await deliveryApi.pick(delivery.id);
      const updated = { ...delivery, status: 'in_progress', movementStatus: 'moving' };
      setDelivery(updated);
      showToast(`Delivery ${delivery.internalNumber} marked as In Progress (Picking Complete)`, 'success');
      await fetchDeliveries();
    } catch (err) {
      showToast(err.message || 'Failed to record pick', 'error');
    }
  };

  const handlePack = async () => {
    if (!delivery.id) {
      await handleSaveDelivery();
      return;
    }
    try {
      await deliveryApi.pack(delivery.id);
      const updated = { ...delivery, status: 'ready', movementStatus: 'packing' };
      setDelivery(updated);
      showToast(`Delivery ${delivery.internalNumber} marked as Ready (Packing Complete)`, 'success');
      await fetchDeliveries();
    } catch (err) {
      showToast(err.message || 'Failed to record pack', 'error');
    }
  };

  const handleValidate = async () => {
    if (!delivery.items || delivery.items.length === 0) {
      showToast('Please add at least one product before validating delivery!', 'error');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (delivery.scheduledDate && delivery.scheduledDate < todayStr) {
      showToast('Scheduled date cannot be in the past (must be today or later)!', 'error');
      return;
    }

    try {
      if (delivery.isNew || !delivery.id) {
        const payload = {
          status: 'done',
          scheduledDate: delivery.scheduledDate,
          destination: delivery.to || delivery.destination || 'Customer Destination',
          responsible: delivery.responsible,
          carrier: delivery.carrier,
          trackingNumber: delivery.trackingNumber,
          vehicleNumber: delivery.vehicleNumber,
          customerNotes: delivery.customerNotes,
          subtotal,
          taxRate: delivery.taxRate,
          taxAmount,
          totalAmount: grandTotal,
          customerId: delivery.customer?.id || null,
          warehouseId: delivery.warehouse?.id || null,
          items: delivery.items.map((i) => ({
            productId: i.productId || null,
            name: i.productName || i.name,
            sku: i.sku || null,
            quantity: parseFloat(i.qty || i.quantity) || 1,
            unitCost: parseFloat(i.cost || i.unitCost) || 0,
            totalPrice: parseFloat(i.totalPrice) || 0,
            unit: i.unit || 'Units'
          }))
        };
        const created = await deliveryApi.create(payload);
        const valRes = await deliveryApi.validate(created.data.id);
        showToast(`Delivery ${valRes.data.reference} dispatched & stock decreased!`, 'success');
        await fetchDeliveries();
        setCurrentView('list');
      } else {
        const valRes = await deliveryApi.validate(delivery.id);
        const updated = { ...delivery, status: 'done', movementStatus: 'delivered' };
        setDelivery(updated);
        showToast(`Delivery ${valRes.data.reference} dispatched & stock decreased successfully!`, 'success');
        await fetchDeliveries();
      }
    } catch (err) {
      showToast(err.message || 'Validation failed', 'error');
    }
  };

  const handleSaveDelivery = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (delivery.scheduledDate && delivery.scheduledDate < todayStr) {
      showToast('Scheduled date cannot be in the past (must be today or later)!', 'error');
      return;
    }

    try {
      const payload = {
        status: delivery.status || 'draft',
        scheduledDate: delivery.scheduledDate,
        destination: delivery.to || delivery.destination || 'Customer Destination',
        responsible: delivery.responsible || loggedInUserName,
        carrier: delivery.carrier || 'Internal Logistics',
        trackingNumber: delivery.trackingNumber || '',
        vehicleNumber: delivery.vehicleNumber || '',
        customerNotes: delivery.customerNotes || '',
        subtotal,
        taxRate: delivery.taxRate,
        taxAmount,
        totalAmount: grandTotal,
        customerId: delivery.customer?.id || null,
        warehouseId: delivery.warehouse?.id || null,
        items: delivery.items.map((i) => ({
          productId: i.productId || null,
          name: i.productName || i.name,
          sku: i.sku || null,
          quantity: parseFloat(i.qty || i.quantity) || 1,
          unitCost: parseFloat(i.cost || i.unitCost) || 0,
          totalPrice: parseFloat(i.totalPrice) || 0,
          unit: i.unit || 'Units'
        }))
      };

      if (delivery.isNew || !delivery.id) {
        const res = await deliveryApi.create(payload);
        showToast(`Delivery ${res.data.reference} created successfully!`);
        await fetchDeliveries();
        setCurrentView('list');
      } else {
        await deliveryApi.update(delivery.id, payload);
        showToast(`Delivery ${delivery.internalNumber} updated successfully!`);
        await fetchDeliveries();
      }
    } catch (err) {
      showToast(err.message || 'Failed to save delivery', 'error');
    }
  };

  const handleDeleteDelivery = async (id, ref) => {
    if (window.confirm(`Are you sure you want to delete delivery order ${ref}?`)) {
      try {
        await deliveryApi.delete(id);
        showToast(`Delivery order ${ref} deleted successfully`);
        await fetchDeliveries();
        if (delivery.id === id) {
          setCurrentView('list');
        }
      } catch (err) {
        showToast(err.message || 'Failed to delete delivery', 'error');
      }
    }
  };

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  const handleCancelDelivery = async () => {
    if (window.confirm('Are you sure you want to cancel this delivery order?')) {
      const updated = {
        ...delivery,
        status: 'cancelled'
      };
      setDelivery(updated);
      setDeliveriesList((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      if (delivery.id) {
        try {
          await deliveryApi.update(delivery.id, { status: 'cancelled' });
        } catch (e) {
          console.warn(e);
        }
      }
      showToast(`Delivery ${delivery.internalNumber} marked as Cancelled`, 'info');
    }
  };

  // Open detail view for a selected delivery
  const handleSelectDelivery = (selected) => {
    setDelivery({ ...selected, isNew: false });
    setCurrentView('detail');
  };

  // Create new delivery order draft
  const handleCreateNewDelivery = () => {
    const nextNumeric = deliveriesList.length + 1;
    const nextRef = `WH/OUT/${String(nextNumeric).padStart(3, '0')}`;

    const newDel = {
      id: null,
      isNew: true,
      internalNumber: nextRef,
      reference: nextRef,
      from: warehouses[0]?.name || 'Central Stock Room',
      to: customers[0]?.name || 'Customer / Consignee',
      destination: customers[0]?.address || 'Direct Customer Delivery',
      contact: customers[0] ? `${customers[0].contactPerson || ''} (${customers[0].phone || ''})` : loggedInUserName,
      carrier: 'BlueDart Express',
      trackingNumber: '',
      vehicleNumber: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      responsible: loggedInUserName,
      status: 'draft',
      movementStatus: 'creation',
      customerNotes: '',
      customer: customers[0] || null,
      warehouse: warehouses[0] || null,
      taxRate: 18,
      items: []
    };

    setDelivery(newDel);
    setCurrentView('detail');
    showToast(`Draft delivery ${nextRef} initialized`);
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
      ...delivery,
      items: [...(delivery.items || []), item]
    };
    setDelivery(updated);
    showToast(`Added ${newProduct.productName} to delivery`);
  };

  const handleRemoveProduct = (itemId) => {
    const updated = {
      ...delivery,
      items: (delivery.items || []).filter((item) => item.id !== itemId)
    };
    setDelivery(updated);
    showToast('Product item removed from delivery', 'info');
  };

  const handleItemFieldChange = (itemId, field, value) => {
    const updatedItems = (delivery.items || []).map((item) => {
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

    const updated = { ...delivery, items: updatedItems };
    setDelivery(updated);
  };

  // Status step configuration
  const mainStages = [
    { key: 'draft', label: 'Draft' },
    { key: 'in_progress', label: 'In Progress (Picked)' },
    { key: 'ready', label: 'Ready (Packed)' },
    { key: 'done', label: 'Done (Dispatched)' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-24">
      <Navbar activePage="delivery" />

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
                  <span className="font-semibold text-slate-900 font-mono">{delivery.internalNumber || delivery.reference}</span>
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
            loading={loading}
            onSelectDelivery={handleSelectDelivery}
            onCreateNew={handleCreateNewDelivery}
            onDeleteDelivery={handleDeleteDelivery}
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
                
                {/* Top Bar Options (Left): Pick, Pack, Validate (Dispatch), Save, Print, Cancel, Delete */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={handlePick}
                    disabled={delivery.status === 'in_progress' || delivery.status === 'ready' || delivery.status === 'done' || delivery.status === 'cancelled'}
                    className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                      delivery.status === 'in_progress' || delivery.status === 'ready' || delivery.status === 'done'
                        ? 'bg-blue-50 text-blue-700 border-blue-200 opacity-80 cursor-default'
                        : 'bg-blue-600 hover:bg-blue-700 text-white border-transparent'
                    }`}
                  >
                    <Box className="w-4 h-4" />
                    1. Pick
                  </button>

                  <button
                    onClick={handlePack}
                    disabled={delivery.status === 'ready' || delivery.status === 'done' || delivery.status === 'cancelled'}
                    className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                      delivery.status === 'ready' || delivery.status === 'done'
                        ? 'bg-purple-50 text-purple-700 border-purple-200 opacity-80 cursor-default'
                        : 'bg-purple-600 hover:bg-purple-700 text-white border-transparent'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    2. Pack
                  </button>

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
                    {delivery.status === 'done' ? 'Dispatched & Decreased' : '3. Validate & Dispatch'}
                  </button>

                  <button
                    onClick={handleSaveDelivery}
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
                    Print Challan
                  </button>

                  <button
                    onClick={handleCancelDelivery}
                    disabled={delivery.status === 'cancelled'}
                    className="px-3.5 py-2 text-xs sm:text-sm font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel
                  </button>

                  {delivery.id && (
                    <button
                      onClick={() => handleDeleteDelivery(delivery.id, delivery.internalNumber || delivery.reference)}
                      className="px-3.5 py-2 text-xs sm:text-sm font-medium text-rose-700 hover:bg-rose-100/70 border border-rose-300 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>

                {/* Status Pipeline (Right) */}
                <div className="flex items-center overflow-x-auto pb-1 lg:pb-0">
                  <div className="inline-flex bg-slate-100/80 p-1 rounded-xl border border-slate-200 text-xs">
                    {mainStages.map((stage) => {
                      const isActive = (delivery.status || 'draft') === stage.key;
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
            </div>

            {/* Document Details & Product Lines */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-6 space-y-6">
                
                {/* Header Reference */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                      Outward Delivery Order
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 mt-1">
                      {delivery.internalNumber || delivery.reference}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Scheduled Dispatch</span>
                      <span className="text-sm font-semibold text-slate-800 font-mono">
                        {delivery.scheduledDate || 'Today'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Source Warehouse */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Source Warehouse (From) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={delivery.warehouse?.id || ''}
                      onChange={(e) => {
                        const wh = warehouses.find((w) => w.id === parseInt(e.target.value));
                        setDelivery({
                          ...delivery,
                          warehouse: wh || null,
                          from: wh ? wh.name : 'Central Stock Room'
                        });
                      }}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-800"
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

                  {/* Customer / Consignee */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Customer / Consignee (To) <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={delivery.to || delivery.customer?.name || ''}
                        onChange={(e) => setDelivery({ ...delivery, to: e.target.value })}
                        placeholder="Select or enter customer name..."
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomerModalOpen(true)}
                        className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Pick from customer directory"
                      >
                        <User className="w-4 h-4" />
                        Pick
                      </button>
                    </div>
                  </div>

                  {/* Destination Address */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Destination Address
                    </label>
                    <input
                      type="text"
                      placeholder="Delivery site / address..."
                      value={delivery.destination || ''}
                      onChange={(e) => setDelivery({ ...delivery, destination: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-medium text-slate-800"
                    />
                  </div>

                  {/* Scheduled Dispatch Date */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Scheduled Date
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={delivery.scheduledDate || ''}
                      onChange={(e) => setDelivery({ ...delivery, scheduledDate: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-800"
                    />
                  </div>

                  {/* Carrier Logistics */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Carrier / Transporter
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BlueDart Express, VRL Logistics"
                      value={delivery.carrier || ''}
                      onChange={(e) => setDelivery({ ...delivery, carrier: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-medium text-slate-800"
                    />
                  </div>

                  {/* Tracking / Vehicle Number */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Tracking / Vehicle Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TRK-881920 or MH-12-AB-9921"
                      value={delivery.trackingNumber || ''}
                      onChange={(e) => setDelivery({ ...delivery, trackingNumber: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-mono text-slate-800"
                    />
                  </div>

                </div>

                {/* Product Items Table */}
                <div className="pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Dispatched Products & Materials</h3>
                      <p className="text-xs text-slate-500">Items to pick, pack, and ship to the customer</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddProductOpen(true)}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
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
                          <th className="py-2.5 px-3 w-32 text-right">Unit Price (₹)</th>
                          <th className="py-2.5 px-3 w-32 text-right">Total Price (₹)</th>
                          <th className="py-2.5 px-2 w-10"></th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100 bg-white">
                        {(!delivery.items || delivery.items.length === 0) ? (
                          <tr>
                            <td colSpan="7" className="py-8 text-center text-slate-400">
                              <Package className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                              <p className="font-medium text-slate-600 text-xs">No products in this delivery order</p>
                              <button
                                type="button"
                                onClick={() => setIsAddProductOpen(true)}
                                className="text-xs font-semibold text-emerald-600 hover:underline mt-1 inline-block cursor-pointer"
                              >
                                + Add First Item
                              </button>
                            </td>
                          </tr>
                        ) : (
                          delivery.items.map((item) => (
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
                      Customer Delivery Instructions & Gate Pass Notes
                    </label>
                    <textarea
                      rows="3"
                      value={delivery.customerNotes || ''}
                      onChange={(e) => setDelivery({ ...delivery, customerNotes: e.target.value })}
                      placeholder="Special handling, pallet numbers, driver instructions..."
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
                        <span className="text-sm font-bold text-slate-900">Total Order Value:</span>
                        <span className="text-lg font-bold font-mono text-emerald-700">
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
          setDelivery({
            ...delivery,
            customer: selectedCust,
            to: selectedCust.name,
            destination: selectedCust.address || selectedCust.name,
            contact: `${selectedCust.contactPerson || ''} (${selectedCust.phone || ''})`
          });
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
