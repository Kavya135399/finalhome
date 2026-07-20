import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Moon, Sun, MapPin, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';
import { cities } from '../data/sampleData';
import { AnimatePresence, motion } from 'framer-motion';

export function TopAppBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  
  const [city, setCity] = useState('Patan, Gujarat');
  const [cityOpen, setCityOpen] = useState(false);

  const path = location.pathname;

  // Check if we are at a root screen of the bottom tabs (or auth landing)
  const isRootScreen = ['/', '/services', '/dashboard'].includes(path);

  // Determine Title based on path
  let title = 'HomeSeva';
  if (path === '/services') title = 'Explore';
  else if (path === '/dashboard') title = 'Dashboard';
  else if (path === '/about') title = 'About Us';
  else if (path === '/contact') title = 'Contact Us';
  else if (path === '/privacy') title = 'Privacy Policy';
  else if (path === '/terms') title = 'Terms & Conditions';
  else if (path.startsWith('/services/')) title = 'Service Details';
  else if (path.startsWith('/book/')) title = 'Booking';
  else if (path === '/pro/dashboard') title = 'Pro Panel';
  else if (path === '/admin') title = 'Admin Dashboard';
  else if (path === '/login') title = 'Login';
  else if (path === '/register') title = 'Sign Up';
  else if (path === '/forgot-password') title = 'Forgot Password';

  return (
    <header className="h-14 border-b border-gray-100 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-40 select-none shrink-0 text-left">
      <div className="flex items-center gap-2 w-1/4">
        {!isRootScreen ? (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 transition touch-target"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        ) : path === '/' ? (
          /* Show city selector for home screen left-aligned */
          <div className="relative">
            <button
              onClick={() => setCityOpen((v) => !v)}
              className="flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition py-1.5 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 shrink-0"
            >
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              <span className="max-w-[60px] truncate">{city}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${cityOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {cityOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute left-0 top-full mt-1.5 w-36 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl py-1.5 shadow-soft-lg max-h-56 overflow-y-auto z-50"
                >
                  {cities.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setCity(c); setCityOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-slate-800 transition ${c === city ? 'text-brand-600 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      {c}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : null}
      </div>

      <div className="w-2/4 flex justify-center text-center">
        {path === '/' ? (
          <Link to="/" className="flex items-center gap-1.5">
            <div className="w-6.5 h-6.5 rounded-lg bg-brand-600 flex items-center justify-center shadow-glow">
              <span className="text-white text-xs font-black">H</span>
            </div>
            <span className="text-base font-extrabold tracking-tight font-display text-gray-900 dark:text-white">
              Home<span className="text-brand-600">Seva</span>
            </span>
          </Link>
        ) : (
          <h1 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight truncate">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center justify-end gap-1.5 w-1/4">
        {/* Theme toggle action */}
        <button
          onClick={toggle}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 transition touch-target"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
        </button>
      </div>
    </header>
  );
}
