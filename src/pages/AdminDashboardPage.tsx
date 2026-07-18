import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Calendar, DollarSign, Star,
  Wrench, Search, Download, ChevronLeft,
  Plus, Edit, Trash2, Check, XCircle, Inbox, Settings, FileText,
  ShieldAlert, Activity, RefreshCw, Send, Database, Menu, X, Clock
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../services/apiClient';
import {
  services as mockServices,
  userBookings as mockBookings,
  reviews as mockReviews
} from '../data/sampleData';

const mockUsers = [
  { id: 'usr1', name: 'Vikram Singh', email: 'vikram@example.com', role: 'customer', status: 'active', created_at: new Date().toISOString() },
  { id: 'usr2', name: 'Rajesh Kumar', email: 'rajesh@example.com', role: 'professional', status: 'active', created_at: new Date().toISOString() },
  { id: 'usr3', name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active', created_at: new Date().toISOString() },
  { id: 'usr4', name: 'Amit Patel', email: 'amit@example.com', role: 'staff', status: 'active', created_at: new Date().toISOString() },
  { id: 'usr5', name: 'Sunita Reddy', email: 'sunita@example.com', role: 'manager', status: 'active', created_at: new Date().toISOString() }
];

const mockOrders = [
  { id: 'ord_1', booking_id: 'b1', customer_name: 'Vikram Singh', service_name: 'Wedding Catering', amount: 49999, status: 'paid', payment_method: 'upi', date: new Date().toISOString() },
  { id: 'ord_2', booking_id: 'b2', customer_name: 'Vikram Singh', service_name: 'Full Home Cleaning', amount: 2499, status: 'paid', payment_method: 'card', date: new Date().toISOString() }
];

const mockMessages = [
  { id: 'msg_1', name: 'Karan Malhotra', email: 'karan@example.com', subject: 'Catering Quote', message: 'Hi, I would like to get a quote for a birthday party catering for 50 people.', status: 'unread', date: new Date().toISOString() },
  { id: 'msg_2', name: 'Pooja Nair', email: 'pooja@example.com', subject: 'Plumbing service warranty query', message: 'Hi, I booked a pipe leak repair last week. Is there a service warranty?', status: 'archived', date: new Date().toISOString() }
];

const mockLogs = [
  { id: 'log_1', user_id: 'usr3', user_name: 'Admin User', action: 'Admin Login', details: 'Admin logged in from IP 192.168.1.1', timestamp: new Date().toISOString() },
  { id: 'log_2', user_id: 'usr1', user_name: 'Vikram Singh', action: 'Create Booking', details: 'Created booking #b1 for Wedding Catering', timestamp: new Date().toISOString() }
];

const mockSettings = {
  appName: 'HomeSeva Pro',
  contactEmail: 'support@homeseva.com',
  contactPhone: '+91 98765 43210',
  address: '221B, Hill Road, Bandra West, Mumbai, India',
  currency: 'INR'
};

type AdminTab = 'overview' | 'users' | 'services' | 'bookings' | 'orders' | 'messages' | 'reviews' | 'reports' | 'settings';

export function AdminDashboardPage() {
  const { toast } = useToast();
  const navigate = useNavigate();

  // App States
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Database Records
  const [usersList, setUsersList] = useState<any[]>([]);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [messagesList, setMessagesList] = useState<any[]>([]);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [appSettings, setAppSettings] = useState<any>({});

  // Filter States
  const [searchUser, setSearchUser] = useState('');
  const [filterUserRole, setFilterUserRole] = useState('all');
  const [searchService, setSearchService] = useState('');
  const [filterServiceCat, setFilterServiceCat] = useState('all');
  const [searchBooking, setSearchBooking] = useState('');
  const [filterBookingStatus, setFilterBookingStatus] = useState('all');

  // Modals & Forms
  const [userModal, setUserModal] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: any }>({ open: false, mode: 'add' });
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  
  const [serviceModal, setServiceModal] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: any }>({ open: false, mode: 'add' });
  const [serviceForm, setServiceForm] = useState({ name: '', categoryName: 'Electrical', price: '', description: '', duration: '60 min', featuresText: '', image: '', longDescription: '', popular: false });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageDragOver, setImageDragOver] = useState(false);

  const [replyModal, setReplyModal] = useState<{ open: boolean; messageId?: string; customerEmail?: string }>({ open: false });
  const [replyText, setReplyText] = useState('');

  const [assignModal, setAssignModal] = useState<{ open: boolean; bookingId?: string }>({ open: false });
  const [assignHelperName, setAssignHelperName] = useState('Rajesh Kumar');

  const [trackModal, setTrackModal] = useState<{ open: boolean; booking?: any }>({ open: false });
  const [customNote, setCustomNote] = useState('');

  // Fetch all db parameters
  const fetchData = async () => {
    setLoading(true);
    try {
      const [u, s, b, o, m, r, l, sett] = await Promise.all([
        apiClient.getUsers(),
        apiClient.getServices(),
        apiClient.getBookings({}),
        apiClient.getOrders(),
        apiClient.getMessages(),
        apiClient.getReviews(),
        apiClient.getLogs(),
        apiClient.getSettings()
      ]);
      setUsersList(u);
      setServicesList(s);
      setBookingsList(b);
      setOrdersList(o);
      setMessagesList(m);
      setReviewsList(r);
      setAuditLogs(l);
      setAppSettings(sett);
    } catch (err: any) {
      console.warn('Backend API connection failed, falling back to local mock data:', err);
      toast('Backend offline: loaded local mock data', 'info');
      setUsersList(mockUsers);
      setServicesList(mockServices);
      setBookingsList(mockBookings);
      setOrdersList(mockOrders);
      setMessagesList(mockMessages);
      setReviewsList(mockReviews);
      setAuditLogs(mockLogs);
      setAppSettings(mockSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ==========================================
  // Actions: User Management
  // ==========================================
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (userModal.mode === 'add') {
        const added = await apiClient.addUser(userForm);
        setUsersList((prev) => [...prev, added]);
        toast('New user account added', 'success');
      } else {
        const updated = await apiClient.updateUser(userModal.data.id, userForm);
        setUsersList((prev) => prev.map((u) => (u.id === userModal.data.id ? updated : u)));
        toast('User information updated', 'success');
      }
      setUserModal({ open: false, mode: 'add' });
      setUserForm({ name: '', email: '', password: '', role: 'customer' });
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Action failed', 'error');
    }
  };

  const toggleUserStatus = async (id: string, current: string) => {
    const next = current === 'suspended' ? 'active' : 'suspended';
    try {
      const updated = await apiClient.updateUserStatus(id, next);
      setUsersList((prev) => prev.map((u) => (u.id === id ? updated : u)));
      toast(`User account ${next === 'suspended' ? 'suspended' : 'activated'}`, 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to update user status', 'error');
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await apiClient.deleteUser(id);
      setUsersList((prev) => prev.filter((u) => u.id !== id));
      toast('User deleted successfully', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to delete user', 'error');
    }
  };

  // ==========================================
  // Actions: Service Catalog
  // ==========================================
  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalImageUrl = serviceForm.image;

    // Upload file if a new file was selected
    if (imageFile) {
      try {
        setImageUploading(true);
        const uploaded = await apiClient.uploadImage(imageFile);
        finalImageUrl = uploaded.url;
      } catch (err: any) {
        toast('Image upload failed: ' + (err.response?.data?.error || err.message), 'error');
        setImageUploading(false);
        return;
      } finally {
        setImageUploading(false);
      }
    }

    const dataPayload = {
      ...serviceForm,
      image: finalImageUrl,
      price: Number(serviceForm.price),
      features: serviceForm.featuresText.split(',').map((f) => f.trim()).filter(Boolean)
    };

    try {
      if (serviceModal.mode === 'add') {
        const added = await apiClient.addService(dataPayload);
        setServicesList((prev) => [added, ...prev]);
        toast('Catalog service created', 'success');
      } else {
        const updated = await apiClient.updateService(serviceModal.data.id, dataPayload);
        setServicesList((prev) => prev.map((s) => (s.id === serviceModal.data.id ? updated : s)));
        toast('Catalog service updated', 'success');
      }
      setServiceModal({ open: false, mode: 'add' });
      setServiceForm({ name: '', categoryName: 'Electrical', price: '', description: '', duration: '60 min', featuresText: '', image: '', longDescription: '', popular: false });
      setImageFile(null);
      setImagePreview('');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Action failed', 'error');
    }
  };

  const duplicateService = async (id: string) => {
    try {
      const duplicated = await apiClient.duplicateService(id);
      setServicesList((prev) => [duplicated, ...prev]);
      toast('Service catalog duplicated', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to duplicate service', 'error');
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await apiClient.deleteService(id);
      setServicesList((prev) => prev.filter((s) => s.id !== id));
      toast('Service deleted from catalog', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to delete service', 'error');
    }
  };

  // ==========================================
  // Actions: Booking Timeline Updates
  // ==========================================
  const assignHelperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModal.bookingId) return;
    try {
      const updated = await apiClient.assignBookingHelper(assignModal.bookingId, assignHelperName);
      setBookingsList((prev) => prev.map((b) => (b.id === assignModal.bookingId ? updated : b)));
      toast('Technician helper assigned successfully', 'success');
      setAssignModal({ open: false });
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to assign helper', 'error');
    }
  };

  const addTimelineNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackModal.booking) return;
    try {
      const updated = await apiClient.addBookingNote(trackModal.booking.id, customNote);
      setBookingsList((prev) => prev.map((b) => (b.id === trackModal.booking.id ? updated : b)));
      setTrackModal((prev) => ({ ...prev, booking: updated }));
      setCustomNote('');
      toast('Timeline progress log note attached', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to add timeline note', 'error');
    }
  };

  const updateBookingStatus = async (id: string, status: string) => {
    try {
      const updated = await apiClient.updateBookingStatus(id, status);
      setBookingsList((prev) => prev.map((b) => (b.id === id ? updated : b)));
      if (trackModal.open && trackModal.booking?.id === id) {
        setTrackModal((prev) => ({ ...prev, booking: updated }));
      }
      toast(`Booking status updated to ${status}`, 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to update status', 'error');
    }
  };

  // ==========================================
  // Actions: Orders, Inbox Messages, Reviews
  // ==========================================
  const handleOrderRefund = async (id: string, status: 'refunded' | 'cancelled') => {
    try {
      const updated = await apiClient.updateOrderStatus(id, status);
      setOrdersList((prev) => prev.map((o) => (o.id === id ? updated : o)));
      toast(`Order status marked as ${status}`, 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to update order', 'error');
    }
  };

  const archiveInboxMessage = async (id: string) => {
    try {
      const updated = await apiClient.archiveMessage(id);
      setMessagesList((prev) => prev.map((m) => (m.id === id ? updated : m)));
      toast('Support message archived', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to archive message', 'error');
    }
  };

  const deleteInboxMessage = async (id: string) => {
    try {
      await apiClient.deleteMessage(id);
      setMessagesList((prev) => prev.filter((m) => m.id !== id));
      toast('Support query deleted', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to delete message', 'error');
    }
  };

  const sendInboxReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyModal.messageId) return;
    try {
      await apiClient.replyToMessage(replyModal.messageId, replyText);
      toast('Email reply simulated & logged successfully', 'success');
      setReplyModal({ open: false });
      setReplyText('');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to send reply', 'error');
    }
  };

  const updateReviewApproveStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const updated = await apiClient.updateReviewStatus(id, status);
      setReviewsList((prev) => prev.map((r) => (r.id === id ? updated : r)));
      toast(`Review marked as ${status}`, 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to update review', 'error');
    }
  };

  const deleteReviewLog = async (id: string) => {
    try {
      await apiClient.deleteReview(id);
      setReviewsList((prev) => prev.filter((r) => r.id !== id));
      toast('Review removed from history', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to delete review', 'error');
    }
  };

  // ==========================================
  // Actions: Global Settings & Backups
  // ==========================================
  const handleSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await apiClient.updateSettings(appSettings);
      setAppSettings(updated);
      toast('Global settings configuration saved', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to save settings', 'error');
    }
  };

  const downloadDatabaseBackup = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify({ usersList, servicesList, bookingsList, ordersList, reviewsList, messagesList }, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `homeseva_db_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast('JSON database schema backup downloaded!', 'success');
  };

  const exportCSV = (type: 'users' | 'bookings' | 'orders') => {
    let headers = '';
    let rows: string[] = [];
    
    if (type === 'users') {
      headers = 'ID,Name,Email,Role,Status\n';
      rows = usersList.map((u) => `${u.id},${u.name},${u.email},${u.role},${u.status || 'active'}`);
    } else if (type === 'bookings') {
      headers = 'BookingID,Service,Date,Slot,Helper,Price,Status\n';
      rows = bookingsList.map((b) => `${b.id},${b.serviceName},${b.date},${b.timeSlot},${b.professionalName},₹${b.price},${b.status}`);
    } else {
      headers = 'OrderID,Customer,Service,Amount,Method,Status,Date\n';
      rows = ordersList.map((o) => `${o.id},${o.customerName},${o.serviceName},₹${o.amount},${o.paymentMethod},${o.status},${o.date}`);
    }

    const csvContent = `data:text/csv;charset=utf-8,${encodeURIComponent(headers + rows.join('\n'))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute('download', `homeseva_${type}_report_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast(`${type.toUpperCase()} CSV report exported successfully!`, 'success');
  };

  // ==========================================
  // Rendering Helpers & Analytics Calculations
  // ==========================================
  const filteredUsers = usersList.filter((u) => {
    const q = searchUser.toLowerCase();
    const matchSearch = (u.name ?? '').toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q);
    const matchRole = filterUserRole === 'all' || u.role === filterUserRole;
    return matchSearch && matchRole;
  });

  const filteredServices = servicesList.filter((s) => {
    const q = searchService.toLowerCase();
    const matchSearch = (s.name ?? '').toLowerCase().includes(q) || (s.description ?? '').toLowerCase().includes(q);
    const matchCat = filterServiceCat === 'all' || (s.categoryName ?? '') === filterServiceCat;
    return matchSearch && matchCat;
  });

  const filteredBookings = bookingsList.filter((b) => {
    const q = searchBooking.toLowerCase();
    const matchSearch = (b.serviceName ?? '').toLowerCase().includes(q) || (b.id ?? '').toLowerCase().includes(q) || (b.professionalName ?? '').toLowerCase().includes(q);
    const matchStatus = filterBookingStatus === 'all' || b.status === filterBookingStatus;
    return matchSearch && matchStatus;
  });

  const totalRevenue = ordersList
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  const pendingBookings = bookingsList.filter((b) => b.status === 'pending').length;
  const inProgressBookings = bookingsList.filter((b) => b.status === 'in-progress').length;

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-slate-950 min-h-screen text-center">
        <RefreshCw className="w-10 h-10 text-brand-650 animate-spin mb-4" />
        <p className="text-sm font-bold text-gray-900 dark:text-white">Connecting system database...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row flex-1 bg-gray-50 dark:bg-slate-950 min-h-[90vh]">
      
      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-gray-150 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-brand-600 animate-pulse" />
          <span className="font-extrabold text-sm text-gray-900 dark:text-white tracking-tight">Admin Portal</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1 rounded-lg text-gray-550 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`w-full md:w-60 bg-white dark:bg-slate-900 border-r border-gray-150 dark:border-slate-800/80 shrink-0 flex flex-col justify-between ${
        isSidebarOpen ? 'block' : 'hidden md:flex'
      }`}>
        <div className="p-4 space-y-4">
          <div className="hidden md:flex items-center gap-2 mb-6 select-none pl-2">
            <Wrench className="w-5.5 h-5.5 text-brand-650 shrink-0" />
            <h1 className="font-black text-sm text-gray-900 dark:text-white tracking-tight uppercase">HomeSeva Admin</h1>
          </div>

          <nav className="space-y-1 select-none">
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: Activity },
              { id: 'users', label: 'User Control', icon: Users },
              { id: 'services', label: 'Service Catalog', icon: Wrench },
              { id: 'bookings', label: 'Work Orders', icon: Calendar },
              { id: 'orders', label: 'Payments & Revenue', icon: DollarSign },
              { id: 'messages', label: 'Inbox Support', icon: Inbox },
              { id: 'reviews', label: 'User Feedback', icon: Star },
              { id: 'reports', label: 'Analytical Reports', icon: FileText },
              { id: 'settings', label: 'System Settings', icon: Settings },
            ].map((navTab) => {
              const isActive = activeTab === navTab.id;
              return (
                <button
                  key={navTab.id}
                  onClick={() => {
                    setActiveTab(navTab.id as AdminTab);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-bold transition text-left active-scale ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-soft-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <navTab.icon className="w-4 h-4 shrink-0" />
                  {navTab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-slate-800/50">
          <button
            onClick={() => navigate('/dashboard?tab=profile')}
            className="w-full flex items-center justify-between text-xs font-bold text-brand-650 hover:underline px-2 py-1.5"
          >
            <span className="flex items-center gap-1.5"><ChevronLeft className="w-4.5 h-4.5" /> Return Dashboard</span>
          </button>
        </div>
      </aside>

      {/* Main Administrative Control Panel Body */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-5xl w-full mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-5"
          >
            {/* 1. DASHBOARD OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-150 dark:border-slate-800 pb-3">
                  <h2 className="font-extrabold text-sm uppercase text-gray-450 tracking-wider">Dashboard Overview</h2>
                  <Badge tone="brand" className="py-1 px-2.5 font-bold uppercase text-[9px] tracking-wider">Live Analytics</Badge>
                </div>

                {/* KPI Metrics Dashboard Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 select-none">
                  {[
                    { label: 'Total Revenue', value: `₹${totalRevenue}`, change: '+18.2%', icon: DollarSign, tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' },
                    { label: 'Total Users', value: usersList.length.toString(), change: '+12.4%', icon: Users, tone: 'bg-blue-50 text-blue-600 dark:bg-blue-950/20' },
                    { label: 'Pending Bookings', value: pendingBookings.toString(), change: 'Urgent', icon: Clock, tone: 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' },
                    { label: 'Ongoing Services', value: inProgressBookings.toString(), change: 'Live', icon: Activity, tone: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20' },
                  ].map((kpi) => (
                    <div key={kpi.label} className="card p-4 flex flex-col justify-between h-24 hover:shadow-soft transition-all duration-300">
                      <div className="flex justify-between items-start">
                        <div className={`w-8 h-8 rounded-lg ${kpi.tone} flex items-center justify-center`}>
                          <kpi.icon className="w-4.5 h-4.5" />
                        </div>
                        <Badge tone={kpi.label === 'Pending Bookings' ? 'red' : 'green'} className="text-[7.5px] font-bold uppercase py-0.5">{kpi.change}</Badge>
                      </div>
                      <div>
                        <p className="text-base font-black text-gray-900 dark:text-white leading-none mt-2">{kpi.value}</p>
                        <p className="text-[9px] text-gray-400 font-extrabold uppercase mt-1 tracking-wider">{kpi.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simulated Business SVG charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Revenue Growth chart wrapper */}
                  <div className="card p-4 bg-white dark:bg-slate-900 select-none">
                    <h3 className="font-extrabold text-xs text-gray-950 dark:text-white mb-4">Revenue Trend (₹)</h3>
                    <div className="flex items-end justify-between h-36 gap-2">
                      {[15, 28, 42, 38, 48, 55, 62].map((val, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                          <div
                            className="w-full bg-gradient-to-t from-emerald-600 to-teal-500 rounded-t-lg relative transition-all duration-300 hover:brightness-95"
                            style={{ height: `${(val / 62) * 100}%` }}
                          >
                            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              ₹{val}k
                            </span>
                          </div>
                          <span className="text-[8px] text-gray-400 font-extrabold">W{idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Booking Metrics growth charts */}
                  <div className="card p-4 bg-white dark:bg-slate-900 select-none">
                    <h3 className="font-extrabold text-xs text-gray-950 dark:text-white mb-4">User Growth Stats</h3>
                    <div className="flex items-end justify-between h-36 gap-2">
                      {[12, 18, 25, 34, 48, 52, 60].map((val, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                          <div
                            className="w-full bg-gradient-to-t from-brand-650 to-brand-450 rounded-t-lg relative transition-all duration-300 hover:brightness-95"
                            style={{ height: `${(val / 60) * 100}%` }}
                          >
                            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              +{val}%
                            </span>
                          </div>
                          <span className="text-[8px] text-gray-400 font-extrabold">M{idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Audit Logs Quick View */}
                <div className="card p-4 bg-white dark:bg-slate-900">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-slate-800">
                    <h3 className="font-extrabold text-xs text-gray-950 dark:text-white">Recent System Log Audit Trail</h3>
                    <button onClick={() => setActiveTab('settings')} className="text-[10px] text-brand-650 hover:underline font-extrabold uppercase">See Log Table</button>
                  </div>
                  <div className="space-y-3">
                    {auditLogs.slice(0, 4).map((log) => (
                      <div key={log.id} className="text-xs flex justify-between items-start gap-4">
                        <div>
                          <p className="font-bold text-gray-800 dark:text-gray-200">{log.action}</p>
                          <p className="text-[10px] text-gray-450 mt-0.5">{log.details}</p>
                        </div>
                        <span className="text-[9px] text-gray-400 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. USER MANAGEMENT TAB */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-150 dark:border-slate-800 pb-3">
                  <h3 className="font-extrabold text-xs uppercase text-gray-450 tracking-wider">User Account Control</h3>
                  <div className="flex gap-2">
                    <Button onClick={() => exportCSV('users')} size="sm" variant="outline" leftIcon={<Download className="w-4 h-4" />}>
                      Export CSV
                    </Button>
                    <Button onClick={() => {
                      setUserForm({ name: '', email: '', password: '', role: 'customer' });
                      setUserModal({ open: true, mode: 'add' });
                    }} size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                      Add User
                    </Button>
                  </div>
                </div>

                {/* Filter Controls Row */}
                <div className="flex flex-col sm:flex-row gap-2 select-none">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      placeholder="Search accounts name or email..."
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 text-xs text-gray-900 dark:text-white placeholder-gray-400"
                    />
                  </div>
                  <select
                    value={filterUserRole}
                    onChange={(e) => setFilterUserRole(e.target.value)}
                    className="h-10 px-3 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 text-gray-700 dark:text-gray-300 outline-none"
                  >
                    <option value="all">All Roles</option>
                    <option value="customer">Customer</option>
                    <option value="professional">Professional</option>
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Accounts CRUD list table */}
                <div className="card p-0 bg-white dark:bg-slate-900 overflow-hidden border border-gray-100 dark:border-slate-800">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-slate-850/60 border-b border-gray-100 dark:border-slate-800 font-extrabold text-gray-450 uppercase tracking-wider select-none">
                          <th className="p-3.5 pl-4">Name</th>
                          <th className="p-3.5">Email</th>
                          <th className="p-3.5">Role</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right pr-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-850/20 text-gray-700 dark:text-gray-350">
                            <td className="p-3.5 pl-4 font-bold text-gray-900 dark:text-white">{u.name}</td>
                            <td className="p-3.5">{u.email}</td>
                            <td className="p-3.5 font-semibold capitalize">{u.role}</td>
                            <td className="p-3.5">
                              <Badge tone={u.status === 'suspended' ? 'red' : 'green'} className="text-[7.5px] uppercase tracking-wider font-extrabold px-1.5 py-0.5">
                                {u.status || 'active'}
                              </Badge>
                            </td>
                            <td className="p-3.5 text-right pr-4">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setUserForm({ name: u.name, email: u.email, password: u.password, role: u.role });
                                    setUserModal({ open: true, mode: 'edit', data: u });
                                  }}
                                  className="p-1 rounded bg-gray-50 dark:bg-slate-800 text-gray-500 hover:text-brand-600 transition"
                                  title="Edit user details"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => toggleUserStatus(u.id, u.status || 'active')}
                                  className={`p-1 rounded text-white transition ${
                                    u.status === 'suspended' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'
                                  }`}
                                  title={u.status === 'suspended' ? 'Unsuspend User' : 'Suspend User'}
                                >
                                  <ShieldAlert className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteUser(u.id)}
                                  disabled={u.role === 'admin'}
                                  className={`p-1 rounded bg-gray-50 dark:bg-slate-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition ${
                                    u.role === 'admin' ? 'opacity-30 cursor-not-allowed' : ''
                                  }`}
                                  title="Delete user account"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 3. SERVICE CATALOG TAB */}
            {activeTab === 'services' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-150 dark:border-slate-800 pb-3">
                  <h3 className="font-extrabold text-xs uppercase text-gray-450 tracking-wider">Service Catalog Catalog Management</h3>
                  <Button onClick={() => {
                    setServiceForm({ name: '', categoryName: 'Electrical', price: '', description: '', duration: '60 min', featuresText: '', image: '', longDescription: '', popular: false });
                    setImageFile(null);
                    setImagePreview('');
                    setServiceModal({ open: true, mode: 'add' });
                  }} size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                    Add New Service
                  </Button>
                </div>

                {/* Filter Row */}
                <div className="flex flex-col sm:flex-row gap-2 select-none">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      value={searchService}
                      onChange={(e) => setSearchService(e.target.value)}
                      placeholder="Search services name or description..."
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 text-xs text-gray-900 dark:text-white placeholder-gray-400"
                    />
                  </div>
                  <select
                    value={filterServiceCat}
                    onChange={(e) => setFilterServiceCat(e.target.value)}
                    className="h-10 px-3 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 text-gray-700 dark:text-gray-300 outline-none"
                  >
                    <option value="all">All Categories</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Carpenter">Carpenter</option>
                    <option value="AC Repair">AC Repair</option>
                    <option value="Home Cleaning">Home Cleaning</option>
                  </select>
                </div>

                {/* Service Cards Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredServices.map((s) => (
                    <div key={s.id} className="card p-3.5 flex gap-3.5 bg-white dark:bg-slate-900 relative">
                      <img src={s.image} alt={s.name} className="w-24 h-24 object-cover rounded-2xl shrink-0" />
                      <div className="flex-1 min-w-0 flex flex-col justify-between text-left">
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="font-extrabold text-sm truncate pr-1">{s.name}</h4>
                            <span className="text-[10px] bg-brand-50 text-brand-650 dark:bg-brand-950/20 dark:text-brand-400 font-black px-2 py-0.5 rounded shrink-0 leading-none">
                              {s.categoryName}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">{s.description}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-800/40 pt-2.5 mt-2">
                          <span className="font-black text-xs text-gray-900 dark:text-white">₹{s.price} <span className="text-[9px] text-gray-400 font-bold block mt-0.5">{s.duration}</span></span>
                          
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => {
                                setServiceForm({
                                  name: s.name,
                                  categoryName: s.categoryName || '',
                                  price: s.price.toString(),
                                  description: s.description,
                                  longDescription: s.long_description || '',
                                  duration: s.duration,
                                  image: s.image,
                                  featuresText: Array.isArray(s.features) ? s.features.join(', ') : '',
                                  popular: s.popular === true || s.popular === 1,
                                });
                                setImageFile(null);
                                setImagePreview(s.image || '');
                                setServiceModal({ open: true, mode: 'edit', data: s });
                              }}
                              className="p-2 rounded-lg bg-gray-50 dark:bg-slate-850 hover:bg-brand-50 dark:hover:bg-slate-800 text-gray-500 hover:text-brand-650 transition active-scale"
                              title="Edit service details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => duplicateService(s.id)}
                              className="p-2 rounded-lg bg-gray-50 dark:bg-slate-850 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition active-scale"
                              title="Duplicate catalog service"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteService(s.id)}
                              className="p-2 rounded-lg bg-gray-50 dark:bg-slate-850 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition active-scale"
                              title="Remove service from catalog"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. WORK BOOKINGS & TRACKING TAB */}
            {activeTab === 'bookings' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-150 dark:border-slate-800 pb-3">
                  <h3 className="font-extrabold text-xs uppercase text-gray-450 tracking-wider">Helper Bookings & Timelines</h3>
                  <Button onClick={() => exportCSV('bookings')} size="sm" variant="outline" leftIcon={<Download className="w-4 h-4" />}>
                    Export Booking Logs
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 select-none">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      value={searchBooking}
                      onChange={(e) => setSearchBooking(e.target.value)}
                      placeholder="Search booking ID, service, helper..."
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 text-xs text-gray-900 dark:text-white placeholder-gray-400"
                    />
                  </div>
                  <select
                    value={filterBookingStatus}
                    onChange={(e) => setFilterBookingStatus(e.target.value)}
                    className="h-10 px-3 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 text-gray-700 dark:text-gray-300 outline-none"
                  >
                    <option value="all">All Bookings</option>
                    <option value="pending">Pending Requests</option>
                    <option value="upcoming">Confirmed</option>
                    <option value="in-progress">In-Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Bookings & Timelines list table */}
                <div className="card p-0 bg-white dark:bg-slate-900 overflow-hidden border border-gray-100 dark:border-slate-800">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-slate-850/60 border-b border-gray-100 dark:border-slate-800 font-extrabold text-gray-450 uppercase tracking-wider select-none">
                          <th className="p-3.5 pl-4">BookingID</th>
                          <th className="p-3.5">Service</th>
                          <th className="p-3.5">Date & Slot</th>
                          <th className="p-3.5">Assigned Helper</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right pr-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-105 dark:divide-slate-800">
                        {filteredBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-850/20 text-gray-700 dark:text-gray-350">
                            <td className="p-3.5 pl-4 font-bold text-gray-900 dark:text-white uppercase">{b.id.slice(0,8)}</td>
                            <td className="p-3.5 font-semibold text-gray-800 dark:text-gray-200">{b.serviceName}</td>
                            <td className="p-3.5 leading-relaxed">{new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}<br/><span className="text-[10px] text-gray-450">{b.timeSlot}</span></td>
                            <td className="p-3.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold">{b.professionalName}</span>
                                <button
                                  onClick={() => {
                                    setAssignHelperName(b.professionalName);
                                    setAssignModal({ open: true, bookingId: b.id });
                                  }}
                                  className="text-[10px] text-brand-650 hover:underline font-extrabold uppercase"
                                >
                                  (Reassign)
                                </button>
                              </div>
                            </td>
                            <td className="p-3.5">
                              <Badge tone={b.status === 'completed' ? 'green' : b.status === 'cancelled' ? 'red' : 'amber'} className="capitalize text-[7.5px] font-bold">
                                {b.status}
                              </Badge>
                            </td>
                            <td className="p-3.5 text-right pr-4">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setTrackModal({ open: true, booking: b });
                                    setCustomNote('');
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-[10px] text-brand-650 dark:text-brand-400 font-extrabold uppercase hover:bg-brand-50 dark:hover:bg-slate-850 transition active-scale"
                                >
                                  Track Details
                                </button>
                                {b.status === 'pending' && (
                                  <button
                                    onClick={() => updateBookingStatus(b.id, 'upcoming')}
                                    className="p-1.5 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                                    title="Accept & Confirm Job"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}
                                {(b.status === 'upcoming' || b.status === 'pending') && (
                                  <button
                                    onClick={() => updateBookingStatus(b.id, 'cancelled')}
                                    className="p-1.5 rounded bg-rose-50 text-red-500 hover:bg-rose-100 transition"
                                    title="Cancel Booking"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 5. ORDERS & REVENUE TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-150 dark:border-slate-800 pb-3">
                  <h3 className="font-extrabold text-xs uppercase text-gray-450 tracking-wider">Payments & Revenue Orders</h3>
                  <Button onClick={() => exportCSV('orders')} size="sm" variant="outline" leftIcon={<Download className="w-4 h-4" />}>
                    Export Payments Ledger
                  </Button>
                </div>

                <div className="card p-0 bg-white dark:bg-slate-900 overflow-hidden border border-gray-100 dark:border-slate-800">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-slate-850/60 border-b border-gray-100 dark:border-slate-800 font-extrabold text-gray-450 uppercase tracking-wider select-none">
                          <th className="p-3.5 pl-4">OrderID</th>
                          <th className="p-3.5">Customer Name</th>
                          <th className="p-3.5">Purchased Service</th>
                          <th className="p-3.5">Amount</th>
                          <th className="p-3.5">Method</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right pr-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                        {ordersList.map((o) => (
                          <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-850/20 text-gray-700 dark:text-gray-355">
                            <td className="p-3.5 pl-4 font-extrabold uppercase text-gray-900 dark:text-white">{o.id.slice(0, 10)}</td>
                            <td className="p-3.5 font-bold text-gray-800 dark:text-gray-250">{o.customerName}</td>
                            <td className="p-3.5 truncate max-w-[150px]">{o.serviceName}</td>
                            <td className="p-3.5 font-black">₹{o.amount}</td>
                            <td className="p-3.5 uppercase tracking-tight">{o.paymentMethod}</td>
                            <td className="p-3.5">
                              <Badge tone={o.status === 'paid' ? 'green' : o.status === 'refunded' ? 'amber' : 'red'} className="uppercase text-[8px] font-bold">
                                {o.status}
                              </Badge>
                            </td>
                            <td className="p-3.5 text-right pr-4">
                              {o.status === 'paid' && (
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOrderRefund(o.id, 'refunded')}
                                    className="px-2 py-1 rounded bg-amber-50 text-amber-600 hover:bg-amber-100 text-[10px] font-extrabold uppercase transition active-scale"
                                  >
                                    Refund
                                  </button>
                                  <button
                                    onClick={() => handleOrderRefund(o.id, 'cancelled')}
                                    className="px-2 py-1 rounded bg-rose-50 text-red-500 hover:bg-rose-100 text-[10px] font-extrabold uppercase transition active-scale"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 6. SUPPORT INBOX TAB */}
            {activeTab === 'messages' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-150 dark:border-slate-800 pb-3">
                  <h3 className="font-extrabold text-xs uppercase text-gray-450 tracking-wider">Support Inbox Messages</h3>
                </div>

                <div className="space-y-3">
                  {messagesList.length > 0 ? (
                    messagesList.map((m) => (
                      <div key={m.id} className="card p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 flex flex-col gap-3 relative">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-extrabold text-xs text-gray-900 dark:text-white">{m.name}</h4>
                              <span className="text-[10px] text-gray-400">({m.email})</span>
                              <Badge tone={m.status === 'unread' ? 'red' : m.status === 'replied' ? 'green' : 'amber'} className="text-[7.5px] font-bold uppercase leading-none">
                                {m.status}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-brand-650 dark:text-brand-350 font-bold mt-1">Subj: {m.subject}</p>
                          </div>
                          <span className="text-[9px] text-gray-400 font-semibold">{new Date(m.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        </div>
                        
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-slate-950/40 p-3 rounded-2xl border border-gray-100/50 dark:border-slate-850/50">
                          {m.message}
                        </p>

                        <div className="flex justify-end gap-2 border-t border-gray-100 dark:border-slate-800/40 pt-2.5">
                          {m.status !== 'replied' && (
                            <Button
                              onClick={() => {
                                setReplyModal({ open: true, messageId: m.id, customerEmail: m.email });
                                setReplyText('');
                              }}
                              size="sm"
                              className="h-8 text-[10px] font-bold rounded-lg"
                              leftIcon={<Send className="w-3.5 h-3.5" />}
                            >
                              Compose Reply
                            </Button>
                          )}
                          {m.status !== 'archived' && (
                            <button
                              onClick={() => archiveInboxMessage(m.id)}
                              className="px-3 py-1.5 rounded-lg border border-gray-150 dark:border-slate-800 text-[10px] font-extrabold text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-850 transition"
                              title="Archive query"
                            >
                              Archive
                            </button>
                          )}
                          <button
                            onClick={() => deleteInboxMessage(m.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                            title="Delete query"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState icon={<Inbox className="w-10 h-10 text-gray-400" />} title="No messages found" description="Customer support requests will show up here." />
                  )}
                </div>
              </div>
            )}

            {/* 7. CUSTOMER REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-150 dark:border-slate-800 pb-3">
                  <h3 className="font-extrabold text-xs uppercase text-gray-450 tracking-wider">Reviews & Ratings Moderation</h3>
                </div>

                <div className="card p-0 bg-white dark:bg-slate-900 overflow-hidden border border-gray-100 dark:border-slate-800">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-slate-850/60 border-b border-gray-100 dark:border-slate-800 font-extrabold text-gray-450 uppercase tracking-wider select-none">
                          <th className="p-3.5 pl-4">Service</th>
                          <th className="p-3.5">Reviewer</th>
                          <th className="p-3.5">Rating</th>
                          <th className="p-3.5">Comment</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right pr-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                        {reviewsList.map((r) => (
                          <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-850/20 text-gray-700 dark:text-gray-350">
                            <td className="p-3.5 pl-4 font-bold text-gray-900 dark:text-white truncate max-w-[150px]">{r.serviceTitle}</td>
                            <td className="p-3.5 font-bold text-gray-650 dark:text-gray-300">{r.author}</td>
                            <td className="p-3.5 font-black text-amber-500">{r.rating} ★</td>
                            <td className="p-3.5 max-w-[200px] truncate">{r.comment}</td>
                            <td className="p-3.5">
                              <Badge tone={r.status === 'approved' ? 'green' : r.status === 'rejected' ? 'red' : 'amber'} className="text-[7px] uppercase font-bold px-1.5 py-0.5">
                                {r.status || 'pending'}
                              </Badge>
                            </td>
                            <td className="p-3.5 text-right pr-4">
                              <div className="flex justify-end gap-1.5">
                                {r.status !== 'approved' && (
                                  <button
                                    onClick={() => updateReviewApproveStatus(r.id, 'approved')}
                                    className="p-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                                    title="Approve Review"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {r.status !== 'rejected' && (
                                  <button
                                    onClick={() => updateReviewApproveStatus(r.id, 'rejected')}
                                    className="p-1 rounded bg-rose-50 text-red-500 hover:bg-rose-100 transition"
                                    title="Decline / Hide Review"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteReviewLog(r.id)}
                                  className="p-1 rounded bg-gray-50 dark:bg-slate-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                                  title="Delete Review"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 8. BUSINESS REPORTS TAB */}
            {activeTab === 'reports' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-150 dark:border-slate-800 pb-3">
                  <h3 className="font-extrabold text-xs uppercase text-gray-450 tracking-wider">Analytical Business Reports</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 select-none">
                  {[
                    { title: 'Sales Summary Ledger', desc: 'Detailed transactions list of all payments and orders.', type: 'orders' },
                    { title: 'User Registrations List', desc: 'Registered customer emails, user roles, and login statuses.', type: 'users' },
                    { title: 'Bookings Timeline Logs', desc: 'Bookings dates, technicians, payouts, and progress statuses.', type: 'bookings' },
                  ].map((rep) => (
                    <div key={rep.title} className="card p-4 flex flex-col justify-between h-40 bg-white dark:bg-slate-900">
                      <div>
                        <FileText className="w-7 h-7 text-brand-650 mb-2.5" />
                        <h4 className="font-extrabold text-xs text-gray-900 dark:text-white leading-normal">{rep.title}</h4>
                        <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{rep.desc}</p>
                      </div>
                      <Button
                        onClick={() => exportCSV(rep.type as any)}
                        size="sm"
                        variant="outline"
                        leftIcon={<Download className="w-3.5 h-3.5" />}
                        className="h-9 text-[10px] font-bold"
                      >
                        Generate CSV Report
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9. GLOBAL SETTINGS & LOGS TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                
                {/* Global website configurations */}
                <div className="card p-5 bg-white dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-3 mb-4 border-b border-gray-105 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4.5 h-4.5 text-brand-650" />
                      <h3 className="font-extrabold text-xs uppercase tracking-wider">Global App Configuration</h3>
                    </div>
                    <Button onClick={downloadDatabaseBackup} variant="outline" size="sm" leftIcon={<Database className="w-4 h-4" />} className="h-9 text-[10px] font-bold">
                      Backup db.json
                    </Button>
                  </div>

                  <form onSubmit={handleSettingsUpdate} className="space-y-4 text-left">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Application Display Name"
                        value={appSettings.appName || ''}
                        onChange={(e) => setAppSettings({ ...appSettings, appName: e.target.value })}
                        required
                      />
                      <Input
                        label="Support Email Address"
                        value={appSettings.contactEmail || ''}
                        onChange={(e) => setAppSettings({ ...appSettings, contactEmail: e.target.value })}
                        required
                      />
                      <Input
                        label="Support Helpline Phone"
                        value={appSettings.contactPhone || ''}
                        onChange={(e) => setAppSettings({ ...appSettings, contactPhone: e.target.value })}
                        required
                      />
                      <Input
                        label="Currency Unit Symbol"
                        value={appSettings.currency || 'INR'}
                        onChange={(e) => setAppSettings({ ...appSettings, currency: e.target.value })}
                        required
                      />
                    </div>
                    
                    <Input
                      label="HQ Office Location Address"
                      value={appSettings.address || ''}
                      onChange={(e) => setAppSettings({ ...appSettings, address: e.target.value })}
                    />

                    <div className="flex justify-end pt-2">
                      <Button size="sm" type="submit" className="px-6 h-10 font-extrabold">
                        Save System Settings
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Database logs full view */}
                <div className="card p-4 bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">
                    <Activity className="w-4.5 h-4.5 text-brand-600" />
                    <h3 className="font-extrabold text-xs uppercase tracking-wider">System Audit Trail Logs</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-slate-850/60 border-b border-gray-100 dark:border-slate-800 font-extrabold text-gray-400 uppercase tracking-wider select-none">
                          <th className="p-3 pl-4">Timestamp</th>
                          <th className="p-3">Audit Action</th>
                          <th className="p-3">User</th>
                          <th className="p-3 pr-4">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-650 dark:text-gray-400">
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-850/20">
                            <td className="p-3 pl-4 text-[10px] text-gray-400 font-semibold">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="p-3 font-bold text-gray-900 dark:text-white leading-none">{log.action}</td>
                            <td className="p-3 font-semibold">{log.userName}</td>
                            <td className="p-3 pr-4">{log.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ========================================================================= */}
      {/* DIALOG PORTALS / MODAL OVERLAYS */}
      {/* ========================================================================= */}

      {/* User CRUD Modal */}
      {userModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-5 shadow-soft-lg text-left"
          >
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-slate-800 pb-2.5">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-900 dark:text-white">
                {userModal.mode === 'add' ? 'Add New User Account' : 'Edit User Profile'}
              </h4>
              <button onClick={() => setUserModal({ open: false, mode: 'add' })} className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Rajesh Kumar"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                required
              />
              <Input
                label="Email Address"
                placeholder="rajesh@example.com"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="Password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                required={userModal.mode === 'add'}
              />
              
              <div>
                <label className="block text-xs font-bold text-gray-450 dark:text-gray-400 mb-1.5">User Access Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500"
                >
                  <option value="customer">Customer</option>
                  <option value="professional">Professional Helper</option>
                  <option value="staff">Staff Member</option>
                  <option value="manager">Regional Manager</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={() => setUserModal({ open: false, mode: 'add' })} variant="outline" type="button" fullWidth className="h-10 text-xs">
                  Cancel
                </Button>
                <Button type="submit" fullWidth className="h-10 text-xs font-bold">
                  Save Account
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Service CRUD Modal */}
      {serviceModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 shadow-soft-lg text-left max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-brand-600" />
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-900 dark:text-white">
                  {serviceModal.mode === 'add' ? 'Create New Catalog Service' : 'Edit Service Details'}
                </h4>
              </div>
              <button
                onClick={() => {
                  setServiceModal({ open: false, mode: 'add' });
                  setImageFile(null);
                  setImagePreview('');
                }}
                className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleServiceSubmit} className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

              {/* ── IMAGE UPLOAD ZONE ── */}
              <div>
                <label className="block text-xs font-bold text-gray-450 dark:text-gray-400 mb-2">
                  Service Photo <span className="text-gray-400 font-normal">(drag & drop or click)</span>
                </label>

                {/* Drag-drop zone / preview */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setImageDragOver(true); }}
                  onDragLeave={() => setImageDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setImageDragOver(false);
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) {
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                      setServiceForm((prev) => ({ ...prev, image: '' }));
                    }
                  }}
                  onClick={() => document.getElementById('svc-img-input')?.click()}
                  className={`relative w-full h-40 rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden transition-all ${
                    imageDragOver
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/20'
                      : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-850/40 hover:border-brand-400 hover:bg-brand-50/30'
                  }`}
                >
                  {(imagePreview || serviceForm.image) ? (
                    <>
                      <img
                        src={imagePreview || serviceForm.image}
                        alt="preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/4239034/pexels-photo-4239034.jpeg?auto=compress&cs=tinysrgb&w=400'; }}
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="text-white text-center">
                          <Plus className="w-6 h-6 mx-auto mb-1" />
                          <p className="text-[10px] font-bold">Change Photo</p>
                        </div>
                      </div>
                      {imageFile && (
                        <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                          New Upload
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 select-none">
                      <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                        <Plus className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-400 font-bold">Drop photo here or click to browse</p>
                      <p className="text-[10px] text-gray-300 dark:text-gray-600">JPG, PNG, WebP — max 5 MB</p>
                    </div>
                  )}
                </div>
                <input
                  id="svc-img-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                      setServiceForm((prev) => ({ ...prev, image: '' }));
                    }
                  }}
                />

                {/* URL fallback */}
                <div className="mt-2">
                  <p className="text-[10px] text-gray-400 mb-1 font-bold uppercase tracking-wider">— Or paste image URL —</p>
                  <input
                    type="url"
                    placeholder="https://images.pexels.com/..."
                    value={serviceForm.image}
                    onChange={(e) => {
                      setServiceForm({ ...serviceForm, image: e.target.value });
                      if (e.target.value) {
                        setImageFile(null);
                        setImagePreview('');
                      }
                    }}
                    className="w-full h-9 px-3 rounded-xl text-[11px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 outline-none focus:border-brand-500 placeholder-gray-300"
                  />
                </div>
              </div>

              {/* Service Name */}
              <Input
                label="Service Name"
                placeholder="e.g. Sofa Deep Cleaning"
                value={serviceForm.name}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                required
              />

              {/* Category + Price row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-450 dark:text-gray-400 mb-1.5">Category</label>
                  <select
                    value={serviceForm.categoryName}
                    onChange={(e) => setServiceForm({ ...serviceForm, categoryName: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500"
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Carpenter">Carpenter</option>
                    <option value="AC Repair">AC Repair</option>
                    <option value="Home Cleaning">Home Cleaning</option>
                    <option value="Painting">Painting</option>
                    <option value="Pest Control">Pest Control</option>
                    <option value="Appliance Repair">Appliance Repair</option>
                  </select>
                </div>
                <Input
                  label="Price (₹)"
                  type="number"
                  placeholder="e.g. 599"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                  required
                />
              </div>

              {/* Duration + Popular toggle row */}
              <div className="grid grid-cols-2 gap-3 items-end">
                <Input
                  label="Duration"
                  placeholder="e.g. 60-90 min"
                  value={serviceForm.duration}
                  onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                />
                <div>
                  <label className="block text-xs font-bold text-gray-450 dark:text-gray-400 mb-1.5">Mark as Popular</label>
                  <button
                    type="button"
                    onClick={() => setServiceForm((prev) => ({ ...prev, popular: !prev.popular }))}
                    className={`w-full h-11 rounded-xl border text-xs font-bold transition ${
                      serviceForm.popular
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white dark:bg-slate-900 text-gray-500 border-gray-200 dark:border-slate-700 hover:border-brand-400'
                    }`}
                  >
                    {serviceForm.popular ? '⭐ Featured' : 'Not Featured'}
                  </button>
                </div>
              </div>

              {/* Features */}
              <Input
                label="Key Features (comma separated)"
                placeholder="e.g. Verified helper, 30-day warranty, Same day service"
                value={serviceForm.featuresText}
                onChange={(e) => setServiceForm({ ...serviceForm, featuresText: e.target.value })}
              />

              {/* Short Description */}
              <div>
                <label className="block text-xs font-bold text-gray-455 mb-1.5">Short Description <span className="text-red-500">*</span></label>
                <textarea
                  rows={2}
                  placeholder="Brief overview shown on service cards..."
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  required
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 text-xs text-gray-900 dark:text-white outline-none resize-none focus:border-brand-500"
                />
              </div>

              {/* Long Description */}
              <div>
                <label className="block text-xs font-bold text-gray-455 mb-1.5">Full Details Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed information shown on service detail page..."
                  value={serviceForm.longDescription}
                  onChange={(e) => setServiceForm({ ...serviceForm, longDescription: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 text-xs text-gray-900 dark:text-white outline-none resize-none focus:border-brand-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1 pb-2">
                <Button
                  onClick={() => {
                    setServiceModal({ open: false, mode: 'add' });
                    setImageFile(null);
                    setImagePreview('');
                  }}
                  variant="outline"
                  type="button"
                  fullWidth
                  className="h-10 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  fullWidth
                  disabled={imageUploading}
                  className="h-10 text-xs font-bold"
                >
                  {imageUploading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading…
                    </span>
                  ) : (
                    serviceModal.mode === 'add' ? 'Publish to Catalog' : 'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}


      {/* Compose Inbox Reply Modal */}
      {replyModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-5 shadow-soft-lg text-left"
          >
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-slate-800 pb-2.5">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
                <Send className="w-4 h-4 text-brand-600" /> Compose Email Reply
              </h4>
              <button onClick={() => setReplyModal({ open: false })} className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            
            <form onSubmit={sendInboxReplySubmit} className="space-y-4">
              <div>
                <p className="text-[10px] text-gray-450 uppercase font-extrabold">Customer Email</p>
                <p className="text-xs font-bold mt-0.5">{replyModal.customerEmail}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-455 mb-1.5">Reply message text</label>
                <textarea
                  rows={4}
                  placeholder="Hi, thank you for writing. Here are details..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 text-xs text-gray-900 dark:text-white outline-none resize-none focus:border-brand-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={() => setReplyModal({ open: false })} variant="outline" type="button" fullWidth className="h-10 text-xs">
                  Cancel
                </Button>
                <Button type="submit" fullWidth className="h-10 text-xs font-bold">
                  Send Response Email
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Assign Employee Helper Modal */}
      {assignModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-5 shadow-soft-lg text-left"
          >
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-slate-800 pb-2.5">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-900 dark:text-white">
                Assign Pro Helper
              </h4>
              <button onClick={() => setAssignModal({ open: false })} className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            
            <form onSubmit={assignHelperSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-450 dark:text-gray-400 mb-1.5">Select helper professional</label>
                <select
                  value={assignHelperName}
                  onChange={(e) => setAssignHelperName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500"
                >
                  <option value="Rajesh Kumar">Rajesh Kumar (Catering Specialist)</option>
                  <option value="Priya Sharma">Priya Sharma (Meal Prep Planner)</option>
                  <option value="Amit Patel">Amit Patel (Electrical & Plumbing Pro)</option>
                  <option value="Sunita Reddy">Sunita Reddy (Deep Cleaning Manager)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={() => setAssignModal({ open: false })} variant="outline" type="button" fullWidth className="h-10 text-xs">
                  Cancel
                </Button>
                <Button type="submit" fullWidth className="h-10 text-xs font-bold">
                  Confirm Assign helper
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Booking Track Timeline Details Modal */}
      {trackModal.open && trackModal.booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-5 shadow-soft-lg text-left max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-slate-800 pb-2.5">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-900 dark:text-white">
                Live Timeline Tracking Details
              </h4>
              <button onClick={() => setTrackModal({ open: false })} className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-gray-400 font-extrabold uppercase">Service Booked</p>
                <p className="text-xs font-black mt-0.5">{trackModal.booking.serviceName} • {trackModal.booking.id}</p>
                <p className="text-[10px] text-gray-500 mt-1">Date: {trackModal.booking.date} • {trackModal.booking.timeSlot}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Assigned: {trackModal.booking.professionalName}</p>
              </div>

              {/* Booking status transition buttons */}
              <div>
                <p className="text-[10px] text-gray-450 font-extrabold uppercase mb-2">Update status state</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'pending', label: 'Place Order', bg: 'bg-amber-600' },
                    { id: 'upcoming', label: 'Confirm Booking', bg: 'bg-blue-600' },
                    { id: 'in-progress', label: 'Start Travel / Travel', bg: 'bg-indigo-650' },
                    { id: 'completed', label: 'Complete service', bg: 'bg-emerald-600' },
                    { id: 'cancelled', label: 'Cancel booking', bg: 'bg-red-500' }
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => updateBookingStatus(trackModal.booking.id, st.id)}
                      className={`px-2 py-1.5 rounded-lg text-white text-[10px] font-bold transition active-scale ${st.bg}`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vertical timeline details */}
              <div className="bg-gray-50 dark:bg-slate-950/30 p-3.5 rounded-2xl border border-gray-100 dark:border-slate-800/80">
                <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-3">Milestones history logs</p>
                <div className="relative pl-5 space-y-4">
                  <div className="absolute left-2 top-1.5 bottom-1.5 w-0.5 bg-gray-200 dark:bg-slate-800" />
                  
                  {trackModal.booking.timeline && trackModal.booking.timeline.map((step: any, idx: number) => (
                    <div key={idx} className="relative text-[11px] leading-relaxed">
                      <div className="absolute left-0 -translate-x-[17.5px] w-3 h-3 rounded-full bg-brand-650 border border-white dark:border-slate-900" />
                      <p className="font-extrabold text-gray-900 dark:text-white capitalize">{step.status}</p>
                      <p className="text-[10px] text-gray-500 leading-snug mt-0.5">{step.note}</p>
                      <p className="text-[8px] text-gray-400 mt-0.5">{new Date(step.time).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Append custom notes form */}
              <form onSubmit={addTimelineNoteSubmit} className="space-y-3 pt-2">
                <Input
                  label="Attach timeline log note"
                  placeholder="e.g. Helper reached traffic signal, or material purchased"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  required
                />
                <Button type="submit" size="sm" fullWidth className="h-9 text-[10px] font-bold">
                  Publish Milestone Log
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
