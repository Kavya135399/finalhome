import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MembershipCheckoutModal, type PlanDetails } from '../components/memberships/MembershipCheckoutModal';

interface PricingPlan {
  id: string;
  name: string;
  desc: string;
  price: string;
  numericPrice?: number;
  badge?: string;
  popular?: boolean;
  features: string[];
  buttonText: string;
  buttonVariant: 'primary' | 'secondary' | 'outline';
}

const plans: PricingPlan[] = [
  {
    id: 'essential',
    name: 'Essential Care',
    desc: 'Fundamental property monitoring for unoccupied homes.',
    price: '₹4,999',
    numericPrice: 4999,
    buttonText: 'Choose Essential',
    buttonVariant: 'secondary',
    features: [
      'Regular Property Inspections',
      'Digital Property Monitoring',
      'Maintenance Coordination',
      'Utility & Bill Management',
      'Monthly Health Report',
    ],
  },
  {
    id: 'premium',
    name: 'Premium Care',
    desc: 'Comprehensive home management and active maintenance.',
    price: '₹12,999',
    numericPrice: 12999,
    badge: 'MOST POPULAR',
    popular: true,
    buttonText: 'Choose Premium',
    buttonVariant: 'primary',
    features: [
      'Bi-Weekly Physical Inspections',
      'Scheduled Cleaning Visits',
      'Priority Maintenance Coordination',
      'Emergency Support',
      'Festival Preparation Setup',
      'Live Video Transparency',
    ],
  },
  {
    id: 'elite',
    name: 'Elite Concierge',
    desc: 'Bespoke property care with personal concierge services.',
    price: 'Custom',
    buttonText: 'Contact Us',
    buttonVariant: 'secondary',
    features: [
      'Weekly Physical Inspections',
      'Dedicated Property Manager',
      'On-Demand Cleaning Visits',
      '24/7 VIP Emergency Support',
      'Custom Errand Concierge',
      'Airport Transfers & Logistics',
    ],
  },
];

export function MembershipsInfoPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<PlanDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectPlan = (plan: PricingPlan) => {
    if (plan.id === 'elite') {
      navigate('/contact');
      return;
    }

    if (!user) {
      toast('Please sign in to select a membership plan', 'info');
      navigate('/login');
      return;
    }

    setSelectedPlanForModal(plan);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Back Navigation Link */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
            MEMBERSHIP PLANS
          </p>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Simple pricing. <span className="font-serif italic font-normal text-slate-700 dark:text-slate-300">Exceptional service.</span>
          </h1>

          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto pt-2">
            Select the level of care your home deserves. All plans include access to our proprietary digital monitoring dashboard.
          </p>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                plan.popular
                  ? 'bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-500 shadow-2xl relative scale-[1.02]'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-md whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              <div>
                {/* Header */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[36px] leading-relaxed">
                    {plan.desc}
                  </p>
                </div>

                {/* Price */}
                <div className="my-6 flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {plan.price}
                  </span>
                  {plan.numericPrice && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                      /month
                    </span>
                  )}
                </div>

                {/* Checklist */}
                <ul className="space-y-3 pt-2">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-normal">
                      <span className="mt-0.5 text-slate-400 dark:text-slate-500 shrink-0">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-8">
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-98'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white active:scale-98'
                  }`}
                >
                  <span>{plan.buttonText}</span>
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Bottom Footer Note */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-6 pb-12">
          Need something specific?{' '}
          <Link to="/services" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Users can also book one-time services separately.
          </Link>
        </div>

      </div>

      {/* Razorpay Membership Checkout Modal */}
      <MembershipCheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={selectedPlanForModal}
        onSuccess={() => navigate('/memberships')}
      />
    </div>
  );
}
