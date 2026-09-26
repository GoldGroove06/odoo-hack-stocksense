import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Package,
  Layers,
  Check,
  RotateCcw,
  X,
  Building2,
  User,
  ArrowRight,
  Trash2
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { adjustmentApi, productApi, locationApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdjustmentPage() {
  const { user } = useAuth();
  const canValidate = user?.role === 'OWNER' || user?.role === 'INVENTORY_MANAGER';
  const [adjustments, setAdjustments] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newAdj, setNewAdj] = useState({
    productId: '',
    locationId: '',
    countedQty: '',
    reason: 'Physical cycle count variance',
    responsible: 'Rohit Maurya',
    notes: ''
  });

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchAdjustmentsData = async () => {
    try {
      setLoading(true);
      const [resAdj, resProd, resLoc] = await Promise.all([
        adjustmentApi.getAll().catch(() => ({ data: [] })),
        productApi.getAll().catch(() => ({ data: [] })),
        locationApi.getAll().catch(() => ({ data: [] }))
      ]);

      setAdjustments(resAdj.data || []);
      setProducts(resProd.data || []);
      setLocations(resLoc.data || []);

      if (resProd.data && resProd.data.length > 0 && !newAdj.productId) {
        setNewAdj((prev) => ({ ...prev, productId: resProd.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load adjustments data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdjustmentsData();
  }, []);

  const selectedStockProduct = products.find((s) => s.id === parseInt(newAdj.productId)) || products[0];

  const handleApplyAdjustment = async (adjId, ref) => {
    try {
      const res = await adjustmentApi.validate(adjId);
      showToast(`Adjustment ${ref || res.data?.reference} applied & physical stock updated!`, 'success');
      await fetchAdjustmentsData();
    } catch (err) {
      showToast(err.message || 'Failed to apply adjustment', 'error');
    }
  };

  const handleDeleteAdjustment = async (adjId, ref) => {
    if (window.confirm(`Are you sure you want to delete adjustment record ${ref}?`)) {
      try {
        await adjustmentApi.delete(adjId);
        showToast(`Adjustment ${ref} deleted successfully`);
        await fetchAdjustmentsData();
      } catch (err) {
        showToast(err.message || 'Failed to delete adjustment', 'error');
      }
    }
  };

  const handleCreateAdjustment = async (e) => {
    e.preventDefault();
    if (!selectedStockProduct) {
      showToast('Please select a product for stock adjustment', 'error');
      return;
    }

    const counted = parseFloat(newAdj.countedQty) || 0;
    const theoretical = selectedStockProduct.onHand || 0;
    const diff = counted - theoretical;

    try {
      const payload = {
        countedDate: new Date().toISOString().split('T')[0],
        locationId: newAdj.locationId ? parseInt(newAdj.locationId) : null,
        reason: newAdj.reason || 'Physical Stock Audit / Recount',
        responsible: newAdj.responsible || 'Rohit Maurya',
        notes: newAdj.notes,
        items: [
          {
            productId: selectedStockProduct.id,
            name: selectedStockProduct.name,
            sku: selectedStockProduct.sku,
            theoreticalQty: theoretical,
            countedQty: counted,
            perUnitCost: selectedStockProduct.perUnitCost || 0,
            unit: selectedStockProduct.uom?.name || 'Units'
          }
        ]
      };

      const res = await adjustmentApi.create(payload);
      showToast(`Draft adjustment ${res.data.reference} created with variance of ${diff > 0 ? '+' : ''}${diff} units!`);
      setIsNewModalOpen(false);
      setNewAdj({
        productId: products[0]?.id || '',
        locationId: '',
        countedQty: '',
        reason: 'Physical cycle count variance',
        responsible: 'Rohit Maurya',
        notes: ''
      });
      await fetchAdjustmentsData();
    } catch (err) {
      showToast(err.message || 'Failed to create adjustment', 'error');
    }
  };

  const filteredAdjustments = adjustments.filter((adj) => {
    const isDone = adj.status === 'done' || adj.status === 'Applied';
    const isDraft = adj.status === 'draft' || adj.status === 'Draft';
    if (statusFilter === 'Draft' && !isDraft) return false;
    if (statusFilter === 'Applied' && !isDone) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const firstItem = adj.items && adj.items[0];
      const matchRef = (adj.reference || '').toLowerCase().includes(q);
      const matchReason = (adj.reason || '').toLowerCase().includes(q);
      const matchProd = (firstItem?.name || '').toLowerCase().includes(q);
      return matchRef || matchReason || matchProd;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-24">
      <Navbar activePage="adjustments" />

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
            {toastMessage.type === 'error' ? (
              <XCircle className="w-4 h-4 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <SlidersHorizontal className="w-6 h-6 text-amber-600" />
              Physical Inventory Adjustments
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Reconcile theoretical system quantities with real physical warehouse counts and write off variances.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 active:scale-98 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            New Stock Count
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search reference (ADJ/...), product, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white text-slate-700 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Applied">Applied (Done)</option>
            </select>
          </div>
        </div>

        {/* Adjustments Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Reference</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Product / Item</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4 text-right">Theoretical (System)</th>
                  <th className="py-3.5 px-4 text-right">Counted (Physical)</th>
                  <th className="py-3.5 px-4 text-right">Difference (Variance)</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-slate-400">
                      <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-3" />
                      <p className="font-medium text-slate-600">Loading inventory adjustments...</p>
                    </td>
                  </tr>
                ) : filteredAdjustments.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-16 text-center text-slate-400">
                      <SlidersHorizontal className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                      <p className="font-bold text-slate-700 text-base">No Adjustments Recorded</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        There are currently no physical inventory count variance records in the database.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsNewModalOpen(true)}
                        className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Record First Physical Count
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredAdjustments.map((adj) => {
                    const item = adj.items && adj.items[0] ? adj.items[0] : {};
                    const isDone = adj.status === 'done' || adj.status === 'Applied';
                    const diff = item.variance !== undefined ? item.variance : (item.difference || 0);

                    return (
                      <tr key={adj.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-700">
                          {adj.reference}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {adj.countedDate || adj.date || 'Today'}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-900">{item.name || item.productName || 'General Item'}</div>
                          <div className="text-[11px] font-mono text-slate-400">{item.sku || '—'}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                          {adj.location?.name || 'General Inventory'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-700">
                          {item.theoreticalQty || 0} {item.unit || 'Units'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                          {item.countedQty || 0} {item.unit || 'Units'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold">
                          {diff === 0 ? (
                            <span className="text-slate-400">0</span>
                          ) : diff > 0 ? (
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">+{diff} {item.unit || 'Units'}</span>
                          ) : (
                            <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">{diff} {item.unit || 'Units'}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isDone
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isDone ? 'Applied (Done)' : 'Draft'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {!isDone ? (
                              canValidate ? (
                                <button
                                  type="button"
                                  onClick={() => handleApplyAdjustment(adj.id, adj.reference)}
                                  className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                                  title="Apply adjustment and update stock"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Apply
                                </button>
                              ) : (
                                <span className="text-xs text-amber-700 font-medium">Awaiting approval</span>
                              )
                            ) : (
                              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                Reconciled
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteAdjustment(adj.id, adj.reference)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete adjustment"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </div>
      </main>

      {/* New Adjustment Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">New Physical Inventory Count</h3>
                  <p className="text-xs text-slate-500">Record physical count and calculate variance</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdjustment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Product to Count <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newAdj.productId}
                  onChange={(e) => setNewAdj({ ...newAdj, productId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white font-medium"
                  required
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku || 'SKU N/A'}) — System On-Hand: {p.onHand} {p.uom?.name || 'Units'}
                    </option>
                  ))}
                  {products.length === 0 && (
                    <option value="">No products found in database</option>
                  )}
                </select>
              </div>

              {selectedStockProduct && (
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>Theoretical System On-Hand:</span>
                    <strong className="font-mono text-slate-900">{selectedStockProduct.onHand} {selectedStockProduct.uom?.name || 'Units'}</strong>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Unit Valuation Cost:</span>
                    <strong className="font-mono text-slate-900">₹{selectedStockProduct.perUnitCost?.toLocaleString()}</strong>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Actual Physical Counted Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  placeholder="e.g. 35"
                  value={newAdj.countedQty}
                  onChange={(e) => setNewAdj({ ...newAdj, countedQty: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold font-mono text-slate-900 focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Warehouse Location
                </label>
                <select
                  value={newAdj.locationId}
                  onChange={(e) => setNewAdj({ ...newAdj, locationId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white"
                >
                  <option value="">General Stock Location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.shortcode || 'LOC'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Adjustment
                </label>
                <input
                  type="text"
                  value={newAdj.reason}
                  onChange={(e) => setNewAdj({ ...newAdj, reason: e.target.value })}
                  placeholder="e.g. Annual Cycle Count Variance, Spoilage, Damage"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Create Draft Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
