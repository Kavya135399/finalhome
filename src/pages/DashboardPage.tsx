import { useState } from 'react';
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
  TrendingUp,
  TrendingDown,
  Wrench,
  Shield,
  CreditCard,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { userBookings, savedAddresses, notifications, walletTransactions, services } from '../data/sampleData';
import type { Booking, SavedAddress } from '../types';

type Tab = 'bookings' | 'favorites' | 'addresses' | 'notifications' | 'wallet' | 'profile' | 'edit_profile';

const statusTone: Record<Booking['status'], 'brand' | 'green' | 'red' | 'amber'> = {
  upcoming: 'brand',
  completed: 'green',
  cancelled: 'red',
  'in-progress': 'amber',
};

export function DashboardPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get('tab') as Tab) || 'bookings';

  const [bookingFilter, setBookingFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [bookings, setBookings] = useState(userBookings);
  const [favorites, setFavorites] = useState<string[]>(['s1', 's5']);
  const [addresses, setAddresses] = useState<SavedAddress[]>(savedAddresses);
  const [notifList, setNotifList] = useState(notifications);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [newAddr, setNewAddr] = useState({ label: '', address: '', city: '', pincode: '' });

  const setTab = (newTab: Tab) => {
    setSearchParams({ tab: newTab });
  };

  const filteredBookings = bookingFilter === 'all' ? bookings : bookings.filter((b) => b.status === bookingFilter);
  const favoriteServices = services.filter((s) => favorites.includes(s.id));
  const walletBalance = walletTransactions.reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount), 0);
  const unreadCount = notifList.filter((n) => !n.read).length;

  const cancelBooking = () => {
    if (!cancelTarget) return;
    setBookings((prev) => prev.map((b) => (b.id === cancelTarget.id ? { ...b, status: 'cancelled' as const } : b)));
    toast('Booking cancelled successfully', 'success');
    setCancelTarget(null);
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
  return (
    <div className="card p-3.5 flex flex-col gap-3 hover:shadow-soft transition text-left">
      <div className="flex items-center gap-3">
        <img src={booking.serviceImage} alt={booking.serviceName} className="w-13 h-13 object-cover rounded-xl shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 justify-between">
            <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate pr-1">{booking.serviceName}</h4>
            <Badge tone={statusTone[booking.status]} className="capitalize text-[8px] py-0 shrink-0">
              {booking.status}
            </Badge>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">{booking.professionalName}</p>
        </div>
      </div>

      <div className="text-[10px] text-gray-500 bg-gray-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800/80 flex justify-between select-none">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-brand-600" />
          {new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {booking.timeSlot}
        </span>
        <span className="font-black text-gray-800 dark:text-white">
          ₹{booking.price}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-800/40 pt-2.5">
        <span className="text-[9px] text-gray-400 capitalize flex items-center gap-1 font-medium">
          <CreditCard className="w-3 h-3" /> {booking.paymentMethod}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => toast('Invoice download is a placeholder', 'info')}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
            title="Download Invoice"
            aria-label="Download invoice"
          >
            <Download className="w-4 h-4" />
          </button>
          
          {booking.status === 'completed' && (
            <button
              onClick={() => toast('Feedback received, thank you!', 'success')}
              className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              title="Rate Service"
              aria-label="Rate service"
            >
              <Star className="w-4 h-4 fill-amber-400" />
            </button>
          )}

          {booking.status === 'upcoming' && (
            <button
              onClick={onCancel}
              className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
              title="Cancel Booking"
              aria-label="Cancel booking"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
