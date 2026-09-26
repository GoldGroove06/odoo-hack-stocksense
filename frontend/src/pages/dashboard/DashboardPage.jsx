import React from 'react';
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
  Sparkles
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { INITIAL_STOCKS, INITIAL_ADJUSTMENTS } from '../../data/inventoryStore';

export default function DashboardPage() {
  const totalStockValue = INITIAL_STOCKS.reduce(
    (acc, item) => acc + item.onHand * item.perUnitCost,
    0
  );
  const totalUnitsOnHand = INITIAL_STOCKS.reduce((acc, item) => acc + item.onHand, 0);
  const lowStockCount = INITIAL_STOCKS.filter((item) => item.onHand <= item.minStockAlert).length;

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
              Central Warehouse (WH) • Real-time receipts, deliveries, and stock operations
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2.5">
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

        {/* Primary Operations KPI Cards: Receipts & Delivery (Requested by User) */}
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
                  6 Operations
                </span>
              </div>

              {/* Metrics Breakdown: 4 to receive, 1 late, 6 operations */}
              <div className="grid grid-cols-3 gap-3 py-6 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-2xl font-bold font-mono text-indigo-700 block">4</span>
                  <span className="text-xs text-slate-600 font-medium">To Receive</span>
                </div>
                <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-100">
                  <span className="text-2xl font-bold font-mono text-rose-600 block">1</span>
                  <span className="text-xs text-rose-700 font-medium">Late / Delayed</span>
                </div>
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
                  <span className="text-2xl font-bold font-mono text-emerald-700 block">6</span>
                  <span className="text-xs text-emerald-800 font-medium">Total Operations</span>
                </div>
              </div>

              {/* Progress & Live Subtext */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Receiving Dock Capacity</span>
                  <span className="font-semibold text-slate-800">68% Handled</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-indigo-600 h-2 rounded-full w-[68%]"></div>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Next expected: <strong className="text-slate-800">TechLogix (WH/IN/001)</strong></span>
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
                  6 Operations
                </span>
              </div>

              {/* Metrics Breakdown: 4 to deliver, 1 late, 2 waiting, 6 operations */}
              <div className="grid grid-cols-4 gap-2.5 py-6 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xl font-bold font-mono text-emerald-700 block">4</span>
                  <span className="text-[11px] text-slate-600 font-medium">To Deliver</span>
                </div>
                <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-100">
                  <span className="text-xl font-bold font-mono text-rose-600 block">1</span>
                  <span className="text-[11px] text-rose-700 font-medium">Late</span>
                </div>
                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-100">
                  <span className="text-xl font-bold font-mono text-amber-700 block">2</span>
                  <span className="text-[11px] text-amber-800 font-medium">Waiting</span>
                </div>
                <div className="p-3 bg-slate-100/70 rounded-xl border border-slate-200">
                  <span className="text-xl font-bold font-mono text-slate-800 block">6</span>
                  <span className="text-[11px] text-slate-600 font-medium">Operations</span>
                </div>
              </div>

              {/* Progress & Live Subtext */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Dispatch Staging Fulfillment</span>
                  <span className="font-semibold text-slate-800">83% Ready</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-600 h-2 rounded-full w-[83%]"></div>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Next dispatch: <strong className="text-slate-800">Bharat Dynamics (WH/OUT/001)</strong></span>
              <a
                href="/deliveries"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                View Deliveries <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

        {/* Secondary Metric Cards (Stock Value, Total Units, Adjustments, Transfers) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Stock Value</span>
              <Boxes className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              ₹{totalStockValue.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">Across 6 managed product lines</p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Physical On-Hand</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {totalUnitsOnHand.toLocaleString()} <span className="text-xs font-normal text-slate-500">Units</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">All storage racks combined</p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Stock Adjustments</span>
              <SlidersHorizontal className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {INITIAL_ADJUSTMENTS.length} <span className="text-xs font-normal text-slate-500">Logged</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              <a href="/adjustments" className="text-indigo-600 hover:underline">Reconcile counts &rarr;</a>
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Warehouses</span>
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              3 <span className="text-xs font-normal text-slate-500">Hubs (WH, WH-N, WH-S)</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              <a href="/settings/warehouses" className="text-indigo-600 hover:underline">Manage facilities &rarr;</a>
            </p>
          </div>

        </div>

        {/* Quick Stock Snapshot Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Stock Availability Quick Snapshot</h3>
              <p className="text-xs text-slate-500">Instant on-hand vs free-to-use breakdown</p>
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
                {INITIAL_STOCKS.slice(0, 4).map((stk) => (
                  <tr key={stk.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-medium text-slate-900">{stk.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-xs">{stk.sku}</td>
                    <td className="py-3 px-4 text-right font-mono">₹{stk.perUnitCost.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">{stk.onHand} {stk.unit}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700 font-mono">{stk.freeToUse} {stk.unit}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs font-mono">{stk.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
