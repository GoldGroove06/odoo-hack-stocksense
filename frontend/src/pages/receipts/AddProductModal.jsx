import React, { useState } from 'react';
import { X, Plus, Search, Package, Sparkles } from 'lucide-react';
import { PRODUCT_CATALOG } from './receiptData';

export default function AddProductModal({ isOpen, onClose, onAddProduct }) {
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'custom'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom product state
  const [customProduct, setCustomProduct] = useState({
    name: '',
    sku: '',
    cost: '',
    unit: 'Units',
    qty: 1
  });

  // Selected catalog item
  const [selectedCatalogItem, setSelectedCatalogItem] = useState(null);
  const [catalogQty, setCatalogQty] = useState(1);
  const [catalogCost, setCatalogCost] = useState('');

  if (!isOpen) return null;

  const filteredCatalog = PRODUCT_CATALOG.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCatalog = (item) => {
    setSelectedCatalogItem(item);
    setCatalogCost(item.defaultCost);
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
      unit: selectedCatalogItem.unit,
      qty: qty,
      receivedQty: qty,
      totalPrice: cost * qty
    });
    
    // Reset & Close
    setSelectedCatalogItem(null);
    onClose();
  };

  const handleAddCustomProduct = (e) => {
    e.preventDefault();
    if (!customProduct.name.trim()) return;

    const cost = parseFloat(customProduct.cost) || 0;
    const qty = parseFloat(customProduct.qty) || 1;

    onAddProduct({
      id: `item-${Date.now()}`,
      productId: `custom-${Date.now()}`,
      productName: customProduct.name.trim(),
      sku: customProduct.sku.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      cost: cost,
      unit: customProduct.unit,
      qty: qty,
      receivedQty: qty,
      totalPrice: cost * qty
    });

    setCustomProduct({
      name: '',
      sku: '',
      cost: '',
      unit: 'Units',
      qty: 1
    });
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
              <h3 className="font-semibold text-slate-800 text-base">Add Product to Receipt</h3>
              <p className="text-xs text-slate-500">Add goods line with unit price, quantity, and unit of measure</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'catalog'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Package className="w-4 h-4" />
            Choose from Product Catalog
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'custom'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Create Custom / New Item
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'catalog' ? (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search product name, SKU, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {filteredCatalog.map((item) => {
                  const isSelected = selectedCatalogItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectCatalog(item)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-800 line-clamp-1">{item.name}</p>
                          <span className="text-xs text-slate-500 font-mono">SKU: {item.sku}</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          ₹{item.defaultCost.toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">{item.category}</span>
                        <span>Unit: {item.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedCatalogItem && (
                <div className="mt-4 p-4 rounded-xl bg-indigo-50/40 border border-indigo-100 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-900">
                    Configure Selected: {selectedCatalogItem.name}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Cost / Unit Price (₹)</label>
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
                      <label className="block text-xs font-medium text-slate-600 mb-1">Quantity</label>
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
          ) : (
            <form id="custom-product-form" onSubmit={handleAddCustomProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Copper Wire 4mm Standard"
                  value={customProduct.name}
                  onChange={(e) => setCustomProduct({ ...customProduct, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">SKU / Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CW-4MM-STD"
                    value={customProduct.sku}
                    onChange={(e) => setCustomProduct({ ...customProduct, sku: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Unit of Measure</label>
                  <select
                    value={customProduct.unit}
                    onChange={(e) => setCustomProduct({ ...customProduct, unit: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="Units">Units</option>
                    <option value="Pcs">Pcs (Pieces)</option>
                    <option value="Kg">Kg (Kilograms)</option>
                    <option value="Box">Box</option>
                    <option value="Cartridge">Cartridge</option>
                    <option value="Drum">Drum</option>
                    <option value="Liters">Liters</option>
                    <option value="Meters">Meters</option>
                    <option value="Rolls">Rolls</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Cost / Unit Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={customProduct.cost}
                    onChange={(e) => setCustomProduct({ ...customProduct, cost: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={customProduct.qty}
                    onChange={(e) => setCustomProduct({ ...customProduct, qty: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Total Price</label>
                  <div className="w-full px-3.5 py-2 text-sm font-semibold bg-slate-100 border border-slate-200 rounded-lg text-slate-800">
                    ₹{((parseFloat(customProduct.cost) || 0) * (parseFloat(customProduct.qty) || 1)).toLocaleString()}
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>

          {activeTab === 'catalog' ? (
            <button
              type="button"
              disabled={!selectedCatalogItem}
              onClick={handleAddCatalogProduct}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Selected Product
            </button>
          ) : (
            <button
              type="submit"
              form="custom-product-form"
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Custom Product
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
