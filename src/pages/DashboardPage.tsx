import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Heart,
  MapPin,
  Bell,
  Wallet,
  Clock,
  XCircle,
  Download,
  Star,
  Plus,
  Trash2,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  Check,
  TrendingUp,
  TrendingDown,
  Wrench,
  Shield,
  User,
  ChefHat,
  Car,
  LayoutDashboard,
  Building,
  Search,
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { userBookings, savedAddresses, notifications, walletTransactions, services } from '../data/sampleData';
import { apiClient } from '../services/apiClient';
import type { Booking, SavedAddress } from '../types';

type Tab = 'dashboard' | 'bookings' | 'favorites' | 'addresses' | 'notifications' | 'wallet' | 'profile' | 'edit_profile' | 'food' | 'taxi';

export function DashboardPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get('tab') as Tab) || 'dashboard';

  const [bookingFilter, setBookingFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const [addresses, setAddresses] = useState<SavedAddress[]>(savedAddresses);
  const [notifList, setNotifList] = useState(notifications);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [newAddr, setNewAddr] = useState({ label: '', address: '', city: '', pincode: '' });

  useEffect(() => {
    if (user) {
      apiClient.getBookings({ userId: user.id })
        .then((data) => setBookings(data))
        .catch(() => setBookings(userBookings));
    }
  }, [user]);

  const setTab = (newTab: Tab) => {
    setSearchParams({ tab: newTab });
  };

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter !== 'all' && b.status !== bookingFilter) return false;
    if (searchQuery && !b.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) && !b.id.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedStatuses.length > 0) {
      const statusMap: Record<string, string[]> = {
        'Pending': ['pending'],
        'Confirmed': ['upcoming'],
        'In Progress': ['in-progress', 'started', 'on-route'],
        'Completed': ['completed'],
        'Cancelled': ['cancelled'],
      };
      const matchesStatus = selectedStatuses.some((s) => statusMap[s]?.includes(b.status));
      if (!matchesStatus) return false;
    }
    if (selectedCategories.length > 0) {
      if (!selectedCategories.includes('Home Services') && !selectedCategories.some(c => b.serviceName.toLowerCase().includes(c.toLowerCase()))) {
        return false;
      }
    }
    return true;
  });

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  };

  const toggleStatus = (stat: string) => {
    setSelectedStatuses((prev) => prev.includes(stat) ? prev.filter((s) => s !== stat) : [...prev, stat]);
  };

  const favoriteServices = services.filter((s) => isFavorite(s.id));
  const walletBalance = walletTransactions.reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount), 0);
  const unreadCount = notifList.filter((n) => !n.read).length;

  const cancelBooking = async () => {
    if (!cancelTarget) return;
    try {
      const updated = await apiClient.updateBookingStatus(cancelTarget.id, 'cancelled', 'Booking cancelled by customer');
      setBookings((prev) => prev.map((b) => (b.id === cancelTarget.id ? updated : b)));
      toast('Booking cancelled successfully', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to cancel booking', 'error');
    } finally {
      setCancelTarget(null);
    }
  };

  const markAllRead = () => {
    setNotifList((prev) => prev.map((n) => ({ ...n, read: true })));
    toast('All notifications marked as read', 'success');
  };

  const addAddress = () => {
    if (!newAddr.label || !newAddr.address || !newAddr.pincode) {
      toast('Please fill all fields', 'error');
      return;
    }
    setAddresses((prev) => [...prev, { ...newAddr, id: `a${Date.now()}`, isDefault: false }]);
    setNewAddr({ label: '', address: '', city: '', pincode: '' });
    toast('Address added', 'success');
  };

  const removeAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast('Address removed', 'success');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const userName = user?.name ?? 'Guest User';
  const userEmail = user?.email ?? 'guest@homeseva.com';

  return (
    <div className="flex flex-col flex-1 bg-gray-50/60 dark:bg-slate-950 pb-20 min-h-screen">
      
      {/* 1. Executive Greeting Hero */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-6 text-left">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-gray-950 dark:text-white flex items-center flex-wrap">
          <span>Welcome,</span>
          <span className="text-brand-600 dark:text-brand-400 font-black italic ml-2 mr-1">
            {userName.split(' ')[0].toLowerCase()}
          </span>
          <span>.</span>
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1 sm:mt-1.5 font-medium">
          Your remote home management dashboard.
        </p>
      </div>

      {/* 2. Horizontal Navigation Tabs Bar */}
      <div className="w-full border-y border-gray-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center gap-6 sm:gap-9 overflow-x-auto no-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'profile', label: 'Personal Info', icon: User },
            { id: 'addresses', label: 'Properties', icon: Building, count: addresses.length },
            { id: 'bookings', label: 'Bookings', icon: Calendar, count: bookings.length },
            { id: 'wallet', label: 'Transactions & Wallet', icon: Wallet },
            { id: 'favorites', label: 'Memberships & Saved', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadCount > 0 ? unreadCount : undefined },
            { id: 'food', label: 'Food Arrangements', icon: ChefHat },
            { id: 'taxi', label: 'Taxi Bookings', icon: Car },
          ].map((item) => {
            const isActive = tab === item.id || (tab === 'edit_profile' && item.id === 'profile');
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id as Tab)}
                className={`py-4 flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap transition-all border-b-[2.5px] -mb-[1px] font-bold ${
                  isActive
                    ? 'border-gray-950 text-gray-950 dark:border-white dark:text-white font-black'
                    : 'border-transparent text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <item.icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-brand-600 dark:text-brand-400 stroke-[2.3]' : 'text-gray-400 stroke-[1.8]'}`} />
                <span>{item.label}</span>
                {item.count !== undefined && item.count >= 0 && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Premium Rounded Content Card Workspace */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-8 flex-1">
        <div className="w-full bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-200/80 dark:border-slate-800/80 shadow-soft-xl p-6 sm:p-12 text-left relative overflow-hidden min-h-[440px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="w-full"
          >
            {/* 0. OVERVIEW DASHBOARD TAB */}
            {tab === 'dashboard' && (
              <div className="space-y-8">
                <div className="rounded-[2.2rem] bg-gradient-to-br from-gray-950 via-slate-900 to-blue-950 p-8 sm:p-10 text-white relative overflow-hidden shadow-soft-xl flex flex-col justify-between min-h-[200px]">
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/20 text-[10px] font-black tracking-widest uppercase mb-4">
                      <Sparkles className="w-3.5 h-3.5" /> Executive HomeSeva Portal
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Your Remote Heritage Home Concierge</h2>
                    <p className="text-sm text-gray-300 max-w-xl mt-2 font-medium leading-relaxed">
                      Effortlessly monitor your ancestral properties in Patan, schedule cleaning or repair appointments, and arrange authentic gourmet feasts with zero friction.
                    </p>
                  </div>
                  <div className="pt-8 flex flex-wrap gap-3.5 z-10">
                    <button onClick={() => setTab('bookings')} className="px-6 py-3 bg-white text-slate-950 hover:bg-gray-100 rounded-[1.2rem] font-black text-xs transition shadow-sm flex items-center gap-2">
                      <span>View Live Bookings ({bookings.length})</span> <ArrowRight className="w-4 h-4" />
                    </button>
                    <button onClick={() => setTab('addresses')} className="px-6 py-3 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-[1.2rem] font-bold text-xs transition">
                      Manage Properties ({addresses.length})
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div onClick={() => setTab('bookings')} className="p-6 rounded-3xl border border-gray-200/80 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-800/40 hover:border-brand-500/40 transition cursor-pointer group">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Bookings</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white mt-2 group-hover:text-brand-600 transition-colors">{bookings.length}</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-3">View Service History →</span>
                  </div>
                  <div onClick={() => setTab('wallet')} className="p-6 rounded-3xl border border-gray-200/80 dark:border-slate-800 bg-blue-50/40 dark:bg-slate-800/40 hover:border-brand-500/40 transition cursor-pointer group">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Concierge Wallet</p>
                    <p className="text-3xl font-black text-brand-600 dark:text-brand-400 mt-2">₹{walletBalance.toLocaleString('en-IN')}</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-3">+ Top Up Credits →</span>
                  </div>
                  <div onClick={() => setTab('addresses')} className="p-6 rounded-3xl border border-gray-200/80 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-800/40 hover:border-brand-500/40 transition cursor-pointer group">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Saved Properties</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white mt-2">{addresses.length}</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-3">Register Residence →</span>
                  </div>
                  <div onClick={() => setTab('notifications')} className="p-6 rounded-3xl border border-gray-200/80 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-800/40 hover:border-brand-500/40 transition cursor-pointer group">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">System Notifications</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white mt-2">{unreadCount} Unread</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 mt-3">Check Alert Stream →</span>
                  </div>
                </div>
              </div>
            )}

            {/* 1. BOOKINGS LIST TAB (MATCHING REFERENCE IMAGE 1) */}
            {tab === 'bookings' && (
              <div className="space-y-6 max-w-5xl">
                {/* Image 1 Title Header */}
                <div className="flex items-center gap-3.5 mb-2">
                  <div className="w-12 h-12 rounded-[1.2rem] bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100/80 dark:border-blue-500/20 shadow-2xs">
                    <Calendar className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-950 dark:text-white tracking-tight">Service Bookings</h2>
                    <p className="text-xs font-semibold text-gray-400 mt-0.5">View your booking history</p>
                  </div>
                </div>

                {/* Image 1 Action Bar: + Book Service | Search Bar | Filter Button */}
                <div className="flex items-center justify-between gap-3 mb-8 flex-wrap">
                  <Link to="/services" className="shrink-0">
                    <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-full shadow-soft hover:shadow-md transition flex items-center gap-1.5">
                      <span>+ Book Service</span>
                    </button>
                  </Link>

                  <div className="flex-1 min-w-[240px] relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search bookings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50/70 dark:bg-slate-800/60 border border-gray-200/80 dark:border-slate-700/80 rounded-full py-2.5 pl-11 pr-4 text-xs font-semibold text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs">✕</button>
                    )}
                  </div>

                  <button
                    onClick={() => setFilterModalOpen(true)}
                    className="px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200/80 dark:border-slate-700 text-gray-700 dark:text-gray-200 text-xs font-extrabold rounded-full shadow-2xs transition flex items-center gap-2 shrink-0"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                    <span>Filter</span>
                    {(selectedCategories.length > 0 || selectedStatuses.length > 0) && (
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center">
                        {selectedCategories.length + selectedStatuses.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Optional Status Tabs (All, Upcoming, Completed) */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 select-none border-b border-gray-100 dark:border-slate-800">
                  {(['all', 'upcoming', 'completed', 'cancelled'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setBookingFilter(f)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-extrabold capitalize whitespace-nowrap transition ${
                        bookingFilter === f
                          ? 'bg-blue-600 text-white shadow-soft'
                          : 'bg-gray-100 dark:bg-slate-800/80 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {filteredBookings.length > 0 ? (
                  <div className="space-y-6">
                    {filteredBookings.map((b) => (
                      <BookingCard key={b.id} booking={b} onCancel={() => setCancelTarget(b)} />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center max-w-md mx-auto">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                      <Calendar className="w-8 h-8 stroke-[2.2]" />
                    </div>
                    <h3 className="text-lg font-black text-gray-950 dark:text-white">No bookings matched your criteria</h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Try resetting your filter keywords or schedule a fresh service visit.</p>
                    <button
                      onClick={() => { setSearchQuery(''); setSelectedCategories([]); setSelectedStatuses([]); setBookingFilter('all'); }}
                      className="mt-6 px-6 py-3 bg-gray-950 hover:bg-gray-800 dark:bg-white dark:text-gray-950 text-white font-extrabold rounded-[1.2rem] text-xs transition"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 2. FAVORITES TAB */}
            {tab === 'favorites' && (
              <div className="space-y-6 max-w-5xl">
                <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">Saved Services & Bookmarks</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Quickly request your preferred cleaning, plumbing, and maintenance experts.</p>
                </div>
                {favoriteServices.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {favoriteServices.map((s) => (
                      <div key={s.id} className="p-4 rounded-3xl border border-gray-200/80 dark:border-slate-800 flex gap-4 bg-gray-50/50 dark:bg-slate-800/40 relative hover:shadow-soft transition-all">
                        <img src={s.image} alt={s.name} className="w-24 h-24 object-cover rounded-2xl shrink-0 shadow-2xs" />
                        <div className="flex-1 flex flex-col justify-between text-left">
                          <div>
                            <h4 className="font-extrabold text-sm text-gray-900 dark:text-white line-clamp-1">{s.name}</h4>
                            <p className="text-xs font-medium text-brand-600 dark:text-brand-400 mt-0.5">{s.categoryName}</p>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="font-black text-sm text-gray-900 dark:text-white">₹{s.price}</span>
                            <div className="flex gap-2">
                              <Link to={`/services/${s.slug}`}>
                                <Button size="sm" variant="outline" className="!rounded-xl !text-xs !font-bold">Book Now</Button>
                              </Link>
                              <button
                                onClick={() => toggleFavorite(s.id, 'service')}
                                className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                              >
                                <Heart className="w-4.5 h-4.5 fill-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center max-w-md mx-auto">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
                      <Heart className="w-8 h-8 stroke-[2.2]" />
                    </div>
                    <h3 className="text-lg font-black text-gray-950 dark:text-white">No favorites saved</h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Click the heart icon on any service card to bookmark it for emergency access.</p>
                    <Link to="/services" className="mt-6">
                      <button className="px-6 py-3 bg-gray-950 hover:bg-gray-800 dark:bg-white dark:text-gray-950 text-white font-extrabold rounded-[1.2rem] text-xs transition">
                        Browse Catalog
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* 3. SAVED ADDRESSES / PROPERTIES TAB */}
            {tab === 'addresses' && (
              <div className="space-y-8 max-w-5xl">
                {addresses.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
                    <div className="w-20 h-20 rounded-[2rem] bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 shadow-2xs">
                      <LayoutDashboard className="w-10 h-10 stroke-[2.2]" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-gray-950 dark:text-white tracking-tight">No Active Properties</h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md leading-relaxed">
                      You need to add a property first before viewing the dashboard metrics.
                    </p>
                    <button
                      onClick={() => {
                        const form = document.getElementById('add-address-form');
                        if (form) form.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="mt-8 px-8 py-3.5 bg-gray-950 hover:bg-gray-800 dark:bg-white dark:text-gray-950 text-white text-sm font-extrabold rounded-[1.4rem] shadow-soft hover:shadow-lg transition-all active-scale"
                    >
                      Go to Properties
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="border-b border-gray-100 dark:border-slate-800 pb-4 mb-6 flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">Registered Properties & Addresses</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Your ancestral homes and residencies under active HomeSeva management.</p>
                      </div>
                      <button
                        onClick={() => {
                          const form = document.getElementById('add-address-form');
                          if (form) form.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-4 py-2 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 font-extrabold rounded-xl text-xs hover:bg-brand-100 transition"
                      >
                        + Add New Property
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((a) => (
                        <div key={a.id} className="p-5 rounded-3xl border border-gray-200/80 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-800/40 flex items-start justify-between hover:border-brand-500/30 transition">
                          <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 mt-0.5 font-black">
                              <Building className="w-5 h-5" />
                            </div>
                            <div className="text-xs">
                              <p className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                {a.label}
                                {a.isDefault && <Badge tone="brand" className="text-[9px] font-black uppercase px-2 py-0.5">Primary Home</Badge>}
                              </p>
                              <p className="text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed text-sm font-medium">
                                {a.address}, {a.city} - {a.pincode}
                              </p>
                              <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Remote Management Ready
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeAddress(a.id)}
                            className="text-gray-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                            aria-label="Delete address"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div id="add-address-form" className="p-6 sm:p-8 rounded-3xl bg-gray-50/70 dark:bg-slate-800/40 border border-gray-200/80 dark:border-slate-800 max-w-2xl">
                  <h4 className="font-extrabold text-base mb-1 text-gray-900 dark:text-white">Register New Property Address</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Add a property to receive instant on-demand cleaning, plumbing, or catering services.</p>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <Input label="Property Label" placeholder="e.g. Patan Ancestral Home, Bungalow 4" value={newAddr.label} onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })} />
                    <Input label="Pincode" placeholder="384265" value={newAddr.pincode} onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })} />
                    <div className="col-span-2">
                      <Input label="Complete Address" placeholder="House / Bungalow No., Society Name, Landmark or Street" value={newAddr.address} onChange={(e) => setNewAddr({ ...newAddr, address: e.target.value })} />
                    </div>
                    <div className="col-span-2">
                      <Input label="City / Town" placeholder="Patan / Ahmedabad / Gandhinagar" value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} />
                    </div>
                  </div>
                  <Button size="sm" onClick={addAddress} leftIcon={<Plus className="w-4.5 h-4.5" />} className="mt-6 px-8 py-3 !rounded-[1.2rem] !font-extrabold">
                    Save Property Address
                  </Button>
                </div>
              </div>
            )}

            {/* 4. NOTIFICATIONS TAB */}
            {tab === 'notifications' && (
              <div className="space-y-6 max-w-3xl">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">Recent Notifications & Alerts</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Real-time status updates from assigned service specialists.</p>
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="px-4 py-2 rounded-xl text-xs font-extrabold text-brand-600 bg-brand-50 dark:bg-brand-500/10 hover:bg-brand-100 transition">
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {notifList.map((n) => (
                    <div
                      key={n.id}
                      className={`p-5 rounded-3xl border border-gray-200/80 dark:border-slate-800 flex items-start gap-4 transition-all ${
                        !n.read ? 'bg-brand-50/30 dark:bg-brand-950/15 border-brand-200 dark:border-brand-900/60' : 'bg-gray-50/40 dark:bg-slate-800/30'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-brand-600 shadow-sm' : 'bg-gray-300 dark:bg-slate-700'}`} />
                      <div className="text-xs flex-1">
                        <div className="flex justify-between items-center">
                          <p className="font-extrabold text-sm text-gray-900 dark:text-white">{n.title}</p>
                          <span className="text-[10px] font-bold text-gray-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-gray-100 dark:border-slate-700">{n.time}</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mt-1 leading-relaxed text-sm font-normal">{n.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. WALLET & TRANSACTIONS TAB */}
            {tab === 'wallet' && (
              <div className="space-y-8 max-w-4xl">
                <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">Concierge Wallet & Billing</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Prepaid balances for automated home maintenance and rapid checkout.</p>
                </div>
                {/* Balance Hero Card */}
                <div className="rounded-[2rem] bg-gradient-to-br from-brand-600 via-blue-700 to-indigo-900 p-8 text-white shadow-soft-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 text-brand-100 text-xs font-extrabold uppercase tracking-widest">
                      <Wallet className="w-4 h-4" /> HomeSeva Concierge Balance
                    </div>
                    <p className="text-4xl sm:text-5xl font-black tracking-tight mt-2">₹{walletBalance.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-brand-200 mt-2 font-medium">Credits never expire • Valid across all Patan & Ahmedabad services</p>
                  </div>
                  <div className="flex gap-3 relative z-10 w-full sm:w-auto">
                    <button
                      className="px-6 py-3.5 bg-white hover:bg-gray-100 text-slate-950 text-xs font-extrabold rounded-2xl shadow transition active-scale flex-1 sm:flex-initial text-center"
                      onClick={() => toast('Redirecting to secure Payment Gateway...', 'info')}
                    >
                      + Top Up Balance
                    </button>
                    <button
                      className="px-6 py-3.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-extrabold rounded-2xl transition flex-1 sm:flex-initial text-center"
                      onClick={() => toast('Withdraw request initiated', 'info')}
                    >
                      Withdraw
                    </button>
                  </div>
                </div>

                {/* Transactions List */}
                <div className="space-y-3">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-500 mb-4">Transaction History</h3>
                  <div className="divide-y divide-gray-100 dark:divide-slate-800 border border-gray-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-6 bg-gray-50/30 dark:bg-slate-800/20">
                    {walletTransactions.map((t) => (
                      <div key={t.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-11 h-11 rounded-[1.2rem] flex items-center justify-center shrink-0 ${
                              t.type === 'credit'
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                            }`}
                          >
                            {t.type === 'credit' ? <TrendingUp className="w-5 h-5 stroke-[2.2]" /> : <TrendingDown className="w-5 h-5 stroke-[2.2]" />}
                          </div>
                          <div>
                            <p className="font-black text-sm text-gray-900 dark:text-white leading-snug">{t.description}</p>
                            <p className="text-xs text-gray-400 mt-0.5 font-medium">
                              {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`font-black text-base ${
                            t.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {t.type === 'credit' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 6. PROFESSIONAL PERSONAL INFO (PROFILE TAB) */}
            {tab === 'profile' && (
              <div className="space-y-8 max-w-5xl">
                <div className="border-b border-gray-100 dark:border-slate-800 pb-4 flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">Executive Profile & Account Settings</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage personal details, security credentials, and preferred contact roles.</p>
                  </div>
                  <button
                    onClick={() => setTab('edit_profile')}
                    className="px-6 py-2.5 bg-gray-950 hover:bg-gray-800 dark:bg-white dark:text-gray-950 text-white text-xs font-extrabold rounded-2xl transition shadow-sm flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" /> Edit Details
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Personal Card */}
                  <div className="lg:col-span-2 p-6 sm:p-8 rounded-[2rem] border border-gray-200/80 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-800/30 flex flex-col sm:flex-row items-start sm:items-center gap-6 relative overflow-hidden">
                    <div className="w-24 h-24 rounded-[2.2rem] bg-gradient-to-br from-brand-600 to-blue-800 text-white text-3xl font-black flex items-center justify-center shrink-0 shadow-soft-lg border-2 border-white dark:border-slate-700">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-2xl font-black text-gray-950 dark:text-white capitalize tracking-tight">{userName}</h3>
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-200/60">
                          <Check className="w-3 h-3 stroke-[3]" /> Verified Identity
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{userEmail}</p>
                      <div className="pt-2 flex items-center gap-4 text-xs font-bold text-gray-600 dark:text-gray-300">
                        <span className="capitalize bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-gray-200/80 dark:border-slate-700 shadow-2xs">
                          Role: {user?.role ?? 'Customer'}
                        </span>
                        <span className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-gray-200/80 dark:border-slate-700 shadow-2xs">
                          Patan Home Concierge Tier
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Stat Widgets */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                    <div onClick={() => setTab('wallet')} className="p-4 rounded-3xl border border-gray-200/80 dark:border-slate-800 bg-blue-50/50 dark:bg-slate-800/40 flex items-center justify-between cursor-pointer hover:border-brand-400 transition">
                      <div>
                        <p className="text-[11px] font-extrabold text-gray-500 uppercase">Wallet Balance</p>
                        <p className="text-xl font-black text-brand-600 dark:text-brand-400 mt-0.5">₹{walletBalance.toLocaleString('en-IN')}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                    <div onClick={() => setTab('addresses')} className="p-4 rounded-3xl border border-gray-200/80 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 flex items-center justify-between cursor-pointer hover:border-brand-400 transition">
                      <div>
                        <p className="text-[11px] font-extrabold text-gray-500 uppercase">Registered Properties</p>
                        <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">{addresses.length} Properties</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Quick Shortcuts & Role Switching */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="p-5 rounded-3xl bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-sm flex items-center justify-between shadow-soft hover:shadow-lg transition-all"
                    >
                      <span className="flex items-center gap-3"><Shield className="w-5 h-5" /> Launch Admin Control Center</span>
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  )}
                  {user?.role === 'professional' && (
                    <Link
                      to="/pro/dashboard"
                      className="p-5 rounded-3xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm flex items-center justify-between shadow-soft hover:shadow-lg transition-all"
                    >
                      <span className="flex items-center gap-3"><Wrench className="w-5 h-5" /> Open Professional Workspace</span>
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  )}
                  <button
                    onClick={() => setTab('edit_profile')}
                    className="p-5 rounded-3xl border border-gray-200/80 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-900 dark:text-white font-bold text-sm flex items-center justify-between transition text-left"
                  >
                    <span className="flex items-center gap-3 text-gray-700 dark:text-gray-200 font-extrabold"><Settings className="w-5 h-5 text-gray-400" /> Update Contact & Password</span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="p-5 rounded-3xl border border-red-200 dark:border-red-900/40 bg-red-50/50 hover:bg-red-50 dark:bg-red-950/10 dark:hover:bg-red-950/20 text-red-600 font-extrabold text-sm flex items-center justify-between transition text-left"
                  >
                    <span className="flex items-center gap-3"><LogOut className="w-5 h-5" /> Sign Out of HomeSeva</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* 7. PROFILE EDITOR (SUB-TAB) */}
            {tab === 'edit_profile' && (
              <div className="space-y-6 max-w-2xl">
                <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">Edit Personal Info & Credentials</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Keep your phone number and emergency residential address up to date.</p>
                </div>
                <div className="flex items-center gap-6 py-2">
                  <div className="w-20 h-20 rounded-[2rem] bg-brand-600 text-white flex items-center justify-center text-3xl font-black shadow-soft">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <Button variant="outline" size="sm" className="!rounded-2xl !font-extrabold" onClick={() => toast('Image upload is mockup', 'info')}>
                    Upload New Avatar
                  </Button>
                </div>

                <div className="space-y-4 pt-2">
                  <Input label="Full Name" defaultValue={userName} className="!rounded-xl" />
                  <Input label="Email Address" defaultValue={userEmail} className="!rounded-xl" />
                  <Input label="Phone Number" placeholder="+91 98765 43210" className="!rounded-xl" />
                  <Input label="Primary City" defaultValue="Patan / Ahmedabad" className="!rounded-xl" />
                </div>
                
                <div className="flex gap-4 mt-8 pt-4 border-t border-gray-100 dark:border-slate-800">
                  <Button variant="outline" size="sm" className="!px-8 !py-3 !rounded-[1.2rem] !font-bold" onClick={() => setTab('profile')}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="!px-10 !py-3 !rounded-[1.2rem] !font-extrabold"
                    leftIcon={<Check className="w-4.5 h-4.5" />}
                    onClick={() => {
                      toast('Profile updated successfully', 'success');
                      setTab('profile');
                    }}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {/* 8. FOOD ARRANGEMENTS TAB */}
            {tab === 'food' && (
              <div className="py-12 flex flex-col items-center justify-center text-center max-w-xl mx-auto">
                <div className="w-20 h-20 rounded-[2rem] bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6 shadow-2xs">
                  <ChefHat className="w-10 h-10 stroke-[2.2]" />
                </div>
                <h3 className="text-xl sm:text-3xl font-extrabold text-gray-950 dark:text-white tracking-tight">Patan Heritage Food & Catering</h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md leading-relaxed">
                  Request authentic Gujarati and Jain thali feasts, gourmet meal arrangements, and event catering directly to your ancestral residence.
                </p>
                <Link to="/catering" className="mt-8">
                  <button className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-extrabold rounded-[1.4rem] shadow-soft hover:shadow-lg transition-all active-scale">
                    Explore Catering Catalog
                  </button>
                </Link>
              </div>
            )}

            {/* 9. TAXI BOOKINGS TAB */}
            {tab === 'taxi' && (
              <div className="py-12 flex flex-col items-center justify-center text-center max-w-xl mx-auto">
                <div className="w-20 h-20 rounded-[2rem] bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-6 shadow-2xs">
                  <Car className="w-10 h-10 stroke-[2.2]" />
                </div>
                <h3 className="text-xl sm:text-3xl font-extrabold text-gray-950 dark:text-white tracking-tight">Executive Airport Transfers & City Rides</h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md leading-relaxed">
                  Book well-maintained Sedans and SUVs with professional concierge drivers for Ahmedabad airport drops and local Patan transit.
                </p>
                <Link to="/taxi" className="mt-8">
                  <button className="px-8 py-3.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-extrabold rounded-[1.4rem] shadow-soft hover:shadow-lg transition-all active-scale">
                    Launch Taxi Concierge
                  </button>
                </Link>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
        </div>
      </div>

      {/* Booking Cancellation Alert Modal */}
      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel booking?"
        footer={
          <div className="flex justify-end gap-2.5 w-full">
            <Button variant="ghost" onClick={() => setCancelTarget(null)}>No, Keep</Button>
            <Button variant="danger" onClick={cancelBooking}>Yes, Cancel</Button>
          </div>
        }
      >
        <p className="text-xs text-gray-600 dark:text-gray-400 text-left leading-normal">
          Are you sure you want to cancel booking for <span className="font-bold">{cancelTarget?.serviceName}</span> scheduled on{' '}
          {cancelTarget && new Date(cancelTarget.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}? Free cancellations permitted up to 2 hours in advance.
        </p>
      </Modal>

      {/* Image 2: Filter Bookings Modal */}
      <Modal
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        title="Filter Bookings"
      >
        <div className="space-y-6 text-left py-2 max-h-[65vh] overflow-y-auto pr-1">
          <div>
            <h5 className="text-[10px] font-extrabold text-gray-400 tracking-wider uppercase mb-3">Categories</h5>
            <div className="space-y-2.5">
              {['Home Services', 'Taxi Bookings', 'Store Orders', 'Property Management', 'Security Services', 'Catering & Food'].map((cat) => (
                <div
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200/80 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/60 cursor-pointer transition select-none"
                >
                  <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">{cat}</span>
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                    selectedCategories.includes(cat)
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                  }`}>
                    {selectedCategories.includes(cat) && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-[10px] font-extrabold text-gray-400 tracking-wider uppercase mb-3">Booking Status</h5>
            <div className="space-y-2.5">
              {['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'].map((stat) => (
                <div
                  key={stat}
                  onClick={() => toggleStatus(stat)}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200/80 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/60 cursor-pointer transition select-none"
                >
                  <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">{stat}</span>
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                    selectedStatuses.includes(stat)
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                  }`}>
                    {selectedStatuses.includes(stat) && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900">
            <button
              type="button"
              onClick={() => { setSelectedCategories([]); setSelectedStatuses([]); }}
              className="text-xs sm:text-sm font-extrabold text-gray-500 hover:text-gray-900 dark:hover:text-white transition px-2"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={() => setFilterModalOpen(false)}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-soft transition active-scale"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

function BookingCard({ booking, onCancel }: { booking: Booking; onCancel: () => void }) {
  const { toast } = useToast();
  const [showTrack, setShowTrack] = useState(true);

  const allTrackerSteps = [
    { id: 'pending', label: 'PENDING', desc: 'Booking request received & processing.' },
    { id: 'confirmed', label: 'CONFIRMED', desc: 'Booking confirmed & specialist assigned.' },
    { id: 'assigned', label: 'ASSIGNED', desc: 'Technician scheduled for visit.' },
    { id: 'on-the-way', label: 'HELPER ON THE WAY', desc: 'Specialist en route to your residence.' },
    { id: 'in-progress', label: 'IN PROGRESS', desc: 'Service specialist has commenced work.' },
    { id: 'completed', label: 'COMPLETED', desc: 'Service successfully completed & verified.' },
    { id: 'review', label: 'REVIEW REQUESTED', desc: 'Please rate your experience.' },
  ];

  const getStepIndex = (status: Booking['status']) => {
    switch (status) {
      case 'pending': return 0;
      case 'upcoming': return 1;
      case 'on-route': return 3;
      case 'in-progress':
      case 'started': return 4;
      case 'completed': return 5;
      default: return 1;
    }
  };

  const currentStepIdx = getStepIndex(booking.status);

  const statusBadges: Record<Booking['status'], { badge: string; text: string; label: string }> = {
    pending: { badge: 'border border-amber-300 text-amber-600 bg-amber-50/50 dark:bg-amber-950/20', text: 'text-amber-600', label: 'PENDING' },
    upcoming: { badge: 'border border-blue-300 text-blue-600 bg-blue-50/50 dark:bg-blue-950/20', text: 'text-blue-600', label: 'CONFIRMED' },
    'in-progress': { badge: 'border border-indigo-300 text-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20', text: 'text-indigo-600', label: 'IN PROGRESS' },
    completed: { badge: 'border border-emerald-300 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20', text: 'text-emerald-600', label: 'COMPLETED' },
    cancelled: { badge: 'border border-rose-300 text-rose-600 bg-rose-50/50 dark:bg-rose-950/20', text: 'text-rose-600', label: 'CANCELLED' },
    'on-route': { badge: 'border border-purple-300 text-purple-600 bg-purple-50/50 dark:bg-purple-950/20', text: 'text-purple-600', label: 'ON ROUTE' },
    started: { badge: 'border border-indigo-300 text-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20', text: 'text-indigo-600', label: 'STARTED' }
  };

  const style = statusBadges[booking.status] || statusBadges['upcoming'];
  const activeStep = allTrackerSteps[currentStepIdx] || allTrackerSteps[0];

  return (
    <div className="bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 rounded-[2rem] p-6 sm:p-8 flex flex-col shadow-sm hover:shadow-soft transition-all duration-300 text-left relative overflow-hidden select-none">
      {/* Top Title & Status Pill (Like Image 1) */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-black text-base sm:text-lg text-gray-900 dark:text-white tracking-tight">{booking.serviceName}</h4>
          <p className="text-xs font-semibold text-gray-400 mt-0.5">
            ID: #{booking.id.toUpperCase() || '247A73'}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase shrink-0 ${style.badge}`}>
          {style.label}
        </div>
      </div>

      {/* Middle Metadata Grid (Like Image 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 mt-6 text-xs text-gray-500 dark:text-gray-400">
        <div className="space-y-2">
          <p className="font-medium">
            <span className="text-gray-400 font-semibold">Booked On: </span>
            <span className="text-gray-700 dark:text-gray-200 font-extrabold">{new Date(booking.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
          </p>
          <p className="font-medium truncate">
            <span className="text-gray-400 font-semibold">Location: </span>
            <span className="text-gray-700 dark:text-gray-200 font-extrabold">Home - 32, Ahmedabad / Patan Residence</span>
          </p>
        </div>
        <div className="sm:text-right">
          <p className="font-medium">
            <span className="text-gray-400 font-semibold">Scheduled For: </span>
            <span className="text-gray-700 dark:text-gray-200 font-extrabold">{booking.date} • {booking.timeSlot}</span>
          </p>
        </div>
      </div>

      {/* Amount & Hide Details toggle (Like Image 1) */}
      <div className="flex items-center justify-between mt-6 pt-2">
        <p className="text-xs">
          <span className="text-gray-400 font-semibold">Amount: </span>
          <span className="text-base font-black text-gray-950 dark:text-white ml-0.5">₹{booking.price}</span>
        </p>
        <div className="flex items-center gap-4">
          {(booking.status === 'upcoming' || booking.status === 'pending') && (
            <button
              onClick={onCancel}
              className="text-xs font-extrabold text-red-500 hover:underline transition"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => setShowTrack(!showTrack)}
            className="text-xs font-black text-blue-600 dark:text-blue-400 hover:underline transition flex items-center gap-1"
          >
            <span>{showTrack ? 'Hide Details' : 'Show Details'}</span>
            <span>{showTrack ? '↑' : '↓'}</span>
          </button>
        </div>
      </div>

      {/* SERVICE TRACKER (LIKE IMAGE 1) */}
      {showTrack && (
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
          <p className="text-[10px] font-extrabold text-gray-400 tracking-widest uppercase mb-8">Service Tracker</p>
          
          {booking.status === 'cancelled' ? (
            <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/80 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>This service booking has been cancelled. Refunds or credit notes will be credited to your Concierge Wallet.</span>
            </div>
          ) : (
            <>
              {/* Horizontal Multi-Step Progress Tracker */}
              <div className="py-2 overflow-x-auto no-scrollbar">
                <div className="flex items-center justify-between min-w-[620px] relative px-4">
                  {/* Connecting background line */}
                  <div className="absolute left-10 right-10 top-5 h-[2px] bg-gray-200 dark:bg-slate-800 -z-0" />

                  {allTrackerSteps.map((step, idx) => {
                    const isPassed = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;

                    return (
                      <div key={step.id} className="flex flex-col items-center text-center relative z-10 w-20">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            isCurrent
                              ? 'bg-white dark:bg-slate-900 border-[3px] border-blue-600 shadow-sm ring-4 ring-blue-100 dark:ring-blue-950 text-blue-600'
                              : isPassed
                              ? 'bg-blue-600 border-2 border-white dark:border-slate-900 text-white shadow-2xs'
                              : 'bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-300'
                          }`}
                        >
                          {isCurrent ? (
                            <Check className="w-5 h-5 stroke-[3] text-blue-600 dark:text-blue-400" />
                          ) : isPassed ? (
                            <Check className="w-5 h-5 stroke-[3]" />
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-slate-700" />
                          )}
                        </div>
                        <span
                          className={`mt-2.5 text-[8.5px] tracking-wider leading-tight uppercase ${
                            isCurrent
                              ? 'text-blue-600 dark:text-blue-400 font-black'
                              : isPassed
                              ? 'text-gray-700 dark:text-gray-300 font-bold'
                              : 'text-gray-300 dark:text-slate-600 font-semibold'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Current Status Timeline Note (Like Bottom of Image 1) */}
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-850/60">
                <div className="flex items-start gap-3.5 text-left">
                  <div className="w-4 h-4 rounded-full mt-0.5 shrink-0 bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-950 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-gray-950 dark:text-white capitalize">{activeStep.label.toLowerCase()}</span>
                      <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {booking.timeSlot || '14:57'}</span>
                    </div>
                    <div className="mt-3 p-4.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-gray-200/60 dark:border-slate-700/60 text-xs text-gray-600 dark:text-gray-300 font-semibold leading-relaxed">
                      {booking.timeline && booking.timeline.length > 0 ? booking.timeline[booking.timeline.length - 1].note : activeStep.desc}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
