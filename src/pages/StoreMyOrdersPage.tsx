import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, Package, RefreshCw, ShoppingBag } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'placed', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'delivered', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const PAYMENT_BADGE: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pending Verification', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  verification_pending: { label: 'Verifying', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  paid: { label: 'Paid ✓', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  payment_failed: { label: 'Payment Failed', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  reupload_requested: { label: 'Re-upload', cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  cod_pending: { label: 'COD', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

const ORDER_BADGE: Record<string, { label: string; cls: string }> = {
  waiting_for_approval: { label: 'Waiting for Payment Approval', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  placed: { label: 'Placed', cls: 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-400' },
  confirmed: { label: 'Confirmed', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  processing: { label: 'Processing', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  delivered: { label: 'Delivered ✓', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  payment_failed: { label: 'Payment Failed', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return iso; }
}

export function StoreMyOrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await apiClient.getMyStoreOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      // Demo fallback
      setOrders([]);
    } finally { setLoading(false); setRefreshing(false); }
  };

  const filtered = orders.filter(o => {
    if (filter !== 'all' && o.order_status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      try {
        const items = JSON.parse(o.items_json || '[]');
        const hasItem = items.some((i: any) => i.name?.toLowerCase().includes(s));
        if (!o.id?.toLowerCase().includes(s) && !hasItem) return false;
      } catch { if (!o.id?.toLowerCase().includes(s)) return false; }
    }
    return true;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center max-w-xs">
          <p className="text-4xl mb-3">🔐</p>
          <h2 className="font-black text-sm text-gray-900 dark:text-white mb-1">Login Required</h2>
          <p className="text-xs text-gray-400 mb-4">Please login to view your orders</p>
          <Link to="/login" className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-10">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div>
                <h1 className="text-sm font-black text-gray-900 dark:text-white">My Store Orders</h1>
                <p className="text-[10px] text-gray-400">{orders.length} total orders</p>
              </div>
            </div>
            <button onClick={() => fetchOrders(true)} disabled={refreshing}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition text-gray-500 disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input type="search" placeholder="Search by order ID or product..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-150 dark:border-slate-700 text-xs text-gray-800 dark:text-white placeholder-gray-400 outline-none focus:border-green-400 transition" />
          </div>
          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {STATUS_FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-extrabold border transition whitespace-nowrap ${
                  filter === f.key ? 'bg-green-600 text-white border-green-600' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-gray-150 dark:border-slate-700 hover:border-green-300'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-1">No orders found</p>
            <p className="text-xs text-gray-400 mb-4">{filter !== 'all' ? 'Try a different filter' : 'Start shopping from the store'}</p>
            <Link to="/store" className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition">
              Shop Now
            </Link>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((order, idx) => {
              let items: any[] = [];
              try { items = JSON.parse(order.items_json || '[]'); } catch {}
              const firstItem = items[0];
              const orderBadge = ORDER_BADGE[order.order_status] || { label: order.order_status, cls: 'bg-gray-100 text-gray-700' };
              const payBadge = PAYMENT_BADGE[order.payment_status] || { label: order.payment_status, cls: 'bg-gray-100 text-gray-700' };

              return (
                <motion.div key={order.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Order Header */}
                  <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-50 dark:border-slate-800/50">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">ORDER ID</p>
                      <p className="text-xs font-black text-gray-900 dark:text-white font-mono">{order.id}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${orderBadge.cls}`}>{orderBadge.label}</span>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${payBadge.cls}`}>{payBadge.label}</span>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="px-4 py-3 flex items-center gap-3">
                    {firstItem && (
                      <img src={firstItem.image} alt={firstItem.name} className="w-14 h-14 rounded-xl object-cover shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=60'; }} />
                    )}
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                        {items.map(i => i.name).slice(0, 2).join(', ')}{items.length > 2 ? ` +${items.length - 2} more` : ''}
                      </p>
                      <p className="text-[9px] text-gray-400 mt-0.5">{items.reduce((s: number, i: any) => s + i.qty, 0)} items · {fmtDate(order.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-900 dark:text-white">₹{order.total}</p>
                      <p className="text-[8px] text-gray-400 capitalize">{order.payment_method?.replace(/_/g, ' ')}</p>
                    </div>
                  </div>

                  {/* Rejection notice */}
                  {(order.payment_status === 'payment_failed' || order.payment_status === 'rejected') && order.rejection_reason && (
                    <div className="mx-4 mb-2 bg-red-50 dark:bg-red-950/20 rounded-xl px-3 py-2">
                      <p className="text-[9px] font-bold text-red-700 dark:text-red-300">Payment Failed</p>
                      <p className="text-[9px] text-red-600 dark:text-red-400">{order.rejection_reason}</p>
                    </div>
                  )}

                  {/* Invoice / Additional Info */}
                  <div className="mx-4 mb-2 flex items-center justify-between text-[10px] text-gray-500">
                    <span>Invoice: {order.payment_status === 'paid' ? <button className="text-blue-600 font-bold hover:underline">Download PDF</button> : 'Not Available'}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 px-4 pb-4">
                    <Link to={`/store/order/${order.id}`}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-black py-2.5 rounded-xl text-center transition active:scale-95">
                      Track Order
                    </Link>
                    <Link to="/store" className="flex-1 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 text-[10px] font-bold py-2.5 rounded-xl text-center hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                      <Package className="w-3 h-3 inline mr-1" />Reorder
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
