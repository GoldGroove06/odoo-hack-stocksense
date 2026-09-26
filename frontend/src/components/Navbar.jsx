import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Layers,
  Boxes,
  History,
  Settings,
  ChevronDown,
  Package,
  Truck,
  SlidersHorizontal,
  Building2,
  MapPin,
  Menu,
  X,
  Bell,
  Search
} from 'lucide-react';

export default function Navbar({ activePage = 'dashboard' }) {
  const [isOperationsOpen, setIsOperationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const operationsRef = useRef(null);
  const settingsRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (operationsRef.current && !operationsRef.current.contains(event.target)) {
        setIsOperationsOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isOperationsActive = ['receipts', 'deliveries', 'adjustments'].includes(activePage);
  const isSettingsActive = ['warehouses', 'locations'].includes(activePage);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-8">
            <a href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:bg-indigo-700 transition-colors">
                SS
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-tight">
                  StockSense
                </span>
                <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                  ERP Inventory
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              
              {/* 1. Dashboard */}
              <a
                href="/dashboard"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  activePage === 'dashboard'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </a>

              {/* 2. Operations Dropdown (Receipt, Delivery, Adjustment) */}
              <div className="relative" ref={operationsRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsOperationsOpen(!isOperationsOpen);
                    setIsSettingsOpen(false);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    isOperationsActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Operations</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOperationsOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isOperationsOpen && (
                  <div className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <a
                      href="/receipts"
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm transition-colors ${
                        activePage === 'receipts'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Package className="w-4 h-4 text-indigo-600" />
                      <div>
                        <div className="font-medium">Receipts (WH/IN)</div>
                        <div className="text-[11px] text-slate-400">Incoming shipments & vendor GRN</div>
                      </div>
                    </a>

                    <a
                      href="/deliveries"
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm transition-colors ${
                        activePage === 'deliveries'
                          ? 'bg-emerald-50 text-emerald-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="font-medium">Deliveries (WH/OUT)</div>
                        <div className="text-[11px] text-slate-400">Customer outbound orders</div>
                      </div>
                    </a>

                    <div className="border-t border-slate-100 my-1"></div>

                    <a
                      href="/adjustments"
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm transition-colors ${
                        activePage === 'adjustments'
                          ? 'bg-amber-50 text-amber-800 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                      <div>
                        <div className="font-medium">Adjustments</div>
                        <div className="text-[11px] text-slate-400">Physical count & stock reconciliation</div>
                      </div>
                    </a>
                  </div>
                )}
              </div>

              {/* 3. Stock */}
              <a
                href="/stock"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  activePage === 'stock'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Boxes className="w-4 h-4" />
                Stock
              </a>

              {/* 4. Move History */}
              <a
                href="/history"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  activePage === 'history' || activePage === 'movements'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <History className="w-4 h-4" />
                Move History
              </a>

              {/* 5. Settings Dropdown (Warehouses, Locations) */}
              <div className="relative" ref={settingsRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsOpen(!isSettingsOpen);
                    setIsOperationsOpen(false);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSettingsActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isSettingsOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <a
                      href="/settings/warehouses"
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm transition-colors ${
                        activePage === 'warehouses'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      <div>
                        <div className="font-medium">Warehouses</div>
                        <div className="text-[11px] text-slate-400">Hubs, shortcodes, address</div>
                      </div>
                    </a>

                    <a
                      href="/settings/locations"
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm transition-colors ${
                        activePage === 'locations'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <MapPin className="w-4 h-4 text-indigo-600" />
                      <div>
                        <div className="font-medium">Locations</div>
                        <div className="text-[11px] text-slate-400">Racks, docks, bays</div>
                      </div>
                    </a>
                  </div>
                )}
              </div>

            </nav>
          </div>

          {/* Right: Quick User Profile / Facility Badge */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-700">Central Hub (WH)</span>
            </div>

            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-semibold text-xs shadow-2xs">
              RM
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <a
            href="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-600" />
            Dashboard
          </a>

          <div className="pt-2 pb-1 px-3 text-[11px] font-bold uppercase text-slate-400">Operations</div>
          <a
            href="/receipts"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 pl-6"
          >
            <Package className="w-4 h-4 text-indigo-600" />
            Receipts (WH/IN)
          </a>
          <a
            href="/deliveries"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 pl-6"
          >
            <Truck className="w-4 h-4 text-emerald-600" />
            Deliveries (WH/OUT)
          </a>
          <a
            href="/adjustments"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 pl-6"
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-600" />
            Adjustments
          </a>

          <div className="pt-2 pb-1 px-3 text-[11px] font-bold uppercase text-slate-400">Inventory & History</div>
          <a
            href="/stock"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <Boxes className="w-4 h-4 text-indigo-600" />
            Stock
          </a>
          <a
            href="/history"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <History className="w-4 h-4 text-indigo-600" />
            Move History
          </a>

          <div className="pt-2 pb-1 px-3 text-[11px] font-bold uppercase text-slate-400">Settings</div>
          <a
            href="/settings/warehouses"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 pl-6"
          >
            <Building2 className="w-4 h-4 text-indigo-600" />
            Warehouses
          </a>
          <a
            href="/settings/locations"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 pl-6"
          >
            <MapPin className="w-4 h-4 text-indigo-600" />
            Locations
          </a>
        </div>
      )}
    </header>
  );
}
