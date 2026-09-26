import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Search,
  Building2,
  CheckCircle2,
  Edit3,
  Trash2,
  X,
  Layers,
  Sparkles
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { INITIAL_LOCATIONS, INITIAL_WAREHOUSES } from '../../data/inventoryStore';

export default function LocationsPage() {
  const [locations, setLocations] = useState(INITIAL_LOCATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    shortcode: '',
    address: '',
    warehouse: INITIAL_WAREHOUSES[0].name,
    type: 'Internal Storage',
    capacity: '1,000 Units'
  });

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingLoc(null);
    setFormData({
      name: '',
      shortcode: '',
      address: '',
      warehouse: INITIAL_WAREHOUSES[0].name,
      type: 'Internal Storage',
      capacity: '1,000 Units'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (loc) => {
    setEditingLoc(loc);
    setFormData({
      name: loc.name,
      shortcode: loc.shortcode,
      address: loc.address,
      warehouse: loc.warehouse || INITIAL_WAREHOUSES[0].name,
      type: loc.type || 'Internal Storage',
      capacity: loc.capacity || '1,000 Units'
    });
    setIsModalOpen(true);
  };

  const handleSaveLocation = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.shortcode.trim()) return;

    if (editingLoc) {
      const updated = locations.map((l) =>
        l.id === editingLoc.id
          ? { ...l, ...formData, shortcode: formData.shortcode.toUpperCase() }
          : l
      );
      setLocations(updated);
      showToast(`Location "${formData.name}" updated successfully!`);
    } else {
      const newLoc = {
        id: `loc-${Date.now()}`,
        name: formData.name.trim(),
        shortcode: formData.shortcode.trim().toUpperCase(),
        address: formData.address.trim(),
        warehouse: formData.warehouse,
        type: formData.type,
        capacity: formData.capacity,
        status: 'Active'
      };
      setLocations([...locations, newLoc]);
      showToast(`Location "${newLoc.name}" added successfully!`);
    }
    setIsModalOpen(false);
  };

  const filteredLocations = locations.filter((loc) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        loc.name.toLowerCase().includes(q) ||
        loc.shortcode.toLowerCase().includes(q) ||
        loc.address.toLowerCase().includes(q) ||
        loc.warehouse.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-24">
      <Navbar activePage="locations" />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className="px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2.5 bg-emerald-50 border-emerald-200 text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-6 h-6 text-indigo-600" />
              Location & Storage Rack Configuration
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Define internal warehouse racks, receiving docks, and dispatch staging bays.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add Location
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search location name, shortcode (WH/STOCK/A1), or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800"
            />
          </div>
        </div>

        {/* Locations Table (Fields: name, shortcode, address) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 w-36 text-center">Shortcode</th>
                  <th className="py-3.5 px-4 min-w-[220px]">Location Name</th>
                  <th className="py-3.5 px-4 min-w-[240px]">Specific Rack / Bay Address</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Parent Warehouse</th>
                  <th className="py-3.5 px-4 w-28 text-center">Type</th>
                  <th className="py-3.5 px-4 w-20 text-center">Edit</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredLocations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Shortcode */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                        {loc.shortcode}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {loc.name}
                    </td>

                    {/* Address */}
                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      {loc.address}
                    </td>

                    {/* Parent Warehouse */}
                    <td className="py-3.5 px-4 text-slate-700 text-xs">
                      <div className="font-medium text-slate-900">{loc.warehouse}</div>
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {loc.type}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(loc)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Location"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* ADD / EDIT LOCATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">
                    {editingLoc ? 'Edit Storage Location' : 'Add New Location'}
                  </h3>
                  <p className="text-xs text-slate-500">Rack name, shortcode, and address</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Location Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WH/Stock/Main Bay A1 (Electronics Bay)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Location Shortcode *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WH/STOCK/A1"
                  value={formData.shortcode}
                  onChange={(e) => setFormData({ ...formData, shortcode: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none uppercase font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Specific Rack / Bay Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rack Row A, Section 1, Ground Floor"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Parent Warehouse</label>
                  <select
                    value={formData.warehouse}
                    onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    {INITIAL_WAREHOUSES.map((wh) => (
                      <option key={wh.id} value={`${wh.name} (${wh.shortcode})`}>
                        {wh.name} ({wh.shortcode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Location Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="Internal Storage">Internal Storage</option>
                    <option value="Incoming Dock">Incoming Dock</option>
                    <option value="Outgoing Staging">Outgoing Staging</option>
                    <option value="Production Line">Production Line</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  {editingLoc ? 'Save Changes' : 'Create Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
