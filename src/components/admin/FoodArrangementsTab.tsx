import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Search, Plus, Pencil, Trash2, Check, X, Calendar, Users, Phone, MapPin, Star, AlertCircle, Filter, ChevronLeft, ChevronRight, Eye, UserCheck } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface CateringReq {
  id: string;
  customer_name: string;
  customer_email: string;
  event_details: string;
  guests: number;
  date: string;
  preferences: string;
  budget: number;
  status: 'SUBMITTED' | 'UNDER REVIEW' | 'CONFIRMED' | 'COMPLETED';
  vendor: string;
  notes?: string;
}

interface CateringPkg {
  id: string;
  title: string;
  category: string;
  capacity: string;
  price: number;
  description: string;
  image: string;
  is_active: boolean;
}

interface CategoryItem {
  id: string;
  name: string;
  created_at: string;
}

interface GalleryItem {
  id: string;
  title: string;
  image: string;
  featured: boolean;
}

const INITIAL_REQUESTS: CateringReq[] = [
  {
    id: 'req_101',
    customer_name: 'trupti',
    customer_email: 'ridhiparmar07@gmail.com',
    event_details: 'Corporate Luncheon',
    guests: 1,
    date: '2026-07-30 11:00 AM',
    preferences: 'Punjabi',
    budget: 2,
    status: 'UNDER REVIEW',
    vendor: 'Unassigned',
    notes: 'Requires VIP executive serving table setup.'
  },
  {
    id: 'req_102',
    customer_name: 'trupti',
    customer_email: 'ridhiparmar07@gmail.com',
    event_details: 'Birthday',
    guests: 22,
    date: '2222-02-22 10:00 AM',
    preferences: 'Gujarati',
    budget: 14987,
    status: 'SUBMITTED',
    vendor: 'Unassigned',
    notes: 'No garlic or onion in two specific sabji dishes.'
  },
  {
    id: 'req_103',
    customer_name: 'Rohit Sharma',
    customer_email: 'rohit.sharma@gmail.com',
    event_details: 'Wedding / Reception',
    guests: 350,
    date: '2026-11-15 07:30 PM',
    preferences: 'Jain, Gujarati, Punjabi',
    budget: 175000,
    status: 'CONFIRMED',
    vendor: 'Swad Royal Caterers',
    notes: 'Grand buffet station with live panipuri and dessert counters.'
  },
  {
    id: 'req_104',
    customer_name: 'Priya Patel',
    customer_email: 'priya.p@yahoo.com',
    event_details: 'Anniversary Celebration',
    guests: 45,
    date: '2026-08-14 01:00 PM',
    preferences: 'South Indian',
    budget: 22500,
    status: 'COMPLETED',
    vendor: 'Udipi Feast Co.',
    notes: 'Traditional banana leaf lunch setup.'
  },
  {
    id: 'req_105',
    customer_name: 'Ankur Mehta',
    customer_email: 'mehta_a@outlook.com',
    event_details: 'Festival Puja & Feast',
    guests: 60,
    date: '2026-09-02 12:00 PM',
    preferences: 'Gujarati, Veg',
    budget: 30000,
    status: 'UNDER REVIEW',
    vendor: 'Unassigned',
    notes: 'Special sweet shrikhand and pooris required.'
  }
];

const INITIAL_PACKAGES: CateringPkg[] = [
  {
    id: 'pkg_1',
    title: 'Festival Food Package',
    category: 'Festival Specials',
    capacity: '15 Persons',
    price: 5000,
    description: 'Bespoke traditional festival food comprising pure ghee sweets (Mohanthal or Sukhadi), premium pooris...',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=200',
    is_active: true
  },
  {
    id: 'pkg_2',
    title: 'Guest Catering Package',
    category: 'Catering',
    capacity: '50 Persons',
    price: 15000,
    description: 'A massive custom premium buffet setup managed by Swad Caterers. Includes live counters and dessert.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=200',
    is_active: true
  },
  {
    id: 'pkg_3',
    title: 'Gujarati Thali',
    category: 'Daily Meals',
    capacity: '1 Persons',
    price: 250,
    description: 'A traditional home-style spread including 3 rotis, 2 seasonal shaaks, dal, rice, kadhi, and sweet.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=200',
    is_active: true
  },
  {
    id: 'pkg_4',
    title: 'Premium Family Meal',
    category: 'Family Packages',
    capacity: '4 Persons',
    price: 1200,
    description: 'A complete family meal consisting of starter paneer tikka, butter naans, punjabi sabji, and gulab jamun.',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=200',
    is_active: true
  }
];

const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: 'cat_c1', name: 'Catering', created_at: '17 Jul 2026, 7:01 pm' },
  { id: 'cat_c2', name: 'Daily Meals', created_at: '17 Jul 2026, 7:01 pm' },
  { id: 'cat_c3', name: 'Family Packages', created_at: '17 Jul 2026, 7:01 pm' },
  { id: 'cat_c4', name: 'Festival Specials', created_at: '17 Jul 2026, 7:01 pm' },
  { id: 'cat_c5', name: 'Corporate Banquets', created_at: '18 Jul 2026, 11:30 am' },
];

const INITIAL_GALLERY: GalleryItem[] = [
  { id: 'gal_1', title: 'Traditional Gujarati Spread', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=500', featured: true },
  { id: 'gal_2', title: 'Sweet Mohanthal Box', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=500', featured: false },
  { id: 'gal_3', title: 'Punjabi Feast Starter', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=500', featured: false },
  { id: 'gal_4', title: 'Live Catering Buffet Setup', image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=500', featured: false },
  { id: 'gal_5', title: 'Executive Lunch Box Setup', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500', featured: false },
];

export function FoodArrangementsTab() {
  // Navigation State
  const [activeSubTab, setActiveSubTab] = useState<'REQUESTS' | 'FOOD PACKAGES' | 'CATEGORIES' | 'GALLERY'>('REQUESTS');

  // Data States
  const [requests, setRequests] = useState<CateringReq[]>(INITIAL_REQUESTS);
  const [packages, setPackages] = useState<CateringPkg[]>(INITIAL_PACKAGES);
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [gallery, setGallery] = useState<GalleryItem[]>(INITIAL_GALLERY);

  // Search and Pagination States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = activeSubTab === 'GALLERY' ? 4 : 5;

  // Request Filter state
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'COMPLETED'>('ALL');

  // Modals state
  const [manageReqModal, setManageReqModal] = useState<CateringReq | null>(null);
  const [vendorInput, setVendorInput] = useState<string>('');
  const [statusInput, setStatusInput] = useState<CateringReq['status']>('UNDER REVIEW');

  const [packageModalOpen, setPackageModalOpen] = useState<boolean>(false);
  const [pkgTitle, setPkgTitle] = useState<string>('');
  const [pkgCategory, setPkgCategory] = useState<string>('Catering');
  const [pkgCapacity, setPkgCapacity] = useState<string>('25 Persons');
  const [pkgPrice, setPkgPrice] = useState<number>(8500);
  const [pkgDesc, setPkgDesc] = useState<string>('');
  const [pkgImage, setPkgImage] = useState<string>('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400');

  const [catModalOpen, setCatModalOpen] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');

  const [photoModalOpen, setPhotoModalOpen] = useState<boolean>(false);
  const [photoTitle, setPhotoTitle] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=600');

  // Fetch from live APIs
  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const reqs = await apiClient.getAdminCateringRequests();
      if (Array.isArray(reqs) && reqs.length > 0) {
        const mapped: CateringReq[] = reqs.map((r: any) => ({
          id: r.id,
          customer_name: r.user_name || r.customer_name || 'Customer',
          customer_email: r.email || r.contact_phone || 'N/A',
          event_details: r.package_title || r.event_type || 'Catering Order',
          guests: r.guest_count || 25,
          date: `${r.event_date} ${r.event_time || ''}`,
          preferences: r.food_preference || 'Standard Veg',
          budget: r.total_estimated_price || r.budget || 0,
          status: (r.status || 'SUBMITTED').toUpperCase() as any,
          vendor: r.vendor || 'Unassigned',
          notes: r.special_notes || r.special_requirements || ''
        }));
        setRequests(mapped);
      }
    } catch (err) {
      console.warn('Using fallback requests:', err);
    }

    try {
      const pkgs = await apiClient.getAdminCateringPackages();
      if (Array.isArray(pkgs) && pkgs.length > 0) {
        const mappedPkg: CateringPkg[] = pkgs.map((p: any) => ({
          id: p.id,
          title: p.title,
          category: p.category || 'Catering',
          capacity: p.pax || `${p.minimum_guests || 15} Pax`,
          price: p.price || 0,
          description: p.description || '',
          image: p.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=400',
          is_active: Boolean(p.is_active ?? true)
        }));
        setPackages(mappedPkg);
      }
    } catch (err) {
      console.warn('Using fallback packages:', err);
    }

    try {
      const gals = await apiClient.getCateringGallery();
      if (Array.isArray(gals) && gals.length > 0) {
        const mappedGal: GalleryItem[] = gals.map((g: any) => ({
          id: g.id,
          title: g.title,
          image: g.image,
          featured: Boolean(g.featured)
        }));
        setGallery(mappedGal);
      }
    } catch (err) {
      console.warn('Using fallback gallery:', err);
    }
  };

  const handleSubTabChange = (tab: 'REQUESTS' | 'FOOD PACKAGES' | 'CATEGORIES' | 'GALLERY') => {
    setActiveSubTab(tab);
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Filter & Pagination calculation for current view
  const getFilteredData = () => {
    const q = searchQuery.toLowerCase().trim();

    if (activeSubTab === 'REQUESTS') {
      let list = requests;
      if (statusFilter === 'PENDING') list = list.filter((r) => r.status === 'SUBMITTED' || r.status === 'UNDER REVIEW');
      if (statusFilter === 'ACTIVE') list = list.filter((r) => r.status === 'CONFIRMED');
      if (statusFilter === 'COMPLETED') list = list.filter((r) => r.status === 'COMPLETED');

      if (q) {
        list = list.filter((r) => 
          r.customer_name.toLowerCase().includes(q) ||
          r.customer_email.toLowerCase().includes(q) ||
          r.event_details.toLowerCase().includes(q) ||
          r.preferences.toLowerCase().includes(q) ||
          r.vendor.toLowerCase().includes(q)
        );
      }
      return list;
    }

    if (activeSubTab === 'FOOD PACKAGES') {
      let list = packages;
      if (q) {
        list = list.filter((p) => 
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.capacity.toLowerCase().includes(q) ||
          p.price.toString().includes(q)
        );
      }
      return list;
    }

    if (activeSubTab === 'CATEGORIES') {
      let list = categories;
      if (q) list = list.filter((c) => c.name.toLowerCase().includes(q));
      return list;
    }

    if (activeSubTab === 'GALLERY') {
      let list = gallery;
      if (q) list = list.filter((g) => g.title.toLowerCase().includes(q));
      return list;
    }

    return [];
  };

  const filteredItems = getFilteredData();
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const currentPaginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Actions handlers
  const handleOpenManageModal = (req: CateringReq) => {
    setManageReqModal(req);
    setVendorInput(req.vendor === 'Unassigned' ? '' : req.vendor);
    setStatusInput(req.status);
  };

  const handleSaveManageModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manageReqModal) return;
    try {
      await apiClient.updateAdminCateringStatus(manageReqModal.id, statusInput, vendorInput ? `Vendor assigned: ${vendorInput}` : 'Status updated by team');
    } catch (err) {
      console.error('Failed updating backend status:', err);
    }
    setRequests((prev) =>
      prev.map((r) =>
        r.id === manageReqModal.id
          ? { ...r, status: statusInput, vendor: vendorInput || 'Unassigned' }
          : r
      )
    );
    setManageReqModal(null);
  };

  const handleDeleteRequest = async (id: string) => {
    if (confirm('Delete this catering request log?')) {
      try {
        await apiClient.deleteAdminCateringRequest(id);
      } catch (err) {
        console.error(err);
      }
      setRequests((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgTitle || !pkgPrice) return alert('Enter Title and Price');
    const tempId = 'pkg_' + Date.now();
    const newPkg: CateringPkg = {
      id: tempId,
      title: pkgTitle,
      category: pkgCategory,
      capacity: pkgCapacity,
      price: Number(pkgPrice),
      description: pkgDesc || 'Custom gourmet setup with professional catering attendants.',
      image: pkgImage || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=400',
      is_active: true
    };
    setPackages([newPkg, ...packages]);
    setPackageModalOpen(false);

    try {
      await apiClient.addCateringPackage({
        title: newPkg.title,
        category: newPkg.category,
        description: newPkg.description,
        pax: newPkg.capacity,
        price: newPkg.price,
        image: newPkg.image
      });
      fetchAdminData();
    } catch (err) {
      console.error('Failed to create package:', err);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (confirm('Are you sure you want to delete this catering package?')) {
      setPackages(packages.filter((p) => p.id !== id));
      try {
        await apiClient.deleteCateringPackage(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const item: CategoryItem = {
      id: 'cat_c_' + Date.now(),
      name: newCatName.trim(),
      created_at: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    setCategories([item, ...categories]);
    setCatModalOpen(false);
    setNewCatName('');
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoTitle || !photoUrl) return;
    const item: GalleryItem = {
      id: 'gal_' + Date.now(),
      title: photoTitle,
      image: photoUrl,
      featured: false
    };
    setGallery([item, ...gallery]);
    setPhotoModalOpen(false);

    try {
      await apiClient.addAdminCateringGallery({
        title: photoTitle,
        category: 'Wedding',
        image: photoUrl,
        featured: 0
      });
      fetchAdminData();
    } catch (err) {
      console.error('Failed adding photo to backend:', err);
    }
  };

  const toggleFeatured = (id: string) => {
    setGallery(gallery.map((g) => (g.id === id ? { ...g, featured: !g.featured } : g)));
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto text-left">
      {/* ── Header Card Banner (Matches Admin Portal Style) ── */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.2rem] p-7 sm:p-9 border border-gray-100 dark:border-slate-800 shadow-xs relative overflow-hidden">
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-1.5 mb-2">
          <ChefHat className="w-4 h-4 stroke-[2.5]" />
          <span>ADMIN PORTAL</span>
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Food Arrangements
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mt-1.5 max-w-2xl leading-relaxed">
          Manage bespoke event catering packages, food categories, request logs, and concierge dining setups.
        </p>

        {/* ── Segmented Tab Selector ── */}
        <div className="mt-7 pt-6 border-t border-gray-100 dark:border-slate-800/80">
          <div className="bg-slate-100/90 dark:bg-slate-800/90 p-1.5 rounded-2xl w-fit flex flex-wrap gap-1 border border-gray-200/60 dark:border-slate-700">
            {(['REQUESTS', 'FOOD PACKAGES', 'CATEGORIES', 'GALLERY'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleSubTabChange(tab)}
                className={`px-5 sm:px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm tracking-wider uppercase transition-all ${
                  activeSubTab === tab
                    ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-sm scale-[1.02]'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-extrabold'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sub-header: Filters + Search + Create Actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {activeSubTab === 'REQUESTS' && (
          <div className="flex gap-2 flex-wrap">
            {(['ALL', 'PENDING', 'ACTIVE', 'COMPLETED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => { setStatusFilter(st); setCurrentPage(1); }}
                className={`px-5 py-2 rounded-full text-xs font-black tracking-wider uppercase transition ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 text-gray-600 dark:text-gray-300 hover:border-gray-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}

        {activeSubTab === 'FOOD PACKAGES' && (
          <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">Catering Packages</h2>
        )}

        {activeSubTab === 'CATEGORIES' && (
          <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">Menu Categories</h2>
        )}

        {activeSubTab === 'GALLERY' && (
          <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">Catering Food Gallery</h2>
        )}

        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 justify-end">
          {/* Reusable Search Bar */}
          <div className="relative w-full sm:w-72 md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeSubTab.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full h-11 pl-10 pr-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 text-xs sm:text-sm font-bold text-gray-800 dark:text-white outline-none focus:border-blue-500 shadow-2xs transition"
            />
          </div>

          {activeSubTab === 'FOOD PACKAGES' && (
            <button
              onClick={() => setPackageModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm px-5 py-3 rounded-2xl flex items-center gap-2 shadow-sm transition shrink-0 whitespace-nowrap active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Package</span>
            </button>
          )}

          {activeSubTab === 'CATEGORIES' && (
            <button
              onClick={() => setCatModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm px-5 py-3 rounded-2xl flex items-center gap-2 shadow-sm transition shrink-0 whitespace-nowrap active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Category</span>
            </button>
          )}

          {activeSubTab === 'GALLERY' && (
            <button
              onClick={() => setPhotoModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm px-5 py-3 rounded-2xl flex items-center gap-2 shadow-sm transition shrink-0 whitespace-nowrap active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Photo</span>
            </button>
          )}
        </div>
      </div>

      {/* ── TAB 1: REQUESTS TABLE VIEW (Screenshot 1) ── */}
      {activeSubTab === 'REQUESTS' && (
        <div className="bg-white dark:bg-slate-900 rounded-[2.2rem] border border-gray-100 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-50/50 dark:bg-slate-850/40">
                  <th className="py-4 pl-6 pr-4">CUSTOMER</th>
                  <th className="py-4 px-4">EVENT DETAILS</th>
                  <th className="py-4 px-4">PREFERENCES</th>
                  <th className="py-4 px-4">STATUS</th>
                  <th className="py-4 px-4">VENDOR</th>
                  <th className="py-4 pr-6 pl-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
                {(currentPaginatedItems as CateringReq[]).map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-4 pl-6 pr-4">
                      <p className="font-black text-gray-900 dark:text-white text-sm">{row.customer_name}</p>
                      <p className="text-xs text-gray-400 font-semibold">{row.customer_email}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-extrabold text-gray-800 dark:text-gray-200">{row.event_details}</p>
                      <p className="text-xs text-gray-500">{row.guests} guests <span className="mx-1">•</span> {row.date}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-extrabold text-[10px] px-2.5 py-1 rounded-md block w-fit mb-1 border border-gray-200/50 dark:border-slate-700">
                        {row.preferences || 'General'}
                      </span>
                      <span className="font-black text-blue-600 dark:text-blue-400 text-xs">
                        Budget: ₹{row.budget.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg font-black text-[10px] tracking-wide uppercase ${
                        row.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-500/20 dark:text-green-400' :
                        row.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400' :
                        row.status === 'UNDER REVIEW' ? 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300' :
                        'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-400'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-gray-600 dark:text-gray-300">{row.vendor}</span>
                    </td>
                    <td className="py-4 pr-6 pl-4 text-right">
                      <button
                        onClick={() => handleOpenManageModal(row)}
                        className="bg-slate-950 dark:bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition active:scale-95"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-gray-400 font-extrabold text-sm">
                      No catering requests matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredItems.length > 0 && (
            <div className="flex items-center justify-between p-6 border-t border-gray-100 dark:border-slate-800 text-xs font-bold text-gray-500">
              <span>Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} entries</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 transition flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 rounded-xl transition font-black ${
                      currentPage === p
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 transition flex items-center gap-1"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: FOOD PACKAGES TABLE VIEW (Screenshot 2) ── */}
      {activeSubTab === 'FOOD PACKAGES' && (
        <div className="bg-white dark:bg-slate-900 rounded-[2.2rem] border border-gray-100 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-50/50 dark:bg-slate-850/40">
                  <th className="py-4 pl-6 pr-4">PACKAGE</th>
                  <th className="py-4 px-4">CATEGORY</th>
                  <th className="py-4 px-4">CAPACITY</th>
                  <th className="py-4 px-4">PRICE</th>
                  <th className="py-4 px-4">AVAILABILITY</th>
                  <th className="py-4 pr-6 pl-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
                {(currentPaginatedItems as CateringPkg[]).map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-4 pl-6 pr-4 flex items-center gap-3.5 min-w-[240px]">
                      <img src={pkg.image} alt="" className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-gray-200 dark:border-slate-700" />
                      <div>
                        <p className="font-black text-gray-900 dark:text-white text-sm">{pkg.title}</p>
                        <p className="text-xs text-gray-400 font-semibold line-clamp-1 max-w-[220px]">{pkg.description}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-extrabold text-gray-700 dark:text-gray-300">{pkg.category}</td>
                    <td className="py-4 px-4 font-bold text-gray-600 dark:text-gray-400">{pkg.capacity}</td>
                    <td className="py-4 px-4 font-black text-gray-900 dark:text-white text-sm">₹{pkg.price.toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-lg bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400 font-black text-[10px] tracking-wide uppercase border border-green-200 dark:border-green-500/30">
                        ACTIVE
                      </span>
                    </td>
                    <td className="py-4 pr-6 pl-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-gray-400">
                        <button
                          onClick={() => alert(`Edit package: ${pkg.title}`)}
                          className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-blue-600 flex items-center justify-center transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-red-600 flex items-center justify-center transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredItems.length > 0 && (
            <div className="flex items-center justify-between p-6 border-t border-gray-100 dark:border-slate-800 text-xs font-bold text-gray-500">
              <span>Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} entries</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 disabled:opacity-40 transition"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 rounded-xl transition font-black ${currentPage === p ? 'bg-blue-600 text-white shadow-xs' : 'border border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: CATEGORIES TABLE VIEW (Screenshot 3) ── */}
      {activeSubTab === 'CATEGORIES' && (
        <div className="bg-white dark:bg-slate-900 rounded-[2.2rem] border border-gray-100 dark:border-slate-800 shadow-xs overflow-hidden max-w-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-50/50 dark:bg-slate-850/40">
                  <th className="py-4 pl-6 pr-4">CATEGORY NAME</th>
                  <th className="py-4 px-4">CREATED AT</th>
                  <th className="py-4 pr-6 pl-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
                {(currentPaginatedItems as CategoryItem[]).map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-4.5 pl-6 pr-4 font-black text-gray-900 dark:text-white text-sm sm:text-base">
                      {cat.name}
                    </td>
                    <td className="py-4.5 px-4 text-xs text-gray-400 font-semibold font-mono">
                      {cat.created_at}
                    </td>
                    <td className="py-4 pr-6 pl-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-gray-400">
                        <button
                          onClick={() => { const nm = prompt('New Category Name:', cat.name); if(nm) setCategories(categories.map(c=>c.id===cat.id?{...c, name:nm}:c)); }}
                          className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-blue-600 flex items-center justify-center transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { if(confirm('Delete this category?')) setCategories(categories.filter(c => c.id !== cat.id)); }}
                          className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-red-600 flex items-center justify-center transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredItems.length > 0 && (
            <div className="flex items-center justify-between p-6 border-t border-gray-100 dark:border-slate-800 text-xs font-bold text-gray-500">
              <span>Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} entries</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-xl border disabled:opacity-40">Prev</button>
                <span className="font-extrabold px-2 text-gray-800 dark:text-white">{currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-xl border disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: GALLERY GRID VIEW (Screenshot 4) ── */}
      {activeSubTab === 'GALLERY' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(currentPaginatedItems as GalleryItem[]).map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition">
                <div className="h-52 overflow-hidden relative">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                  <h4 className="font-black text-gray-900 dark:text-white text-sm line-clamp-1">{item.title}</h4>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleFeatured(item.id)}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-[10px] tracking-wider uppercase transition ${
                        item.featured
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 font-black'
                          : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {item.featured ? '★ FEATURED' : 'Set Featured'}
                    </button>
                    <button
                      onClick={() => { if(confirm('Remove this photo from gallery?')) setGallery(gallery.filter(g => g.id !== item.id)); }}
                      className="w-8 h-8 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 flex items-center justify-center transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Gallery Pagination Controls */}
          {filteredItems.length > 0 && (
            <div className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 text-xs font-bold text-gray-500">
              <span>Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} gallery photos</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-xl border disabled:opacity-40 transition">Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 rounded-xl font-black ${currentPage === p ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50 text-gray-700'}`}>{p}</button>
                ))}
                <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="px-4 py-2 rounded-xl border disabled:opacity-40 transition">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: MANAGE REQUEST (When Admin Clicks Manage Button) ── */}
      <AnimatePresence>
        {manageReqModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-7 max-w-md w-full border border-gray-100 dark:border-slate-800 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
                <h3 className="text-xl font-black text-gray-900 dark:text-white">Manage Request #{manageReqModal.id.slice(-6)}</h3>
                <button onClick={() => setManageReqModal(null)} className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <form onSubmit={handleSaveManageModal} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400">Customer</p>
                  <p className="font-bold text-gray-800 dark:text-gray-100">{manageReqModal.customer_name} ({manageReqModal.customer_email})</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400">Event Info & Budget</p>
                  <p className="font-extrabold text-blue-600 dark:text-blue-400">{manageReqModal.event_details} • {manageReqModal.guests} guests • ₹{manageReqModal.budget.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Update Status</label>
                  <select value={statusInput} onChange={(e) => setStatusInput(e.target.value as any)} className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-extrabold outline-none focus:border-blue-500">
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="UNDER REVIEW">UNDER REVIEW</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Assign Caterer Vendor</label>
                  <input type="text" placeholder="e.g. Swad Royal Caterers" value={vendorInput} onChange={(e) => setVendorInput(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold outline-none focus:border-blue-500" />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => handleDeleteRequest(manageReqModal.id)} className="px-4 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition">Delete</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-md transition">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL: ADD NEW PACKAGE ── */}
      <AnimatePresence>
        {packageModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-7 max-w-md w-full border border-gray-100 dark:border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-slate-800">
                <h3 className="text-xl font-black text-gray-900 dark:text-white">New Catering Package</h3>
                <button onClick={() => setPackageModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <form onSubmit={handleCreatePackage} className="space-y-3 text-xs">
                <div><label className="font-bold text-gray-500 block mb-1">Package Title *</label><input required value={pkgTitle} onChange={e=>setPkgTitle(e.target.value)} placeholder="e.g. Royal Banquet Spread" className="w-full h-10 px-3 rounded-xl border dark:border-slate-700 bg-transparent font-bold text-sm outline-none" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="font-bold text-gray-500 block mb-1">Category</label><select value={pkgCategory} onChange={e=>setPkgCategory(e.target.value)} className="w-full h-10 px-3 rounded-xl border dark:border-slate-700 bg-transparent font-bold"><option>Catering</option><option>Festival Specials</option><option>Daily Meals</option><option>Family Packages</option></select></div>
                  <div><label className="font-bold text-gray-500 block mb-1">Capacity</label><input value={pkgCapacity} onChange={e=>setPkgCapacity(e.target.value)} className="w-full h-10 px-3 rounded-xl border dark:border-slate-700 bg-transparent font-bold" /></div>
                </div>
                <div><label className="font-bold text-gray-500 block mb-1">Price (₹) *</label><input type="number" required value={pkgPrice || ''} onChange={e=>setPkgPrice(Number(e.target.value))} className="w-full h-10 px-3 rounded-xl border dark:border-slate-700 bg-transparent font-black text-blue-600 text-sm" /></div>
                <div><label className="font-bold text-gray-500 block mb-1">Description</label><textarea value={pkgDesc} onChange={e=>setPkgDesc(e.target.value)} rows={2} className="w-full p-2.5 rounded-xl border dark:border-slate-700 bg-transparent" placeholder="Menu details and items included..." /></div>
                <div><label className="font-bold text-gray-500 block mb-1">Image URL</label><input value={pkgImage} onChange={e=>setPkgImage(e.target.value)} className="w-full h-10 px-3 rounded-xl border dark:border-slate-700 bg-transparent" /></div>
                <div className="pt-3 flex justify-end gap-2"><button type="button" onClick={()=>setPackageModalOpen(false)} className="px-4 py-2.5 rounded-xl border font-bold">Cancel</button><button type="submit" className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-black">Create Package</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL: ADD CATEGORY ── */}
      <AnimatePresence>
        {catModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 max-w-sm w-full border border-gray-100 shadow-2xl space-y-4">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">New Menu Category</h3>
              <form onSubmit={handleAddCategory} className="space-y-4 text-xs">
                <input required value={newCatName} onChange={e=>setNewCatName(e.target.value)} placeholder="e.g. Corporate Banquets" className="w-full h-11 px-3 rounded-xl border font-bold text-sm outline-none" autoFocus />
                <div className="flex justify-end gap-2"><button type="button" onClick={()=>setCatModalOpen(false)} className="px-4 py-2 border rounded-xl font-bold">Cancel</button><button type="submit" className="px-6 py-2 bg-blue-600 text-white font-black rounded-xl">Add</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL: ADD PHOTO TO GALLERY ── */}
      <AnimatePresence>
        {photoModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-7 max-w-md w-full border border-gray-100 shadow-2xl space-y-4">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Add Gallery Photo</h3>
              <form onSubmit={handleAddPhoto} className="space-y-4 text-xs">
                <div><label className="font-bold text-gray-500 block mb-1">Photo Title *</label><input required value={photoTitle} onChange={e=>setPhotoTitle(e.target.value)} placeholder="e.g. Executive Lunch Buffet" className="w-full h-10 px-3 rounded-xl border font-bold text-sm" /></div>
                <div><label className="font-bold text-gray-500 block mb-1">Image URL *</label><input required value={photoUrl} onChange={e=>setPhotoUrl(e.target.value)} className="w-full h-10 px-3 rounded-xl border" /></div>
                <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={()=>setPhotoModalOpen(false)} className="px-4 py-2 border rounded-xl font-bold">Cancel</button><button type="submit" className="px-6 py-2 bg-blue-600 text-white font-black rounded-xl">Add Photo</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
