import React, { useState } from 'react';
import {
  Boxes,
  Layers,
  CheckCircle2,
  XCircle,
  Info,
  ChevronRight,
  Plus,
  RefreshCw,
  ArrowRightLeft,
  History,
  Sparkles,
  Cpu
} from 'lucide-react';
import { INITIAL_MOVEMENT_HISTORY } from './movementData';
import ExecuteMoveForm from './ExecuteMoveForm';
import MovementsHistoryTable from './MovementsHistoryTable';
import Navbar from '../../components/Navbar';

export default function MovementPage() {
  const [activeTab, setActiveTab] = useState('execute'); // 'execute' | 'history'
  const [history, setHistory] = useState(INITIAL_MOVEMENT_HISTORY);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleExecuteMove = (mainMove, consumedEntries = []) => {
    // Append main move and any BOM consumed entries to the history ledger
    const newHistory = [mainMove, ...consumedEntries, ...history];
    setHistory(newHistory);

    if (consumedEntries.length > 0) {
      showToast(
        `Move ${mainMove.reference} executed! Auto-consumed ${consumedEntries.length} raw material components into ledger.`,
        'success'
      );
    } else {
      showToast(
        `Stock transfer ${mainMove.reference} (${mainMove.quantity} ${mainMove.unit} of ${mainMove.productName}) recorded successfully!`,
        'success'
      );
    }

    // Switch to history tab to view newly logged row
    setActiveTab('history');
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
            {/* Module Switcher Breadcrumb */}
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
                <span className="font-semibold text-slate-900">Internal Transfers & Ledger</span>
              </div>
            </div>

            {/* View Mode Tab Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('execute')}
                className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'execute'
                    ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                Transfer Goods (Shift)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Movement History & Ledger ({history.length})
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'execute' ? (
          <ExecuteMoveForm onExecuteMove={handleExecuteMove} />
        ) : (
          <MovementsHistoryTable
            history={history}
            onRefresh={() => showToast('Stock ledger refreshed')}
          />
        )}
      </main>
    </div>
  );
}
