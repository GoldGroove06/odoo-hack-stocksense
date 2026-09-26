import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Boxes,
  Plus,
  Trash2
} from 'lucide-react';
import { productApi, locationApi, transferApi } from '../../services/api';

export default function ExecuteMoveForm({ onExecuteMove, canCreate = true }) {
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);

  const [fromLocationId, setFromLocationId] = useState('');
  const [toLocationId, setToLocationId] = useState('');
  const [receiptId, setReceiptId] = useState('');
  const [deliveryId, setDeliveryId] = useState('');
  const [notes, setNotes] = useState('');
  const [responsible, setResponsible] = useState('Rohit Maurya');

  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadFormMasterData() {
      try {
        const [resProd, resLoc] = await Promise.all([
          productApi.getAll().catch(() => ({ data: [] })),
          locationApi.getAll().catch(() => ({ data: [] }))
        ]);
        const prodList = resProd.data || [];
        const locList = resLoc.data || [];
        setProducts(prodList);
        setLocations(locList);

        if (prodList.length > 0) {
          setSelectedProductId(String(prodList[0].id));
        }
        if (locList.length >= 2) {
          setFromLocationId(String(locList[0].id));
          setToLocationId(String(locList[1].id));
        } else if (locList.length === 1) {
          setFromLocationId(String(locList[0].id));
        }
      } catch (err) {
        console.error('Failed to load transfer form data:', err);
      }
    }
    loadFormMasterData();
  }, []);

  if (!canCreate) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 text-center max-w-2xl mx-auto">
        <Boxes className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-800">Create Transfer Restricted</h3>
        <p className="text-xs text-slate-500 mt-1">
          Only owners and inventory managers can create internal transfers. You can still pick and drop open transfers.
        </p>
      </div>
    );
  }

  const selectedProduct = products.find((p) => p.id === parseInt(selectedProductId));

  const handleAddItem = () => {
    if (!selectedProduct) return;
    const qty = parseFloat(quantity) || 1;
    setItems((prev) => [
      ...prev,
      {
        key: `item-${Date.now()}`,
        productId: Number(selectedProduct.id),
        name: selectedProduct.name,
        sku: selectedProduct.sku || '',
        quantity: qty,
        unit: selectedProduct.uom?.name || selectedProduct.unit || 'Units',
        productKind: selectedProduct.productKind
      }
    ]);
  };

  const handleRemoveItem = (key) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!fromLocationId || !toLocationId) {
      setError('Select both source and destination locations');
      return;
    }
    if (fromLocationId === toLocationId) {
      setError('Source and destination must be different');
      return;
    }
    if (items.length === 0) {
      setError('Add at least one product line');
      return;
    }

    setSubmitting(true);
    try {
      const isManufactured = items.some((i) => i.productKind === 'MANUFACTURING');
      const payload = {
        fromLocationId: Number(fromLocationId),
        toLocationId: Number(toLocationId),
        responsible,
        notes: notes || null,
        receiptId: receiptId ? Number(receiptId) : null,
        deliveryId: deliveryId ? Number(deliveryId) : null,
        isManufactured,
        items: items.map((i) => ({
          productId: Number(i.productId),
          name: i.name,
          sku: i.sku || null,
          quantity: Number(i.quantity) || 1,
          unit: i.unit || 'Units'
        }))
      };

      const res = await transferApi.create(payload);
      if (onExecuteMove) {
        onExecuteMove(res.data);
      }
      setItems([]);
      setNotes('');
      setReceiptId('');
      setDeliveryId('');
    } catch (err) {
      console.error('Failed to create transfer:', err);
      setError(err.message || 'Failed to create transfer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
          Internal Transfer Order
        </span>
        <h2 className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
          <Boxes className="w-6 h-6 text-indigo-600" />
          Create Transfer
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Move stock between locations. Staff will pick from source then drop at destination.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Source Location (From) <span className="text-rose-500">*</span>
            </label>
            <select
              value={fromLocationId}
              onChange={(e) => setFromLocationId(e.target.value)}
              className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:bg-white"
              required
            >
              <option value="">Select location</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Destination Location (To) <span className="text-rose-500">*</span>
            </label>
            <select
              value={toLocationId}
              onChange={(e) => setToLocationId(e.target.value)}
              className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:bg-white"
              required
            >
              <option value="">Select location</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Linked Receipt ID (optional)
            </label>
            <input
              type="number"
              min="1"
              value={receiptId}
              onChange={(e) => setReceiptId(e.target.value)}
              placeholder="e.g. 12"
              className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Linked Delivery ID (optional)
            </label>
            <input
              type="number"
              min="1"
              value={deliveryId}
              onChange={(e) => setDeliveryId(e.target.value)}
              placeholder="e.g. 8"
              className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:bg-white"
            />
          </div>

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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Replenishment, bay shift, manufacturing..."
              className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white"
            />
          </div>
        </div>

        {/* Add product lines */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Transfer Items</h4>
          <div className="flex flex-col sm:flex-row gap-2 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:bg-white"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku || 'N/A'}) — On-Hand: {p.onHand}
                    {p.productKind === 'MANUFACTURING' ? ' [MFG]' : ''}
                  </option>
                ))}
                {products.length === 0 && <option value="">No products found</option>}
              </select>
            </div>
            <div className="w-full sm:w-28">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Qty</label>
              <input
                type="number"
                min="1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-900 focus:outline-none focus:bg-white"
              />
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              disabled={!selectedProduct}
              className="px-4 py-2.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Line
            </button>
          </div>

          {items.length > 0 && (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Product</th>
                    <th className="py-2 px-3">SKU</th>
                    <th className="py-2 px-3 text-right">Qty</th>
                    <th className="py-2 px-3">Unit</th>
                    <th className="py-2 px-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.key}>
                      <td className="py-2 px-3 font-medium text-slate-800">
                        {item.name}
                        {item.productKind === 'MANUFACTURING' && (
                          <span className="ml-1.5 text-[10px] font-bold text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded">
                            MFG
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-500">{item.sku || '—'}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold">{item.quantity}</td>
                      <td className="py-2 px-3 text-slate-600">{item.unit}</td>
                      <td className="py-2 px-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.key)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={submitting || products.length === 0}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <ArrowRight className="w-4 h-4" />
            {submitting ? 'Creating Transfer...' : 'Create Transfer'}
          </button>
        </div>
      </form>
    </div>
  );
}
