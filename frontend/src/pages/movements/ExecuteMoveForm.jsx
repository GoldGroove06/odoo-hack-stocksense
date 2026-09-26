import React, { useState } from 'react';
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
import { WAREHOUSE_LOCATIONS, STAFF_LIST, PRODUCTS_LIST } from './movementData';

export default function ExecuteMoveForm({ onExecuteMove }) {
  const [moveType, setMoveType] = useState('internal'); // 'internal' | 'incoming' | 'outgoing' | 'manufacturing'
  
  // Selected product
  const [selectedProductId, setSelectedProductId] = useState(PRODUCTS_LIST[0].id);
  const [quantity, setQuantity] = useState(10);
  
  // Locations
  const [fromLocation, setFromLocation] = useState('WH/Rack-A1 (Electronics Bay)');
  const [toLocation, setToLocation] = useState('WH/Rack-B2 (Assembly Supplies)');
  
  // Staff & Timing
  const [selectedStaffId, setSelectedStaffId] = useState(STAFF_LIST[0].id);
  const [pickTime, setPickTime] = useState('11:00 AM');
  const [dropTime, setDropTime] = useState('11:30 AM');
  
  // Linking Reference
  const [reference, setReference] = useState(`MV-${Date.now().toString().slice(-6)}`);
  const [linkedDoc, setLinkedDoc] = useState('');
  const [contact, setContact] = useState('Internal Transfer - Bay Shift');
  const [notes, setNotes] = useState('');

  const selectedProduct = PRODUCTS_LIST.find((p) => p.id === selectedProductId) || PRODUCTS_LIST[0];
  const selectedStaff = STAFF_LIST.find((s) => s.id === selectedStaffId) || STAFF_LIST[0];

  // Auto configure defaults on moveType change
  const handleMoveTypeChange = (type) => {
    setMoveType(type);
    if (type === 'internal') {
      setFromLocation('WH/Rack-A1 (Electronics Bay)');
      setToLocation('WH/Rack-B2 (Assembly Supplies)');
      setContact('Internal Warehouse Reorganization');
      setLinkedDoc('INT-SHIFT');
    } else if (type === 'incoming') {
      setFromLocation('Vendors/Receiving Dock 1');
      setToLocation('WH/Rack-A1 (Electronics Bay)');
      setContact('TechLogix Industrial Solutions Ltd.');
      setLinkedDoc('WH/IN/00042');
    } else if (type === 'outgoing') {
      setFromLocation('WH/Rack-A1 (Electronics Bay)');
      setToLocation('WH/Dispatch Bay 1 (Outbound)');
      setContact('Bharat Dynamics & Infra Corp');
      setLinkedDoc('WH/OUT/00028');
    } else if (type === 'manufacturing') {
      setFromLocation('WH/Production & Assembly Line 4');
      setToLocation('WH/Rack-A2 (High-Value Storage)');
      setContact('Assembly Line 4 Work Order');
      setLinkedDoc('MO-2026-0012');
      // Default to manufactured item
      const mfgProd = PRODUCTS_LIST.find((p) => p.isManufactured);
      if (mfgProd) setSelectedProductId(mfgProd.id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = parseFloat(quantity) || 1;

    // Build main move record
    const directionType = moveType === 'incoming' ? 'IN' : moveType === 'outgoing' ? 'OUT' : 'INTERNAL';

    const mainMove = {
      id: `mov-${Date.now()}`,
      reference: reference || `MV-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      pickTime: pickTime || '11:00 AM',
      dropTime: dropTime || '11:30 AM',
      contact: contact || 'General Warehouse Movement',
      fromLocation: fromLocation,
      toLocation: toLocation,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: qty,
      unit: selectedProduct.unit,
      type: directionType,
      status: 'Done',
      staffId: selectedStaff.id,
      staffName: selectedStaff.name,
      linkedDoc: linkedDoc || 'DIRECT-MOVE',
      notes: notes || 'Stock relocated via warehouse operator'
    };

    // If manufactured and has BOM, compute raw materials auto-consumption entries
    const consumedEntries = [];
    if (selectedProduct.isManufactured && selectedProduct.bom && moveType === 'manufacturing') {
      selectedProduct.bom.forEach((raw, idx) => {
        const rawQty = raw.consumeQty * qty;
        consumedEntries.push({
          id: `mov-consume-${Date.now()}-${idx}`,
          reference: reference || `MO-${Date.now().toString().slice(-6)}`,
          date: new Date().toISOString().split('T')[0],
          pickTime: pickTime,
          dropTime: dropTime,
          contact: `Auto-Consumed for ${selectedProduct.name}`,
          fromLocation: raw.location,
          toLocation: 'WH/Production & Assembly Line 4',
          productId: raw.rawProductId,
          productName: raw.name,
          quantity: rawQty,
          unit: raw.unit,
          type: 'OUT',
          status: 'Done',
          staffId: selectedStaff.id,
          staffName: selectedStaff.name,
          linkedDoc: linkedDoc || 'MO-BOM-CONSUME',
          notes: `BOM raw material auto-decrement (${raw.consumeQty} ${raw.unit}/unit)`
        });
      });
    }

    onExecuteMove(mainMove, consumedEntries);

    // Reset reference for next move
    setReference(`MV-${Date.now().toString().slice(-6)}`);
    setNotes('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header Banner */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 font-mono">
            Internal Stock Movement & Logistics Transfer
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-indigo-600" />
            Transfer Goods Between Racks & Bins
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Shift inventory between warehouse racks, link to receipts/deliveries, or trigger manufacturing BOM consumption.
          </p>
        </div>

        {/* Movement Type Badges */}
        <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => handleMoveTypeChange('internal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              moveType === 'internal'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Rack-to-Rack (Internal)
          </button>
          <button
            type="button"
            onClick={() => handleMoveTypeChange('incoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              moveType === 'incoming'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Receipt Put-away (IN)
          </button>
          <button
            type="button"
            onClick={() => handleMoveTypeChange('outgoing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              moveType === 'outgoing'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Delivery Staging (OUT)
          </button>
          <button
            type="button"
            onClick={() => handleMoveTypeChange('manufacturing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              moveType === 'manufacturing'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Manufacturing BOM
          </button>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        
        {/* Row 1: Product Selection + Stock Preview + Move Reference */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Product Select */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Select Product to Move *
            </label>
            <div className="relative">
              <Package className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800"
              >
                {PRODUCTS_LIST.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name} ({prod.sku}) — Available: {prod.stockAvailable} {prod.unit}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Live Stock info badge */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-500">Current Location:</span>
              <span className="font-semibold text-slate-800 font-mono bg-slate-100 px-2 py-0.5 rounded">
                {selectedProduct.currentLocation}
              </span>
              <span className="text-slate-500">• In Stock:</span>
              <span className="font-bold text-indigo-700 font-mono">
                {selectedProduct.stockAvailable} {selectedProduct.unit}
              </span>
              {selectedProduct.isManufactured && (
                <span className="bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1">
                  <Cpu className="w-3 h-3" /> Manufactured (Auto BOM)
                </span>
              )}
            </div>
          </div>

          {/* Move Reference & Linked Doc */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Movement Reference Code
            </label>
            <input
              type="text"
              required
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-slate-800"
            />
          </div>

        </div>

        {/* Row 2: Location From -> Location To & Quantity */}
        <div className="p-5 rounded-2xl bg-indigo-50/30 border border-indigo-100/70 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
              <ArrowRight className="w-4 h-4 text-indigo-600" />
              Source & Destination Rack Allocation
            </span>
            <span className="text-xs text-indigo-600 font-mono">Physical Stock Transfer</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
            
            {/* From Location */}
            <div className="md:col-span-5 space-y-1">
              <label className="block text-xs font-semibold text-slate-600">
                Pick From Location (Source) *
              </label>
              <select
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-medium"
              >
                {WAREHOUSE_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Middle arrow */}
            <div className="md:col-span-1 flex justify-center py-2 md:py-0">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* To Location */}
            <div className="md:col-span-5 space-y-1">
              <label className="block text-xs font-semibold text-slate-600">
                Drop To Location (Destination) *
              </label>
              <select
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-medium"
              >
                {WAREHOUSE_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Quantity and Linked Doc */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-indigo-100/60">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity to Shift ({selectedProduct.unit}) *
              </label>
              <input
                type="number"
                required
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Linked Receipt / Delivery Document
              </label>
              <div className="relative">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. WH/IN/00042 or WH/OUT/00028"
                  value={linkedDoc}
                  onChange={(e) => setLinkedDoc(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-xs text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact / Partner / Reason
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="e.g. Vendor delivery / Internal shift"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Row 3: Staff ID & Pick/Drop Timestamps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Staff Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Staff ID & Operator *
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 text-slate-800 font-medium"
            >
              {STAFF_LIST.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.id} — {staff.name} ({staff.role})
                </option>
              ))}
            </select>
          </div>

          {/* Pick From Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Pick From Time
            </label>
            <input
              type="text"
              value={pickTime}
              onChange={(e) => setPickTime(e.target.value)}
              placeholder="e.g. 10:15 AM"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 font-mono text-slate-800"
            />
          </div>

          {/* Drop To Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Drop To Time
            </label>
            <input
              type="text"
              value={dropTime}
              onChange={(e) => setDropTime(e.target.value)}
              placeholder="e.g. 10:45 AM"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 font-mono text-slate-800"
            />
          </div>

        </div>

        {/* Manufacturing BOM Auto-Consumption Preview if applicable */}
        {selectedProduct.isManufactured && selectedProduct.bom && (
          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-purple-600" />
                Manufacturing BOM Auto-Consumption Preview (On Move)
              </span>
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                Auto-Decrement Raw Materials
              </span>
            </div>
            <p className="text-xs text-purple-800/80">
              Moving <strong className="text-purple-900">{quantity} {selectedProduct.unit}</strong> of manufactured item <strong className="text-purple-900">{selectedProduct.name}</strong> will automatically record consumption lines in the ledger for:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {selectedProduct.bom.map((raw) => (
                <div key={raw.rawProductId} className="p-2.5 bg-white rounded-lg border border-purple-100 text-xs">
                  <p className="font-semibold text-slate-800">{raw.name}</p>
                  <p className="text-slate-500 text-[11px]">Consume: <strong className="text-rose-600">{(raw.consumeQty * (parseFloat(quantity) || 1)).toFixed(1)} {raw.unit}</strong> from {raw.location}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes & Submit Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="flex-1">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Operator remarks (e.g. Pallet #3 moved via forklift, inspected seal)..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            Execute Move & Record in Ledger
          </button>
        </div>

      </form>
    </div>
  );
}
