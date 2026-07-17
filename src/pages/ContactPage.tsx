import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'support@homeseva.com', href: 'mailto:support@homeseva.com' },
  { icon: Phone, label: 'Phone', value: '1800-200-3000', href: 'tel:18002003000' },
  { icon: MapPin, label: 'Office', value: 'BKC, Mumbai 400051' },
  { icon: Clock, label: 'Hours', value: 'Mon-Sun, 8 AM - 10 PM' },
];

export function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = 'Required';
    if (!form.email) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.message) e.message = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast('Message sent successfully!', 'success');
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 850);
  };

  return (
    <div className="flex flex-col flex-1 bg-gray-50 dark:bg-slate-950 p-4 select-none">
      
      {/* Page Header */}
      <section className="py-6 text-center">
        <p className="text-[10px] font-extrabold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-2">Support</p>
        <h1 className="text-xl font-black font-display text-gray-900 dark:text-white leading-tight">Get in Touch</h1>
        <p className="mt-2 text-xs text-gray-500 max-w-xs mx-auto">We typically respond to customer support tickets in under 2 hours.</p>
      </section>

      {/* Stacked info items */}
      <section className="grid grid-cols-2 gap-3 mb-6">
        {contactInfo.map((c) => (
          <div key={c.label} className="card p-3 bg-white dark:bg-slate-900 flex flex-col justify-between h-24 text-left">
            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center shrink-0">
              <c.icon className="w-4.5 h-4.5 text-brand-600" />
            </div>
            <div>
              <p className="text-[8px] text-gray-400 font-extrabold uppercase tracking-wider">{c.label}</p>
              {c.href ? (
                <a href={c.href} className="font-extrabold text-[10px] text-gray-900 dark:text-white truncate block hover:underline mt-0.5">
                  {c.value}
                </a>
              ) : (
                <p className="font-extrabold text-[10px] text-gray-900 dark:text-white truncate block mt-0.5">{c.value}</p>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Form Card */}
      <section className="card p-4 bg-white dark:bg-slate-900 mb-4 select-none">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-4.5 h-4.5 text-brand-650" />
          <h2 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">Send Support Ticket</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Your Name" name="name" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
          <Input label="Email address" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
          <Input label="Subject / Topic" name="subject" placeholder="What is the issue?" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          
          <div>
            <label className="block text-xs font-bold text-gray-405 dark:text-gray-400 mb-1.5">How can we help?</label>
            <textarea
              rows={4}
              placeholder="Provide context details..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className={`w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none resize-none focus:border-brand-500 ${errors.message ? 'border-red-500' : ''}`}
            />
            {errors.message && <p className="mt-1 text-[10px] text-red-500">{errors.message}</p>}
          </div>

          <Button type="submit" size="lg" loading={loading} leftIcon={!loading ? <Send className="w-4 h-4" /> : undefined} fullWidth className="h-11 rounded-xl">
            Submit Ticket
          </Button>
        </form>
      </section>
    </div>
  );
}
