import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calendar, DollarSign, Star, Clock, CheckCircle2, XCircle,
  Wrench, Wallet, User, Menu, X, TrendingUp, MapPin, BadgeCheck
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Rating } from '../components/ui/Rating';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../context/ToastContext';

type Tab = 'overview' | 'bookings' | 'calendar' | 'earnings' | 'reviews' | 'profile';

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'bookings', label: 'Job Requests', icon: Clock },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'earnings', label: 'Earnings', icon: Wallet },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'profile', label: 'Profile', icon: User },
];

const jobRequests = [
  { id: 'jr1', customer: 'Vikram Singh', service: 'Wedding Catering', address: '221B, Bandra West, Mumbai', slot: 'Today, 10:00 AM', distance: '2.1 km', amount: 499 },
  { id: 'jr2', customer: 'Neha Gupta', service: 'Birthday Catering', address: 'Marine Drive, Mumbai', slot: 'Tomorrow, 02:00 PM', distance: '5.4 km', amount: 1299 },
  { id: 'jr3', customer: 'Arjun Mehta', service: 'Corporate Catering', address: 'Andheri East, Mumbai', slot: 'Jan 16, 11:00 AM', distance: '8.2 km', amount: 899 },
];

const myReviews = [
  { author: 'Vikram Singh', rating: 5, date: 'Jan 12', comment: 'Excellent service! Punctual and professional.' },
  { author: 'Neha Gupta', rating: 5, date: 'Jan 09', comment: 'Very knowledgeable and friendly technician.' },
  { author: 'Arjun Mehta', rating: 4, date: 'Jan 05', comment: 'Good work, slightly delayed arrival.' },
];

const earnings = [
  { day: 'Mon', amount: 1200 }, { day: 'Tue', amount: 1800 }, { day: 'Wed', amount: 900 },
  { day: 'Thu', amount: 2400 }, { day: 'Fri', amount: 1600 }, { day: 'Sat', amount: 3200 }, { day: 'Sun', amount: 800 },
];

export function ProfessionalDashboardPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requests, setRequests] = useState(jobRequests);

  const accept = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    toast('Job accepted! Check your calendar.', 'success');
  };
  const reject = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    toast('Job rejected', 'info');
  };

  const totalEarnings = earnings.reduce((s, e) => s + e.amount, 0);
  const maxEarning = Math.max(...earnings.map((e) => e.amount));

  const sidebar = (
    <div className="space-y-1">
      <div className="px-3 py-4 mb-2 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 dark:text-brand-300 font-bold">R</div>
          <div>
            <p className="font-semibold text-sm flex items-center gap-1">Rajesh Kumar <BadgeCheck className="w-4 h-4 text-brand-600" /></p>
            <p className="text-xs text-gray-500">Catering Manager</p>
          </div>
        </div>
      </div>
      {tabs.map((t) => (
        <button key={t.id} onClick={() => { setTab(t.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${tab === t.id ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
          <t.icon className="w-4 h-4" /> {t.label}
          {t.id === 'bookings' && requests.length > 0 && <span className="ml-auto bg-brand-600 text-white text-xs px-1.5 py-0.5 rounded-full">{requests.length}</span>}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-16 flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold font-display">Professional Dashboard</h1>
              <p className="text-sm text-gray-500">Manage your jobs, earnings, and profile.</p>
            </div>
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"><Menu className="w-5 h-5" /></button>
          </div>

          <div className="grid lg:grid-cols-[240px_1fr] gap-8">
            <aside className="hidden lg:block"><div className="card p-3 sticky top-24">{sidebar}</div></aside>

            <AnimatePresence>
              {sidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 lg:hidden">
                  <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                  <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} className="absolute left-0 top-0 bottom-0 w-72 glass-strong p-4">
                    <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"><X className="w-5 h-5" /></button>
                    {sidebar}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <AnimatePresence mode="wait">
                <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  {tab === 'overview' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { label: 'This Week', value: `₹${totalEarnings.toLocaleString('en-IN')}`, icon: DollarSign, tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
                          { label: 'Jobs Done', value: '47', icon: CheckCircle2, tone: 'text-brand-600 bg-brand-50 dark:bg-brand-950/40' },
                          { label: 'Rating', value: '4.9', icon: Star, tone: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
                          { label: 'Pending', value: requests.length, icon: Clock, tone: 'text-violet-600 bg-violet-50 dark:bg-violet-950/40' },
                        ].map((s) => (
                          <div key={s.label} className="card p-5">
                            <div className={`w-10 h-10 rounded-xl ${s.tone} flex items-center justify-center mb-3`}><s.icon className="w-5 h-5" /></div>
                            <p className="text-2xl font-bold">{s.value}</p>
                            <p className="text-xs text-gray-500">{s.label}</p>
                          </div>
                        ))}
                      </div>

                      <div className="card p-6">
                        <h3 className="font-semibold mb-4">Weekly Earnings</h3>
                        <div className="flex items-end gap-3 h-40">
                          {earnings.map((e) => (
                            <div key={e.day} className="flex-1 flex flex-col items-center gap-2 group">
                              <div className="w-full bg-gradient-to-t from-brand-600 to-brand-400 rounded-t-lg transition group-hover:from-brand-700 group-hover:to-brand-500" style={{ height: `${(e.amount / maxEarning) * 100}%` }} />
                              <span className="text-[10px] text-gray-400">{e.day}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {tab === 'bookings' && (
                    <div>
                      <h3 className="font-semibold mb-4">Incoming job requests</h3>
                      {requests.length > 0 ? (
                        <div className="space-y-3">
                          {requests.map((r) => (
                            <div key={r.id} className="card p-5">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold">{r.service}</h4>
                                    <Badge tone="amber">{r.slot}</Badge>
                                  </div>
                                  <p className="text-sm text-gray-500">{r.customer}</p>
                                  <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-1"><MapPin className="w-3 h-3" /> {r.address} • {r.distance}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <p className="font-bold text-lg">₹{r.amount}</p>
                                  <div className="flex gap-2">
                                    <Button size="sm" leftIcon={<CheckCircle2 className="w-4 h-4" />} onClick={() => accept(r.id)}>Accept</Button>
                                    <Button size="sm" variant="outline" leftIcon={<XCircle className="w-4 h-4" />} onClick={() => reject(r.id)}>Reject</Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState icon={<CheckCircle2 className="w-8 h-8" />} title="No pending requests" description="New job requests will appear here." />
                      )}
                    </div>
                  )}

                  {tab === 'calendar' && (
                    <div className="card p-6">
                      <h3 className="font-semibold mb-4">Your Schedule</h3>
                      <div className="grid grid-cols-7 gap-1.5 mb-4">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="text-center text-xs text-gray-400 py-1">{d}</div>)}
                        {Array.from({ length: 35 }).map((_, i) => {
                          const day = i - 2;
                          const valid = day > 0 && day <= 31;
                          const hasJob = [8, 12, 15, 20, 24].includes(day);
                          return (
                            <div key={i} className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition ${!valid ? 'opacity-30' : 'hover:bg-gray-100 dark:hover:bg-slate-800'} ${hasJob ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold' : ''}`}>
                              {valid && day}
                              {hasJob && <div className="w-1 h-1 rounded-full bg-brand-600 mt-0.5" />}
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-600" /> Days with scheduled jobs</p>
                    </div>
                  )}

                  {tab === 'earnings' && (
                    <div className="space-y-6">
                      <div className="card p-6 bg-gradient-to-br from-brand-600 to-brand-800 text-white">
                        <p className="text-brand-100 text-sm">Total earnings (this week)</p>
                        <p className="text-4xl font-extrabold font-display mt-1">₹{totalEarnings.toLocaleString('en-IN')}</p>
                        <p className="text-brand-100 text-xs mt-2 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> +18% from last week</p>
                      </div>
                      <div className="card p-6">
                        <h3 className="font-semibold mb-4">Recent transactions</h3>
                        <div className="space-y-2">
                          {earnings.map((e, i) => (
                            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-800 last:border-0">
                              <div><p className="text-sm font-medium">{e.day}</p><p className="text-xs text-gray-400">Service payment</p></div>
                              <p className="font-semibold text-emerald-600">+₹{e.amount}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {tab === 'reviews' && (
                    <div>
                      <div className="card p-6 mb-4 flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-4xl font-extrabold font-display text-brand-600">4.9</p>
                          <Rating value={4.9} size="sm" showValue={false} />
                          <p className="text-xs text-gray-500 mt-1">2,843 reviews</p>
                        </div>
                        <div className="flex-1 space-y-1.5">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const pct = star === 5 ? 88 : star === 4 ? 9 : star === 3 ? 2 : 1;
                            return (
                              <div key={star} className="flex items-center gap-2 text-xs">
                                <span className="w-3 text-gray-500">{star}</span>
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden"><div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} /></div>
                                <span className="w-8 text-gray-400">{pct}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="space-y-3">
                        {myReviews.map((r, i) => (
                          <div key={i} className="card p-5">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-semibold text-sm">{r.author}</p>
                              <span className="text-xs text-gray-400">{r.date}</span>
                            </div>
                            <Rating value={r.rating} size="sm" showValue={false} />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{r.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {tab === 'profile' && (
                    <div className="card p-6 max-w-2xl">
                      <h3 className="font-semibold mb-5">Professional Profile</h3>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 dark:text-brand-300 text-2xl font-bold">R</div>
                        <div>
                          <p className="font-semibold flex items-center gap-1.5">Rajesh Kumar <BadgeCheck className="w-4 h-4 text-brand-600" /></p>
                          <p className="text-sm text-gray-500">Catering Manager • Mumbai</p>
                          <Badge tone="green" className="mt-1">Verified</Badge>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><p className="text-xs text-gray-500 mb-1">Experience</p><p className="font-semibold">8 years</p></div>
                        <div><p className="text-xs text-gray-500 mb-1">Jobs completed</p><p className="font-semibold">3,210</p></div>
                        <div><p className="text-xs text-gray-500 mb-1">Skills</p><p className="font-semibold">Wedding Catering, Event Catering, Installation</p></div>
                        <div><p className="text-xs text-gray-500 mb-1">Availability</p><Badge tone="green">Available now</Badge></div>
                      </div>
                      <Button className="mt-6" leftIcon={<Wrench className="w-4 h-4" />} onClick={() => toast('Profile edit is a placeholder', 'info')}>Edit profile</Button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

