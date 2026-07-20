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
  Bell,
  Camera,
  Settings,
  Car,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import { apiClient } from '../services/apiClient';

export function RootLayout() {
  const { theme, toggle } = useTheme();
  const { user, signOut, updateUser } = useAuth();
  const { toast } = useToast();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsMenuOpen, setNotificationsMenuOpen] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);

  // Edit Profile fields
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileCity, setProfileCity] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');

  const handleSignOut = async () => {
    await signOut();
    setDrawerOpen(false);
    setProfileMenuOpen(false);
    toast('Signed out successfully', 'success');
    navigate('/');
  };

  const openEditProfileModal = () => {
    setProfileName(user?.name ?? '');
    setProfilePhone(localStorage.getItem('homeseva.phone') ?? '6355042132');
    setProfileAddress(localStorage.getItem('homeseva.address') ?? 'abc');
    setProfileCity(localStorage.getItem('homeseva.city') ?? '');
    setProfilePassword('');
    setProfileAvatar(localStorage.getItem('homeseva.avatar') ?? '');
    setEditProfileModalOpen(true);
    setProfileMenuOpen(false);
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      toast('Full name is required', 'error');
      return;
    }

    try {
      if (user) {
        // Mock or actual user info save via backend
        const payload: any = { name: profileName };
        if (profilePassword) {
          payload.password = profilePassword;
        }
        await apiClient.updateUser(user.id, payload);
      }

      // Persist in local storage
      localStorage.setItem('homeseva.phone', profilePhone);
      localStorage.setItem('homeseva.address', profileAddress);
      localStorage.setItem('homeseva.city', profileCity);
      if (profileAvatar) {
        localStorage.setItem('homeseva.avatar', profileAvatar);
      }

      // Update Context
      updateUser({ name: profileName, avatar: profileAvatar });
      toast('Profile updated successfully!', 'success');
      setEditProfileModalOpen(false);
    } catch (err: any) {
      toast(err.message || 'Failed to update profile details', 'error');
    }
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
  
  const showBackButton = pathname !== '/';

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

          <div className="flex items-center gap-1.5 relative">
            <button
              onClick={toggle}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 active-scale transition"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {user ? (
              <>
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotificationsMenuOpen((v) => !v);
                      setProfileMenuOpen(false);
                    }}
                    className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 relative active-scale transition"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4.5 h-4.5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center border border-white dark:border-slate-900 select-none">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notificationsMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setNotificationsMenuOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className="absolute right-[-40px] sm:right-0 top-full mt-2.5 w-72 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl py-2 shadow-soft-lg z-50 text-left flex flex-col max-h-[350px]"
                        >
                          <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-900 dark:text-white">Notifications</span>
                            {unreadCount > 0 && (
                              <button
                                onClick={() => {
                                  markAllAsRead();
                                  toast('All notifications marked as read', 'success');
                                }}
                                className="text-[10px] text-brand-600 hover:underline font-semibold"
                              >
                                Mark all read
                              </button>
                            )}
                          </div>
                          <div className="flex-1 overflow-y-auto no-scrollbar py-1">
                            {notifications.length > 0 ? (
                              notifications.map((n) => (
                                <div
                                  key={n.id}
                                  onClick={() => {
                                    markAsRead(n.id);
                                    if (n.type === 'booking') {
                                      navigate('/dashboard?tab=bookings');
                                    }
                                    setNotificationsMenuOpen(false);
                                  }}
                                  className={`px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-850 transition cursor-pointer text-xs flex items-start gap-2.5 border-b border-gray-50/50 dark:border-slate-800/40 last:border-0 ${
                                    !n.read ? 'bg-brand-50/10 dark:bg-brand-950/10' : ''
                                  }`}
                                >
                                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-brand-600' : 'bg-transparent'}`} />
                                  <div className="flex-1">
                                    <p className={`font-bold ${!n.read ? 'text-gray-905 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{n.title}</p>
                                    <p className="text-[10px] text-gray-500 leading-normal mt-0.5">{n.message}</p>
                                    <span className="text-[9px] text-gray-400 mt-1 block">{n.time}</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-gray-500 text-center py-6">No notifications</p>
                            )}
                          </div>
                          <div className="px-4 py-2 border-t border-gray-100 dark:border-slate-800 text-center">
                            <Link
                              to="/dashboard?tab=notifications"
                              onClick={() => setNotificationsMenuOpen(false)}
                              className="text-[10px] text-brand-600 font-bold hover:underline"
                            >
                              See all notifications
                            </Link>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Circle Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setProfileMenuOpen((v) => !v);
                      setNotificationsMenuOpen(false);
                    }}
                    className="w-8 h-8 rounded-full border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition active-scale relative overflow-hidden focus:outline-none"
                    aria-label="Profile menu"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    )}
                  </button>

                  <AnimatePresence>
                    {profileMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className="absolute right-0 top-full mt-2.5 w-60 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl py-2 shadow-soft-lg z-50 text-left flex flex-col"
                        >
                          <div className="px-4 py-2.5 border-b border-gray-105 dark:border-slate-800">
                            <p className="text-xs font-black truncate text-gray-900 dark:text-white capitalize">{user.name}</p>
                            <p className="text-[10.5px] text-gray-450 truncate mt-0.5">{user.email}</p>
                          </div>
                          
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setProfileMenuOpen(false);
                                navigate('/dashboard?tab=bookings');
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition text-left font-semibold"
                            >
                              <Settings className="w-4 h-4 text-gray-400" />
                              <span>Account Dashboard</span>
                            </button>

                            <button
                              onClick={openEditProfileModal}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition text-left font-semibold"
                            >
                              <UserIcon className="w-4 h-4 text-gray-400" />
                              <span>Edit Profile</span>
                            </button>
                          </div>

                          <div className="pt-1.5 border-t border-gray-100 dark:border-slate-800">
                            <button
                              onClick={handleSignOut}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition text-left font-bold"
                            >
                              <LogOut className="w-4 h-4 text-red-500" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="text-xs font-extrabold bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-1.5 rounded-xl shadow-soft transition active-scale"
              >
                Sign In
              </Link>
            )}
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

              {/* Scrollable Drawer Body Content */}
              <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col min-h-0 gap-4 mt-2">
                {/* Profile Widget if Logged In */}
                {user && (
                  <div className="p-4 bg-brand-50/55 dark:bg-slate-800/50 rounded-2xl mb-2 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-gray-200 dark:border-slate-700 overflow-hidden shrink-0 bg-white dark:bg-slate-800 flex items-center justify-center">
                      {user.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-gray-450" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider text-left">Signed in as</p>
                      <p className="font-bold text-sm text-gray-905 dark:text-white mt-0.5 truncate text-left capitalize">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5 text-left">{user.email}</p>
                    </div>
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

                  <Link
                    to="/taxi"
                    onClick={() => setDrawerOpen(false)}
                    className="group flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-200 border border-transparent hover:border-brand-100/40 dark:hover:border-brand-900/30 hover:bg-brand-50/50 dark:hover:bg-slate-800/50 hover:shadow-soft hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all duration-200"
                  >
                    <Car className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:scale-110 transition-transform duration-200 shrink-0" />
                    <span className="group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors duration-200">Taxi Booking</span>
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
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-800 shrink-0">
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
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      {showBottomNav && (
        <nav className="fixed bottom-0 inset-x-0 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-gray-150 dark:border-slate-800/60 z-50 pb-[env(safe-area-inset-bottom)] select-none">
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

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditProfileModalOpen(false)}
              className="absolute inset-0 bg-gray-950/40 dark:bg-slate-950/70 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-soft-lg z-10 flex flex-col max-h-[90vh] overflow-hidden text-left"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
                <span className="font-extrabold text-sm text-gray-900 dark:text-white">Edit Profile</span>
                <button
                  onClick={() => setEditProfileModalOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-650 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
                {/* Circular Profile Avatar */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <input
                    type="file"
                    id="avatar-file-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setProfileAvatar(reader.result as string);
                          toast('Profile picture loaded! Save changes to apply.', 'success');
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <div className="w-full h-full rounded-full border-2 border-gray-150 bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 dark:text-gray-550 overflow-hidden">
                    {profileAvatar ? (
                      <img src={profileAvatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <UserIcon className="w-10 h-10" />
                    )}
                  </div>
                  <button
                    onClick={() => {
                      document.getElementById('avatar-file-upload')?.click();
                    }}
                    className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white dark:bg-slate-850 shadow border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 active-scale"
                    title="Change Avatar"
                    type="button"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-3.5">
                  {/* Name field */}
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-extrabold mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-150 dark:border-slate-805 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500 transition"
                    />
                  </div>

                  {/* Phone input with IN +91 selector */}
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-extrabold mb-1.5">Phone Number</label>
                    <div className="flex gap-2.5">
                      <div className="h-11 px-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-150 dark:border-slate-800 flex items-center text-xs font-bold text-gray-700 dark:text-gray-300 select-none">
                        IN +91
                      </div>
                      <input
                        type="text"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="6355042132"
                        className="flex-1 h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-slate-805/50 border border-gray-150 dark:border-slate-800 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500 transition"
                      />
                    </div>
                  </div>

                  {/* Address and City grid row */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-extrabold mb-1.5">Address</label>
                      <input
                        type="text"
                        value={profileAddress}
                        onChange={(e) => setProfileAddress(e.target.value)}
                        placeholder="abc"
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-150 dark:border-slate-800 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-extrabold mb-1.5">City</label>
                      <input
                        type="text"
                        value={profileCity}
                        onChange={(e) => setProfileCity(e.target.value)}
                        placeholder="Patan, Gujarat"
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-150 dark:border-slate-800 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500 transition"
                      />
                    </div>
                  </div>

                  {/* Change Password field */}
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-extrabold mb-1.5">Change Password</label>
                    <input
                      type="password"
                      value={profilePassword}
                      onChange={(e) => setProfilePassword(e.target.value)}
                      placeholder="Leave blank to keep current"
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-slate-805/50 border border-gray-150 dark:border-slate-800 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-end gap-3 shrink-0">
                <button
                  onClick={() => setEditProfileModalOpen(false)}
                  className="text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white px-4 py-2.5 transition active-scale select-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold px-5 py-2.5 rounded-2xl hover:bg-slate-900 dark:hover:bg-gray-100 transition shadow active-scale select-none cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ScrollRestoration />
    </div>
  );
}
