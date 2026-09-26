import React, { useState, useEffect } from 'react';
import { X, Building2, Check, UserCheck, Plus } from 'lucide-react';
import { customerApi } from '../../services/api';

export default function CustomerModal({ isOpen, onClose, currentCustomer, onSelectCustomer }) {
  const [activeMode, setActiveMode] = useState('select'); // 'select' | 'custom'
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      customerApi.getAll()
        .then((res) => {
          if (res && Array.isArray(res.data)) {
            setCustomers(res.data);
          } else {
            setCustomers([]);
          }
        })
        .catch(() => setCustomers([]))
        .finally(() => setLoading(false));

      if (currentCustomer) {
        setFormData(currentCustomer);
      }
    }
  }, [isOpen, currentCustomer]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    try {
      const res = await customerApi.create(formData);
      if (res && res.data) {
        onSelectCustomer(res.data);
      } else {
        onSelectCustomer(formData);
      }
    } catch {
      onSelectCustomer(formData);
    }
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
              <p className="text-xs text-slate-500">Select an existing client or create customer shipping details</p>
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
            + Add New / Custom Customer
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeMode === 'select' ? (
            <div className="space-y-3">
              {loading ? (
                <div className="py-12 text-center text-slate-400">
                  <div className="animate-spin w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-xs">Loading customers...</p>
                </div>
              ) : customers.length === 0 ? (
                <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-700 text-sm">No Customers Found</p>
                  <p className="text-xs text-slate-400 mt-1">No customers currently exist in the database.</p>
                  <button
                    type="button"
                    onClick={() => setActiveMode('custom')}
                    className="mt-3 px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add New Customer
                  </button>
                </div>
              ) : (
                customers.map((cust) => {
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
                          <p className="text-xs text-slate-500 mt-0.5">
                            {cust.shippingAddress || cust.address || ''}{cust.city ? `, ${cust.city}` : ''}{cust.state ? `, ${cust.state}` : ''}
                          </p>
                        </div>
                        {isCurrent && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            <Check className="w-3.5 h-3.5" /> Selected
                          </span>
                        )}
                      </div>
                      <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-600">
                        <span><strong>Contact:</strong> {cust.contactPerson || '—'}</span>
                        <span><strong>Phone:</strong> {cust.phone || '—'}</span>
                        <span><strong>GST:</strong> {cust.gstNumber || '—'}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <form id="customer-edit-form" onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Company / Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp Ltd"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Arun Deshmukh"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98200 00000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="client@acme.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">GST Number</label>
                  <input
                    type="text"
                    placeholder="27AAAAA0000A1Z5"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Shipping Street Address</label>
                <input
                  type="text"
                  placeholder="Plot / Unit, Industrial Area"
                  value={formData.shippingAddress || formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value, address: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
            </form>
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
          {activeMode === 'custom' && (
            <button
              type="submit"
              form="customer-edit-form"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Save & Apply Customer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
