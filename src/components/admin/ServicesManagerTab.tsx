import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  Search,
  Plus,
  Edit,
  Trash2,
  Copy,
  Sparkles,
  Star,
  Flame,
  CheckCircle2,
  XCircle,
  Upload,
  ArrowUpDown,
  Filter,
  Eye,
  Tag,
  AlertTriangle,
  RefreshCw,
  Clock,
  MapPin,
  Check,
  X,
  Zap,
  Droplets,
  Wind,
  Paintbrush,
  UtensilsCrossed,
  Shield,
  Car
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import type { Service } from '../../types';

const ICON_OPTIONS = [
  { name: 'Wrench', icon: Wrench },
  { name: 'Droplets', icon: Droplets },
  { name: 'Zap', icon: Zap },
  { name: 'Wind', icon: Wind },
  { name: 'Paintbrush', icon: Paintbrush },
  { name: 'UtensilsCrossed', icon: UtensilsCrossed },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Shield', icon: Shield },
  { name: 'Car', icon: Car },
];

const PREDEFINED_CATEGORIES = [
  'Cleaning',
  'Plumbing',
  'Electrical',
  'AC Repair',
  'Painting',
  'HVAC',
  'Security',
  'Catering',
  'Meal Services',
  'Taxi',
  'Salon',
  'Laundry',
  'Pest Control',
  'Festival',
  'Home Repair',
  'Appliance Repair',
  'Gardening',
  'Construction',
  'Interior',
  'Others'
];

export function ServicesManagerTab() {
  const { toast } = useToast();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search, Filters & Sorting State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // all | active | inactive
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(false);
  const [popularOnly, setPopularOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('sortOrder'); // sortOrder | newest | oldest | priceAsc | priceDesc

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Add/Edit Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  // Form State
  const [form, setForm] = useState({
    id: '',
    name: '',
    shortDescription: '',
    description: '',
    categoryName: 'Cleaning',
    price: '',
    originalPrice: '',
    duration: '60 min',
    image: '',
    icon: 'Wrench',
    badge: '',
    featured: false,
    popular: false,
    is_active: true,
    sortOrder: 0,
    tagsText: '',
    featuresText: ''
  });

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; service: Service | null }>({ open: false, service: null });

  // Fetch Services from Database
  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAdminServices();
      if (Array.isArray(data)) {
        setServices(data);
      }
    } catch (err: any) {
      toast(err.message || 'Failed to load services from database', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Filtered and Sorted Services list
  const filteredServices = useMemo(() => {
    let list = [...services];

    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.categoryName?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.shortDescription?.toLowerCase().includes(q)
      );
    }

    // Category Filter
    if (categoryFilter !== 'all') {
      list = list.filter((s) => s.categoryName === categoryFilter);
    }

    // Status Filter
    if (statusFilter === 'active') {
      list = list.filter((s) => s.is_active !== false && s.active !== false);
    } else if (statusFilter === 'inactive') {
      list = list.filter((s) => s.is_active === false || s.active === false);
    }

    // Featured Filter
    if (featuredOnly) {
      list = list.filter((s) => Boolean(s.featured));
    }

    // Popular Filter
    if (popularOnly) {
      list = list.filter((s) => Boolean(s.popular));
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'sortOrder') return (a.sortOrder || 0) - (b.sortOrder || 0);
      if (sortBy === 'newest') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      if (sortBy === 'priceAsc') return a.price - b.price;
      if (sortBy === 'priceDesc') return b.price - a.price;
      return 0;
    });

    return list;
  }, [services, searchQuery, categoryFilter, statusFilter, featuredOnly, popularOnly, sortBy]);

  // Paginated List
  const totalItems = filteredServices.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredServices.slice(start, start + pageSize);
  }, [filteredServices, currentPage, pageSize]);

  // Category counts
  const categoriesList = useMemo(() => {
    const set = new Set<string>(PREDEFINED_CATEGORIES);
    services.forEach((s) => {
      if (s.categoryName) set.add(s.categoryName);
    });
    return Array.from(set);
  }, [services]);

  // Handle Form Input Reset
  const handleOpenAddModal = () => {
    setForm({
      id: '',
      name: '',
      shortDescription: '',
      description: '',
      categoryName: 'Cleaning',
      price: '',
      originalPrice: '',
      duration: '60 min',
      image: '',
      icon: 'Wrench',
      badge: '',
      featured: false,
      popular: false,
      is_active: true,
      sortOrder: (services.length + 1) * 10,
      tagsText: '',
      featuresText: 'Verified Professional\n100% Satisfaction Guarantee'
    });
    setModalMode('add');
    setModalOpen(true);
  };

  const handleOpenEditModal = (service: Service) => {
    setForm({
      id: service.id,
      name: service.name || service.title || '',
      shortDescription: service.shortDescription || '',
      description: service.description || service.fullDescription || '',
      categoryName: service.categoryName || 'Cleaning',
      price: String(service.price || ''),
      originalPrice: String(service.originalPrice || service.discountPrice || ''),
      duration: service.duration || '60 min',
      image: service.image || '',
      icon: service.icon || 'Wrench',
      badge: service.badge || '',
      featured: Boolean(service.featured),
      popular: Boolean(service.popular),
      is_active: service.is_active !== false && service.active !== false,
      sortOrder: service.sortOrder || 0,
      tagsText: Array.isArray(service.tags) ? service.tags.join(', ') : '',
      featuresText: Array.isArray(service.features) ? service.features.join('\n') : ''
    });
    setModalMode('edit');
    setModalOpen(true);
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await apiClient.uploadImage(file);
      if (res && res.url) {
        setForm((prev) => ({ ...prev, image: res.url }));
        toast('Service image uploaded successfully!', 'success');
      }
    } catch (err: any) {
      toast(err.message || 'Image upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Save Service (Create or Update)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || isNaN(Number(form.price))) {
      toast('Please enter a valid service name and numeric price', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        title: form.name.trim(),
        categoryName: form.categoryName,
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim() || form.shortDescription.trim(),
        fullDescription: form.description.trim(),
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : Math.round(Number(form.price) * 1.3),
        discountPrice: form.originalPrice ? Number(form.originalPrice) : Math.round(Number(form.price) * 1.3),
        duration: form.duration.trim() || '60 min',
        image: form.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=400',
        icon: form.icon,
        badge: form.badge.trim(),
        featured: form.featured,
        popular: form.popular,
        is_active: form.is_active,
        active: form.is_active,
        sortOrder: Number(form.sortOrder || 0),
        tags: form.tagsText.split(',').map((t) => t.trim()).filter(Boolean),
        features: form.featuresText.split('\n').map((f) => f.trim()).filter(Boolean)
      };

      if (modalMode === 'edit' && form.id) {
        await apiClient.updateService(form.id, payload);
        toast('Service updated successfully!', 'success');
      } else {
        await apiClient.addService(payload);
        toast('New service created successfully!', 'success');
      }

      setModalOpen(false);
      fetchServices();
    } catch (err: any) {
      toast(err.message || 'Failed to save service', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Toggle Status / Featured / Popular
  const handleToggle = async (id: string, field: 'is_active' | 'featured' | 'popular', currentValue: boolean) => {
    // Optimistic UI Update
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: !currentValue, active: field === 'is_active' ? !currentValue : s.active } : s))
    );

    try {
      await apiClient.toggleServiceToggle(id, { [field]: !currentValue });
      toast(`Service ${field.replace('_', ' ')} updated!`, 'success');
    } catch (err: any) {
      // Revert if API fails
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, [field]: currentValue, active: field === 'is_active' ? currentValue : s.active } : s))
      );
      toast(err.message || 'Toggle update failed', 'error');
    }
  };

  // Duplicate Service
  const handleDuplicateService = async (id: string) => {
    try {
      await apiClient.duplicateService(id);
      toast('Service duplicated successfully!', 'success');
      fetchServices();
    } catch (err: any) {
      toast(err.message || 'Failed to duplicate service', 'error');
    }
  };

  // Delete Service
  const confirmDeleteService = async () => {
    if (!deleteModal.service) return;
    const targetId = deleteModal.service.id;
    try {
      setServices((prev) => prev.filter((s) => s.id !== targetId));
      await apiClient.deleteService(targetId);
      toast('Service deleted from database successfully!', 'success');
      setDeleteModal({ open: false, service: null });
    } catch (err: any) {
      toast(err.message || 'Failed to delete service', 'error');
      fetchServices();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Summary Stats Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
              SINGLE SOURCE OF TRUTH
            </span>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Admin Services Manager</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage all application services dynamically in real-time. Changes here automatically sync with frontend selection cards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            onClick={fetchServices}
            className="p-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-2xl transition flex items-center gap-1.5 text-xs font-bold"
            title="Refresh from Database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex-1 lg:flex-initial px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add New Service
          </button>
        </div>
      </div>

      {/* 2. Quick Stat Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Services</p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">{services.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Services</p>
            <p className="text-xl font-black text-emerald-600 mt-0.5">
              {services.filter((s) => s.is_active !== false && s.active !== false).length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Featured Items</p>
            <p className="text-xl font-black text-amber-500 mt-0.5">
              {services.filter((s) => s.featured).length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Popular Items</p>
            <p className="text-xl font-black text-purple-600 mt-0.5">
              {services.filter((s) => s.popular).length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
            <Flame className="w-5 h-5 fill-purple-600 text-purple-600" />
          </div>
        </div>
      </div>

      {/* 3. Search Bar, Category Filters & Sort Controls */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Service Name, Category, or Description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 h-11 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 px-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-700 dark:text-gray-200 outline-none focus:border-brand-500"
            >
              <option value="all">All Categories ({services.length})</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} ({services.filter((s) => s.categoryName === cat).length})
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 px-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-700 dark:text-gray-200 outline-none focus:border-brand-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-11 px-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-700 dark:text-gray-200 outline-none focus:border-brand-500"
            >
              <option value="sortOrder">Sort Order (Custom)</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Filter Badges & Toggle Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
          <button
            onClick={() => setFeaturedOnly(!featuredOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition ${
              featuredOnly
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-amber-50 hover:text-amber-600'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${featuredOnly ? 'fill-white' : ''}`} /> Featured Only
          </button>

          <button
            onClick={() => setPopularOnly(!popularOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition ${
              popularOnly
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-purple-50 hover:text-purple-600'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${popularOnly ? 'fill-white' : ''}`} /> Popular Only
          </button>

          {(searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' || featuredOnly || popularOnly) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setStatusFilter('all');
                setFeaturedOnly(false);
                setPopularOnly(false);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 transition"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Services Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mb-3" />
            <p className="text-xs font-bold text-gray-500">Loading Database Services...</p>
          </div>
        ) : paginatedServices.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Wrench className="w-12 h-12 text-gray-300 dark:text-slate-700 mb-3" />
            <h3 className="font-extrabold text-gray-800 dark:text-white text-base">No Services Found</h3>
            <p className="text-xs text-gray-400 max-w-sm mt-1 mb-4">
              No services matched your query. Click below to add a new service to the database.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md"
            >
              + Create First Service
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50/80 dark:bg-slate-800/60 border-b border-gray-100 dark:border-slate-800 text-gray-400 font-black uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-5">Image & Name</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Price</th>
                  <th className="py-4 px-4">Duration</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-4 text-center">Featured</th>
                  <th className="py-4 px-4 text-center">Popular</th>
                  <th className="py-4 px-4 text-center">Sort</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60 font-medium">
                {paginatedServices.map((s) => {
                  const isActive = s.is_active !== false && s.active !== false;
                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition ${
                        !isActive ? 'opacity-60 bg-gray-50/30 dark:bg-slate-900/30' : ''
                      }`}
                    >
                      {/* Image & Service Title */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3.5">
                          <div className="relative shrink-0">
                            <img
                              src={s.image}
                              alt={s.name}
                              className="w-14 h-14 rounded-2xl object-cover border border-gray-100 dark:border-slate-700 shadow-sm"
                            />
                            {s.badge && (
                              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-brand-600 text-white font-black text-[8px] rounded-md uppercase tracking-wider shadow">
                                {s.badge}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">{s.name || s.title}</h4>
                            </div>
                            <p className="text-[11px] text-gray-400 line-clamp-1 max-w-xs mt-0.5">
                              {s.shortDescription || s.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200/50 dark:border-brand-800/40">
                          {s.categoryName || 'General'}
                        </span>
                      </td>

                      {/* Price & Discount */}
                      <td className="py-4 px-4">
                        <div>
                          <span className="font-black text-sm text-gray-900 dark:text-white">₹{s.price}</span>
                          {(s.originalPrice || s.discountPrice) && (s.originalPrice || 0) > s.price && (
                            <span className="block text-[10px] text-gray-400 line-through font-semibold">
                              ₹{s.originalPrice || s.discountPrice}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-4 px-4 text-gray-500 font-semibold">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{s.duration || '60 min'}</span>
                        </div>
                      </td>

                      {/* Interactive Active / Inactive Toggle Switch */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggle(s.id, 'is_active', isActive)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-700'
                          }`}
                          title={isActive ? 'Click to Disable (Hide on Frontend)' : 'Click to Enable (Show on Frontend)'}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              isActive ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className={`block text-[9px] font-extrabold mt-1 uppercase ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      {/* Featured Toggle */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggle(s.id, 'featured', Boolean(s.featured))}
                          className={`p-2 rounded-xl transition ${
                            s.featured
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'bg-gray-100 dark:bg-slate-800 text-gray-400 hover:text-amber-500'
                          }`}
                          title="Toggle Featured Badge"
                        >
                          <Star className={`w-4 h-4 ${s.featured ? 'fill-white' : ''}`} />
                        </button>
                      </td>

                      {/* Popular Toggle */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggle(s.id, 'popular', Boolean(s.popular))}
                          className={`p-2 rounded-xl transition ${
                            s.popular
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'bg-gray-100 dark:bg-slate-800 text-gray-400 hover:text-purple-600'
                          }`}
                          title="Toggle Popular Badge"
                        >
                          <Flame className={`w-4 h-4 ${s.popular ? 'fill-white' : ''}`} />
                        </button>
                      </td>

                      {/* Sort Order */}
                      <td className="py-4 px-4 text-center font-bold text-gray-600 dark:text-gray-400">
                        {s.sortOrder || 0}
                      </td>

                      {/* Action Buttons (Edit, Duplicate, Delete) */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(s)}
                            className="p-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-brand-50 hover:text-brand-600 rounded-xl transition"
                            title="Edit Service Details"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicateService(s.id)}
                            className="p-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition"
                            title="Duplicate Service"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, service: s })}
                            className="p-2 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-xl hover:bg-red-100 transition"
                            title="Delete Service"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Pagination Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-gray-500 font-medium">
            <span>Show rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-bold outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>
              Showing {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, totalItems)} of {totalItems} items
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 font-bold text-xs disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
            >
              Previous
            </button>
            <span className="font-extrabold text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 font-bold text-xs disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 6. ADD / EDIT SERVICE MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-850/50">
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">
                    {modalMode === 'add' ? 'Add New Service to Database' : 'Edit Service Details'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Updates will instantly sync with the frontend service selection page.
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body Form */}
              <form onSubmit={handleSaveService} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Service Name */}
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Service Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Deluxe Bathroom Deep Cleaning"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-medium outline-none focus:border-brand-500"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      list="categories-list"
                      required
                      placeholder="Select or type category..."
                      value={form.categoryName}
                      onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-medium outline-none focus:border-brand-500"
                    />
                    <datalist id="categories-list">
                      {PREDEFINED_CATEGORIES.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Short Description (Displayed on Card)
                  </label>
                  <input
                    type="text"
                    placeholder="Brief 1-line summary for service card..."
                    value={form.shortDescription}
                    onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-medium outline-none focus:border-brand-500"
                  />
                </div>

                {/* Full Description */}
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Full Description & Scope of Work
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Comprehensive description of service steps and inclusions..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-medium outline-none focus:border-brand-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Price */}
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="e.g. 1499"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-black text-sm outline-none focus:border-brand-500"
                    />
                  </div>

                  {/* Original / Discount Price */}
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Original Price (MRP)
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="e.g. 1999"
                      value={form.originalPrice}
                      onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-medium outline-none focus:border-brand-500"
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 60 min, 2-3 hrs"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-medium outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* Service Image Upload & URL */}
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Service Image (Upload or Paste URL)
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      className="flex-1 h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-medium outline-none focus:border-brand-500"
                    />
                    <label className="px-4 h-11 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition shrink-0">
                      <Upload className={`w-4 h-4 ${uploadingImage ? 'animate-bounce' : ''}`} />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                  {form.image && (
                    <div className="mt-2.5 flex items-center gap-3 bg-gray-50 dark:bg-slate-800/40 p-2 rounded-xl border border-gray-100 dark:border-slate-800">
                      <img src={form.image} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                      <span className="text-[11px] text-emerald-600 font-bold">✓ Image Preview Loaded</span>
                    </div>
                  )}
                </div>

                {/* Badge Text & Sort Order */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Badge Text (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. FRESH, 20% OFF, POPULAR"
                      value={form.badge}
                      onChange={(e) => setForm({ ...form, badge: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-medium outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Sort Order (Lower = First)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.sortOrder}
                      onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-bold outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* Toggles: Active, Featured, Popular */}
                <div className="flex flex-wrap items-center gap-6 p-4 rounded-2xl bg-gray-50 dark:bg-slate-850 border border-gray-100 dark:border-slate-800">
                  <label className="flex items-center gap-2.5 cursor-pointer font-bold text-gray-800 dark:text-gray-200">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                    />
                    <span>Active Status (Show on Frontend)</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer font-bold text-amber-600 dark:text-amber-400">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                    />
                    <span>Featured Badge</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer font-bold text-purple-600 dark:text-purple-400">
                    <input
                      type="checkbox"
                      checked={form.popular}
                      onChange={(e) => setForm({ ...form, popular: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span>Popular Badge</span>
                  </label>
                </div>

                {/* Service Features Bullets */}
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Features / Inclusions (1 item per line)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Verified professional&#10;99.9% sanitization&#10;Free 30-day warranty"
                    value={form.featuresText}
                    onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white font-medium outline-none focus:border-brand-500"
                  />
                </div>

                {/* Modal Footer Controls */}
                <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold rounded-xl shadow-lg shadow-brand-500/20 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : modalMode === 'add' ? 'Create Service' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. DELETE CONFIRMATION DIALOG */}
      <AnimatePresence>
        {deleteModal.open && deleteModal.service && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">Delete Service Confirmation</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Are you sure you want to delete <strong className="text-gray-900 dark:text-white">"{deleteModal.service.name}"</strong>?
                  This action will permanently delete it from the database and remove it from the frontend.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteModal({ open: false, service: null })}
                  className="px-5 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteService}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl shadow-lg shadow-red-500/25 text-xs transition"
                >
                  Yes, Delete Service
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
