import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Search,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Filter,
  RefreshCw,
  Layers,
  Sparkles,
  Boxes,
  ArrowRight,
  SlidersHorizontal,
  X,
  AlertTriangle,
  Tag,
  MapPin
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { productApi, categoryApi, uomApi, locationApi } from '../../services/api';
import { INITIAL_STOCKS, INITIAL_LOCATIONS } from '../../data/inventoryStore';

export default function Product() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    perUnitCost: '',
    onHand: '',
    freeToUse: '',
    minStockAlert: '10',
    categoryId: '',
    uomId: '',
    locationId: ''
  });

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch initial data from APIs
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Products
      try {
        const prodRes = await productApi.getAll();
        if (prodRes && prodRes.data) {
          setProducts(prodRes.data);
        }
      } catch (err) {
        console.warn('Backend not available, using fallback stock data:', err.message);
        setProducts(INITIAL_STOCKS);
      }

      // 2. Fetch Categories
      try {
        const catRes = await categoryApi.getAll();
        if (catRes && catRes.data) {
          setCategories(catRes.data);
        }
      } catch (err) {
        setCategories([
          { id: 1, name: 'Electronics' },
          { id: 2, name: 'Hardware' },
          { id: 3, name: 'Consumables' },
          { id: 4, name: 'Packaging' },
          { id: 5, name: 'Cabling' },
          { id: 6, name: 'Energy' }
        ]);
      }

      // 3. Fetch UOMs
      try {
        const uomRes = await uomApi.getAll();
        if (uomRes && uomRes.data) {
          setUoms(uomRes.data);
        }
      } catch (err) {
        setUoms([
          { id: 1, name: 'Units', symbol: 'unit' },
          { id: 2, name: 'Pieces', symbol: 'pcs' },
          { id: 3, name: 'Kilograms', symbol: 'kg' },
          { id: 4, name: 'Boxes', symbol: 'box' },
          { id: 5, name: 'Cartridges', symbol: 'crt' },
          { id: 6, name: 'Drums', symbol: 'drm' }
        ]);
      }

      // 4. Fetch Locations
      try {
        const locRes = await locationApi.getAll();
        if (locRes && locRes.data) {
          setLocations(locRes.data);
        }
      } catch (err) {
        setLocations(INITIAL_LOCATIONS);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Filter Products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Category filter
      if (selectedCategory !== 'ALL') {
        const catName = prod.category?.name || prod.category;
        if (catName !== selectedCategory) return false;
      }
      // Low stock filter
      if (lowStockOnly) {
        if (prod.onHand > (prod.minStockAlert || 10)) return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = prod.name.toLowerCase().includes(q);
        const matchesSku = prod.sku.toLowerCase().includes(q);
        const matchesDesc = (prod.description || '').toLowerCase().includes(q);
        return matchesName || matchesSku || matchesDesc;
      }
      return true;
    });
  }, [products, selectedCategory, lowStockOnly, searchQuery]);

  // Open Add Product Modal
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      description: '',
      perUnitCost: '100',
      onHand: '50',
      freeToUse: '50',
      minStockAlert: '10',
      categoryId: categories[0]?.id || '',
      uomId: uoms[0]?.id || '',
      locationId: locations[0]?.id || ''
    });
    setIsModalOpen(true);
  };

  // Open Edit Product Modal
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      perUnitCost: product.perUnitCost || '0',
      onHand: product.onHand || '0',
      freeToUse: product.freeToUse || product.onHand || '0',
      minStockAlert: product.minStockAlert || '10',
      categoryId: product.categoryId || product.category?.id || '',
      uomId: product.uomId || product.uom?.id || '',
      locationId: product.locationId || product.location?.id || ''
    });
    setIsModalOpen(true);
  };

  // Submit Create or Update
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      description: formData.description.trim() || null,
      perUnitCost: parseFloat(formData.perUnitCost) || 0.0,
      onHand: parseFloat(formData.onHand) || 0.0,
      freeToUse: parseFloat(formData.freeToUse) || parseFloat(formData.onHand) || 0.0,
      minStockAlert: parseFloat(formData.minStockAlert) || 10.0,
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
      uomId: formData.uomId ? parseInt(formData.uomId) : null,
      locationId: formData.locationId ? parseInt(formData.locationId) : null
    };

    try {
      if (editingProduct) {
        // Call PATCH /products/:id
        try {
          const res = await productApi.update(editingProduct.id, payload);
          if (res && res.data) {
            setProducts(products.map((p) => (p.id === editingProduct.id ? res.data : p)));
          }
        } catch {
          // Local fallback
          setProducts(products.map((p) => (p.id === editingProduct.id ? { ...p, ...payload } : p)));
        }
        showToast(`Product "${payload.name}" updated successfully!`);
      } else {
        // Call POST /products
        try {
          const res = await productApi.create(payload);
          if (res && res.data) {
            setProducts([res.data, ...products]);
          }
        } catch {
          // Local fallback
          const newLocal = { id: `prod-${Date.now()}`, ...payload };
          setProducts([newLocal, ...products]);
        }
        showToast(`Product "${payload.name}" created successfully!`);
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Category & UOM Management Modal States
  const [isCatUomModalOpen, setIsCatUomModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newUomName, setNewUomName] = useState('');
  const [newUomSymbol, setNewUomSymbol] = useState('');

  // Handle Delete Product
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      try {
        await productApi.delete(productToDelete.id);
      } catch (err) {
        console.warn('API delete failed, performing local delete:', err.message);
      }
      setProducts(products.filter((p) => p.id !== productToDelete.id));
      showToast(`Product "${productToDelete.name}" deleted successfully!`);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Create Category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      let created = { id: Date.now(), name: newCatName.trim() };
      try {
        const res = await categoryApi.create({ name: newCatName.trim() });
        if (res && res.data) created = res.data;
      } catch (err) {
        console.warn('Category create fallback to local:', err.message);
      }
      setCategories([...categories, created]);
      setNewCatName('');
      showToast(`Category "${created.name}" created!`);
    } catch (err) {
      showToast(err.message || 'Failed to create category', 'error');
    }
  };

  // Handle Delete Category
  const handleDeleteCategory = async (catId, catName) => {
    try {
      try {
        await categoryApi.delete(catId);
      } catch (err) {
        console.warn('Category delete fallback to local:', err.message);
      }
      setCategories(categories.filter((c) => c.id !== catId));
      showToast(`Category "${catName}" deleted!`);
    } catch (err) {
      showToast(err.message || 'Failed to delete category', 'error');
    }
  };

  // Handle Create UOM
  const handleCreateUom = async (e) => {
    e.preventDefault();
    if (!newUomName.trim()) return;
    try {
      let created = { id: Date.now(), name: newUomName.trim(), symbol: newUomSymbol.trim() || newUomName.trim().slice(0, 3).toLowerCase() };
      try {
        const res = await uomApi.create({ name: newUomName.trim(), symbol: newUomSymbol.trim() || undefined });
        if (res && res.data) created = res.data;
      } catch (err) {
        console.warn('UOM create fallback to local:', err.message);
      }
      setUoms([...uoms, created]);
      setNewUomName('');
      setNewUomSymbol('');
      showToast(`UOM "${created.name}" created!`);
    } catch (err) {
      showToast(err.message || 'Failed to create UOM', 'error');
    }
  };

  // Handle Delete UOM
  const handleDeleteUom = async (uomId, uomName) => {
    try {
      try {
        await uomApi.delete(uomId);
      } catch (err) {
        console.warn('UOM delete fallback to local:', err.message);
      }
      setUoms(uoms.filter((u) => u.id !== uomId));
      showToast(`Unit of Measure "${uomName}" deleted!`);
    } catch (err) {
      showToast(err.message || 'Failed to delete UOM', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-24">
      <Navbar activePage="stock" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2.5 ${
              toastMessage.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <XCircle className="w-4 h-4 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Package className="w-6 h-6 text-indigo-600" />
              Master Product Catalog
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              REST API Integrated: List, Search, Filter, Create, Update, and Delete products with categories & UOMs.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={fetchAllData}
              title="Refresh from API"
              className="p-2 text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setIsCatUomModalOpen(true)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Tag className="w-3.5 h-3.5 text-indigo-600" />
              Manage Categories & UOMs
            </button>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by product name, SKU, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800"
            />
          </div>

          {/* Category Filter Pills & Low Stock Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white text-slate-700 font-medium cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setLowStockOnly(!lowStockOnly)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                lowStockOnly
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Low Stock Only
            </button>
          </div>

        </div>

        {/* Products Table (Full CRUD Master View) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 min-w-[220px]">Product Name</th>
                  <th className="py-3.5 px-4 font-mono w-32">SKU</th>
                  <th className="py-3.5 px-4 w-28 text-center">Category</th>
                  <th className="py-3.5 px-4 w-28 text-center">UOM</th>
                  <th className="py-3.5 px-4 w-32 text-right">Per Unit Cost (₹)</th>
                  <th className="py-3.5 px-4 w-28 text-right font-bold text-slate-800">On Hand</th>
                  <th className="py-3.5 px-4 w-28 text-right font-bold text-emerald-700">Free to Use</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Default Location</th>
                  <th className="py-3.5 px-4 w-28 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-slate-400">
                      <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-medium text-slate-600">No products found</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or click "Add Product".</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => {
                    const isLowStock = prod.onHand <= (prod.minStockAlert || 10);
                    const categoryName = prod.category?.name || prod.category || 'Uncategorized';
                    const uomName = prod.uom?.name || prod.unit || 'Units';
                    const locationName = prod.location?.name || prod.location || 'Central WH';

                    return (
                      <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors group">
                        {/* Name & Description */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {prod.name}
                          </div>
                          {prod.description && (
                            <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {prod.description}
                            </div>
                          )}
                        </td>

                        {/* SKU */}
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-indigo-700">
                          {prod.sku}
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                            {categoryName}
                          </span>
                        </td>

                        {/* UOM */}
                        <td className="py-3.5 px-4 text-center text-xs font-medium text-slate-600">
                          {uomName}
                        </td>

                        {/* Per Unit Cost */}
                        <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-800">
                          ₹{Number(prod.perUnitCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* On Hand */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                          {prod.onHand}{' '}
                          {isLowStock && (
                            <span className="text-rose-600 text-[10px] block font-sans font-medium">Low Stock</span>
                          )}
                        </td>

                        {/* Free to Use */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700 text-sm">
                          {prod.freeToUse || prod.onHand}
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-4 text-slate-600 text-xs">
                          <span className="bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 font-mono text-[11px] block line-clamp-1">
                            {locationName}
                          </span>
                        </td>

                        {/* Actions (Edit / Delete) */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(prod)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setProductToDelete(prod);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
            <span>Showing <strong>{filteredProducts.length}</strong> master products</span>
            <span className="font-mono text-[11px]">Integrated with PostgreSQL Prisma Backend</span>
          </div>
        </div>

      </main>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-base">
                    {editingProduct ? 'Edit Product' : 'Create New Product'}
                  </h3>
                  <p className="text-xs text-slate-500">Master product data with SKU, category, UOM, and initial stock</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. High-Performance Servo Motor 24V"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SKU / Code * (Unique)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MOT-SRV-24V"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measure (UOM)</label>
                  <select
                    value={formData.uomId}
                    onChange={(e) => setFormData({ ...formData, uomId: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="">Select UOM</option>
                    {uoms.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.symbol || u.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Per Unit Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.perUnitCost}
                    onChange={(e) => setFormData({ ...formData, perUnitCost: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Stock Alert</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="10"
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Initial On Hand Qty</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="50"
                    value={formData.onHand}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({
                        ...formData,
                        onHand: val,
                        freeToUse: formData.freeToUse || val
                      });
                    }}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Rack Location</label>
                  <select
                    value={formData.locationId}
                    onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-xs"
                  >
                    <option value="">Select Location</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows="2"
                  placeholder="Optional specifications, dimensions, technical notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                />
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
                  {editingProduct ? 'Update Product' : 'Save New Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Product?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong className="text-slate-800 font-semibold">{productToDelete.name}</strong> ({productToDelete.sku})? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setProductToDelete(null);
                }}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE CATEGORIES & UOMS MODAL */}
      {isCatUomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-base">Master Categories & Units of Measure</h3>
                  <p className="text-xs text-slate-500">Create, view, and delete categories and UOMs via REST APIs</p>
                </div>
              </div>
              <button
                onClick={() => setIsCatUomModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Categories Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Product Categories
                </h4>
                
                {/* Create Category Form */}
                <form onSubmit={handleCreateCategory} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="New category name (e.g. Robotics, Raw Materials)..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Category
                  </button>
                </form>

                {/* Categories List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between group hover:border-slate-300 transition-colors"
                    >
                      <span className="text-xs font-semibold text-slate-800">{cat.name}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* Units of Measure Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Boxes className="w-4 h-4 text-emerald-600" />
                  Units of Measure (UOM)
                </h4>

                {/* Create UOM Form */}
                <form onSubmit={handleCreateUom} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="UOM Name (e.g. Liter, Meter)..."
                    value={newUomName}
                    onChange={(e) => setNewUomName(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Symbol (e.g. L, m)..."
                    value={newUomSymbol}
                    onChange={(e) => setNewUomSymbol(e.target.value)}
                    className="w-24 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add UOM
                  </button>
                </form>

                {/* UOMs List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {uoms.map((u) => (
                    <div
                      key={u.id}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between group hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-800">{u.name}</span>
                        {u.symbol && (
                          <span className="px-1.5 py-0.5 bg-slate-200/70 text-slate-600 rounded text-[10px] font-mono">
                            {u.symbol}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteUom(u.id, u.name)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete UOM"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCatUomModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}