import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils,
  Plus,
  Calendar,
  Users,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  FileText,
  Loader2,
  ChevronRight,
  Info,
  ShieldCheck,
  Eye,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../services/apiClient';

export interface CateringPackage {
  id: string;
  title: string;
  slug?: string;
  category: string;
  description: string;
  pax: string;
  price: number;
  price_type?: string;
  minimum_guests?: number;
  maximum_guests?: number;
  included_items?: string[] | string;
  image: string;
  gallery_images?: string[] | string;
  is_active?: number;
  featured?: number;
}

export interface CateringRequest {
  id: string;
  user_id: string;
  user_name: string;
  email?: string;
  package_id?: string;
  package_title: string;
  guest_count: number;
  event_date: string;
  event_time?: string;
  event_type?: string;
  contact_phone: string;
  location?: string;
  address?: string;
  food_preference?: string;
  budget?: number;
  special_notes?: string;
  special_requirements?: string;
  status: string;
  total_estimated_price: number;
  admin_notes?: string;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  featured: number;
  created_at: string;
}

const CATEGORY_FILTERS = ['All Packages', 'Catering', 'Daily Meals', 'Family Packages', 'Festival Specials'];
const EVENT_TYPES = [
  'Custom / Package Special...',
  'Wedding / Reception',
  'Birthday Celebration',
  'Corporate Luncheon / Event',
  'Festival Feast',
  'Family Function / Puja',
  'Cocktail / Party',
  'Other Custom Event'
];
const FOOD_PREFERENCES = ['Vegetarian (Standard)', 'Pure Jain (No Onion / No Garlic)', 'Swaminarayan Satvik', 'Vegan & Gluten-Free Available', 'Custom Mix (Discuss with Chef)'];

export function CateringPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<'CATERING PACKAGES' | 'GALLERY' | 'MY REQUESTS'>('CATERING PACKAGES');

  // Data States
  const [packages, setPackages] = useState<CateringPackage[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [myRequests, setMyRequests] = useState<CateringRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [activeCategory, setActiveCategory] = useState<string>('All Packages');

  // Modals & Lightbox
  const [bookingModalPkg, setBookingModalPkg] = useState<CateringPackage | null>(null);
  const [generalModalOpen, setGeneralModalOpen] = useState<boolean>(false);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<CateringRequest | null>(null);
  const [lightboxImage, setLightboxImage] = useState<GalleryItem | null>(null);
  const [successResponseModal, setSuccessResponseModal] = useState<{ id: string; package_title: string; estimated: number } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    customer_name: user?.name || '',
    email: user?.email || '',
    contact_phone: (user as any)?.mobile || (user as any)?.phone || '',
    event_type: EVENT_TYPES[0], // 'Custom / Package Special...'
    package_title: 'Custom Catering Request',
    event_date: '',
    event_time: '12:00',
    guest_count: 15,
    location: 'Ahmedabad / Gandhinagar Area',
    address: '',
    food_preference: FOOD_PREFERENCES[0],
    budget: '',
    special_notes: '',
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Sync tab from URL query
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'my-requests' || tabParam === 'requests') {
      setActiveTab('MY REQUESTS');
    } else if (tabParam === 'gallery') {
      setActiveTab('GALLERY');
    } else {
      setActiveTab('CATERING PACKAGES');
    }
  }, [searchParams]);

  // Fetch initial data from Backend
  useEffect(() => {
    fetchCateringData();
  }, [activeCategory, activeTab, user]);

  const fetchCateringData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'CATERING PACKAGES') {
        const pkgData = await apiClient.getCateringPackages(activeCategory);
        setPackages(Array.isArray(pkgData) ? pkgData : []);
      } else if (activeTab === 'GALLERY') {
        const galData = await apiClient.getCateringGallery();
        setGallery(Array.isArray(galData) ? galData : []);
      } else if (activeTab === 'MY REQUESTS') {
        if (user) {
          const reqData = await apiClient.getMyCateringRequests();
          setMyRequests(Array.isArray(reqData) ? reqData : []);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch catering data:', err);
      setError('Unable to load food arrangements. Please verify backend service.');
    } finally {
      setLoading(false);
    }
  };

  // Open Booking Modal for specific Package (Matches Screenshot 2 behavior)
  const openPackageBooking = (pkg: CateringPackage) => {
    const minGuests = pkg.minimum_guests || parseInt(pkg.pax) || 15;
    setFormData({
      customer_name: user?.name || '',
      email: user?.email || '',
      contact_phone: (user as any)?.mobile || (user as any)?.phone || '',
      event_type: 'Custom / Package Special...',
      package_title: pkg.title,
      event_date: getTomorrowString(),
      event_time: '18:00',
      guest_count: minGuests,
      location: 'Ahmedabad / Gandhinagar Area',
      address: '',
      food_preference: FOOD_PREFERENCES[0],
      budget: pkg.price.toString(),
      special_notes: '',
    });
    setFormErrors({});
    setBookingModalPkg(pkg);
  };

  // Open General Custom Catering Modal
  const openGeneralBooking = () => {
    setFormData({
      customer_name: user?.name || '',
      email: user?.email || '',
      contact_phone: (user as any)?.mobile || (user as any)?.phone || '',
      event_type: 'Wedding / Reception',
      package_title: 'Custom Food & Catering Arrangement',
      event_date: getTomorrowString(),
      event_time: '19:00',
      guest_count: 100,
      location: 'Ahmedabad / Gandhinagar Area',
      address: '',
      food_preference: FOOD_PREFERENCES[0],
      budget: '50000',
      special_notes: '',
    });
    setFormErrors({});
    setGeneralModalOpen(true);
  };

  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  };

  // Calculate price estimate
  const calculateEstimate = (pkg?: CateringPackage | null) => {
    const guests = Number(formData.guest_count) || 1;
    if (pkg) {
      if (pkg.price_type === 'per_pax') {
        return guests * pkg.price;
      } else {
        const unit = parseInt(pkg.pax) || pkg.minimum_guests || 1;
        const multiplier = Math.max(1, Math.ceil(guests / unit));
        return multiplier * pkg.price;
      }
    } else {
      return Number(formData.budget) || guests * 350;
    }
  };

  // Form Validation
  const validateForm = (pkg?: CateringPackage | null) => {
    const errors: { [key: string]: string } = {};
    if (!formData.customer_name.trim()) errors.customer_name = 'Please provide your name.';
    if (!formData.contact_phone || !/^\d{10}$/.test(formData.contact_phone.trim())) {
      errors.contact_phone = 'Please enter exactly 10 digits without spaces or code.';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!formData.event_date) {
      errors.event_date = 'Please select an event date.';
    } else {
      const selected = new Date(formData.event_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        errors.event_date = 'Event date cannot be in the past.';
      }
    }
    const guests = Number(formData.guest_count);
    if (isNaN(guests) || guests < 1) {
      errors.guest_count = 'Guest count must be at least 1.';
    } else if (pkg && pkg.minimum_guests && guests < pkg.minimum_guests) {
      errors.guest_count = `Minimum ${pkg.minimum_guests} guests required for this package.`;
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmitRequest = async (e: React.FormEvent, pkg?: CateringPackage | null) => {
    e.preventDefault();
    if (!validateForm(pkg)) {
      toast('Please correct the highlighted errors in the form.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const estimatedPrice = calculateEstimate(pkg);

      const payload = {
        package_id: pkg ? pkg.id : null,
        package_title: pkg ? pkg.title : formData.package_title || 'Custom Food Arrangement',
        customer_name: formData.customer_name.trim(),
        user_name: formData.customer_name.trim(),
        email: formData.email.trim(),
        contact_phone: formData.contact_phone.trim(),
        event_type: formData.event_type,
        event_date: formData.event_date,
        event_time: formData.event_time,
        guest_count: Number(formData.guest_count),
        location: formData.location.trim(),
        address: formData.address.trim(),
        food_preference: formData.food_preference,
        budget: Number(formData.budget || 0),
        special_requirements: formData.special_notes.trim(),
        special_notes: formData.special_notes.trim(),
        total_estimated_price: estimatedPrice
      };

      const res = await apiClient.submitCateringRequest(payload);
      
      setBookingModalPkg(null);
      setGeneralModalOpen(false);

      if (res && res.request) {
        setSuccessResponseModal({
          id: res.request.id,
          package_title: res.request.package_title,
          estimated: res.request.total_estimated_price || estimatedPrice
        });
        toast('Catering order submitted successfully!', 'success');
      } else {
        toast('Catering inquiry submitted successfully!', 'success');
      }

      if (user) {
        apiClient.getMyCateringRequests().then(data => {
          if (Array.isArray(data)) setMyRequests(data);
        });
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      const msg = err.response?.data?.error || 'Failed to submit catering request. Please try again later.';
      toast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel Request
  const handleCancelRequest = async (requestId: string) => {
    if (!window.confirm(`Are you sure you want to cancel request #${requestId}?`)) return;
    try {
      await apiClient.cancelCateringRequest(requestId);
      toast('Catering order cancelled successfully.', 'success');
      setSelectedRequestDetails(null);
      fetchCateringData();
    } catch (err: any) {
      toast(err.response?.data?.error || 'Failed to cancel order.', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'CONFIRMED') return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> CONFIRMED</span>;
    if (s === 'COMPLETED') return <span className="bg-purple-100 text-purple-800 border border-purple-300 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> COMPLETED</span>;
    if (s === 'CANCELLED') return <span className="bg-slate-100 text-slate-600 border border-slate-300 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1.5"><X className="w-3.5 h-3.5" /> CANCELLED</span>;
    if (s === 'REJECTED') return <span className="bg-rose-100 text-rose-800 border border-rose-300 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> REJECTED</span>;
    if (s === 'CONTACTED' || s === 'UNDER REVIEW') return <span className="bg-blue-100 text-blue-800 border border-blue-300 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> UNDER REVIEW</span>;
    return <span className="bg-amber-100 text-amber-800 border border-amber-300 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> PENDING</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      {/* MAIN CONTAINER MATCHING EXACT SCREENSHOT 1 */}
      <div className="max-w-6xl mx-auto bg-white border border-slate-200/90 rounded-[2rem] p-6 sm:p-10 shadow-sm">
        
        {/* TOP HERO & HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-600 shadow-xs flex-shrink-0">
              <Utensils className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 tracking-tight">Food Arrangements</h1>
              <p className="text-slate-500 text-sm sm:text-base mt-0.5 font-normal">
                Custom catering and food curation for your premium events.
              </p>
            </div>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={openGeneralBooking}
              className="bg-slate-950 hover:bg-slate-800 active:bg-black text-white px-5 py-3 rounded-[1.25rem] transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm font-medium"
            >
              <span className="text-lg font-light leading-none">+</span>
              <span className="leading-tight text-left text-xs font-semibold">
                Request<br />Catering
              </span>
            </button>
          </div>
        </div>

        {/* PILL TABS CONTAINER MATCHING SCREENSHOT 1 */}
        <div className="mt-6 mb-6">
          <div className="bg-slate-50 border border-slate-100 p-1.5 rounded-full inline-flex items-center gap-1 flex-wrap sm:flex-nowrap shadow-xs">
            {(['CATERING PACKAGES', 'GALLERY', 'MY REQUESTS'] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSearchParams(tab === 'CATERING PACKAGES' ? {} : { tab: tab.toLowerCase().replace(/\s+/g, '-') });
                  }}
                  className={`px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50 font-bold'
                      : 'text-slate-500 hover:text-slate-800 font-semibold'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 mb-8 flex items-start gap-4 text-rose-800">
            <AlertCircle className="w-6 h-6 flex-shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-grow">
              <h3 className="font-bold text-lg">Unable to Load Content</h3>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <button onClick={fetchCateringData} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-sm transition-all">
              Retry
            </button>
          </div>
        )}

        {/* LOADING STATE */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <p className="text-base font-medium">Loading food arrangements...</p>
          </div>
        ) : (
          <>
            {/* ==========================================
                TAB 1: CATERING PACKAGES
               ========================================== */}
            {activeTab === 'CATERING PACKAGES' && (
              <div>
                {/* CATEGORY PILL FILTERS MATCHING SCREENSHOT 1 */}
                <div className="flex flex-wrap items-center gap-2.5 mb-8">
                  {CATEGORY_FILTERS.map((cat) => {
                    const isSelected = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                          isSelected
                            ? 'bg-blue-50/60 text-blue-600 border border-blue-500 font-semibold shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 font-medium hover:bg-slate-50/50'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>

                {/* PACKAGES GRID MATCHING SCREENSHOT 1 */}
                {packages.length === 0 ? (
                  <div className="bg-slate-50/50 border border-slate-200 rounded-3xl p-12 text-center my-8">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 shadow-xs">
                      <Utensils className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">No catering packages available</h3>
                    <p className="text-slate-500 text-sm max-w-md mx-auto mt-1 mb-6">
                      We couldn't find any packages in this category. Please try selecting another category or submit a custom request.
                    </p>
                    <button onClick={() => setActiveCategory('All Packages')} className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-full text-sm hover:bg-slate-800 transition-all">
                      View All Packages
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="bg-white rounded-[1.75rem] border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-300 p-5 flex flex-col justify-between group hover:border-blue-200"
                      >
                        <div>
                          {/* INSET ROUNDED IMAGE MATCHING SCREENSHOT 1 */}
                          <div className="relative h-52 w-full rounded-[1.25rem] overflow-hidden bg-slate-100 mb-4 border border-slate-100">
                            <img
                              src={pkg.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600'}
                              alt={pkg.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600';
                              }}
                            />
                          </div>

                          {/* TINY GRAY CATEGORY TAG MATCHING SCREENSHOT 1 */}
                          <div className="mb-2.5">
                            <span className="inline-block bg-slate-100/90 text-slate-600 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded w-fit">
                              {pkg.category}
                            </span>
                          </div>

                          {/* PACKAGE TITLE & DESCRIPTION */}
                          <h2 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {pkg.title}
                          </h2>
                          <p className="text-slate-500 text-sm leading-relaxed mb-6 font-normal">
                            {pkg.description}
                          </p>
                        </div>

                        {/* FOOTER SECTION MATCHING EXACT SCREENSHOT 1 */}
                        <div className="border-t border-slate-100 pt-4 mt-auto flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                              SERVES / BASE RATE
                            </p>
                            <p className="text-base font-extrabold text-slate-900">
                              {pkg.pax || `${pkg.minimum_guests || 15} Pax`} <span className="text-slate-400 mx-1">•</span> ₹{pkg.price}
                            </p>
                          </div>

                          <button
                            onClick={() => openPackageBooking(pkg)}
                            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold px-6 py-2 rounded-full shadow-sm hover:shadow-md transition-all text-sm"
                          >
                            Book
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ==========================================
                TAB 2: GALLERY
               ========================================== */}
            {activeTab === 'GALLERY' && (
              <div className="pt-2">
                <div className="text-left max-w-2xl mb-8">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Live Catering & Banquet Setup Gallery</h2>
                  <p className="text-slate-500 mt-1 text-sm sm:text-base">
                    Explore high-definition snippets of our grand weddings, festival spreads, corporate buffets, and food presentations.
                  </p>
                </div>

                {gallery.length === 0 ? (
                  <div className="bg-slate-50/50 border border-slate-200 rounded-3xl p-12 text-center my-8">
                    <p className="text-slate-500 font-medium">No gallery pictures uploaded yet. Check back soon!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {gallery.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setLightboxImage(item)}
                        className="group relative h-64 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl cursor-pointer bg-slate-900 transition-all duration-300 border border-slate-200/80"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 group-hover:opacity-85 transition-all duration-500 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                        
                        <div className="absolute top-4 left-4">
                          <span className="bg-blue-600 text-white text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full shadow-md">
                            {item.category}
                          </span>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-5 text-white flex items-end justify-between">
                          <div>
                            <h4 className="text-lg font-extrabold leading-tight text-white group-hover:text-blue-300 transition-colors">
                              {item.title}
                            </h4>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                            <Eye className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ==========================================
                TAB 3: MY REQUESTS
               ========================================== */}
            {activeTab === 'MY REQUESTS' && (
              <div className="pt-2">
                {!user ? (
                  <div className="bg-slate-50/60 border border-slate-200 rounded-3xl p-10 max-w-lg mx-auto text-center shadow-xs my-8">
                    <div className="w-16 h-16 bg-white text-blue-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-slate-100">
                      <Users className="w-8 h-8 stroke-[2]" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">Sign in to track orders</h3>
                    <p className="text-slate-500 text-sm mt-2 mb-6 leading-relaxed">
                      Please log in to your HomeSeva account to monitor your catering bookings, check quotation reviews, and track live statuses.
                    </p>
                    <button
                      onClick={() => navigate('/login', { state: { from: '/catering?tab=my-requests' } })}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-full shadow-md transition-all text-base"
                    >
                      Sign In to HomeSeva
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                      <div>
                        <h2 className="text-2xl font-extrabold text-slate-900">My Catering Inquiries & Orders</h2>
                        <p className="text-slate-500 text-sm mt-0.5">Live tracking and status updates from our food curation managers</p>
                      </div>
                      <button
                        onClick={openGeneralBooking}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-full text-sm shadow-sm transition-all flex items-center gap-2 w-fit"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>New Request</span>
                      </button>
                    </div>

                    {myRequests.length === 0 ? (
                      <div className="bg-slate-50/50 border border-slate-200 rounded-3xl p-12 text-center my-8 shadow-xs">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 shadow-xs border border-slate-100">
                          <Calendar className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">No catering orders submitted yet</h3>
                        <p className="text-slate-500 text-sm max-w-md mx-auto mt-1 mb-6">
                          When you book a package or place a custom food arrangement inquiry, your order progress and live quotes will appear here.
                        </p>
                        <button
                          onClick={() => setActiveTab('CATERING PACKAGES')}
                          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-full text-sm hover:bg-blue-700 shadow-sm transition-all"
                        >
                          Browse Packages
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {myRequests.map((req) => (
                          <div
                            key={req.id}
                            className="bg-white border border-slate-200/90 rounded-[1.75rem] p-6 sm:p-8 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                          >
                            <div className="space-y-3 flex-grow">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="font-mono font-extrabold text-base px-3 py-1 bg-slate-100 text-slate-800 rounded-lg">
                                  #{req.id}
                                </span>
                                {getStatusBadge(req.status)}
                                <span className="text-xs text-slate-400 font-semibold">
                                  Submitted {new Date(req.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                              </div>

                              <h3 className="text-xl font-extrabold text-slate-900">
                                {req.package_title}
                              </h3>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-100 text-sm">
                                <div>
                                  <span className="text-[11px] text-slate-400 font-bold block uppercase">Event Date</span>
                                  <span className="font-bold text-slate-700 flex items-center gap-1.5 mt-0.5">
                                    <Calendar className="w-4 h-4 text-blue-600 inline" />
                                    {req.event_date} {req.event_time ? `• ${req.event_time}` : ''}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[11px] text-slate-400 font-bold block uppercase">Guests</span>
                                  <span className="font-bold text-slate-700 flex items-center gap-1.5 mt-0.5">
                                    <Users className="w-4 h-4 text-blue-600 inline" />
                                    {req.guest_count} Pax
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[11px] text-slate-400 font-bold block uppercase">Event Type</span>
                                  <span className="font-bold text-slate-700 mt-0.5 block truncate">
                                    {req.event_type || 'General'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[11px] text-slate-400 font-bold block uppercase">Estimated Amount</span>
                                  <span className="font-black text-blue-600 text-base block mt-0.5">
                                    ₹{req.total_estimated_price?.toLocaleString('en-IN') || 0}
                                  </span>
                                </div>
                              </div>

                              {req.admin_notes && (
                                <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-xl text-sm text-amber-900 mt-3 flex items-start gap-2">
                                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <strong className="font-bold">Team Update:</strong> {req.admin_notes}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-row lg:flex-col justify-end gap-3 flex-shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                              <button
                                onClick={() => setSelectedRequestDetails(req)}
                                className="px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-all flex items-center justify-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View Details</span>
                              </button>

                              {(req.status.toUpperCase() === 'PENDING' || req.status.toLowerCase() === 'submitted') && (
                                <button
                                  onClick={() => handleCancelRequest(req.id)}
                                  className="px-5 py-2.5 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-sm transition-all flex items-center justify-center gap-2"
                                >
                                  <X className="w-4 h-4" />
                                  <span>Cancel Order</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ==========================================
          MODAL 1: PACKAGE BOOKING & ORDER FORM
          (MATCHING EXACT SCREENSHOT 2)
         ========================================== */}
      <AnimatePresence>
        {(bookingModalPkg || generalModalOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setBookingModalPkg(null); setGeneralModalOpen(false); }}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-[2rem] shadow-2xl border border-slate-100 w-full max-w-3xl max-h-[90vh] overflow-y-auto z-10"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 sm:px-8 py-5 border-b border-slate-200 flex items-center justify-between z-20">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded mb-1 inline-block">
                    {bookingModalPkg ? bookingModalPkg.category : 'Custom Inquiry'}
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    {bookingModalPkg ? `Book ${bookingModalPkg.title}` : 'Request Custom Catering'}
                  </h2>
                </div>
                <button
                  onClick={() => { setBookingModalPkg(null); setGeneralModalOpen(false); }}
                  className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={(e) => handleSubmitRequest(e, bookingModalPkg)} className="p-6 sm:p-8 space-y-6">
                
                {/* =========================================================
                    SECTION: EVENT TYPE & SELECTED PACKAGE (SCREENSHOT 2)
                   ========================================================= */}
                <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/80">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    EVENT TYPE
                  </label>
                  <select
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-blue-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-600 shadow-xs mb-3 transition-all"
                  >
                    {EVENT_TYPES.map((et, i) => (
                      <option key={i} value={et}>{et}</option>
                    ))}
                  </select>

                  {/* DISPLAY SELECTED PACKAGE NAME (LIKE "Festival Food Package" IN SCREENSHOT 2) */}
                  <input
                    type="text"
                    readOnly
                    value={bookingModalPkg ? bookingModalPkg.title : formData.package_title}
                    onChange={(e) => !bookingModalPkg && setFormData({ ...formData, package_title: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-blue-200/70 bg-slate-50/80 text-sm font-bold text-slate-800 focus:outline-none shadow-inner"
                  />
                </div>

                {/* Section: Contact details */}
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">1</span>
                    <span>Host Contact Details</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Rohit Sharma"
                        value={formData.customer_name}
                        onChange={(e) => { setFormData({ ...formData, customer_name: e.target.value }); if (formErrors.customer_name) setFormErrors({ ...formErrors, customer_name: '' }); }}
                        className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 transition-all ${
                          formErrors.customer_name ? 'border-rose-500 focus:ring-rose-200' : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                        }`}
                      />
                      {formErrors.customer_name && <p className="text-rose-600 text-xs font-semibold mt-1">{formErrors.customer_name}</p>}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Mobile Number (10 Digits) *</label>
                      <input
                        type="text"
                        placeholder="9876543210"
                        maxLength={10}
                        value={formData.contact_phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setFormData({ ...formData, contact_phone: val });
                          if (formErrors.contact_phone) setFormErrors({ ...formErrors, contact_phone: '' });
                        }}
                        className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-sm text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 transition-all ${
                          formErrors.contact_phone ? 'border-rose-500 focus:ring-rose-200' : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                        }`}
                      />
                      {formErrors.contact_phone && <p className="text-rose-600 text-xs font-semibold mt-1">{formErrors.contact_phone}</p>}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email Address</label>
                      <input
                        type="email"
                        placeholder="yourname@gmail.com"
                        value={formData.email}
                        onChange={(e) => { setFormData({ ...formData, email: e.target.value }); if (formErrors.email) setFormErrors({ ...formErrors, email: '' }); }}
                        className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 transition-all ${
                          formErrors.email ? 'border-rose-500 focus:ring-rose-200' : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                        }`}
                      />
                      {formErrors.email && <p className="text-rose-600 text-xs font-semibold mt-1">{formErrors.email}</p>}
                    </div>
                  </div>
                </div>

                {/* Section: Schedule & Guest count */}
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">2</span>
                    <span>Event Schedule & Guests</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Event Date *</label>
                      <input
                        type="date"
                        min={new Date().toISOString().slice(0, 10)}
                        value={formData.event_date}
                        onChange={(e) => { setFormData({ ...formData, event_date: e.target.value }); if (formErrors.event_date) setFormErrors({ ...formErrors, event_date: '' }); }}
                        className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                          formErrors.event_date ? 'border-rose-500 focus:ring-rose-200' : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                        }`}
                      />
                      {formErrors.event_date && <p className="text-rose-600 text-xs font-semibold mt-1">{formErrors.event_date}</p>}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Meal Serving Time</label>
                      <input
                        type="time"
                        value={formData.event_time}
                        onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:border-blue-600 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Guest Count (Pax) * {bookingModalPkg ? `(Min: ${bookingModalPkg.minimum_guests || parseInt(bookingModalPkg.pax) || 1})` : ''}
                      </label>
                      <input
                        type="number"
                        min={bookingModalPkg?.minimum_guests || 1}
                        value={formData.guest_count}
                        onChange={(e) => { setFormData({ ...formData, guest_count: Number(e.target.value) }); if (formErrors.guest_count) setFormErrors({ ...formErrors, guest_count: '' }); }}
                        className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                          formErrors.guest_count ? 'border-rose-500 focus:ring-rose-200' : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                        }`}
                      />
                      {formErrors.guest_count && <p className="text-rose-600 text-xs font-semibold mt-1">{formErrors.guest_count}</p>}
                    </div>
                  </div>
                </div>

                {/* Section: Location & Dietary Preferences */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Venue Location & City</label>
                      <input
                        type="text"
                        placeholder="e.g. Grand Heritage Hall, Ahmedabad"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:border-blue-600 focus:ring-blue-100 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Food Preference / Dietary Style</label>
                      <select
                        value={formData.food_preference}
                        onChange={(e) => setFormData({ ...formData, food_preference: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:border-blue-600 focus:ring-blue-100 transition-all"
                      >
                        {FOOD_PREFERENCES.map((fp, i) => <option key={i} value={fp}>{fp}</option>)}
                      </select>
                    </div>
                  </div>

                  {!bookingModalPkg && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Estimated Target Budget (INR)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                        <input
                          type="number"
                          placeholder="50000"
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                          className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:border-blue-600 focus:ring-blue-100 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Special Menu Customization & Notes</label>
                    <textarea
                      rows={3}
                      placeholder="Mention any specific sabji preference, sweetness level, live panipuri counters needed, or allergy warnings..."
                      value={formData.special_notes}
                      onChange={(e) => setFormData({ ...formData, special_notes: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:border-blue-600 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>

                {/* Live Estimated Quotation Box */}
                <div className="bg-blue-600/5 border border-blue-600/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">Estimated Quotation</span>
                    <p className="text-xs text-slate-500 mt-0.5">Includes setup & consultation. Final quotation confirmed upon call.</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-2xl font-black text-blue-600">₹{calculateEstimate(bookingModalPkg).toLocaleString('en-IN')}</span>
                    <span className="block text-[11px] text-slate-400 font-semibold">for {formData.guest_count || 1} Guests</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setBookingModalPkg(null); setGeneralModalOpen(false); }}
                    className="px-6 py-3 rounded-full text-slate-600 font-bold hover:bg-slate-100 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-extrabold rounded-full shadow-lg shadow-blue-600/25 transition-all text-sm flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Confirm & Submit Order</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          MODAL 2: SUCCESS DIALOG
         ========================================== */}
      <AnimatePresence>
        {successResponseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl z-10 border border-slate-100"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">Order Confirmed!</h3>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                Your catering food arrangement inquiry has been received. Our food curation team will review and connect with you shortly.
              </p>

              <div className="bg-slate-50 rounded-2xl p-4 my-6 text-left border border-slate-200/80 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Request ID:</span>
                  <span className="font-mono font-extrabold text-slate-900">#{successResponseModal.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Package:</span>
                  <span className="font-bold text-slate-700 truncate max-w-[200px]">{successResponseModal.package_title}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <span className="text-slate-400 font-medium">Est. Total:</span>
                  <span className="font-extrabold text-emerald-600">₹{successResponseModal.estimated.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setSuccessResponseModal(null);
                    setActiveTab('MY REQUESTS');
                    setSearchParams({ tab: 'my-requests' });
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-full shadow-lg shadow-blue-600/20 transition-all text-sm"
                >
                  Track in My Requests
                </button>
                <button
                  onClick={() => setSuccessResponseModal(null)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-full transition-all text-sm"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          MODAL 3: REQUEST DETAILS VIEW
         ========================================== */}
      <AnimatePresence>
        {selectedRequestDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequestDetails(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl z-10 border border-slate-100 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400">Order Reference</span>
                  <h3 className="text-xl font-black text-slate-900">#{selectedRequestDetails.id}</h3>
                </div>
                {getStatusBadge(selectedRequestDetails.status)}
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400">Package Name</span>
                  <p className="font-extrabold text-slate-900 text-base">{selectedRequestDetails.package_title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">Event Date</span>
                    <span className="font-extrabold text-slate-800">{selectedRequestDetails.event_date} {selectedRequestDetails.event_time ? `(${selectedRequestDetails.event_time})` : ''}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">Guest Count</span>
                    <span className="font-extrabold text-slate-800">{selectedRequestDetails.guest_count} Pax</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">Contact Phone</span>
                    <span className="font-bold text-slate-800 font-mono">{selectedRequestDetails.contact_phone}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">Estimated Amount</span>
                    <span className="font-black text-blue-600 text-base">₹{selectedRequestDetails.total_estimated_price?.toLocaleString('en-IN') || 0}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400">Venue & Location</span>
                  <p className="font-medium text-slate-700">{selectedRequestDetails.location || 'Not Specified'} {selectedRequestDetails.address || ''}</p>
                </div>

                {selectedRequestDetails.special_notes && (
                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-400">Your Dietary Notes</span>
                    <p className="font-medium text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/60">{selectedRequestDetails.special_notes}</p>
                  </div>
                )}

                {selectedRequestDetails.admin_notes && (
                  <div>
                    <span className="text-[11px] font-bold uppercase text-amber-600">Team Update & Feedback</span>
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-r-xl text-amber-900 font-medium">
                      {selectedRequestDetails.admin_notes}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setSelectedRequestDetails(null)}
                  className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-full text-sm hover:bg-slate-800 transition-all"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          MODAL 4: GALLERY LIGHTBOX
         ========================================== */}
      <AnimatePresence>
        {lightboxImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl max-h-[85vh] overflow-hidden rounded-3xl bg-slate-900 flex flex-col items-center justify-center border border-white/10 shadow-2xl"
            >
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white flex items-center justify-center transition-all shadow-lg border border-white/20"
              >
                <X className="w-6 h-6 stroke-[2.5]" />
              </button>
              <img
                src={lightboxImage.image}
                alt={lightboxImage.title}
                className="max-h-[75vh] w-auto object-contain"
              />
              <div className="w-full bg-slate-900 p-4 px-6 flex items-center justify-between text-white border-t border-white/10">
                <div>
                  <h4 className="font-bold text-lg">{lightboxImage.title}</h4>
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{lightboxImage.category} Setup</span>
                </div>
                <button
                  onClick={() => {
                    setLightboxImage(null);
                    openGeneralBooking();
                  }}
                  className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow"
                >
                  Request Similar Setup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
