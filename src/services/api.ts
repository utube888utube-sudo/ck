import { Product, Order, CustomerUser, OrderStatus, DeliveryAddress, PaymentMethod, StoreSettings } from '../types.ts';

const TOKEN_KEY = 'cks_auth_token';
const USER_KEY = 'cks_user_data';

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getStoredUser(): { user: CustomerUser | null; isAdmin: boolean } {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return { user: null, isAdmin: false };
  },

  setStoredUser(user: CustomerUser, isAdmin: boolean) {
    localStorage.setItem(USER_KEY, JSON.stringify({ user, isAdmin }));
  },

  async request(path: string, options: RequestInit = {}) {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(path, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Request failed. Please try again.');
    }
    return data;
  },

  // Auth
  async sendOtp(mobile: string) {
    return this.request('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile }),
    });
  },

  async verifyOtp(mobile: string, code: string, name?: string) {
    const data = await this.request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile, code, name }),
    });
    if (data.token) {
      this.setToken(data.token);
      this.setStoredUser(data.user, data.isAdmin);
    }
    return data;
  },

  async getMe() {
    return this.request('/api/auth/me');
  },

  async saveAddress(address: DeliveryAddress) {
    return this.request('/api/auth/address', {
      method: 'POST',
      body: JSON.stringify(address),
    });
  },

  // Products
  async getProducts(): Promise<{ products: Product[]; total: number }> {
    return this.request('/api/products');
  },

  async getProduct(id: string): Promise<Product> {
    return this.request(`/api/products/${id}`);
  },

  async adminGetProducts(): Promise<{ products: Product[]; total: number }> {
    return this.request('/api/admin/products');
  },

  // Admin Product CRUD (Secured: 7975614686 only)
  async adminAddProduct(product: Partial<Product>) {
    return this.request('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  async adminUpdateProduct(id: string, updates: Partial<Product>) {
    return this.request(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async adminDeleteProduct(id: string) {
    return this.request(`/api/admin/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Orders
  async createOrder(payload: {
    items: { productId: string; quantity: number }[];
    deliveryAddress: DeliveryAddress;
    paymentMethod: PaymentMethod;
    phonePeTransactionId?: string;
  }): Promise<{ success: boolean; message: string; order: Order }> {
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getOrders(): Promise<{ orders: Order[] }> {
    return this.request('/api/orders');
  },

  async submitPhonePeUtr(orderId: string, utr: string) {
    return this.request(`/api/orders/${orderId}/phonepe-utr`, {
      method: 'PUT',
      body: JSON.stringify({ utr }),
    });
  },

  // Admin Orders (Secured: 7975614686 only)
  async adminGetOrders(): Promise<{ orders: Order[]; total: number }> {
    return this.request('/api/admin/orders');
  },

  async adminUpdateOrderStatus(orderId: string, status: OrderStatus, note?: string) {
    return this.request(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, note }),
    });
  },

  async adminVerifyPayment(orderId: string) {
    return this.request(`/api/admin/orders/${orderId}/verify-payment`, {
      method: 'PUT',
    });
  },

  // Store Configuration & Settings
  async getSettings(): Promise<{ success: boolean; settings: StoreSettings }> {
    return this.request('/api/settings');
  },

  async adminUpdateSettings(updates: Partial<StoreSettings>): Promise<{ success: boolean; settings: StoreSettings }> {
    return this.request('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};
