import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Gift,
  UtensilsCrossed,
  CookingPot,
  CarTaxiFront,
  Wrench,
  ShoppingBag,
  Tag,
  Zap,
  Star,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cities } from '../data/sampleData';
import { apiClient } from '../services/apiClient';
import { useGreeting } from '../hooks/useGreeting';

const heroServices = [
  {
    id: 'services',
    name: 'Services',
    icon: Wrench,
    path: '/services',
    bgClass: 'bg-[#EDF5FF] dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400 border border-[#DCEAFC]/70 dark:border-blue-500/30 group-hover:bg-[#DCEAFC]/90 dark:group-hover:bg-blue-500/25',
    shadowClass: 'shadow-sm shadow-blue-500/5 group-hover:shadow-md group-hover:shadow-blue-500/15 dark:group-hover:shadow-none',
  },
  {
    id: 'store',
    name: 'Store',
    icon: ShoppingBag,
    path: '/store',
    bgClass: 'bg-[#FFF9EA] dark:bg-amber-500/15 text-[#D97706] dark:text-amber-400 border border-[#FEEFC6]/70 dark:border-amber-500/30 group-hover:bg-[#FEEFC6]/90 dark:group-hover:bg-amber-500/25',
    shadowClass: 'shadow-sm shadow-amber-500/5 group-hover:shadow-md group-hover:shadow-amber-500/15 dark:group-hover:shadow-none',
  },
  {
    id: 'taxi',
    name: 'Taxi',
    icon: CarTaxiFront,
    path: '/taxi',
    bgClass: 'bg-[#F8F3FF] dark:bg-purple-500/15 text-[#9333EA] dark:text-purple-400 border border-[#EBE0FF]/70 dark:border-purple-500/30 group-hover:bg-[#EBE0FF]/90 dark:group-hover:bg-purple-500/25',
    shadowClass: 'shadow-sm shadow-purple-500/5 group-hover:shadow-md group-hover:shadow-purple-500/15 dark:group-hover:shadow-none',
  },
  {
    id: 'membership',
    name: 'Membership',
    icon: ShieldCheck,
    path: '/services?category=luxury-premium-package',
    bgClass: 'bg-[#EBFCF4] dark:bg-emerald-500/15 text-[#059669] dark:text-emerald-400 border border-[#D1FAE5]/70 dark:border-emerald-500/30 group-hover:bg-[#D1FAE5]/90 dark:group-hover:bg-emerald-500/25',
    shadowClass: 'shadow-sm shadow-emerald-500/5 group-hover:shadow-md group-hover:shadow-emerald-500/15 dark:group-hover:shadow-none',
  },
  {
    id: 'catering',
    name: 'Catering',
    icon: CookingPot,
    path: '/services?category=catering',
    bgClass: 'bg-[#FFF5EB] dark:bg-orange-500/15 text-[#EA580C] dark:text-orange-400 border border-[#FDE8D1]/70 dark:border-orange-500/30 group-hover:bg-[#FDE8D1]/90 dark:group-hover:bg-orange-500/25',
    shadowClass: 'shadow-sm shadow-orange-500/5 group-hover:shadow-md group-hover:shadow-orange-500/15 dark:group-hover:shadow-none',
  },
  {
    id: 'meals',
    name: 'Meals',
    icon: UtensilsCrossed,
    path: '/services?category=meal-services',
    bgClass: 'bg-[#FFF0F3] dark:bg-rose-500/15 text-[#E11D48] dark:text-rose-400 border border-[#FDDCE3]/70 dark:border-rose-500/30 group-hover:bg-[#FDDCE3]/90 dark:group-hover:bg-rose-500/25',
    shadowClass: 'shadow-sm shadow-rose-500/5 group-hover:shadow-md group-hover:shadow-rose-500/15 dark:group-hover:shadow-none',
  },
];

const promoBanners = [
  { id: 1, title: 'Flat ₹200 OFF', desc: 'On your first service booking', code: 'NEW200', bg: 'from-brand-600 to-blue-500', icon: Gift },
  { id: 2, title: 'Deep Cleaning Special', desc: 'Up to 30% OFF this weekend', code: 'CLEAN30', bg: 'from-emerald-600 to-teal-500', icon: Sparkles },
  { id: 3, title: 'Safe & Verified Pros', desc: 'All tools sanitized before entry', code: 'SAFETYFIRST', bg: 'from-amber-600 to-orange-500', icon: ShieldCheck },
];

export function Hero() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('Patan, Gujarat');
  const [cityOpen, setCityOpen] = useState(false);
  const greeting = useGreeting(user?.name);
  const [livePromos, setLivePromos] = useState<any[]>([]);

  useEffect(() => {
    // 1. Immediately sync with local storage if Admin added offers without restarting backend server
    try {
      const stored = localStorage.getItem('homeseva_custom_promos_list');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLivePromos(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load local promos:', e);
    }

    // 2. Also try reaching backend server
    apiClient.getPromos()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLivePromos(data);
          try {
            localStorage.setItem('homeseva_custom_promos_list', JSON.stringify(data));
          } catch {}
        }
      })
      .catch((err) => console.log('Backend not restarted yet, relying on synced local state:', err));
  }, []);

  const displayPromos = livePromos.length > 0 ? livePromos : promoBanners;

  const renderPromoIcon = (iconVal: any) => {
    if (typeof iconVal !== 'string') {
      const IconComp = iconVal || Gift;
      return <IconComp className="w-4 h-4 text-white" />;
    }
    switch (iconVal) {
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-white" />;
      case 'ShieldCheck': return <ShieldCheck className="w-4 h-4 text-white" />;
      case 'Tag': return <Tag className="w-4 h-4 text-white" />;
      case 'Zap': return <Zap className="w-4 h-4 text-white" />;
      case 'Star': return <Star className="w-4 h-4 text-white" />;
      case 'Gift':
      default: return <Gift className="w-4 h-4 text-white" />;
    }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/services?q=${encodeURIComponent(query)}`);
  };

  const selectCity = (c: string) => {
    setCity(c);
    setCityOpen(false);
  };

  const popularCities = cities;
  return (
    <section className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800/40 select-none shrink-0 relative">
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-6">
        {/* Top Welcome & City Picker */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Your location</p>
            <div className="relative">
              <button
                onClick={() => setCityOpen((v) => !v)}
                className="flex items-center gap-1 text-sm font-extrabold text-gray-900 dark:text-white mt-0.5 active-scale"
              >
                <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                {city}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${cityOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {cityOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setCityOpen(false)} />
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-soft-lg border border-gray-100 dark:border-slate-700 py-1.5 z-50">
                    {popularCities.map((c) => (
                      <button
                        key={c}
                        onClick={() => selectCity(c)}
                        className={`w-full text-left px-4 py-2 text-sm transition hover:bg-gray-50 dark:hover:bg-slate-700 ${
                          c === city ? 'text-brand-600 font-bold' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Hero Title */}
        <div className="mb-4">
          <h1 className="text-xl font-bold font-display text-gray-900 dark:text-white leading-tight">
            {greeting}
          </h1>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="mb-7 sm:mb-8 relative">
          <div className="relative">
            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services & products..."
              className="w-full h-12 sm:h-14 pl-11 sm:pl-13 pr-5 rounded-2xl sm:rounded-3xl bg-[#F1F5F9] dark:bg-slate-800 text-sm sm:text-base font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-brand-500/20 focus:bg-white dark:focus:bg-slate-900 border border-transparent focus:border-brand-500 shadow-sm"
            />
          </div>
        </form>

        {/* Elite Remote Home Management Banner Card */}
        <div className="group relative w-full rounded-[24px] sm:rounded-[28px] overflow-hidden bg-[#0F172A] dark:bg-[#090F1D] border border-slate-800/80 shadow-xl p-5 sm:p-7 md:p-8 mb-8 sm:mb-10 text-left relative">
          {/* Background Luxury Architectural Image with Dark Gradient Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none" 
            style={{ backgroundImage: "url('https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1400&h=600&fit=crop')" }} 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/95 to-slate-900/60 pointer-events-none" />

          {/* Card Content */}
          <div className="relative z-10">
            {/* Premium Care Badge */}
            <div className="inline-flex items-center bg-[#07382A] text-[#2ED39A] font-bold text-[11px] sm:text-xs px-3 py-1 rounded-md mb-3 tracking-wider uppercase select-none shadow-sm">
              PREMIUM CARE
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-white tracking-tight leading-tight">
              Elite Remote Home Management
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm md:text-base text-gray-300 dark:text-gray-300 mt-1 sm:mt-1.5 max-w-2xl font-normal leading-relaxed">
              Your Patan ancestral home, professionally managed — even when you&apos;re away.
            </p>

            {/* Sign In to Dashboard Button */}
            <button
              onClick={() => navigate(user ? '/dashboard' : '/login')}
              className="w-full mt-5 sm:mt-6 py-3 px-6 bg-white hover:bg-gray-100 text-slate-900 font-bold rounded-[20px] text-sm sm:text-base transition-all duration-200 shadow hover:shadow-lg active:scale-[0.99]"
            >
              {user ? 'Go to Dashboard' : 'Sign In to Dashboard'}
            </button>
          </div>
        </div>

        {/* Core Services Grid */}
        <div className="my-6 sm:my-8 w-full max-w-5xl mx-auto px-2 sm:px-8">
          <div className="grid grid-cols-3 gap-y-8 sm:gap-y-12 justify-items-center">
            {heroServices.map((service) => {
              const IconComponent = service.icon;
              return (
                <button
                  key={service.id}
                  onClick={() => navigate(service.path)}
                  className="group flex flex-col items-center justify-center select-none outline-none focus:outline-none"
                >
                  {/* Pastel Squircle Icon Container */}
                  <div
                    className={`w-[58px] h-[58px] sm:w-[64px] sm:h-[64px] rounded-[18px] sm:rounded-[20px] flex items-center justify-center transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-[1.03] active:scale-95 ${service.bgClass} ${service.shadowClass}`}
                  >
                    <IconComponent className="w-6 h-6 sm:w-[26px] sm:h-[26px] transition-transform duration-300 group-hover:scale-110 drop-shadow-sm" />
                  </div>
                  {/* Clean Label */}
                  <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 text-center mt-2 tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-200">
                    {service.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Swipeable Promo Banners Carousel with Generous Top Spacing & Section Title */}
        <div className="mt-14 sm:mt-16 mb-2">
          {/* Section Title */}
          <div className="flex items-center justify-between mb-5 px-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-500/15 dark:bg-brand-400/15 flex items-center justify-center text-brand-600 dark:text-brand-400 shadow-xs shrink-0">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-black font-display text-gray-900 dark:text-white tracking-tight">
                  Special Offers & Promos
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                  Exclusive discount codes and seasonal deals for your bookings
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory px-0.5">
            {displayPromos.map((promo: any) => (
              <div
                key={promo.id}
                className={`snap-center shrink-0 w-[290px] h-28 rounded-2xl bg-gradient-to-br ${promo.bg || 'from-brand-600 to-blue-500'} p-4 text-white flex flex-col justify-between shadow-soft-lg relative overflow-hidden transition-transform duration-300 hover:-translate-y-1`}
              >
                <div className="absolute right-[-10px] bottom-[-10px] w-20 h-20 bg-white/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex justify-between items-start gap-2">
                  <div className="max-w-[200px]">
                    <h3 className="text-sm font-black tracking-tight leading-snug">{promo.title}</h3>
                    <p className="text-[10px] text-white/80 mt-0.5 line-clamp-2 leading-relaxed">{promo.desc}</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner shrink-0">
                    {renderPromoIcon(promo.icon)}
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-white/20 pt-2 mt-1">
                  <span className="text-[9px] uppercase tracking-wider font-semibold opacity-90">Code: <span className="font-bold underline">{promo.code}</span></span>
                  <button className="text-[10px] bg-white text-gray-900 font-bold px-3 py-1 rounded-lg shadow-sm hover:bg-gray-100 transition active:scale-95">
                    Claim
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
