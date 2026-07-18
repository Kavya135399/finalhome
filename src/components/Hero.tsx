import { useState, type FormEvent } from 'react';
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
  Shirt,
  Wrench,
  Zap,
  Crown,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { categories } from '../data/sampleData';

const iconMap: Record<string, React.ComponentType<any>> = {
  UtensilsCrossed,
  CookingPot,
  CarTaxiFront,
  Shirt,
  Wrench,
  Zap,
  Sparkles,
  Crown
};

const promoBanners = [
  { id: 1, title: 'Flat ₹200 OFF', desc: 'On your first service booking', code: 'NEW200', bg: 'from-brand-600 to-blue-500', icon: Gift },
  { id: 2, title: 'Deep Cleaning Special', desc: 'Up to 30% OFF this weekend', code: 'CLEAN30', bg: 'from-emerald-600 to-teal-500', icon: Sparkles },
  { id: 3, title: 'Safe & Verified Pros', desc: 'All tools sanitized before entry', code: 'SAFETYFIRST', bg: 'from-amber-600 to-orange-500', icon: ShieldCheck },
];

export function Hero() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [cityOpen, setCityOpen] = useState(false);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/services?q=${encodeURIComponent(query)}`);
  };

  const selectCity = (c: string) => {
    setCity(c);
    setCityOpen(false);
  };

  const popularCities = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai'];
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

          {/* Hello Banner */}
          <div className="text-right">
            <p className="text-xs text-gray-450">Welcome,</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[120px]">
              {user ? user.name.split(' ')[0] : 'Guest User'}
            </p>
          </div>
        </div>

        {/* Hero Title */}
        <div className="mb-4">
          <h1 className="text-xl font-black font-display text-gray-900 dark:text-white leading-tight">
            Reliable home services, <br />
            <span className="text-brand-600 dark:text-brand-400">booked in 1-tap.</span>
          </h1>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="mb-6 relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for AC repair, cleaning, catering..."
              className="w-full h-12 pl-11 pr-4 rounded-2xl bg-gray-100 dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition focus:ring-2 focus:ring-brand-500/20 focus:bg-white dark:focus:bg-slate-900 border border-transparent focus:border-brand-500"
            />
          </div>
        </form>

        {/* Horizontal Circle Categories Menu */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">Popular Services</h2>
            <button
              onClick={() => navigate('/services')}
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              See all
            </button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto py-2 px-1 no-scrollbar scroll-smooth">
            {categories.slice(0, 8).map((cat) => {
              const IconComponent = iconMap[cat.icon] || HelpCircle;
              return (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/services?category=${cat.slug}`)}
                  className="group flex flex-col items-center shrink-0 w-20 pt-1 pb-3 select-none"
                >
                  {/* 3D Push Button Container */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-[0_5px_0_0_rgba(0,0,0,0.15)] dark:shadow-[0_5px_0_0_rgba(0,0,0,0.4)] transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_8px_0_0_rgba(0,0,0,0.15)] dark:group-hover:shadow-[0_8px_0_0_rgba(0,0,0,0.45)] group-active:translate-y-[4px] group-active:shadow-none`}>
                    <IconComponent className="w-6 h-6 text-white drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.2)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                  </div>
                  <span className="text-[10px] font-extrabold text-gray-700 dark:text-gray-300 max-w-[76px] text-center leading-tight mt-3">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Swipeable Promo Banners Carousel */}
        <div>
          <div className="flex gap-3.5 overflow-x-auto pb-1 no-scrollbar snap-x snap-mandatory">
            {promoBanners.map((promo) => {
              const Icon = promo.icon;
              return (
                <div
                  key={promo.id}
                  className={`snap-center shrink-0 w-[290px] h-28 rounded-2xl bg-gradient-to-br ${promo.bg} p-4 text-white flex flex-col justify-between shadow-soft-lg relative overflow-hidden`}
                >
                  <div className="absolute right-[-10px] bottom-[-10px] w-20 h-20 bg-white/10 rounded-full blur-xl pointer-events-none" />
                  <div className="flex justify-between items-start">
                    <div className="max-w-[200px]">
                      <h3 className="text-sm font-black">{promo.title}</h3>
                      <p className="text-[10px] text-white/80 mt-0.5 line-clamp-2 leading-relaxed">{promo.desc}</p>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/20 pt-2 mt-1">
                    <span className="text-[9px] uppercase tracking-wider font-semibold opacity-90">Code: <span className="font-bold underline">{promo.code}</span></span>
                    <button className="text-[10px] bg-white text-gray-900 font-bold px-2.5 py-1 rounded-lg shadow-sm">
                      Claim
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
