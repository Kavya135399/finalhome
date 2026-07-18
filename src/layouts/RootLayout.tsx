import { useState } from 'react';
import { Outlet, ScrollRestoration, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home as HomeIcon,
  Search,
  Calendar,
  Heart,
  User as UserIcon,
  ChevronLeft,
  Menu,
  Sun,
  Moon,
  X,
  Info,
  Mail,
  Shield,
  FileText,
  LogOut,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function RootLayout() {
  const { theme, toggle } = useTheme();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setDrawerOpen(false);
    toast('Signed out successfully', 'success');
    navigate('/');
  };

  const pathname = location.pathname;

  // Determine page title
  let pageTitle = 'HomeSeva';
  if (pathname === '/services') pageTitle = 'Explore Services';
  else if (pathname.startsWith('/services/')) pageTitle = 'Service Details';
  else if (pathname.startsWith('/book/')) pageTitle = 'Book Service';
  else if (pathname === '/dashboard') {
    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get('tab');
    if (tab === 'bookings') pageTitle = 'My Bookings';
    else if (tab === 'favorites') pageTitle = 'My Favorites';
    else if (tab === 'addresses') pageTitle = 'My Addresses';
    else if (tab === 'notifications') pageTitle = 'Notifications';
    else if (tab === 'wallet') pageTitle = 'My Wallet';
    else if (tab === 'profile') pageTitle = 'Profile Settings';
    else pageTitle = 'My Dashboard';
  } else if (pathname === '/pro/dashboard') pageTitle = 'Pro Panel';
  else if (pathname === '/admin') pageTitle = 'Admin Panel';
  else if (pathname === '/login') pageTitle = 'Sign In';
  else if (pathname === '/register') pageTitle = 'Sign Up';
  else if (pathname === '/forgot-password') pageTitle = 'Reset Password';
  else if (pathname === '/about') pageTitle = 'About Us';
  else if (pathname === '/contact') pageTitle = 'Contact Us';
  else if (pathname === '/privacy') pageTitle = 'Privacy Policy';
  else if (pathname === '/terms') pageTitle = 'Terms of Service';

  // Navigation flags
  const hideBottomNavList = ['/login', '/register', '/forgot-password', '/book', '/admin', '/pro'];
  const isDetailsView = pathname.startsWith('/services/') && pathname !== '/services';
  const showBottomNav = !hideBottomNavList.some((p) => pathname.startsWith(p)) && !isDetailsView;
  
  const rootPaths = ['/', '/services', '/dashboard', '/pro/dashboard', '/admin'];
  const showBackButton = !rootPaths.includes(pathname);

  // Active tab check
  const getActiveTab = () => {
    if (pathname === '/') return 'home';
    if (pathname === '/services') return 'explore';
    if (pathname === '/dashboard') {
      const tab = new URLSearchParams(location.search).get('tab');
      if (tab === 'bookings') return 'bookings';
      if (tab === 'favorites') return 'favorites';
      return 'profile';
    }
    return '';
  };

  const activeTab = getActiveTab();

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-slate-950 flex flex-col text-gray-900 dark:text-white antialiased">
      
      {/* Top App Bar */}
      <header className="fixed top-0 inset-x-0 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-b border-gray-150 dark:border-slate-800/60 z-40 select-none">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {showBackButton ? (
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 active-scale"
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => setDrawerOpen(true)}
                className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 active-scale"
                aria-label="Open drawer menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <span className="text-base font-extrabold font-display tracking-tight text-gray-900 dark:text-white truncate max-w-[200px]">
              {pageTitle}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggle}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 active-scale"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area (Scrollable viewport) */}
      <main className={`flex-1 flex flex-col pt-14 ${showBottomNav ? 'pb-16' : 'pb-0'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname + location.search}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Drawer slide-in Navigation Menu */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-gray-950/40 dark:bg-slate-950/70 backdrop-blur-sm"
            />

            {/* Side Drawer Body */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 200 }}
              className="relative w-72 h-full bg-white dark:bg-slate-900 p-6 flex flex-col z-10 border-r border-gray-150 dark:border-slate-800"
            >
              {/* Logo and Close Button */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
                    <HomeIcon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <span className="text-lg font-black font-display text-gray-900 dark:text-white">
                    Home<span className="text-brand-600">Seva</span>
                  </span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Widget if Logged In */}
              {user && (
                <div className="p-4 bg-brand-50/55 dark:bg-slate-800/50 rounded-2xl mb-6">
                  <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Signed in as</p>
                  <p className="font-bold text-sm text-gray-900 dark:text-white mt-1 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                </div>
              )}

              {/* Links */}
              <nav className="flex-1 space-y-2">
                <Link
                  to="/"
                  onClick={() => setDrawerOpen(false)}
                  className="group flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-200 border border-transparent hover:border-brand-100/40 dark:hover:border-brand-900/30 hover:bg-brand-50/50 dark:hover:bg-slate-800/50 hover:shadow-soft hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all duration-200"
                >
                  <HomeIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:scale-110 transition-transform duration-200 shrink-0" />
                  <span className="group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors duration-200">Home</span>
                </Link>
                
                <Link
                  to="/services"
                  onClick={() => setDrawerOpen(false)}
                  className="group flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-200 border border-transparent hover:border-brand-100/40 dark:hover:border-brand-900/30 hover:bg-brand-50/50 dark:hover:bg-slate-800/50 hover:shadow-soft hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all duration-200"
                >
                  <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:scale-110 transition-transform duration-200 shrink-0" />
                  <span className="group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors duration-200">Explore Services</span>
                </Link>

                <div className="h-px bg-gray-100 dark:bg-slate-800 my-4" />

                <Link
                  to="/about"
                  onClick={() => setDrawerOpen(false)}
                  className="group flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-semibold text-gray-600 dark:text-gray-300 border border-transparent hover:border-brand-100/40 dark:hover:border-brand-900/30 hover:bg-brand-50/50 dark:hover:bg-slate-800/50 hover:shadow-soft hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all duration-200"
                >
                  <Info className="w-5 h-5 text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:scale-110 transition-transform duration-200 shrink-0" />
                  <span className="group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors duration-200">About HomeSeva</span>
                </Link>
                
                <Link
                  to="/contact"
                  onClick={() => setDrawerOpen(false)}
                  className="group flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-semibold text-gray-600 dark:text-gray-300 border border-transparent hover:border-brand-100/40 dark:hover:border-brand-900/30 hover:bg-brand-50/50 dark:hover:bg-slate-800/50 hover:shadow-soft hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all duration-200"
                >
                  <Mail className="w-5 h-5 text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:scale-110 transition-transform duration-200 shrink-0" />
                  <span className="group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors duration-200">Contact Support</span>
                </Link>
                
                <Link
                  to="/privacy"
                  onClick={() => setDrawerOpen(false)}
                  className="group flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-semibold text-gray-600 dark:text-gray-300 border border-transparent hover:border-brand-100/40 dark:hover:border-brand-900/30 hover:bg-brand-50/50 dark:hover:bg-slate-800/50 hover:shadow-soft hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all duration-200"
                >
                  <Shield className="w-5 h-5 text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:scale-110 transition-transform duration-200 shrink-0" />
                  <span className="group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors duration-200">Privacy Policy</span>
                </Link>
                
                <Link
                  to="/terms"
                  onClick={() => setDrawerOpen(false)}
                  className="group flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-semibold text-gray-600 dark:text-gray-300 border border-transparent hover:border-brand-100/40 dark:hover:border-brand-900/30 hover:bg-brand-50/50 dark:hover:bg-slate-800/50 hover:shadow-soft hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all duration-200"
                >
                  <FileText className="w-5 h-5 text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:scale-110 transition-transform duration-200 shrink-0" />
                  <span className="group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors duration-200">Terms of Service</span>
                </Link>
              </nav>

              {/* Footer Sign out / Auth Button */}
              <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-800">
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition active-scale"
                  >
                    <LogOut className="w-4.5 h-4.5" /> Sign Out
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setDrawerOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition active-scale"
                  >
                    Sign In / Register
                  </Link>
                )}
                <p className="text-[10px] text-gray-400 mt-4 text-center">Version 2.0.4 • Native Shell</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      {showBottomNav && (
        <nav className="fixed bottom-0 inset-x-0 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-gray-150 dark:border-slate-800/60 z-45 pb-[env(safe-area-inset-bottom)] select-none">
          <div className="max-w-7xl mx-auto h-full flex items-center justify-around">
            {/* Tab 1: Home */}
            <Link
              to="/"
              className={`flex flex-col items-center justify-center w-14 h-full relative transition active-scale ${
                activeTab === 'home' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <HomeIcon className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">Home</span>
              {activeTab === 'home' && (
                <motion.div layoutId="nav-dot" className="absolute bottom-1 w-1 h-1 bg-brand-600 dark:bg-brand-400 rounded-full" />
              )}
            </Link>

            {/* Tab 2: Explore */}
            <Link
              to="/services"
              className={`flex flex-col items-center justify-center w-14 h-full relative transition active-scale ${
                activeTab === 'explore' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <Search className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">Explore</span>
              {activeTab === 'explore' && (
                <motion.div layoutId="nav-dot" className="absolute bottom-1 w-1 h-1 bg-brand-600 dark:bg-brand-400 rounded-full" />
              )}
            </Link>

            {/* Tab 3: Bookings */}
            <Link
              to={user ? '/dashboard?tab=bookings' : '/login'}
              className={`flex flex-col items-center justify-center w-14 h-full relative transition active-scale ${
                activeTab === 'bookings' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">Bookings</span>
              {activeTab === 'bookings' && (
                <motion.div layoutId="nav-dot" className="absolute bottom-1 w-1 h-1 bg-brand-600 dark:bg-brand-400 rounded-full" />
              )}
            </Link>

            {/* Tab 4: Favorites */}
            <Link
              to={user ? '/dashboard?tab=favorites' : '/login'}
              className={`flex flex-col items-center justify-center w-14 h-full relative transition active-scale ${
                activeTab === 'favorites' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <Heart className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">Favorites</span>
              {activeTab === 'favorites' && (
                <motion.div layoutId="nav-dot" className="absolute bottom-1 w-1 h-1 bg-brand-600 dark:bg-brand-400 rounded-full" />
              )}
            </Link>

            {/* Tab 5: Profile */}
            <Link
              to={user ? '/dashboard?tab=profile' : '/login'}
              className={`flex flex-col items-center justify-center w-14 h-full relative transition active-scale ${
                activeTab === 'profile' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <UserIcon className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">Profile</span>
              {activeTab === 'profile' && (
                <motion.div layoutId="nav-dot" className="absolute bottom-1 w-1 h-1 bg-brand-600 dark:bg-brand-400 rounded-full" />
              )}
            </Link>
          </div>
        </nav>
      )}

      <ScrollRestoration />
    </div>
  );
}
