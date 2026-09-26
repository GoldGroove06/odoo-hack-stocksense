// API Client Service for Backend Integration

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
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
  // GET /products
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },
  // GET /products/:id
  getById: (id) => request(`/products/${id}`),
  // POST /products
  create: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  // PATCH /products/:id
  update: (id, data) => request(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  // DELETE /products/:id
  delete: (id) => request(`/products/${id}`, { method: 'DELETE' })
};

// -----------------------------------------------------------------------------
// Category API Endpoints
// -----------------------------------------------------------------------------
export const categoryApi = {
  // GET /categories
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/categories${query ? `?${query}` : ''}`);
  },
  // GET /categories/:id
  getById: (id) => request(`/categories/${id}`),
  // POST /categories
  create: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  // PATCH /categories/:id
  update: (id, data) => request(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  // DELETE /categories/:id
  delete: (id) => request(`/categories/${id}`, { method: 'DELETE' })
};

// -----------------------------------------------------------------------------
// Unit of Measure (UOM) API Endpoints
// -----------------------------------------------------------------------------
export const uomApi = {
  // GET /uoms
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/uoms${query ? `?${query}` : ''}`);
  },
  // GET /uoms/:id
  getById: (id) => request(`/uoms/${id}`),
  // POST /uoms
  create: (data) => request('/uoms', { method: 'POST', body: JSON.stringify(data) }),
  // PATCH /uoms/:id
  update: (id, data) => request(`/uoms/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  // DELETE /uoms/:id
  delete: (id) => request(`/uoms/${id}`, { method: 'DELETE' })
};

// -----------------------------------------------------------------------------
// Warehouse API Endpoints
// -----------------------------------------------------------------------------
export const warehouseApi = {
  // GET /warehouses
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/warehouses${query ? `?${query}` : ''}`);
  },
  // GET /warehouses/:id
  getById: (id) => request(`/warehouses/${id}`),
  // POST /warehouses
  create: (data) => request('/warehouses', { method: 'POST', body: JSON.stringify(data) }),
  // PATCH /warehouses/:id
  update: (id, data) => request(`/warehouses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  // DELETE /warehouses/:id
  delete: (id) => request(`/warehouses/${id}`, { method: 'DELETE' })
};

// -----------------------------------------------------------------------------
// Location API Endpoints
// -----------------------------------------------------------------------------
export const locationApi = {
  // GET /locations
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/locations${query ? `?${query}` : ''}`);
  },
  // GET /locations/:id
  getById: (id) => request(`/locations/${id}`),
  // POST /locations
  create: (data) => request('/locations', { method: 'POST', body: JSON.stringify(data) }),
  // PATCH /locations/:id
  update: (id, data) => request(`/locations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  // DELETE /locations/:id
  delete: (id) => request(`/locations/${id}`, { method: 'DELETE' })
};

export default {
  product: productApi,
  category: categoryApi,
  uom: uomApi,
  warehouse: warehouseApi,
  location: locationApi
};
