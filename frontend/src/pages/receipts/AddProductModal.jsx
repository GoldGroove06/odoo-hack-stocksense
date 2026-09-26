import React, { useState, useEffect } from 'react';
import { X, Plus, Search, Package, ArrowUpRight } from 'lucide-react';
import { productApi } from '../../services/api';

export default function AddProductModal({ isOpen, onClose, onAddProduct }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Selected catalog item
  const [selectedCatalogItem, setSelectedCatalogItem] = useState(null);
  const [catalogQty, setCatalogQty] = useState(1);
  const [catalogCost, setCatalogCost] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      productApi.getAll()
        .then((res) => {
          if (res && Array.isArray(res.data)) {
            setCatalogProducts(res.data);
          } else {
            setCatalogProducts([]);
          }
        })
        .catch(() => setCatalogProducts([]))
        .finally(() => setLoading(false));
    } else {
      setSelectedCatalogItem(null);
      setSearchQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCatalog = catalogProducts.filter((item) =>
    (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.sku || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.category?.name || item.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCatalog = (item) => {
    setSelectedCatalogItem(item);
    setCatalogCost(item.perUnitCost || 0);
    setCatalogQty(1);
  };

  const handleAddCatalogProduct = () => {
    if (!selectedCatalogItem) return;
    const cost = parseFloat(catalogCost) || 0;
    const qty = parseFloat(catalogQty) || 1;
    
    onAddProduct({
      id: `item-${Date.now()}`,
      productId: selectedCatalogItem.id,
      productName: selectedCatalogItem.name,
      sku: selectedCatalogItem.sku,
      cost: cost,
      unit: selectedCatalogItem.uom?.name || selectedCatalogItem.unit || 'Units',
      qty: qty,
      receivedQty: qty,
      totalPrice: cost * qty
    });
    
    setSelectedCatalogItem(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Select Existing Product</h3>
              <p className="text-xs text-slate-500">Pick an existing product from inventory catalog to add to receipt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product name, SKU, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-xs">Loading products from catalog...</p>
            </div>
          ) : filteredCatalog.length === 0 ? (
            <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl px-4">
              <Package className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700 text-sm">No Existing Products Found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Only existing catalog products can be added to receipts. Please create products in the Products page first.
              </p>
              <a
                href="/products"
                className="mt-3 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg inline-flex items-center gap-1.5"
              >
                Go to Products Catalog <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {filteredCatalog.map((item) => {
                const isSelected = selectedCatalogItem?.id === item.id;
                const catName = item.category?.name || item.category || 'General';
                const unitName = item.uom?.name || item.unit || 'Units';
                const price = item.perUnitCost || 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectCatalog(item)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-800 line-clamp-1">{item.name}</p>
                        <span className="text-xs text-slate-500 font-mono">SKU: {item.sku}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        ₹{Number(price).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">{catName}</span>
                      <span>Stock: {item.onHand || 0} {unitName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedCatalogItem && (
            <div className="mt-4 p-4 rounded-xl bg-indigo-50/40 border border-indigo-100 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-900">
                Configure Line: {selectedCatalogItem.name}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={catalogCost}
                    onChange={(e) => setCatalogCost(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Quantity to Receive</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={catalogQty}
                    onChange={(e) => setCatalogQty(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Line Total</label>
                  <div className="w-full px-3 py-1.5 text-sm font-semibold bg-white border border-slate-200 rounded-lg text-slate-800">
                    ₹{((parseFloat(catalogCost) || 0) * (parseFloat(catalogQty) || 1)).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedCatalogItem}
            onClick={handleAddCatalogProduct}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Product to Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
