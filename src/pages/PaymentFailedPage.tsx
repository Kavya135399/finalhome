import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, RefreshCw, HelpCircle, Home, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function PaymentFailedPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const errorMessage = searchParams.get('error') || 'Payment verification could not be completed.';
  const serviceSlug = searchParams.get('slug') || '';

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-lg bg-slate-900/80 backdrop-blur-xl border border-rose-900/30 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        {/* Animated Error Icon */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 12 }}
            className="w-20 h-20 rounded-full bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/20"
          >
            <XCircle className="w-12 h-12 stroke-[2.5]" />
          </motion.div>
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <AlertTriangle className="w-3.5 h-3.5" /> Transaction Unsuccessful
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Payment Failed</h1>
          <p className="text-slate-400 text-sm">
            Your booking was NOT created because payment verification could not be completed.
          </p>
        </div>

        {/* Error Details Box */}
        <div className="bg-rose-950/20 border border-rose-800/40 rounded-2xl p-4 mb-8 text-sm text-rose-200">
          <p className="font-semibold mb-1 text-rose-300">Failure Reason:</p>
          <p className="text-xs text-rose-200/80 font-mono leading-relaxed">{errorMessage}</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => (serviceSlug ? navigate(`/book/${serviceSlug}`) : navigate('/services'))}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Retry Payment Now
          </Button>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => navigate('/contact')}
              className="w-full border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-200 rounded-xl py-2.5 flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-4 h-4" /> Contact Support
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-200 rounded-xl py-2.5 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" /> Go Home
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
