import React, { useState, useEffect } from 'react';
import { X, Building2, Check, UserCheck, Loader2 } from 'lucide-react';

export default function SupplierModal({
  isOpen,
  onClose,
  currentSupplier,
  onSelectSupplier,
  suppliers = [],
  onCreateSupplier
}) {
  const [activeMode, setActiveMode] = useState('select'); // 'select' | 'custom'
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gstNumber: '',
    phone: '',
    email: '',
    address: '',
    contactPerson: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: currentSupplier?.name || '',
        gstNumber: currentSupplier?.gstNumber || '',
        phone: currentSupplier?.phone || '',
        email: currentSupplier?.email || '',
        address: currentSupplier?.address || '',
        contactPerson: currentSupplier?.contactPerson || ''
      });
    }
  }, [isOpen, currentSupplier]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (onCreateSupplier) {
      setSaving(true);
      try {
        const created = await onCreateSupplier({
          name: formData.name.trim(),
          gstNumber: formData.gstNumber || null,
          phone: formData.phone || null,
          email: formData.email || null,
          address: formData.address || null,
          contactPerson: formData.contactPerson || null
        });
        if (created) {
          onSelectSupplier(created);
          onClose();
        }
      } finally {
        setSaving(false);
      }
    } else {
      onSelectSupplier(formData);
      onClose();
    }
  };

  const handleSelectPreset = (sup) => {
    onSelectSupplier(sup);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Supplier Information</h3>
              <p className="text-xs text-slate-500">Select an existing vendor or create a new supplier</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-6">
          <button
            type="button"
            onClick={() => setActiveMode('select')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeMode === 'select'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Choose Registered Supplier
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('custom')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeMode === 'custom'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Create New Supplier
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeMode === 'select' ? (
            <div className="space-y-3">
              {suppliers.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-8">
                  No suppliers yet. Create one using the tab above.
                </p>
              ) : (
                suppliers.map((sup) => {
                  const isCurrent = currentSupplier?.id === sup.id || currentSupplier?.name === sup.name;
                  return (
                    <div
                      key={sup.id}
                      onClick={() => handleSelectPreset(sup)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                        isCurrent
                          ? 'border-indigo-600 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-500'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-800">{sup.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{sup.address || 'No address on file'}</p>
                        </div>
                        {isCurrent && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                            <Check className="w-3.5 h-3.5" /> Selected
                          </span>
                        )}
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 font-mono">
                        {sup.gstNumber && <span><strong>GSTIN:</strong> {sup.gstNumber}</span>}
                        {sup.phone && <span><strong>Phone:</strong> {sup.phone}</span>}
                        {sup.contactPerson && <span><strong>Contact:</strong> {sup.contactPerson}</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <form id="supplier-form" onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Company / Supplier Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Apex Industrial Solutions Pvt Ltd"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">GST Number (GSTIN)</label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. 27AAACT2727Q1ZR"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98200 00000"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contactPerson || ''}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="supplier@company.com"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Billing / Dispatch Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address, unit, industrial area"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
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
          {activeMode === 'custom' && (
            <button
              type="submit"
              form="supplier-form"
              disabled={saving}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Create & Select Supplier'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
