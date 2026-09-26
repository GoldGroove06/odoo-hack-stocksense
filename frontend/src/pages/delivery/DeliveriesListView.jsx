import React, { useState, useMemo } from 'react';
import {
  Search,
  LayoutList,
  LayoutGrid,
  Plus,
  ArrowRight,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  User,
  Package,
  Truck,
  Layers,
  ChevronRight,
  Filter,
  Eye,
  Printer
} from 'lucide-react';

export default function DeliveriesListView({
  deliveries,
  onSelectDelivery,
  onCreateNew,
  onPrintDelivery
}) {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter based on search query (Reference and Contacts) & status
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((del) => {
      // Status filter
      if (statusFilter !== 'ALL' && del.status !== statusFilter) {
        return false;
      }
      // Search query (Reference & Contacts)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesRef = del.internalNumber.toLowerCase().includes(query);
        const matchesContact = (del.contact || '').toLowerCase().includes(query);
        const matchesCustomer = (del.customer?.name || '').toLowerCase().includes(query);
        const matchesContactPerson = (del.customer?.contactPerson || '').toLowerCase().includes(query);
        const matchesTo = (del.to || '').toLowerCase().includes(query);
        return matchesRef || matchesContact || matchesCustomer || matchesContactPerson || matchesTo;
      }
      return true;
    });
  }, [deliveries, searchQuery, statusFilter]);

  // Kanban column buckets
  const kanbanColumns = [
    { key: 'draft', title: 'Draft', color: 'border-slate-300 bg-slate-50/50' },
    { key: 'in_progress', title: 'In Progress', color: 'border-blue-300 bg-blue-50/30' },
    { key: 'ready', title: 'Ready (Packing)', color: 'border-purple-300 bg-purple-50/30' },
    { key: 'done', title: 'Done (Delivered)', color: 'border-emerald-300 bg-emerald-50/30' }
  ];

  return (
    <div className="space-y-4">
      {/* Top Action Bar & Search / View Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Create Button & Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCreateNew}
            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Delivery
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Delivery Orders (WH/OUT)</h1>
            <p className="text-xs text-slate-500">Outbound customer shipments & delivery challans</p>
          </div>
        </div>

        {/* Right: Search by Reference & Contacts + Status Filter + View Switcher (List / Kanban) */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search Box */}
          <div className="relative min-w-[240px] sm:min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search reference (WH/OUT/...) or contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-800"
            />
          </div>

          {/* Quick Status Pill Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white text-slate-700 font-medium cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="in_progress">In Progress</option>
            <option value="ready">Ready</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* View Switcher: List vs Kanban */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              title="Switch to List View"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              title="Switch to Kanban View"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* List View (Table Format) */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 min-w-[140px]">Reference</th>
                  <th className="py-3.5 px-4 min-w-[180px]">From (Warehouse Location)</th>
                  <th className="py-3.5 px-4 min-w-[200px]">To (Customer Destination)</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Contact</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Schedule Date</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Carrier / Tracking</th>
                  <th className="py-3.5 px-4 w-28 text-center">Status</th>
                  <th className="py-3.5 px-2 w-12 text-center"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400">
                      <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-medium text-slate-600">No deliveries found</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or click "New Delivery".</p>
                    </td>
                  </tr>
                ) : (
                  filteredDeliveries.map((del) => {
                    const isDone = del.status === 'done';
                    const isReady = del.status === 'ready';
                    const isInProg = del.status === 'in_progress';
                    const isCancelled = del.status === 'cancelled';

                    return (
                      <tr
                        key={del.id}
                        onClick={() => onSelectDelivery(del)}
                        className="hover:bg-emerald-50/40 transition-colors cursor-pointer group"
                      >
                        {/* Reference: <Warehouse>/<Operation>/<ID> */}
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 group-hover:text-emerald-900">
                          {del.internalNumber}
                          {del.sourceDocument && (
                            <div className="text-[11px] font-normal text-slate-400 font-sans">
                              Order: {del.sourceDocument}
                            </div>
                          )}
                        </td>

                        {/* From (Warehouse Location) */}
                        <td className="py-3.5 px-4 text-slate-700">
                          <span className="bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 font-mono text-[11px] block line-clamp-1">
                            {del.from || del.warehouseLocation}
                          </span>
                        </td>

                        {/* To (Customer Destination) */}
                        <td className="py-3.5 px-4 text-slate-800 font-medium">
                          <div className="line-clamp-1">{del.to || del.customer?.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            GST: {del.customer?.gstNumber || 'N/A'}
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4 text-slate-700">
                          <div className="font-medium text-slate-900 line-clamp-1">{del.contact || del.customer?.contactPerson}</div>
                          <div className="text-[11px] text-slate-400">{del.customer?.phone}</div>
                        </td>

                        {/* Schedule Date */}
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{del.scheduledDate}</span>
                          </div>
                        </td>

                        {/* Carrier & Tracking */}
                        <td className="py-3.5 px-4 text-xs">
                          <div className="font-medium text-slate-800 flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-slate-400" />
                            <span>{del.carrier || 'Internal Fleet'}</span>
                          </div>
                          {del.vehicleNumber && (
                            <div className="text-[11px] text-slate-400 font-mono">{del.vehicleNumber}</div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                              isDone
                                ? 'bg-emerald-100 text-emerald-800'
                                : isReady
                                ? 'bg-purple-100 text-purple-800'
                                : isInProg
                                ? 'bg-blue-100 text-blue-800'
                                : isCancelled
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {del.status.replace('_', ' ')}
                          </span>
                        </td>

                        {/* View Arrow */}
                        <td className="py-3.5 px-2 text-center text-slate-400 group-hover:text-emerald-600">
                          <ChevronRight className="w-4 h-4" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
            <span>Showing <strong>{filteredDeliveries.length}</strong> delivery orders</span>
            <span className="font-mono text-[11px]">Format: &lt;Warehouse&gt;/&lt;Operation&gt;/&lt;ID&gt; (e.g. WH/OUT/001)</span>
          </div>
        </div>
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map((col) => {
            const colDeliveries = filteredDeliveries.filter((d) => d.status === col.key);

            return (
              <div
                key={col.key}
                className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-3.5 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-800">{col.title}</h3>
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                      {colDeliveries.length}
                    </span>
                  </div>
                </div>

                {/* Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colDeliveries.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                      No deliveries in {col.title}
                    </div>
                  ) : (
                    colDeliveries.map((del) => (
                      <div
                        key={del.id}
                        onClick={() => onSelectDelivery(del)}
                        className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs hover:border-emerald-400 transition-all cursor-pointer space-y-2 group"
                      >
                        {/* Top: Reference & Date */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-emerald-700 group-hover:text-emerald-900">
                            {del.internalNumber}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3" />
                            {del.scheduledDate}
                          </span>
                        </div>

                        {/* Customer & Contact */}
                        <div>
                          <p className="text-xs font-semibold text-slate-800 line-clamp-1">{del.to || del.customer?.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{del.contact || del.customer?.contactPerson}</p>
                        </div>

                        {/* From Warehouse Location */}
                        <div className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100 font-mono line-clamp-1">
                          📍 {del.from || del.warehouseLocation}
                        </div>

                        {/* Carrier info */}
                        <div className="pt-1 text-[11px] flex items-center gap-1 text-slate-500">
                          <Truck className="w-3 h-3 text-slate-400" />
                          <span>{del.carrier || 'Standard Dispatch'}</span>
                        </div>

                        {/* Footer Items & Qty */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                          <span>{del.items?.length || 0} Products</span>
                          <span className="font-medium text-slate-700">{del.responsible}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
