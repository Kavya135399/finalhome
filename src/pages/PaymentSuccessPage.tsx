import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, ArrowRight, ShieldCheck, Calendar, Clock, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bookingId = searchParams.get('bookingId') || 'HS-987654';
  const invoiceNumber = searchParams.get('invoiceNumber') || 'INV-2026-10023';
  const paymentId = searchParams.get('paymentId') || 'pay_demo_verified';
  const orderId = searchParams.get('orderId') || 'order_demo_razorpay';
  const productName = searchParams.get('product') || 'Home Cleaning & Maintenance';

  const handleDownloadInvoice = () => {
    window.open(`/api/bookings/${bookingId}/invoice`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        {/* Animated Checkmark Icon */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 12 }}
            className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20"
          >
            <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
          </motion.div>
        </div>

        {/* Heading & Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Razorpay Verified Payment
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Payment Successful!</h1>
          <p className="text-slate-400 text-sm">
            Your booking has been cryptographically verified and confirmed in our system.
          </p>
        </div>

        {/* Details Card */}
        <div className="bg-slate-950/60 rounded-2xl border border-slate-800/80 p-5 space-y-3 mb-8 text-sm">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
            <span className="text-slate-400">Booking ID</span>
            <span className="font-mono font-semibold text-indigo-400">{bookingId}</span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
            <span className="text-slate-400">Invoice Number</span>
            <span className="font-mono font-medium text-slate-200">{invoiceNumber}</span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
            <span className="text-slate-400">Service / Product</span>
            <span className="font-medium text-white text-right max-w-[220px] truncate">{productName}</span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
            <span className="text-slate-400">Payment Method</span>
            <span className="font-medium text-emerald-400">Razorpay UPI (Verified)</span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
            <span className="text-slate-400">Razorpay Payment ID</span>
            <span className="font-mono text-xs text-slate-300">{paymentId}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Razorpay Order ID</span>
            <span className="font-mono text-xs text-slate-300">{orderId}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleDownloadInvoice}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" /> Download Official PDF Invoice
          </Button>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="w-full border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-200 rounded-xl py-2.5 flex items-center justify-center gap-2"
            >
              View My Orders
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-200 rounded-xl py-2.5 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" /> Continue Shopping
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
