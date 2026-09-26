import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  Boxes,
  SlidersHorizontal,
  History,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  MapPin,
  Sparkles,
  RefreshCw,
  Layers
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { dashboardApi, productApi, warehouseApi, receiptApi, deliveryApi } from '../../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, prodRes, whRes] = await Promise.all([
        dashboardApi.getStats().catch(() => ({ data: null })),
        productApi.getAll().catch(() => ({ data: [] })),
        warehouseApi.getAll().catch(() => ({ data: [] }))
      ]);

      if (statsRes && statsRes.data) {
        setStats(statsRes.data);
      }
      setProducts(prodRes?.data || []);
      setWarehouses(whRes?.data || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calculated or fallback metrics
  const totalStockValuation = stats?.products?.totalValuation ?? products.reduce(
    (acc, item) => acc + (Number(item.onHand) || 0) * (Number(item.perUnitCost) || 0),
    0
  );

  const totalPhysicalUnits = stats?.products?.totalPhysicalOnHand ?? products.reduce(
    (acc, item) => acc + (Number(item.onHand) || 0),
    0
  );

  const lowStockItemsCount = stats?.products?.lowStockCount ?? products.filter(
    (item) => (Number(item.onHand) || 0) <= (Number(item.minStockAlert) || 5)
  ).length;

  const warehousesCount = stats?.facilities?.warehousesCount ?? warehouses.length;

  // Receipts live stats
  const receiptsTotal = stats?.receipts?.totalOperations ?? 0;
  const receiptsToReceive = stats?.receipts?.toReceive ?? 0;
  const receiptsReady = stats?.receipts?.ready ?? 0;
  const receiptsDone = stats?.receipts?.done ?? 0;
  const receiptsLate = stats?.receipts?.late ?? 0;
  const receiptsPercentage = receiptsTotal > 0 ? Math.round((receiptsDone / receiptsTotal) * 100) : 0;

  // Deliveries live stats
  const deliveriesTotal = stats?.deliveries?.totalOperations ?? 0;
  const deliveriesToDeliver = stats?.deliveries?.toDeliver ?? 0;
  const deliveriesReady = stats?.deliveries?.ready ?? 0;
  const deliveriesDone = stats?.deliveries?.done ?? 0;
  const deliveriesLate = stats?.deliveries?.late ?? 0;
  const deliveriesPercentage = deliveriesTotal > 0 ? Math.round(((deliveriesReady + deliveriesDone) / deliveriesTotal) * 100) : 0;

  // Recent movements
  const recentMovements = stats?.recentMovements || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-24">
      {/* Global Navbar */}
      <Navbar activePage="dashboard" />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Welcome & Overview Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Inventory Overview</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Live ERP Hub
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time synchronization with PostgreSQL database • Receipts, deliveries, physical counts & stock ledger
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={fetchDashboardData}
              title="Refresh Live Metrics"
              className="p-2 text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
            <a
              href="/receipts"
              className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              New Receipt
            </a>
            <a
              href="/deliveries"
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              New Delivery
            </a>
            <a
              href="/adjustments"
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
              Count / Adjustment
            </a>
          </div>
        </div>

        {/* Primary Operations KPI Cards: Receipts & Delivery (Live from DB) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* RECEIPTS CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between hover:border-indigo-300 transition-all group">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Receipts (WH/IN)
                    </h2>
                    <p className="text-xs text-slate-500">Incoming Vendor Shipments & Put-Away</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {receiptsTotal} {receiptsTotal === 1 ? 'Operation' : 'Operations'}
                </span>
              </div>

              {/* Metrics Breakdown */}
              <div className="grid grid-cols-3 gap-3 py-6 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-2xl font-bold font-mono text-indigo-700 block">{receiptsToReceive}</span>
                  <span className="text-xs text-slate-600 font-medium">To Receive</span>
                </div>
                <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-100">
                  <span className="text-2xl font-bold font-mono text-rose-600 block">{receiptsLate}</span>
                  <span className="text-xs text-rose-700 font-medium">Late / Delayed</span>
                </div>
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
                  <span className="text-2xl font-bold font-mono text-emerald-700 block">{receiptsDone}</span>
                  <span className="text-xs text-emerald-800 font-medium">Validated & Done</span>
                </div>
              </div>

              {/* Progress & Live Subtext */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Receiving Dock Completion</span>
                  <span className="font-semibold text-slate-800 font-mono">{receiptsPercentage}% Completed</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${receiptsPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Auto Reference: <strong className="text-slate-800 font-mono">WH/IN/001</strong></span>
              <a
                href="/receipts"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                View Receipts <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* DELIVERY CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between hover:border-emerald-300 transition-all group">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      Delivery Orders (WH/OUT)
                    </h2>
                    <p className="text-xs text-slate-500">Outbound Customer Dispatch & Transport</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {deliveriesTotal} {deliveriesTotal === 1 ? 'Operation' : 'Operations'}
                </span>
              </div>

              {/* Metrics Breakdown: to deliver, late, waiting (ready), done */}
              <div className="grid grid-cols-4 gap-2.5 py-6 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xl font-bold font-mono text-emerald-700 block">{deliveriesToDeliver}</span>
                  <span className="text-[11px] text-slate-600 font-medium">To Deliver</span>
                </div>
                <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-100">
                  <span className="text-xl font-bold font-mono text-rose-600 block">{deliveriesLate}</span>
                  <span className="text-[11px] text-rose-700 font-medium">Late</span>
                </div>
                <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100">
                  <span className="text-xl font-bold font-mono text-purple-700 block">{deliveriesReady}</span>
                  <span className="text-[11px] text-purple-800 font-medium">Ready (Packed)</span>
                </div>
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
                  <span className="text-xl font-bold font-mono text-emerald-800 block">{deliveriesDone}</span>
                  <span className="text-[11px] text-emerald-800 font-medium">Dispatched</span>
                </div>
              </div>

              {/* Progress & Live Subtext */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Dispatch Staging Fulfillment</span>
                  <span className="font-semibold text-slate-800 font-mono">{deliveriesPercentage}% Ready/Done</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${deliveriesPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Auto Reference: <strong className="text-slate-800 font-mono">WH/OUT/001</strong></span>
              <a
                href="/deliveries"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                View Deliveries <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

        {/* Secondary Metric Cards (Stock Value, Total Units, Adjustments, Warehouses) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Stock Value</span>
              <Boxes className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              ₹{totalStockValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">Across {products.length} registered product items</p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Physical On-Hand</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {totalPhysicalUnits.toLocaleString()} <span className="text-xs font-normal text-slate-500">Units</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">All warehouse bins combined</p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Low Stock Alerts</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-700">
              {lowStockItemsCount} <span className="text-xs font-normal text-slate-500">Items</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              <a href="/stock" className="text-indigo-600 hover:underline">Inspect stock &rarr;</a>
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Warehouses</span>
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {warehousesCount} <span className="text-xs font-normal text-slate-500">Facilities</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              <a href="/settings/warehouses" className="text-indigo-600 hover:underline">Manage facilities &rarr;</a>
            </p>
          </div>

        </div>

        {/* Recent Stock Movement History Ledger */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Stock Movements (Audit Ledger)</h3>
                <p className="text-xs text-slate-500">Live feed of receipts, dispatches, bay shifts, and count variances</p>
              </div>
            </div>
            <a
              href="/movements"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Open Full Ledger &rarr;
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 w-24">Type</th>
                  <th className="py-2.5 px-4">Reference</th>
                  <th className="py-2.5 px-4">Product Name</th>
                  <th className="py-2.5 px-4">From Location</th>
                  <th className="py-2.5 px-4">To Location</th>
                  <th className="py-2.5 px-4 text-right">Quantity</th>
                  <th className="py-2.5 px-4 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentMovements.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400 text-xs">
                      No stock movements recorded yet. Validated receipts or deliveries will log entries here automatically.
                    </td>
                  </tr>
                ) : (
                  recentMovements.slice(0, 5).map((mov) => {
                    const isIn = mov.type === 'IN';
                    const isOut = mov.type === 'OUT';
                    return (
                      <tr key={mov.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                              isIn
                                ? 'bg-emerald-100 text-emerald-800'
                                : isOut
                                ? 'bg-rose-100 text-rose-800'
                                : mov.type === 'ADJUSTMENT'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {mov.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{mov.reference}</td>
                        <td className="py-2.5 px-4 font-medium text-slate-800">{mov.productName}</td>
                        <td className="py-2.5 px-4 text-slate-500 font-mono text-xs">{mov.fromLocation || '—'}</td>
                        <td className="py-2.5 px-4 text-slate-500 font-mono text-xs">{mov.toLocation || '—'}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold">
                          <span className={isIn ? 'text-emerald-700' : isOut ? 'text-rose-700' : 'text-slate-800'}>
                            {isIn ? `+${mov.quantity}` : isOut ? `-${mov.quantity}` : mov.quantity} {mov.unit || 'Units'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                          {mov.balanceAfter !== null && mov.balanceAfter !== undefined ? `${mov.balanceAfter} ${mov.unit || 'Units'}` : '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stock Snapshot Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Stock Availability Quick Snapshot</h3>
              <p className="text-xs text-slate-500">Instant on-hand vs free-to-use breakdown from database</p>
            </div>
            <a
              href="/stock"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Open Full Stock Page &rarr;
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4 font-mono">SKU</th>
                  <th className="py-3 px-4 text-right">Per Unit Cost (₹)</th>
                  <th className="py-3 px-4 text-right">On Hand</th>
                  <th className="py-3 px-4 text-right">Free to Use</th>
                  <th className="py-3 px-4">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-slate-400">
                      <Package className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-700 text-sm">No products in database</p>
                      <p className="text-xs text-slate-400 mt-0.5">Add products to see stock availability snapshots.</p>
                      <a
                        href="/product"
                        className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                      >
                        <Plus className="w-3 h-3" /> Add Product
                      </a>
                    </td>
                  </tr>
                ) : (
                  products.slice(0, 5).map((stk) => (
                    <tr key={stk.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-medium text-slate-900">{stk.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-xs">{stk.sku}</td>
                      <td className="py-3 px-4 text-right font-mono">
                        ₹{Number(stk.perUnitCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                        {stk.onHand} {stk.uom?.name || stk.unit || 'Units'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700 font-mono">
                        {stk.freeToUse ?? stk.onHand} {stk.uom?.name || stk.unit || 'Units'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs font-mono">
                        {stk.location?.name || stk.location || 'Central WH'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
