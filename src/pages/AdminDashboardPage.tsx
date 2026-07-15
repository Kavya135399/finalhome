import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Users, Calendar, DollarSign, Star,
  Wrench, CreditCard, ArrowUpRight, MoreHorizontal, Search, Filter, Download
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';

const kpis = [
  { label: 'Total Revenue', value: '₹48.2L', change: '+12.5%', up: true, icon: DollarSign, tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
  { label: 'Total Bookings', value: '12,847', change: '+8.2%', up: true, icon: Calendar, tone: 'text-brand-600 bg-brand-50 dark:bg-brand-950/40' },
  { label: 'Active Customers', value: '8,932', change: '+15.3%', up: true, icon: Users, tone: 'text-violet-600 bg-violet-50 dark:bg-violet-950/40' },
  { label: 'Avg Rating', value: '4.82', change: '-0.1%', up: false, icon: Star, tone: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
];

const revenueData = [42, 48, 45, 52, 58, 55, 62, 68, 65, 72, 78, 82];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const recentBookings = [
  { id: '#BK-1024', customer: 'Vikram Singh', service: 'Wedding Catering', pro: 'Rajesh Kumar', amount: '₹499', status: 'completed', date: 'Jan 12' },
  { id: '#BK-1023', customer: 'Neha Gupta', service: 'Deep Cleaning', pro: 'Priya Sharma', amount: '₹2,499', status: 'in-progress', date: 'Jan 12' },
  { id: '#BK-1022', customer: 'Arjun Mehta', service: 'Electrical', pro: 'Amit Patel', amount: '₹149', status: 'upcoming', date: 'Jan 13' },
  { id: '#BK-1021', customer: 'Kavya Iyer', service: 'Sofa Cleaning', pro: 'Sunita Reddy', amount: '₹449', status: 'completed', date: 'Jan 11' },
  { id: '#BK-1020', customer: 'Rohit Das', service: 'Pipe Leak Repair', pro: 'Rajesh Kumar', amount: '₹799', status: 'cancelled', date: 'Jan 11' },
];

const topServices = [
  { name: 'Wedding Catering', bookings: 3210, revenue: '₹16.0L', share: 78 },
  { name: 'Full Home Cleaning', bookings: 1890, revenue: '₹47.2L', share: 62 },
  { name: 'Electrical Inspection', bookings: 2450, revenue: '₹3.6L', share: 55 },
  { name: 'Pipe Leak Repair', bookings: 1980, revenue: '₹2.5L', share: 48 },
];

const statusTone: Record<string, 'green' | 'amber' | 'brand' | 'red'> = {
  completed: 'green', 'in-progress': 'amber', upcoming: 'brand', cancelled: 'red',
};

export function AdminDashboardPage() {
  const { toast } = useToast();
  const [period, setPeriod] = useState('12M');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-16 flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold font-display">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Business overview and analytics</p>
            </div>
            <div className="flex items-center gap-2">
              <select value={period} onChange={(e) => setPeriod(e.target.value)} className="input-base !w-auto py-2 text-sm font-medium cursor-pointer">
                <option value="7D">Last 7 days</option>
                <option value="30D">Last 30 days</option>
                <option value="12M">Last 12 months</option>
              </select>
              <Button variant="outline" leftIcon={<Download className="w-4 h-4" />} onClick={() => toast('Report export is a placeholder', 'info')}>Export</Button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpis.map((k, i) => (
              <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${k.tone} flex items-center justify-center`}><k.icon className="w-5 h-5" /></div>
                  <span className={`text-xs font-semibold flex items-center gap-0.5 ${k.up ? 'text-emerald-600' : 'text-red-500'}`}>
                    {k.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{k.change}
                  </span>
                </div>
                <p className="text-2xl font-bold">{k.value}</p>
                <p className="text-xs text-gray-500">{k.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            {/* Revenue chart */}
            <div className="lg:col-span-2 card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold">Revenue Overview</h3>
                <Badge tone="green">+12.5% YoY</Badge>
              </div>
              <div className="flex items-end gap-2 h-48">
                {revenueData.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <div className="w-full bg-gradient-to-t from-brand-600 to-brand-400 rounded-t-lg transition-all duration-300 group-hover:from-brand-700 group-hover:to-brand-500 relative" style={{ height: `${(v / 82) * 100}%` }}>
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold opacity-0 group-hover:opacity-100 transition">₹{v}k</span>
                    </div>
                    <span className="text-[10px] text-gray-400">{months[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top services */}
            <div className="card p-6">
              <h3 className="font-semibold mb-5">Top Services</h3>
              <div className="space-y-4">
                {topServices.map((s, i) => (
                  <motion.div key={s.name} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      <span className="text-xs text-gray-500">{s.bookings}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${s.share}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }} className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{s.revenue}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent bookings */}
          <div className="card overflow-hidden">
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-slate-800">
              <h3 className="font-semibold">Recent Bookings</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input placeholder="Search…" className="input-base !w-40 pl-9 py-2 text-sm" />
                </div>
                <Button variant="ghost" size="sm" leftIcon={<Filter className="w-4 h-4" />}>Filter</Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-slate-800">
                    <th className="px-6 py-3 font-medium">Booking ID</th>
                    <th className="px-6 py-3 font-medium">Customer</th>
                    <th className="px-6 py-3 font-medium">Service</th>
                    <th className="px-6 py-3 font-medium">Professional</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr key={b.id} className="border-b border-gray-50 dark:border-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4 font-medium">{b.id}</td>
                      <td className="px-6 py-4">{b.customer}</td>
                      <td className="px-6 py-4 text-gray-500">{b.service}</td>
                      <td className="px-6 py-4 text-gray-500">{b.pro}</td>
                      <td className="px-6 py-4 font-semibold">{b.amount}</td>
                      <td className="px-6 py-4"><Badge tone={statusTone[b.status]} className="capitalize">{b.status}</Badge></td>
                      <td className="px-6 py-4 text-gray-500">{b.date}</td>
                      <td className="px-6 py-4"><button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick manage tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Professionals', value: '50,234', icon: Wrench, action: 'Manage' },
              { label: 'Services', value: '186', icon: Star, action: 'Manage' },
              { label: 'Cities', value: '35', icon: Users, action: 'Manage' },
              { label: 'Coupons', value: '24', icon: CreditCard, action: 'Manage' },
            ].map((t) => (
              <div key={t.label} className="card p-5 flex items-center justify-between">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center mb-2"><t.icon className="w-4 h-4 text-brand-600" /></div>
                  <p className="text-xl font-bold">{t.value}</p>
                  <p className="text-xs text-gray-500">{t.label}</p>
                </div>
                <Button size="sm" variant="ghost" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />} onClick={() => toast(`${t.action} ${t.label} is a placeholder`, 'info')}>{t.action}</Button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

