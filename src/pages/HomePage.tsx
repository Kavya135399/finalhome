import { useState } from 'react';
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
} from 'lucide-react';
import { Hero } from '../components/Hero';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { faqs } from '../data/sampleData';

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
    title: 'Upfront Price',
    desc: 'No hidden charges, ever.',
    gradient: 'from-brand-500 to-indigo-500',
    shadowClass: 'shadow-brand-500/20 dark:shadow-brand-950/30',
    hoverBg: 'hover:border-brand-500/20 dark:hover:border-brand-800/40 hover:shadow-[0_12px_30px_rgba(37,99,235,0.08)] dark:hover:shadow-[0_12px_30px_rgba(37,99,235,0.2)]'
  },
  {
    icon: CalendarClock,
    title: 'Flexible Slots',
    desc: 'Book anytime between 8 AM and 8 PM.',
    gradient: 'from-amber-400 to-orange-500',
    shadowClass: 'shadow-amber-500/20 dark:shadow-amber-950/30',
    hoverBg: 'hover:border-amber-500/20 dark:hover:border-amber-800/40 hover:shadow-[0_12px_30px_rgba(245,158,11,0.08)] dark:hover:shadow-[0_12px_30px_rgba(245,158,11,0.2)]'
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 Support',
    desc: 'Dedicated support team for help.',
    gradient: 'from-rose-400 to-pink-500',
    shadowClass: 'shadow-rose-500/20 dark:shadow-rose-950/30',
    hoverBg: 'hover:border-rose-500/20 dark:hover:border-rose-800/40 hover:shadow-[0_12px_30px_rgba(244,63,94,0.08)] dark:hover:shadow-[0_12px_30px_rgba(244,63,94,0.2)]'
  }
];

const howSteps = [
  {
    icon: Search,
    title: 'Select Service',
    desc: 'Browse and choose the service you need.',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: CalendarCheck,
    title: 'Pick Date & Time',
    desc: 'Choose your preferred schedule.',
    gradient: 'from-purple-500 to-fuchsia-600',
  },
  {
    icon: UserCheck,
    title: 'Confirm Booking',
    desc: 'Review details and complete payment.',
    gradient: 'from-indigo-500 to-brand-600',
  },
  {
    icon: ShieldCheck,
    title: 'Enjoy Service',
    desc: 'Our professional arrives at your location.',
    gradient: 'from-emerald-500 to-teal-600',
  },
];

export function HomePage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

      {/* How It Works (Premium Vertical Timeline) */}
      <section className="w-full py-8 md:py-14 bg-white/50 dark:bg-slate-900/40 border-y border-gray-150/60 dark:border-slate-800/60 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10 md:mb-14">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 text-xs font-bold tracking-wide uppercase mb-2 border border-brand-200/50 dark:border-brand-800/50">
              Process Roadmap
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              How It Works
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              Get your home services completed effortlessly in 4 simple steps
            </p>
          </div>

          <div className="relative pl-10 sm:pl-14 md:pl-16">
            {/* Background vertical line */}
            <div className="absolute left-[19px] sm:left-[27px] md:left-[31px] top-6 bottom-8 w-1 bg-gray-200 dark:bg-slate-800 rounded-full z-0" />

            {/* Growing animated timeline gradient line */}
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute left-[19px] sm:left-[27px] md:left-[31px] top-6 bottom-8 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-emerald-500 origin-top rounded-full z-0"
            />

            <div className="space-y-8 sm:space-y-10 md:space-y-12">
              {howSteps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="relative flex items-start group"
                >
                  {/* Numbered Circular Icon Node on left timeline */}
                  <div className="absolute -left-[40px] sm:-left-[56px] md:-left-[64px] top-4 transform -translate-x-1/2 z-10">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${step.gradient} text-white font-extrabold text-sm sm:text-base flex items-center justify-center shadow-lg shadow-gray-200/80 dark:shadow-slate-950 border-4 border-white dark:border-slate-900 group-hover:scale-110 transition-transform duration-300`}>
                      {i + 1}
                    </div>
                  </div>

                  {/* Step Content Card on right */}
                  <div className="w-full bg-white dark:bg-slate-900 p-5 sm:p-6 md:p-7 rounded-2xl md:rounded-3xl border border-gray-150/80 dark:border-slate-800/80 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-brand-500/30 dark:hover:border-brand-500/40 relative overflow-hidden group-hover:ring-1 group-hover:ring-brand-500/20">
                    {/* Step badge in card header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-full border border-brand-200/40 dark:border-brand-800/40">
                        Step 0{i + 1}
                      </span>
                    </div>

                    <div className="flex items-start gap-4 sm:gap-5">
                      {/* Gradient Step Icon */}
                      <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br ${step.gradient} text-white flex items-center justify-center shadow-md shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                        <step.icon className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-white drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.15)]" />
                      </div>

                      {/* Content details */}
                      <div className="flex-1">
                        <h3 className="font-extrabold text-sm sm:text-base md:text-lg text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-200">
                          {step.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
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
