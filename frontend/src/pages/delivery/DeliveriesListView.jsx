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
  Printer,
  Trash2
} from 'lucide-react';

export default function DeliveriesListView({
  deliveries = [],
  onSelectDelivery,
  onCreateNew,
  onPrintDelivery,
  onDeleteDelivery,
  loading = false
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
        const matchesRef = (del.internalNumber || del.reference || '').toLowerCase().includes(query);
        const matchesContact = (del.contact || '').toLowerCase().includes(query);
        const matchesCustomer = (del.customer?.name || '').toLowerCase().includes(query);
        const matchesContactPerson = (del.customer?.contactPerson || '').toLowerCase().includes(query);
        const matchesTo = (del.to || del.destination || '').toLowerCase().includes(query);
        return matchesRef || matchesContact || matchesCustomer || matchesContactPerson || matchesTo;
      }
      return true;
    });
  }, [deliveries, searchQuery, statusFilter]);

  // Kanban column buckets
  const kanbanColumns = [
    { key: 'draft', title: 'Draft', color: 'border-slate-300 bg-slate-50/50' },
    { key: 'in_progress', title: 'In Progress (Picked)', color: 'border-blue-300 bg-blue-50/30' },
    { key: 'ready', title: 'Ready (Packed)', color: 'border-purple-300 bg-purple-50/30' },
    { key: 'done', title: 'Done (Dispatched)', color: 'border-emerald-300 bg-emerald-50/30' }
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
            <option value="ready">Ready (Packed)</option>
            <option value="done">Done (Dispatched)</option>
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
                  <th className="py-3.5 px-4 min-w-[180px]">From (Warehouse)</th>
                  <th className="py-3.5 px-4 min-w-[200px]">To (Customer / Destination)</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Contact</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Schedule Date</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Carrier / Tracking</th>
                  <th className="py-3.5 px-4 w-28 text-center">Status</th>
                  <th className="py-3.5 px-4 w-24 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400">
                      <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3" />
                      <p className="font-medium text-slate-600">Loading delivery orders...</p>
                    </td>
                  </tr>
                ) : filteredDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-16 text-center text-slate-400">
                      <Truck className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                      <p className="font-bold text-slate-700 text-base">No Delivery Orders Found</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        No delivery orders matched your filter or the database is currently empty.
                      </p>
                      <button
                        type="button"
                        onClick={onCreateNew}
                        className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Create First Delivery Order
                      </button>
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
                          {del.internalNumber || del.reference}
                        </td>

                        {/* From (Warehouse) */}
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          <span className="bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 font-mono text-[11px] block line-clamp-1">
                            {del.from || del.warehouse?.name || 'Central Warehouse'}
                          </span>
                        </td>

                        {/* To (Customer / Destination) */}
                        <td className="py-3.5 px-4 text-slate-800 font-medium">
                          <div className="line-clamp-1">{del.to || del.destination || del.customer?.name || 'Customer'}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            GST: {del.customer?.gstNumber || 'N/A'}
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4 text-slate-700">
                          <div className="font-medium text-slate-900 line-clamp-1">{del.contact || del.customer?.contactPerson || del.responsible || '—'}</div>
                          <div className="text-[11px] text-slate-400">{del.customer?.phone || ''}</div>
                        </td>

                        {/* Schedule Date */}
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{del.scheduledDate || '—'}</span>
                          </div>
                        </td>

                        {/* Carrier & Tracking */}
                        <td className="py-3.5 px-4 text-xs">
                          <div className="space-y-0.5">
                            <span className="font-medium text-slate-800 block line-clamp-1">{del.carrier || 'Standard Logistics'}</span>
                            {del.trackingNumber && (
                              <span className="font-mono text-[11px] text-indigo-600">{del.trackingNumber}</span>
                            )}
                          </div>
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
                            {(del.status || 'draft').replace('_', ' ')}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => onSelectDelivery(del)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Open delivery"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {onDeleteDelivery && (
                              <button
                                type="button"
                                onClick={() => onDeleteDelivery(del.id, del.internalNumber || del.reference)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete delivery"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
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
        /* Kanban View (Grouped by Status Columns) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map((col) => {
            const colDeliveries = filteredDeliveries.filter((d) => (d.status || 'draft') === col.key);

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
                      No items in {col.title}
                    </div>
                  ) : (
                    colDeliveries.map((del) => (
                      <div
                        key={del.id}
                        onClick={() => onSelectDelivery(del)}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-emerald-700">
                            {del.internalNumber || del.reference}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {del.scheduledDate || 'Today'}
                          </span>
                        </div>

                        <div>
                          <div className="font-semibold text-xs text-slate-900 line-clamp-1">
                            {del.to || del.destination || del.customer?.name || 'Customer'}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            From: {del.from || del.warehouse?.name || 'Warehouse'}
                          </div>
                        </div>

                        {del.items && del.items.length > 0 && (
                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px] text-slate-600 flex justify-between items-center">
                            <span>{del.items.length} Product Line(s)</span>
                            <span className="font-bold font-mono text-slate-800">
                              ₹{(del.totalAmount || 0).toLocaleString()}
                            </span>
                          </div>
                        )}
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
