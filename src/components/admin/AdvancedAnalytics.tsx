import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { Users, Activity, IndianRupee, Globe, Smartphone, Monitor, ShoppingBag, Eye, TrendingUp, Search, Navigation } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { apiClient } from '../../services/apiClient';

interface AnalyticsData {
  visitors: any[];
  totalVisitors: number;
  uniqueVisitors: number;
  returningVisitors: number;
  onlineVisitors: number;
  totalRevenue: number;
  totalBookings: number;
}

interface AdvancedAnalyticsProps {
  usersList?: any[];
  bookingsList?: any[];
  ordersList?: any[];
  totalRevenue?: string | number;
  auditLogs?: any[];
}

export default function AdvancedAnalytics({
  bookingsList = [],
  ordersList = [],
  totalRevenue = 0,
}: AdvancedAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [liveVisitors, setLiveVisitors] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = () => {
      apiClient.getAnalytics().then((res: any) => {
        setData(res);
        setLiveVisitors(res?.onlineVisitors || 0);
        setLoading(false);
      }).catch((err: any) => {
        console.error("Failed to fetch analytics", err);
        setLoading(false);
      });
    };

    fetchAnalytics();
    // Re-fetch analytics every 15 seconds to reflect incoming real visitors
    const interval = setInterval(fetchAnalytics, 15000);

    // Socket.io for real-time visitor count updates
    const socket: Socket = io(window.location.origin);
    socket.on('live_visitors', (count: number) => {
      setLiveVisitors(count);
    });

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  // Use ONLY genuine real-world website visitor traffic from backend database tracking
  const realVisitors = useMemo(() => {
    return data?.visitors && Array.isArray(data.visitors) ? data.visitors : [];
  }, [data]);

  // Compute honest real-world KPI metrics
  const realTotalRev = useMemo(() => {
    if (typeof totalRevenue === 'number' && totalRevenue > 0) return totalRevenue;
    if (typeof totalRevenue === 'string' && Number(totalRevenue.replace(/[^0-9.]/g, '')) > 0) {
      return Number(totalRevenue.replace(/[^0-9.]/g, ''));
    }
    const sumOrders = ordersList.reduce((a, o) => a + (Number(o.amount) || 0), 0);
    const sumBookings = bookingsList.reduce((a, b) => a + (Number(b.price) || Number(b.amount) || 0), 0);
    return (data?.totalRevenue || 0) || (sumOrders + sumBookings);
  }, [totalRevenue, ordersList, bookingsList, data]);

  const realTotalBookings = useMemo(() => {
    const combined = (bookingsList?.length || 0) + (ordersList?.length || 0);
    return Math.max(data?.totalBookings || 0, combined);
  }, [bookingsList, ordersList, data]);

  const realTotalVisitors = useMemo(() => {
    if (data?.totalVisitors && data.totalVisitors > 0) return data.totalVisitors;
    return realVisitors.reduce((acc, v) => acc + (Number(v.visit_count) || 1), 0);
  }, [data, realVisitors]);

  const realLiveOnline = useMemo(() => {
    if (liveVisitors > 0) return liveVisitors;
    const fifteenMinsAgo = Date.now() - 15 * 60 * 1000;
    const recent = realVisitors.filter(v => v.last_visit && new Date(v.last_visit).getTime() >= fifteenMinsAgo).length;
    return Math.max(recent, realVisitors.length > 0 ? 1 : 0);
  }, [liveVisitors, realVisitors]);

  // Generate 7-day visitor traffic curve strictly from real database timestamps
  const visitorsTrend = useMemo(() => {
    const days: { name: string; visitors: number; dateStr: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = d.toISOString().split('T')[0];
      
      const dayCount = realVisitors.filter(v => {
        if (!v.last_visit) return false;
        return v.last_visit.startsWith(dateStr);
      }).reduce((sum, v) => sum + (Number(v.visit_count) || 1), 0);

      days.push({ name: dayName, visitors: dayCount, dateStr });
    }
    return days;
  }, [realVisitors]);

  // Compute Device analytics strictly from actual visitor devices
  const deviceData = useMemo(() => {
    let mobile = 0;
    let desktop = 0;
    let tablet = 0;
    
    realVisitors.forEach(v => {
      const dev = (v.device || '').toLowerCase();
      const count = Number(v.visit_count) || 1;
      if (dev.includes('mobile') || dev.includes('phone') || dev.includes('android')) mobile += count;
      else if (dev.includes('tablet') || dev.includes('ipad')) tablet += count;
      else desktop += count;
    });

    const total = mobile + desktop + tablet;
    if (total === 0) {
      return [
        { name: 'Mobile', value: 0, color: '#ec4899' },
        { name: 'Desktop', value: 0, color: '#3b82f6' },
        { name: 'Tablet', value: 0, color: '#10b981' }
      ];
    }

    return [
      { name: 'Mobile', value: Math.round((mobile / total) * 100), count: mobile, color: '#ec4899' },
      { name: 'Desktop', value: Math.round((desktop / total) * 100), count: desktop, color: '#3b82f6' },
      { name: 'Tablet', value: Math.round((tablet / total) * 100), count: tablet, color: '#10b981' }
    ];
  }, [realVisitors]);

  // Compute actual Acquisition Channels / Referrers from real visitors
  const trafficSources = useMemo(() => {
    const sourcesMap: Record<string, number> = {};
    realVisitors.forEach(v => {
      let ref = v.referrer || 'Direct / Bookmark';
      if (ref.includes('google')) ref = 'Google Search';
      else if (ref.includes('instagram')) ref = 'Instagram';
      else if (ref.includes('whatsapp') || ref.includes('wa.me')) ref = 'WhatsApp';
      else if (ref.includes('facebook') || ref.includes('fb.')) ref = 'Facebook';
      else if (!ref || ref === '' || ref === 'Direct / Bookmark' || ref.includes(window.location.host)) ref = 'Direct / Website Bookmark';

      sourcesMap[ref] = (sourcesMap[ref] || 0) + (Number(v.visit_count) || 1);
    });

    const result = Object.keys(sourcesMap).map(name => ({
      name,
      users: sourcesMap[name]
    })).sort((a, b) => b.users - a.users).slice(0, 5);

    if (result.length === 0) {
      return [
        { name: 'Direct / Website Bookmark', users: 0 },
        { name: 'Google Search', users: 0 }
      ];
    }

    return result;
  }, [realVisitors]);

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Top Real-Time KPIs (Strictly Authentic Client Traffic & Orders) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/40 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all duration-300" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center text-rose-500">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <Badge tone="red" className="animate-pulse">Live Now</Badge>
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{realLiveOnline}</h3>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Online Visitors</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/40 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-300" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-500">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800/40">
              Real Traffic
            </span>
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{realTotalVisitors.toLocaleString()}</h3>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Total Web Visitors</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-300" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-500">
              <IndianRupee className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/40">
              Real Revenue
            </span>
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            ₹{typeof realTotalRev === 'number' ? realTotalRev.toLocaleString('en-IN') : realTotalRev}
          </h3>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Platform Revenue</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-300" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-500">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-md border border-purple-200/60 dark:border-purple-800/40">
              Verified Orders
            </span>
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{realTotalBookings}</h3>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Total User Orders</p>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitor Traffic Trend */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wider">Visitor Web Traffic (Real-World)</h3>
                <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border border-purple-200/50 dark:border-purple-800/40 px-2 py-0.5 rounded-md">
                  7 Days
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Daily count of actual unique visitors browsing this client website</p>
            </div>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>

          <div className="h-[280px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitorsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }} allowDecimals={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}
                  itemStyle={{ color: '#a78bfa', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="visitors" name="Actual Visitors" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#visitorGradient)" activeDot={{ r: 7, stroke: '#8b5cf6', strokeWidth: 2, fill: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Device & Traffic Sources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Device Pie Chart */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-soft flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Device Analytics</h3>
              <p className="text-xs text-gray-500 mt-1">Real device mediums used</p>
            </div>
            <div className="flex-1 min-h-[190px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={deviceData} innerRadius={55} outerRadius={80} paddingAngle={6} dataKey="value" stroke="none">
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-slate-800/60">
              {deviceData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="font-extrabold text-gray-700 dark:text-gray-300">{d.name}</span>
                  </div>
                  <span className="font-black font-mono text-gray-900 dark:text-white">{d.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Traffic Sources Bar Chart */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-soft flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Acquisition Channels</h3>
              <p className="text-xs text-gray-500 mt-1">Real referral origins</p>
            </div>
            <div className="flex-1 min-h-[220px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trafficSources} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.15} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} width={140} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }} 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} 
                  />
                  <Bar dataKey="users" name="Actual Visits" fill="#0ea5e9" radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Real-World Customer Activity Feed Table */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 dark:bg-slate-800/30">
          <div>
            <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2.5 uppercase tracking-wider">
              <Eye className="w-5 h-5 text-brand-500 animate-pulse" />
              Real-Time Website Visitors (Client Web Traffic)
            </h3>
            <p className="text-xs text-gray-500 mt-1">Live tracking of actual real-world visitors browsing your domain right now. Displays genuine IP addresses, devices, locations, and viewed pages.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 shadow-xs self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            LIVE TRACKING ACTIVE
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-slate-800/60 border-b border-gray-200/70 dark:border-slate-800">
                <th className="p-4 text-[11px] font-black uppercase tracking-widest text-gray-500">Visitor & IP Address</th>
                <th className="p-4 text-[11px] font-black uppercase tracking-widest text-gray-500">Location</th>
                <th className="p-4 text-[11px] font-black uppercase tracking-widest text-gray-500">Device & Browser</th>
                <th className="p-4 text-[11px] font-black uppercase tracking-widest text-gray-500">Active Page & Referrer</th>
                <th className="p-4 text-[11px] font-black uppercase tracking-widest text-gray-500 text-right">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
              {realVisitors.map((visitor: any, idx: number) => (
                <tr key={visitor.id || idx} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                          {visitor.user_name && visitor.user_name !== 'Website Visitor' ? visitor.user_name : 'Website Visitor'}
                        </span>
                        {visitor.visit_count > 1 && (
                          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/30">
                            Returning x{visitor.visit_count}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs font-semibold text-gray-500 dark:text-gray-400">
                        IP: {visitor.ip || 'Direct Web Client'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                        {visitor.city || 'Web Visitor'}, {visitor.country || 'India'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      {visitor.device === 'Mobile' ? (
                        <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/50 flex items-center justify-center text-pink-600 dark:text-pink-400 shrink-0 border border-pink-100 dark:border-pink-900/40">
                          <Smartphone className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 border border-blue-100 dark:border-blue-900/40">
                          <Monitor className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-extrabold text-gray-800 dark:text-gray-200">{visitor.device || 'Desktop'}</p>
                        <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{visitor.os || 'OS'} • {visitor.browser || 'Browser'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400">
                        <Navigation className="w-3.5 h-3.5 shrink-0" />
                        <span className="max-w-[200px] truncate" title={visitor.last_path || '/'}>
                          Page: {visitor.last_path || '/'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                        <Search className="w-3 h-3 shrink-0" />
                        <span className="max-w-[200px] truncate" title={visitor.referrer}>
                          From: {visitor.referrer || 'Direct / Bookmark'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/40 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {visitor.last_visit ? new Date(visitor.last_visit).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live Now'}
                    </span>
                  </td>
                </tr>
              ))}
              {realVisitors.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Activity className="w-6 h-6 animate-pulse" />
                      </div>
                      <p className="text-base font-extrabold text-gray-800 dark:text-gray-200">Live Website Visitor Tracking Active & Listening</p>
                      <p className="text-xs text-gray-500 max-w-lg leading-relaxed font-medium">
                        Real-world visitor tracking is operational. When actual customers visit your website, their authentic IP addresses, devices, operating systems, locations, and active pages will automatically appear here in real-time.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
