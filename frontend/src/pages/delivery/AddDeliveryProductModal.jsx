import React, { useState } from 'react';
import { X, Plus, Search, Package, AlertTriangle } from 'lucide-react';

function freeQtyAtLocation(product, locationId) {
  if (!locationId || !product) return 0;
  const quants = product.stockQuants || [];
  const q = quants.find((sq) => Number(sq.locationId) === Number(locationId));
  if (!q) return 0;
  if (q.freeQty != null) return Math.max(0, Number(q.freeQty));
  return Math.max(0, (Number(q.quantity) || 0) - (Number(q.reservedQty) || 0));
}

export default function AddDeliveryProductModal({
  isOpen,
  onClose,
  onAddProduct,
  products = [],
  sourceLocationId = null
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatalogItem, setSelectedCatalogItem] = useState(null);
  const [catalogQty, setCatalogQty] = useState(1);
  const [catalogCost, setCatalogCost] = useState('');
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  if (!sourceLocationId) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Select source location first</h3>
              <p className="text-xs text-slate-500 mt-1">
                You can only ship stock that exists at a location. Choose the source bay/rack on the delivery form, then add products.
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredCatalog = (products || []).filter((item) => {
    const q = searchQuery.toLowerCase();
    const name = (item.name || '').toLowerCase();
    const sku = (item.sku || '').toLowerCase();
    const category = (item.category?.name || item.category || '').toLowerCase();
    return name.includes(q) || sku.includes(q) || category.includes(q);
  });

  const selectedAvailable = selectedCatalogItem
    ? freeQtyAtLocation(selectedCatalogItem, sourceLocationId)
    : 0;

  const handleSelectCatalog = (item) => {
    setSelectedCatalogItem(item);
    setCatalogCost(item.perUnitCost ?? item.defaultPrice ?? 0);
    const avail = freeQtyAtLocation(item, sourceLocationId);
    setCatalogQty(avail > 0 ? Math.min(1, avail) : 0);
    setError(null);
  };

  const handleAddCatalogProduct = () => {
    if (!selectedCatalogItem) return;
    const cost = parseFloat(catalogCost) || 0;
    let qty = parseFloat(catalogQty) || 0;
    const available = freeQtyAtLocation(selectedCatalogItem, sourceLocationId);

    if (available <= 0) {
      setError(`No available stock for ${selectedCatalogItem.name} at this location`);
      return;
    }
    if (qty > available) {
      setError(`Only ${available} available — cannot ship ${qty}`);
      return;
    }
    if (qty <= 0) {
      setError('Quantity must be at least 1');
      return;
    }

    onAddProduct({
      id: `del-item-${Date.now()}`,
      productId: Number(selectedCatalogItem.id),
      productName: selectedCatalogItem.name,
      sku: selectedCatalogItem.sku || '',
      cost,
      unit: selectedCatalogItem.uom?.name || selectedCatalogItem.unit || 'Units',
      qty,
      doneQty: qty,
      totalPrice: cost * qty,
      availableQty: available
    });

    setSelectedCatalogItem(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-semibold">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Add Product to Delivery</h3>
              <p className="text-xs text-slate-500">
                Only products with free stock at the source location can be shipped
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products, SKU, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {filteredCatalog.length === 0 ? (
              <p className="col-span-2 text-center text-xs text-slate-400 py-6">No products found.</p>
            ) : (
              filteredCatalog.map((item) => {
                const isSelected = selectedCatalogItem?.id === item.id;
                const unitCost = Number(item.perUnitCost ?? item.defaultPrice ?? 0);
                const category = item.category?.name || item.category || 'General';
                const available = freeQtyAtLocation(item, sourceLocationId);
                const outOfStock = available <= 0;
                return (
                  <div
                    key={item.id}
                    onClick={() => !outOfStock && handleSelectCatalog(item)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      outOfStock
                        ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                        : isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500 cursor-pointer'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-slate-800 line-clamp-1">{item.name}</p>
                        <span className="text-xs text-slate-500 font-mono">SKU: {item.sku || '—'}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                        ₹{unitCost.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] text-slate-500">
                        {category}
                      </span>
                      <span
                        className={`font-semibold ${
                          outOfStock ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        Available: {available}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {selectedCatalogItem && (
            <div className="mt-2 p-4 rounded-xl bg-emerald-50/40 border border-emerald-100 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-900">
                Configure: {selectedCatalogItem.name}
              </h4>
              <p className="text-xs text-emerald-800">
                Free at source location: <strong>{selectedAvailable}</strong>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={catalogCost}
                    onChange={(e) => setCatalogCost(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Ship Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedAvailable}
                    step="1"
                    value={catalogQty}
                    onChange={(e) => {
                      setCatalogQty(e.target.value);
                      setError(null);
                    }}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Line Total</label>
                  <div className="w-full px-3 py-1.5 text-sm font-semibold bg-white border border-slate-200 rounded-lg text-slate-800">
                    ₹{((parseFloat(catalogCost) || 0) * (parseFloat(catalogQty) || 0)).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedCatalogItem || selectedAvailable <= 0}
            onClick={handleAddCatalogProduct}
            className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add to Delivery
          </button>
        </div>
      </div>
    </div>
  );
}
