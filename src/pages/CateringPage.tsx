import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Plus, Check, Calendar, Users, Phone, MapPin, Sparkles, ArrowRight, ArrowLeft, Utensils, Clock, ShieldCheck, CreditCard, Home, Briefcase, Pencil, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { processUPIPayment } from '../services/razorpay';

interface CateringPackage {
  id: string;
  title: string;
  category: string;
  description: string;
  pax: string;
  price: number;
  image: string;
}

interface CateringRequest {
  id: string;
  package_title: string;
  guest_count: number;
  event_date: string;
  event_type: string;
  contact_phone: string;
  special_notes: string;
  status: string;
  total_estimated_price: number;
  created_at: string;
}

interface SavedAddress {
  id: string;
  type: 'HOME' | 'WORK' | 'OTHER';
  fullName: string;
  mobile: string;
  houseNo: string;
  street: string;
  landmark?: string;
  city: string;
  pincode: string;
  state: string;
}

const GALLERY_IMAGES = [
  { id: 1, title: 'Royal Wedding Buffet', category: 'Live Counter', image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800' },
  { id: 2, title: 'Authentic Gujarati Feast', category: 'Traditional', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800' },
  { id: 3, title: 'Gourmet Appetizer Station', category: 'Corporate', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800' },
  { id: 4, title: 'Festive Sweet & Dessert Counter', category: 'Sweets', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800' },
  { id: 5, title: 'Luxury Family Celebration', category: 'Family Dinner', image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=800' },
  { id: 6, title: 'Fresh Daily Meal Preparation', category: 'Daily Meals', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800' },
];

const CATEGORIES = ['All Packages', 'Catering', 'Daily Meals', 'Family Packages', 'Festival Specials'];
const FOOD_PREFERENCES = ['Gujarati', 'Punjabi', 'South Indian', 'Jain', 'Veg', 'Custom'];

const INITIAL_ADDRESSES: SavedAddress[] = [
  {
    id: 'addr_1',
    type: 'HOME',
    fullName: 'Valued Customer',
    mobile: '9876543210',
    houseNo: 'A-402, Shivshakti Towers',
    street: 'College Road, Civil Lines',
    landmark: 'Opp. Garden',
    city: 'Patan',
    pincode: '384265',
    state: 'Gujarat'
  }
];

export function CateringPage() {
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get('category') || 'All Packages';
  const navigate = useNavigate();
  const { user } = useAuth();

  // View state: 'catalog' for packages grid & tabs, 'request' for dedicated Food Arrangements Request Form
  const [viewMode, setViewMode] = useState<'catalog' | 'request'>('catalog');
  const [activeTab, setActiveTab] = useState<'CATERING PACKAGES' | 'GALLERY' | 'MY REQUESTS'>('CATERING PACKAGES');
  const [activeCategory, setActiveCategory] = useState<string>(initialCat);
  const [packages, setPackages] = useState<CateringPackage[]>([]);
  const [requests, setRequests] = useState<CateringRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Address management modal state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(() => {
    try {
      const stored = localStorage.getItem('user_saved_addresses');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore parse error
    }
    return INITIAL_ADDRESSES;
  });
  const [addressModalOpen, setAddressModalOpen] = useState<boolean>(false);
  const [addressModalMode, setAddressModalMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);

  // Address form inputs
  const [addrType, setAddrType] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');
  const [addrFullName, setAddrFullName] = useState<string>('');
  const [addrMobile, setAddrMobile] = useState<string>('');
  const [addrHouse, setAddrHouse] = useState<string>('');
  const [addrStreet, setAddrStreet] = useState<string>('');
  const [addrLandmark, setAddrLandmark] = useState<string>('');
  const [addrCity, setAddrCity] = useState<string>('Patan');
  const [addrPincode, setAddrPincode] = useState<string>('384265');
  const [addrState, setAddrState] = useState<string>('Gujarat');

  // Main Form states
  const [selectedPackage, setSelectedPackage] = useState<CateringPackage | null>(null);
  const [eventType, setEventType] = useState<string>('Birthday');
  const [deliveryAddress, setDeliveryAddress] = useState<string>(() => {
    const first = savedAddresses[0] || INITIAL_ADDRESSES[0];
    return `${first.houseNo}, ${first.street}, ${first.city} - ${first.pincode} (${first.type})`;
  });
  const [guestCount, setGuestCount] = useState<number>(50);
  const [eventDate, setEventDate] = useState<string>(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState<string>('1:00 PM');
  // Per user request: DO NOT pre-select Gujarati and Veg by default! Keep array empty initially.
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);
  const [totalBudget, setTotalBudget] = useState<number>(25000);
  const [notes, setNotes] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    if (viewMode === 'catalog') {
      fetchPackages();
      if (activeTab === 'MY REQUESTS') {
        fetchMyRequests();
      }
    }
  }, [activeCategory, activeTab, viewMode]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/catering/packages?category=${encodeURIComponent(activeCategory)}`);
      if (res.ok) {
        const data = await res.json();
        setPackages(data);
      }
    } catch (err) {
      console.error('Failed to load catering packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch('/api/catering/requests/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error('Failed to load catering requests:', err);
    }
  };

  const togglePreference = (pref: string) => {
    if (selectedPrefs.includes(pref)) {
      setSelectedPrefs(selectedPrefs.filter((p) => p !== pref));
    } else {
      setSelectedPrefs([...selectedPrefs, pref]);
    }
  };

  const handleGuestCountChange = (val: number) => {
    setGuestCount(val);
    if (selectedPackage) {
      const basePax = parseInt(selectedPackage.pax) || 1;
      const ratio = Math.max(1, Math.round(val / basePax));
      setTotalBudget(selectedPackage.price * ratio);
    } else {
      setTotalBudget(val * 500); // 500 per plate default quote
    }
  };

  const openRequestForm = (pkg: CateringPackage | null) => {
    setSelectedPackage(pkg);
    if (pkg) {
      setEventType(pkg.title);
      const parsedGuests = parseInt(pkg.pax) || 25;
      setGuestCount(parsedGuests);
      setTotalBudget(pkg.price);
    } else {
      setEventType('Birthday');
      setGuestCount(50);
      setTotalBudget(25000);
    }
    // Ensure preferences start clean and empty per request
    setSelectedPrefs([]);
    setViewMode('request');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Address Modal Helpers ──
  const handleOpenAddAddress = () => {
    setAddrType('HOME');
    setAddrFullName(user?.name || '');
    setAddrMobile((user as any)?.phone || '9876543210');
    setAddrHouse('');
    setAddrStreet('');
    setAddrLandmark('');
    setAddrCity('Patan');
    setAddrPincode('384265');
    setAddrState('Gujarat');
    setEditingAddrId(null);
    setAddressModalMode('add');
  };

  const handleOpenEditAddress = (addr: SavedAddress, e: React.MouseEvent) => {
    e.stopPropagation();
    setAddrType(addr.type);
    setAddrFullName(addr.fullName);
    setAddrMobile(addr.mobile);
    setAddrHouse(addr.houseNo);
    setAddrStreet(addr.street);
    setAddrLandmark(addr.landmark || '');
    setAddrCity(addr.city);
    setAddrPincode(addr.pincode);
    setAddrState(addr.state);
    setEditingAddrId(addr.id);
    setAddressModalMode('edit');
  };

  const handleDeleteAddress = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedAddresses.filter((a) => a.id !== id);
    setSavedAddresses(updated);
    try {
      localStorage.setItem('user_saved_addresses', JSON.stringify(updated));
    } catch (err) {}
  };

  const handleSaveAddressForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrHouse || !addrStreet || !addrCity || !addrPincode) {
      alert('Please fill in House/Flat no., Street, City and Pincode.');
      return;
    }
    const newAddr: SavedAddress = {
      id: editingAddrId || 'addr_' + Date.now(),
      type: addrType,
      fullName: addrFullName || 'Customer',
      mobile: addrMobile || '9876543210',
      houseNo: addrHouse,
      street: addrStreet,
      landmark: addrLandmark,
      city: addrCity,
      pincode: addrPincode,
      state: addrState,
    };

    let updatedList: SavedAddress[];
    if (editingAddrId) {
      updatedList = savedAddresses.map((a) => (a.id === editingAddrId ? newAddr : a));
    } else {
      updatedList = [newAddr, ...savedAddresses];
    }

    setSavedAddresses(updatedList);
    try {
      localStorage.setItem('user_saved_addresses', JSON.stringify(updatedList));
    } catch (err) {}

    // Set as current delivery address and close modal
    setDeliveryAddress(`${newAddr.houseNo}, ${newAddr.street}, ${newAddr.city} - ${newAddr.pincode} (${newAddr.type})`);
    if (newAddr.mobile) setPhone(newAddr.mobile);
    setAddressModalMode('list');
    setAddressModalOpen(false);
  };

  const handleSelectAddress = (addr: SavedAddress) => {
    setDeliveryAddress(`${addr.houseNo}, ${addr.street}, ${addr.city} - ${addr.pincode} (${addr.type})`);
    if (addr.mobile) setPhone(addr.mobile);
    setAddressModalOpen(false);
  };

  // ── Razorpay UPI Payment Integration ──
  const handleRazorpayPayment = async () => {
    if (!guestCount || guestCount < 1) {
      alert('Please enter a valid guest count (Pax).');
      return;
    }
    if (!totalBudget || totalBudget < 100) {
      alert('Please enter a valid budget amount.');
      return;
    }

    setSubmitting(true);

    const formattedAddress = {
      street: deliveryAddress,
      city: 'Patan',
      state: 'Gujarat',
      pincode: '384265',
      fullAddress: deliveryAddress,
    };

    const packageTitle = selectedPackage ? selectedPackage.title : `${eventType} Catering (${selectedPrefs.join(', ') || 'Custom'})`;

    processUPIPayment({
      productName: `Food Arrangement: ${packageTitle}`,
      productId: selectedPackage ? selectedPackage.id : 'cat_custom',
      amount: totalBudget,
      discount: 0,
      customerName: user?.name || 'Valued Catering Client',
      email: user?.email || 'client@homeseva.com',
      phoneNumber: phone || (user as any)?.phone || '9876543210',
      address: formattedAddress,
      bookingDate: eventDate,
      bookingTime: eventTime,
      onSuccess: async (resData) => {
        // Save confirmed booking directly to backend SQLite database
        try {
          const token = localStorage.getItem('token') || '';
          const res = await fetch('/api/catering/requests', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              package_id: selectedPackage ? selectedPackage.id : null,
              package_title: `${packageTitle} • PAID VIA RAZORPAY (#${resData?.booking?.razorpayPaymentId || 'UPI'})`,
              guest_count: guestCount,
              event_date: `${eventDate} at ${eventTime}`,
              event_type: eventType,
              contact_phone: phone || (user as any)?.phone || '9876543210',
              special_notes: `[Preferences: ${selectedPrefs.join(', ') || 'General'}] [Deliver To: ${deliveryAddress}] ${notes}`,
              total_estimated_price: totalBudget
            })
          });

          if (res.ok) {
            setSuccessMsg('Razorpay Payment Verified! Your food arrangements are confirmed.');
            setTimeout(() => {
              setSubmitting(false);
              setSuccessMsg('');
              setViewMode('catalog');
              setActiveTab('MY REQUESTS');
            }, 1500);
          } else {
            alert('Payment received but failed to record booking in server. Please contact support.');
            setSubmitting(false);
          }
        } catch (err) {
          console.error('Error saving catering request after payment:', err);
          setSubmitting(false);
        }
      },
      onFailure: (errMsg) => {
        setSubmitting(false);
        alert(`Razorpay Checkout Info: ${errMsg}`);
      }
    });
  };

  // ── RENDER DEDICATED REQUEST FORM VIEW ──
  if (viewMode === 'request') {
    return (
      <div className="min-h-screen bg-gray-50/70 dark:bg-slate-950 py-10 px-4 sm:px-8 lg:px-12 relative">
        <div className="max-w-4xl mx-auto">
          {/* Main Card Container */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-12 border border-gray-100/90 dark:border-slate-800 shadow-sm relative overflow-hidden"
          >
            {successMsg ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-green-50 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto shadow-sm border border-green-200 dark:border-green-500/30">
                  <Check className="w-10 h-10 stroke-[3]" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{successMsg}</h3>
                <p className="text-sm font-semibold text-gray-500">Redirecting to your confirmed bookings list...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-slate-800/80">
                  <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs border border-blue-100 dark:border-blue-500/30">
                      <ChefHat className="w-7 h-7 sm:w-8 sm:h-8" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                        Food Arrangements
                      </h1>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mt-1.5">
                        Custom catering and food curation for your premium events.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewMode('catalog')}
                    className="px-5 py-3 rounded-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/80 text-gray-700 dark:text-gray-300 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-2xs transition shrink-0 self-start sm:self-center"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Dashboard</span>
                  </button>
                </div>

                {/* ROW 1: EVENT TYPE & DELIVER TO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                      EVENT TYPE
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full h-14 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 text-gray-900 dark:text-white font-black text-base px-4 outline-none focus:border-blue-500 shadow-2xs transition"
                    >
                      <option value="Birthday">Birthday</option>
                      <option value="Wedding / Reception">Wedding / Reception</option>
                      <option value="Corporate Banquet & Party">Corporate Banquet & Party</option>
                      <option value="Anniversary Celebration">Anniversary Celebration</option>
                      <option value="Festival Puja & Feast">Festival Puja & Feast</option>
                      <option value="Family Get-Together">Family Get-Together</option>
                      <option value="Custom Bespoke Dinner">Custom Bespoke Dinner</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                      DELIVER TO
                    </label>
                    <div className="min-h-14 py-2 px-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-gray-200/80 dark:border-slate-700 flex items-center justify-between shadow-2xs gap-3">
                      <div className="flex items-center gap-3 flex-1 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">
                            DELIVERING TO
                          </span>
                          <p className="text-xs sm:text-sm font-black text-gray-900 dark:text-white truncate">
                            {deliveryAddress}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAddressModalMode('list');
                          setAddressModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-black text-xs tracking-wider uppercase transition shrink-0 shadow-2xs"
                      >
                        CHANGE
                      </button>
                    </div>
                  </div>
                </div>

                {/* ROW 2: GUESTS COUNT, DATE, TIME */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                      GUESTS COUNT
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 50"
                      value={guestCount || ''}
                      onChange={(e) => handleGuestCountChange(parseInt(e.target.value) || 0)}
                      className="w-full h-14 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 font-black text-base text-gray-900 dark:text-white outline-none focus:border-blue-500 shadow-2xs transition"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                      DATE
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full h-14 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 font-black text-base text-gray-900 dark:text-white outline-none focus:border-blue-500 shadow-2xs transition"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                      TIME
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1:00 PM"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full h-14 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 font-black text-base text-gray-900 dark:text-white outline-none focus:border-blue-500 shadow-2xs transition"
                    />
                  </div>
                </div>

                {/* ROW 3: FOOD PREFERENCES */}
                <div>
                  <label className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest block mb-3">
                    FOOD PREFERENCES
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {FOOD_PREFERENCES.map((pref) => {
                      const active = selectedPrefs.includes(pref);
                      return (
                        <button
                          key={pref}
                          type="button"
                          onClick={() => togglePreference(pref)}
                          className={`py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                            active
                              ? 'border-2 border-blue-500 bg-blue-50/90 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 shadow-sm scale-[1.02]'
                              : 'border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                          }`}
                        >
                          <span>{pref}</span>
                          {active && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ROW 4: TOTAL BUDGET (INR) & CONTACT PHONE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                      TOTAL BUDGET (INR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-lg text-blue-600 dark:text-blue-400">₹</span>
                      <input
                        type="number"
                        placeholder="e.g. 25000"
                        value={totalBudget || ''}
                        onChange={(e) => setTotalBudget(parseInt(e.target.value) || 0)}
                        className="w-full h-14 pl-9 pr-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 font-black text-lg text-blue-600 dark:text-blue-400 outline-none focus:border-blue-500 shadow-2xs transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                      CONTACT PHONE NUMBER
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-14 px-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 font-black text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 shadow-2xs transition"
                    />
                  </div>
                </div>

                {/* ROW 5: SPECIAL INSTRUCTIONS */}
                <div>
                  <label className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                    SPECIAL INSTRUCTIONS
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Dietary requirements, decoration needs, specific dishes, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-4.5 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 font-semibold text-xs sm:text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 outline-none focus:border-blue-500 shadow-2xs transition leading-relaxed"
                  />
                </div>

                {/* BOTTOM CONFIRMATION BUTTON WITH RAZORPAY */}
                <div className="pt-8 border-t border-gray-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-5">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-black tracking-wider uppercase mb-1">
                      <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                      <span>Razorpay Secure UPI & Cards Gateway</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                      Quoted Payable: <span className="text-blue-600 dark:text-blue-400 font-extrabold">₹{totalBudget.toLocaleString()}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleRazorpayPayment}
                    disabled={submitting}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black text-sm sm:text-base px-8 py-4 rounded-2xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/35 transition-all transform active:scale-95 flex items-center justify-center gap-3 shrink-0"
                  >
                    <CreditCard className="w-5 h-5 stroke-[2.5]" />
                    <span>{submitting ? 'Connecting Razorpay...' : 'Confirm & Pay via Razorpay'}</span>
                    <ArrowRight className="w-5 h-5 stroke-[3]" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── ADDRESS SELECTION / ADD MODAL (Matches Images 1 & 2) ── */}
        <AnimatePresence>
          {addressModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-[#FAF9F6] dark:bg-slate-900 rounded-[2.5rem] max-w-md w-full border border-gray-200/80 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              >
                {/* Modal Header */}
                <div className="p-6 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">
                    {addressModalMode === 'list' ? 'Delivery Address' : addressModalMode === 'add' ? 'New Address' : 'Edit Address'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setAddressModalOpen(false)}
                    className="w-9 h-9 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white flex items-center justify-center font-bold hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Modal Body: LIST MODE (Image 1) */}
                {addressModalMode === 'list' && (
                  <div className="p-6 overflow-y-auto space-y-6">
                    {/* Add New Address Dashed Button */}
                    <button
                      type="button"
                      onClick={handleOpenAddAddress}
                      className="w-full py-4 px-6 rounded-3xl border-2 border-dashed border-blue-400/80 bg-white/60 dark:bg-blue-500/10 hover:bg-blue-50/80 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-extrabold text-base sm:text-lg flex items-center justify-center gap-2.5 transition shadow-2xs"
                    >
                      <Plus className="w-6 h-6 stroke-[2.5]" />
                      <span>Add New Address</span>
                    </button>

                    <div className="space-y-3">
                      <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest block pl-1">
                        SAVED ADDRESSES
                      </span>

                      {savedAddresses.map((addr) => {
                        const Icon = addr.type === 'HOME' ? Home : addr.type === 'WORK' ? Briefcase : MapPin;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => handleSelectAddress(addr)}
                            className="bg-white dark:bg-slate-800/90 rounded-[2rem] p-6 border border-gray-200/70 dark:border-slate-700/80 shadow-xs hover:border-blue-500 hover:shadow-md transition cursor-pointer flex flex-col gap-2.5 relative group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5 text-gray-900 dark:text-white">
                                <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                <span className="font-extrabold text-lg capitalize">{addr.type.toLowerCase()}</span>
                              </div>
                              <div className="flex items-center gap-2.5 text-gray-400">
                                <button
                                  type="button"
                                  onClick={(e) => handleOpenEditAddress(addr, e)}
                                  className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-blue-600 flex items-center justify-center transition"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteAddress(addr.id, e)}
                                  className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-red-500 flex items-center justify-center transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium space-y-1 pl-1">
                              <p className="font-bold text-gray-800 dark:text-gray-200">{addr.houseNo}, {addr.street}</p>
                              {addr.landmark && <p className="text-gray-400 text-xs">{addr.landmark}</p>}
                              <p className="text-gray-500">{addr.city}, {addr.state} - <span className="font-extrabold">{addr.pincode}</span></p>
                              <p className="text-gray-500 pt-1">Phone: <span className="font-extrabold text-gray-700 dark:text-gray-200">{addr.mobile}</span></p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Modal Body: ADD / EDIT MODE (Image 2) */}
                {(addressModalMode === 'add' || addressModalMode === 'edit') && (
                  <form onSubmit={handleSaveAddressForm} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
                    {/* Segmented Address Type selector */}
                    <div className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl grid grid-cols-3 gap-1 mb-4 border border-gray-200/50 dark:border-slate-700">
                      {(['HOME', 'WORK', 'OTHER'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setAddrType(type)}
                          className={`py-2.5 rounded-xl font-extrabold text-xs tracking-wider uppercase transition ${
                            addrType === type
                              ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-xs scale-[1.02]'
                              : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-1.5">
                        FULL NAME *
                      </label>
                      <input
                        type="text"
                        required
                        value={addrFullName}
                        onChange={(e) => setAddrFullName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full h-11 px-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 font-bold text-sm outline-none focus:border-blue-500 shadow-2xs transition"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-1.5">
                        MOBILE NUMBER *
                      </label>
                      <input
                        type="tel"
                        required
                        value={addrMobile}
                        onChange={(e) => setAddrMobile(e.target.value)}
                        placeholder="Enter 10-digit mobile number"
                        className="w-full h-11 px-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 font-bold text-sm outline-none focus:border-blue-500 shadow-2xs transition"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-1.5">
                        HOUSE / FLAT NO. *
                      </label>
                      <input
                        type="text"
                        required
                        value={addrHouse}
                        onChange={(e) => setAddrHouse(e.target.value)}
                        placeholder="House / Flat / Block no."
                        className="w-full h-11 px-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 font-bold text-sm outline-none focus:border-blue-500 shadow-2xs transition"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-1.5">
                        STREET / AREA *
                      </label>
                      <input
                        type="text"
                        required
                        value={addrStreet}
                        onChange={(e) => setAddrStreet(e.target.value)}
                        placeholder="Street, area or society name"
                        className="w-full h-11 px-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 font-bold text-sm outline-none focus:border-blue-500 shadow-2xs transition"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-1.5">
                        LANDMARK (OPTIONAL)
                      </label>
                      <input
                        type="text"
                        value={addrLandmark}
                        onChange={(e) => setAddrLandmark(e.target.value)}
                        placeholder="Near hospital, bus stand, etc."
                        className="w-full h-11 px-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 font-medium text-sm outline-none focus:border-blue-500 shadow-2xs transition"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-1.5">
                          CITY *
                        </label>
                        <input
                          type="text"
                          required
                          value={addrCity}
                          onChange={(e) => setAddrCity(e.target.value)}
                          className="w-full h-11 px-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 font-bold text-sm outline-none focus:border-blue-500 shadow-2xs transition"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-1.5">
                          PINCODE *
                        </label>
                        <input
                          type="text"
                          required
                          value={addrPincode}
                          onChange={(e) => setAddrPincode(e.target.value)}
                          className="w-full h-11 px-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 font-extrabold text-sm outline-none focus:border-blue-500 shadow-2xs transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-1.5">
                        STATE *
                      </label>
                      <input
                        type="text"
                        required
                        value={addrState}
                        onChange={(e) => setAddrState(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 font-bold text-sm outline-none focus:border-blue-500 shadow-2xs transition"
                      />
                    </div>

                    <div className="pt-4 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setAddressModalMode('list')}
                        className="w-1/3 py-3.5 rounded-2xl border border-gray-300 dark:border-slate-700 text-gray-600 dark:text-gray-300 font-extrabold text-sm hover:bg-gray-100 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 transition active:scale-95 flex items-center justify-center"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── RENDER MAIN CATALOG & TABS VIEW ──
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 py-8 px-4 sm:px-8 lg:px-12">
      <div className="max-w-[1440px] mx-auto">
        {/* ── Top Hero Banner Container ── */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-10 border border-gray-100 dark:border-slate-800 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4 sm:gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs border border-blue-100 dark:border-blue-500/30">
                <ChefHat className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                  Food Arrangements
                </h1>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium mt-1">
                  Custom catering and food curation for your premium events.
                </p>
              </div>
            </div>
            <button
              onClick={() => openRequestForm(null)}
              className="bg-slate-950 dark:bg-blue-600 hover:bg-slate-900 dark:hover:bg-blue-700 text-white font-black text-sm sm:text-base px-6 py-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition active:scale-95 shrink-0"
            >
              <Plus className="w-5 h-5 text-blue-400 dark:text-white stroke-[3]" />
              <span>Request Catering</span>
            </button>
          </div>

          {/* ── Segmented Tab Bar ── */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800/80">
            <div className="bg-slate-100/90 dark:bg-slate-800/90 p-1.5 rounded-2xl w-fit flex flex-wrap gap-1 border border-gray-200/60 dark:border-slate-700">
              {(['CATERING PACKAGES', 'GALLERY', 'MY REQUESTS'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 sm:px-7 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm tracking-wider uppercase transition-all ${
                    activeTab === tab
                      ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-sm scale-[1.02]'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* ── Category Filter Pills (Visible in Packages Tab) ── */}
          {activeTab === 'CATERING PACKAGES' && (
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar pt-6">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-extrabold transition whitespace-nowrap ${
                    activeCategory === cat
                      ? 'border-2 border-blue-500 bg-blue-50/90 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Main Tab Contents ── */}
        <AnimatePresence mode="wait">
          {/* TAB 1: CATERING PACKAGES */}
          {activeTab === 'CATERING PACKAGES' && (
            <motion.div
              key="packages"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pb-16"
            >
              {loading ? (
                [1, 2, 3, 4, 5, 6].map((k) => (
                  <div key={k} className="h-[420px] bg-white dark:bg-slate-900 rounded-[2rem] animate-pulse border border-gray-100 dark:border-slate-800" />
                ))
              ) : packages.length === 0 ? (
                <div className="col-span-full bg-white dark:bg-slate-900 rounded-[2.5rem] py-20 text-center border border-gray-100 dark:border-slate-800 shadow-2xs">
                  <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-3 animate-bounce" />
                  <h3 className="text-lg font-black text-gray-800 dark:text-white">No catering packages available in this category</h3>
                  <p className="text-sm text-gray-500 mt-1">Check back soon or submit a custom catering request!</p>
                </div>
              ) : (
                packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100/90 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1 group"
                  >
                    <div className="relative overflow-hidden h-56 sm:h-64">
                      <img
                        src={pkg.image}
                        alt={pkg.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=600';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                    </div>

                    <div className="p-6 sm:p-7 flex flex-col flex-1">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg w-fit mb-3 border border-slate-200/60 dark:border-slate-700">
                        {pkg.category}
                      </span>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white leading-snug mb-2.5">
                        {pkg.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-4 leading-relaxed font-medium flex-1 mb-6">
                        {pkg.description}
                      </p>

                      <div className="pt-4 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-between mt-auto">
                        <div>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                            SERVES / BASE RATE
                          </span>
                          <div className="text-base sm:text-lg font-black text-gray-900 dark:text-white flex items-center">
                            {pkg.pax} <span className="mx-1.5 text-gray-400">•</span> ₹{pkg.price.toLocaleString()}
                          </div>
                        </div>

                        <button
                          onClick={() => openRequestForm(pkg)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-sm hover:shadow-md transition active:scale-95"
                        >
                          Book
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* TAB 2: GALLERY */}
          {activeTab === 'GALLERY' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-16"
            >
              {GALLERY_IMAGES.map((item) => (
                <div key={item.id} className="relative group rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-72 sm:h-80 border border-gray-100 dark:border-slate-800">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-8">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-600 text-white px-2.5 py-1 rounded-md w-fit mb-2">
                      {item.category}
                    </span>
                    <h4 className="text-lg sm:text-xl font-black text-white">{item.title}</h4>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* TAB 3: MY REQUESTS */}
          {activeTab === 'MY REQUESTS' && (
            <motion.div
              key="my-requests"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4 max-w-4xl mx-auto pb-16"
            >
              {requests.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] py-20 text-center border border-gray-100 dark:border-slate-800 shadow-2xs">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-xl font-black text-gray-800 dark:text-white">No catering requests booked yet</h3>
                  <p className="text-sm text-gray-500 mt-1">Your upcoming events and meal plans will be listed here with live status!</p>
                  <button
                    onClick={() => setActiveTab('CATERING PACKAGES')}
                    className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm px-7 py-3 rounded-2xl shadow-sm transition"
                  >
                    Browse Packages
                  </button>
                </div>
              ) : (
                requests.map((req) => (
                  <div key={req.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-slate-800 shadow-xs hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span className="px-3 py-1 bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400 font-black text-xs uppercase tracking-wider rounded-lg border border-green-200 dark:border-green-500/30 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> {req.status}
                        </span>
                        <span className="text-xs text-gray-400 font-bold">• ID: #{req.id.slice(-6)}</span>
                      </div>
                      <h4 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">{req.package_title}</h4>
                      <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-blue-500" /> Event Date: {req.event_date}</span>
                        <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-blue-500" /> Guests: {req.guest_count} Pax</span>
                      </div>
                      {req.special_notes && (
                        <p className="text-xs text-gray-500 italic bg-gray-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-gray-200/60 dark:border-slate-700/60">
                          "{req.special_notes}"
                        </p>
                      )}
                    </div>

                    <div className="sm:text-right shrink-0 pt-4 sm:pt-0 border-t sm:border-0 border-gray-100 dark:border-slate-800">
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">Estimated Total</span>
                      <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">₹{req.total_estimated_price.toLocaleString()}</div>
                      <span className="text-[10px] text-emerald-600 font-extrabold block mt-1">Catering Pro Assigned</span>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
