import api from "../api/axios.js";

async function request(endpoint, options = {}) {
  const method = (options.method || "GET").toLowerCase();
  const config = {
    url: endpoint,
    method,
    params: options.params,
    data: options.body !== undefined ? options.body : options.data,
  };

  try {
    const response = await api.request(config);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || `HTTP Error ${error.response?.status}`;
    console.warn(`[API Service] Request failed for ${endpoint}:`, message);
    throw new Error(message);
  }
}

export const productApi = {
  getAll: (params = {}) => request("/products", { params }),
  getById: (id) => request(`/products/${id}`),
  create: (data) => request("/products", { method: "POST", body: data }),
  update: (id, data) => request(`/products/${id}`, { method: "PATCH", body: data }),
  delete: (id) => request(`/products/${id}`, { method: "DELETE" }),
};

export const categoryApi = {
  getAll: (params = {}) => request("/categories", { params }),
  getById: (id) => request(`/categories/${id}`),
  create: (data) => request("/categories", { method: "POST", body: data }),
  update: (id, data) => request(`/categories/${id}`, { method: "PATCH", body: data }),
  delete: (id) => request(`/categories/${id}`, { method: "DELETE" }),
};

export const uomApi = {
  getAll: (params = {}) => request("/uoms", { params }),
  getById: (id) => request(`/uoms/${id}`),
  create: (data) => request("/uoms", { method: "POST", body: data }),
  update: (id, data) => request(`/uoms/${id}`, { method: "PATCH", body: data }),
  delete: (id) => request(`/uoms/${id}`, { method: "DELETE" }),
};

export const warehouseApi = {
  getAll: (params = {}) => request("/warehouses", { params }),
  getById: (id) => request(`/warehouses/${id}`),
  create: (data) => request("/warehouses", { method: "POST", body: data }),
  update: (id, data) => request(`/warehouses/${id}`, { method: "PATCH", body: data }),
  delete: (id) => request(`/warehouses/${id}`, { method: "DELETE" }),
};

export const locationApi = {
  getAll: (params = {}) => request("/locations", { params }),
  getById: (id) => request(`/locations/${id}`),
  create: (data) => request("/locations", { method: "POST", body: data }),
  update: (id, data) => request(`/locations/${id}`, { method: "PATCH", body: data }),
  delete: (id) => request(`/locations/${id}`, { method: "DELETE" }),
};

export const supplierApi = {
  getAll: () => request("/suppliers"),
  create: (data) => request("/suppliers", { method: "POST", body: data }),
  delete: (id) => request(`/suppliers/${id}`, { method: "DELETE" }),
};

export const customerApi = {
  getAll: () => request("/customers"),
  create: (data) => request("/customers", { method: "POST", body: data }),
  delete: (id) => request(`/customers/${id}`, { method: "DELETE" }),
};

export const receiptApi = {
  getAll: (params = {}) => request("/receipts", { params }),
  getById: (id) => request(`/receipts/${id}`),
  create: (data) => request("/receipts", { method: "POST", body: data }),
  update: (id, data) => request(`/receipts/${id}`, { method: "PATCH", body: data }),
  delete: (id) => request(`/receipts/${id}`, { method: "DELETE" }),
  validate: (id) => request(`/receipts/${id}/validate`, { method: "POST" }),
};

export const deliveryApi = {
  getAll: (params = {}) => request("/deliveries", { params }),
  getById: (id) => request(`/deliveries/${id}`),
  create: (data) => request("/deliveries", { method: "POST", body: data }),
  update: (id, data) => request(`/deliveries/${id}`, { method: "PATCH", body: data }),
  delete: (id) => request(`/deliveries/${id}`, { method: "DELETE" }),
  pick: (id) => request(`/deliveries/${id}/pick`, { method: "POST" }),
  pack: (id) => request(`/deliveries/${id}/pack`, { method: "POST" }),
  validate: (id) => request(`/deliveries/${id}/validate`, { method: "POST" }),
};

export const transferApi = {
  getAll: (params = {}) => request("/transfers", { params }),
  getById: (id) => request(`/transfers/${id}`),
  create: (data) => request("/transfers", { method: "POST", body: data }),
  update: (id, data) => request(`/transfers/${id}`, { method: "PATCH", body: data }),
  delete: (id) => request(`/transfers/${id}`, { method: "DELETE" }),
  pick: (id) => request(`/transfers/${id}/pick`, { method: "POST" }),
  drop: (id) => request(`/transfers/${id}/drop`, { method: "POST" }),
  validate: (id) => request(`/transfers/${id}/validate`, { method: "POST" }),
};

export const adjustmentApi = {
  getAll: (params = {}) => request("/adjustments", { params }),
  getById: (id) => request(`/adjustments/${id}`),
  create: (data) => request("/adjustments", { method: "POST", body: data }),
  update: (id, data) => request(`/adjustments/${id}`, { method: "PATCH", body: data }),
  delete: (id) => request(`/adjustments/${id}`, { method: "DELETE" }),
  validate: (id) => request(`/adjustments/${id}/validate`, { method: "POST" }),
};

export const movementApi = {
  getAll: (params = {}) => request("/movements", { params }),
  create: (data) => request("/movements", { method: "POST", body: data }),
};

export const dashboardApi = {
  getStats: () => request("/dashboard/stats"),
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
  dashboard: dashboardApi,
};
