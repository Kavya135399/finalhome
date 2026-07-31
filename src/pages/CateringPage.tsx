import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChefHat,
  Plus,
  Minus,
  Check,
  Calendar,
  Users,
  Phone,
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Utensils,
  Clock,
  ShieldCheck,
  CreditCard,
  Home,
  Briefcase,
  Pencil,
  Trash2,
  X,
  Search,
  Flame,
  Star,
  Heart,
  Share2,
  Filter,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Info,
  CheckCircle2,
  FileText,
  RotateCcw,
  Sparkle,
  Truck,
  Package,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { processUPIPayment } from '../services/razorpay';

export interface MealItem {
  id: string;
  name: string;
  category: string;
  caterer: string;
  foodType: 'veg' | 'nonveg' | 'jain';
  rating: number;
  reviews: number;
  prepTime: string;
  calories: number;
  serves: string;
  price: number;
  originalPrice: number;
  image: string;
  description: string;
  popular?: boolean;
  bestseller?: boolean;
  discountBadge?: string;
  ingredients: string[];
  nutrition: { calories: number; protein: string; carbs: string; fat: string };
  spiceLevel: 'Mild' | 'Medium' | 'Spicy';
}

export interface CateringPackage {
  id: string;
  title: string;
  category: string;
  description: string;
  pax: string;
  price: number;
  image: string;
  menuHighlights: string[];
}

export interface CateringRequest {
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

const SAMPLE_MEALS: MealItem[] = [
  {
    id: 'm1',
    name: 'Kathiyawadi Gourmet Gujarati Thali',
    category: 'Gujarati',
    caterer: 'MasterChef Rajesh Kumar',
    foodType: 'veg',
    rating: 4.9,
    reviews: 1240,
    prepTime: '25 min',
    calories: 480,
    serves: '1 Person',
    price: 199,
    originalPrice: 250,
    discountBadge: '20% OFF',
    popular: true,
    bestseller: true,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800',
    description: 'Authentic Kathiyawadi thali featuring Sev Tameta, Ringan Bharta, Phulka Roti, Dal Rice, and Fresh Chaas.',
    ingredients: ['Paneer', 'Cashews', 'Ghee', 'Pure Spices', 'Basmati Rice', 'Curd'],
    nutrition: { calories: 480, protein: '16g', carbs: '62g', fat: '18g' },
    spiceLevel: 'Medium',
  },
  {
    id: 'm2',
    name: 'Royal Punjabi Butter Paneer & Naan Combo',
    category: 'North Indian',
    caterer: 'Amritsari Tadka Caterers',
    foodType: 'veg',
    rating: 4.8,
    reviews: 980,
    prepTime: '30 min',
    calories: 620,
    serves: '1-2 Persons',
    price: 249,
    originalPrice: 299,
    discountBadge: 'POPULAR',
    popular: true,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800',
    description: 'Rich Creamy Shahi Paneer Butter Masala served with 2 Butter Garlic Naan and Jeera Rice.',
    ingredients: ['Fresh Cottage Cheese', 'Butter', 'Tomato Gravy', 'Garlic', 'Basmati Rice'],
    nutrition: { calories: 620, protein: '22g', carbs: '70g', fat: '28g' },
    spiceLevel: 'Mild',
  },
  {
    id: 'm3',
    name: 'Healthy Protein Quinoa & Grilled Veggie Bowl',
    category: 'Healthy Meals',
    caterer: 'NutriFit Kitchens',
    foodType: 'veg',
    rating: 4.9,
    reviews: 650,
    prepTime: '15 min',
    calories: 380,
    serves: '1 Person',
    price: 220,
    originalPrice: 280,
    discountBadge: 'HEALTHY',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
    description: 'High-protein organic quinoa bowl topped with avocado, roasted chickpeas, broccoli, and lemon tahini dressing.',
    ingredients: ['Organic Quinoa', 'Avocado', 'Broccoli', 'Chickpeas', 'Tahini'],
    nutrition: { calories: 380, protein: '18g', carbs: '45g', fat: '12g' },
    spiceLevel: 'Mild',
  },
  {
    id: 'm4',
    name: 'South Indian Mini Tiffin Feast',
    category: 'South Indian',
    caterer: 'Madras Special Tiffin',
    foodType: 'veg',
    rating: 4.7,
    reviews: 1120,
    prepTime: '20 min',
    calories: 410,
    serves: '1 Person',
    price: 175,
    originalPrice: 220,
    discountBadge: '15% OFF',
    bestseller: true,
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&q=80&w=800',
    description: 'Assorted 2 Ghee Mini Idlis, 1 Medu Vada, Mini Masala Dosa, Piping Hot Sambar & 3 Chutneys.',
    ingredients: ['Fermented Rice & Lentil Batter', 'Pure Ghee', 'Fresh Coconut', 'Curry Leaves'],
    nutrition: { calories: 410, protein: '14g', carbs: '65g', fat: '10g' },
    spiceLevel: 'Medium',
  },
  {
    id: 'm5',
    name: 'Family Celebration Meal Box (Serves 4-5)',
    category: 'Family Pack',
    caterer: 'HomeSeva Signature Kitchen',
    foodType: 'veg',
    rating: 4.9,
    reviews: 2150,
    prepTime: '40 min',
    calories: 1200,
    serves: '4-5 Persons',
    price: 799,
    originalPrice: 999,
    discountBadge: 'SAVE ₹200',
    popular: true,
    bestseller: true,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=800',
    description: 'Grand family feast box: Paneer Tikka Masala, Dal Makhani, 8 Butter Phulkas, Veg Pulao, Gulab Jamun & Salad.',
    ingredients: ['Paneer', 'Black Lentils', 'Basmati Rice', 'Whole Wheat', 'Khoya'],
    nutrition: { calories: 1200, protein: '48g', carbs: '140g', fat: '52g' },
    spiceLevel: 'Medium',
  },
  {
    id: 'm6',
    name: 'Jain Shuddh Special Satvik Thali',
    category: 'Jain',
    caterer: 'Satvik Pure Jain Caterers',
    foodType: 'jain',
    rating: 4.9,
    reviews: 890,
    prepTime: '25 min',
    calories: 450,
    serves: '1 Person',
    price: 210,
    originalPrice: 260,
    discountBadge: 'PURE SATVIK',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
    description: 'No onion, no garlic, 100% Jain Satvik thali with Gatte ki Sabzi, Paneer Makhhania, Phulkas, and Kheer.',
    ingredients: ['Gram Flour Gatta', 'Fresh Cottage Cheese', 'Cow Ghee', 'Cumin', 'Rock Salt'],
    nutrition: { calories: 450, protein: '17g', carbs: '58g', fat: '16g' },
    spiceLevel: 'Mild',
  },
];

const CATEGORIES = [
  'All',
  'Daily Meals',
  'Healthy Meals',
  'Family Pack',
  'Catering',
  'Birthday',
  'Wedding',
  'Corporate',
  'Tiffin',
  'Gujarati',
  'Fast Food',
  'Diet Meals',
  'South Indian',
  'North Indian',
  'Chinese',
  'Jain',
];

const CAT_EMOJI: Record<string, string> = {
  All: '🛒',
  'Daily Meals': '🍛',
  'Healthy Meals': '🥗',
  'Family Pack': '👨‍👩‍👧',
  Catering: '🎉',
  Birthday: '🥳',
  Wedding: '💍',
  Corporate: '🏢',
  Tiffin: '🍱',
  Gujarati: '🥘',
  'Fast Food': '🍕',
  'Diet Meals': '🥗',
  'South Indian': '🍛',
  'North Indian': '🥙',
  Chinese: '🍜',
  Jain: '🟡',
  Favorites: '❤️',
};

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
    state: 'Gujarat',
  },
];

export function CateringPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'MEALS' | 'CATERING PACKAGES' | 'MY REQUESTS'>('MEALS');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [foodTypeFilter, setFoodTypeFilter] = useState<'all' | 'veg' | 'nonveg' | 'jain'>('all');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedMealModal, setSelectedMealModal] = useState<MealItem | null>(null);
  const [selectedSpice, setSelectedSpice] = useState<'Mild' | 'Medium' | 'Spicy'>('Medium');

  // Meal Cart state
  const [mealCart, setMealCart] = useState<{ meal: MealItem; qty: number }[]>(() => {
    try {
      const stored = localStorage.getItem('homeseva_meal_cart');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [cartStep, setCartStep] = useState<number>(1);
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('homeseva_meal_cart', JSON.stringify(mealCart));
    } catch (e) {}
  }, [mealCart]);

  const addToMealCart = (meal: MealItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMealCart((prev) => {
      const existing = prev.find((item) => item.meal.id === meal.id);
      if (existing) {
        return prev.map((item) => (item.meal.id === meal.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { meal, qty: 1 }];
    });
    toast(`${meal.name} added to cart!`, 'success');
  };

  const updateMealQty = (mealId: string, delta: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMealCart((prev) => {
      return prev
        .map((item) => {
          if (item.meal.id === mealId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { meal: MealItem; qty: number }[];
    });
  };

  const cartCount = mealCart.reduce((sum, item) => sum + item.qty, 0);
  const cartSubtotal = mealCart.reduce((sum, item) => sum + item.meal.price * item.qty, 0);
  const cartDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const cartDeliveryFee = cartSubtotal >= 500 || cartSubtotal === 0 ? 0 : 40;
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount + cartDeliveryFee);

  const applyMealCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'FIRST50') {
      const disc = Math.min(100, Math.round(cartSubtotal * 0.5));
      setAppliedCoupon({ code: 'FIRST50', discount: disc });
      toast('50% Discount Applied!', 'success');
    } else if (code === 'CLEAN20' || code === 'HOMESEVA10') {
      const disc = Math.round(cartSubtotal * 0.2);
      setAppliedCoupon({ code: 'CLEAN20', discount: disc });
      toast('20% Discount Applied!', 'success');
    } else {
      toast('Invalid Coupon. Try FIRST50 or CLEAN20', 'error');
    }
  };

  // Catering Wizard View state
  const [viewMode, setViewMode] = useState<'catalog' | 'request'>('catalog');
  const [selectedPackage, setSelectedPackage] = useState<CateringPackage | null>(null);
  const [eventType, setEventType] = useState<string>('Birthday');
  const [guestCount, setGuestCount] = useState<number>(50);
  const [eventDate, setEventDate] = useState<string>(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState<string>('1:00 PM');
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);
  const [totalBudget, setTotalBudget] = useState<number>(25000);
  const [notes, setNotes] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Address
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(() => {
    try {
      const stored = localStorage.getItem('user_saved_addresses');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return INITIAL_ADDRESSES;
  });
  const [deliveryAddress, setDeliveryAddress] = useState<string>(() => {
    const first = savedAddresses[0] || INITIAL_ADDRESSES[0];
    return `${first.houseNo}, ${first.street}, ${first.city} - ${first.pincode} (${first.type})`;
  });

  const [requests, setRequests] = useState<CateringRequest[]>([]);
  const [dbMeals, setDbMeals] = useState<MealItem[]>(SAMPLE_MEALS);

  useEffect(() => {
    fetchMealsFromApi();
  }, [activeCategory, foodTypeFilter]);

  const fetchMealsFromApi = async () => {
    try {
      let url = `/api/meals?food_type=${foodTypeFilter}`;
      if (activeCategory !== 'All' && activeCategory !== 'Favorites') {
        url += `&category=${encodeURIComponent(activeCategory)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setDbMeals(data);
        }
      }
    } catch (e) {
      console.error('API fetch error for meals:', e);
    }
  };

  useEffect(() => {
    if (activeTab === 'MY REQUESTS') {
      fetchMyRequests();
    }
  }, [activeTab]);

  const fetchMyRequests = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch('/api/catering/requests/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (e) {
      console.error('Failed to load catering requests', e);
    }
  };

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter((i) => i !== id));
      toast('Item removed from Wishlist', 'info');
    } else {
      setWishlist([...wishlist, id]);
      toast('Added to Wishlist ❤️', 'success');
    }
  };

  const openRequestForm = (pkg: CateringPackage | null) => {
    if (pkg) {
      setSelectedPackage(pkg);
      setEventType(pkg.category);
      const parsedGuests = parseInt(pkg.pax) || 50;
      setGuestCount(parsedGuests);
      setTotalBudget(pkg.price);
    } else {
      setEventType('Birthday Party');
      setGuestCount(50);
      setTotalBudget(25000);
    }
    setSelectedPrefs([]);
    setViewMode('request');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered Meals list
  const filteredMeals = dbMeals.filter((m) => {
    if (activeCategory === 'Favorites') {
      return wishlist.includes(m.id) && (!searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    const matchesSearch =
      !searchQuery ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.caterer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = activeCategory === 'All' || m.category.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesFoodType = foodTypeFilter === 'all' || m.foodType === foodTypeFilter;

    return matchesSearch && matchesCategory && matchesFoodType;
  });

  // Razorpay Catering Booking
  const handleRazorpayPayment = async () => {
    if (!guestCount || guestCount < 1) {
      toast('Please enter a valid guest count.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await processUPIPayment({
        productName: selectedPackage ? selectedPackage.title : `Custom ${eventType} Catering (${guestCount} Guests)`,
        productId: selectedPackage ? selectedPackage.id : 'custom_catering',
        amount: totalBudget,
        discount: 0,
        customerName: user?.name || 'Valued Customer',
        email: user?.email || 'customer@homeseva.com',
        phoneNumber: phone || (user as any)?.phone || '9876543210',
        address: { fullAddress: deliveryAddress },
        showAllMethods: false,
        onSuccess: async (meta) => {
          const token = localStorage.getItem('token') || '';
          await fetch('/api/catering/requests', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              package_id: selectedPackage?.id || null,
              package_title: selectedPackage ? selectedPackage.title : `${eventType} Catering (${guestCount} Guests)`,
              guest_count: guestCount,
              event_date: eventDate,
              event_type: eventType,
              contact_phone: phone,
              special_notes: notes,
              total_estimated_price: totalBudget,
            }),
          });

          toast('Catering Request Paid & Confirmed via Razorpay!', 'success');
          setSubmitting(false);
          setViewMode('catalog');
          setActiveTab('MY REQUESTS');
          fetchMyRequests();
        },
        onFailure: (errMsg) => {
          toast(errMsg, 'error');
          setSubmitting(false);
        },
      });
    } catch (err: any) {
      toast(err.message || 'Payment initiation failed', 'error');
      setSubmitting(false);
    }
  };

  // ── Render Card Component matching StorePage ──
  const MealCard = ({ meal }: { meal: MealItem }) => {
    const inCart = mealCart.find((i) => i.meal.id === meal.id);
    const qty = inCart ? inCart.qty : 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-150 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col"
      >
        <div className="relative cursor-pointer" onClick={() => setSelectedMealModal(meal)}>
          <img
            src={meal.image}
            alt={meal.name}
            className="w-full h-36 sm:h-40 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';
            }}
          />
          {meal.discountBadge && (
            <span className="absolute top-2 left-2 bg-amber-500 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
              {meal.discountBadge}
            </span>
          )}
          <button
            onClick={(e) => toggleWishlist(meal.id, e)}
            className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-xs z-10 hover:scale-110 transition"
          >
            <Heart className={`w-4 h-4 ${wishlist.includes(meal.id) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
          </button>
        </div>

        <div className="p-3 flex flex-col flex-1">
          <p className="text-[9px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider mb-0.5">
            {meal.category}
          </p>
          <h4 className="font-extrabold text-xs text-gray-900 dark:text-white leading-snug line-clamp-2 flex-1">
            {meal.name}
          </h4>

          <div className="flex items-center gap-1 mt-1 mb-2">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-[9px] text-gray-500 font-semibold">{meal.rating}</span>
            <span className="text-gray-300 mx-0.5">•</span>
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-[9px] text-gray-500">{meal.prepTime}</span>
          </div>

          <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-slate-800/60">
            <span className="font-black text-sm text-gray-900 dark:text-white">₹{meal.price}</span>
            {qty === 0 ? (
              <button
                onClick={(e) => addToMealCart(meal, e)}
                className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black px-3 py-1.5 rounded-xl transition active:scale-95 shadow-2xs"
              >
                <Plus className="w-3 h-3" /> ADD
              </button>
            ) : (
              <div className="flex items-center gap-1 bg-amber-600 rounded-xl px-1.5 py-1 text-white">
                <button onClick={(e) => updateMealQty(meal.id, -1, e)} className="w-4 h-4 flex items-center justify-center font-black">
                  <Minus className="w-2.5 h-2.5" />
                </button>
                <span className="font-black text-xs min-w-[12px] text-center">{qty}</span>
                <button onClick={(e) => updateMealQty(meal.id, 1, e)} className="w-4 h-4 flex items-center justify-center font-black">
                  <Plus className="w-2.5 h-2.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // Catering Wizard View
  if (viewMode === 'request') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setViewMode('catalog')}
            className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Meals & Catering
          </button>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-8">
            <div className="border-b border-gray-100 dark:border-slate-800 pb-6">
              <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest block mb-1">
                Custom Catering Calculator
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                {selectedPackage ? selectedPackage.title : 'Configure Event Catering'}
              </h2>
            </div>

            {/* Guest Slider */}
            <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-600" /> Guest Count (Pax)
                </label>
                <span className="text-xl font-black text-amber-600">{guestCount} Guests</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="5"
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
            </div>

            {/* Payment Summary */}
            <div className="p-6 rounded-2xl bg-amber-50/50 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Estimated Total Budget</span>
                <p className="text-3xl font-black text-amber-600">₹{totalBudget.toLocaleString()}</p>
              </div>
              <button
                onClick={handleRazorpayPayment}
                disabled={submitting}
                className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-sm shadow-lg active:scale-95 transition flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                <span>{submitting ? 'Initializing Gateway...' : 'Pay & Confirm Catering via Razorpay'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main Render matching StorePage layout 100%!
  return (
    <div className="flex flex-col flex-1 bg-gray-50 dark:bg-slate-950 min-h-screen pb-28 select-none">
      {/* ── Sticky Header matching StorePage ── */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800/60 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-4 pb-3.5">
          <div className="flex items-center justify-between mb-3">
            {/* Left Location */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600 shrink-0 drop-shadow-2xs" />
              <div className="flex flex-col justify-center">
                <span className="text-[11px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 leading-tight">
                  Delivering to
                </span>
                <h2 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white leading-snug tracking-tight">
                  Patan, Gujarat
                </h2>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setActiveTab('MY REQUESTS')}
                className="px-3.5 py-2 rounded-xl border border-amber-200 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition shadow-2xs flex items-center gap-1.5"
              >
                <Package className="w-4 h-4 text-amber-600" />
                <span>My Orders</span>
              </button>
              <button
                onClick={() => cartCount > 0 && setIsCartOpen(true)}
                className="relative w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition border border-gray-200 dark:border-slate-700/80"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative mb-3.5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search meals, caterers, Gujarati thali..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 sm:h-12 pl-11 pr-4 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-sm font-medium text-gray-800 dark:text-white placeholder-gray-400 outline-none focus:border-amber-500 focus:bg-white transition shadow-xs"
            />
          </div>

          {/* Category Pills matching StorePage */}
          <div className="flex gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar pb-1.5">
            <button
              onClick={() => setActiveCategory('Favorites')}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold border transition whitespace-nowrap ${
                activeCategory === 'Favorites'
                  ? 'bg-red-500 text-white border-red-500 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-red-500 border-red-100 dark:border-slate-700 hover:border-red-300'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${activeCategory === 'Favorites' ? 'fill-white' : 'fill-red-500'}`} />
              <span>Favorites</span>
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold border transition whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-gray-300'
                }`}
              >
                <span>{CAT_EMOJI[cat] || '🍛'}</span>
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content Grid matching StorePage ── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-6 flex-1 w-full">
        {activeTab === 'MEALS' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                {activeCategory} Dishes ({filteredMeals.length})
              </h3>

              {/* Dietary Filter Pill */}
              <div className="flex items-center gap-1.5">
                {(['all', 'veg', 'nonveg', 'jain'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFoodTypeFilter(type)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition ${
                      foodTypeFilter === type
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-gray-500 border border-gray-200 dark:border-slate-800'
                    }`}
                  >
                    {type === 'veg' ? '🟢 Veg' : type === 'nonveg' ? '🔴 Non-Veg' : type === 'jain' ? '🟡 Jain' : 'All'}
                  </button>
                ))}
              </div>
            </div>

            {filteredMeals.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-gray-150 dark:border-slate-800">
                <Utensils className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-500">No dishes found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
                {filteredMeals.map((meal) => (
                  <MealCard key={meal.id} meal={meal} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Catering Requests List */}
        {activeTab === 'MY REQUESTS' && (
          <div className="max-w-3xl mx-auto space-y-4">
            {requests.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-gray-150 dark:border-slate-800">
                <Utensils className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h4 className="text-sm font-black text-gray-900 dark:text-white">No active orders or catering requests</h4>
                <p className="text-xs text-gray-500 mt-1">Order meals to track your delivery status in real-time!</p>
              </div>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-150 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                      ✓ {req.status}
                    </span>
                    <h4 className="font-extrabold text-sm text-gray-900 dark:text-white mt-1">{req.package_title}</h4>
                    <p className="text-xs text-gray-500">Date: {req.event_date} • Guests: {req.guest_count} Pax</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-amber-600">₹{req.total_estimated_price.toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── FLOATING CART BAR MATCHING STORE PAGE ── */}
      <AnimatePresence>
        {cartCount > 0 && activeTab === 'MEALS' && !isCartOpen && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-40"
          >
            <div
              onClick={() => {
                setCartStep(1);
                setIsCartOpen(true);
              }}
              className="bg-amber-600 hover:bg-amber-500 text-white rounded-2xl px-5 py-3 shadow-xl border border-white/20 flex items-center justify-between cursor-pointer active:scale-95 transition"
            >
              <div className="flex items-center gap-2 text-xs font-black">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                  {cartCount}
                </span>
                <span>View Cart</span>
              </div>
              <span className="font-black text-sm">₹{cartTotal.toLocaleString()} ›</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 4-STEP MEAL CHECKOUT SHEET (z-[1000]) ── */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-slate-700 rounded-full mx-auto mt-3 mb-1 shrink-0" />

              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <div>
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block">Meal Checkout</span>
                  <h3 className="text-base font-black text-gray-900 dark:text-white">
                    {cartStep === 1 ? '① Review Items' : cartStep === 2 ? '② Address' : cartStep === 3 ? '③ Summary' : '④ Payment'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 overflow-y-auto space-y-4">
                {cartStep === 1 && (
                  <div className="space-y-3">
                    {mealCart.map(({ meal, qty }) => (
                      <div key={meal.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <img src={meal.image} alt={meal.name} className="w-12 h-12 rounded-lg object-cover" />
                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{meal.name}</p>
                            <span className="text-xs text-amber-600 font-black">₹{meal.price} × {qty}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-600 rounded-xl px-1.5 py-1 text-white">
                          <button onClick={() => updateMealQty(meal.id, -1)} className="w-4 h-4 flex items-center justify-center font-black">-</button>
                          <span className="font-black text-xs min-w-[12px] text-center">{qty}</span>
                          <button onClick={() => updateMealQty(meal.id, 1)} className="w-4 h-4 flex items-center justify-center font-black">+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {cartStep === 2 && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-gray-500 uppercase block">Delivery Address</span>
                    <div className="p-4 rounded-xl border-2 border-amber-500 bg-amber-50/50 text-xs font-bold text-gray-900 dark:text-white">
                      📍 {deliveryAddress}
                    </div>
                  </div>
                )}

                {(cartStep === 3 || cartStep === 4) && (
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 space-y-2 text-xs">
                    <div className="flex justify-between font-bold text-gray-600 dark:text-gray-400">
                      <span>Subtotal</span>
                      <span>₹{cartSubtotal}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-600 dark:text-gray-400">
                      <span>Delivery Fee</span>
                      <span>{cartDeliveryFee === 0 ? 'FREE' : `₹${cartDeliveryFee}`}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-slate-700 font-black text-sm text-gray-900 dark:text-white">
                      <span>Total Amount</span>
                      <span className="text-amber-600">₹{cartTotal}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
                <span className="text-lg font-black text-amber-600">₹{cartTotal}</span>
                <div className="flex items-center gap-2">
                  {cartStep > 1 && (
                    <button onClick={() => setCartStep(cartStep - 1)} className="px-4 h-11 rounded-xl border border-gray-200 text-xs font-bold">
                      Back
                    </button>
                  )}
                  {cartStep < 4 ? (
                    <button onClick={() => setCartStep(cartStep + 1)} className="px-6 h-11 rounded-xl bg-amber-600 text-white font-black text-xs">
                      Continue ➔
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        processUPIPayment({
                          productName: `HomeSeva Meal Order (${cartCount} items)`,
                          productId: 'meal_order',
                          amount: cartTotal,
                          discount: 0,
                          customerName: user?.name || 'Valued Customer',
                          email: user?.email || 'customer@homeseva.com',
                          phoneNumber: '9876543210',
                          address: { fullAddress: deliveryAddress },
                          showAllMethods: false,
                          onSuccess: () => {
                            toast('Meal order paid & confirmed via Razorpay!', 'success');
                            setMealCart([]);
                            setIsCartOpen(false);
                            setActiveTab('MY REQUESTS');
                          },
                          onFailure: (err) => toast(err, 'error'),
                        });
                      }}
                      className="px-6 h-11 rounded-xl bg-amber-600 text-white font-black text-xs flex items-center gap-1"
                    >
                      📱 Pay via Razorpay UPI
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick View Modal */}
      <AnimatePresence>
        {selectedMealModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 pb-20">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedMealModal(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
              <div className="relative h-48 overflow-hidden shrink-0">
                <img src={selectedMealModal.image} alt={selectedMealModal.name} className="w-full h-full object-cover" />
                <button onClick={() => setSelectedMealModal(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 flex-1 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">{selectedMealModal.name}</h3>
                  <span className="font-black text-amber-600 text-lg">₹{selectedMealModal.price}</span>
                </div>
                <p className="text-xs text-gray-500">{selectedMealModal.description}</p>
                <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-xl grid grid-cols-4 gap-2 text-center text-xs">
                  <div><span className="text-[9px] text-gray-400 font-bold block">CALORIES</span><span className="font-bold">{selectedMealModal.nutrition.calories} kcal</span></div>
                  <div><span className="text-[9px] text-gray-400 font-bold block">PROTEIN</span><span className="font-bold">{selectedMealModal.nutrition.protein}</span></div>
                  <div><span className="text-[9px] text-gray-400 font-bold block">CARBS</span><span className="font-bold">{selectedMealModal.nutrition.carbs}</span></div>
                  <div><span className="text-[9px] text-gray-400 font-bold block">FAT</span><span className="font-bold">{selectedMealModal.nutrition.fat}</span></div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-slate-800">
                <button onClick={(e) => { addToMealCart(selectedMealModal, e); setSelectedMealModal(null); }} className="w-full bg-amber-600 text-white font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-2">
                  <ShoppingBag className="w-4 h-4" /> Add to Cart • ₹{selectedMealModal.price}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
