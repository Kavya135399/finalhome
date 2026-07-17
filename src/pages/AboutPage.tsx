import { Link } from 'react-router-dom';
import { Target, Eye, HeartHandshake, Award, Users, Leaf, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { stats } from '../data/sampleData';

const values = [
  { icon: HeartHandshake, title: 'Trust First', desc: 'Verified professionals you can rely on.' },
  { icon: Award, title: 'Quality Obsessed', desc: 'Highest standard tools and training.' },
  { icon: Users, title: 'Customer Centric', desc: 'Decisions designed for your benefit.' },
  { icon: Leaf, title: 'Sustainable', desc: 'Eco-friendly products and fair wages.' },
];

const milestones = [
  { year: '2019', event: 'HomeSeva founded in Mumbai with 3 services' },
  { year: '2021', event: 'Expanded to 10 cities, 500+ professionals' },
  { year: '2023', event: 'Crossed 10M services, launched mobile app' },
  { year: '2025', event: '35+ cities, 50K+ professionals, 12M+ customers' },
];

export function AboutPage() {
  return (
    <div className="flex flex-col flex-1 bg-gray-50 dark:bg-slate-950 p-4 select-none">
      
      {/* Intro Header */}
      <section className="py-6 text-center">
        <p className="text-[10px] font-extrabold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-2">About HomeSeva</p>
        <h1 className="text-xl font-black font-display text-gray-900 dark:text-white leading-tight">
          Making home care effortless for everyone
        </h1>
        <p className="mt-3 text-xs text-gray-550 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
          HomeSeva connects you with trusted professionals for 20+ home services, prioritizing quality, speed, and safety.
        </p>
      </section>

      {/* Mission / Vision Cards */}
      <section className="space-y-4 py-4">
        <div className="card p-4 bg-white dark:bg-slate-900">
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center mb-3">
            <Target className="w-5 h-5 text-brand-600" />
          </div>
          <h2 className="font-extrabold text-sm text-gray-900 dark:text-white">Our Mission</h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            To organize and professionalize India's unorganized home services sector — delivering reliable, transparent, and high-quality services to every household.
          </p>
        </div>

        <div className="card p-4 bg-white dark:bg-slate-900">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mb-3">
            <Eye className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="font-extrabold text-sm text-gray-900 dark:text-white">Our Vision</h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            To be the default platform for every home care need in India, empowering helpers with dignified livelihoods and customers with peace of mind.
          </p>
        </div>
      </section>

      {/* Stats list */}
      <section className="py-4">
        <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-4 text-white shadow-soft">
          <div className="grid grid-cols-2 gap-4 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-xl font-black font-display">{s.value}</p>
                <p className="text-[9px] text-brand-100 font-semibold uppercase mt-0.5 tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values stack */}
      <section className="py-4">
        <h2 className="text-sm font-extrabold text-gray-900 dark:text-white mb-4">Our Core Values</h2>
        <div className="grid grid-cols-2 gap-3">
          {values.map((v) => (
            <div key={v.title} className="card p-3 bg-white dark:bg-slate-900 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center text-brand-600">
                <v.icon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs text-gray-900 dark:text-white">{v.title}</h3>
                <p className="text-[9px] text-gray-500 mt-0.5 leading-snug">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline flow */}
      <section className="py-4 bg-white dark:bg-slate-900/60 rounded-2xl p-4 border border-gray-150/40 dark:border-slate-800/40 mb-4">
        <h2 className="text-sm font-extrabold text-gray-900 dark:text-white mb-4">Our Journey</h2>
        <div className="space-y-4">
          {milestones.map((m, i) => (
            <div key={m.year} className="flex gap-3">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-black text-xs">
                  {m.year}
                </div>
                {i < milestones.length - 1 && <div className="w-0.5 flex-1 bg-brand-200 dark:bg-brand-900/60 mt-1" />}
              </div>
              <div className="pb-3 min-w-0">
                <p className="text-xs text-gray-650 dark:text-gray-300 mt-1 leading-normal">{m.event}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA links */}
      <section className="py-6 text-center">
        <h2 className="text-base font-extrabold text-gray-900 dark:text-white">Join HomeSeva</h2>
        <p className="text-[10px] text-gray-550 dark:text-gray-400 mt-1">Ready to book a service or work with us?</p>
        <div className="flex gap-2.5 mt-4 justify-center">
          <Link to="/register" className="flex-1 max-w-[140px]"><Button fullWidth size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>Get started</Button></Link>
          <Link to="/services" className="flex-1 max-w-[140px]"><Button variant="outline" fullWidth size="sm">Browse</Button></Link>
        </div>
      </section>
    </div>
  );
}
