import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { INITIAL_ADJUSTMENTS, INITIAL_STOCKS, INITIAL_LOCATIONS } from '../../data/inventoryStore';

export default function AdjustmentPage() {
  const [adjustments, setAdjustments] = useState(INITIAL_ADJUSTMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newAdj, setNewAdj] = useState({
    productId: INITIAL_STOCKS[0].id,
    countedQty: '',
    reason: 'Physical cycle count variance',
    responsible: 'Rohit Maurya'
  });

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const selectedStockProduct = INITIAL_STOCKS.find((s) => s.id === newAdj.productId) || INITIAL_STOCKS[0];

  const handleApplyAdjustment = (adjId) => {
    const updated = adjustments.map((adj) => {
      if (adj.id === adjId) {
        return { ...adj, status: 'Applied' };
      }
      return adj;
    });
    setAdjustments(updated);
    showToast(`Inventory adjustment applied & physical stock updated!`);
  };

  const handleCreateAdjustment = (e) => {
    e.preventDefault();
    const counted = parseFloat(newAdj.countedQty) || 0;
    const theoretical = selectedStockProduct.onHand;
    const diff = counted - theoretical;
    const nextRef = `ADJ/2026/${String(adjustments.length + 1).padStart(3, '0')}`;

    const newRecord = {
      id: `adj-${Date.now()}`,
      reference: nextRef,
      date: new Date().toISOString().split('T')[0],
      productName: selectedStockProduct.name,
      sku: selectedStockProduct.sku,
      unit: selectedStockProduct.unit,
      location: selectedStockProduct.location,
      theoreticalQty: theoretical,
      countedQty: counted,
      difference: diff,
      reason: newAdj.reason,
      responsible: newAdj.responsible,
      status: 'Draft'
    };

    setAdjustments([newRecord, ...adjustments]);
    setIsNewModalOpen(false);
    showToast(`Draft adjustment ${nextRef} created with difference of ${diff > 0 ? '+' : ''}${diff} ${selectedStockProduct.unit}`);
  };

  const filteredAdjustments = adjustments.filter((adj) => {
    if (statusFilter !== 'ALL' && adj.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return adj.reference.toLowerCase().includes(q) || adj.productName.toLowerCase().includes(q) || adj.reason.toLowerCase().includes(q);
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
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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
              <option value="Applied">Applied</option>
            </select>
          </div>
        </div>

        {/* Adjustments Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 min-w-[130px]">Reference</th>
                  <th className="py-3.5 px-4 min-w-[120px]">Date</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Product & SKU</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Location</th>
                  <th className="py-3.5 px-4 text-right w-28">Theoretical</th>
                  <th className="py-3.5 px-4 text-right w-28">Counted Qty</th>
                  <th className="py-3.5 px-4 text-right w-28 font-semibold">Difference</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Reason</th>
                  <th className="py-3.5 px-4 w-24 text-center">Status</th>
                  <th className="py-3.5 px-4 w-28 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredAdjustments.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-12 text-center text-slate-400">
                      <SlidersHorizontal className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-medium text-slate-600">No inventory adjustments found</p>
                    </td>
                  </tr>
                ) : (
                  filteredAdjustments.map((adj) => {
                    const isPositive = adj.difference > 0;
                    const isNegative = adj.difference < 0;
                    const isZero = adj.difference === 0;

                    return (
                      <tr key={adj.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {adj.reference}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 font-medium text-xs">
                          {adj.date}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{adj.productName}</div>
                          <div className="text-[11px] font-mono text-slate-400">SKU: {adj.sku}</div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 text-xs">
                          <span className="bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 font-mono text-[11px] block line-clamp-1">
                            {adj.location}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-slate-600 font-medium">
                          {adj.theoreticalQty} {adj.unit}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                          {adj.countedQty} {adj.unit}
                        </td>

                        {/* Difference */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-sm">
                          <span
                            className={
                              isPositive
                                ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200'
                                : isNegative
                                ? 'text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200'
                                : 'text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg'
                            }
                          >
                            {isPositive ? `+${adj.difference}` : adj.difference} {adj.unit}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-slate-700">
                          <div className="line-clamp-1">{adj.reason}</div>
                          <div className="text-[11px] text-slate-400">By {adj.responsible}</div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              adj.status === 'Applied'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {adj.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {adj.status === 'Draft' ? (
                            <button
                              type="button"
                              onClick={() => handleApplyAdjustment(adj.id)}
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                            >
                              Apply
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs flex items-center justify-center gap-1">
                              <Check className="w-3.5 h-3.5 text-emerald-600" /> Done
                            </span>
                          )}
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

      {/* NEW ADJUSTMENT MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-semibold">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">New Stock Count Adjustment</h3>
                  <p className="text-xs text-slate-500">Record physical stock count variance</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdjustment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Select Product *</label>
                <select
                  value={newAdj.productId}
                  onChange={(e) => setNewAdj({ ...newAdj, productId: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                >
                  {INITIAL_STOCKS.map((stk) => (
                    <option key={stk.id} value={stk.id}>
                      {stk.name} ({stk.sku}) — System: {stk.onHand} {stk.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="text-slate-500">Location: <strong className="text-slate-800 font-mono">{selectedStockProduct.location}</strong></div>
                <div className="text-slate-500">Theoretical System Count: <strong className="text-indigo-700 font-mono">{selectedStockProduct.onHand} {selectedStockProduct.unit}</strong></div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Real Counted Physical Quantity *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  placeholder="Enter physical count"
                  value={newAdj.countedQty}
                  onChange={(e) => setNewAdj({ ...newAdj, countedQty: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none font-bold font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Reason / Justification</label>
                <input
                  type="text"
                  required
                  value={newAdj.reason}
                  onChange={(e) => setNewAdj({ ...newAdj, reason: e.target.value })}
                  placeholder="e.g. Broken in transit, Discarded, Found in bay"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
                >
                  Create Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
