import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
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
              Upgrade to Premium
            </h1>
            <p className="text-slate-300 text-sm sm:text-base font-medium mt-2 max-w-xl leading-relaxed">
              Get priority bookings, dedicated support, and exclusive discounts.
            </p>

            <button
              onClick={() => navigate('/memberships-info')}
              className="mt-6 inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-bold px-6 py-3 rounded-full text-sm shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
            >
              <span>View Plans</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* My Subscriptions Section */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            My Subscriptions
          </h2>

          {activePlan ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{activePlan.planName}</h3>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Renews on: {new Date(activePlan.expiryDate || Date.now() + 30 * 86400000).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/memberships-info')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
              >
                Change Plan
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 sm:p-14 text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-slate-400 dark:text-slate-500 stroke-[1.5]" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                No active memberships
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                You are currently on the free plan.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
