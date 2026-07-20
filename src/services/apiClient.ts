import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('homeseva.token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const apiClient = {
  // 1. Auth APIs
  async login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  async register(name: string, email: string, password: string, role = 'customer') {
    const res = await api.post('/auth/register', { name, email, password, role });
    return res.data;
  },

  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // 2. Users CRUD
  async getUsers() {
    const res = await api.get('/users');
    return res.data;
  },

  async addUser(userData: any) {
    const res = await api.post('/users', userData);
    return res.data;
  },

  async updateUser(id: string, userData: any) {
    const res = await api.put(`/users/${id}`, userData);
    return res.data;
  },

  async updateUserStatus(id: string, status: 'active' | 'suspended') {
    const res = await api.put(`/users/${id}/status`, { status });
    return res.data;
  },

  async deleteUser(id: string) {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },

  // 3. Services CRUD
  async getServices() {
    const res = await api.get('/services');
    return res.data;
  },

  async addService(serviceData: {
    name: string;
    categoryName: string;
    description: string;
    longDescription?: string;
    price: number;
    duration?: string;
    image?: string;
    features?: string[];
  }) {
    const res = await api.post('/services', serviceData);
    return res.data;
  },

  async updateService(id: string, serviceData: any) {
    const res = await api.put(`/services/${id}`, serviceData);
    return res.data;
  },

  async deleteService(id: string) {
    const res = await api.delete(`/services/${id}`);
    return res.data;
  },

  async duplicateService(id: string) {
    const res = await api.post(`/services/${id}/duplicate`);
    return res.data;
  },

  // 4. Bookings APIs
  async getBookings(params: { userId?: string; role?: string; name?: string }) {
    const res = await api.get('/bookings', { params });
    return res.data;
  },

  async createBooking(bookingData: {
    serviceId: string;
    serviceName?: string;
    serviceImage?: string;
    price: number;
    date: string;
    timeSlot: string;
    address: string;
    paymentMethod: string;
    userId: string;
    utr?: string;
  }) {
    const res = await api.post('/bookings', bookingData);
    return res.data;
  },

  async simulateReceivePayment(utr: string, amount: number) {
    const res = await api.post('/payments/simulate-receive', { utr, amount });
    return res.data;
  },

  async verifyUtr(utr: string, amount: number) {
    const res = await api.post('/payments/verify-utr', { utr, amount });
    return res.data;
  },

  async verifyBookingPayment(id: string, utr?: string) {
    const res = await api.post(`/bookings/${id}/verify-payment`, { utr });
    return res.data;
  },

  async rejectBookingPayment(id: string) {
    const res = await api.post(`/bookings/${id}/reject-payment`);
    return res.data;
  },

  async updateBookingStatus(id: string, status: string, note?: string) {
    const res = await api.put(`/bookings/${id}/status`, { status, note });
    return res.data;
  },

  async assignBookingHelper(id: string, professionalName: string) {
    const res = await api.put(`/bookings/${id}/assign`, { professionalName });
    return res.data;
  },

  async addBookingNote(id: string, note: string) {
    const res = await api.post(`/bookings/${id}/notes`, { note });
    return res.data;
  },

  // 5. Orders & Payments
  async getOrders() {
    const res = await api.get('/orders');
    return res.data;
  },

  async updateOrderStatus(id: string, status: 'paid' | 'refunded' | 'cancelled') {
    const res = await api.put(`/orders/${id}/status`, { status });
    return res.data;
  },

  // 6. Support Inbox
  async getMessages() {
    const res = await api.get('/messages');
    return res.data;
  },

  async replyToMessage(id: string, replyText: string) {
    const res = await api.post(`/messages/${id}/reply`, { replyText });
    return res.data;
  },

  async archiveMessage(id: string) {
    const res = await api.put(`/messages/${id}/archive`);
    return res.data;
  },

  async deleteMessage(id: string) {
    const res = await api.delete(`/messages/${id}`);
    return res.data;
  },

  // 7. Reviews
  async getReviews() {
    const res = await api.get('/reviews');
    return res.data;
  },

  async updateReviewStatus(id: string, status: 'approved' | 'rejected') {
    const res = await api.put(`/reviews/${id}/status`, { status });
    return res.data;
  },

  async deleteReview(id: string) {
    const res = await api.delete(`/reviews/${id}`);
    return res.data;
  },

  // 8. Settings & Logs
  async getSettings() {
    const res = await api.get('/settings');
    return res.data;
  },

  async updateSettings(settingsData: any) {
    const res = await api.put('/settings', settingsData);
    return res.data;
  },

  async getLogs() {
    const res = await api.get('/logs');
    return res.data;
  },

  // Categories & Coupons
  async getCategories() {
    const res = await api.get('/categories');
    return res.data;
  },

  async getCoupons() {
    const res = await api.get('/coupons');
    return res.data;
  },

  // Favorites
  async getFavorites() {
    const res = await api.get('/favorites');
    return res.data;
  },

  async addFavorite(item_id: string, item_type: 'service' | 'store_product') {
    const res = await api.post('/favorites', { item_id, item_type });
    return res.data;
  },

  async removeFavorite(itemId: string, itemType: string) {
    const res = await api.delete(`/favorites/${itemId}/${itemType}`);
    return res.data;
  },

  // 9. Vehicles CRUD
  async getVehicles() {
    const res = await api.get('/vehicles');
    return res.data;
  },

  async addVehicle(vehicleData: any) {
    const res = await api.post('/vehicles', vehicleData);
    return res.data;
  },

  async updateVehicle(id: string, vehicleData: any) {
    const res = await api.put(`/vehicles/${id}`, vehicleData);
    return res.data;
  },

  async deleteVehicle(id: string) {
    const res = await api.delete(`/vehicles/${id}`);
    return res.data;
  },

  async manageTaxiBooking(id: string, data: {
    driverName: string;
    driverPhone: string;
    licensePlate: string;
    status: string;
    timelineNote: string;
  }) {
    const res = await api.put(`/bookings/${id}/manage-taxi`, data);
    return res.data;
  },

  // 10. Store Products
  async getStoreProducts(params?: { category?: string; search?: string }) {
    const res = await api.get('/store/products', { params });
    return res.data;
  },

  async getAdminStoreProducts(params?: { search?: string }) {
    const res = await api.get('/admin/store/products', { params });
    return res.data;
  },

  async addStoreProduct(data: {
    name: string;
    category: string;
    description?: string;
    price: number;
    stock?: number;
    image?: string;
    is_active?: boolean;
    is_featured?: boolean;
    is_popular?: boolean;
  }) {
    const res = await api.post('/store/products', data);
    return res.data;
  },

  async updateStoreProduct(id: string, data: any) {
    const res = await api.put(`/store/products/${id}`, data);
    return res.data;
  },

  async deleteStoreProduct(id: string) {
    const res = await api.delete(`/store/products/${id}`);
    return res.data;
  },

  // 11. Store Addresses
  async getStoreAddresses() {
    const res = await api.get('/store/addresses');
    return res.data;
  },
  async addStoreAddress(data: { label?: string; name?: string; phone?: string; address: string; landmark?: string; city: string; state?: string; pincode: string; is_default?: boolean }) {
    const res = await api.post('/store/addresses', data);
    return res.data;
  },
  async updateStoreAddress(id: string, data: any) {
    const res = await api.put(`/store/addresses/${id}`, data);
    return res.data;
  },
  async deleteStoreAddress(id: string) {
    const res = await api.delete(`/store/addresses/${id}`);
    return res.data;
  },
  async getAddress(id: string) {
    const res = await api.get(`/user/addresses/${id}`);
    return res.data;
  },

  // 12. Store Orders & Payments
  async createStoreCheckoutSession(data: {
    items: any[]; address: any; subtotal: number; delivery_fee: number;
    platform_fee: number; gst: number; coupon?: string; discount?: number;
    total: number; payment_method: string; notes?: string;
    preferred_date?: string; preferred_time?: string;
  }) {
    const res = await api.post('/store/checkout', data);
    return res.data;
  },
  async verifyStorePaymentGateway(data: { sessionId: string; utr_number: string; screenshot_url?: string }) {
    const res = await api.post('/store/payment/verify', data);
    return res.data;
  },
  async placeStoreOrder(data: {
    items: any[]; address: any; subtotal: number; delivery_fee: number;
    platform_fee: number; gst: number; coupon?: string; discount?: number;
    total: number; payment_method: string; notes?: string;
    preferred_date?: string; preferred_time?: string;
    utr_number?: string; screenshot_url?: string;
  }) {
    const res = await api.post('/store/orders', data);
    return res.data;
  },
  async getMyStoreOrders() {
    const res = await api.get('/store/orders/my');
    return res.data;
  },
  async getStoreOrder(id: string) {
    const res = await api.get(`/store/orders/${id}`);
    return res.data;
  },
  async cancelStoreOrder(id: string) {
    const res = await api.put(`/store/orders/${id}/cancel`);
    return res.data;
  },
  async submitStorePayment(orderId: string, data: { utr_number: string; screenshot_url?: string }) {
    const res = await api.post(`/store/orders/${orderId}/payment`, data);
    return res.data;
  },
  async uploadStoreScreenshot(orderId: string, file: File) {
    const formData = new FormData();
    formData.append('screenshot', file);
    const res = await api.post(`/store/orders/${orderId}/screenshot`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // 13. Admin Store Orders
  async getAdminStoreOrders(params?: { status?: string; payment_status?: string; search?: string }) {
    const res = await api.get('/admin/store/orders', { params });
    return res.data;
  },
  async verifyStorePayment(orderId: string, data: { action: 'approve' | 'reject' | 'reupload'; rejection_reason?: string }) {
    const res = await api.put(`/admin/store/orders/${orderId}/verify`, data);
    return res.data;
  },
  async updateStoreTracking(orderId: string, data: { tracking_stage: string; order_status?: string }) {
    const res = await api.put(`/admin/store/orders/${orderId}/tracking`, data);
    return res.data;
  },
  async assignStoreWorker(orderId: string, data: { worker_name: string; worker_phone: string }) {
    const res = await api.put(`/admin/store/orders/${orderId}/assign`, data);
    return res.data;
  },

  // 14. Store Settings
  async getStoreSettings() {
    const res = await api.get('/store/settings');
    return res.data;
  },
  async updateStoreSettings(data: { delivery_fee: number; platform_fee: number; delivery_threshold: number }) {
    const res = await api.put('/admin/store/settings', data);
    return res.data;
  },

  // 15. Simulation
  async simulatePayment(utr: string, amount: number) {
    const res = await api.post('/payments/simulate-receive', { utr, amount });
    return res.data;
  }
};


