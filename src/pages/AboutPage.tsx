import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target, Eye, HeartHandshake, Users, Award, Leaf, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { stats } from '../data/sampleData';

const values = [
  { icon: HeartHandshake, title: 'Trust First', desc: 'We verify every professional so you never have to worry.' },
  { icon: Award, title: 'Quality Obsessed', desc: 'From training to tools, we hold ourselves to the highest standard.' },
  { icon: Users, title: 'Customer Centric', desc: 'Every decision starts with what is best for our customers.' },
  { icon: Leaf, title: 'Sustainable', desc: 'Eco-friendly practices and fair wages for professionals.' },
];

const milestones = [
  { year: '2019', event: 'HomeSeva founded in Mumbai with 3 services' },
  { year: '2021', event: 'Expanded to 10 cities, 500+ professionals' },
  { year: '2023', event: 'Crossed 10M services, launched mobile app' },
  { year: '2025', event: '35+ cities, 50K+ professionals, 12M+ customers' },
];

export function AboutPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-grid-light dark:opacity-20" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-400/20 rounded-full blur-3xl -z-10" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-3">About Us</p>
            <h1 className="text-4xl lg:text-5xl font-extrabold font-display leading-tight">Making home care effortless for every Indian household</h1>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              HomeSeva started with a simple idea: finding a reliable home service professional should not be a gamble. Today, we are India's most trusted home services platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="card p-8">
            <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center mb-4"><Target className="w-6 h-6 text-brand-600" /></div>
            <h2 className="text-xl font-bold mb-2">Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">To organize and professionalize India's unorganized home services sector — delivering reliable, transparent, and high-quality service to every home.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="card p-8">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mb-4"><Eye className="w-6 h-6 text-emerald-600" /></div>
            <h2 className="text-xl font-bold mb-2">Our Vision</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">To be the default platform for every home service need in India, empowering professionals with dignified livelihoods and customers with peace of mind.</p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-10 text-white">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {stats.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <p className="text-4xl font-extrabold font-display">{s.value}</p>
                  <p className="mt-2 text-brand-100 text-sm">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold font-display">Our Core Values</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">The principles that guide every decision we make.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="card p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center mx-auto mb-4"><v.icon className="w-7 h-7 text-brand-600" /></div>
                <h3 className="font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-white dark:bg-slate-900/50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold font-display text-center mb-12">Our Journey</h2>
          <div className="space-y-6">
            {milestones.map((m, i) => (
              <motion.div key={m.year} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm shrink-0">{m.year}</div>
                  {i < milestones.length - 1 && <div className="w-0.5 flex-1 bg-brand-200 dark:bg-brand-900 mt-2" />}
                </div>
                <div className="pb-6">
                  <p className="text-gray-700 dark:text-gray-300 pt-3">{m.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold font-display">Join the HomeSeva family</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">Whether you need a service or want to offer one, we'd love to have you.</p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link to="/register"><Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>Get started</Button></Link>
            <Link to="/services"><Button variant="outline" size="lg">Browse services</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
