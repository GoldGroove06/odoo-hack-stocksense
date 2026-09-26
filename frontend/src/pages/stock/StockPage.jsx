import React, { useState, useEffect, useMemo } from 'react';
import {
  Boxes,
  Search,
  Plus,
  Edit3,
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  X,
  Trash2
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { productApi, categoryApi, locationApi } from '../../services/api';

export default function StockPage() {
  const [stocks, setStocks] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  
  // Update Stock Modal State
  const [editingStock, setEditingStock] = useState(null);
  const [updateQuantity, setUpdateQuantity] = useState('');
  const [updateReason, setUpdateReason] = useState('Physical Stock Audit / Recount');
  
  // Add New Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: 'Electronics',
    unit: 'Units',
    perUnitCost: '',
    onHand: '',
    locationId: '',
    productKind: 'TRADING',
    materialType: 'FINISHED_GOODS',
    bomLines: []
  });
  const [bomComponentId, setBomComponentId] = useState('');
  const [bomQty, setBomQty] = useState(1);

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch stocks and locations from backend API
  const fetchStocksAndLocations = async () => {
    setLoading(true);
    try {
      // 1. Fetch Products
      try {
        const prodRes = await productApi.getAll();
        if (prodRes && Array.isArray(prodRes.data)) {
          const mapped = prodRes.data.map((p) => {
            const quants = (p.stockQuants || []).map((q) => ({
              locationId: q.locationId,
              locationName: q.location?.name || q.location?.shortcode || `Loc #${q.locationId}`,
              quantity: Number(q.quantity) || 0,
              reservedQty: Number(q.reservedQty) || 0,
              freeQty:
                q.freeQty != null
                  ? Number(q.freeQty)
                  : Math.max(0, (Number(q.quantity) || 0) - (Number(q.reservedQty) || 0))
            }));
            const reserved = quants.reduce((s, q) => s + q.reservedQty, 0);
            return {
              id: p.id,
              name: p.name,
              sku: p.sku,
              category: p.category?.name || p.category || 'General',
              unit: p.uom?.name || p.unit || 'Units',
              perUnitCost: Number(p.perUnitCost) || 0,
              onHand: Number(p.onHand) || 0,
              reserved,
              freeToUse: Number(p.freeToUse ?? p.onHand) || 0,
              location: p.location?.name || p.location || 'Unassigned',
              locationId: p.locationId || p.location?.id || null,
              stockQuants: quants,
              productKind: p.productKind || 'TRADING',
              materialType: p.materialType || 'FINISHED_GOODS',
              minStockAlert: Number(p.minStockAlert) || 10
            };
          });
          setStocks(mapped);
        } else {
          setStocks([]);
        }
      } catch (err) {
        console.warn('Backend API error for stocks:', err.message);
        setStocks([]);
      }

      // 2. Fetch Locations
      try {
        const locRes = await locationApi.getAll();
        if (locRes && Array.isArray(locRes.data)) {
          setLocations(locRes.data);
          if (!newProduct.locationId && locRes.data.length > 0) {
            setNewProduct((prev) => ({ ...prev, locationId: String(locRes.data[0].id) }));
          }
        } else {
          setLocations([]);
        }
      } catch (err) {
        setLocations([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocksAndLocations();
  }, []);

  // Filter stocks
  const filteredStocks = useMemo(() => {
    return stocks.filter((item) => {
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          (item.location && item.location.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [stocks, categoryFilter, searchQuery]);

  // Handle Quick Stock Update
  const handleOpenUpdateModal = (stock) => {
    setEditingStock(stock);
    setUpdateQuantity(stock.onHand);
    setUpdateReason('Physical Count Verification');
  };

  const handleSaveStockUpdate = async (e) => {
    e.preventDefault();
    if (!editingStock) return;

    const newOnHand = parseFloat(updateQuantity) || 0;
    const reserved = editingStock.reserved || 0;
    const newFreeToUse = Math.max(0, newOnHand - reserved);

    // Call API if possible
    try {
      await productApi.update(editingStock.id, {
        onHand: newOnHand,
        freeToUse: newFreeToUse
      });
    } catch (err) {
      console.warn('API update failed, updating local state:', err.message);
    }

    const updated = stocks.map((item) => {
      if (item.id === editingStock.id) {
        return {
          ...item,
          onHand: newOnHand,
          freeToUse: newFreeToUse
        };
      }
      return item;
    });

    setStocks(updated);
    showToast(`Stock for "${editingStock.name}" updated to ${newOnHand} ${editingStock.unit} (${updateReason})`);
    setEditingStock(null);
  };

  // Handle Add New Product
  const handleAddNewProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name.trim()) return;

    const onHand = parseFloat(newProduct.onHand) || 0;
    const cost = parseFloat(newProduct.perUnitCost) || 0;
    const sku = newProduct.sku.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`;
    const locationId = newProduct.locationId ? Number(newProduct.locationId) : null;
    const locName = locations.find((l) => l.id === locationId)?.name || 'Unassigned';

    const showBom =
      newProduct.productKind === 'MANUFACTURING' &&
      newProduct.materialType === 'FINISHED_GOODS';

    const payload = {
      name: newProduct.name.trim(),
      sku: sku,
      perUnitCost: cost,
      onHand: onHand,
      freeToUse: onHand,
      minStockAlert: 10,
      locationId,
      productKind: newProduct.productKind,
      materialType: newProduct.materialType,
      bomLines: showBom
        ? (newProduct.bomLines || []).map((l) => ({
            componentProductId: Number(l.componentProductId),
            quantity: Number(l.quantity) || 1
          }))
        : []
    };

    let newItem = {
      id: `stk-${Date.now()}`,
      name: newProduct.name.trim(),
      sku: sku,
      category: newProduct.category,
      unit: newProduct.unit,
      perUnitCost: cost,
      onHand: onHand,
      reserved: 0,
      freeToUse: onHand,
      location: locName,
      locationId,
      productKind: newProduct.productKind,
      materialType: newProduct.materialType,
      minStockAlert: 10
    };

    try {
      const res = await productApi.create(payload);
      if (res && res.data) {
        newItem = {
          ...newItem,
          id: res.data.id,
          sku: res.data.sku,
          category: res.data.category?.name || newProduct.category,
          unit: res.data.uom?.name || newProduct.unit,
          location: res.data.location?.name || locName,
          locationId: res.data.locationId || locationId,
          productKind: res.data.productKind || newProduct.productKind,
          materialType: res.data.materialType || newProduct.materialType
        };
      }
    } catch (err) {
      console.warn('API create fallback to local state:', err.message);
      showToast(err.message || 'Failed to create product', 'error');
      return;
    }

    setStocks([newItem, ...stocks]);
    setIsAddModalOpen(false);
    setNewProduct({
      name: '',
      sku: '',
      category: 'Electronics',
      unit: 'Units',
      perUnitCost: '',
      onHand: '',
      locationId: locations[0] ? String(locations[0].id) : '',
      productKind: 'TRADING',
      materialType: 'FINISHED_GOODS',
      bomLines: []
    });
    setBomComponentId('');
    setBomQty(1);
    showToast(`Added new stock item "${newItem.name}"`);
  };

  // Delete Stock Item
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [stockToDelete, setStockToDelete] = useState(null);

  const handleDeleteStock = async () => {
    if (!stockToDelete) return;
    try {
      try {
        await productApi.delete(stockToDelete.id);
      } catch (err) {
        console.warn('API delete stock product fallback to local:', err.message);
      }
      setStocks(stocks.filter((s) => s.id !== stockToDelete.id));
      showToast(`Stock item "${stockToDelete.name}" deleted successfully!`);
      setIsDeleteModalOpen(false);
      setStockToDelete(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete stock product', 'error');
    }
  };

  const categories = ['ALL', ...Array.from(new Set(stocks.map((s) => s.category)))];

  const totalStockValue = stocks.reduce((acc, s) => acc + s.onHand * s.perUnitCost, 0);
  const totalOnHandUnits = stocks.reduce((acc, s) => acc + s.onHand, 0);
  const totalFreeToUseUnits = stocks.reduce((acc, s) => acc + s.freeToUse, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-24">
      <Navbar activePage="stock" />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2.5 ${
              toastMessage.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Header & KPI Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Boxes className="w-6 h-6 text-indigo-600" />
              Available Stock & Inventory
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live warehouse inventory balances, per unit costs, on-hand count, and free-to-use allocation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchStocksAndLocations}
              title="Refresh from API"
              className="p-2 text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              Add Stock Product
            </button>
          </div>
        </div>

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Total Stock Valuation
            </span>
            <span className="text-xl font-bold font-mono text-slate-900">
              ₹{totalStockValue.toLocaleString()}
            </span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Total Physical On-Hand
            </span>
            <span className="text-xl font-bold font-mono text-indigo-700">
              {totalOnHandUnits.toLocaleString()} <span className="text-xs font-normal text-slate-500">Units</span>
            </span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Total Free to Use (Unreserved)
            </span>
            <span className="text-xl font-bold font-mono text-emerald-700">
              {totalFreeToUseUnits.toLocaleString()} <span className="text-xs font-normal text-slate-500">Units</span>
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search product name, SKU, or rack location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Stock Table (Tabular Format: Product, Per Unit Cost, On Hand, Free To Use, Action) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 min-w-[220px]">Product Name & SKU</th>
                  <th className="py-3.5 px-4 w-28 text-center">Category</th>
                  <th className="py-3.5 px-4 w-32 text-right">Per Unit Cost (₹)</th>
                  <th className="py-3.5 px-4 w-32 text-right font-bold text-slate-800">On Hand</th>
                  <th className="py-3.5 px-4 w-32 text-right font-bold text-emerald-700">Free to Use</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Stock by Location (free/on hand)</th>
                  <th className="py-3.5 px-4 w-36 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredStocks.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-14 text-center text-slate-400">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                        <Boxes className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-slate-700 text-sm">No stock items in inventory</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        No product stocks recorded in the database yet. Click below to add an inventory product.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Stock Product
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredStocks.map((stk) => {
                    const isLowStock = stk.onHand <= stk.minStockAlert;

                    return (
                      <tr key={stk.id} className="hover:bg-slate-50/70 transition-colors group">
                        {/* Product Name & SKU */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {stk.name}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>SKU: {stk.sku}</span>
                            {isLowStock && (
                              <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-sans font-semibold text-[10px]">
                                Low Stock Alert
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                            {stk.category}
                          </span>
                        </td>

                        {/* Per Unit Cost */}
                        <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-800">
                          ₹{stk.perUnitCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* On Hand */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                          {stk.onHand}{' '}
                          <span className="text-xs font-sans font-normal text-slate-500">{stk.unit}</span>
                        </td>

                        {/* Free to Use */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700 text-sm">
                          {stk.freeToUse}{' '}
                          <span className="text-xs font-sans font-normal text-emerald-600/80">{stk.unit}</span>
                          {stk.reserved > 0 && (
                            <div className="text-[10px] text-slate-400 font-sans font-normal">
                              ({stk.reserved} Reserved)
                            </div>
                          )}
                        </td>

                        {/* Location / Availability per bay */}
                        <td className="py-3.5 px-4 text-slate-600 text-xs">
                          {stk.stockQuants && stk.stockQuants.length > 0 ? (
                            <div className="space-y-1 max-w-[220px]">
                              {stk.stockQuants.map((q) => (
                                <div
                                  key={`${stk.id}-${q.locationId}`}
                                  className="flex items-center justify-between gap-2 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200"
                                >
                                  <span className="font-mono text-[10px] text-slate-600 truncate" title={q.locationName}>
                                    {q.locationName}
                                  </span>
                                  <span className="font-semibold text-emerald-700 whitespace-nowrap">
                                    {q.freeQty}
                                    <span className="text-slate-400 font-normal">/{q.quantity}</span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 font-mono text-[11px] block line-clamp-1">
                              {stk.location || 'No stock locations'}
                            </span>
                          )}
                        </td>

                        {/* Actions: Update Stock & Delete */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenUpdateModal(stk)}
                              className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              title="Update stock count"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Update
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setStockToDelete(stk);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
            <span>Showing <strong>{filteredStocks.length}</strong> items in inventory</span>
            <span>Click <strong>"Update"</strong> to change on-hand quantities or <strong>"Trash"</strong> to remove items.</span>
          </div>
        </div>

      </main>

      {/* UPDATE STOCK MODAL */}
      {editingStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">Update Stock On Hand</h3>
                  <p className="text-xs text-slate-500">{editingStock.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingStock(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStockUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Product SKU & Location
                </label>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="font-mono font-semibold text-slate-800">SKU: {editingStock.sku}</div>
                  <div className="text-slate-600">{editingStock.location}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Current On Hand
                  </label>
                  <div className="p-2 bg-slate-100 rounded-lg text-sm font-mono font-bold text-slate-700">
                    {editingStock.onHand} {editingStock.unit}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    New On Hand Count *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={updateQuantity}
                    onChange={(e) => setUpdateQuantity(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Update Reason / Justification
                </label>
                <select
                  value={updateReason}
                  onChange={(e) => setUpdateReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white text-slate-800"
                >
                  <option value="Physical Stock Audit / Recount">Physical Stock Audit / Recount</option>
                  <option value="Supplier Replacement Received">Supplier Replacement Received</option>
                  <option value="Damaged Stock Written Off">Damaged Stock Written Off</option>
                  <option value="Unregistered Return">Unregistered Return</option>
                  <option value="Cycle Count Discrepancy Fix">Cycle Count Discrepancy Fix</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStock(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Save Stock Count
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">Add New Product to Inventory</h3>
                  <p className="text-xs text-slate-500">Create new item record with location and cost</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Copper Heat Sink Module 50mm"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">SKU / Code</label>
                  <input
                    type="text"
                    placeholder="e.g. HSK-COP-50"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Consumables">Consumables</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Cabling">Cabling</option>
                    <option value="Energy">Energy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Per Unit Cost (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={newProduct.perUnitCost}
                    onChange={(e) => setNewProduct({ ...newProduct, perUnitCost: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Initial On Hand *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="100"
                    value={newProduct.onHand}
                    onChange={(e) => setNewProduct({ ...newProduct, onHand: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Unit</label>
                  <select
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="Units">Units</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Kg">Kg</option>
                    <option value="Box">Box</option>
                    <option value="Cartridge">Cartridge</option>
                    <option value="Drum">Drum</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Product Kind</label>
                  <select
                    value={newProduct.productKind}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        productKind: e.target.value,
                        bomLines:
                          e.target.value === 'MANUFACTURING' &&
                          newProduct.materialType === 'FINISHED_GOODS'
                            ? newProduct.bomLines
                            : []
                      })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="TRADING">Trading</option>
                    <option value="MANUFACTURING">Manufacturing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Material Type</label>
                  <select
                    value={newProduct.materialType}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        materialType: e.target.value,
                        bomLines:
                          newProduct.productKind === 'MANUFACTURING' &&
                          e.target.value === 'FINISHED_GOODS'
                            ? newProduct.bomLines
                            : []
                      })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="RAW_MATERIAL">Raw Material</option>
                    <option value="FINISHED_GOODS">Finished Goods</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Warehouse Storage Location</label>
                <select
                  value={newProduct.locationId}
                  onChange={(e) => setNewProduct({ ...newProduct, locationId: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-xs"
                >
                  <option value="">Select location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              {newProduct.productKind === 'MANUFACTURING' &&
                newProduct.materialType === 'FINISHED_GOODS' && (
                  <div className="space-y-2 p-3 rounded-xl bg-violet-50/50 border border-violet-100">
                    <label className="block text-xs font-semibold text-violet-900">
                      Bill of Materials (BOM)
                    </label>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <select
                          value={bomComponentId}
                          onChange={(e) => setBomComponentId(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                        >
                          <option value="">Component product</option>
                          {stocks.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.sku})
                            </option>
                          ))}
                        </select>
                      </div>
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={bomQty}
                        onChange={(e) => setBomQty(e.target.value)}
                        className="w-20 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono"
                        placeholder="Qty"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!bomComponentId) return;
                          const comp = stocks.find((s) => s.id === Number(bomComponentId));
                          setNewProduct({
                            ...newProduct,
                            bomLines: [
                              ...(newProduct.bomLines || []),
                              {
                                componentProductId: Number(bomComponentId),
                                quantity: parseFloat(bomQty) || 1,
                                name: comp?.name || `Product #${bomComponentId}`
                              }
                            ]
                          });
                          setBomComponentId('');
                          setBomQty(1);
                        }}
                        className="px-2.5 py-1.5 text-xs font-semibold text-violet-700 bg-white border border-violet-200 rounded-lg cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                    {(newProduct.bomLines || []).length > 0 && (
                      <ul className="space-y-1">
                        {newProduct.bomLines.map((line, idx) => (
                          <li
                            key={`${line.componentProductId}-${idx}`}
                            className="flex items-center justify-between text-xs text-slate-700 bg-white rounded-lg px-2.5 py-1.5 border border-slate-100"
                          >
                            <span>
                              {line.name || `Product #${line.componentProductId}`} × {line.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setNewProduct({
                                  ...newProduct,
                                  bomLines: newProduct.bomLines.filter((_, i) => i !== idx)
                                })
                              }
                              className="text-rose-500 hover:text-rose-700 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE STOCK MODAL */}
      {isDeleteModalOpen && stockToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Stock Item?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong className="text-slate-800 font-semibold">{stockToDelete.name}</strong> ({stockToDelete.sku}) from inventory? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setStockToDelete(null);
                }}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteStock}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
