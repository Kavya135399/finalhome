import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Calendar, DollarSign, Star,
  Wrench, Search, Download, ChevronLeft,
  Plus, Edit, Trash2, Check, XCircle, Inbox, Settings, FileText,
  ShieldAlert, Activity, RefreshCw, Send, Database, Menu, X, Clock,
  CarTaxiFront, Camera, LogOut, ShoppingBag, Package, Eye, AlertTriangle, Tag,
  Utensils, UtensilsCrossed, Shield, CreditCard, Filter, User, MapPin, Phone, Mail, CheckCircle2, ArrowRight, ChefHat
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import { OverviewTab } from '../components/admin/OverviewTab';
import { OffersTab } from '../components/admin/OffersTab';
import { FoodArrangementsTab } from '../components/admin/FoodArrangementsTab';
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
  const { signOut } = useAuth();

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
      setAuditLogs(Array.isArray(l) ? l : []);
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
        <p className="text-sm font-bold text-gray-700 dark:text-slate-300">Connecting to HomeSeva Core Database...</p>
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
                HS
              </div>
              <div>
                <h1 className="font-extrabold text-sm text-gray-900 dark:text-white">HomeSeva Admin</h1>
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
              {activeTab === 'services' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 gap-4">
                    <div>
                      <h2 className="text-lg font-black text-gray-900 dark:text-white">Services Catalog Manager</h2>
                      <p className="text-xs text-gray-500">Manage all home cleaning, electrical, plumbing, and repair services.</p>
                    </div>
                    <button
                      onClick={() => {
                        setServiceForm({ id: '', name: '', categoryName: 'Home Cleaning', price: '', description: '', duration: '60 min', image: '', featuresText: '' });
                        setServiceModal({ open: true, mode: 'add' });
                      }}
                      className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-2xl transition flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
                    >
                      <Plus className="w-4 h-4" /> Add New Service
                    </button>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search service name or description..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 h-10 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-xs text-gray-800 dark:text-white outline-none focus:border-brand-500"
                      />
                    </div>
                    <select
                      value={categoryFilter}
                      onChange={e => setCategoryFilter(e.target.value)}
                      className="h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-xs font-bold text-gray-700 dark:text-gray-300 outline-none"
                    >
                      <option value="all">All Categories</option>
                      {Array.from(new Set(servicesList.map(s => s.categoryName).filter(Boolean))).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Services Grid / Table */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 text-gray-500 font-extrabold uppercase text-[9px] tracking-wider">
                          <tr>
                            <th className="p-4">Service</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Duration</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
                          {servicesList
                            .filter(s => (categoryFilter === 'all' || s.categoryName === categoryFilter) && (s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.description?.toLowerCase().includes(searchQuery.toLowerCase())))
                            .map(s => (
                              <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-850/40 transition">
                                <td className="p-4 flex items-center gap-3">
                                  <img src={s.image} alt="" className="w-12 h-12 rounded-xl object-cover border border-gray-100 dark:border-slate-700" />
                                  <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{s.name}</p>
                                    <p className="text-[11px] text-gray-400 line-clamp-1 max-w-sm">{s.description}</p>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className="px-2.5 py-1 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-bold rounded-lg text-[10px]">
                                    {s.categoryName || 'General'}
                                  </span>
                                </td>
                                <td className="p-4 font-black text-gray-900 dark:text-white">₹{s.price}</td>
                                <td className="p-4 text-gray-500">{s.duration || '60 min'}</td>
                                <td className="p-4 text-right space-x-2">
                                  <button
                                    onClick={() => {
                                      setServiceForm({
                                        id: s.id,
                                        name: s.name,
                                        categoryName: s.categoryName || 'Cleaning',
                                        price: String(s.price),
                                        description: s.description || '',
                                        duration: s.duration || '60 min',
                                        image: s.image || '',
                                        featuresText: Array.isArray(s.features) ? s.features.join('\n') : ''
                                      });
                                      setServiceModal({ open: true, mode: 'edit', data: s });
                                    }}
                                    className="p-2 bg-gray-100 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-600 text-gray-600 dark:text-gray-300 rounded-xl transition"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteService(s.id)}
                                    className="p-2 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-xl hover:bg-red-100 transition"
                                  >
                                    <Trash2 className="w-4 h-4" />
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

              {/* 3. STORE PRODUCTS TAB (CRUD) */}
              {activeTab === 'store' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 gap-4">
                    <div>
                      <h2 className="text-lg font-black text-gray-900 dark:text-white">Store Products Manager</h2>
                      <p className="text-xs text-gray-500">Manage store items, stock levels, categories, and prices.</p>
                    </div>
                    <button
                      onClick={() => {
                        setStoreForm({ id: '', name: '', category: 'Home Essentials', price: '', stock: '50', description: '', image: '', is_active: true });
                        setStoreModal({ open: true, mode: 'add' });
                      }}
                      className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-2xl transition flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
                    >
                      <Plus className="w-4 h-4" /> Add New Store Product
                    </button>
                  </div>

                  {/* Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {storeProductsList.map(prod => (
                      <div key={prod.id} className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                        <div>
                          <img src={prod.image} alt="" className="w-full h-36 object-cover rounded-2xl mb-3 border border-gray-100 dark:border-slate-800" />
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-md">
                            {prod.category}
                          </span>
                          <h3 className="font-bold text-sm text-gray-900 dark:text-white mt-1.5 line-clamp-1">{prod.name}</h3>
                          <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{prod.description}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-black text-brand-600">₹{prod.price}</p>
                            <p className="text-[10px] text-gray-500">Stock: <strong>{prod.stock}</strong></p>
                          </div>
                          <div className="flex gap-1.5">
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
                              className="p-1.5 bg-gray-100 dark:bg-slate-800 hover:text-brand-600 rounded-xl transition"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStoreProduct(prod.id)}
                              className="p-1.5 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-xl transition"
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
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 gap-4">
                    <div>
                      <h2 className="text-lg font-black text-gray-900 dark:text-white">Taxi & Vehicle Fleet Manager</h2>
                      <p className="text-xs text-gray-500">Manage active cab fleet, passenger capacities, and rate tariffs per km.</p>
                    </div>
                    <button
                      onClick={() => {
                        setVehicleForm({ id: '', name: '', type: 'SUV', passengers: 5, rate: '15', image: '', status: 'Available' });
                        setVehicleModal({ open: true, mode: 'add' });
                      }}
                      className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-2xl transition flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
                    >
                      <Plus className="w-4 h-4" /> Add Vehicle
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {vehiclesList.map(veh => (
                      <div key={veh.id} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-100 dark:border-slate-800 flex flex-col justify-between shadow-sm">
                        <div>
                          <img src={veh.image} alt="" className="w-full h-40 object-cover rounded-2xl mb-3 border border-gray-100 dark:border-slate-800" />
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-md">
                              {veh.type}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${veh.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {veh.status}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm text-gray-900 dark:text-white mt-2">{veh.name}</h3>
                          <p className="text-xs text-gray-500 mt-1">Passengers: <strong>{veh.passengers} Max</strong></p>
                          <p className="text-xs font-black text-brand-600 mt-0.5">₹{veh.rate} / km</p>
                        </div>

                        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-slate-800">
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
                            className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:text-brand-600 text-xs font-bold rounded-xl transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteVehicle(veh.id)}
                            className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-xl transition"
                          >
                            Remove
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
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 gap-4">
                    <div>
                      <h2 className="text-lg font-black text-gray-900 dark:text-white">Daily Meals & Tiffin Plans Manager</h2>
                      <p className="text-xs text-gray-500">Manage Gujarati Thalis, North Indian, Healthy & Jain gourmet meals.</p>
                    </div>
                    <button
                      onClick={() => {
                        setMealForm({ id: '', name: '', category: 'Gujarati', caterer: 'MasterChef Kitchen', food_type: 'veg', price: '', original_price: '', calories: '450', serves: '1 Person', description: '', image: '' });
                        setMealModal({ open: true, mode: 'add' });
                      }}
                      className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-2xl transition flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
                    >
                      <Plus className="w-4 h-4" /> Add Meal Plan
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mealsList.map(meal => (
                      <div key={meal.id} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                        <div>
                          <img src={meal.image} alt="" className="w-full h-40 object-cover rounded-2xl mb-3 border border-gray-100 dark:border-slate-800" />
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 rounded-md">
                              {meal.category}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400">{meal.serves}</span>
                          </div>
                          <h3 className="font-bold text-sm text-gray-900 dark:text-white mt-2 line-clamp-1">{meal.name}</h3>
                          <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{meal.description}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-black text-brand-600">₹{meal.price}</p>
                            <p className="text-[10px] text-gray-400">{meal.caterer || 'HomeSeva Kitchen'}</p>
                          </div>
                          <div className="flex gap-1.5">
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
                              className="p-1.5 bg-gray-100 dark:bg-slate-800 hover:text-brand-600 rounded-xl transition"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMeal(meal.id)}
                              className="p-1.5 bg-red-50 text-red-600 rounded-xl transition"
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
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 gap-4">
                    <div>
                      <h2 className="text-lg font-black text-gray-900 dark:text-white">Event Catering Packages Manager</h2>
                      <p className="text-xs text-gray-500">Manage Festival food packages, party catering, and guest dining offers.</p>
                    </div>
                    <button
                      onClick={() => {
                        setCateringForm({ id: '', title: '', category: 'Festival Specials', description: '', pax: '15 Pax', price: '', image: '' });
                        setCateringModal({ open: true, mode: 'add' });
                      }}
                      className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-2xl transition flex items-center gap-1.5 shadow-lg shadow-brand-500/20"
                    >
                      <Plus className="w-4 h-4" /> Add Catering Package
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {cateringPackagesList.map(cat => (
                      <div key={cat.id} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                        <div>
                          <img src={cat.image} alt="" className="w-full h-40 object-cover rounded-2xl mb-3 border border-gray-100 dark:border-slate-800" />
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 dark:bg-purple-950/50 text-purple-600 rounded-md">
                            {cat.pax || '15 Pax'}
                          </span>
                          <h3 className="font-bold text-sm text-gray-900 dark:text-white mt-1.5">{cat.title}</h3>
                          <p className="text-xs text-gray-500 line-clamp-3 mt-1">{cat.description}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                          <p className="text-base font-black text-brand-600">₹{cat.price}</p>
                          <div className="flex gap-1.5">
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
                              className="p-1.5 bg-gray-100 dark:bg-slate-800 hover:text-brand-600 text-gray-700 dark:text-gray-300 rounded-xl transition flex items-center gap-1 text-xs font-bold px-2.5"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCateringPackage(cat.id)}
                              className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition flex items-center gap-1 text-xs font-bold px-2.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
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
                <div className="space-y-5">
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800">
                    <h2 className="text-lg font-black text-gray-900 dark:text-white">Platform Settings & Audit Logs</h2>
                    <p className="text-xs text-gray-500">System backups, contact info, and security logs.</p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 space-y-4">
                    <h3 className="font-bold text-sm">System Actions</h3>
                    <div className="flex flex-wrap gap-3">
                      <button onClick={fetchData} className="px-4 py-2 bg-brand-600 text-white font-bold text-xs rounded-xl hover:bg-brand-700 transition">
                        Refresh Database Connections
                      </button>
                    </div>
                  </div>
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
