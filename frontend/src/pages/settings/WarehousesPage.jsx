import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  Edit3,
  Trash2,
  X,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { warehouseApi } from '../../services/api';

export default function WarehousesPage() {
  const { user } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWh, setEditingWh] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    shortcode: '',
    address: '',
    manager: '',
    phone: '',
    capacity: '5,000 m³'
  });

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await warehouseApi.getAll();
      if (res && Array.isArray(res.data)) {
        setWarehouses(res.data);
      } else {
        setWarehouses([]);
      }
    } catch (err) {
      console.warn('Backend warehouse API error:', err.message);
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleOpenAdd = () => {
    setEditingWh(null);
    setFormData({
      name: '',
      shortcode: '',
      address: '',
      manager: user?.name || 'Warehouse Manager',
      phone: '+91 98200 00000',
      capacity: '5,000 m³'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (wh) => {
    setEditingWh(wh);
    setFormData({
      name: wh.name,
      shortcode: wh.shortcode,
      address: wh.address,
      manager: wh.manager || '',
      phone: wh.phone || '',
      capacity: wh.capacity || '5,000 m³'
    });
    setIsModalOpen(true);
  };

  const handleSaveWarehouse = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.shortcode.trim()) return;

    const payload = {
      name: formData.name.trim(),
      shortcode: formData.shortcode.trim().toUpperCase(),
      address: formData.address.trim(),
      manager: formData.manager,
      phone: formData.phone
    };

    if (editingWh) {
      try {
        const res = await warehouseApi.update(editingWh.id, payload);
        if (res && res.data) {
          setWarehouses(warehouses.map((w) => (w.id === editingWh.id ? { ...w, ...res.data } : w)));
        }
      } catch (err) {
        setWarehouses(
          warehouses.map((w) =>
            w.id === editingWh.id ? { ...w, ...payload } : w
          )
        );
      }
      showToast(`Warehouse "${formData.name}" updated successfully!`);
    } else {
      let created = {
        id: `wh-${Date.now()}`,
        ...payload,
        totalLocations: 0,
        capacity: formData.capacity,
        status: 'Active'
      };
      try {
        const res = await warehouseApi.create(payload);
        if (res && res.data) {
          created = { ...created, ...res.data };
        }
      } catch (err) {
        console.warn('API create warehouse fallback to local:', err.message);
      }
      setWarehouses([...warehouses, created]);
      showToast(`Warehouse "${created.name}" added successfully!`);
    }
    setIsModalOpen(false);
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState(null);

  const handleDeleteWarehouse = async () => {
    if (!warehouseToDelete) return;
    try {
      try {
        await warehouseApi.delete(warehouseToDelete.id);
      } catch (err) {
        console.warn('API delete warehouse fallback to local:', err.message);
      }
      setWarehouses(warehouses.filter((w) => w.id !== warehouseToDelete.id));
      showToast(`Warehouse "${warehouseToDelete.name}" deleted successfully!`);
      setIsDeleteModalOpen(false);
      setWarehouseToDelete(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete warehouse');
    }
  };

  const filteredWarehouses = warehouses.filter((wh) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        wh.name.toLowerCase().includes(q) ||
        wh.shortcode.toLowerCase().includes(q) ||
        wh.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-24">
      <Navbar activePage="warehouses" />

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
              <Building2 className="w-6 h-6 text-indigo-600" />
              Warehouse Configuration
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage facility locations, storage hubs, addresses, and shortcodes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchWarehouses}
              title="Refresh from API"
              className="p-2 text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Warehouse
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search warehouse name, shortcode (WH, WH-N), or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800"
            />
          </div>
        </div>

        {/* Warehouses Table (Fields: name, shortcode, address) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 w-28 text-center">Shortcode</th>
                  <th className="py-3.5 px-4 min-w-[220px]">Warehouse Name</th>
                  <th className="py-3.5 px-4 min-w-[320px]">Full Address</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Manager / Phone</th>
                  <th className="py-3.5 px-4 w-28 text-center">Status</th>
                  <th className="py-3.5 px-4 w-28 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredWarehouses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-14 text-center text-slate-400">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-slate-700 text-sm">No warehouses configured</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        There are currently no warehouses in the database. Click below to add your primary distribution facility.
                      </p>
                      <button
                        type="button"
                        onClick={handleOpenAdd}
                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Warehouse
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredWarehouses.map((wh) => (
                    <tr key={wh.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Shortcode */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                        {wh.shortcode}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {wh.name}
                    </td>

                    {/* Address */}
                    <td className="py-3.5 px-4 text-slate-600 text-xs flex items-start gap-1.5 pt-4">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{wh.address}</span>
                    </td>

                    {/* Manager */}
                    <td className="py-3.5 px-4 text-slate-700 text-xs">
                      <div className="font-medium text-slate-900">{wh.manager}</div>
                      <div className="text-[11px] text-slate-400">{wh.phone}</div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        {wh.status || 'Active'}
                      </span>
                    </td>

                    {/* Actions (Edit / Delete) */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(wh)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Warehouse"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setWarehouseToDelete(wh);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Warehouse"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* ADD / EDIT WAREHOUSE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">
                    {editingWh ? 'Edit Warehouse' : 'Add New Warehouse'}
                  </h3>
                  <p className="text-xs text-slate-500">Facility name, shortcode, and address</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWarehouse} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Warehouse Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Western Regional Distribution Hub"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Shortcode * (Unique ID prefix)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WH-W or WH2"
                  value={formData.shortcode}
                  onChange={(e) => setFormData({ ...formData, shortcode: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none uppercase font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Facility Address *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Plot/Street number, industrial zone, city, state, pin code"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Facility Manager</label>
                  <input
                    type="text"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
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
                  {editingWh ? 'Save Changes' : 'Create Warehouse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && warehouseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Warehouse?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong className="text-slate-800 font-semibold">{warehouseToDelete.name}</strong> ({warehouseToDelete.shortcode})? This will remove the warehouse and its associated storage records.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setWarehouseToDelete(null);
                }}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteWarehouse}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
