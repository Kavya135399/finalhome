import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Users, Calendar, DollarSign, Star,
  Wrench, CreditCard, ArrowUpRight, Search, Filter, Download, ChevronLeft
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';

const kpis = [
  { label: 'Revenue', value: '₹48.2L', change: '+12.5%', up: true, icon: DollarSign, tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
  { label: 'Bookings', value: '12,847', change: '+8.2%', up: true, icon: Calendar, tone: 'text-brand-600 bg-brand-50 dark:bg-brand-950/40' },
  { label: 'Customers', value: '8,932', change: '+15.3%', up: true, icon: Users, tone: 'text-violet-600 bg-violet-50 dark:bg-violet-950/40' },
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
  const navigate = useNavigate();
  const [period, setPeriod] = useState('12M');
  const [query, setQuery] = useState('');

  const filteredBookings = recentBookings.filter((b) => 
    b.customer.toLowerCase().includes(query.toLowerCase()) ||
    b.service.toLowerCase().includes(query.toLowerCase()) ||
    b.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 bg-gray-50 dark:bg-slate-950 p-4 select-none">
      
      {/* Header / Exit */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-2xl px-4 py-3.5 flex items-center justify-between mb-4 shrink-0 shadow-soft">
        <button
          onClick={() => navigate('/dashboard?tab=profile')}
          className="flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
        >
          <ChevronLeft className="w-4 h-4" /> Exit Admin
        </button>
        <span className="text-[10px] font-black uppercase bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 px-2 py-0.5 rounded">
          Admin Panel
        </span>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="card p-3.5 flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between">
              <div className={`w-8 h-8 rounded-lg ${k.tone} flex items-center justify-center shrink-0`}>
                <k.icon className="w-4.5 h-4.5" />
              </div>
              <span className={`text-[9px] font-black flex items-center gap-0.5 ${k.up ? 'text-emerald-600' : 'text-red-500'}`}>
                {k.up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}{k.change}
              </span>
            </div>
            <div>
              <p className="text-base font-black text-gray-905 leading-none">{k.value}</p>
              <p className="text-[9px] text-gray-400 font-semibold mt-1 uppercase tracking-wider">{k.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-2 mb-4">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="flex-1 h-10 px-3 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 text-gray-700 dark:text-gray-300 outline-none"
        >
          <option value="7D">Last 7 days</option>
          <option value="30D">Last 30 days</option>
          <option value="12M">Last 12 months</option>
        </select>
        <Button
          variant="outline"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={() => toast('Report export is a placeholder', 'info')}
          className="h-10 rounded-xl px-4 text-xs font-bold shrink-0"
        >
          Export
        </Button>
      </div>

      {/* Revenue overview mini chart */}
      <div className="card p-4 bg-white dark:bg-slate-900 mb-4 select-none">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-xs text-gray-900 dark:text-white">Revenue Overview</h3>
          <Badge tone="green">+12.5% YoY</Badge>
        </div>
        <div className="flex items-end gap-1.5 h-36">
          {revenueData.slice(-6).map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <div
                className="w-full bg-gradient-to-t from-brand-650 to-brand-400 rounded-t-md relative group-hover:opacity-90 transition-opacity"
                style={{ height: `${(v / 82) * 100}%` }}
              >
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  ₹{v}k
                </span>
              </div>
              <span className="text-[8px] text-gray-400 font-bold">{months[i + 6]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Services lists */}
      <div className="card p-4 bg-white dark:bg-slate-900 mb-4">
        <h3 className="font-extrabold text-xs text-gray-900 dark:text-white mb-3.5">Top Performing Services</h3>
        <div className="space-y-3">
          {topServices.map((s) => (
            <div key={s.name} className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="truncate max-w-[200px]">{s.name}</span>
                <span className="text-gray-400">{s.bookings} Bookings</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-brand-600 rounded-full" style={{ width: `${s.share}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bookings lists (Cards style) */}
      <div className="card p-4 bg-white dark:bg-slate-900 mb-4">
        <div className="flex items-center justify-between gap-3 mb-3 border-b border-gray-100 dark:border-slate-800 pb-2.5">
          <h3 className="font-extrabold text-xs text-gray-900 dark:text-white">Recent Transactions</h3>
          <button onClick={() => toast('Filters drawer', 'info')} className="p-1 text-gray-450 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bookings..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-gray-50 dark:bg-slate-800 border-none outline-none text-xs text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>

        <div className="space-y-3">
          {filteredBookings.map((b) => (
            <div key={b.id} className="p-3 bg-gray-50/50 dark:bg-slate-850 border border-gray-150/30 dark:border-slate-800/40 rounded-xl flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs text-gray-900 dark:text-white">{b.id}</span>
                  <Badge tone={statusTone[b.status]} className="text-[7px] py-0.5 px-1 leading-none uppercase">{b.status}</Badge>
                </div>
                <p className="text-[10px] text-gray-550 dark:text-gray-400 mt-1 truncate">Cust: {b.customer}</p>
                <p className="text-[9px] text-gray-400 mt-0.5 truncate">Service: {b.service} • {b.date}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-black text-xs text-gray-900 dark:text-white">{b.amount}</p>
                <p className="text-[8px] text-gray-400 mt-0.5 truncate">Pro: {b.pro.split(' ')[0]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Tiles list */}
      <div className="grid grid-cols-2 gap-3 select-none">
        {[
          { label: 'Professionals', value: '50.2k', icon: Wrench },
          { label: 'All Services', value: '186', icon: Star },
          { label: 'Active Cities', value: '35', icon: Users },
          { label: 'Coupons Logs', value: '24', icon: CreditCard },
        ].map((t) => (
          <button
            key={t.label}
            onClick={() => toast(`Manage ${t.label} is a demo placeholder`, 'info')}
            className="card p-3 flex items-center justify-between hover:shadow-soft active-scale text-left"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center mb-1.5">
                <t.icon className="w-4 h-4 text-brand-600" />
              </div>
              <p className="text-sm font-extrabold text-gray-900 dark:text-white leading-none">{t.value}</p>
              <p className="text-[9px] text-gray-400 font-semibold mt-1 uppercase tracking-wider">{t.label}</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
}
