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
};
