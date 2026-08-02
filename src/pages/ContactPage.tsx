import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Sparkles, ArrowUpRight, User, Tag, ShieldCheck } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';

const contactInfo = [
  {
    icon: Mail,
    label: 'Direct Email Support',
    value: 'support@homeseva.com',
    sub: 'For general & billing queries',
    href: 'mailto:support@homeseva.com',
    color: 'from-blue-500/15 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/50',
  },
  {
    icon: Phone,
    label: 'Toll-Free Helpline',
    value: '+91 1800-200-3000',
    sub: 'Available across India',
    href: 'tel:18002003000',
    color: 'from-emerald-500/15 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/50',
  },
  {
    icon: MapPin,
    label: 'Corporate Headquarters',
    value: 'BKC, Bandra East, Mumbai',
    sub: 'Maharashtra 400051, India',
    color: 'from-amber-500/15 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/50',
  },
  {
    icon: Clock,
    label: 'Operating Hours',
    value: 'Mon – Sun, 8 AM – 10 PM',
    sub: 'IST (Open on holidays)',
    color: 'from-purple-500/15 to-pink-500/10 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/50',
  },
];

export function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Please enter your full name';
    if (!form.email.trim()) e.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please provide a valid email address';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phone)) e.phone = 'Phone number must be exactly 10 digits';
    if (!form.message.trim()) e.message = 'Please provide details about your query';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast('Support ticket submitted successfully! We will get back to you shortly.', 'success');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 850);
  };

  return (
    <div className="flex flex-col flex-1 bg-gray-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 select-none">
      <div className="max-w-4xl mx-auto w-full">
        {/* Page Header */}
        <section className="py-6 sm:py-10 text-center relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/60 dark:border-brand-800/50 text-brand-700 dark:text-brand-300 text-[11px] font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 animate-pulse" />
            <span>Customer Support & Inquiries</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-gray-900 dark:text-white leading-tight">
            Get in Touch
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto font-medium leading-relaxed">
            We typically respond to customer support tickets and inquiries in under <span className="text-brand-600 dark:text-brand-400 font-bold">2 hours</span>.
          </p>
        </section>

        {/* Stacked info items */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
          {contactInfo.map((c) => (
            <div
              key={c.label}
              className="card group relative p-4 sm:p-5 bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800/80 rounded-2xl flex flex-col justify-between min-h-[115px] sm:min-h-[135px] text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-brand-500/40 dark:hover:border-brand-500/40 overflow-hidden"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shrink-0 border shadow-2xs transition-transform duration-300 group-hover:scale-105`}>
                  <c.icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                </div>
                {c.href && (
                  <span className="text-gray-300 dark:text-slate-700 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                )}
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-0.5">{c.label}</p>
                {c.href ? (
                  <a href={c.href} className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white break-words block group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {c.value}
                  </a>
                ) : (
                  <p className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white break-words block">{c.value}</p>
                )}
                {c.sub && <p className="hidden sm:block text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">{c.sub}</p>}
              </div>
            </div>
          ))}
        </section>

        {/* Form Card */}
        <section className="card relative p-5 sm:p-8 bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none mb-6 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-brand-600 via-indigo-500 to-teal-400" />
          
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800/80 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800/40 flex items-center justify-center text-brand-650 dark:text-brand-400 shrink-0 shadow-2xs">
                <MessageSquare className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="font-black text-xs sm:text-base text-gray-900 dark:text-white uppercase sm:normal-case tracking-wider sm:tracking-normal">Send Support Ticket</h2>
                <p className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">Fill out the details below and our resolution team will assist you immediately.</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-[10px] sm:text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Online Support</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Your Name"
                name="name"
                placeholder="e.g. Rajesh Sharma"
                leftIcon={<User className="w-4 h-4" />}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={errors.name}
              />
              <Input
                label="Email address"
                type="email"
                name="email"
                placeholder="you@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={errors.email}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                name="phone"
                placeholder="10-digit mobile number"
                leftIcon={<Phone className="w-4 h-4" />}
                value={form.phone}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setForm({ ...form, phone: numericValue });
                }}
                error={errors.phone}
                hint="Only 10 digit number (no alphabets or spaces)"
              />
              <Input
                label="Subject / Topic"
                name="subject"
                placeholder="e.g. Booking #HS-2094"
                leftIcon={<Tag className="w-4 h-4" />}
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">How can we help?</label>
                <span className="text-[10px] sm:text-[11px] font-medium text-gray-400">Please provide context details</span>
              </div>
              <textarea
                rows={4}
                placeholder="Describe your query, feedback, or any support required. Mentioning dates or Booking IDs helps us quickly identify and resolve your request..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className={`w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none resize-none transition-all duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 ${
                  errors.message ? 'border-red-500 dark:border-red-500 ring-1 ring-red-500/20' : ''
                }`}
              />
              {errors.message ? (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.message}</p>
              ) : (
                <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">Your connection is encrypted. We respond to most inquiries via email.</p>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[11px] font-medium w-full sm:w-auto justify-center sm:justify-start">
                <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
                <span>Your contact details are kept private & confidental.</span>
              </div>
              <Button
                type="submit"
                size="lg"
                loading={loading}
                leftIcon={!loading ? <Send className="w-4 h-4" /> : undefined}
                className="w-full sm:w-auto px-8 h-11 sm:h-12 rounded-xl font-bold shadow-lg shadow-brand-600/20 hover:shadow-brand-600/30 transition-all duration-200"
              >
                Submit Ticket
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

