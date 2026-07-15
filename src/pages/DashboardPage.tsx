import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar,
  Heart,
  MapPin,
  Bell,
  Wallet,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  Star,
  Plus,
  Trash2,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  TrendingDown,
  CreditCard,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { userBookings, savedAddresses, notifications, walletTransactions, services } from '../data/sampleData';
import type { Booking, SavedAddress } from '../types';

type Tab = 'overview' | 'bookings' | 'favorites' | 'addresses' | 'notifications' | 'wallet' | 'profile';

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'profile', label: 'Profile', icon: User },
];

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
  const [tab, setTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookingFilter, setBookingFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [bookings, setBookings] = useState(userBookings);
  const [favorites, setFavorites] = useState<string[]>(['s1', 's5']);
  const [addresses, setAddresses] = useState<SavedAddress[]>(savedAddresses);
  const [notifList, setNotifList] = useState(notifications);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [newAddr, setNewAddr] = useState({ label: '', address: '', city: '', pincode: '' });

  const upcoming = bookings.filter((b) => b.status === 'upcoming');
  const completed = bookings.filter((b) => b.status === 'completed');
  const cancelled = bookings.filter((b) => b.status === 'cancelled');
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
    if (!newAddr.label || !newAddr.address || !newAddr.pincode) { toast('Please fill all fields', 'error'); return; }
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

  const sidebarContent = (
    <div className="space-y-1">
      <div className="px-3 py-4 mb-2 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 dark:text-brand-300 font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{userName}</p>
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
          </div>
        </div>
      </div>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => { setTab(t.id); setSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
            tab === t.id ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
          }`}
        >
          <t.icon className="w-4 h-4" />
          {t.label}
          {t.id === 'notifications' && unreadCount > 0 && (
            <span className="ml-auto bg-brand-600 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </button>
      ))}
      <div className="pt-3 mt-3 border-t border-gray-100 dark:border-slate-800 space-y-1">
        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-16 flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold font-display">My Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, {userName.split(' ')[0]}!</p>
            </div>
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="grid lg:grid-cols-[240px_1fr] gap-8">
            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="card p-3 sticky top-24">{sidebarContent}</div>
            </aside>

            {/* Mobile sidebar */}
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 lg:hidden"
                >
                  <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                  <motion.div
                    initial={{ x: -280 }}
                    animate={{ x: 0 }}
                    exit={{ x: -280 }}
                    className="absolute left-0 top-0 bottom-0 w-72 glass-strong p-4 overflow-y-auto"
                  >
                    <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
                      <X className="w-5 h-5" />
                    </button>
                    {sidebarContent}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content */}
            <div>
              <AnimatePresence mode="wait">
                <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  {tab === 'overview' && (
                    <div className="space-y-6">
                      {/* Stat cards */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { label: 'Upcoming', value: upcoming.length, icon: Clock, tone: 'text-brand-600 bg-brand-50 dark:bg-brand-950/40' },
                          { label: 'Completed', value: completed.length, icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
                          { label: 'Cancelled', value: cancelled.length, icon: XCircle, tone: 'text-red-600 bg-red-50 dark:bg-red-950/40' },
                          { label: 'Wallet', value: `₹${walletBalance}`, icon: Wallet, tone: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
                        ].map((s) => (
                          <div key={s.label} className="card p-5">
                            <div className={`w-10 h-10 rounded-xl ${s.tone} flex items-center justify-center mb-3`}>
                              <s.icon className="w-5 h-5" />
                            </div>
                            <p className="text-2xl font-bold">{s.value}</p>
                            <p className="text-xs text-gray-500">{s.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Upcoming bookings */}
                      <div className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold">Upcoming bookings</h3>
                          <button onClick={() => setTab('bookings')} className="text-sm text-brand-600 hover:underline">View all</button>
                        </div>
                        {upcoming.length > 0 ? (
                          <div className="space-y-3">
                            {upcoming.slice(0, 2).map((b) => <BookingRow key={b.id} booking={b} onCancel={() => setCancelTarget(b)} />)}
                          </div>
                        ) : (
                          <EmptyState icon={<Calendar className="w-8 h-8" />} title="No upcoming bookings" description="Book a service to see it here." action={<Link to="/services"><Button>Browse services</Button></Link>} />
                        )}
                      </div>
                    </div>
                  )}

                  {tab === 'bookings' && (
                    <div>
                      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                        {(['all', 'upcoming', 'completed', 'cancelled'] as const).map((f) => (
                          <button
                            key={f}
                            onClick={() => setBookingFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition ${
                              bookingFilter === f ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                      {filteredBookings.length > 0 ? (
                        <div className="space-y-3">
                          {filteredBookings.map((b) => <BookingRow key={b.id} booking={b} onCancel={() => setCancelTarget(b)} />)}
                        </div>
                      ) : (
                        <EmptyState icon={<Calendar className="w-8 h-8" />} title="No bookings here" description="Your bookings will appear in this list." action={<Link to="/services"><Button>Book a service</Button></Link>} />
                      )}
                    </div>
                  )}

                  {tab === 'favorites' && (
                    <div>
                      {favoriteServices.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {favoriteServices.map((s) => (
                            <div key={s.id} className="card p-4">
                              <img src={s.image} alt={s.name} className="w-full h-32 object-cover rounded-xl mb-3" />
                              <h4 className="font-semibold text-sm">{s.name}</h4>
                              <p className="text-xs text-gray-500 mb-2">{s.categoryName}</p>
                              <div className="flex items-center justify-between">
                                <span className="font-bold">₹{s.price}</span>
                                <div className="flex gap-1.5">
                                  <Link to={`/services/${s.slug}`}><Button size="sm" variant="outline">View</Button></Link>
                                  <button onClick={() => toggleFavorite(s.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"><Heart className="w-4 h-4 fill-red-500" /></button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState icon={<Heart className="w-8 h-8" />} title="No favorites yet" description="Tap the heart on any service to save it here." action={<Link to="/services"><Button>Browse services</Button></Link>} />
                      )}
                    </div>
                  )}

                  {tab === 'addresses' && (
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="font-semibold">Saved addresses</h3>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4 mb-6">
                        {addresses.map((a) => (
                          <div key={a.id} className="card p-5">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-brand-600" />
                                <p className="font-semibold text-sm">{a.label}</p>
                                {a.isDefault && <Badge tone="brand">Default</Badge>}
                              </div>
                              <button onClick={() => removeAddress(a.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">{a.address}, {a.city} - {a.pincode}</p>
                          </div>
                        ))}
                      </div>
                      <div className="card p-5">
                        <h4 className="font-semibold text-sm mb-4">Add new address</h4>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <Input label="Label" placeholder="Home" value={newAddr.label} onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })} />
                          <Input label="Pincode" placeholder="400050" value={newAddr.pincode} onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })} />
                          <div className="sm:col-span-2"><Input label="Address" placeholder="House no, street, area" value={newAddr.address} onChange={(e) => setNewAddr({ ...newAddr, address: e.target.value })} /></div>
                          <Input label="City" placeholder="Mumbai" value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} />
                        </div>
                        <Button onClick={addAddress} leftIcon={<Plus className="w-4 h-4" />} className="mt-4">Add address</Button>
                      </div>
                    </div>
                  )}

                  {tab === 'notifications' && (
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="font-semibold">Notifications</h3>
                        {unreadCount > 0 && <Button size="sm" variant="ghost" onClick={markAllRead}>Mark all read</Button>}
                      </div>
                      <div className="space-y-2">
                        {notifList.map((n) => (
                          <div key={n.id} className={`card p-4 flex items-start gap-3 ${!n.read ? 'ring-1 ring-brand-200 dark:ring-brand-800' : ''}`}>
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-brand-600' : 'bg-transparent'}`} />
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{n.title}</p>
                              <p className="text-sm text-gray-500">{n.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {tab === 'wallet' && (
                    <div>
                      <div className="card p-6 bg-gradient-to-br from-brand-600 to-brand-800 text-white mb-6">
                        <p className="text-brand-100 text-sm">Wallet balance</p>
                        <p className="text-4xl font-extrabold font-display mt-1">₹{walletBalance}</p>
                        <div className="flex gap-3 mt-5">
                          <Button variant="secondary" size="sm" onClick={() => toast('Add money is a placeholder', 'info')}>Add money</Button>
                          <Button variant="ghost" size="sm" className="!text-white hover:!bg-white/10" onClick={() => toast('Withdraw is a placeholder', 'info')}>Withdraw</Button>
                        </div>
                      </div>
                      <div className="card p-6">
                        <h3 className="font-semibold mb-4">Transaction history</h3>
                        <div className="space-y-2">
                          {walletTransactions.map((t) => (
                            <div key={t.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-800 last:border-0">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${t.type === 'credit' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' : 'bg-red-50 text-red-600 dark:bg-red-950/40'}`}>
                                  {t.type === 'credit' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{t.description}</p>
                                  <p className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                </div>
                              </div>
                              <p className={`font-semibold text-sm ${t.type === 'credit' ? 'text-emerald-600' : 'text-red-500'}`}>
                                {t.type === 'credit' ? '+' : '-'}₹{t.amount}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {tab === 'profile' && (
                    <div className="card p-6 max-w-2xl">
                      <h3 className="font-semibold mb-5">Profile settings</h3>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 dark:text-brand-300 text-2xl font-bold">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => toast('Image upload is a placeholder', 'info')}>Change photo</Button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Input label="Full name" defaultValue={userName} />
                        <Input label="Email" defaultValue={userEmail} />
                        <Input label="Phone" placeholder="+91 98765 43210" />
                        <Input label="City" defaultValue="Mumbai" />
                      </div>
                      <Button className="mt-5" leftIcon={<Settings className="w-4 h-4" />} onClick={() => toast('Profile saved', 'success')}>Save changes</Button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Cancel modal */}
      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel booking?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCancelTarget(null)}>Keep booking</Button>
            <Button variant="danger" onClick={cancelBooking}>Yes, cancel</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to cancel <span className="font-semibold">{cancelTarget?.serviceName}</span> scheduled for{' '}
          {cancelTarget && new Date(cancelTarget.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}? Free cancellation up to 2 hours before.
        </p>
      </Modal>
    </div>
  );
}

function BookingRow({ booking, onCancel }: { booking: Booking; onCancel: () => void }) {
  const { toast } = useToast();
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-slate-800 hover:shadow-soft transition">
      <img src={booking.serviceImage} alt={booking.serviceName} className="w-full sm:w-20 h-20 object-cover rounded-xl shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-sm truncate">{booking.serviceName}</h4>
          <Badge tone={statusTone[booking.status]} className="capitalize">{booking.status}</Badge>
        </div>
        <p className="text-xs text-gray-500">{booking.professionalName}</p>
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {booking.timeSlot}</p>
      </div>
      <div className="flex items-center gap-2 sm:flex-col sm:items-end">
        <div className="text-right">
          <p className="font-bold">₹{booking.price}</p>
          <p className="text-xs text-gray-400 capitalize flex items-center gap-1"><CreditCard className="w-3 h-3" /> {booking.paymentMethod}</p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => toast('Invoice download is a placeholder', 'info')} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800" title="Download invoice"><Download className="w-4 h-4" /></button>
          {booking.status === 'completed' && (
            <button onClick={() => toast('Thanks for rating!', 'success')} className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30" title="Rate"><Star className="w-4 h-4" /></button>
          )}
          {booking.status === 'upcoming' && (
            <button onClick={onCancel} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30" title="Cancel"><XCircle className="w-4 h-4" /></button>
          )}
        </div>
      </div>
    </div>
  );
}
