import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  LogOut,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { canAccess } from './ProtectedRoute';

function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || 'U';
}

export default function Navbar({ activePage = 'dashboard' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;

  const [isOperationsOpen, setIsOperationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const operationsRef = useRef(null);
  const settingsRef = useRef(null);
  const profileRef = useRef(null);

  const showReceipts = canAccess(role, 'receipts');
  const showDeliveries = canAccess(role, 'deliveries');
  const showAdjustments = canAccess(role, 'adjustments');
  const showSettings = canAccess(role, 'warehouses');
  const showCompany = canAccess(role, 'company');
  const showOperations = showReceipts || showDeliveries || showAdjustments;

  useEffect(() => {
    function handleClickOutside(event) {
      if (operationsRef.current && !operationsRef.current.contains(event.target)) {
        setIsOperationsOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isOperationsActive = ['receipts', 'deliveries', 'adjustments'].includes(activePage);
  const isSettingsActive = ['warehouses', 'locations'].includes(activePage);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div>
                <span className="font-bold text-base tracking-tight text-slate-900 block leading-tight">
                  StockSense
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  activePage === 'dashboard'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>

              {showOperations && (
                <div className="relative" ref={operationsRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOperationsOpen(!isOperationsOpen);
                      setIsSettingsOpen(false);
                      setIsProfileOpen(false);
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

                  {isOperationsOpen && (
                    <div className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50">
                      {showReceipts && (
                        <Link
                          to="/receipts"
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
                        </Link>
                      )}

                      {showDeliveries && (
                        <Link
                          to="/deliveries"
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
                        </Link>
                      )}

                      {showAdjustments && (
                        <>
                          {(showReceipts || showDeliveries) && (
                            <div className="border-t border-slate-100 my-1"></div>
                          )}
                          <Link
                            to="/adjustments"
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
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              <Link
                to="/stock"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  activePage === 'stock'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Boxes className="w-4 h-4" />
                Stock
              </Link>

              <Link
                to="/history"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  activePage === 'history' || activePage === 'movements'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <History className="w-4 h-4" />
                Move History
              </Link>

              {showSettings && (
                <div className="relative" ref={settingsRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(!isSettingsOpen);
                      setIsOperationsOpen(false);
                      setIsProfileOpen(false);
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

                  {isSettingsOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50">
                      <Link
                        to="/settings/warehouses"
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
                      </Link>

                      <Link
                        to="/settings/locations"
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
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </nav>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsOperationsOpen(false);
                  setIsSettingsOpen(false);
                }}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 hover:bg-slate-100 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-semibold text-xs">
                  {initials(user?.name)}
                </div>
                <div className="text-left pr-1 hidden lg:block">
                  <div className="text-xs font-semibold text-slate-800 leading-tight max-w-[120px] truncate">
                    {user?.name || 'User'}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wide">
                    {role?.replaceAll('_', ' ') || ''}
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <div className="text-sm font-semibold text-slate-900 truncate">{user?.name}</div>
                    <div className="text-xs text-slate-500 truncate">{user?.email}</div>
                  </div>
                  {showCompany && (
                    <Link
                      to="/company"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Users className="w-4 h-4 text-indigo-600" />
                      Company Management
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

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

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <div className="px-3 py-2 mb-2 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-sm font-semibold text-slate-900">{user?.name}</div>
            <div className="text-xs text-slate-500">{user?.email}</div>
          </div>

          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-600" />
            Dashboard
          </Link>

          {showOperations && (
            <>
              <div className="pt-2 pb-1 px-3 text-[11px] font-bold uppercase text-slate-400">Operations</div>
              {showReceipts && (
                <Link
                  to="/receipts"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 pl-6"
                >
                  <Package className="w-4 h-4 text-indigo-600" />
                  Receipts (WH/IN)
                </Link>
              )}
              {showDeliveries && (
                <Link
                  to="/deliveries"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 pl-6"
                >
                  <Truck className="w-4 h-4 text-emerald-600" />
                  Deliveries (WH/OUT)
                </Link>
              )}
              {showAdjustments && (
                <Link
                  to="/adjustments"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 pl-6"
                >
                  <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                  Adjustments
                </Link>
              )}
            </>
          )}

          <div className="pt-2 pb-1 px-3 text-[11px] font-bold uppercase text-slate-400">Inventory & History</div>
          <Link
            to="/stock"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <Boxes className="w-4 h-4 text-indigo-600" />
            Stock
          </Link>
          <Link
            to="/history"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <History className="w-4 h-4 text-indigo-600" />
            Move History
          </Link>

          {showSettings && (
            <>
              <div className="pt-2 pb-1 px-3 text-[11px] font-bold uppercase text-slate-400">Settings</div>
              <Link
                to="/settings/warehouses"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 pl-6"
              >
                <Building2 className="w-4 h-4 text-indigo-600" />
                Warehouses
              </Link>
              <Link
                to="/settings/locations"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 pl-6"
              >
                <MapPin className="w-4 h-4 text-indigo-600" />
                Locations
              </Link>
            </>
          )}

          {showCompany && (
            <Link
              to="/company"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Users className="w-4 h-4 text-indigo-600" />
              Company Management
            </Link>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
