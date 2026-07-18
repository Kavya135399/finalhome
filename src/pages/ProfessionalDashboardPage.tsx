import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, DollarSign, Star, Clock, CheckCircle2,
  Wallet, MapPin, BadgeCheck, ChevronRight, TrendingUp, Plus, Wrench
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Rating } from '../components/ui/Rating';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import type { Booking } from '../types';

type Tab = 'overview' | 'bookings' | 'calendar' | 'earnings' | 'reviews' | 'profile' | 'add_service';

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
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get('tab') as Tab) || 'overview';
  
  const setTab = (newTab: Tab) => {
    setSearchParams({ tab: newTab });
  };

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Service Form States
  const [serviceForm, setServiceForm] = useState({
    name: '',
    categoryName: 'Electrical',
    description: '',
    price: '',
    duration: '60 min',
    image: '',
    featuresText: ''
  });
  const [addingService, setAddingService] = useState(false);

  const fetchBookings = () => {
    if (user) {
      setLoading(true);
      apiClient.getBookings({ role: 'professional', name: user.name })
        .then((data) => {
          setBookings(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  // Accept a booking: update status from 'pending' to 'upcoming'
  const acceptJob = async (id: string) => {
    try {
      const updated = await apiClient.updateBookingStatus(id, 'upcoming', 'Booking accepted & confirmed by professional helper');
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      toast('Job accepted! Check active work list.', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to accept job', 'error');
    }
  };

  // Decline/cancel a booking: update status from 'pending' to 'cancelled'
  const declineJob = async (id: string) => {
    try {
      const updated = await apiClient.updateBookingStatus(id, 'cancelled', 'Booking declined by helper');
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      toast('Job request declined', 'info');
    } catch (err: any) {
      toast(err.message || 'Failed to decline job', 'error');
    }
  };

  // Start travel / In-Progress transition
  const startTravel = async (id: string) => {
    try {
      const updated = await apiClient.updateBookingStatus(id, 'in-progress', 'Helper is on the way & has arrived at service location');
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      toast('Status updated to In-Progress!', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to update status', 'error');
    }
  };

  // Complete booking transition
  const completeJob = async (id: string) => {
    try {
      const updated = await apiClient.updateBookingStatus(id, 'completed', 'Service completed successfully by Rajesh Kumar');
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      toast('Job completed! Invoice generated.', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to update status', 'error');
    }
  };

  // Add Service submission
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.name || !serviceForm.price || !serviceForm.description) {
      toast('Please fill all required fields', 'error');
      return;
    }

    setAddingService(true);
    try {
      const features = serviceForm.featuresText
        ? serviceForm.featuresText.split(',').map((f) => f.trim()).filter(Boolean)
        : ['Verified professional', 'Quality guarantee'];

      await apiClient.addService({
        name: serviceForm.name,
        categoryName: serviceForm.categoryName,
        description: serviceForm.description,
        price: Number(serviceForm.price),
        duration: serviceForm.duration,
        image: serviceForm.image || undefined,
        features
      });

      toast('New service added successfully to explore catalog!', 'success');
      setServiceForm({
        name: '',
        categoryName: 'Electrical',
        description: '',
        price: '',
        duration: '60 min',
        image: '',
        featuresText: ''
      });
      setTab('profile');
    } catch (err: any) {
      toast(err.message || 'Failed to add service', 'error');
    } finally {
      setAddingService(false);
    }
  };

  const pendingRequests = bookings.filter((b) => b.status === 'pending');
  const activeJobs = bookings.filter((b) => b.status === 'upcoming' || b.status === 'in-progress');

  const totalEarnings = earnings.reduce((s, e) => s + e.amount, 0);
  const maxEarning = Math.max(...earnings.map((e) => e.amount));

  const proName = user?.name ?? 'Rajesh Kumar';

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-slate-950 min-h-[50vh] text-center">
        <Clock className="w-8 h-8 text-brand-650 animate-spin mb-4" />
        <p className="text-xs font-bold text-gray-500">Syncing work orders database...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-gray-50 dark:bg-slate-950 p-4 select-none max-w-2xl mx-auto w-full">
      
      {/* Tab Synchronized Container */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-4 text-left"
          >
            {/* OVERVIEW TAB */}
            {tab === 'overview' && (
              <div className="space-y-4">
                {/* Pro card widget */}
                <div className="card p-4 flex items-center gap-3 bg-gradient-to-br from-brand-700 to-brand-800 text-white shadow-soft-lg select-none relative overflow-hidden">
                  <div className="absolute right-[-10px] top-[-10px] w-28 h-28 bg-white/10 rounded-full blur-2xl" />
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-black text-xl backdrop-blur-sm shrink-0">
                    {proName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-sm flex items-center gap-1 leading-none">
                      {proName} <BadgeCheck className="w-4 h-4 text-brand-300" />
                    </h2>
                    <p className="text-[10px] text-white/80 mt-1">Catering Manager • Mumbai</p>
                  </div>
                </div>

                {/* Dashboard Metrics grid */}
                <div className="grid grid-cols-2 gap-3 select-none">
                  {[
                    { label: 'Weekly Revenue', value: `₹${totalEarnings}`, icon: DollarSign, tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40', key: 'earnings' },
                    { label: 'Jobs Completed', value: '47', icon: CheckCircle2, tone: 'text-brand-600 bg-brand-50 dark:bg-brand-950/40', key: 'overview' },
                    { label: 'Average Rating', value: '4.9 ★', icon: Star, tone: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40', key: 'reviews' },
                    { label: 'Pending Requests', value: pendingRequests.length, icon: Clock, tone: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40', key: 'bookings' },
                  ].map((s) => (
                    <button
                      key={s.label}
                      onClick={() => setTab(s.key as Tab)}
                      className="card p-3.5 text-left flex flex-col justify-between h-24 hover:shadow-soft active-scale select-none"
                    >
                      <div className={`w-8 h-8 rounded-lg ${s.tone} flex items-center justify-center shrink-0`}>
                        <s.icon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="text-lg font-black text-gray-900 dark:text-white leading-none">{s.value}</p>
                        <p className="text-[9px] text-gray-400 font-semibold mt-1 uppercase tracking-wider">{s.label}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Weekly Earnings preview */}
                <div className="card p-4 bg-white dark:bg-slate-900 select-none">
                  <h3 className="font-extrabold text-xs text-gray-950 dark:text-white mb-4">Weekly Earnings</h3>
                  <div className="flex items-end gap-2.5 h-36">
                    {earnings.map((e) => (
                      <div key={e.day} className="flex-1 flex flex-col items-center gap-1 group">
                        <div
                          className="w-full bg-gradient-to-t from-brand-650 to-brand-400 rounded-t-md relative group-hover:opacity-90 transition-opacity"
                          style={{ height: `${(e.amount / maxEarning) * 100}%` }}
                        >
                          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            ₹{e.amount}
                          </span>
                        </div>
                        <span className="text-[8px] text-gray-400 font-bold">{e.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* BOOKINGS / JOB REQUESTS TAB */}
            {tab === 'bookings' && (
              <div className="space-y-4">
                
                {/* 1. Pending incoming requests */}
                <div className="space-y-3">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-400">Incoming Requests ({pendingRequests.length})</h3>
                  {pendingRequests.length > 0 ? (
                    pendingRequests.map((r) => (
                      <div key={r.id} className="card p-4 bg-white dark:bg-slate-900 flex flex-col gap-3">
                        <div>
                          <div className="flex items-center justify-between gap-1.5">
                            <h4 className="font-extrabold text-xs text-gray-900 dark:text-white">{r.serviceName}</h4>
                            <Badge tone="amber" className="text-[8.5px] leading-none uppercase shrink-0">{r.timeSlot}</Badge>
                          </div>
                          <p className="text-[9px] text-gray-400 mt-1 flex items-center gap-1 leading-snug">
                            <MapPin className="w-3.5 h-3.5 text-brand-650 shrink-0" />
                            {r.address}
                          </p>
                          <p className="text-[9px] text-gray-400 mt-0.5">Date: {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</p>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-800/40 pt-2.5">
                          <p className="font-black text-sm text-gray-905 dark:text-white">Payout: ₹{r.price}</p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => declineJob(r.id)} className="h-9 px-3 rounded-lg text-[10px] font-bold active-scale">
                              Decline
                            </Button>
                            <Button size="sm" onClick={() => acceptJob(r.id)} className="h-9 px-4 rounded-lg text-[10px] font-bold active-scale">
                              Accept Job
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-gray-450 italic pl-1">No incoming request tickets pending.</p>
                  )}
                </div>

                {/* 2. Active ongoing jobs */}
                <div className="space-y-3 pt-2">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-400">Active Work Orders ({activeJobs.length})</h3>
                  {activeJobs.length > 0 ? (
                    activeJobs.map((r) => (
                      <div key={r.id} className="card p-4 bg-white dark:bg-slate-900 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-xs text-gray-900 dark:text-white">{r.serviceName}</h4>
                          <Badge tone={r.status === 'in-progress' ? 'amber' : 'brand'} className="text-[8px] leading-none uppercase">
                            {r.status}
                          </Badge>
                        </div>
                        <div className="text-[10px] text-gray-500 leading-normal">
                          <p className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" /> {r.address}</p>
                          <p className="mt-1">Date: {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} • {r.timeSlot}</p>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-800/40 pt-2.5">
                          <p className="font-black text-sm text-gray-905 dark:text-white">Payout: ₹{r.price}</p>
                          <div>
                            {r.status === 'upcoming' ? (
                              <Button size="sm" onClick={() => startTravel(r.id)} className="h-9 px-4 rounded-lg text-[10px] font-bold bg-amber-600 text-white active-scale">
                                Start Travel
                              </Button>
                            ) : (
                              <Button size="sm" onClick={() => completeJob(r.id)} className="h-9 px-4 rounded-lg text-[10px] font-bold bg-emerald-600 text-white active-scale">
                                Complete Job
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState icon={<CheckCircle2 className="w-8 h-8" />} title="No active jobs" description="No accepted bookings currently ongoing." />
                  )}
                </div>
              </div>
            )}

            {/* CALENDAR TAB */}
            {tab === 'calendar' && (
              <div className="card p-4 bg-white dark:bg-slate-900">
                <h3 className="font-extrabold text-sm text-gray-950 dark:text-white mb-3.5">Schedule Calendar</h3>
                <div className="grid grid-cols-7 gap-1.5 mb-4">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} className="text-center text-[10px] text-gray-400 font-extrabold py-1 uppercase">{d}</div>
                  ))}
                  {Array.from({ length: 35 }).map((_, i) => {
                    const day = i - 2;
                    const valid = day > 0 && day <= 31;
                    const hasJob = [8, 12, 15, 20, 24].includes(day);
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs transition relative ${
                          !valid
                            ? 'opacity-20'
                            : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                        } ${
                          hasJob
                            ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-350 font-black border border-brand-100/30'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {valid && day}
                        {hasJob && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-brand-600 dark:bg-brand-400" />}
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-gray-450 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-600" /> Highlighted dates have jobs scheduled.</p>
              </div>
            )}

            {/* EARNINGS STATEMENTS TAB */}
            {tab === 'earnings' && (
              <div className="space-y-4">
                <div className="card p-5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-soft-lg select-none relative overflow-hidden">
                  <div className="absolute right-[-10px] top-[-10px] w-28 h-28 bg-white/10 rounded-full blur-2xl" />
                  <p className="text-[10px] text-white/80 uppercase tracking-wider font-semibold">Total Revenue (Weekly)</p>
                  <p className="text-3xl font-black font-display mt-1">₹{totalEarnings.toLocaleString('en-IN')}</p>
                  <p className="text-emerald-100 text-[10px] mt-2 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> +18% from last week</p>
                </div>
                
                <div className="card p-4 bg-white dark:bg-slate-900">
                  <h3 className="font-extrabold text-xs text-gray-900 dark:text-white mb-3">Recent Job Payouts</h3>
                  <div className="divide-y divide-gray-105 dark:divide-slate-800">
                    {earnings.map((e, i) => (
                      <div key={i} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-xs font-bold text-gray-800 dark:text-gray-250">{e.day} Job Completion</p>
                          <p className="text-[9px] text-gray-400 mt-0.5">Service statement payout</p>
                        </div>
                        <p className="font-black text-xs text-emerald-650">+₹{e.amount}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* REVIEWS & RATINGS TAB */}
            {tab === 'reviews' && (
              <div className="space-y-4">
                <div className="card p-4 flex items-center gap-6 bg-white dark:bg-slate-900 select-none">
                  <div className="text-center shrink-0">
                    <p className="text-4xl font-black text-brand-650 dark:text-brand-400">4.9</p>
                    <div className="flex justify-center mt-1"><Rating value={4.9} size="sm" showValue={false} /></div>
                    <p className="text-[9px] text-gray-400 mt-1">2,843 reviews</p>
                  </div>
                  <div className="flex-1 space-y-1">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const pct = star === 5 ? 88 : star === 4 ? 9 : star === 3 ? 2 : 1;
                      return (
                        <div key={star} className="flex items-center gap-2 text-[10px] text-gray-500">
                          <span className="w-2.5 text-right">{star}</span>
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          <div className="flex-1 h-1.5 rounded-full bg-gray-150 dark:bg-slate-800 overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-6 text-right text-gray-400">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  {myReviews.map((r, i) => (
                    <div key={i} className="card p-4 bg-white dark:bg-slate-900">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-xs text-gray-800 dark:text-gray-200">{r.author}</p>
                        <span className="text-[9px] text-gray-400">{r.date}</span>
                      </div>
                      <Rating value={r.rating} size="sm" showValue={false} />
                      <p className="text-[11px] text-gray-550 dark:text-gray-400 mt-2 leading-relaxed">{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROFILE HUB TAB */}
            {tab === 'profile' && (
              <div className="space-y-4">
                <div className="card p-4 flex items-center gap-3 bg-white dark:bg-slate-900">
                  <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 flex items-center justify-center font-black text-xl shrink-0">
                    {proName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                      {proName} <BadgeCheck className="w-4 h-4 text-brand-650" />
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">Catering Manager • Mumbai</p>
                    <Badge tone="green" className="text-[7.5px] py-0.5 px-1 mt-1 leading-none">Verified Helper</Badge>
                  </div>
                </div>

                <div className="card p-4 bg-white dark:bg-slate-900 space-y-3 select-none">
                  <h4 className="font-extrabold text-xs text-gray-455 uppercase tracking-wider mb-2">Verification details</h4>
                  <div className="flex justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
                    <span className="text-[10px] text-gray-405">Experience</span>
                    <span className="text-[11px] font-bold">8 Years</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
                    <span className="text-[10px] text-gray-405">Jobs Completed</span>
                    <span className="text-[11px] font-bold">3,210 Bookings</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
                    <span className="text-[10px] text-gray-405">Helper Rating</span>
                    <span className="text-[11px] font-bold">4.92 ★</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-405">Helper Availability</span>
                    <Badge tone="green" className="text-[8px] py-0.5 px-1.5">Active</Badge>
                  </div>
                </div>

                {/* Sub Menu Links List (App Hub Style) */}
                <div className="card p-2 bg-white dark:bg-slate-900 divide-y divide-gray-100 dark:divide-slate-800 select-none">
                  {[
                    { label: 'Schedule Calendar', key: 'calendar', icon: Calendar },
                    { label: 'Earnings statement', key: 'earnings', icon: Wallet },
                    { label: 'Reviews & Feedback', key: 'reviews', icon: Star },
                    { label: 'Add New Service Catalog', key: 'add_service', icon: Plus },
                  ].map((link) => (
                    <button
                      key={link.label}
                      onClick={() => setTab(link.key as Tab)}
                      className="w-full flex items-center justify-between p-3.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/40 rounded-xl transition text-left active-scale"
                    >
                      <span className="flex items-center gap-2.5 font-bold">
                        <link.icon className="w-4 h-4 text-gray-400 shrink-0" /> {link.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-355" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ADD SERVICE TAB FORM */}
            {tab === 'add_service' && (
              <div className="card p-4 bg-white dark:bg-slate-900 text-left">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">
                  <Wrench className="w-4.5 h-4.5 text-brand-600" />
                  <h3 className="font-extrabold text-xs uppercase tracking-wider">Add New Service</h3>
                </div>

                <form onSubmit={handleAddService} className="space-y-4">
                  <Input
                    label="Service Name"
                    placeholder="e.g. Sofa Cleaning"
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                    required
                  />

                  <div>
                    <label className="block text-xs font-bold text-gray-450 dark:text-gray-400 mb-1.5">Category</label>
                    <select
                      value={serviceForm.categoryName}
                      onChange={(e) => setServiceForm({ ...serviceForm, categoryName: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500"
                    >
                      <option value="Electrical">Electrical</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Carpenter">Carpenter</option>
                      <option value="AC Repair">AC Repair</option>
                      <option value="Appliance Repair">Appliance Repair</option>
                      <option value="Home Cleaning">Home Cleaning</option>
                    </select>
                  </div>

                  <Input
                    label="Price (₹)"
                    type="number"
                    placeholder="e.g. 499"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    required
                  />

                  <Input
                    label="Duration"
                    placeholder="e.g. 60 min"
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                  />

                  <Input
                    label="Service Thumbnail Image URL"
                    placeholder="https://images.pexels.com/..."
                    value={serviceForm.image}
                    onChange={(e) => setServiceForm({ ...serviceForm, image: e.target.value })}
                  />

                  <Input
                    label="Features (comma separated)"
                    placeholder="e.g. Foam jet wash, Coil scrub, 45-day warranty"
                    value={serviceForm.featuresText}
                    onChange={(e) => setServiceForm({ ...serviceForm, featuresText: e.target.value })}
                  />

                  <div>
                    <label className="block text-xs font-bold text-gray-450 dark:text-gray-400 mb-1.5">Description</label>
                    <textarea
                      rows={3}
                      placeholder="Explain what is included..."
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                      required
                      className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none resize-none focus:border-brand-500"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" type="button" fullWidth onClick={() => setTab('profile')}>
                      Cancel
                    </Button>
                    <Button size="sm" type="submit" fullWidth loading={addingService}>
                      Submit Service
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
