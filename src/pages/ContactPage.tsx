import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'support@homeseva.com', href: 'mailto:support@homeseva.com' },
  { icon: Phone, label: 'Phone', value: '1800-200-3000', href: 'tel:18002003000' },
  { icon: MapPin, label: 'Office', value: 'HomeSeva Tower, BKC, Mumbai 400051' },
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
      toast('Message sent! We will get back to you soon.', 'success');
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 800);
  };

  return (
    <div className="pt-20 pb-16">
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-3">Contact</p>
            <h1 className="text-4xl lg:text-5xl font-extrabold font-display">We'd love to hear from you</h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Questions, feedback, or just want to say hello? Reach out and our team will respond within 24 hours.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_1.5fr] gap-8">
          {/* Info */}
          <div className="space-y-4">
            {contactInfo.map((c, i) => (
              <motion.div key={c.label} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="card p-5 flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center shrink-0"><c.icon className="w-5 h-5 text-brand-600" /></div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{c.label}</p>
                  {c.href ? <a href={c.href} className="font-semibold text-sm hover:text-brand-600 transition">{c.value}</a> : <p className="font-semibold text-sm">{c.value}</p>}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-brand-600" />
              <h2 className="text-xl font-bold">Send us a message</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Your name" name="name" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
                <Input label="Email" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
              </div>
              <Input label="Subject" name="subject" placeholder="How can we help?" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message</label>
                <textarea
                  rows={5}
                  placeholder="Tell us more…"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className={`input-base resize-none ${errors.message ? 'border-red-500' : ''}`}
                />
                {errors.message && <p className="mt-1.5 text-xs text-red-600">{errors.message}</p>}
              </div>
              <Button type="submit" size="lg" loading={loading} leftIcon={!loading ? <Send className="w-4 h-4" /> : undefined} fullWidth>Send message</Button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
