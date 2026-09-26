import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ArrowDownRight,
  Truck,
  Layers,
  Sparkles,
  Package,
  User,
  Clock,
  Building2,
  CheckCircle2,
  RotateCcw,
  Boxes,
  Cpu,
  AlertCircle,
  FileCheck,
  Link as LinkIcon
} from 'lucide-react';
import { productApi, locationApi, movementApi } from '../../services/api';

export default function ExecuteMoveForm({ onExecuteMove }) {
  const [moveType, setMoveType] = useState('internal'); // 'internal' | 'incoming' | 'outgoing'
  
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(10);
  
  const [fromLocation, setFromLocation] = useState('Main Bay A1');
  const [toLocation, setToLocation] = useState('Production Bay B2');
  
  const [reference, setReference] = useState(`MV-${Date.now().toString().slice(-6)}`);
  const [responsible, setResponsible] = useState('Rohit Maurya');
  const [reason, setReason] = useState('Internal Warehouse Bay Shift');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadFormMasterData() {
      try {
        const [resProd, resLoc] = await Promise.all([
          productApi.getAll().catch(() => ({ data: [] })),
          locationApi.getAll().catch(() => ({ data: [] }))
        ]);
        setProducts(resProd.data || []);
        setLocations(resLoc.data || []);

        if (resProd.data && resProd.data.length > 0) {
          setSelectedProductId(resProd.data[0].id);
        }
        if (resLoc.data && resLoc.data.length >= 2) {
          setFromLocation(resLoc.data[0].name);
          setToLocation(resLoc.data[1].name);
        } else if (resLoc.data && resLoc.data.length === 1) {
          setFromLocation(resLoc.data[0].name);
        }
      } catch (err) {
        console.error('Failed to load move form data:', err);
      }
    }
    loadFormMasterData();
  }, []);

  const selectedProduct = products.find((p) => p.id === parseInt(selectedProductId)) || products[0];

  const handleMoveTypeChange = (type) => {
    setMoveType(type);
    if (type === 'internal') {
      setReason('Internal Warehouse Reorganization');
    } else if (type === 'incoming') {
      setFromLocation('Vendor Receiving Dock');
      setToLocation(locations[0]?.name || 'Central Bay');
      setReason('Direct Material Inward Receipt');
    } else if (type === 'outgoing') {
      setFromLocation(locations[0]?.name || 'Central Bay');
      setToLocation('Outbound Dispatch Bay');
      setReason('Direct Outbound Shipping');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setSubmitting(true);
    const qty = parseFloat(quantity) || 1;
    const directionType = moveType === 'incoming' ? 'IN' : moveType === 'outgoing' ? 'OUT' : 'INTERNAL';

    try {
      const payload = {
        reference: reference || `MV-${Date.now().toString().slice(-6)}`,
        type: directionType,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        sku: selectedProduct.sku,
        fromLocation,
        toLocation,
        quantity: qty,
        unit: selectedProduct.uom?.name || 'Units',
        balanceAfter: selectedProduct.onHand,
        reason: `${reason}${notes ? ` - ${notes}` : ''}`,
        responsible
      };

      const res = await movementApi.create(payload);
      if (onExecuteMove) {
        onExecuteMove(res.data);
      }
      setReference(`MV-${Date.now().toString().slice(-6)}`);
    } catch (err) {
      console.error('Failed to record stock movement:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
          Direct Internal Stock Shifting
        </span>
        <h2 className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
          <Boxes className="w-6 h-6 text-indigo-600" />
          Transfer & Relocate Inventory
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Shift products across warehouse locations, record direct staging adjustments, and audit location balances.
        </p>
      </div>

      {/* Movement Type Switcher */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-xl">
        <button
          type="button"
          onClick={() => handleMoveTypeChange('internal')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            moveType === 'internal'
              ? 'bg-white text-indigo-700 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Internal Transfer (Bay to Bay)
        </button>
        <button
          type="button"
          onClick={() => handleMoveTypeChange('incoming')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            moveType === 'incoming'
              ? 'bg-white text-emerald-700 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Direct Inward (IN)
        </button>
        <button
          type="button"
          onClick={() => handleMoveTypeChange('outgoing')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            moveType === 'outgoing'
              ? 'bg-white text-rose-700 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Direct Outward (OUT)
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Movement Ref */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Movement Reference
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:bg-white"
              required
            />
          </div>

          {/* Responsible */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Responsible Person
            </label>
            <input
              type="text"
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:bg-white"
            />
          </div>

          {/* Product Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Product / Item to Transfer <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:bg-white"
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku || 'N/A'}) — On-Hand: {p.onHand} {p.uom?.name || 'Units'}
                </option>
              ))}
              {products.length === 0 && (
                <option value="">No products found in database</option>
              )}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Quantity ({selectedProduct?.uom?.name || 'Units'}) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-900 focus:outline-none focus:bg-white"
              required
            />
          </div>

          {/* From Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Source Location (From) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              placeholder="e.g. WH/Rack-A1 (Electronics Bay)"
              className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:bg-white"
              required
            />
          </div>

          {/* To Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Destination Location (To) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              placeholder="e.g. WH/Rack-B2 (Assembly Line)"
              className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:bg-white"
              required
            />
          </div>
        </div>

        {/* Reason / Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Transfer Purpose / Remarks
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Rebalancing shelf capacity, assembly replenishment"
            className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={submitting || products.length === 0}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <ArrowRight className="w-4 h-4" />
            {submitting ? 'Executing Transfer...' : 'Execute Stock Transfer'}
          </button>
        </div>
      </form>
    </div>
  );
}
