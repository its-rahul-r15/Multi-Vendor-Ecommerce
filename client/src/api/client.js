const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Currency / Paise formatter helper
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPaise = (paise) => {
  if (paise === undefined || paise === null || isNaN(paise)) return '₹0';
  return formatCurrency(paise / 100);
};

// Unified request dispatcher connecting directly to Express backend
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await res.json().catch(() => ({}));

    if (res.ok && json.success !== false) {
      return {
        success: true,
        data: json.data !== undefined ? json.data : json,
        pagination: json.pagination,
        message: json.message,
      };
    }

    return {
      success: false,
      error: json.error || json.message || `Request failed with status ${res.status}`,
      code: json.code,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Cannot connect to backend server. Make sure backend is running on http://localhost:8000',
    };
  }
}

export const api = {
  // ── Authentication ──────────────────────────────────────────────────────────
  auth: {
    login: async (email, password) => {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.success && res.data) {
        const token = res.data.accessToken || res.data.token;
        const user = res.data.user || res.data;
        if (token) localStorage.setItem('token', token);
        if (user) localStorage.setItem('user', JSON.stringify(user));
      }
      return res;
    },

    register: async (userData) => {
      const res = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      if (res.success && res.data) {
        const token = res.data.accessToken || res.data.token;
        const user = res.data.user || res.data;
        if (token) localStorage.setItem('token', token);
        if (user) localStorage.setItem('user', JSON.stringify(user));
      }
      return res;
    },

    getProfile: async () => {
      return await request('/auth/me');
    },

    logout: async () => {
      const res = await request('/auth/logout', { method: 'POST' }).catch(() => ({}));
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return res;
    },

    getAddresses: async () => {
      const res = await request('/auth/addresses');
      if (res.success && res.data?.addresses) {
        return { success: true, data: res.data.addresses };
      }
      return res;
    },

    addAddress: async (addressData) => {
      return await request('/auth/addresses', {
        method: 'POST',
        body: JSON.stringify(addressData),
      });
    },

    deleteAddress: async (index) => {
      return await request(`/auth/addresses/${index}`, {
        method: 'DELETE',
      });
    },

    setDefaultAddress: async (index) => {
      return await request(`/auth/addresses/${index}/default`, {
        method: 'PATCH',
      });
    },
  },

  // ── Products ────────────────────────────────────────────────────────────────
  products: {
    getAll: async (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      const res = await request(`/products${qs ? `?${qs}` : ''}`);
      if (res.success) {
        // Backend returns products in data directly or data.products
        const list = Array.isArray(res.data) ? res.data : res.data?.products || [];
        return { success: true, data: list, pagination: res.pagination };
      }
      return res;
    },

    getFeatured: async () => {
      const res = await request('/products/featured');
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : res.data?.products || [];
        return { success: true, data: list };
      }
      return res;
    },

    getById: async (id) => {
      const res = await request(`/products/${id}`);
      if (res.success) {
        const product = res.data?.product || res.data;
        return { success: true, data: product };
      }
      return res;
    },

    getShopProducts: async (shopId) => {
      return await request(`/products/shop/${shopId}`);
    },

    getMyProducts: async () => {
      const res = await request('/products/seller/my-products');
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : res.data?.products || [];
        return { success: true, data: list };
      }
      return res;
    },

    create: async (productData) => {
      return await request('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });
    },

    update: async (id, updateData) => {
      return await request(`/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });
    },

    delete: async (id) => {
      return await request(`/products/${id}`, { method: 'DELETE' });
    },

    toggleBan: async (id) => {
      return await request(`/products/admin/${id}/ban`, { method: 'PATCH' });
    },

    toggleFeatured: async (id) => {
      return await request(`/products/admin/${id}/featured`, { method: 'PATCH' });
    },
  },

  // ── Shops & Vendors ─────────────────────────────────────────────────────────
  shops: {
    getAll: async (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      const res = await request(`/shops${qs ? `?${qs}` : ''}`);
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : res.data?.shops || [];
        return { success: true, data: list };
      }
      return res;
    },

    getById: async (id) => {
      const res = await request(`/shops/${id}`);
      if (res.success) {
        const shop = res.data?.shop || res.data;
        return { success: true, data: shop };
      }
      return res;
    },

    getMyShop: async () => {
      const res = await request('/shops/seller/my-shop');
      if (res.success) {
        const shop = res.data?.shop || res.data;
        return { success: true, data: shop };
      }
      return res;
    },

    create: async (shopData) => {
      return await request('/shops', {
        method: 'POST',
        body: JSON.stringify(shopData),
      });
    },

    updateMyShop: async (shopId, updateData) => {
      return await request(`/shops/${shopId}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });
    },

    approveShop: async (shopId) => {
      return await request(`/shops/admin/${shopId}/approve`, { method: 'PATCH' });
    },

    rejectShop: async (shopId) => {
      return await request(`/shops/admin/${shopId}/reject`, { method: 'PATCH' });
    },

    toggleBlock: async (shopId) => {
      return await request(`/shops/admin/${shopId}/block`, { method: 'PATCH' });
    },
  },

  // ── Cart ────────────────────────────────────────────────────────────────────
  cart: {
    get: async () => {
      const res = await request('/cart');
      if (res.success) {
        const cart = res.data?.cart || res.data;
        return { success: true, data: cart };
      }
      return res;
    },

    addItem: async (productId, quantity = 1) => {
      return await request('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      });
    },

    updateItem: async (productId, quantity) => {
      return await request(`/cart/items/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
      });
    },

    removeItem: async (productId) => {
      return await request(`/cart/items/${productId}`, {
        method: 'DELETE',
      });
    },

    clear: async () => {
      return await request('/cart', {
        method: 'DELETE',
      });
    },
  },

  // ── Orders ──────────────────────────────────────────────────────────────────
  orders: {
    create: async (orderPayload) => {
      return await request('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
      });
    },

    getMyOrders: async () => {
      const res = await request('/orders/customer/my-orders');
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : res.data?.orders || [];
        return { success: true, data: list };
      }
      return res;
    },

    getShopOrders: async () => {
      const res = await request('/orders/seller/shop-orders');
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : res.data?.orders || [];
        return { success: true, data: list };
      }
      return res;
    },

    getAllAdminOrders: async () => {
      const res = await request('/orders/admin/all');
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : res.data?.orders || [];
        return { success: true, data: list };
      }
      return res;
    },

    getById: async (id) => {
      return await request(`/orders/${id}`);
    },

    updateStatus: async (orderId, statusData) => {
      return await request(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify(statusData),
      });
    },

    cancel: async (orderId) => {
      return await request(`/orders/${orderId}/cancel`, {
        method: 'PATCH',
      });
    },
  },

  // ── Payments ────────────────────────────────────────────────────────────────
  payments: {
    createOrder: async (orderId) => {
      return await request('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ orderId }),
      });
    },

    verify: async (verifyData) => {
      return await request('/payments/verify', {
        method: 'POST',
        body: JSON.stringify(verifyData),
      });
    },

    getDetails: async (paymentId) => {
      return await request(`/payments/${paymentId}`);
    },
  },

  // ── Categories & Specials ───────────────────────────────────────────────────
  categories: {
    getAll: async () => {
      const res = await request('/categories');
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : res.data?.categories || [];
        return { success: true, data: list };
      }
      return res;
    },
  },

  shoppableVideos: {
    getAll: async () => {
      const res = await request('/shoppable-videos');
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : res.data?.videos || [];
        return { success: true, data: list };
      }
      return res;
    },
  },

  reviews: {
    getByProduct: async (productId) => {
      const res = await request(`/reviews/${productId}`);
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : res.data?.reviews || [];
        return { success: true, data: list };
      }
      return res;
    },

    create: async (productId, reviewData) => {
      return await request(`/reviews/${productId}`, {
        method: 'POST',
        body: JSON.stringify(reviewData),
      });
    },
  },

  coupons: {
    getActive: async () => {
      const res = await request('/coupons/active');
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : res.data?.coupons || [];
        return { success: true, data: list };
      }
      return res;
    },

    validate: async (code, amount, shopId) => {
      return await request('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, amount, shopId }),
      });
    },
  },

  tailoring: {
    submit: async (data) => {
      return await request('/tailoring', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getMyRequests: async () => {
      const res = await request('/tailoring/my');
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : res.data?.requests || [];
        return { success: true, data: list };
      }
      return res;
    },

    getShopRequests: async () => {
      const res = await request('/tailoring/shop');
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : res.data?.requests || [];
        return { success: true, data: list };
      }
      return res;
    },

    updateStatus: async (id, status) => {
      return await request(`/tailoring/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
  },

  // ── Admin ───────────────────────────────────────────────────────────────────
  admin: {
    getStats: async () => {
      return await request('/admin/stats');
    },

    getLedger: async () => {
      return await request('/admin/ledger');
    },

    getUsers: async () => {
      return await request('/admin/users');
    },

    toggleUserBlock: async (id) => {
      return await request(`/admin/users/${id}/block`, { method: 'PATCH' });
    },

    runPayout: async (shopId) => {
      return await request(`/admin/shops/${shopId}/payout`, { method: 'POST' });
    },

    refundOrder: async (orderId) => {
      return await request(`/admin/orders/${orderId}/refund`, { method: 'POST' });
    },
  },
};

export default api;
