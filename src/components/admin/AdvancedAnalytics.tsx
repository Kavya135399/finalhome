import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { Users, Activity, IndianRupee, Globe, Smartphone, Monitor, ShoppingBag, Eye } from 'lucide-react';
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

export default function AdvancedAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [liveVisitors, setLiveVisitors] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial analytics
    apiClient.getAnalytics().then((res: any) => {
      setData(res);
      setLiveVisitors(res.onlineVisitors || 0);
      setLoading(false);
    }).catch((err: any) => {
      console.error("Failed to fetch analytics", err);
      setLoading(false);
    });

    // Socket.io for live visitors
    const socket: Socket = io(window.location.origin);
    
    socket.on('live_visitors', (count: number) => {
      setLiveVisitors(count);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // MOCK DATA for charts (since we just started tracking)
  const visitorsTrend = [
    { name: 'Mon', visitors: 120 }, { name: 'Tue', visitors: 150 }, { name: 'Wed', visitors: 180 },
    { name: 'Thu', visitors: 140 }, { name: 'Fri', visitors: 210 }, { name: 'Sat', visitors: 250 },
    { name: 'Sun', visitors: Math.max(300, data?.totalVisitors || 0) }
  ];

  const deviceData = [
    { name: 'Mobile', value: 65, color: '#ec4899' },
    { name: 'Desktop', value: 30, color: '#3b82f6' },
    { name: 'Tablet', value: 5, color: '#10b981' }
  ];

  const trafficSources = [
    { name: 'Organic', users: 400 },
    { name: 'Direct', users: 300 },
    { name: 'Social', users: 200 },
    { name: 'Referral', users: 100 }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Top Real-Time KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/30 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center text-rose-500">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <Badge tone="red" className="animate-pulse">Live Now</Badge>
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white">{liveVisitors}</h3>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Online Visitors</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-500">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white">{data?.totalVisitors || 0}</h3>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Total Visitors</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-500">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white">₹{data?.totalRevenue?.toLocaleString() || 0}</h3>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Total Revenue</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-purple-100 dark:border-purple-900/30 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-500">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white">{data?.totalBookings || 0}</h3>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Total Bookings</p>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitor Trend */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6">Visitor Traffic (7 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitorsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="visitors" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#visitorGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Device & Traffic Sources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Device Pie Chart */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col">
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Devices</h3>
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={deviceData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {deviceData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-xs font-bold text-gray-500">{d.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Traffic Sources Bar Chart */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col">
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Traffic Sources</h3>
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trafficSources} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.1} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }} width={60} />
                  <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="users" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Latest Visitors Table */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-brand-500" />
            Recent Visitors (Live)
          </h3>
          <Badge tone="green" className="animate-pulse">Tracking Active</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50">
                <th className="p-4 text-xs font-black uppercase tracking-widest text-gray-500">Visitor IP</th>
                <th className="p-4 text-xs font-black uppercase tracking-widest text-gray-500">Location</th>
                <th className="p-4 text-xs font-black uppercase tracking-widest text-gray-500">Device/Browser</th>
                <th className="p-4 text-xs font-black uppercase tracking-widest text-gray-500">Referrer</th>
                <th className="p-4 text-xs font-black uppercase tracking-widest text-gray-500 text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {data?.visitors?.slice(0, 10).map((visitor: any) => (
                <tr key={visitor.id} className="border-b border-gray-100 dark:border-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="p-4">
                    <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                      {visitor.ip?.replace(/^::ffff:/, '')}
                    </span>
                    {visitor.visit_count > 1 && (
                      <Badge tone="brand" className="ml-2 text-[9px] py-0.5 px-1.5">Returning x{visitor.visit_count}</Badge>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {visitor.city}, {visitor.country}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {visitor.device === 'Mobile' ? <Smartphone className="w-4 h-4 text-gray-400" /> : <Monitor className="w-4 h-4 text-gray-400" />}
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {visitor.os} - {visitor.browser}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate max-w-[150px] block">
                      {visitor.referrer}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-xs font-bold text-gray-500">
                      {new Date(visitor.last_visit).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                </tr>
              ))}
              {(!data?.visitors || data.visitors.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-medium italic">
                    Waiting for visitors...
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
