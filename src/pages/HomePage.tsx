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
  { icon: ShieldCheck, title: 'Verified Experts', desc: 'Background-checked professionals.', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
  { icon: Wallet, title: 'Ufront Price', desc: 'No hidden charges, ever.', color: 'text-brand-500 bg-brand-50 dark:bg-brand-950/40' },
  { icon: CalendarClock, title: 'Flexible Slots', desc: 'Book anytime between 8 AM and 8 PM.', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
  { icon: HeadphonesIcon, title: '24/7 Support', desc: 'Dedicated support team for help.', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },
];

const howSteps = [
  { icon: Search, title: 'Select Service', desc: 'Browse and choose what you need.' },
  { icon: CalendarCheck, title: 'Pick Slot', desc: 'Select date and time that works.' },
  { icon: UserCheck, title: 'Get Matched', desc: 'We assign the best rated pro.' },
  { icon: ShieldCheck, title: 'Relax & Enjoy', desc: 'OTP-verified tracking.' },
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

      {/* Popular Services Section (List of horizontal cards) */}
      <section className="px-4 py-6 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800/60">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">Trending Services</h2>
          <Link to="/services" className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-0.5">
            See all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="space-y-3">
          {popularServices.slice(0, 4).map((s, i) => (
            <ServiceCard key={s.id} service={s} index={i} />
          ))}
        </div>
      </section>

      {/* Featured Professionals (Horizontal scroll) */}
      <section className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">Top Rated Professionals</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
          {professionals.map((p, i) => (
            <div key={p.id} className="shrink-0 w-44 snap-center">
              <ProfessionalCard professional={p} index={i} />
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us (Compact 2x2 Grid) */}
      <section className="px-4 py-6 bg-white dark:bg-slate-900 border-y border-gray-100 dark:border-slate-800/60">
        <h2 className="text-sm font-extrabold text-gray-900 dark:text-white mb-4">Why HomeSeva</h2>
        <div className="grid grid-cols-2 gap-3.5">
          {whyChoose.map((item) => (
            <div key={item.title} className="p-3 bg-gray-50 dark:bg-slate-850 rounded-2xl flex flex-col gap-2 border border-gray-100 dark:border-slate-800/40">
              <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works (Horizontal steps scroll) */}
      <section className="px-4 py-6">
        <h2 className="text-sm font-extrabold text-gray-900 dark:text-white mb-4">How it works</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {howSteps.map((step, i) => (
            <div key={step.title} className="shrink-0 w-32 text-center bg-white dark:bg-slate-900 p-3 rounded-2xl border border-gray-100 dark:border-slate-800/50 shadow-soft">
              <div className="relative w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center mx-auto mb-2 shadow-soft">
                <step.icon className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-gray-900 text-[10px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-bold text-xs text-gray-900 dark:text-white">{step.title}</h3>
              <p className="text-[9px] text-gray-500 mt-0.5 leading-snug">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="px-4 py-6 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800/60">
        <h2 className="text-sm font-extrabold text-gray-900 dark:text-white mb-4">Loved by our Customers</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
          {testimonials.map((t, i) => (
            <div key={t.id} className="shrink-0 w-64 snap-center">
              <TestimonialCard testimonial={t} index={i} />
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Compact Accordion */}
      <section className="px-4 py-6">
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
                <p className="px-4 pb-4 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-50 dark:border-slate-800 pt-2">
                  {faq.a}
                </p>
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      {/* Compact App newsletter */}
      <section className="px-4 py-6 bg-slate-900 dark:bg-slate-900/60 text-white rounded-t-3xl mt-4">
        <h3 className="font-extrabold text-sm">Subscribe to Offers</h3>
        <p className="text-[10px] text-gray-400 mt-1">Get custom notifications on seasonal service discounts.</p>
        <form onSubmit={subscribe} className="mt-4 flex gap-2">
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
      </section>
    </div>
  );
}
