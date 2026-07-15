import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, ShieldCheck, Star, Clock, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';
import { cities } from '../data/sampleData';

export function Hero() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('Mumbai');

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/services?q=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}`);
  };

  return (
    <section className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-grid-light dark:opacity-20" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/60 via-transparent to-transparent dark:from-brand-950/30" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-400/20 rounded-full blur-3xl -z-10" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm font-medium text-brand-700 dark:text-brand-300 mb-6"
            >
              <ShieldCheck className="w-4 h-4" />
              50K+ background-verified professionals
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight leading-[1.1]"
            >
              Home services,<br />
              <span className="text-brand-600">booked in minutes.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-5 text-lg text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed"
            >
              From catering and daily meals to taxi, laundry, plumbing, electrical, and deep cleaning, HomeSeva connects you with trusted professionals for 20+ home services. Transparent pricing, live tracking, OTP-verified service.
            </motion.p>

            {/* Search */}
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 glass-strong rounded-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-xl"
            >
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for a service…"
                  className="w-full bg-transparent outline-none text-sm py-2.5 placeholder-gray-400"
                  aria-label="Search services"
                />
              </div>
              <div className="flex items-center gap-2 px-3 sm:border-l border-gray-200 dark:border-slate-700">
                <MapPin className="w-5 h-5 text-brand-600 shrink-0" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-transparent outline-none text-sm py-2.5 font-medium text-gray-700 dark:text-gray-200 cursor-pointer"
                  aria-label="Select city"
                >
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Button type="submit" size="md" className="sm:self-center">Search</Button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400"
            >
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> 4.8 avg rating</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-brand-600" /> Same-day available</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> 45M+ services done</span>
            </motion.div>
          </div>

          {/* Right — image collage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img src="https://images.pexels.com/photos/4239034/pexels-photo-4239034.jpeg?auto=compress&cs=tinysrgb&w=500&h=600&fit=crop" alt="Home cleaning" className="w-full h-56 object-cover rounded-2xl shadow-soft-lg" />
                <img src="https://images.pexels.com/photos/6476753/pexels-photo-6476753.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&fit=crop" alt="Electrical" className="w-full h-40 object-cover rounded-2xl shadow-soft" />
              </div>
              <div className="space-y-4 pt-8">
                <img src="https://images.pexels.com/photos/7526962/pexels-photo-7526962.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&fit=crop" alt="AC repair" className="w-full h-40 object-cover rounded-2xl shadow-soft" />
                <img src="https://images.pexels.com/photos/8961345/pexels-photo-8961345.jpeg?auto=compress&cs=tinysrgb&w=500&h=600&fit=crop" alt="Plumbing" className="w-full h-56 object-cover rounded-2xl shadow-soft-lg" />
              </div>
            </div>
            {/* Floating card */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-4 -left-4 glass-strong rounded-2xl p-4 shadow-soft-lg w-52"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold">100% Verified</p>
                  <p className="text-xs text-gray-500">Background checked</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 flex flex-wrap gap-3"
        >
          <Link to="/services"><Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>Browse all services</Button></Link>
          <Link to="/register"><Button variant="outline" size="lg">Become a professional</Button></Link>
        </motion.div>
      </div>
    </section>
  );
}

