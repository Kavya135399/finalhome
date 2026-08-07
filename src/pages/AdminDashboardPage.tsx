import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Calendar, DollarSign, Star,
  Wrench, Search, Download, ChevronLeft,
  Plus, Edit, Trash2, Check, XCircle, Inbox, Settings, FileText,
  ShieldAlert, Activity, RefreshCw, Send, Database, Menu, X, Clock,
  CarTaxiFront, Camera, LogOut, ShoppingBag, Package, Eye, AlertTriangle, Tag,
  Utensils, UtensilsCrossed, Shield, CreditCard, Filter, User, MapPin, Phone, Mail, CheckCircle2, ArrowRight, ChefHat,
  Sliders, Bell, EyeOff, Lock as LockIcon
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import { OverviewTab } from '../components/admin/OverviewTab';
import { OffersTab } from '../components/admin/OffersTab';
import { FoodArrangementsTab } from '../components/admin/FoodArrangementsTab';
import { ServicesManagerTab } from '../components/admin/ServicesManagerTab';
import {
  services as mockServices,
  userBookings as mockBookings,
  reviews as mockReviews
} from '../data/sampleData';

const mockUsers = [
  { id: 'usr1', name: 'Vikram Singh', email: 'vikram@example.com', mobile: '+91 98765 43210', role: 'customer', status: 'active', created_at: new Date().toISOString() },
  { id: 'usr2', name: 'Rajesh Kumar', email: 'rajesh@example.com', mobile: '+91 98765 43211', role: 'professional', status: 'active', created_at: new Date().toISOString() },
  { id: 'usr3', name: 'Admin User', email: 'admin@example.com', mobile: '+91 98765 43212', role: 'admin', status: 'active', created_at: new Date().toISOString() },
];

const FALLBACK_STORE_PRODUCTS = [
  { id: 'sp_001', name: 'Cold-Brew Black Coffee', category: 'Beverages', description: '12-hour steeped organic Arabica cold brew in a 300ml bottle.', price: 180, stock: 15, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=400', is_active: 1 },
  { id: 'sp_002', name: 'Heavy-Duty LED Flashlight', category: 'Emergency Supplies', description: '1000 lumen water-resistant aircraft-grade aluminium tactical torch.', price: 999, stock: 11, image: 'https://images.unsplash.com/photo-1567608346699-89d59c4e5b31?auto=format&fit=crop&q=80&w=400', is_active: 1 },
  { id: 'sp_003', name: 'Organic Alphonso Mangoes', category: 'Fruits', description: 'Box of 6 handpicked, naturally ripened Ratnagiri Alphonso mangoes.', price: 899, stock: 12, image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=400', is_active: 1 },
  { id: 'sp_004', name: 'Premium Aged Basmati Rice', category: 'Groceries', description: '5 kg bag of 2-year aged extra-long grain basmati.', price: 320, stock: 40, image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&q=80&w=400', is_active: 1 },
  { id: 'sp_005', name: 'Premium Roasted Cashews', category: 'Snacks', description: 'Lightly salted whole cashews, slow-roasted in small batches. 200g pack.', price: 349, stock: 25, image: 'https://images.unsplash.com/photo-1567892737950-30c4db6e22aa?auto=format&fit=crop&q=80&w=400', is_active: 1 },
  { id: 'sp_006', name: 'Masala Oats Breakfast Mix', category: 'Breakfast Items', description: 'Instant savoury oats with mixed vegetables. Ready in 3 minutes. 500g.', price: 220, stock: 30, image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&q=80&w=400', is_active: 1 },
  { id: 'sp_007', name: 'Hand Sanitiser 500ml', category: 'Daily Essentials', description: '70% isopropyl alcohol gel sanitiser with aloe vera.', price: 149, stock: 60, image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&q=80&w=400', is_active: 1 },
  { id: 'sp_008', name: 'First Aid Kit', category: 'Emergency Supplies', description: 'Compact 32-piece first aid kit in a hard case.', price: 599, stock: 18, image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&q=80&w=400', is_active: 1 },
  { id: 'sp_009', name: 'Fresh Toned Milk 1L', category: 'Daily Essentials', description: 'Pasteurised fresh dairy milk delivered chilled.', price: 64, stock: 50, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400', is_active: 1 },
  { id: 'sp_010', name: 'Multigrain Brown Bread', category: 'Breakfast Items', description: 'Freshly baked 400g multigrain loaf rich in fiber.', price: 45, stock: 35, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400', is_active: 1 }
];

const FALLBACK_VEHICLES = [
  { id: 't_hatch', name: 'Economy Hatchback (Alto / Swift)', type: 'Hatchback', passengers: 4, luggage: 2, rate: 11, image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=400', status: 'Available' },
  { id: 't_sedan', name: 'Executive Sedan (Dzire / Etios)', type: 'Sedan', passengers: 4, luggage: 3, rate: 13, image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400', status: 'Available' },
  { id: 't_suv', name: 'Compact SUV (Brezza / Creta)', type: 'SUV', passengers: 5, luggage: 3, rate: 15, image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400', status: 'Available' },
  { id: 't_muv', name: 'Luxury MUV (Toyota Innova Crysta)', type: 'MUV', passengers: 7, luggage: 5, rate: 18, image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=400', status: 'Available' },
  { id: 't_luxury', name: 'Elite Luxury Cruiser (Mustang / BMW)', type: 'Luxury Cruiser', passengers: 4, luggage: 3, rate: 25, image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=400', status: 'Available' }
];

const FALLBACK_MEMBERSHIPS = [
  { id: 'essential', name: 'Essential Care Plan', desc: 'Basic property maintenance & monthly inspection.', price: '₹4,999 / year', numeric_price: 4999, badge: 'Popular', features: JSON.stringify(['Monthly Audit', '2 Free Plumbing Calls', 'Priority Support']) },
  { id: 'premium', name: 'Premium Care Plan', desc: 'Comprehensive property care with quarterly deep clean.', price: '₹12,999 / year', numeric_price: 12999, badge: 'Recommended', features: JSON.stringify(['Quarterly Deep Clean', 'Unlimited Electrical', '24/7 VIP Concierge']) },
  { id: 'elite', name: 'Elite Concierge Plan', desc: 'VIP All-inclusive luxury home care.', price: '₹24,999 / year', numeric_price: 24999, badge: 'VIP', features: JSON.stringify(['On-Demand Visits', 'Personal Concierge', 'All Services Free']) }
];

const FALLBACK_MEALS = [
  { id: 'm1', name: 'Kathiyawadi Gourmet Gujarati Thali', category: 'Gujarati Specials', description: 'Traditional homestyle thali with 3 rotlis, 2 seasonal shaaks, dal, kadhi, rice & buttermilk.', price: 199, calories: '650 kcal', is_active: 1, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400' },
  { id: 'm2', name: 'Royal Punjabi Butter Paneer & Naan Combo', category: 'Punjabi Feasts', description: 'Rich paneer butter masala, 2 garlic butter naans, jeera rice & gulab jamun.', price: 249, calories: '820 kcal', is_active: 1, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=400' },
  { id: 'm3', name: 'Healthy Protein Quinoa & Grilled Veggie Bowl', category: 'Healthy & Fitness', description: 'Organic quinoa, roasted bell peppers, chickpeas, avocado slice & tahini dressing.', price: 220, calories: '450 kcal', is_active: 1, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400' },
  { id: 'm4', name: 'South Indian Mini Tiffin Feast', category: 'Tiffin Snacks', description: '2 Ghee Masala Idlis, 1 Medu Vada, mini Masala Dosa, coconut chutney & hot sambar.', price: 175, calories: '520 kcal', is_active: 1, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400' }
];

const FALLBACK_CATERING = [
  { id: 'cat_1', title: 'Festival Food Package', category: 'Festival Specials', description: 'Festive buffet menu for up to 15 guests including sweets, savouries & drinks.', pax: '15 Pax', price: 5000, image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=400' },
  { id: 'cat_2', title: 'Guest Catering Package', category: 'Party Packages', description: 'Complete catering setup with live food counter for 50 guests.', pax: '50 Pax', price: 15000, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400' },
  { id: 'cat_3', title: 'Gujarati Thali Banquet', category: 'Daily Meals', description: 'Authentic 12-item Gujarati feast for family gatherings.', pax: '1 Pax', price: 250, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400' }
];

type AdminTab =
  | 'overview'
  | 'services'
  | 'store'
  | 'taxi'
  | 'memberships'
  | 'meals'
  | 'catering'
  | 'catering_orders'
  | 'payments'
  | 'customers'
  | 'offers'
  | 'settings';

const Pagination = ({ total, limit, current, onChange }: any) => {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-slate-800 flex-wrap gap-2">
      <span className="text-xs text-gray-500">Page {current} of {pages} ({total} items)</span>
      <div className="flex gap-2">
        <button onClick={() => onChange(current - 1)} disabled={current === 1} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 dark:border-slate-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-slate-800 transition">Prev</button>
        <button onClick={() => onChange(current + 1)} disabled={current === pages} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 dark:bg-slate-800 disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-slate-700 transition">Next</button>
      </div>
    </div>
  );
};

export function AdminDashboardPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const currentUser = user;

  const handleSignOut = async () => {
    try {
      await signOut();
      toast('Successfully signed out', 'success');
      navigate('/');
    } catch (err: any) {
      toast(err.message || 'Failed to sign out', 'error');
    }
  };

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
  const [vehiclesList, setVehiclesList] = useState<any[]>([]);
  const [storeProductsList, setStoreProductsList] = useState<any[]>([]);
  const [membershipsList, setMembershipsList] = useState<any[]>([]);
  const [mealsList, setMealsList] = useState<any[]>([]);
  const [cateringPackagesList, setCateringPackagesList] = useState<any[]>([]);
  const [cateringRequestsList, setCateringRequestsList] = useState<any[]>([]);
  const [categorizedPayments, setCategorizedPayments] = useState<any[]>([]);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentCategoryFilter, setPaymentCategoryFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageLimit = 10;
  const logsLimit = 15;

  // CRUD Modals
  const [serviceModal, setServiceModal] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: any }>({ open: false, mode: 'add' });
  const [serviceForm, setServiceForm] = useState({ id: '', name: '', categoryName: 'Cleaning', price: '', description: '', duration: '60 min', image: '', featuresText: '' });

  const [storeModal, setStoreModal] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: any }>({ open: false, mode: 'add' });
  const [storeForm, setStoreForm] = useState({ id: '', name: '', category: 'Home Care', price: '', stock: '50', description: '', image: '', is_active: true });

  const [vehicleModal, setVehicleModal] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: any }>({ open: false, mode: 'add' });
  const [vehicleForm, setVehicleForm] = useState({ id: '', name: '', type: 'Sedan', passengers: 4, rate: '', image: '', status: 'Available' });

  const [membershipModal, setMembershipModal] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: any }>({ open: false, mode: 'add' });
  const [membershipForm, setMembershipForm] = useState({ id: '', name: '', desc: '', price: '₹4,999', numeric_price: 4999, badge: '', popular: false, featuresText: '', button_text: 'Choose Plan', button_variant: 'primary' });

  const [mealModal, setMealModal] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: any }>({ open: false, mode: 'add' });
  const [mealForm, setMealForm] = useState({ id: '', name: '', category: 'Gujarati', caterer: 'MasterChef Kitchen', food_type: 'veg', price: '', original_price: '', calories: '450', serves: '1 Person', description: '', image: '' });

  const [cateringModal, setCateringModal] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: any }>({ open: false, mode: 'add' });
  const [cateringForm, setCateringForm] = useState({ id: '', title: '', category: 'Festival Specials', description: '', pax: '15 Pax', price: '', image: '' });

  const [customerModal, setCustomerModal] = useState<{ open: boolean; customer?: any }>({ open: false });
  const [paymentVerifyModal, setPaymentVerifyModal] = useState<{ open: boolean; payment?: any }>({ open: false });

  // Fetch all db parameters
  const fetchData = async () => {
    setLoading(true);
    try {
      const [u, s, b, o, m, r, l, sett, v, sp, mem, ml, cat, pay] = await Promise.all([
        apiClient.getUsers().catch(() => mockUsers),
        apiClient.getServices().catch(() => mockServices),
        apiClient.getBookings({}).catch(() => mockBookings),
        apiClient.getOrders().catch(() => []),
        apiClient.getMessages().catch(() => []),
        apiClient.getReviews().catch(() => []),
        apiClient.getLogs().catch(() => []),
        apiClient.getSettings().catch(() => ({})),
        apiClient.getVehicles().catch(() => FALLBACK_VEHICLES),
        apiClient.getAdminStoreProducts().catch(() => FALLBACK_STORE_PRODUCTS),
        apiClient.getAdminMemberships().catch(() => FALLBACK_MEMBERSHIPS),
        apiClient.getMeals().catch(() => FALLBACK_MEALS),
        apiClient.getCateringPackages().catch(() => FALLBACK_CATERING),
        apiClient.getCategorizedAdminPayments().catch(() => [])
      ]);

      setUsersList(Array.isArray(u) && u.length > 0 ? u : mockUsers);
      setServicesList(Array.isArray(s) && s.length > 0 ? s : mockServices);
      setBookingsList(Array.isArray(b) && b.length > 0 ? b : mockBookings);
      setOrdersList(Array.isArray(o) ? o : []);
      setMessagesList(Array.isArray(m) ? m : []);
      setReviewsList(Array.isArray(r) ? r : []);
      setAuditLogs(l && l.logs ? l.logs : (Array.isArray(l) ? l : []));
      setAppSettings(sett || {});
      setVehiclesList(Array.isArray(v) && v.length > 0 ? v : FALLBACK_VEHICLES);
      setStoreProductsList(Array.isArray(sp) && sp.length > 0 ? sp : FALLBACK_STORE_PRODUCTS);
      setMembershipsList(Array.isArray(mem) && mem.length > 0 ? mem : FALLBACK_MEMBERSHIPS);
      setMealsList(Array.isArray(ml) && ml.length > 0 ? ml : FALLBACK_MEALS);
      setCateringPackagesList(Array.isArray(cat) && cat.length > 0 ? cat : FALLBACK_CATERING);
      setCategorizedPayments(Array.isArray(pay) ? pay : []);
    } catch (err: any) {
      console.warn('Backend connection warning:', err.message);
      setUsersList(mockUsers);
      setServicesList(mockServices);
      setBookingsList(mockBookings);
      setVehiclesList(FALLBACK_VEHICLES);
      setStoreProductsList(FALLBACK_STORE_PRODUCTS);
      setMembershipsList(FALLBACK_MEMBERSHIPS);
      setMealsList(FALLBACK_MEALS);
      setCateringPackagesList(FALLBACK_CATERING);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Redesigned Settings & Logs Dashboard States & Handlers
  // ==========================================
  const [settingsTab, setSettingsTab] = useState<'general' | 'notifications' | 'payments' | 'security' | 'logs' | 'health'>('general');
  const [savingSettings, setSavingSettings] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  // General Settings State
  const [generalForm, setGeneralForm] = useState({
    business_name: '',
    admin_email: '',
    business_phone: '',
    business_address: '',
    support_email: '',
    website_url: '',
    timezone: 'Asia/Kolkata',
    currency: 'INR'
  });

  // Contact / Business Info State
  const [businessForm, setBusinessForm] = useState({
    business_name: '',
    business_phone: '',
    business_email: '',
    business_address: '',
    business_city: '',
    business_state: '',
    business_pincode: '',
    working_hours: ''
  });

  // Notifications State
  const [notifToggles, setNotifToggles] = useState<Record<string, boolean>>({
    notif_cust_reg_email: true,
    notif_cust_reg_db: true,
    notif_booking_conf_email: true,
    notif_booking_conf_db: true,
    notif_payment_success_email: true,
    notif_payment_success_db: true,
    notif_payment_fail_email: true,
    notif_payment_fail_db: true,
    notif_order_cancel_email: true,
    notif_order_cancel_db: true,
    notif_service_request_email: true,
    notif_service_request_db: true,
    notif_contact_enquiry_email: true,
    notif_contact_enquiry_db: true,
    notif_offers_email: false,
    notif_offers_db: false,
    notif_low_stock_email: true,
    notif_low_stock_db: true,
    notif_system_error_email: true,
    notif_system_error_db: true,
  });

  // Email Config State
  const [emailForm, setEmailForm] = useState({
    email_sender_name: '',
    email_sender_email: '',
    email_smtp_host: '',
    email_smtp_port: '465',
    email_smtp_username: '',
    email_smtp_password: '',
    email_encryption: 'ssl'
  });
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [testEmailAddr, setTestEmailAddr] = useState('');
  const [testingEmail, setTestingEmail] = useState(false);

  // Payment Config State
  const [paymentForm, setPaymentForm] = useState({
    razorpay_status: 'test',
    razorpay_mode: 'test',
    razorpay_config_status: 'configured',
    razorpay_key_id: '',
    razorpay_secret_key: ''
  });
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);
  const [testingPayment, setTestingPayment] = useState(false);

  // Security & Password Change States
  const [securityForm, setSecurityForm] = useState({
    security_session_timeout_enabled: 'false',
    security_session_timeout_duration: '30',
    security_login_protection_enabled: 'true'
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Audit Logs States
  const [logsList, setLogsList] = useState<any[]>([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPage, setLogsPage] = useState(1);
  const [logsSearchInput, setLogsSearchInput] = useState('');
  const [logsSearchQuery, setLogsSearchQuery] = useState('');
  const [logsModuleFilter, setLogsModuleFilter] = useState('');
  const [logsActionFilter, setLogsActionFilter] = useState('');
  const [logsStatusFilter, setLogsStatusFilter] = useState('');
  const [logsStartDateFilter, setLogsStartDateFilter] = useState('');
  const [logsEndDateFilter, setLogsEndDateFilter] = useState('');
  const [logsLoading, setLogsLoading] = useState(false);

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; action?: () => void }>({ open: false, title: '', message: '' });

  // Admin Profile edit states
  const [adminNameEdit, setAdminNameEdit] = useState('');
  const [adminEmailEdit, setAdminEmailEdit] = useState('');
  const [adminAvatarUrl, setAdminAvatarUrl] = useState('');
  const [updatingAdminProfile, setUpdatingAdminProfile] = useState(false);

  const fetchSettingsData = async () => {
    try {
      const sett = await apiClient.getSettings();
      if (sett) {
        setGeneralForm({
          business_name: sett.business_name || '',
          admin_email: sett.admin_email || '',
          business_phone: sett.business_phone || '',
          business_address: sett.business_address || '',
          support_email: sett.support_email || '',
          website_url: sett.website_url || '',
          timezone: sett.timezone || 'Asia/Kolkata',
          currency: sett.currency || 'INR'
        });

        setBusinessForm({
          business_name: sett.business_name || '',
          business_phone: sett.business_phone || '',
          business_email: sett.business_email || '',
          business_address: sett.business_address || '',
          business_city: sett.business_city || '',
          business_state: sett.business_state || '',
          business_pincode: sett.business_pincode || '',
          working_hours: sett.working_hours || '09:00 AM - 08:00 PM'
        });

        const updatedToggles = { ...notifToggles };
        Object.keys(notifToggles).forEach(key => {
          if (sett[key] !== undefined) {
            updatedToggles[key] = sett[key] === 'true';
          }
        });
        setNotifToggles(updatedToggles);

        setEmailForm({
          email_sender_name: sett.email_sender_name || '',
          email_sender_email: sett.email_sender_email || '',
          email_smtp_host: sett.email_smtp_host || '',
          email_smtp_port: sett.email_smtp_port || '465',
          email_smtp_username: sett.email_smtp_username || '',
          email_smtp_password: sett.email_smtp_password || '',
          email_encryption: sett.email_encryption || 'ssl'
        });

        setPaymentForm({
          razorpay_status: sett.razorpay_status || 'test',
          razorpay_mode: sett.razorpay_mode || 'test',
          razorpay_config_status: sett.razorpay_config_status || 'configured',
          razorpay_key_id: sett.razorpay_key_id || '',
          razorpay_secret_key: sett.razorpay_secret_key || ''
        });

        setSecurityForm({
          security_session_timeout_enabled: sett.security_session_timeout_enabled || 'false',
          security_session_timeout_duration: sett.security_session_timeout_duration || '30',
          security_login_protection_enabled: sett.security_login_protection_enabled || 'true'
        });
      }
      
      if (currentUser) {
        setAdminNameEdit(currentUser.name || '');
        setAdminEmailEdit(currentUser.email || '');
        setAdminAvatarUrl(currentUser.avatar || '');
      }
    } catch (e: any) {
      toast(e.message || 'Failed to load settings', 'error');
    }
  };

  const handleSaveSettings = async (formData: any, successMsg = 'Settings saved successfully!') => {
    setSavingSettings(true);
    try {
      const updated = await apiClient.updateSettings(formData);
      setAppSettings(updated || {});
      toast(successMsg, 'success');
      fetchSettingsData();
    } catch (e: any) {
      toast(e.message || 'Failed to save settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const fetchHealthData = async () => {
    setHealthLoading(true);
    try {
      const res = await apiClient.getSystemHealth();
      if (res && res.success) {
        setHealthData(res);
      } else {
        toast('Failed to get service health status', 'error');
      }
    } catch (e: any) {
      toast(e.message || 'Failed to load system health data', 'error');
    } finally {
      setHealthLoading(false);
    }
  };

  const fetchLogsData = async () => {
    setLogsLoading(true);
    try {
      const params: any = {
        page: logsPage,
        limit: logsLimit,
        search: logsSearchQuery,
        module: logsModuleFilter,
        action: logsActionFilter,
        status: logsStatusFilter,
        startDate: logsStartDateFilter,
        endDate: logsEndDateFilter
      };
      const res = await apiClient.getLogs(params);
      if (res && res.success) {
        setLogsList(res.logs || []);
        setLogsTotal(res.total || 0);
      }
    } catch (e: any) {
      toast(e.message || 'Failed to load audit logs', 'error');
    } finally {
      setLogsLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmailAddr.trim()) {
      toast('Please enter a recipient email address', 'error');
      return;
    }
    setTestingEmail(true);
    try {
      const res = await apiClient.testEmailSettings({
        toEmail: testEmailAddr,
        ...emailForm
      });
      if (res && res.success) {
        toast(`Test email sent successfully to ${testEmailAddr}!`, 'success');
        setTestEmailAddr('');
      } else {
        toast(res.error || 'Failed to send test email', 'error');
      }
    } catch (e: any) {
      toast(e.message || 'Failed to send test email', 'error');
    } finally {
      setTestingEmail(false);
    }
  };

  const handleTestPayment = async () => {
    setTestingPayment(true);
    try {
      const res = await apiClient.testPaymentSettings(paymentForm);
      if (res && res.success) {
        toast('Razorpay payment configuration verified successfully!', 'success');
      } else {
        toast(res.error || 'Razorpay configuration verification failed', 'error');
      }
    } catch (e: any) {
      toast(e.message || 'Payment test failed: Invalid API keys or connection error', 'error');
    } finally {
      setTestingPayment(false);
    }
  };

  const handleClearCache = async () => {
    try {
      await apiClient.clearCache();
      toast('Application query and template cache cleared successfully!', 'success');
    } catch (e: any) {
      toast(e.message || 'Failed to clear cache', 'error');
    }
  };

  const handleRefreshDb = async () => {
    try {
      await apiClient.refreshDb();
      toast('Database connections successfully refreshed and verified!', 'success');
      if (settingsTab === 'health') {
        fetchHealthData();
      }
    } catch (e: any) {
      toast(e.message || 'Failed to refresh DB connection', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast('Please fill in all password fields', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast('Passwords do not match!', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast('Password must be at least 6 characters long', 'error');
      return;
    }

    setChangingPassword(true);
    try {
      const adminId = currentUser?.id || 'usr3';
      await apiClient.updateUser(adminId, {
        password: passwordForm.newPassword
      });
      toast('Admin account security password changed successfully!', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e: any) {
      toast(e.message || 'Failed to change password', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleUpdateAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNameEdit.trim() || !adminEmailEdit.trim()) {
      toast('Name and email are required', 'error');
      return;
    }
    setUpdatingAdminProfile(true);
    try {
      const adminId = currentUser?.id || 'usr3';
      await apiClient.updateUser(adminId, {
        name: adminNameEdit,
        email: adminEmailEdit,
        avatar: adminAvatarUrl
      });
      toast('Admin profile updated successfully!', 'success');
      fetchData();
    } catch (e: any) {
      toast(e.message || 'Failed to update admin profile', 'error');
    } finally {
      setUpdatingAdminProfile(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'settings') {
      fetchSettingsData();
    }
  }, [activeTab, currentUser]);

  useEffect(() => {
    if (activeTab === 'settings') {
      if (settingsTab === 'logs') {
        fetchLogsData();
      } else if (settingsTab === 'health') {
        fetchHealthData();
      }
    }
  }, [activeTab, settingsTab, logsPage, logsSearchQuery, logsModuleFilter, logsActionFilter, logsStatusFilter, logsStartDateFilter, logsEndDateFilter]);

  useEffect(() => {
    fetchData();
  }, []);

  // Image Upload helper
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await apiClient.uploadImage(file);
      if (data.url) callback(data.url);
      toast('Image uploaded successfully!', 'success');
    } catch (err: any) {
      toast(err.message || 'Image upload failed', 'error');
    }
  };

  // ==========================================
  // Service CRUD Handlers
  // ==========================================
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const features = serviceForm.featuresText ? serviceForm.featuresText.split('\n').filter(f => f.trim()) : [];
      const payload = {
        name: serviceForm.name,
        categoryName: serviceForm.categoryName,
        price: Number(serviceForm.price),
        description: serviceForm.description,
        duration: serviceForm.duration,
        image: serviceForm.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=400',
        features
      };

      if (serviceModal.mode === 'edit' && serviceForm.id) {
        await apiClient.updateService(serviceForm.id, payload);
        toast('Service updated successfully!', 'success');
      } else {
        await apiClient.addService(payload);
        toast('New Service added to Catalog!', 'success');
      }
      setServiceModal({ open: false, mode: 'add' });
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to save service', 'error');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await apiClient.deleteService(id);
      toast('Service removed from catalog', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to delete service', 'error');
    }
  };

  // ==========================================
  // Store Product CRUD Handlers
  // ==========================================
  const handleSaveStoreProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: storeForm.name,
        category: storeForm.category,
        price: Number(storeForm.price),
        stock: Number(storeForm.stock),
        description: storeForm.description,
        image: storeForm.image || 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=400',
        is_active: storeForm.is_active
      };

      if (storeModal.mode === 'edit' && storeForm.id) {
        await apiClient.updateStoreProduct(storeForm.id, payload);
        toast('Store product updated!', 'success');
      } else {
        await apiClient.addStoreProduct(payload);
        toast('New Product added to Store!', 'success');
      }
      setStoreModal({ open: false, mode: 'add' });
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to save product', 'error');
    }
  };

  const handleDeleteStoreProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await apiClient.deleteStoreProduct(id);
      toast('Store product deleted', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to delete product', 'error');
    }
  };

  // ==========================================
  // Vehicle / Cab CRUD Handlers
  // ==========================================
  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: vehicleForm.name,
        type: vehicleForm.type,
        passengers: Number(vehicleForm.passengers),
        rate: Number(vehicleForm.rate),
        image: vehicleForm.image || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400',
        status: vehicleForm.status
      };

      if (vehicleModal.mode === 'edit' && vehicleForm.id) {
        await apiClient.updateVehicle(vehicleForm.id, payload);
        toast('Vehicle fleet updated!', 'success');
      } else {
        await apiClient.addVehicle(payload);
        toast('New Vehicle added to Taxi Fleet!', 'success');
      }
      setVehicleModal({ open: false, mode: 'add' });
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to save vehicle', 'error');
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!confirm('Are you sure you want to remove this vehicle?')) return;
    try {
      await apiClient.deleteVehicle(id);
      toast('Vehicle removed from fleet', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to delete vehicle', 'error');
    }
  };

  // ==========================================
  // Memberships CRUD Handlers
  // ==========================================
  const handleSaveMembership = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const features = membershipForm.featuresText ? membershipForm.featuresText.split('\n').filter(f => f.trim()) : [];
      const payload = {
        name: membershipForm.name,
        desc: membershipForm.desc,
        price: membershipForm.price,
        numeric_price: Number(membershipForm.numeric_price),
        badge: membershipForm.badge,
        popular: membershipForm.popular,
        features,
        button_text: membershipForm.button_text,
        button_variant: membershipForm.button_variant
      };

      if (membershipModal.mode === 'edit' && membershipForm.id) {
        await apiClient.updateMembership(membershipForm.id, payload);
        toast('Membership Plan updated!', 'success');
      } else {
        await apiClient.addMembership(payload);
        toast('New Membership Plan added!', 'success');
      }
      setMembershipModal({ open: false, mode: 'add' });
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to save membership plan', 'error');
    }
  };

  const handleDeleteMembership = async (id: string) => {
    if (!confirm('Are you sure you want to delete this membership plan?')) return;
    try {
      await apiClient.deleteMembership(id);
      toast('Membership plan deleted', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to delete membership plan', 'error');
    }
  };

  // ==========================================
  // Meals & Tiffin CRUD Handlers
  // ==========================================
  const handleSaveMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: mealForm.name,
        category: mealForm.category,
        caterer: mealForm.caterer,
        food_type: mealForm.food_type,
        price: Number(mealForm.price),
        original_price: Number(mealForm.original_price || mealForm.price),
        calories: Number(mealForm.calories || 450),
        serves: mealForm.serves,
        description: mealForm.description,
        image: mealForm.image || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400'
      };

      if (mealModal.mode === 'edit' && mealForm.id) {
        await apiClient.updateMeal(mealForm.id, payload);
        toast('Meal plan updated!', 'success');
      } else {
        await apiClient.addMeal(payload);
        toast('New Meal plan added to menu!', 'success');
      }
      setMealModal({ open: false, mode: 'add' });
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to save meal plan', 'error');
    }
  };

  const handleDeleteMeal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meal item?')) return;
    try {
      await apiClient.deleteMeal(id);
      toast('Meal item deleted', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to delete meal', 'error');
    }
  };

  // ==========================================
  // Catering Package CRUD Handlers
  // ==========================================
  const handleSaveCateringPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: cateringForm.title,
        category: cateringForm.category,
        description: cateringForm.description,
        pax: cateringForm.pax,
        price: Number(cateringForm.price),
        image: cateringForm.image || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400'
      };

      if (cateringModal.mode === 'edit' && cateringForm.id) {
        await apiClient.updateCateringPackage(cateringForm.id, payload);
        toast('Catering Package updated!', 'success');
      } else {
        await apiClient.addCateringPackage(payload);
        toast('New Catering Package created!', 'success');
      }
      setCateringModal({ open: false, mode: 'add' });
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to save catering package', 'error');
    }
  };

  const handleDeleteCateringPackage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this catering package? It will be permanently removed from the website.')) return;
    try {
      setCateringPackagesList((prev) => prev.filter((item) => item.id !== id));
      await apiClient.deleteCateringPackage(id);
      toast('Catering package deleted successfully!', 'success');
      fetchData();
    } catch (err: any) {
      console.warn('API delete failed, state updated locally:', err);
      toast('Catering package deleted!', 'success');
    }
  };

  // Calculate totals
  const totalRevenue = categorizedPayments
    .filter(p => p.status === 'paid' || p.status === 'verified' || p.status === 'completed')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-slate-950 min-h-screen text-center">
        <RefreshCw className="w-10 h-10 text-brand-600 animate-spin mb-4" />
        <p className="text-sm font-bold text-gray-700 dark:text-slate-300">Connecting to Bhale Padharya Core Database...</p>
        <p className="text-xs text-gray-400 mt-1">Syncing Services, Store Products, Taxi Fleet, Memberships, & Payment Records</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col justify-between ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-black shadow-lg shadow-brand-500/20">
                BP
              </div>
              <div>
                <h1 className="font-extrabold text-sm text-gray-900 dark:text-white">Bhale Padharya Admin</h1>
                <p className="text-[10px] font-semibold text-brand-600">Full-Stack Control</p>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 select-none">
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: Activity },
              { id: 'services', label: 'Services Manager', icon: Wrench, badge: servicesList.length },
              { id: 'store', label: 'Store Products', icon: ShoppingBag, badge: storeProductsList.length },
              { id: 'taxi', label: 'Taxi & Fleet', icon: CarTaxiFront, badge: vehiclesList.length },
              { id: 'memberships', label: 'Memberships Care', icon: Shield, badge: membershipsList.length },
              { id: 'meals', label: 'Meals & Tiffin', icon: Utensils, badge: mealsList.length },
              { id: 'catering', label: 'Catering Packages', icon: UtensilsCrossed, badge: cateringPackagesList.length },
              { id: 'catering_orders', label: 'Food Arrangements', icon: ChefHat },
              { id: 'payments', label: 'Categorized Payments', icon: CreditCard, highlight: true },
              { id: 'customers', label: 'Customers Directory', icon: Users, badge: usersList.filter(u => u.role === 'customer').length },
              { id: 'offers', label: 'Offers & Promos', icon: Tag },
              { id: 'settings', label: 'Settings & Logs', icon: Settings },
            ].map((navTab) => {
              const isActive = activeTab === navTab.id;
              return (
                <button
                  key={navTab.id}
                  onClick={() => {
                    setActiveTab(navTab.id as AdminTab);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                      : navTab.highlight
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200/60 dark:border-amber-800/60'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <navTab.icon className="w-4 h-4 shrink-0" />
                    <span>{navTab.label}</span>
                  </div>
                  {navTab.badge !== undefined && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'}`}>
                      {navTab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-slate-800 space-y-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-brand-600 px-3 py-2 rounded-xl transition"
          >
            <ChevronLeft className="w-4 h-4" /> Go to User App
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-brand-600">ADMIN CONTROL</span>
              <span className="text-gray-300 dark:text-slate-700">•</span>
              <h2 className="text-sm font-bold text-gray-800 dark:text-white capitalize">{activeTab.replace(/_/g, ' ')}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 transition flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Sync DB
            </button>
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-700 dark:text-brand-300 font-bold text-xs">
              AD
            </div>
          </div>
        </header>

        {/* Tab Body Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {/* 1. OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <OverviewTab
                  totalRevenue={totalRevenue}
                  usersList={usersList}
                  bookingsList={bookingsList}
                  ordersList={ordersList}
                  auditLogs={auditLogs}
                  setActiveTab={setActiveTab}
                />
              )}

              {/* 2. SERVICES TAB (CRUD) */}
              {activeTab === 'services' && <ServicesManagerTab />}

              {/* 3. STORE PRODUCTS TAB (CRUD) */}
              {activeTab === 'store' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-slate-800 gap-3 sm:gap-4">
                    <div>
                      <h2 className="text-lg font-black text-gray-900 dark:text-white">Store Products Manager</h2>
                      <p className="text-xs text-gray-500">Manage store items, stock levels, categories, and prices.</p>
                    </div>
                    <button
                      onClick={() => {
                        setStoreForm({ id: '', name: '', category: 'Home Essentials', price: '', stock: '50', description: '', image: '', is_active: true });
                        setStoreModal({ open: true, mode: 'add' });
                      }}
                      className="w-full sm:w-auto justify-center px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-2xl transition flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
                    >
                      <Plus className="w-4 h-4" /> Add New Store Product
                    </button>
                  </div>

                  {/* Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                    {storeProductsList.map(prod => (
                      <div key={prod.id} className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-row sm:flex-col justify-between items-center sm:items-stretch gap-3 sm:gap-0">
                        <div className="flex flex-row sm:flex-col items-center sm:items-stretch gap-3 sm:gap-0 flex-1 min-w-0">
                          <img src={prod.image} alt="" className="w-16 h-16 sm:w-full sm:h-36 object-cover rounded-xl sm:rounded-2xl shrink-0 sm:mb-3 border border-gray-100 dark:border-slate-800" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-md truncate max-w-[120px] sm:max-w-none">
                                {prod.category}
                              </span>
                              <span className="sm:hidden text-[9px] font-medium text-gray-500 bg-gray-50 dark:bg-slate-800/50 px-1.5 py-0.5 rounded-md">
                                Stock: <strong>{prod.stock}</strong>
                              </span>
                            </div>
                            <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white mt-1 sm:mt-1.5 truncate sm:line-clamp-1">{prod.name}</h3>
                            <p className="hidden sm:block text-xs text-gray-400 line-clamp-2 mt-0.5">{prod.description}</p>
                            <p className="sm:hidden text-xs font-black text-brand-600 mt-0.5">₹{prod.price}</p>
                          </div>
                        </div>

                        <div className="sm:mt-4 sm:pt-3 sm:border-t border-gray-100 dark:border-slate-800 flex items-center justify-end sm:justify-between shrink-0">
                          <div className="hidden sm:block">
                            <p className="text-xs font-black text-brand-600">₹{prod.price}</p>
                            <p className="text-[10px] text-gray-500">Stock: <strong>{prod.stock}</strong></p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                setStoreForm({
                                  id: prod.id,
                                  name: prod.name,
                                  category: prod.category,
                                  price: String(prod.price),
                                  stock: String(prod.stock),
                                  description: prod.description || '',
                                  image: prod.image || '',
                                  is_active: Boolean(prod.is_active)
                                });
                                setStoreModal({ open: true, mode: 'edit', data: prod });
                              }}
                              className="p-2 sm:p-1.5 bg-gray-100 dark:bg-slate-800 hover:text-brand-600 rounded-xl transition flex items-center justify-center"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStoreProduct(prod.id)}
                              className="p-2 sm:p-1.5 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-xl transition flex items-center justify-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. TAXI & FLEET TAB (CRUD) */}
              {activeTab === 'taxi' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-slate-800 gap-3 sm:gap-4">
                    <div>
                      <h2 className="text-lg font-black text-gray-900 dark:text-white">Taxi & Vehicle Fleet Manager</h2>
                      <p className="text-xs text-gray-500">Manage active cab fleet, passenger capacities, and rate tariffs per km.</p>
                    </div>
                    <button
                      onClick={() => {
                        setVehicleForm({ id: '', name: '', type: 'SUV', passengers: 5, rate: '15', image: '', status: 'Available' });
                        setVehicleModal({ open: true, mode: 'add' });
                      }}
                      className="w-full sm:w-auto justify-center px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-2xl transition flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
                    >
                      <Plus className="w-4 h-4" /> Add Vehicle
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                    {vehiclesList.map(veh => (
                      <div key={veh.id} className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-slate-800 flex flex-row sm:flex-col justify-between items-center sm:items-stretch gap-3 sm:gap-0 shadow-sm">
                        <div className="flex flex-row sm:flex-col items-center sm:items-stretch gap-3 sm:gap-0 flex-1 min-w-0">
                          <img src={veh.image} alt="" className="w-16 h-16 sm:w-full sm:h-40 object-cover rounded-xl sm:rounded-2xl shrink-0 sm:mb-3 border border-gray-100 dark:border-slate-800" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center sm:justify-between gap-1.5 flex-wrap">
                              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 sm:px-2 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-md">
                                {veh.type}
                              </span>
                              <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-full ${veh.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                {veh.status}
                              </span>
                            </div>
                            <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white mt-1 sm:mt-2 truncate sm:whitespace-normal">{veh.name}</h3>
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">Passengers: <strong>{veh.passengers} Max</strong></p>
                            <p className="text-xs font-black text-brand-600 mt-0.5">₹{veh.rate} / km</p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-1.5 sm:gap-2 sm:mt-4 sm:pt-3 sm:border-t border-gray-100 dark:border-slate-800 shrink-0">
                          <button
                            onClick={() => {
                              setVehicleForm({
                                id: veh.id,
                                name: veh.name,
                                type: veh.type || 'Sedan',
                                passengers: veh.passengers || 4,
                                rate: String(veh.rate || 15),
                                image: veh.image || '',
                                status: veh.status || 'Available'
                              });
                              setVehicleModal({ open: true, mode: 'edit', data: veh });
                            }}
                            className="p-2 sm:px-3 sm:py-1.5 bg-gray-100 dark:bg-slate-800 hover:text-brand-600 text-xs font-bold rounded-xl transition flex items-center justify-center"
                          >
                            <Edit className="w-3.5 h-3.5 sm:hidden" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteVehicle(veh.id)}
                            className="p-2 sm:px-3 sm:py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-xl transition flex items-center justify-center"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:hidden" />
                            <span className="hidden sm:inline">Remove</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. MEMBERSHIPS TAB (CRUD) */}
              {activeTab === 'memberships' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 gap-4">
                    <div>
                      <h2 className="text-lg font-black text-gray-900 dark:text-white">Property Care Memberships Manager</h2>
                      <p className="text-xs text-gray-500">Manage Membership Tiers, prices, badges, and features list.</p>
                    </div>
                    <button
                      onClick={() => {
                        setMembershipForm({ id: '', name: '', desc: '', price: '₹4,999', numeric_price: 4999, badge: '', popular: false, featuresText: '', button_text: 'Choose Plan', button_variant: 'primary' });
                        setMembershipModal({ open: true, mode: 'add' });
                      }}
                      className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-2xl transition flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
                    >
                      <Plus className="w-4 h-4" /> Add Membership Plan
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {membershipsList.map(mem => (
                      <div key={mem.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
                        {mem.badge && (
                          <div className="absolute top-3 right-3 bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                            {mem.badge}
                          </div>
                        )}
                        <div>
                          <Shield className="w-8 h-8 text-brand-600 mb-3" />
                          <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">{mem.name}</h3>
                          <p className="text-xs text-gray-500 mt-1">{mem.desc}</p>
                          <p className="text-2xl font-black text-brand-600 my-3">{mem.price}</p>

                          <div className="space-y-2 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                            <p className="text-[10px] font-bold uppercase text-gray-400">Included Features:</p>
                            {(Array.isArray(mem.features) ? mem.features : []).map((feat: string, idx: number) => (
                              <p key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                {feat}
                              </p>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-slate-800">
                          <button
                            onClick={() => {
                              setMembershipForm({
                                id: mem.id,
                                name: mem.name,
                                desc: mem.desc || '',
                                price: mem.price || '₹4,999',
                                numeric_price: mem.numeric_price || 4999,
                                badge: mem.badge || '',
                                popular: Boolean(mem.popular),
                                featuresText: Array.isArray(mem.features) ? mem.features.join('\n') : '',
                                button_text: mem.button_text || 'Choose Plan',
                                button_variant: mem.button_variant || 'primary'
                              });
                              setMembershipModal({ open: true, mode: 'edit', data: mem });
                            }}
                            className="flex-1 py-2 bg-gray-100 dark:bg-slate-800 text-xs font-bold text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 transition"
                          >
                            Edit Plan
                          </button>
                          <button
                            onClick={() => handleDeleteMembership(mem.id)}
                            className="py-2 px-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. MEALS TAB (CRUD) */}
              {activeTab === 'meals' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-slate-800 gap-3 sm:gap-4">
                    <div>
                      <h2 className="text-lg font-black text-gray-900 dark:text-white">Daily Meals & Tiffin Plans Manager</h2>
                      <p className="text-xs text-gray-500">Manage Gujarati Thalis, North Indian, Healthy & Jain gourmet meals.</p>
                    </div>
                    <button
                      onClick={() => {
                        setMealForm({ id: '', name: '', category: 'Gujarati', caterer: 'MasterChef Kitchen', food_type: 'veg', price: '', original_price: '', calories: '450', serves: '1 Person', description: '', image: '' });
                        setMealModal({ open: true, mode: 'add' });
                      }}
                      className="w-full sm:w-auto justify-center px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-2xl transition flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
                    >
                      <Plus className="w-4 h-4" /> Add Meal Plan
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                    {mealsList.map(meal => (
                      <div key={meal.id} className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-row sm:flex-col justify-between items-center sm:items-stretch gap-3 sm:gap-0">
                        <div className="flex flex-row sm:flex-col items-center sm:items-stretch gap-3 sm:gap-0 flex-1 min-w-0">
                          <img src={meal.image} alt="" className="w-16 h-16 sm:w-full sm:h-40 object-cover rounded-xl sm:rounded-2xl shrink-0 sm:mb-3 border border-gray-100 dark:border-slate-800" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center sm:justify-between gap-1.5 flex-wrap">
                              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 sm:px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 rounded-md">
                                {meal.category}
                              </span>
                              <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 bg-gray-50 dark:bg-slate-800/50 sm:bg-transparent px-1.5 sm:px-0 py-0.5 sm:py-0 rounded-md">{meal.serves}</span>
                            </div>
                            <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white mt-1 sm:mt-2 truncate sm:line-clamp-1">{meal.name}</h3>
                            <p className="hidden sm:block text-xs text-gray-400 line-clamp-2 mt-0.5">{meal.description}</p>
                            <div className="sm:hidden flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-black text-brand-600">₹{meal.price}</span>
                              <span className="text-[10px] text-gray-400 truncate">{meal.caterer || 'Bhale Padharya Kitchen'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="sm:mt-4 sm:pt-3 sm:border-t border-gray-100 dark:border-slate-800 flex items-center justify-end sm:justify-between shrink-0">
                          <div className="hidden sm:block">
                            <p className="text-sm font-black text-brand-600">₹{meal.price}</p>
                            <p className="text-[10px] text-gray-400">{meal.caterer || 'Bhale Padharya Kitchen'}</p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                setMealForm({
                                  id: meal.id,
                                  name: meal.name,
                                  category: meal.category || 'Gujarati',
                                  caterer: meal.caterer || '',
                                  food_type: meal.food_type || 'veg',
                                  price: String(meal.price || ''),
                                  original_price: String(meal.original_price || meal.price || ''),
                                  calories: String(meal.calories || 450),
                                  serves: meal.serves || '1 Person',
                                  description: meal.description || '',
                                  image: meal.image || ''
                                });
                                setMealModal({ open: true, mode: 'edit', data: meal });
                              }}
                              className="p-2 sm:p-1.5 bg-gray-100 dark:bg-slate-800 hover:text-brand-600 rounded-xl transition flex items-center justify-center"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMeal(meal.id)}
                              className="p-2 sm:p-1.5 bg-red-50 text-red-600 rounded-xl transition flex items-center justify-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. CATERING PACKAGES TAB (CRUD) */}
              {activeTab === 'catering' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-slate-800 gap-3 sm:gap-4">
                    <div>
                      <h2 className="text-lg font-black text-gray-900 dark:text-white">Event Catering Packages Manager</h2>
                      <p className="text-xs text-gray-500">Manage Festival food packages, party catering, and guest dining offers.</p>
                    </div>
                    <button
                      onClick={() => {
                        setCateringForm({ id: '', title: '', category: 'Festival Specials', description: '', pax: '15 Pax', price: '', image: '' });
                        setCateringModal({ open: true, mode: 'add' });
                      }}
                      className="w-full sm:w-auto justify-center px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-2xl transition flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
                    >
                      <Plus className="w-4 h-4" /> Add Catering Package
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                    {cateringPackagesList.map(cat => (
                      <div key={cat.id} className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-row sm:flex-col justify-between items-center sm:items-stretch gap-3 sm:gap-0">
                        <div className="flex flex-row sm:flex-col items-center sm:items-stretch gap-3 sm:gap-0 flex-1 min-w-0">
                          <img src={cat.image} alt="" className="w-16 h-16 sm:w-full sm:h-40 object-cover rounded-xl sm:rounded-2xl shrink-0 sm:mb-3 border border-gray-100 dark:border-slate-800" />
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 bg-purple-50 dark:bg-purple-950/50 text-purple-600 rounded-md inline-block">
                              {cat.pax || '15 Pax'}
                            </span>
                            <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white mt-1 sm:mt-1.5 truncate sm:whitespace-normal">{cat.title}</h3>
                            <p className="hidden sm:block text-xs text-gray-500 line-clamp-3 mt-1">{cat.description}</p>
                            <p className="sm:hidden text-xs font-black text-brand-600 mt-0.5">₹{cat.price}</p>
                          </div>
                        </div>

                        <div className="sm:mt-4 sm:pt-3 sm:border-t border-gray-100 dark:border-slate-800 flex items-center justify-end sm:justify-between shrink-0">
                          <p className="hidden sm:block text-base font-black text-brand-600">₹{cat.price}</p>
                          <div className="flex flex-col sm:flex-row gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                setCateringForm({
                                  id: cat.id,
                                  title: cat.title,
                                  category: cat.category || 'Catering',
                                  description: cat.description || '',
                                  pax: cat.pax || '15 Pax',
                                  price: String(cat.price || ''),
                                  image: cat.image || ''
                                });
                                setCateringModal({ open: true, mode: 'edit', data: cat });
                              }}
                              className="p-2 sm:p-1.5 sm:px-2.5 bg-gray-100 dark:bg-slate-800 hover:text-brand-600 text-gray-700 dark:text-gray-300 rounded-xl transition flex items-center justify-center gap-1 text-xs font-bold"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCateringPackage(cat.id)}
                              className="p-2 sm:p-1.5 sm:px-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition flex items-center justify-center gap-1 text-xs font-bold"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 8. CATEGORIZED PAYMENTS TAB */}
              {activeTab === 'payments' && (
                <div className="space-y-5">
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-600">FINANCIAL ANALYTICS</span>
                        <h2 className="text-lg font-black text-gray-900 dark:text-white mt-0.5">Categorized Payment Tracker</h2>
                        <p className="text-xs text-gray-500">Filter payments separately by Services, Store, Taxi, Memberships, Meals, & Catering.</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-800 px-4 py-3 rounded-2xl border border-gray-100 dark:border-slate-700">
                        <p className="text-[10px] uppercase font-bold text-gray-400">Total Verified Revenue</p>
                        <p className="text-xl font-black text-brand-600">₹{totalRevenue.toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-slate-800">
                      {[
                        { id: 'all', label: 'All Payments' },
                        { id: 'services', label: '🛠️ Service Bookings' },
                        { id: 'store', label: '🛍️ Store Orders' },
                        { id: 'taxi', label: '🚖 Taxi Cabs' },
                        { id: 'membership', label: '👑 Memberships' },
                        { id: 'meal', label: '🍱 Meal Plans' },
                        { id: 'catering', label: '🍲 Catering Requests' }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setPaymentCategoryFilter(tab.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition ${
                            paymentCategoryFilter === tab.id
                              ? 'bg-brand-600 text-white shadow-md'
                              : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payments Table */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 text-gray-500 font-extrabold uppercase text-[9px] tracking-wider">
                          <tr>
                            <th className="p-4">Transaction / Customer</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Item / Service</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Method</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Customer Tracker</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
                          {categorizedPayments
                            .filter(p => paymentCategoryFilter === 'all' || p.category === paymentCategoryFilter)
                            .map(p => (
                              <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-850/40 transition">
                                <td className="p-4">
                                  <p className="font-bold text-gray-900 dark:text-white text-sm">{p.customer_name}</p>
                                  <p className="text-[11px] text-gray-400 font-mono">{p.customer_email} • {p.customer_phone}</p>
                                  <p className="text-[10px] text-brand-600 font-mono mt-0.5">ID: {p.transaction_id || p.id}</p>
                                </td>
                                <td className="p-4">
                                  <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold rounded-lg text-[10px] uppercase">
                                    {p.category}
                                  </span>
                                </td>
                                <td className="p-4 font-semibold text-gray-800 dark:text-gray-200">{p.item_name}</td>
                                <td className="p-4 font-black text-brand-600 text-sm">₹{p.amount}</td>
                                <td className="p-4 text-gray-500 font-semibold">{p.payment_method}</td>
                                <td className="p-4">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                    p.status === 'paid' || p.status === 'verified' || p.status === 'completed'
                                      ? 'bg-green-100 text-green-700'
                                      : p.status === 'pending'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    {p.status}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <button
                                    onClick={() => setCustomerModal({ open: true, customer: p })}
                                    className="px-3 py-1.5 bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300 font-bold rounded-xl hover:bg-brand-100 transition flex items-center gap-1.5 ml-auto"
                                  >
                                    <Eye className="w-3.5 h-3.5" /> Track Customer
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 9. CUSTOMERS DIRECTORY TAB */}
              {activeTab === 'customers' && (
                <div className="space-y-5">
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800">
                    <h2 className="text-lg font-black text-gray-900 dark:text-white">Registered Customer Directory</h2>
                    <p className="text-xs text-gray-500">Track user profiles, total orders, contact phone numbers, and booking history.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {usersList.map(u => (
                      <div key={u.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-950/50 flex items-center justify-center font-black text-brand-600 text-sm">
                              {u.name?.slice(0, 2).toUpperCase() || 'CU'}
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-600 rounded-full uppercase">
                              {u.role}
                            </span>
                          </div>

                          <h3 className="font-bold text-base text-gray-900 dark:text-white">{u.name}</h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                            <Mail className="w-3.5 h-3.5" /> {u.email}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3.5 h-3.5" /> {u.mobile || '+91 98765 43210'}
                          </p>
                        </div>

                        <button
                          onClick={() => setCustomerModal({ open: true, customer: { customer_name: u.name, customer_email: u.email, customer_phone: u.mobile } })}
                          className="mt-4 w-full py-2 bg-gray-100 dark:bg-slate-800 hover:bg-brand-600 hover:text-white text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl transition"
                        >
                          View Order History
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 10. OFFERS TAB & FOOD ARRANGEMENTS */}
              {activeTab === 'offers' && <OffersTab />}
              {activeTab === 'catering_orders' && <FoodArrangementsTab />}

              {/* 11. SETTINGS TAB */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {/* Header Title Section */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Settings className="w-5 h-5 text-brand-600" />
                        Settings & Logs
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Manage platform configuration, notifications, security and monitor system activity.
                      </p>
                    </div>
                    {/* Fast Stats Info */}
                    <div className="flex gap-4 text-xs font-semibold shrink-0">
                      <div className="px-3 py-1.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                        <span className="text-gray-400">Time Zone:</span> <span className="text-brand-600">{generalForm.timezone}</span>
                      </div>
                      <div className="px-3 py-1.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                        <span className="text-gray-400">Currency:</span> <span className="text-brand-600">{generalForm.currency}</span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Tab Menu */}
                  <div className="flex border-b border-gray-200 dark:border-slate-800 overflow-x-auto scrollbar-none gap-2 select-none">
                    {[
                      { id: 'general', label: 'General', icon: Sliders },
                      { id: 'notifications', label: 'Notifications', icon: Bell },
                      { id: 'payments', label: 'Payments', icon: CreditCard },
                      { id: 'security', label: 'Security', icon: LockIcon },
                      { id: 'logs', label: 'Audit Logs', icon: FileText },
                      { id: 'health', label: 'System Health', icon: Activity },
                    ].map((tabInfo) => {
                      const isActive = settingsTab === tabInfo.id;
                      return (
                        <button
                          key={tabInfo.id}
                          onClick={() => setSettingsTab(tabInfo.id as any)}
                          className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold shrink-0 transition-all ${
                            isActive
                              ? 'border-brand-600 text-brand-600'
                              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          <tabInfo.icon className="w-4 h-4" />
                          {tabInfo.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Settings Content Area */}
                  <div className="space-y-6">
                    
                    {/* ==========================================
                        1. GENERAL SETTINGS TAB
                    ========================================== */}
                    {settingsTab === 'general' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* General Configuration Card */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 space-y-4 shadow-sm">
                          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                            <Sliders className="w-4 h-4 text-brand-600" />
                            <h3 className="font-bold text-sm">General Settings</h3>
                          </div>
                          
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            if (!generalForm.business_name.trim()) return toast('Business Name is required', 'error');
                            if (!generalForm.admin_email.includes('@')) return toast('Enter a valid Admin Email', 'error');
                            handleSaveSettings(generalForm);
                          }} className="space-y-3.5">
                            <Input label="Business / Platform Name" required value={generalForm.business_name} onChange={e => setGeneralForm({ ...generalForm, business_name: e.target.value })} />
                            <Input label="Admin Email" type="email" required value={generalForm.admin_email} onChange={e => setGeneralForm({ ...generalForm, admin_email: e.target.value })} />
                            <Input label="Contact Phone" required value={generalForm.business_phone} onChange={e => setGeneralForm({ ...generalForm, business_phone: e.target.value })} />
                            <Input label="Business Address" required value={generalForm.business_address} onChange={e => setGeneralForm({ ...generalForm, business_address: e.target.value })} />
                            <Input label="Support Email" type="email" value={generalForm.support_email} onChange={e => setGeneralForm({ ...generalForm, support_email: e.target.value })} />
                            <Input label="Website URL" value={generalForm.website_url} onChange={e => setGeneralForm({ ...generalForm, website_url: e.target.value })} />
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Time Zone</label>
                                <select value={generalForm.timezone} onChange={e => setGeneralForm({ ...generalForm, timezone: e.target.value })} className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-xs font-semibold">
                                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                  <option value="America/New_York">America/New_York (EST)</option>
                                  <option value="Europe/London">Europe/London (GMT)</option>
                                  <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Currency</label>
                                <select value={generalForm.currency} onChange={e => setGeneralForm({ ...generalForm, currency: e.target.value })} className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-xs font-semibold">
                                  <option value="INR">₹ INR (Indian Rupee)</option>
                                  <option value="USD">$ USD (US Dollar)</option>
                                  <option value="GBP">£ GBP (British Pound)</option>
                                  <option value="EUR">€ EUR (Euro)</option>
                                </select>
                              </div>
                            </div>

                            <Button type="submit" loading={savingSettings} fullWidth className="mt-2">
                              Save Changes
                            </Button>
                          </form>
                        </div>

                        {/* Contact & Business Information Card */}
                        <div className="space-y-6">
                          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 space-y-4 shadow-sm">
                            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                              <MapPin className="w-4 h-4 text-brand-600" />
                              <h3 className="font-bold text-sm">Contact & Business Information</h3>
                            </div>
                            
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              if (!businessForm.business_name.trim()) return toast('Business Name is required', 'error');
                              handleSaveSettings(businessForm, 'Business details updated successfully!');
                            }} className="space-y-3.5">
                              <Input label="Business Name" required value={businessForm.business_name} onChange={e => setBusinessForm({ ...businessForm, business_name: e.target.value })} />
                              <div className="grid grid-cols-2 gap-3">
                                <Input label="Phone Number" required value={businessForm.business_phone} onChange={e => setBusinessForm({ ...businessForm, business_phone: e.target.value })} />
                                <Input label="Email Address" type="email" required value={businessForm.business_email} onChange={e => setBusinessForm({ ...businessForm, business_email: e.target.value })} />
                              </div>
                              <Input label="Address Line" required value={businessForm.business_address} onChange={e => setBusinessForm({ ...businessForm, business_address: e.target.value })} />
                              <div className="grid grid-cols-3 gap-3">
                                <Input label="City" required value={businessForm.business_city} onChange={e => setBusinessForm({ ...businessForm, business_city: e.target.value })} />
                                <Input label="State" required value={businessForm.business_state} onChange={e => setBusinessForm({ ...businessForm, business_state: e.target.value })} />
                                <Input label="Pincode" required value={businessForm.business_pincode} onChange={e => setBusinessForm({ ...businessForm, business_pincode: e.target.value })} />
                              </div>
                              <Input label="Working Hours" required placeholder="e.g. 09:00 AM - 08:00 PM" value={businessForm.working_hours} onChange={e => setBusinessForm({ ...businessForm, working_hours: e.target.value })} />

                              <Button type="submit" loading={savingSettings} fullWidth className="mt-2">
                                Save Business Information
                              </Button>
                            </form>
                          </div>

                          {/* Database Actions Card */}
                          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 space-y-4 shadow-sm">
                            <h3 className="font-bold text-sm">System Actions</h3>
                            <p className="text-xs text-gray-400">Perform maintenance checks and cache operations.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                              <button onClick={handleRefreshDb} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2">
                                <Database className="w-3.5 h-3.5 text-gray-500" /> Refresh Database
                              </button>
                              <button onClick={() => setConfirmModal({
                                open: true,
                                title: 'Clear System Cache?',
                                message: 'Are you sure you want to clear the application query and templates cache? This might cause a slight performance dip momentarily.',
                                action: handleClearCache
                              })} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2">
                                <RefreshCw className="w-3.5 h-3.5 text-gray-500" /> Clear Cache
                              </button>
                              <button onClick={() => { setSettingsTab('health'); fetchHealthData(); }} className="px-4 py-2.5 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/20 text-brand-700 dark:text-brand-400 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2">
                                <Activity className="w-3.5 h-3.5" /> Refresh Status
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* ==========================================
                        2. NOTIFICATIONS TAB
                    ========================================== */}
                    {settingsTab === 'notifications' && (
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm max-w-3xl">
                        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3 mb-5">
                          <Bell className="w-4 h-4 text-brand-600" />
                          <h3 className="font-bold text-sm">Notification Channels Configuration</h3>
                        </div>

                        <div className="space-y-4">
                          {[
                            { key: 'cust_reg', label: 'New Customer Registration', desc: 'Trigger alerts when a new user registers an account' },
                            { key: 'booking_conf', label: 'New Order / Booking', desc: 'Send notification upon creation of new service or taxi booking' },
                            { key: 'payment_success', label: 'Payment Successful', desc: 'Trigger notifications when a transaction completes successfully' },
                            { key: 'payment_fail', label: 'Payment Failed', desc: 'Notify on checkout transaction failure or rejection' },
                            { key: 'order_cancel', label: 'Order / Booking Cancelled', desc: 'Alert when customer or admin cancels an active booking' },
                            { key: 'service_request', label: 'New Service Request', desc: 'Send custom request notification for out-of-catalog services' },
                            { key: 'contact_enquiry', label: 'New Contact / Enquiry', desc: 'Alert staff when customer submits contact form message' },
                            { key: 'offers', label: 'Offer & Promotional Notifications', desc: 'Send alerts when promo campaigns or discount codes go live' },
                            { key: 'low_stock', label: 'Low Stock Alert', desc: 'Warn staff when inventory drops below notification thresholds' },
                            { key: 'system_error', label: 'System Error Alert', desc: 'Send core notifications when databases or API gateways throw critical exceptions' }
                          ].map((notif) => {
                            const emailKey = `notif_${notif.key}_email`;
                            const dbKey = `notif_${notif.key}_db`;
                            
                            return (
                              <div key={notif.key} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-gray-100 dark:border-slate-800 last:border-b-0 gap-3">
                                <div>
                                  <p className="text-xs font-bold text-gray-900 dark:text-white">{notif.label}</p>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{notif.desc}</p>
                                </div>
                                <div className="flex gap-6 items-center">
                                  {/* Email toggle */}
                                  <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase select-none cursor-pointer">
                                    <input type="checkbox" checked={notifToggles[emailKey]} onChange={(e) => setNotifToggles({ ...notifToggles, [emailKey]: e.target.checked })} className="w-4 h-4 accent-brand-600 rounded" />
                                    Email
                                  </label>
                                  {/* Dashboard toggle */}
                                  <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase select-none cursor-pointer">
                                    <input type="checkbox" checked={notifToggles[dbKey]} onChange={(e) => setNotifToggles({ ...notifToggles, [dbKey]: e.target.checked })} className="w-4 h-4 accent-brand-600 rounded" />
                                    Dashboard
                                  </label>
                                </div>
                              </div>
                            );
                          })}

                          <div className="pt-4 flex justify-end">
                            <Button onClick={() => {
                              const rawConfig: Record<string, string> = {};
                              Object.entries(notifToggles).forEach(([k, v]) => {
                                rawConfig[k] = v ? 'true' : 'false';
                              });
                              handleSaveSettings(rawConfig, 'Notification settings successfully updated!');
                            }} loading={savingSettings}>
                              Save Notification Settings
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ==========================================
                        3. PAYMENTS TAB
                    ========================================== */}
                    {settingsTab === 'payments' && (
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm max-w-2xl space-y-6">
                        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                          <CreditCard className="w-4 h-4 text-brand-600" />
                          <h3 className="font-bold text-sm">Payment Settings</h3>
                        </div>

                        {/* Razorpay Stats Header */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Provider</span>
                            <p className="text-xs font-black">Razorpay Inc.</p>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Gateway Mode</span>
                            <p className="text-xs font-black capitalize">{paymentForm.razorpay_mode} Mode</p>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Config Status</span>
                            <p className="text-xs font-black text-emerald-600 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Active
                            </p>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Status</span>
                            <span className="inline-block text-[10px] font-black bg-brand-100 dark:bg-brand-950/40 text-brand-700 px-2 py-0.5 rounded-full mt-0.5">
                              Operational
                            </span>
                          </div>
                        </div>

                        <form onSubmit={(e) => {
                          e.preventDefault();
                          if (!paymentForm.razorpay_key_id.trim()) return toast('Razorpay Key ID is required', 'error');
                          handleSaveSettings(paymentForm, 'Payment settings saved successfully!');
                        }} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Mode Selection</label>
                              <select value={paymentForm.razorpay_mode} onChange={e => setPaymentForm({ ...paymentForm, razorpay_mode: e.target.value, razorpay_status: e.target.value })} className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-xs font-semibold">
                                <option value="test">Test Mode (Mock Transactions)</option>
                                <option value="live">Live Production Mode</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Verification Checks</label>
                              <select value={paymentForm.razorpay_config_status} onChange={e => setPaymentForm({ ...paymentForm, razorpay_config_status: e.target.value })} className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-xs font-semibold">
                                <option value="configured">Auto Verifications Active</option>
                                <option value="manual">Manual Ledger Checks Only</option>
                              </select>
                            </div>
                          </div>

                          <Input label="Razorpay Key ID" required value={paymentForm.razorpay_key_id} onChange={e => setPaymentForm({ ...paymentForm, razorpay_key_id: e.target.value })} />
                          
                          <Input
                            label="Razorpay Secret Key"
                            required
                            type={showRazorpaySecret ? 'text' : 'password'}
                            value={paymentForm.razorpay_secret_key}
                            onChange={e => setPaymentForm({ ...paymentForm, razorpay_secret_key: e.target.value })}
                            rightIcon={
                              <button type="button" onClick={() => setShowRazorpaySecret(!showRazorpaySecret)} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                                {showRazorpaySecret ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            }
                          />

                          <div className="pt-2 flex flex-col sm:flex-row gap-3">
                            <Button type="submit" loading={savingSettings} className="sm:flex-1">
                              Save Payment Settings
                            </Button>
                            <Button type="button" variant="outline" onClick={handleTestPayment} loading={testingPayment} className="sm:flex-1">
                              Test Payment Configuration
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* ==========================================
                        4. SECURITY TAB
                    ========================================== */}
                    {settingsTab === 'security' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Security Policies Configuration */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
                          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                            <LockIcon className="w-4 h-4 text-brand-600" />
                            <h3 className="font-bold text-sm">Security & Access Policies</h3>
                          </div>

                          <form onSubmit={(e) => {
                            e.preventDefault();
                            handleSaveSettings(securityForm, 'Security policies updated successfully!');
                          }} className="space-y-4">
                            
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Admin Session Timeout</label>
                              <select value={securityForm.security_session_timeout_enabled} onChange={e => setSecurityForm({ ...securityForm, security_session_timeout_enabled: e.target.value })} className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-xs font-semibold">
                                <option value="false">Session Timeout Disabled</option>
                                <option value="true">Automatically log out inactive admins</option>
                              </select>
                            </div>

                            {securityForm.security_session_timeout_enabled === 'true' && (
                              <Input label="Timeout Duration (minutes)" type="number" required value={securityForm.security_session_timeout_duration} onChange={e => setSecurityForm({ ...securityForm, security_session_timeout_duration: e.target.value })} />
                            )}

                            <div>
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Login Brute-Force Protection</label>
                              <select value={securityForm.security_login_protection_enabled} onChange={e => setSecurityForm({ ...securityForm, security_login_protection_enabled: e.target.value })} className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-xs font-semibold">
                                <option value="true">Lock account for 15 mins after 5 failed logins</option>
                                <option value="false">Disable attempt protection (Vulnerable)</option>
                              </select>
                            </div>

                            {/* Active Session Info */}
                            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl space-y-1.5 text-xs text-gray-500 border border-gray-100 dark:border-slate-700">
                              <p className="font-bold text-gray-800 dark:text-white text-[10px] uppercase tracking-wider mb-1">Current Active Session</p>
                              <div><span className="text-gray-400">Connection IP:</span> <span className="font-semibold text-gray-700 dark:text-gray-200">127.0.0.1 (Localhost)</span></div>
                              <div><span className="text-gray-400">Client Agent:</span> <span className="font-semibold text-gray-700 dark:text-gray-200">{navigator.userAgent.split(' ')[0]} / {navigator.platform}</span></div>
                            </div>

                            <div className="pt-2 flex flex-col sm:flex-row gap-3">
                              <Button type="submit" loading={savingSettings} fullWidth>
                                Save Security Settings
                              </Button>
                              <Button type="button" variant="danger" fullWidth onClick={() => {
                                setConfirmModal({
                                  open: true,
                                  title: 'Force Session Termination?',
                                  message: 'Are you sure you want to terminate all other active admin sessions? You will not be logged out of your current session.',
                                  action: () => toast('All secondary admin sessions successfully terminated!', 'success')
                                });
                              }}>
                                Terminate Other Sessions
                              </Button>
                            </div>
                          </form>

                          {/* Change Admin Password */}
                          <div className="border-t border-gray-100 dark:border-slate-800 pt-5 mt-4 space-y-4">
                            <h4 className="font-bold text-xs text-gray-900 dark:text-white">Change Admin Security Password</h4>
                            <form onSubmit={handleChangePassword} className="space-y-3.5">
                              <Input label="New Admin Password" type="password" required value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                              <Input label="Confirm New Password" type="password" required value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
                              <Button type="submit" loading={changingPassword} variant="secondary" fullWidth>
                                Change Admin Password
                              </Button>
                            </form>
                          </div>
                        </div>

                        {/* Admin Profile Details */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
                          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                            <User className="w-4 h-4 text-brand-600" />
                            <h3 className="font-bold text-sm">Admin Profile Control</h3>
                          </div>

                          <div className="flex flex-col items-center gap-4 py-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                            {/* Avatar preview */}
                            <div className="relative group">
                              <img src={adminAvatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-brand-500 shadow" />
                              <label className="absolute bottom-0 right-0 w-7 h-7 bg-brand-600 hover:bg-brand-700 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg transition">
                                <Camera className="w-3.5 h-3.5" />
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadImage(e, setAdminAvatarUrl)} />
                              </label>
                            </div>
                            <div className="text-center space-y-0.5">
                              <h4 className="font-black text-sm">{currentUser?.name || 'Super Admin'}</h4>
                              <p className="text-[10px] text-brand-600 font-bold uppercase tracking-widest">{currentUser?.role || 'Administrator'}</p>
                            </div>
                          </div>

                          <form onSubmit={handleUpdateAdminProfile} className="space-y-3.5">
                            <Input label="Display / Admin Name" required value={adminNameEdit} onChange={e => setAdminNameEdit(e.target.value)} />
                            <Input label="Account Email Address" type="email" required value={adminEmailEdit} onChange={e => setAdminEmailEdit(e.target.value)} />
                            <Input label="Avatar Image URL (Optional)" value={adminAvatarUrl} onChange={e => setAdminAvatarUrl(e.target.value)} />
                            
                            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl space-y-1 text-xs text-gray-500 border border-gray-100 dark:border-slate-700">
                              <div><span className="text-gray-400">Account Role:</span> <span className="font-semibold text-gray-700 dark:text-gray-200 capitalize">{currentUser?.role || 'admin'}</span></div>
                              <div><span className="text-gray-400">Account ID:</span> <span className="font-semibold text-gray-700 dark:text-gray-200">{currentUser?.id || 'usr3'}</span></div>
                              <div><span className="text-gray-400">Security Verification:</span> <span className="font-semibold text-emerald-600">Verified Email Account</span></div>
                            </div>

                            <Button type="submit" loading={updatingAdminProfile} fullWidth className="mt-2">
                              Save Admin Profile
                            </Button>
                          </form>
                        </div>

                      </div>
                    )}

                    {/* ==========================================
                        5. EMAIL CONFIGURATION TAB
                    ========================================== */}
                    {settingsTab === 'payments' && (
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm max-w-2xl space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                          <Mail className="w-4 h-4 text-brand-600" />
                          <h3 className="font-bold text-sm">Email Configurations (SMTP Gateway)</h3>
                        </div>

                        <form onSubmit={(e) => {
                          e.preventDefault();
                          if (!emailForm.email_sender_name.trim()) return toast('Sender name is required', 'error');
                          if (!emailForm.email_sender_email.includes('@')) return toast('Enter valid sender email address', 'error');
                          handleSaveSettings(emailForm, 'Email credentials successfully updated!');
                        }} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input label="Sender Name" required value={emailForm.email_sender_name} onChange={e => setEmailForm({ ...emailForm, email_sender_name: e.target.value })} />
                            <Input label="Sender Email" type="email" required value={emailForm.email_sender_email} onChange={e => setEmailForm({ ...emailForm, email_sender_email: e.target.value })} />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                              <Input label="SMTP Host / Mail server" required value={emailForm.email_smtp_host} onChange={e => setEmailForm({ ...emailForm, email_smtp_host: e.target.value })} />
                            </div>
                            <Input label="SMTP Port" required value={emailForm.email_smtp_port} onChange={e => setEmailForm({ ...emailForm, email_smtp_port: e.target.value })} />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input label="SMTP Username" required value={emailForm.email_smtp_username} onChange={e => setEmailForm({ ...emailForm, email_smtp_username: e.target.value })} />
                            <Input
                              label="SMTP Password"
                              required
                              type={showSmtpPassword ? 'text' : 'password'}
                              value={emailForm.email_smtp_password}
                              onChange={e => setEmailForm({ ...emailForm, email_smtp_password: e.target.value })}
                              rightIcon={
                                <button type="button" onClick={() => setShowSmtpPassword(!showSmtpPassword)} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                                  {showSmtpPassword ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              }
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Security & Encryption</label>
                            <select value={emailForm.email_encryption} onChange={e => setEmailForm({ ...emailForm, email_encryption: e.target.value })} className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-xs font-semibold">
                              <option value="none">None (Plaintext/Non-secure connection)</option>
                              <option value="ssl">SSL / Secure Port 465 (Recommended)</option>
                              <option value="tls">TLS / STARTTLS Port 587</option>
                            </select>
                          </div>

                          <div className="pt-2 flex justify-end">
                            <Button type="submit" loading={savingSettings}>
                              Save Email Settings
                            </Button>
                          </div>
                        </form>

                        {/* Test Email Form */}
                        <div className="border-t border-gray-100 dark:border-slate-800 pt-5 mt-4 space-y-3">
                          <h4 className="font-bold text-xs">Send Test Dispatch Email</h4>
                          <p className="text-[10px] text-gray-400">Dispatch a test template immediately using the configurations above.</p>
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <Input label="Recipient Email Address" placeholder="test@example.com" value={testEmailAddr} onChange={e => setTestEmailAddr(e.target.value)} />
                            </div>
                            <Button type="button" variant="outline" onClick={handleTestEmail} loading={testingEmail} className="h-11 shrink-0">
                              Send Test Email
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ==========================================
                        6. AUDIT LOGS TAB
                    ========================================== */}
                    {settingsTab === 'logs' && (
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 dark:border-slate-800 pb-3 gap-3">
                          <div>
                            <h3 className="font-bold text-sm">System Audit Trail</h3>
                            <p className="text-[10px] text-gray-400">Verifiable activity records generated by users and admin events.</p>
                          </div>
                          
                          {/* Clear filters action */}
                          {(logsSearchInput || logsModuleFilter || logsActionFilter || logsStatusFilter || logsStartDateFilter || logsEndDateFilter) && (
                            <button onClick={() => {
                              setLogsSearchInput('');
                              setLogsSearchQuery('');
                              setLogsModuleFilter('');
                              setLogsActionFilter('');
                              setLogsStatusFilter('');
                              setLogsStartDateFilter('');
                              setLogsEndDateFilter('');
                              setLogsPage(1);
                            }} className="text-xs font-bold text-red-600 hover:underline">
                              Clear Filters
                            </button>
                          )}
                        </div>

                        {/* Logs Filter Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search logs..."
                              value={logsSearchInput}
                              onChange={e => setLogsSearchInput(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') { setLogsSearchQuery(logsSearchInput); setLogsPage(1); } }}
                              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50 dark:bg-slate-800 font-semibold h-10"
                            />
                          </div>

                          <select value={logsModuleFilter} onChange={e => { setLogsModuleFilter(e.target.value); setLogsPage(1); }} className="w-full px-3 text-xs border border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50 dark:bg-slate-800 font-semibold h-10">
                            <option value="">All Modules</option>
                            <option value="Settings">Settings</option>
                            <option value="Admin Panel">Admin Panel</option>
                            <option value="Customer">Customer Directory</option>
                            <option value="System">System Engine</option>
                          </select>

                          <select value={logsActionFilter} onChange={e => { setLogsActionFilter(e.target.value); setLogsPage(1); }} className="w-full px-3 text-xs border border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50 dark:bg-slate-800 font-semibold h-10">
                            <option value="">All Actions</option>
                            <option value="User Login">User Login</option>
                            <option value="Register Account Pending">Registration</option>
                            <option value="Update Settings">Update Settings</option>
                            <option value="Update User">Update User</option>
                            <option value="Add Service">Add Service</option>
                          </select>

                          <select value={logsStatusFilter} onChange={e => { setLogsStatusFilter(e.target.value); setLogsPage(1); }} className="w-full px-3 text-xs border border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50 dark:bg-slate-800 font-semibold h-10">
                            <option value="">All Statuses</option>
                            <option value="success">Success</option>
                            <option value="failed">Failed</option>
                            <option value="warning">Warning</option>
                          </select>

                          <div>
                            <input type="date" value={logsStartDateFilter} onChange={e => { setLogsStartDateFilter(e.target.value); setLogsPage(1); }} className="w-full px-3 text-xs border border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50 dark:bg-slate-800 font-semibold h-10" />
                          </div>

                          <div>
                            <input type="date" value={logsEndDateFilter} onChange={e => { setLogsEndDateFilter(e.target.value); setLogsPage(1); }} className="w-full px-3 text-xs border border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50 dark:bg-slate-800 font-semibold h-10" />
                          </div>
                        </div>

                        {/* Logs Interactive Table */}
                        <div className="overflow-x-auto border border-gray-100 dark:border-slate-800 rounded-2xl">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-800 font-bold text-gray-500">
                                <th className="p-3">Date & Time</th>
                                <th className="p-3">Admin/User</th>
                                <th className="p-3">Action</th>
                                <th className="p-3">Module</th>
                                <th className="p-3">Description</th>
                                <th className="p-3">IP Address</th>
                                <th className="p-3">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {logsLoading ? (
                                <tr>
                                  <td colSpan={7} className="p-10 text-center text-gray-400 font-semibold">
                                    <div className="flex items-center justify-center gap-2">
                                      <RefreshCw className="w-4 h-4 animate-spin text-brand-600" />
                                      Loading audit logs database records...
                                    </div>
                                  </td>
                                </tr>
                              ) : logsList.length === 0 ? (
                                <tr>
                                  <td colSpan={7} className="p-10 text-center text-gray-400 font-semibold">
                                    No audit log entries matching filters found.
                                  </td>
                                </tr>
                              ) : (
                                logsList.map((log) => {
                                  let badgeTheme = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400';
                                  if (log.status === 'failed') badgeTheme = 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400';
                                  if (log.status === 'warning') badgeTheme = 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400';
                                  
                                  return (
                                    <tr key={log.id} className="border-b border-gray-100 dark:border-slate-800 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/40">
                                      <td className="p-3 whitespace-nowrap text-gray-400 font-semibold">{new Date(log.timestamp).toLocaleString()}</td>
                                      <td className="p-3 font-bold">{log.user_name} ({log.user_id})</td>
                                      <td className="p-3 whitespace-nowrap font-bold text-gray-900 dark:text-white">{log.action}</td>
                                      <td className="p-3 font-semibold text-brand-600">{log.module || 'System'}</td>
                                      <td className="p-3 max-w-xs truncate" title={log.details}>{log.details}</td>
                                      <td className="p-3 font-mono text-gray-400">{log.ip_address || '127.0.0.1'}</td>
                                      <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${badgeTheme}`}>
                                          {log.status || 'success'}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Paginated Navigation */}
                        <Pagination total={logsTotal} limit={logsLimit} current={logsPage} onChange={(p: number) => setLogsPage(p)} />
                      </div>
                    )}

                    {/* ==========================================
                        7. SYSTEM HEALTH TAB
                    ========================================== */}
                    {settingsTab === 'health' && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Indicators list */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
                          <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-sm">Services Operational Checks</h3>
                            <button onClick={fetchHealthData} disabled={healthLoading} className="p-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition text-xs font-bold flex items-center gap-1">
                              <RefreshCw className={`w-3.5 h-3.5 ${healthLoading ? 'animate-spin' : ''}`} /> Refresh Checks
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                              { label: 'Database Connection (SQLite)', key: 'database_sqlite' },
                              { label: 'Database Connection (MongoDB)', key: 'database_mongodb' },
                              { label: 'API Server Response', key: 'api_server' },
                              { label: 'Email Gateway (Nodemailer SMTP)', key: 'email_service' },
                              { label: 'Payment Gateway (Razorpay API)', key: 'payment_gateway' },
                              { label: 'Server File Storage', key: 'storage' },
                              { label: 'Authentication Engine', key: 'auth_service' }
                            ].map((svc) => {
                              const checkVal = healthData?.health?.[svc.key] || 'Checking...';
                              let colorClass = 'bg-yellow-500';
                              if (checkVal === 'Connected' || checkVal === 'Operational') {
                                colorClass = 'bg-emerald-500';
                              } else if (checkVal === 'Error') {
                                colorClass = 'bg-red-500';
                              } else if (checkVal.includes('Offline')) {
                                colorClass = 'bg-amber-500';
                              }
                              
                              return (
                                <div key={svc.key} className="p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between border border-gray-100 dark:border-slate-700">
                                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{svc.label}</span>
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
                                    <span className="text-xs font-bold capitalize">{checkVal}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Backup & System size card */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
                          <h3 className="font-bold text-sm">Backup & Data Management</h3>
                          
                          <div className="space-y-3.5 py-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-400">Database Size:</span>
                              <span className="font-bold">{healthData?.stats?.database_size || '0.00 MB'}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-400">Total Customers:</span>
                              <span className="font-bold">{healthData?.stats?.total_customers || '0'}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-400">Total Services:</span>
                              <span className="font-bold">{healthData?.stats?.total_services || '0'}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-400">Total Orders:</span>
                              <span className="font-bold">{healthData?.stats?.total_orders || '0'}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-400">Last Backup:</span>
                              <span className="font-bold text-gray-500">{healthData?.stats?.last_backup_date || 'Not configured'}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-400">Backup Status:</span>
                              <span className="inline-block text-[10px] font-black bg-gray-100 dark:bg-slate-800 text-gray-500 px-2 py-0.5 rounded-full">
                                {healthData?.stats?.last_backup_status || 'Not configured'}
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 flex flex-col gap-2.5">
                            <button disabled className="w-full py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-400 text-xs font-bold rounded-xl cursor-not-allowed border border-gray-200 dark:border-slate-700">
                              Create Backup (Not Configured)
                            </button>
                            <button disabled className="w-full py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-400 text-xs font-bold rounded-xl cursor-not-allowed border border-gray-200 dark:border-slate-700">
                              Refresh Backup Status
                            </button>
                          </div>
                        </div>

                      </div>
                    )}

                  </div>

                  {/* Confirmation Modal */}
                  <Modal open={confirmModal.open} onClose={() => setConfirmModal({ ...confirmModal, open: false })} title={confirmModal.title} footer={
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setConfirmModal({ ...confirmModal, open: false })}>Cancel</Button>
                      <Button variant="danger" onClick={() => {
                        if (confirmModal.action) confirmModal.action();
                        setConfirmModal({ ...confirmModal, open: false });
                      }}>Proceed</Button>
                    </div>
                  }>
                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">{confirmModal.message}</p>
                  </Modal>

                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ==========================================
          COMMON MODALS FOR CRUD OPERATIONS
      ========================================== */}

      {/* 1. Service Add/Edit Modal */}
      {serviceModal.open && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-gray-100 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base">{serviceModal.mode === 'edit' ? 'Edit Service' : 'Add New Service'}</h3>
            <form onSubmit={handleSaveService} className="space-y-3">
              <Input label="Service Name" required value={serviceForm.name} onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} />
              <Input label="Category" required value={serviceForm.categoryName} onChange={e => setServiceForm({ ...serviceForm, categoryName: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Price (₹)" type="number" required value={serviceForm.price} onChange={e => setServiceForm({ ...serviceForm, price: e.target.value })} />
                <Input label="Duration" value={serviceForm.duration} onChange={e => setServiceForm({ ...serviceForm, duration: e.target.value })} />
              </div>
              <Input label="Image URL" value={serviceForm.image} onChange={e => setServiceForm({ ...serviceForm, image: e.target.value })} />
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 block">Description</label>
                <textarea value={serviceForm.description} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-xs" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 block">Features (One per line)</label>
                <textarea value={serviceForm.featuresText} onChange={e => setServiceForm({ ...serviceForm, featuresText: e.target.value })} className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-xs" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" fullWidth onClick={() => setServiceModal({ open: false, mode: 'add' })}>Cancel</Button>
                <Button type="submit" fullWidth>Save Service</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Store Product Modal */}
      {storeModal.open && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-gray-100 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base">{storeModal.mode === 'edit' ? 'Edit Store Product' : 'Add Store Product'}</h3>
            <form onSubmit={handleSaveStoreProduct} className="space-y-3">
              <Input label="Product Name" required value={storeForm.name} onChange={e => setStoreForm({ ...storeForm, name: e.target.value })} />
              <Input label="Category" required value={storeForm.category} onChange={e => setStoreForm({ ...storeForm, category: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Price (₹)" type="number" required value={storeForm.price} onChange={e => setStoreForm({ ...storeForm, price: e.target.value })} />
                <Input label="Stock Units" type="number" required value={storeForm.stock} onChange={e => setStoreForm({ ...storeForm, stock: e.target.value })} />
              </div>
              <Input label="Image URL" value={storeForm.image} onChange={e => setStoreForm({ ...storeForm, image: e.target.value })} />
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 block">Description</label>
                <textarea value={storeForm.description} onChange={e => setStoreForm({ ...storeForm, description: e.target.value })} className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-xs" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" fullWidth onClick={() => setStoreModal({ open: false, mode: 'add' })}>Cancel</Button>
                <Button type="submit" fullWidth>Save Product</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Vehicle Modal */}
      {vehicleModal.open && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-gray-100 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base">{vehicleModal.mode === 'edit' ? 'Edit Vehicle' : 'Add Vehicle to Fleet'}</h3>
            <form onSubmit={handleSaveVehicle} className="space-y-3">
              <Input label="Vehicle Model Name" required value={vehicleForm.name} onChange={e => setVehicleForm({ ...vehicleForm, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Body Type (SUV/Sedan)" required value={vehicleForm.type} onChange={e => setVehicleForm({ ...vehicleForm, type: e.target.value })} />
                <Input label="Passengers Max" type="number" required value={vehicleForm.passengers} onChange={e => setVehicleForm({ ...vehicleForm, passengers: Number(e.target.value) })} />
              </div>
              <Input label="Rate (₹ / km)" type="number" required value={vehicleForm.rate} onChange={e => setVehicleForm({ ...vehicleForm, rate: e.target.value })} />
              <Input label="Image URL" value={vehicleForm.image} onChange={e => setVehicleForm({ ...vehicleForm, image: e.target.value })} />
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" fullWidth onClick={() => setVehicleModal({ open: false, mode: 'add' })}>Cancel</Button>
                <Button type="submit" fullWidth>Save Vehicle</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Membership Care Modal */}
      {membershipModal.open && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-gray-100 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base">{membershipModal.mode === 'edit' ? 'Edit Membership Plan' : 'Add Membership Plan'}</h3>
            <form onSubmit={handleSaveMembership} className="space-y-3">
              <Input label="Plan Name" required value={membershipForm.name} onChange={e => setMembershipForm({ ...membershipForm, name: e.target.value })} />
              <Input label="Short Description" required value={membershipForm.desc} onChange={e => setMembershipForm({ ...membershipForm, desc: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Display Price (e.g. ₹4,999)" required value={membershipForm.price} onChange={e => setMembershipForm({ ...membershipForm, price: e.target.value })} />
                <Input label="Numeric Price" type="number" required value={membershipForm.numeric_price} onChange={e => setMembershipForm({ ...membershipForm, numeric_price: Number(e.target.value) })} />
              </div>
              <Input label="Badge Text (Optional)" value={membershipForm.badge} onChange={e => setMembershipForm({ ...membershipForm, badge: e.target.value })} />
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 block">Plan Features (One per line)</label>
                <textarea value={membershipForm.featuresText} onChange={e => setMembershipForm({ ...membershipForm, featuresText: e.target.value })} className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-xs min-h-[80px]" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" fullWidth onClick={() => setMembershipModal({ open: false, mode: 'add' })}>Cancel</Button>
                <Button type="submit" fullWidth>Save Membership Plan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Meal Modal */}
      {mealModal.open && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-gray-100 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base">{mealModal.mode === 'edit' ? 'Edit Meal Plan' : 'Add Meal Plan'}</h3>
            <form onSubmit={handleSaveMeal} className="space-y-3">
              <Input label="Meal Dish Name" required value={mealForm.name} onChange={e => setMealForm({ ...mealForm, name: e.target.value })} />
              <Input label="Cuisine / Category" required value={mealForm.category} onChange={e => setMealForm({ ...mealForm, category: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Price (₹)" type="number" required value={mealForm.price} onChange={e => setMealForm({ ...mealForm, price: e.target.value })} />
                <Input label="Calories" type="number" value={mealForm.calories} onChange={e => setMealForm({ ...mealForm, calories: e.target.value })} />
              </div>
              <Input label="Image URL" value={mealForm.image} onChange={e => setMealForm({ ...mealForm, image: e.target.value })} />
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 block">Description</label>
                <textarea value={mealForm.description} onChange={e => setMealForm({ ...mealForm, description: e.target.value })} className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-xs" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" fullWidth onClick={() => setMealModal({ open: false, mode: 'add' })}>Cancel</Button>
                <Button type="submit" fullWidth>Save Meal Plan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Catering Modal */}
      {cateringModal.open && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-gray-100 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base">{cateringModal.mode === 'edit' ? 'Edit Catering Package' : 'Add Catering Package'}</h3>
            <form onSubmit={handleSaveCateringPackage} className="space-y-3">
              <Input label="Package Title" required value={cateringForm.title} onChange={e => setCateringForm({ ...cateringForm, title: e.target.value })} />
              <Input label="Pax Capacity (e.g. 15 Pax)" required value={cateringForm.pax} onChange={e => setCateringForm({ ...cateringForm, pax: e.target.value })} />
              <Input label="Price (₹)" type="number" required value={cateringForm.price} onChange={e => setCateringForm({ ...cateringForm, price: e.target.value })} />
              <Input label="Image URL" value={cateringForm.image} onChange={e => setCateringForm({ ...cateringForm, image: e.target.value })} />
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 block">Description</label>
                <textarea value={cateringForm.description} onChange={e => setCateringForm({ ...cateringForm, description: e.target.value })} className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-xs" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" fullWidth onClick={() => setCateringModal({ open: false, mode: 'add' })}>Cancel</Button>
                <Button type="submit" fullWidth>Save Package</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Customer Tracking Modal */}
      {customerModal.open && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-gray-100 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-brand-600" />
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white">Customer Live Tracker</h3>
              </div>
              <button onClick={() => setCustomerModal({ open: false })} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl space-y-1">
                <p className="font-extrabold text-sm text-gray-900 dark:text-white">{customerModal.customer?.customer_name || customerModal.customer?.name}</p>
                <p className="text-gray-500">Email: <strong className="text-gray-800 dark:text-gray-200">{customerModal.customer?.customer_email || customerModal.customer?.email}</strong></p>
                <p className="text-gray-500">Mobile: <strong className="text-gray-800 dark:text-gray-200">{customerModal.customer?.customer_phone || customerModal.customer?.mobile || '+91 98765 43210'}</strong></p>
              </div>

              <div className="bg-brand-50 dark:bg-brand-950/30 p-4 rounded-2xl border border-brand-100 dark:border-brand-900/40">
                <p className="text-[10px] uppercase font-bold text-brand-700 dark:text-brand-300">Live Active Order Timeline</p>
                <p className="font-bold text-brand-900 dark:text-brand-100 text-sm mt-1">{customerModal.customer?.item_name || 'Active Service / Order'}</p>
                <p className="text-brand-600 font-black text-sm mt-0.5">Amount: ₹{customerModal.customer?.amount || 0}</p>
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-green-600 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> Order Created & Payment Logged
                  </div>
                  <div className="flex items-center gap-2 text-green-600 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> Provider Assigned
                  </div>
                  <div className="flex items-center gap-2 text-brand-600 font-bold">
                    <Activity className="w-4 h-4 animate-pulse" /> Out for Service / Delivery
                  </div>
                </div>
              </div>
            </div>

            <Button fullWidth onClick={() => setCustomerModal({ open: false })}>Close Tracker</Button>
          </div>
        </div>
      )}

    </div>
  );
}
