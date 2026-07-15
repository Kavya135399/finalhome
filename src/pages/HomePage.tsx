import { useState } from 'react';
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
  Smartphone,
  Apple,
  Star,
} from 'lucide-react';
import { Hero } from '../components/Hero';
import { CategoryCard } from '../components/CategoryCard';
import { ServiceCard } from '../components/ServiceCard';
import { ProfessionalCard } from '../components/ProfessionalCard';
import { TestimonialCard } from '../components/TestimonialCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../context/ToastContext';
import { categories, services, professionals, testimonials, stats, faqs } from '../data/sampleData';

const whyChoose = [
  { icon: ShieldCheck, title: 'Verified Professionals', desc: 'Every professional is background-checked and skill-tested.', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
  { icon: Wallet, title: 'Transparent Pricing', desc: 'See the price upfront. No hidden charges, ever.', color: 'text-brand-500 bg-brand-50 dark:bg-brand-950/40' },
  { icon: CalendarClock, title: 'On-Time Service', desc: 'Your time matters. We guarantee punctual arrivals.', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
  { icon: HeadphonesIcon, title: '24/7 Support', desc: 'Need help? Our support team is always one tap away.', color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40' },
];

const howSteps = [
  { icon: Search, title: 'Search & Select', desc: 'Browse 20+ services and pick what you need.' },
  { icon: CalendarCheck, title: 'Pick a Slot', desc: 'Choose a date and time that works for you.' },
  { icon: UserCheck, title: 'Get Matched', desc: 'We assign the best-rated professional near you.' },
  { icon: ShieldCheck, title: 'Relax & Enjoy', desc: 'OTP-verified service with live tracking.' },
];

export function HomePage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const popularServices = services.filter((s) => s.popular);
  const featuredCategories = categories.slice(0, 8);

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast('Subscribed! Watch your inbox for offers.', 'success');
    setEmail('');
  };

  return (
    <>
      <Hero />

      {/* Categories */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-2">Explore</p>
              <h2 className="text-3xl lg:text-4xl font-extrabold font-display">Popular Categories</h2>
            </div>
            <Link to="/services" className="hidden sm:block">
              <Button variant="ghost" rightIcon={<ChevronDown className="w-4 h-4 -rotate-90" />}>View all</Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
            {featuredCategories.map((cat, i) => (
              <CategoryCard key={cat.id} category={cat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular services */}
      <section className="py-16 lg:py-20 bg-white dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-2">Trending</p>
              <h2 className="text-3xl lg:text-4xl font-extrabold font-display">Most Booked Services</h2>
            </div>
            <Link to="/services" className="hidden sm:block">
              <Button variant="ghost" rightIcon={<ChevronDown className="w-4 h-4 -rotate-90" />}>See all</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {popularServices.map((s, i) => (
              <ServiceCard key={s.id} service={s} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Why choose */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-2">Why HomeSeva</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold font-display">The trusted choice for home services</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">We obsess over quality, safety, and your convenience — so you never have to second-guess a booking.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChoose.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="card p-6 text-center hover:shadow-soft-lg transition"
              >
                <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-4`}>
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 lg:py-24 bg-white dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-2">How it works</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold font-display">Book in 4 simple steps</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {howSteps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="relative text-center"
              >
                <div className="relative w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto mb-4 shadow-glow">
                  <step.icon className="w-7 h-7" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 text-gray-900 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                </div>
                <h3 className="font-semibold text-lg mb-1.5">{step.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-10 lg:p-14 text-white relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl" />
            <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <p className="text-4xl lg:text-5xl font-extrabold font-display">{s.value}</p>
                  <p className="mt-2 text-brand-100 text-sm font-medium">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Professionals */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-2">Meet the experts</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold font-display">Featured Professionals</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {professionals.map((p, i) => (
              <ProfessionalCard key={p.id} professional={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-24 bg-white dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-2">Loved by customers</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold font-display">What our customers say</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t, i) => (
              <TestimonialCard key={t.id} testimonial={t} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* App download */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="card overflow-hidden grid lg:grid-cols-2 gap-0">
            <div className="p-10 lg:p-14 flex flex-col justify-center">
              <h2 className="text-3xl lg:text-4xl font-extrabold font-display">Get the HomeSeva app</h2>
              <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-md">Book services, track professionals live, and access exclusive app-only deals. Download today and get ₹200 off your first booking.</p>
              <div className="flex flex-wrap gap-3 mt-6">
                <a href="#" className="flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3 rounded-xl hover:opacity-90 transition">
                  <Apple className="w-6 h-6" />
                  <div className="text-left">
                    <p className="text-[10px] opacity-80">Download on the</p>
                    <p className="text-sm font-semibold leading-tight">App Store</p>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3 rounded-xl hover:opacity-90 transition">
                  <Smartphone className="w-6 h-6" />
                  <div className="text-left">
                    <p className="text-[10px] opacity-80">GET IT ON</p>
                    <p className="text-sm font-semibold leading-tight">Google Play</p>
                  </div>
                </a>
              </div>
            </div>
            <div className="relative bg-gradient-to-br from-brand-500 to-brand-700 p-10 flex items-center justify-center min-h-[280px]">
              <div className="absolute inset-0 bg-grid-light opacity-20" />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative glass-strong rounded-3xl p-6 w-56 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-brand-600 fill-brand-600" />
                </div>
                <p className="text-2xl font-extrabold">4.8 / 5</p>
                <p className="text-xs text-gray-500 mt-1">2.4M+ app ratings</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-2">FAQ</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold font-display">Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-gray-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 p-10 lg:p-14 text-center">
            <h2 className="text-3xl lg:text-4xl font-extrabold font-display text-white">Never miss a deal</h2>
            <p className="mt-3 text-gray-400 max-w-lg mx-auto">Subscribe to our newsletter for exclusive offers, new service launches, and home-care tips.</p>
            <form onSubmit={subscribe} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder-gray-400"
                required
              />
              <Button type="submit" size="md">Subscribe</Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
