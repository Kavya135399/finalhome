import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Sparkles, CheckCircle2, CreditCard, Calendar, MapPin, Receipt, Phone, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function MembershipsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activePlan, setActivePlan] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('homeseva_active_membership');
      if (stored) {
        setActivePlan(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Header Banner Card */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden border border-slate-800">
          {/* Decorative background glow */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -top-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-6 shadow-inner">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Bhale Padharya Membership Care
            </h1>
            <p className="text-slate-300 text-sm sm:text-base font-medium mt-2 max-w-xl leading-relaxed">
              Enjoy active property care, priority scheduling, dedicated assistance, and transparent digital monitoring.
            </p>

            <button
              onClick={() => navigate('/memberships-info')}
              className="mt-6 inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-bold px-6 py-3 rounded-full text-sm shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
            >
              <span>{activePlan ? 'Upgrade / Change Plan' : 'Explore Membership Plans'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* My Subscriptions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              My Active Subscriptions
            </h2>
            {activePlan && (
              <button
                onClick={() => navigate('/memberships-info')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Change Plan
              </button>
            )}
          </div>

          {activePlan ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* Main Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-inner">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-lg sm:text-xl">{activePlan.planName}</h3>
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Active Subscription
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {activePlan.tenure || 'Monthly Billing'} • Paid via Razorpay
                    </p>
                  </div>
                </div>

                {activePlan.amountPaid && (
                  <div className="text-left sm:text-right">
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Total Paid</div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      ₹{Number(activePlan.amountPaid).toLocaleString('en-IN')}
                    </div>
                  </div>
                )}
              </div>

              {/* Grid of Key Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                
                {/* Subscription Tenure */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>Validity & Renewal</span>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {new Date(activePlan.subscribedAt || Date.now()).toLocaleDateString()} - {new Date(activePlan.expiryDate || Date.now() + 30 * 86400000).toLocaleDateString()}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Auto-renew status: Active
                  </div>
                </div>

                {/* Customer Details */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="text-slate-400 font-medium flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-500" />
                    <span>Subscriber Details</span>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {activePlan.customerName || user?.name || 'Valued Customer'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {activePlan.phone || 'Phone on record'}
                  </div>
                </div>

                {/* Property Location */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1 sm:col-span-2 md:col-span-1">
                  <div className="text-slate-400 font-medium flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span>Covered Property</span>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
                    {typeof activePlan.address === 'object' ? activePlan.address.fullAddress : activePlan.address || 'Registered Address'}
                  </div>
                  {activePlan.invoiceNumber && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Receipt className="w-3 h-3" />
                      Invoice: {activePlan.invoiceNumber}
                    </div>
                  )}
                </div>

              </div>

              {/* Payment Verification Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  <span>Razorpay Payment Reference ID: <strong className="text-slate-700 dark:text-slate-300 font-mono">{activePlan.transactionId || activePlan.bookingId || 'RP_MEM_OK'}</strong></span>
                </div>
                
                <button
                  onClick={() => navigate('/memberships-info')}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold transition"
                >
                  Manage Membership
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 sm:p-14 text-center shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 flex items-center justify-center mx-auto mb-4 text-amber-500">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                No active membership plan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                You are currently on the free tier. Subscribe to a Bhale Padharya care plan for regular inspections, maintenance & digital property tracking.
              </p>
              <button
                onClick={() => navigate('/memberships-info')}
                className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <span>Choose a Membership Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

