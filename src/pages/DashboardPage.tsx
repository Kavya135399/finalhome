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
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { userBookings, savedAddresses, notifications, walletTransactions, services } from '../data/sampleData';
import { apiClient } from '../services/apiClient';
import type { Booking, SavedAddress } from '../types';

type Tab = 'bookings' | 'favorites' | 'addresses' | 'notifications' | 'wallet' | 'profile' | 'edit_profile';

export function DashboardPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get('tab') as Tab) || 'bookings';

  const [bookingFilter, setBookingFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<string[]>(['s1', 's5']);
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

  const filteredBookings = bookingFilter === 'all' ? bookings : bookings.filter((b) => b.status === bookingFilter);
  const favoriteServices = services.filter((s) => favorites.includes(s.id));
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

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
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
    <div className="flex flex-col flex-1 bg-gray-50 dark:bg-slate-950 pb-8">
      
      {/* Dynamic contents depending on current active sub-state tab */}
      <div className="p-4 flex-1 text-left max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* 1. BOOKINGS LIST TAB */}
            {tab === 'bookings' && (
              <div className="space-y-4">
                {/* Horizontal Filter Pills */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 select-none">
                  {(['all', 'upcoming', 'completed', 'cancelled'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setBookingFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition ${
                        bookingFilter === f
                          ? 'bg-brand-600 text-white'
                          : 'bg-gray-100 dark:bg-slate-950/40 text-gray-500 hover:bg-gray-200 border border-gray-100 dark:border-slate-800'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {filteredBookings.length > 0 ? (
                  <div className="space-y-3.5">
                    {filteredBookings.map((b) => (
                      <BookingCard key={b.id} booking={b} onCancel={() => setCancelTarget(b)} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Calendar className="w-10 h-10 text-gray-400" />}
                    title="No bookings found"
                    description="Your appointments will display here once you book."
                    action={<Link to="/services"><Button size="sm">Book Service</Button></Link>}
                  />
                )}
              </div>
            )}

            {/* 2. FAVORITES TAB */}
            {tab === 'favorites' && (
              <div>
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-500 mb-4">Saved Services</h3>
                {favoriteServices.length > 0 ? (
                  <div className="space-y-4">
                    {favoriteServices.map((s) => (
                      <div key={s.id} className="card p-3 flex gap-3 relative">
                        <img src={s.image} alt={s.name} className="w-20 h-20 object-cover rounded-xl shrink-0" />
                        <div className="flex-1 flex flex-col justify-between text-left">
                          <div>
                            <h4 className="font-bold text-xs line-clamp-1">{s.name}</h4>
                            <p className="text-[10px] text-gray-400 mt-0.5">{s.categoryName}</p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-extrabold text-xs">₹{s.price}</span>
                            <div className="flex gap-1.5">
                              <Link to={`/services/${s.slug}`}>
                                <Button size="sm" variant="outline">View</Button>
                              </Link>
                              <button
                                onClick={() => toggleFavorite(s.id)}
                                className="p-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                              >
                                <Heart className="w-4 h-4 fill-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Heart className="w-10 h-10 text-gray-400" />}
                    title="No favorites saved"
                    description="Click the heart on any service card to pin it here."
                    action={<Link to="/services"><Button size="sm">Explore Services</Button></Link>}
                  />
                )}
              </div>
            )}

            {/* 3. SAVED ADDRESSES TAB */}
            {tab === 'addresses' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-500">Saved Addresses</h3>
                <div className="space-y-3">
                  {addresses.map((a) => (
                    <div key={a.id} className="card p-3.5 flex items-start justify-between">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4.5 h-4.5 text-brand-600 shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <p className="font-bold flex items-center gap-1.5">
                            {a.label}
                            {a.isDefault && <Badge tone="brand" className="text-[8px] py-0">Default</Badge>}
                          </p>
                          <p className="text-gray-500 mt-1 leading-normal">
                            {a.address}, {a.city} - {a.pincode}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeAddress(a.id)}
                        className="text-gray-400 hover:text-red-500 p-1"
                        aria-label="Delete address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="card p-4">
                  <h4 className="font-bold text-xs mb-3 text-gray-900 dark:text-white">Add New Address</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <Input label="Label" placeholder="e.g. Home" value={newAddr.label} onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })} />
                    <Input label="Pincode" placeholder="400050" value={newAddr.pincode} onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })} />
                    <div className="col-span-2">
                      <Input label="Address" placeholder="House/Flat/Floor, building name, area" value={newAddr.address} onChange={(e) => setNewAddr({ ...newAddr, address: e.target.value })} />
                    </div>
                    <div className="col-span-2">
                      <Input label="City" placeholder="Mumbai" value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} />
                    </div>
                  </div>
                  <Button size="sm" onClick={addAddress} leftIcon={<Plus className="w-4.5 h-4.5" />} className="mt-4 w-full">
                    Add Address
                  </Button>
                </div>
              </div>
            )}

            {/* 4. NOTIFICATIONS TAB */}
            {tab === 'notifications' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-500">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button size="sm" variant="ghost" className="px-2" onClick={markAllRead}>
                      Mark all read
                    </Button>
                  )}
                </div>
                <div className="space-y-2.5">
                  {notifList.map((n) => (
                    <div
                      key={n.id}
                      className={`card p-3.5 flex items-start gap-3 ${
                        !n.read ? 'border-brand-200 dark:border-brand-900/60 shadow-soft' : ''
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-brand-600' : 'bg-transparent'}`} />
                      <div className="text-xs">
                        <p className="font-bold text-gray-900 dark:text-white">{n.title}</p>
                        <p className="text-gray-500 mt-1 leading-normal">{n.message}</p>
                        <p className="text-[9px] text-gray-400 mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. WALLET TAB */}
            {tab === 'wallet' && (
              <div className="space-y-4">
                {/* Balance Card */}
                <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white shadow-soft">
                  <p className="text-brand-100 text-xs font-semibold">Wallet Balance</p>
                  <p className="text-3xl font-black font-display mt-1">₹{walletBalance}</p>
                  <div className="flex gap-2 mt-4.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="px-4 font-bold"
                      onClick={() => toast('Top-up screen is placeholder', 'info')}
                    >
                      Add Money
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="!text-white hover:!bg-white/10 font-bold border border-white/20"
                      onClick={() => toast('Withdraw is placeholder', 'info')}
                    >
                      Withdraw
                    </Button>
                  </div>
                </div>

                {/* Transactions list */}
                <div className="card p-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-3">Recent Transactions</h3>
                  <div className="divide-y divide-gray-50 dark:divide-slate-800/80">
                    {walletTransactions.map((t) => (
                      <div key={t.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                              t.type === 'credit'
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40'
                                : 'bg-red-50 text-red-600 dark:bg-red-950/40'
                            }`}
                          >
                            {t.type === 'credit' ? <TrendingUp className="w-4.5 h-4.5" /> : <TrendingDown className="w-4.5 h-4.5" />}
                          </div>
                          <div className="text-xs">
                            <p className="font-bold text-gray-900 dark:text-white leading-snug">{t.description}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`font-black text-xs ${
                            t.type === 'credit' ? 'text-emerald-600' : 'text-red-500'
                          }`}
                        >
                          {t.type === 'credit' ? '+' : '-'}₹{t.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 6. PROFILE MAIN SETTINGS TAB */}
            {tab === 'profile' && (
              <div className="space-y-4">
                {/* Profile Detail Header */}
                <div className="card p-4 flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-800 dark:text-brand-300 text-xl font-black">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">{userName}</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">{userEmail}</p>
                  </div>
                  <button
                    onClick={() => setTab('edit_profile')}
                    className="ml-auto text-xs font-bold text-brand-600 hover:underline shrink-0"
                  >
                    Edit
                  </button>
                </div>

                {/* Mobile Menu List Options */}
                <div className="card overflow-hidden">
                  <div className="flex flex-col divide-y divide-gray-50 dark:divide-slate-800/80 text-xs">
                    
                    <button
                      onClick={() => setTab('wallet')}
                      className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 dark:hover:bg-slate-800 transition text-left"
                    >
                      <div className="flex items-center gap-3 font-semibold text-gray-700 dark:text-gray-200">
                        <Wallet className="w-4.5 h-4.5 text-gray-400" />
                        <span>Wallet (₹{walletBalance})</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>

                    <button
                      onClick={() => setTab('addresses')}
                      className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 dark:hover:bg-slate-800 transition text-left"
                    >
                      <div className="flex items-center gap-3 font-semibold text-gray-700 dark:text-gray-200">
                        <MapPin className="w-4.5 h-4.5 text-gray-400" />
                        <span>Saved Addresses</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>

                    <button
                      onClick={() => setTab('favorites')}
                      className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 dark:hover:bg-slate-800 transition text-left"
                    >
                      <div className="flex items-center gap-3 font-semibold text-gray-700 dark:text-gray-200">
                        <Heart className="w-4.5 h-4.5 text-gray-400" />
                        <span>Bookmarks & Saved</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>

                    <button
                      onClick={() => setTab('notifications')}
                      className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 dark:hover:bg-slate-800 transition text-left"
                    >
                      <div className="flex items-center gap-3 font-semibold text-gray-700 dark:text-gray-200">
                        <Bell className="w-4.5 h-4.5 text-gray-400" />
                        <span>Notifications</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {unreadCount > 0 && (
                          <span className="w-4.5 h-4.5 rounded-full bg-brand-600 text-white text-[9px] font-black flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>

                    {user?.role === 'professional' && (
                      <Link
                        to="/pro/dashboard"
                        className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 dark:hover:bg-slate-800 transition text-left font-semibold text-brand-600 dark:text-brand-400"
                      >
                        <div className="flex items-center gap-3">
                          <Wrench className="w-4.5 h-4.5" />
                          <span>Switch to Pro Dashboard</span>
                        </div>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )}

                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 dark:hover:bg-slate-800 transition text-left font-semibold text-violet-600 dark:text-violet-400"
                      >
                        <div className="flex items-center gap-3">
                          <Shield className="w-4.5 h-4.5" />
                          <span>Go to Admin Dashboard</span>
                        </div>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )}

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-between p-3.5 hover:bg-red-50/50 dark:hover:bg-red-950/20 text-red-600 text-left font-bold"
                    >
                      <div className="flex items-center gap-3">
                        <LogOut className="w-4.5 h-4.5" />
                        <span>Sign Out</span>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                  </div>
                </div>
              </div>
            )}

            {/* 7. PROFILE EDITOR (SUB-TAB) */}
            {tab === 'edit_profile' && (
              <div className="space-y-4">
                <div className="card p-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-4">Edit Profile</h3>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-13 h-13 rounded-2xl bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-800 dark:text-brand-300 text-lg font-black">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toast('Image upload is mockup', 'info')}>
                      Upload Avatar
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <Input label="Full Name" defaultValue={userName} />
                    <Input label="Email address" defaultValue={userEmail} />
                    <Input label="Phone Number" placeholder="+91 98765 43210" />
                    <Input label="City" defaultValue="Mumbai" />
                  </div>
                  
                  <div className="flex gap-2.5 mt-5">
                    <Button variant="outline" size="sm" fullWidth onClick={() => setTab('profile')}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      fullWidth
                      leftIcon={<Settings className="w-4 h-4" />}
                      onClick={() => {
                        toast('Profile updated successfully', 'success');
                        setTab('profile');
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
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

    </div>
  );
}

function BookingCard({ booking, onCancel }: { booking: Booking; onCancel: () => void }) {
  const { toast } = useToast();
  const [showTrack, setShowTrack] = useState(false);

  const stepsList = [
    { id: 'pending', label: 'Order Placed', desc: 'Booking requested by customer' },
    { id: 'upcoming', label: 'Confirmed', desc: 'Booking confirmed & helper assigned' },
    { id: 'in-progress', label: 'In Progress', desc: 'Helper has started the service' },
    { id: 'completed', label: 'Completed', desc: 'Service completed successfully' },
  ];

  const currentStatusIdx = stepsList.findIndex((s) => s.id === booking.status);

  const statusStyles: Record<Booking['status'], { bg: string; text: string; dot: string; label: string }> = {
    pending: {
      bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200/30',
      text: 'text-amber-600 dark:text-amber-400',
      dot: 'bg-amber-500',
      label: 'Order Placed'
    },
    upcoming: {
      bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200/30',
      text: 'text-blue-600 dark:text-blue-400',
      dot: 'bg-blue-500',
      label: 'Confirmed'
    },
    'in-progress': {
      bg: 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200/30',
      text: 'text-indigo-600 dark:text-indigo-400',
      dot: 'bg-indigo-500',
      label: 'In Progress'
    },
    completed: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      dot: 'bg-emerald-505',
      label: 'Completed'
    },
    cancelled: {
      bg: 'bg-rose-50 dark:bg-rose-950/20 border-rose-200/30',
      text: 'text-rose-600 dark:text-rose-400',
      dot: 'bg-rose-500',
      label: 'Cancelled'
    }
  };

  const style = statusStyles[booking.status];

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-3xl p-4.5 flex flex-col gap-4 shadow-sm hover:shadow-soft transition-all duration-300 text-left relative overflow-hidden select-none">
      <div className="flex items-center gap-3.5">
        <div className="relative shrink-0">
          <img src={booking.serviceImage} alt={booking.serviceName} className="w-14 h-14 object-cover rounded-2xl border border-gray-100 dark:border-slate-800" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-brand-50 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center">
            <Wrench className="w-3.5 h-3.5 text-brand-650" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-black text-sm text-gray-900 dark:text-white truncate pr-1">{booking.serviceName}</h4>
            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider shrink-0 ${style.bg} ${style.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${booking.status === 'in-progress' ? 'animate-pulse' : ''}`} />
              {style.label}
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-1 font-bold">
            Assigned Pro: <span className="text-gray-700 dark:text-brand-350">{booking.professionalName}</span>
          </p>
        </div>
      </div>

      <div className="text-[11px] text-gray-500 bg-gray-50/50 dark:bg-slate-950/40 p-3 rounded-2xl border border-gray-100/60 dark:border-slate-850/60 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 font-bold text-gray-700 dark:text-gray-300">
            <Calendar className="w-4 h-4 text-brand-600" />
            {new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-1.5 font-bold text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4 text-gray-400" />
            {booking.timeSlot}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block mb-0.5">Grand Total</span>
          <span className="font-black text-brand-650 dark:text-brand-400 text-base">
            ₹{booking.price}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-800/40 pt-3">
        <button
          onClick={() => setShowTrack(!showTrack)}
          className="flex items-center gap-1 text-[11px] font-black text-brand-650 dark:text-brand-400 hover:text-brand-700 transition"
        >
          {showTrack ? 'Hide Tracking Details' : 'Track Booking Progress'}
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showTrack ? 'rotate-180 text-brand-650' : 'text-gray-400'}`} />
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={() => toast('Invoice download is a placeholder', 'info')}
            className="w-8 h-8 rounded-full border border-gray-150 dark:border-slate-800 flex items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition active:scale-95"
            title="Download Invoice"
            aria-label="Download invoice"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          
          {booking.status === 'completed' && (
            <button
              onClick={() => toast('Feedback received, thank you!', 'success')}
              className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center hover:bg-amber-100 dark:hover:bg-amber-950/40 transition active:scale-95 border border-amber-200/20"
              title="Rate Service"
              aria-label="Rate service"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </button>
          )}

          {(booking.status === 'upcoming' || booking.status === 'pending') && (
            <button
              onClick={onCancel}
              className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/20 text-red-550 flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-950/40 transition active:scale-95 border border-rose-200/20"
              title="Cancel Booking"
              aria-label="Cancel booking"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded status progress timeline */}
      {showTrack && (
        <div className="bg-slate-50 dark:bg-slate-950/20 border border-gray-150/40 dark:border-slate-850/45 p-4 rounded-2xl space-y-4">
          <h5 className="font-extrabold text-[9px] uppercase text-gray-400 tracking-wider">Live Tracking Timeline</h5>
          
          <div className="relative pl-6 space-y-5">
            <div className="absolute left-2 w-0.5 top-1.5 bottom-1.5 bg-gray-200 dark:bg-slate-800" />
            
            {stepsList.map((step, idx) => {
              const isPassed = idx <= currentStatusIdx;
              const isCurrent = idx === currentStatusIdx;
              
              if (booking.status === 'cancelled' && step.id === 'completed') {
                return null;
              }

              return (
                <div key={step.id} className="relative flex gap-3 text-xs leading-relaxed">
                  {isCurrent ? (
                    <div className="absolute left-0 -translate-x-[7px] w-4 h-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-450 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-600 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      </span>
                    </div>
                  ) : isPassed ? (
                    <div className="absolute left-0 -translate-x-[7px] w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />
                    </div>
                  ) : (
                    <div className="absolute left-0 -translate-x-[7px] w-4 h-4 rounded-full border-2 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900" />
                  )}
                  
                  <div className="pl-2">
                    <p className={`font-black ${isCurrent ? 'text-brand-600 dark:text-brand-450' : isPassed ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">
                      {isCurrent && booking.timeline && booking.timeline.length > 0 
                        ? booking.timeline[booking.timeline.length - 1].note 
                        : step.desc}
                    </p>
                  </div>
                </div>
              );
            })}

            {booking.status === 'cancelled' && (
              <div className="relative flex gap-3 text-xs pl-6">
                <div className="absolute left-0 -translate-x-[7px] w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />
                </div>
                <div className="pl-2">
                  <p className="font-extrabold text-red-500">Booking Cancelled</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">
                    {booking.timeline?.find((t) => t.status === 'cancelled')?.note || 'Cancelled by customer'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
