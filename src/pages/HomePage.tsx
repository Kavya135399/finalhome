import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Wallet,
  CalendarClock,
  HeadphonesIcon,
  Search,
  CalendarCheck,
  UserCheck,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Hero } from '../components/Hero';
import { ServiceCard } from '../components/ServiceCard';
import { ProfessionalCard } from '../components/ProfessionalCard';
import { TestimonialCard } from '../components/TestimonialCard';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { services, professionals, testimonials, faqs } from '../data/sampleData';
import { apiClient } from '../services/apiClient';
import type { Service } from '../types';

const whyChoose = [
  {
    icon: ShieldCheck,
    title: 'Verified Experts',
    desc: 'Background-checked professionals.',
    gradient: 'from-emerald-400 to-teal-500',
    shadowClass: 'shadow-emerald-500/20 dark:shadow-emerald-950/30',
    hoverBg: 'hover:border-emerald-500/20 dark:hover:border-emerald-800/40 hover:shadow-[0_12px_30px_rgba(16,185,129,0.08)] dark:hover:shadow-[0_12px_30px_rgba(16,185,129,0.2)]'
  },
  {
    icon: Wallet,
    title: 'Upfront Pricing',
    desc: 'No hidden charges, ever.',
    gradient: 'from-brand-500 to-indigo-500',
    shadowClass: 'shadow-brand-500/20 dark:shadow-brand-950/30',
    hoverBg: 'hover:border-brand-500/20 dark:hover:border-brand-800/40 hover:shadow-[0_12px_30px_rgba(37,99,235,0.08)] dark:hover:shadow-[0_12px_30px_rgba(37,99,235,0.2)]'
  },
  {
    icon: CalendarClock,
    title: 'On-Time Service',
    desc: 'Guaranteed punctual arrivals.',
    gradient: 'from-amber-400 to-orange-500',
    shadowClass: 'shadow-amber-500/20 dark:shadow-amber-950/30',
    hoverBg: 'hover:border-amber-500/20 dark:hover:border-amber-800/40 hover:shadow-[0_12px_30px_rgba(245,158,11,0.08)] dark:hover:shadow-[0_12px_30px_rgba(245,158,11,0.2)]'
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 Support',
    desc: 'Support is always one tap away.',
    gradient: 'from-rose-400 to-pink-500',
    shadowClass: 'shadow-rose-500/20 dark:shadow-rose-950/30',
    hoverBg: 'hover:border-rose-500/20 dark:hover:border-rose-800/40 hover:shadow-[0_12px_30px_rgba(244,63,94,0.08)] dark:hover:shadow-[0_12px_30px_rgba(244,63,94,0.2)]'
  },

  { icon: ShieldCheck, title: 'Verified Experts', desc: 'Background-checked professionals.', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
  { icon: Wallet, title: 'Ufront Price', desc: 'No hidden charges, ever.', color: 'text-brand-500 bg-brand-50 dark:bg-brand-950/40' },
  { icon: CalendarClock, title: 'Flexible Slots', desc: 'Book anytime between 8 AM and 8 PM.', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
  { icon: HeadphonesIcon, title: '24/7 Support', desc: 'Dedicated support team for help.', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },

];

const howSteps = [
  {
    icon: Search,
    title: 'Select Service',
    desc: 'Browse and choose what you need.',
    gradient: 'from-blue-500 to-indigo-600',
    shadowClass: 'shadow-blue-500/20 dark:shadow-blue-950/30',
    hoverBg: 'hover:border-blue-500/20 dark:hover:border-blue-800/40 hover:shadow-[0_12px_30px_rgba(37,99,235,0.08)] dark:hover:shadow-[0_12px_30px_rgba(37,99,235,0.2)]'
  },
  {
    icon: CalendarCheck,
    title: 'Pick Slot',
    desc: 'Select date and time that works.',
    gradient: 'from-purple-500 to-fuchsia-600',
    shadowClass: 'shadow-purple-500/20 dark:shadow-purple-950/30',
    hoverBg: 'hover:border-purple-500/20 dark:hover:border-purple-800/40 hover:shadow-[0_12px_30px_rgba(168,85,247,0.08)] dark:hover:shadow-[0_12px_30px_rgba(168,85,247,0.2)]'
  },
  {
    icon: UserCheck,
    title: 'Get Matched',
    desc: 'We assign the best rated pro.',
    gradient: 'from-indigo-500 to-brand-650',
    shadowClass: 'shadow-indigo-500/20 dark:shadow-indigo-950/30',
    hoverBg: 'hover:border-indigo-500/20 dark:hover:border-indigo-800/40 hover:shadow-[0_12px_30px_rgba(99,102,241,0.08)] dark:hover:shadow-[0_12px_30px_rgba(99,102,241,0.2)]'
  },
  {
    icon: ShieldCheck,
    title: 'Relax & Enjoy',
    desc: 'OTP-verified tracking.',
    gradient: 'from-emerald-500 to-teal-600',
    shadowClass: 'shadow-emerald-500/20 dark:shadow-emerald-950/30',
    hoverBg: 'hover:border-emerald-500/20 dark:hover:border-emerald-800/40 hover:shadow-[0_12px_30px_rgba(16,185,129,0.08)] dark:hover:shadow-[0_12px_30px_rgba(16,185,129,0.2)]'
  },
];

export function HomePage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [servicesList, setServicesList] = useState<Service[]>([]);

  useEffect(() => {
    apiClient.getServices()
      .then((data) => setServicesList(data))
      .catch(() => setServicesList(services));
  }, []);

  const popularServices = servicesList.filter((s) => s.popular);

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast('Subscribed successfully!', 'success');
    setEmail('');
  };

  return (
    <div className="flex flex-col flex-1 bg-gray-50 dark:bg-slate-950">
      {/* Compact mobile landing header & search */}
      <Hero />

      {/* Popular Services Section (List of horizontal cards, grid on desktop) */}
      <section className="bg-white dark:bg-slate-900 border-t border-gray-150 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">Trending Services</h2>
            <Link to="/services" className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-0.5">
              See all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularServices.slice(0, 6).map((s, i) => (
              <ServiceCard key={s.id} service={s} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Professionals (Horizontal scroll on mobile, grid on desktop) */}
      <section className="w-full">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">Top Rated Professionals</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:overflow-x-visible md:pb-0 md:gap-6">
            {professionals.map((p, i) => (
              <div key={p.id} className="shrink-0 w-64 md:w-auto snap-center">
                <ProfessionalCard professional={p} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us (Compact 2x2 Grid, 4 columns on desktop with 3D animation) */}
      <section className="bg-white dark:bg-slate-900 border-y border-gray-150 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h2 className="text-sm font-extrabold text-gray-900 dark:text-white mb-4">Why HomeSeva</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {whyChoose.map((item) => (
              <div
                key={item.title}
                className={`group p-5 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800/60 rounded-3xl flex flex-col gap-3.5 transition-all duration-300 hover:-translate-y-1.5 shadow-soft hover:shadow-lg dark:hover:shadow-none ${item.hoverBg}`}
              >
                {/* 3D sphere style icon box */}
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-md ${item.shadowClass} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                  <item.icon className="w-5.5 h-5.5 text-white drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.15)]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-200">{item.title}</h3>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works (Horizontal steps scroll, 4 columns grid on desktop with 3D guide lines) */}
      <section className="w-full">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h2 className="text-sm font-extrabold text-gray-900 dark:text-white mb-4">How it works</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar md:grid md:grid-cols-4 md:gap-6 md:overflow-x-visible">
            {howSteps.map((step, i) => (
              <div
                key={step.title}
                className={`group relative shrink-0 w-64 md:w-auto bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-150 dark:border-slate-800/60 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg dark:hover:shadow-none ${step.hoverBg}`}
              >
                {/* 3D Connector Line for desktop (drawn between cards) */}
                {i < howSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(100%-8px)] w-[calc(100%-48px)] h-0.5 border-t-2 border-dashed border-gray-200 dark:border-slate-800 z-0 pointer-events-none" />
                )}

                {/* Floating Step Number */}
                <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-gray-900 text-xs font-black flex items-center justify-center shadow-md dark:shadow-orange-950/50 select-none z-10">
                  {i + 1}
                </div>

                {/* 3D sphere styled step icon box */}
                <div className={`relative w-11 h-11 rounded-2xl bg-gradient-to-br ${step.gradient} text-white flex items-center justify-center shadow-md ${step.shadowClass} mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 z-10`}>
                  <step.icon className="w-5.5 h-5.5 text-white drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.15)]" />
                </div>

                <h3 className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white mt-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-200">{step.title}</h3>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel (Grid on desktop) */}
      <section className="bg-white dark:bg-slate-900 border-t border-gray-150 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h2 className="text-sm font-extrabold text-gray-900 dark:text-white mb-4">Loved by our Customers</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory md:grid md:grid-cols-3 xl:grid-cols-4 md:gap-6 md:overflow-x-visible">
            {testimonials.map((t, i) => (
              <div key={t.id} className="shrink-0 w-64 md:w-auto snap-center">
                <TestimonialCard testimonial={t} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Compact Accordion (Centered) */}
      <section className="w-full">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-sm font-extrabold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2.5">
              {faqs.slice(0, 4).map((faq, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-soft">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-3 p-4 text-left"
                  >
                    <span className="font-bold text-xs text-gray-800 dark:text-gray-200 leading-snug">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-55 dark:border-slate-800 pt-2">
                      {faq.a}
                    </p>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Compact App newsletter */}
      <section className="bg-slate-900 dark:bg-slate-900/60 text-white rounded-t-3xl mt-4">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="max-w-md mx-auto text-center md:text-left md:flex md:items-center md:justify-between md:max-w-none md:gap-6">
            <div>
              <h3 className="font-extrabold text-sm">Subscribe to Offers</h3>
              <p className="text-[10px] text-gray-400 mt-1">Get custom notifications on seasonal service discounts.</p>
            </div>
            <form onSubmit={subscribe} className="mt-4 md:mt-0 flex gap-2 flex-1 max-w-sm">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-10 px-3 rounded-xl bg-white/10 text-xs text-white placeholder-gray-400 outline-none border border-white/15 focus:border-brand-500"
                required
              />
              <Button type="submit" size="sm" className="h-10">Join</Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
