import React, { useState } from 'react';
import { X, Building2, Check, UserCheck } from 'lucide-react';
import { SAMPLE_CUSTOMERS } from './deliveryData';

export default function CustomerModal({ isOpen, onClose, currentCustomer, onSelectCustomer }) {
  const [activeMode, setActiveMode] = useState('select'); // 'select' | 'custom'
  const [formData, setFormData] = useState(currentCustomer || {
    name: '',
    gstNumber: '',
    phone: '',
    email: '',
    shippingAddress: '',
    city: '',
    state: '',
    pincode: '',
    contactPerson: ''
  });

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSelectCustomer(formData);
    onClose();
  };

  const handleSelectPreset = (cust) => {
    onSelectCustomer(cust);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-semibold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Delivery Customer Details</h3>
              <p className="text-xs text-slate-500">Select an existing client or update delivery address and contact</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-6">
          <button
            type="button"
            onClick={() => setActiveMode('select')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeMode === 'select'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Select Customer
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('custom')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeMode === 'custom'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Edit / Custom Shipping Address
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeMode === 'select' ? (
            <div className="space-y-3">
              {SAMPLE_CUSTOMERS.map((cust) => {
                const isCurrent = currentCustomer?.id === cust.id || currentCustomer?.name === cust.name;
                return (
                  <div
                    key={cust.id}
                    onClick={() => handleSelectPreset(cust)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      isCurrent
                        ? 'border-emerald-600 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">{cust.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{cust.shippingAddress}, {cust.city}, {cust.state} - {cust.pincode}</p>
                      </div>
                      {isCurrent && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <Check className="w-3.5 h-3.5" /> Selected
                        </span>
                      )}
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 font-mono">
                      <span><strong>GSTIN:</strong> {cust.gstNumber}</span>
                      <span><strong>Phone:</strong> {cust.phone}</span>
                      <span><strong>Contact:</strong> {cust.contactPerson}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <form id="customer-form" onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Customer / Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Bharat Dynamics & Infra Corp"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">GST Number (GSTIN) *</label>
                  <input
                    type="text"
                    required
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. 27AAACB3829M1ZQ"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 uppercase font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98230 11982"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
                    placeholder="e.g. Arun Deshmukh"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="customer@domain.com"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Shipping / Delivery Address</label>
                <input
                  type="text"
                  value={formData.shippingAddress || formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                  placeholder="Street address, unit, industrial park"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state || ''}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="State"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">PIN / Zip</label>
                  <input
                    type="text"
                    value={formData.pincode || ''}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="400705"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-emerald-500"
                  />
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
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          {activeMode === 'custom' && (
            <button
              type="submit"
              form="customer-form"
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              Save Customer Info
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
