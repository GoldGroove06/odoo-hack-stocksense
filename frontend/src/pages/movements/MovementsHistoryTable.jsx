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
  Cpu
} from 'lucide-react';
import { WAREHOUSE_LOCATIONS } from './movementData';

export default function MovementsHistoryTable({ history, onRefresh }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'IN' | 'OUT' | 'INTERNAL'
  const [selectedFromLoc, setSelectedFromLoc] = useState('ALL');
  const [selectedToLoc, setSelectedToLoc] = useState('ALL');

  // Filter history records
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      // Type filter
      if (filterType !== 'ALL' && item.type !== filterType) {
        return false;
      }
      // From location filter
      if (selectedFromLoc !== 'ALL' && !item.fromLocation.includes(selectedFromLoc)) {
        return false;
      }
      // To location filter
      if (selectedToLoc !== 'ALL' && !item.toLocation.includes(selectedToLoc)) {
        return false;
      }
      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesRef = item.reference.toLowerCase().includes(query);
        const matchesProd = item.productName.toLowerCase().includes(query);
        const matchesProdId = item.productId.toLowerCase().includes(query);
        const matchesContact = item.contact.toLowerCase().includes(query);
        const matchesStaff = (item.staffName || '').toLowerCase().includes(query) || (item.staffId || '').toLowerCase().includes(query);
        const matchesDoc = (item.linkedDoc || '').toLowerCase().includes(query);
        return matchesRef || matchesProd || matchesProdId || matchesContact || matchesStaff || matchesDoc;
      }
      return true;
    });
  }, [history, filterType, selectedFromLoc, selectedToLoc, searchQuery]);

  // Statistics
  const totalInMoves = useMemo(() => history.filter((h) => h.type === 'IN').length, [history]);
  const totalOutMoves = useMemo(() => history.filter((h) => h.type === 'OUT').length, [history]);
  const totalInternalMoves = useMemo(() => history.filter((h) => h.type === 'INTERNAL').length, [history]);

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
            Log of all inventory shifts between warehouse locations, incoming receipts, and outbound deliveries.
          </p>
        </div>

        {/* Quick Type Stat Pills */}
        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="px-6 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search reference, product ID/name, contact, staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="md:col-span-3 flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          {['ALL', 'IN', 'OUT', 'INTERNAL'].map((type) => (
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

        {/* From Location Filter */}
        <div className="md:col-span-2">
          <select
            value={selectedFromLoc}
            onChange={(e) => setSelectedFromLoc(e.target.value)}
            className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white text-slate-700"
          >
            <option value="ALL">From: All Locations</option>
            {WAREHOUSE_LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* To Location Filter */}
        <div className="md:col-span-2">
          <select
            value={selectedToLoc}
            onChange={(e) => setSelectedToLoc(e.target.value)}
            className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white text-slate-700"
          >
            <option value="ALL">To: All Locations</option>
            {WAREHOUSE_LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Reset / Clear */}
        <div className="md:col-span-1 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setFilterType('ALL');
              setSelectedFromLoc('ALL');
              setSelectedToLoc('ALL');
            }}
            title="Reset Filters"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
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
              <th className="py-3 px-3.5 w-24">Type</th>
              <th className="py-3 px-3.5 min-w-[130px]">Reference</th>
              <th className="py-3 px-3.5 min-w-[140px]">Date & Timing</th>
              <th className="py-3 px-3.5 min-w-[180px]">Contact / Partner</th>
              <th className="py-3 px-3.5 min-w-[180px]">From Location</th>
              <th className="py-3 px-3.5 min-w-[180px]">To Location</th>
              <th className="py-3 px-3.5 min-w-[200px]">Product (ID & Name)</th>
              <th className="py-3 px-3.5 text-right w-24 font-semibold">Quantity</th>
              <th className="py-3 px-3.5 w-24 text-center">Status</th>
              <th className="py-3 px-3.5 min-w-[130px]">Staff In-Charge</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan="10" className="py-12 text-center text-slate-400">
                  <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-medium text-slate-600">No stock movements found matching filter criteria</p>
                  <p className="text-xs text-slate-400 mt-1">Try clearing filters or search terms.</p>
                </td>
              </tr>
            ) : (
              filteredHistory.map((item) => {
                const isIn = item.type === 'IN';
                const isOut = item.type === 'OUT';
                const isInternal = item.type === 'INTERNAL';

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      isIn
                        ? 'hover:bg-emerald-50/40 bg-emerald-50/10'
                        : isOut
                        ? 'hover:bg-rose-50/40 bg-rose-50/10'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Event Type Badge: Green for IN, Red for OUT, Blue for INTERNAL */}
                    <td className="py-3 px-3.5">
                      {isIn && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <ArrowDownLeft className="w-3 h-3 text-emerald-700" />
                          IN
                        </span>
                      )}
                      {isOut && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <ArrowUpRight className="w-3 h-3 text-rose-700" />
                          OUT
                        </span>
                      )}
                      {isInternal && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                          <ArrowRight className="w-3 h-3 text-blue-600" />
                          INTERNAL
                        </span>
                      )}
                    </td>

                    {/* Reference Code */}
                    <td className="py-3 px-3.5 font-mono font-semibold text-slate-900">
                      <div>{item.reference}</div>
                      {item.linkedDoc && (
                        <div className="text-[11px] text-slate-400 font-sans">Doc: {item.linkedDoc}</div>
                      )}
                    </td>

                    {/* Date & Timeline (Pick Time -> Drop Time) */}
                    <td className="py-3 px-3.5 text-xs text-slate-600">
                      <div className="font-medium text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {item.date}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{item.pickTime || '10:00 AM'}</span>
                        <span>→</span>
                        <span>{item.dropTime || '10:30 AM'}</span>
                      </div>
                    </td>

                    {/* Contact / Partner */}
                    <td className="py-3 px-3.5 text-xs text-slate-800">
                      <div className="font-medium">{item.contact}</div>
                      {item.notes && (
                        <div className="text-[11px] text-slate-400 line-clamp-1 italic">{item.notes}</div>
                      )}
                    </td>

                    {/* From Location */}
                    <td className="py-3 px-3.5 text-xs font-medium text-slate-700">
                      <span className="bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 font-mono text-[11px] block">
                        {item.fromLocation}
                      </span>
                    </td>

                    {/* To Location */}
                    <td className="py-3 px-3.5 text-xs font-medium text-slate-700">
                      <span className="bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 font-mono text-[11px] block">
                        {item.toLocation}
                      </span>
                    </td>

                    {/* Product ID & Product Name (Separate distinct row for each product) */}
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-slate-900 text-xs sm:text-sm">{item.productName}</div>
                      <div className="text-[11px] font-mono text-slate-500">ID: {item.productId}</div>
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 text-sm">
                      <span
                        className={
                          isIn
                            ? 'text-emerald-700 font-extrabold'
                            : isOut
                            ? 'text-rose-700 font-extrabold'
                            : 'text-slate-800'
                        }
                      >
                        {isIn ? `+${item.quantity}` : isOut ? `-${item.quantity}` : item.quantity}
                      </span>{' '}
                      <span className="text-xs text-slate-500 font-sans font-normal">{item.unit}</span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> {item.status}
                      </span>
                    </td>

                    {/* Staff In-Charge */}
                    <td className="py-3 px-3.5 text-xs text-slate-700">
                      <div className="font-medium text-slate-900">{item.staffName || 'Operator'}</div>
                      <div className="text-[11px] font-mono text-slate-400">{item.staffId || 'EMP-101'}</div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
        <div>
          Showing <strong>{filteredHistory.length}</strong> of <strong>{history.length}</strong> movement records
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> IN (Incoming moves)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> OUT (Outgoing moves)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> INTERNAL (Rack Transfers)
          </span>
        </div>
      </div>
    </div>
  );
}
