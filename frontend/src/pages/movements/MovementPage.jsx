import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Info,
  ChevronRight,
  ArrowRightLeft,
  History,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine
} from 'lucide-react';
import { movementApi, transferApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ExecuteMoveForm from './ExecuteMoveForm';
import MovementsHistoryTable from './MovementsHistoryTable';
import Navbar from '../../components/Navbar';

export default function MovementPage() {
  const { user } = useAuth();
  const role = user?.role;
  const canCreate = role === 'OWNER' || role === 'INVENTORY_MANAGER';

  const [activeTab, setActiveTab] = useState('open'); // 'open' | 'create' | 'history'
  const [history, setHistory] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [movRes, xferRes] = await Promise.all([
        movementApi.getAll().catch(() => ({ data: [] })),
        transferApi.getAll().catch(() => ({ data: [] }))
      ]);
      setHistory(movRes.data || []);
      setTransfers(xferRes.data || []);
    } catch (err) {
      console.error('Failed to load movements/transfers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openTransfers = transfers.filter(
    (t) => t.status === 'draft' || t.status === 'picked' || t.status === 'in_progress'
  );

  const handleExecuteMove = async (newTransfer) => {
    showToast(
      `Transfer ${newTransfer.reference} created successfully!`,
      'success'
    );
    await fetchAll();
    setActiveTab('open');
  };

  const handlePick = async (id, ref) => {
    setActionLoading(`pick-${id}`);
    try {
      await transferApi.pick(id);
      showToast(`Transfer ${ref} picked from source location`);
      await fetchAll();
    } catch (err) {
      showToast(err.message || 'Pick failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDrop = async (id, ref) => {
    setActionLoading(`drop-${id}`);
    try {
      await transferApi.drop(id);
      showToast(`Transfer ${ref} dropped at destination & stock updated`);
      await fetchAll();
    } catch (err) {
      showToast(err.message || 'Drop failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-24">
      <Navbar activePage="history" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2.5 ${
              toastMessage.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : toastMessage.type === 'info'
                ? 'bg-sky-50 border-sky-200 text-sky-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <XCircle className="w-4 h-4 text-rose-600" />
            ) : toastMessage.type === 'info' ? (
              <Info className="w-4 h-4 text-sky-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar / Module Switcher */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3">
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <a
                  href="/receipts"
                  className="px-2.5 py-1 rounded-lg font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Receipts (WH/IN)
                </a>
                <a
                  href="/deliveries"
                  className="px-2.5 py-1 rounded-lg font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Deliveries (WH/OUT)
                </a>
                <a
                  href="/movements"
                  className="px-2.5 py-1 rounded-lg font-medium text-blue-700 bg-white shadow-2xs"
                >
                  Stock Movements
                </a>
              </div>

              <div className="flex items-center gap-1.5 text-slate-500">
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-900">Transfers & Ledger</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200 text-xs overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('open')}
                className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'open'
                    ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                Open Transfers ({openTransfers.length})
              </button>
              {canCreate && (
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeTab === 'create'
                      ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Create Transfer
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'history'
                    ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Ledger ({history.length})
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'create' ? (
          <ExecuteMoveForm onExecuteMove={handleExecuteMove} canCreate={canCreate} />
        ) : activeTab === 'history' ? (
          <MovementsHistoryTable
            history={history}
            loading={loading}
            onRefresh={() => {
              fetchAll();
              showToast('Stock ledger refreshed');
            }}
            onExecuteNew={() => setActiveTab(canCreate ? 'create' : 'open')}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Open Transfers</h3>
                <p className="text-xs text-slate-500">
                  Draft and picked transfers — pick from source, then drop at destination
                </p>
              </div>
              {canCreate && (
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl cursor-pointer"
                >
                  + New Transfer
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">From → To</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="py-10 text-center text-slate-400 text-xs">
                        Loading transfers...
                      </td>
                    </tr>
                  ) : openTransfers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-400">
                        <Package className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-medium text-slate-600 text-sm">No open transfers</p>
                        <p className="text-xs mt-1">Create a transfer to move stock between locations.</p>
                      </td>
                    </tr>
                  ) : (
                    openTransfers.map((t) => {
                      const canPick = t.status === 'draft';
                      const canDrop = t.status === 'picked' || t.status === 'in_progress';
                      const itemCount = (t.items || []).length;
                      const itemSummary = (t.items || [])
                        .slice(0, 2)
                        .map((i) => `${i.name} ×${i.quantity}`)
                        .join(', ');

                      return (
                        <tr key={t.id} className="hover:bg-slate-50/70">
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-semibold text-slate-900">{t.reference}</span>
                            {t.isManufactured && (
                              <span className="ml-2 text-[10px] font-bold text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded">
                                MFG
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 text-xs">
                            <span className="font-medium">{t.fromLocation?.name || '—'}</span>
                            <span className="text-slate-400 mx-1.5">→</span>
                            <span className="font-medium">{t.toLocation?.name || '—'}</span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-600">
                            <span className="font-semibold text-slate-800">{itemCount}</span>
                            {itemSummary && (
                              <span className="text-slate-400 ml-1.5">({itemSummary}{itemCount > 2 ? '…' : ''})</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                                t.status === 'draft'
                                  ? 'bg-slate-100 text-slate-700'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {t.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                disabled={!canPick || actionLoading === `pick-${t.id}`}
                                onClick={() => handlePick(t.id, t.reference)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <ArrowUpFromLine className="w-3.5 h-3.5" />
                                Pick
                              </button>
                              <button
                                type="button"
                                disabled={!canDrop || actionLoading === `drop-${t.id}`}
                                onClick={() => handleDrop(t.id, t.reference)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <ArrowDownToLine className="w-3.5 h-3.5" />
                                Drop
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
        )}
      </main>
    </div>
  );
}
