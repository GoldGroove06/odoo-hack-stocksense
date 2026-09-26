// API Client Service for StockSense ERP Integration

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `HTTP Error ${response.status}`);
    }
    return data;
  } catch (error) {
    console.warn(`[API Service] Request failed for ${endpoint}:`, error.message);
    throw error;
  }
}

// -----------------------------------------------------------------------------
// Product API Endpoints
// -----------------------------------------------------------------------------
export const productApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/products/${id}`),
  create: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id) => request(`/products/${id}`, { method: 'DELETE' })
};

// -----------------------------------------------------------------------------
// Category API Endpoints
// -----------------------------------------------------------------------------
export const categoryApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/categories${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/categories/${id}`),
  create: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id) => request(`/categories/${id}`, { method: 'DELETE' })
};

// -----------------------------------------------------------------------------
// Unit of Measure (UOM) API Endpoints
// -----------------------------------------------------------------------------
export const uomApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/uoms${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/uoms/${id}`),
  create: (data) => request('/uoms', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/uoms/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id) => request(`/uoms/${id}`, { method: 'DELETE' })
};

// -----------------------------------------------------------------------------
// Warehouse API Endpoints
// -----------------------------------------------------------------------------
export const warehouseApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/warehouses${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/warehouses/${id}`),
  create: (data) => request('/warehouses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/warehouses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id) => request(`/warehouses/${id}`, { method: 'DELETE' })
};

// -----------------------------------------------------------------------------
// Location API Endpoints
// -----------------------------------------------------------------------------
export const locationApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/locations${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/locations/${id}`),
  create: (data) => request('/locations', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/locations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id) => request(`/locations/${id}`, { method: 'DELETE' })
};

// -----------------------------------------------------------------------------
// Supplier & Customer API Endpoints
// -----------------------------------------------------------------------------
export const supplierApi = {
  getAll: () => request('/suppliers'),
  create: (data) => request('/suppliers', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => request(`/suppliers/${id}`, { method: 'DELETE' })
};

export const customerApi = {
  getAll: () => request('/customers'),
  create: (data) => request('/customers', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => request(`/customers/${id}`, { method: 'DELETE' })
};

// -----------------------------------------------------------------------------
// Receipts API Endpoints (4. Inventory Operations)
// -----------------------------------------------------------------------------
export const receiptApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/receipts${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/receipts/${id}`),
  create: (data) => request('/receipts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/receipts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id) => request(`/receipts/${id}`, { method: 'DELETE' }),
  validate: (id) => request(`/receipts/${id}/validate`, { method: 'POST' })
};

// -----------------------------------------------------------------------------
// Deliveries API Endpoints (4. Inventory Operations)
// -----------------------------------------------------------------------------
export const deliveryApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/deliveries${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/deliveries/${id}`),
  create: (data) => request('/deliveries', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/deliveries/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id) => request(`/deliveries/${id}`, { method: 'DELETE' }),
  pick: (id) => request(`/deliveries/${id}/pick`, { method: 'POST' }),
  pack: (id) => request(`/deliveries/${id}/pack`, { method: 'POST' }),
  validate: (id) => request(`/deliveries/${id}/validate`, { method: 'POST' })
};

// -----------------------------------------------------------------------------
// Transfers API Endpoints (4. Inventory Operations)
// -----------------------------------------------------------------------------
export const transferApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/transfers${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/transfers/${id}`),
  create: (data) => request('/transfers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/transfers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id) => request(`/transfers/${id}`, { method: 'DELETE' }),
  validate: (id) => request(`/transfers/${id}/validate`, { method: 'POST' })
};

// -----------------------------------------------------------------------------
// Adjustments API Endpoints (4. Inventory Operations)
// -----------------------------------------------------------------------------
export const adjustmentApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/adjustments${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/adjustments/${id}`),
  create: (data) => request('/adjustments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/adjustments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id) => request(`/adjustments/${id}`, { method: 'DELETE' }),
  validate: (id) => request(`/adjustments/${id}/validate`, { method: 'POST' })
};

// -----------------------------------------------------------------------------
// Movements API Endpoints
// -----------------------------------------------------------------------------
export const movementApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/movements${query ? `?${query}` : ''}`);
  },
  create: (data) => request('/movements', { method: 'POST', body: JSON.stringify(data) })
};

// -----------------------------------------------------------------------------
// Dashboard Statistics API Endpoint
// -----------------------------------------------------------------------------
export const dashboardApi = {
  getStats: () => request('/dashboard/stats')
};

export default {
  product: productApi,
  category: categoryApi,
  uom: uomApi,
  warehouse: warehouseApi,
  location: locationApi,
  supplier: supplierApi,
  customer: customerApi,
  receipt: receiptApi,
  delivery: deliveryApi,
  transfer: transferApi,
  adjustment: adjustmentApi,
  movement: movementApi,
  dashboard: dashboardApi
};
