import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Package, Phone, Copy, Download, RefreshCw } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

const STAGES = [
  { key: 'order_placed', label: 'Order Placed', desc: 'Your order has been received', icon: '📦' },
  { key: 'payment_verification', label: 'Payment Verification', desc: 'Verifying your payment', icon: '🔍' },
  { key: 'confirmed', label: 'Order Confirmed', desc: 'Payment verified, order confirmed', icon: '✅' },
  { key: 'worker_assigned', label: 'Worker Assigned', desc: 'A delivery partner has been assigned', icon: '👷' },
  { key: 'on_the_way', label: 'On the Way', desc: 'Your order is out for delivery', icon: '🚚' },
  { key: 'delivered', label: 'Delivered', desc: 'Order delivered successfully', icon: '🎉' },
  { key: 'feedback', label: 'Feedback', desc: 'Share your experience', icon: '⭐' },
];

function stageIndex(key: string) {
  return STAGES.findIndex(s => s.key === key);
}

export function StoreOrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    fetchOrder();
    const interval = setInterval(fetchOrder, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const data = await apiClient.getStoreOrder(orderId!);
      setOrder(data);
      if (data.tracking_stage === 'delivered') setFeedbackSent(!!data.feedback_sent);
    } catch {
      setError('Order not found or you do not have access.');
    } finally { setLoading(false); }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const updated = await apiClient.cancelStoreOrder(order.id);
      setOrder(updated);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const copyOrderId = () => { navigator.clipboard.writeText(orderId || ''); };

  const handlePrint = () => window.print();

  const PAYMENT_STATUS_COLOR: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    verification_pending: 'bg-blue-100 text-blue-700',
    verified: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    reupload_requested: 'bg-orange-100 text-orange-700',
    cod_pending: 'bg-amber-100 text-amber-700',
  };
  const ORDER_STATUS_COLOR: Record<string, string> = {
    placed: 'bg-gray-100 text-gray-700',
    confirmed: 'bg-green-100 text-green-700',
    processing: 'bg-blue-100 text-blue-700',
    payment_failed: 'bg-red-100 text-red-700',
    cancelled: 'bg-red-100 text-red-700',
    delivered: 'bg-green-100 text-green-700',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-500">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center max-w-xs">
          <p className="text-4xl mb-3">📦</p>
          <p className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-1">{error || 'Order not found'}</p>
          <p className="text-xs text-gray-400 mb-4">This order may not exist or you may not have access.</p>
          <Link to="/store/orders" className="text-xs font-bold text-green-600 underline">View My Orders</Link>
        </div>
      </div>
    );
  }

  let items: any[] = [];
  let address: any = {};
  try { items = JSON.parse(order.items_json || '[]'); } catch {}
  try { address = JSON.parse(order.address_json || '{}'); } catch {}

  const currentStageIdx = stageIndex(order.tracking_stage);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-10">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition">
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="flex-1">
            <h1 className="text-sm font-black text-gray-900 dark:text-white">Track Order</h1>
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] text-gray-500 font-mono">{order.id}</p>
              <button onClick={copyOrderId} className="text-green-600"><Copy className="w-2.5 h-2.5" /></button>
            </div>
          </div>
          <button onClick={fetchOrder} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition text-gray-500">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={handlePrint} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition text-gray-500">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Payment rejected / reupload notice */}
        {(order.payment_status === 'rejected' || order.payment_status === 'reupload_requested') && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl px-4 py-3">
            <p className="font-bold text-xs text-red-700 dark:text-red-400 mb-0.5">
              {order.payment_status === 'rejected' ? '❌ Payment Rejected' : '⚠️ Re-upload Required'}
            </p>
            <p className="text-[10px] text-red-600 dark:text-red-400">{order.rejection_reason}</p>
            {order.payment_status === 'reupload_requested' && (
              <Link to={`/store/pay/${order.id}`} className="inline-block mt-2 text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition">
                Re-upload Screenshot →
              </Link>
            )}
          </motion.div>
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4">
            <p className="text-[8px] uppercase font-black tracking-wider text-gray-400 mb-2">ORDER STATUS</p>
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full capitalize ${ORDER_STATUS_COLOR[order.order_status] || 'bg-gray-100 text-gray-700'}`}>
              {order.order_status?.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4">
            <p className="text-[8px] uppercase font-black tracking-wider text-gray-400 mb-2">PAYMENT</p>
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full capitalize ${PAYMENT_STATUS_COLOR[order.payment_status] || 'bg-gray-100 text-gray-700'}`}>
              {order.payment_status?.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Estimated Delivery */}
        {order.estimated_delivery && (
          <div className="bg-green-600 rounded-2xl px-5 py-4 text-white flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider opacity-70">ESTIMATED DELIVERY</p>
              <p className="text-lg font-black mt-0.5">{order.estimated_delivery}</p>
            </div>
            <span className="text-3xl">📅</span>
          </div>
        )}

        {/* Worker info */}
        {order.worker_name && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 px-4 py-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-xl">👷</div>
            <div className="flex-1">
              <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">DELIVERY PARTNER</p>
              <p className="font-bold text-sm text-gray-900 dark:text-white">{order.worker_name}</p>
            </div>
            {order.worker_phone && (
              <a href={`tel:${order.worker_phone}`} className="w-9 h-9 flex items-center justify-center bg-green-600 rounded-xl text-white hover:bg-green-700 transition">
                <Phone className="w-4 h-4" />
              </a>
            )}
          </div>
        )}

        {/* ─── Tracking Timeline ─── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 px-5 py-5">
          <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-5">ORDER TIMELINE</p>
          <div className="space-y-0">
            {STAGES.map((stage, idx) => {
              const completed = idx <= currentStageIdx;
              const current = idx === currentStageIdx;
              const future = idx > currentStageIdx;
              return (
                <div key={stage.key} className="relative flex gap-4">
                  {/* Connector line */}
                  {idx < STAGES.length - 1 && (
                    <div className={`absolute left-[19px] top-10 w-0.5 h-8 ${completed ? 'bg-green-500' : 'bg-gray-150 dark:bg-slate-700'}`} />
                  )}
                  {/* Icon */}
                  <div className="relative z-10 shrink-0">
                    <motion.div
                      animate={current ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                        completed ? 'border-green-500 bg-green-50 dark:bg-green-950/30' :
                        future ? 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800' : ''
                      }`}
                    >
                      {current && <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="absolute inset-0 rounded-full bg-green-400/20" />}
                      <span className={future ? 'grayscale opacity-40' : ''}>{stage.icon}</span>
                    </motion.div>
                  </div>
                  {/* Content */}
                  <div className={`pb-8 flex-1 ${future ? 'opacity-40' : ''}`}>
                    <p className={`text-xs font-black leading-none mt-2.5 ${completed ? 'text-green-700 dark:text-green-400' : 'text-gray-500'}`}>{stage.label}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">{stage.desc}</p>
                    {current && <span className="inline-block mt-1 text-[8px] font-black bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">IN PROGRESS</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 px-4 py-4">
          <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-3">ORDER SUMMARY</p>
          <div className="space-y-2.5">
            {items.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="w-10 h-10 rounded-xl object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=40'; }} />
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{item.name}</p>
                  <p className="text-[9px] text-gray-400">Qty: {item.qty}</p>
                </div>
                <span className="text-xs font-black text-gray-800 dark:text-white">₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 dark:border-slate-800 mt-3 pt-3 flex items-center justify-between">
            <span className="text-sm font-black text-gray-900 dark:text-white">Total Paid</span>
            <span className="text-sm font-black text-green-600">₹{order.total}</span>
          </div>
        </div>

        {/* Delivery Address */}
        {address?.address && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 px-4 py-4">
            <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-2">DELIVERY ADDRESS</p>
            <p className="text-xs font-bold text-gray-900 dark:text-white">{address.label || 'Home'}</p>
            <p className="text-[10px] text-gray-500">{address.address}{address.landmark ? `, ${address.landmark}` : ''}</p>
            <p className="text-[10px] text-gray-400">{address.city}, {address.state} – {address.pincode}</p>
          </div>
        )}

        {/* Feedback */}
        {order.tracking_stage === 'delivered' && !feedbackSent && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 px-4 py-4">
            <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-3">RATE YOUR EXPERIENCE</p>
            <div className="flex gap-1.5 mb-3">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setRating(star)} className="text-2xl transition hover:scale-110">
                  {star <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3}
              placeholder="Share your feedback..." className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-150 dark:border-slate-700 text-xs text-gray-900 dark:text-white outline-none resize-none focus:border-green-400 transition" />
            <button onClick={() => setFeedbackSent(true)} disabled={rating === 0}
              className="mt-2 w-full h-10 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50">
              Submit Feedback
            </button>
          </div>
        )}
        {feedbackSent && (
          <div className="bg-green-50 dark:bg-green-950/20 rounded-2xl px-4 py-3 text-center">
            <p className="text-xl mb-1">🙏</p>
            <p className="text-xs font-bold text-green-700 dark:text-green-400">Thank you for your feedback!</p>
          </div>
        )}

        {(order.order_status === 'placed' || order.order_status === 'confirmed') && (
          <button onClick={handleCancelOrder} disabled={cancelling}
            className="w-full border-2 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 font-bold text-xs py-3 rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/20 transition disabled:opacity-50">
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}

        <div className="flex gap-3">
          <Link to="/store" className="flex-1 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold text-xs py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 transition text-center">
            <Package className="w-3.5 h-3.5 inline mr-1" />Continue Shopping
          </Link>
          <Link to="/store/orders" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-3 rounded-2xl transition text-center">
            All Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
