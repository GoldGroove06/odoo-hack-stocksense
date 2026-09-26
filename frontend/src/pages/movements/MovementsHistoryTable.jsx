import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Download,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  User,
  Package,
  Building2,
  ShieldCheck,
  Cpu,
  ArrowRightLeft
} from 'lucide-react';

export default function MovementsHistoryTable({ history = [], onRefresh, onExecuteNew, loading = false }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'IN' | 'OUT' | 'INTERNAL' | 'ADJUSTMENT'

  // Filter history records
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      // Type filter
      if (filterType !== 'ALL' && item.type !== filterType) {
        return false;
      }
      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesRef = (item.reference || '').toLowerCase().includes(query);
        const matchesProd = (item.productName || '').toLowerCase().includes(query);
        const matchesSku = (item.sku || '').toLowerCase().includes(query);
        const matchesFrom = (item.fromLocation || '').toLowerCase().includes(query);
        const matchesTo = (item.toLocation || '').toLowerCase().includes(query);
        const matchesReason = (item.reason || '').toLowerCase().includes(query);
        const matchesStaff = (item.responsible || '').toLowerCase().includes(query);
        return matchesRef || matchesProd || matchesSku || matchesFrom || matchesTo || matchesReason || matchesStaff;
      }
      return true;
    });
  }, [history, filterType, searchQuery]);

  // Statistics
  const totalInMoves = useMemo(() => history.filter((h) => h.type === 'IN').length, [history]);
  const totalOutMoves = useMemo(() => history.filter((h) => h.type === 'OUT').length, [history]);
  const totalInternalMoves = useMemo(() => history.filter((h) => h.type === 'INTERNAL').length, [history]);
  const totalAdjMoves = useMemo(() => history.filter((h) => h.type === 'ADJUSTMENT').length, [history]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
      {/* Header & Quick Stat Counters */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
            Stock Ledger & Audit Trail
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Stock Movement History
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time audit log of all inward receipts, outward deliveries, internal bay shifts, and physical adjustments.
          </p>
        </div>

        {/* Quick Type Stat Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>IN: {totalInMoves}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>OUT: {totalOutMoves}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-800 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>INTERNAL: {totalInternalMoves}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>ADJUST: {totalAdjMoves}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="px-6 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search reference, product, reason, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="md:col-span-5 flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          {['ALL', 'IN', 'OUT', 'INTERNAL', 'ADJUSTMENT'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`flex-1 py-1 rounded-lg transition-all text-center cursor-pointer ${
                filterType === type
                  ? 'bg-white font-semibold text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <div className="md:col-span-1 flex justify-end">
          <button
            type="button"
            onClick={onRefresh}
            title="Refresh Ledger"
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="overflow-x-auto border-t border-slate-200">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 w-24">Type</th>
              <th className="py-3 px-4 min-w-[140px]">Reference</th>
              <th className="py-3 px-4 min-w-[130px]">Date / Time</th>
              <th className="py-3 px-4 min-w-[180px]">From Location</th>
              <th className="py-3 px-4 min-w-[180px]">To Location</th>
              <th className="py-3 px-4 min-w-[200px]">Product</th>
              <th className="py-3 px-4 text-right w-28 font-semibold">Quantity</th>
              <th className="py-3 px-4 text-right w-28 font-semibold">Balance After</th>
              <th className="py-3 px-4 min-w-[140px]">Responsible</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan="9" className="py-12 text-center text-slate-400">
                  <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="font-medium text-slate-600">Loading stock ledger movements...</p>
                </td>
              </tr>
            ) : filteredHistory.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-16 text-center text-slate-400">
                  <Layers className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p className="font-bold text-slate-700 text-base">No Stock Movements Logged</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Validated receipts, dispatched deliveries, and internal shifts will appear here automatically.
                  </p>
                  {onExecuteNew && (
                    <button
                      type="button"
                      onClick={onExecuteNew}
                      className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      Execute New Stock Transfer
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filteredHistory.map((item) => {
                const isIncoming = item.type === 'IN';
                const isOutgoing = item.type === 'OUT';
                const isAdjustment = item.type === 'ADJUSTMENT';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Movement Type Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                          isIncoming
                            ? 'bg-emerald-100 text-emerald-800'
                            : isOutgoing
                            ? 'bg-rose-100 text-rose-800'
                            : isAdjustment
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {isIncoming ? (
                          <ArrowDownLeft className="w-3 h-3" />
                        ) : isOutgoing ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : isAdjustment ? (
                          <ShieldCheck className="w-3 h-3" />
                        ) : (
                          <ArrowRight className="w-3 h-3" />
                        )}
                        {item.type}
                      </span>
                    </td>

                    {/* Reference */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {item.reference}
                      {item.reason && (
                        <div className="text-[11px] font-normal text-slate-400 line-clamp-1">{item.reason}</div>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-600 text-xs font-mono">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Today'}
                    </td>

                    {/* From */}
                    <td className="py-3.5 px-4 text-slate-700 text-xs">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 block line-clamp-1">
                        {item.fromLocation || 'Vendor / Source'}
                      </span>
                    </td>

                    {/* To */}
                    <td className="py-3.5 px-4 text-slate-700 text-xs">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 block line-clamp-1">
                        {item.toLocation || 'Customer / Target'}
                      </span>
                    </td>

                    {/* Product */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{item.productName}</div>
                      {item.sku && (
                        <div className="text-[11px] font-mono text-slate-400">{item.sku}</div>
                      )}
                    </td>

                    {/* Quantity */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      <span className={isIncoming ? 'text-emerald-700' : isOutgoing ? 'text-rose-700' : 'text-slate-800'}>
                        {isIncoming ? `+${item.quantity}` : isOutgoing ? `-${item.quantity}` : item.quantity} {item.unit || 'Units'}
                      </span>
                    </td>

                    {/* Balance After */}
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-600">
                      {item.balanceAfter !== null && item.balanceAfter !== undefined ? `${item.balanceAfter} ${item.unit || 'Units'}` : '—'}
                    </td>

                    {/* Staff in Charge */}
                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      {item.responsible || 'Warehouse Staff'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
        <span>Showing <strong>{filteredHistory.length}</strong> logged movements</span>
        <span className="font-mono text-[11px]">Audit Log Synchronized with Database</span>
      </div>
    </div>
  );
}
