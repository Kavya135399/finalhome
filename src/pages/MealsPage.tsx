import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChefHat, Utensils, Plus, Minus, Check, Calendar, Users, Phone, MapPin,
  Sparkles, ArrowRight, ArrowLeft, Clock, ShieldCheck, CreditCard,
  Heart, ShoppingCart, Search, UtensilsCrossed, CookingPot
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

import axios from 'axios';
import { apiClient } from '../services/apiClient';
import { loadRazorpayScript } from '../services/razorpay';
import {
  ChevronLeft, ChevronRight, Tag, X, Package, Trash2, Copy, Upload, AlertCircle, QrCode, Smartphone, Truck, RefreshCw, Star
} from 'lucide-react';


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
    caterer: 'Bhale Padharya Signature Kitchen',
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

const CATEGORIES = ['All', 'Daily Meals', 'Healthy Meals', 'Family Pack', 'Gujarati', 'North Indian', 'South Indian', 'Jain'];
const CAT_EMOJI: Record<string, string> = { All: '🍛', 'Daily Meals': '🍱', 'Healthy Meals': '🥗', 'Family Pack': '👨‍👩‍👧‍👦', Gujarati: '🫓', 'North Indian': '🥘', 'South Indian': '🫓', Jain: '🟡' };


type Sheet = 'none' | 'cart' | 'checkout' | 'address' | 'review' | 'payment' | 'success';

const PAYMENT_METHODS = [
  { id: 'phonepe', label: 'PhonePe Payment Gateway', icon: '🟣', desc: 'Pay via PhonePe', available: true },
  { id: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when delivered', available: false },
  { id: 'card', label: 'Credit/Debit Card', icon: '💳', desc: 'Pay via Card', available: false },
];
const TRACKING_STAGES = [
  { key: 'order_placed', label: 'Order Placed', icon: '📦' },
  { key: 'payment_verification', label: 'Payment Verification', icon: '🔍' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅' },
  { key: 'worker_assigned', label: 'Worker Assigned', icon: '👷' },
  { key: 'on_the_way', label: 'On the Way', icon: '🚚' },
  { key: 'delivered', label: 'Delivered', icon: '🎉' },
];

function BottomSheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[999]" />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[1000] bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl max-h-[94vh] flex flex-col overflow-hidden border-t border-gray-100 dark:border-slate-800"
          >
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-slate-700 rounded-full mx-auto mt-3 mb-1 shrink-0" />
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function MealsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [foodTypeFilter, setFoodTypeFilter] = useState<'all' | 'veg' | 'nonveg' | 'jain'>('all');
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Cart
  const [mealCart, setMealCart] = useState<{ meal: MealItem; qty: number }[]>(() => {
    try {
      const stored = localStorage.getItem('homeseva_meal_cart');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [dbMeals, setDbMeals] = useState<MealItem[]>(SAMPLE_MEALS);

  // Cart
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  // Multi-step sheet
  const [sheet, setSheet] = useState<Sheet>('none');
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3 | 4>(1);

  // Address
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<any | null>(null);
  const [showAddAddrForm, setShowAddAddrForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ label: 'Home', name: '', phone: '', address: '', landmark: '', city: '', state: 'Gujarat', pincode: '' });
  const [savingAddr, setSavingAddr] = useState(false);

  // Payment
  const [payMethod, setPayMethod] = useState('phonepe');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [utrInput, setUtrInput] = useState('');
  const [showUtrInput, setShowUtrInput] = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [countdown, setCountdown] = useState(180);
  const [countdownActive, setCountdownActive] = useState(false);
  const [detectingPayment, setDetectingPayment] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Success
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);

  // Settings
  const [storeSettings, setStoreSettings] = useState({ delivery_fee: 40, platform_fee: 5, delivery_threshold: 500 });

  // ── Computed values ──
  const subtotal = mealCart.reduce((s, i) => s + i.meal.price * i.qty, 0);
  const deliveryFee = (storeSettings.delivery_threshold > 0 && subtotal >= storeSettings.delivery_threshold) 
    ? 0 : (subtotal > 0 ? storeSettings.delivery_fee : 0);
  const total = subtotal > 0 ? subtotal + deliveryFee + storeSettings.platform_fee - discount : 0;

  useEffect(() => {
    if (user) {
      apiClient.getStoreAddresses().then(res => {
        const data = res.data || res;
        if (Array.isArray(data)) {
          setAddresses(data);
          if (data.length > 0) setSelectedAddr(data[0]);
        } else if (data?.success) {
          setAddresses(data.addresses || []);
          if (data.addresses?.length > 0) setSelectedAddr(data.addresses[0]);
        }
      }).catch(err => console.error(err));
    }
  }, [user]);

  const handleCheckout = () => {
    if (!user) {
      toast('Please login to place an order', 'error');
      navigate('/login');
      return;
    }
    setSheet('address');
    setCheckoutStep(2);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingAddr(true);
      const address = await apiClient.addStoreAddress(addrForm);
      if (address && address.id) {
        toast('Address saved successfully', 'success');
        setAddresses(prev => [...prev, address]);
        setSelectedAddr(address);
        setShowAddAddrForm(false);
      }
    } catch (err: any) {
      toast(err.response?.data?.error || 'Failed to save address', 'error');
    } finally {
      setSavingAddr(false);
    }
  };

  const handleUpiVerification = async () => {
    if (!utrInput || utrInput.length < 12) return toast('Please enter a valid 12-digit UTR', 'error');
    try {
      setPlacingOrder(true);
      const items = mealCart.map(i => ({ id: i.meal.id, name: i.meal.name, quantity: i.qty, price: i.meal.price }));
      const orderRes = await apiClient.placeStoreOrder({
        items, address: selectedAddr, subtotal, delivery_fee: deliveryFee, platform_fee: storeSettings.platform_fee,
        gst: 0, coupon, discount, total, payment_method: 'phonepe_manual',
        notes: 'Meal Order', utr_number: utrInput, screenshot_url: screenshotUrl
      });
      setPlacedOrder(orderRes.data);
      setMealCart([]);
      setSheet('success');
    } catch (err: any) {
      toast(err.response?.data?.error || 'Failed to verify payment', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleUploadScreenshot = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const preview = URL.createObjectURL(file);
      setScreenshotPreview(preview);
      try {
        setUploadingScreenshot(true);
        const formData = new FormData();
        formData.append('screenshot', file);
        const res = await apiClient.uploadStoreScreenshot('', file);
        if (res.data?.screenshot_url) setScreenshotUrl(res.data.screenshot_url);
      } catch (err) {
        toast('Failed to upload screenshot', 'error');
        setScreenshotPreview('');
      } finally {
        setUploadingScreenshot(false);
      }
    }
  };

  const verifyRazorpay = async (pid: string, oid: string, sig: string) => {
    try {
      setPlacingOrder(true);
      const items = mealCart.map(i => ({ id: i.meal.id, name: i.meal.name, quantity: i.qty, price: i.meal.price }));
      
      const verifyRes = await apiClient.verifyStoreRazorpayPayment({ 
        razorpay_payment_id: pid, 
        razorpay_order_id: oid, 
        razorpay_signature: sig, 
        orderDetails: {
          items, address: selectedAddr, subtotal, delivery_fee: deliveryFee, platform_fee: storeSettings.platform_fee,
          gst: 0, coupon: appliedCouponCode || undefined, discount, total, payment_method: 'phonepe_razorpay',
          notes: 'Meal Order paid via Razorpay', utr_number: pid
        } 
      });

      if (verifyRes.data?.success) {
        toast('Payment Verified Successfully!', 'success');
        setPlacedOrder(verifyRes.data.order);
        setMealCart([]);
        setSheet('success');
      } else {
        toast(verifyRes.data?.error || 'Payment verification failed', 'error');
      }
    } catch (err: any) {
      toast(err.response?.data?.error || 'Verification error', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  
  const applyCoupon = async (codeStr = coupon) => {
    setValidatingCoupon(true);
    setTimeout(() => {
      setValidatingCoupon(false);
      if (codeStr.trim().length > 2) {
        setDiscount(20);
        setCouponApplied(true);
        setAppliedCouponCode(codeStr);
      }
    }, 1000);
  };
  
  const removeCoupon = () => {
    setCoupon('');
    setDiscount(0);
    setCouponApplied(false);
    setAppliedCouponCode('');
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddr) return toast('Please select an address', 'error');
    setPlacingOrder(true);
    
    if (payMethod === 'cod') {
      try {
        const items = mealCart.map(i => ({ id: i.meal.id, name: i.meal.name, quantity: i.qty, price: i.meal.price }));
        const res = await apiClient.placeStoreOrder({
          items, address: selectedAddr, subtotal, delivery_fee: deliveryFee, platform_fee: storeSettings.platform_fee,
          gst: 0, coupon, discount, total, payment_method: 'cod'
        });
        setPlacedOrder(res.data);
        setMealCart([]);
        setSheet('success');
      } catch (err: any) {
        toast(err.response?.data?.error || 'Failed to place order', 'error');
      } finally {
        setPlacingOrder(false);
      }
    } else {
      // Razorpay checkout
      try {
        setPlacingOrder(true);
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
        }

        const res = await apiClient.createPaymentOrder({
          amount: total,
          productName: "Meal Order",
          productId: "store_order",
          customerName: user?.name || "Customer",
          email: user?.email || "",
          phoneNumber: user?.phone || "",
          isStoreOrder: true
        });
        
        if (!res.orderId || !res.keyId) {
           throw new Error("Failed to initialize Razorpay");
        }
        
        const options = {
          key: res.keyId,
          amount: res.amount,
          currency: res.currency,
          name: "Bhale Padharya",
          description: "Meal Order Payment",
          order_id: res.orderId,
          handler: function (response: any) {
            verifyRazorpay(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
          },
          prefill: { name: user?.name || '', email: user?.email || '', contact: user?.phone || '' },
          theme: { color: "#3399cc" },
          config: {
            display: {
              blocks: {
                upi_qr: {
                  name: 'Scan QR Code or Pay via UPI',
                  instruments: [{ method: 'upi' }, { method: 'qr' }],
                },
              },
              sequence: ['block.upi_qr'],
              preferences: { show_default_blocks: false },
            },
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          toast(response.error.description || 'Payment Failed', 'error');
        });
        rzp.open();
      } catch (err: any) {
        toast(err.response?.data?.error || 'Failed to initialize payment gateway', 'error');
      } finally {
        setPlacingOrder(false);
      }
    }
  };


  useEffect(() => {
    try {
      localStorage.setItem('homeseva_meal_cart', JSON.stringify(mealCart));
    } catch (e) {}
  }, [mealCart]);

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
        if (Array.isArray(data)) {
          setDbMeals(data.length > 0 ? data : SAMPLE_MEALS);
        }
      }
    } catch (e) {
      console.error('API fetch error for meals:', e);
    }
  };

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

  return (
    <div className="flex flex-col flex-1 bg-gray-50 dark:bg-slate-950 min-h-screen pb-28 select-none">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800/60 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-4 pb-3.5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600 shrink-0 drop-shadow-2xs" />
              <div>
                <span className="text-[11px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 leading-tight block">Delivering to</span>
                <h2 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white leading-snug tracking-tight">Patan, Gujarat</h2>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigate('/catering')}
                className="px-3.5 py-2 rounded-xl border border-amber-200 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition shadow-2xs flex items-center gap-1.5"
              >
                <ChefHat className="w-4 h-4 text-amber-600" />
                <span>Catering Packages</span>
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
              placeholder="Search daily meals, thali, tiffin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 sm:h-12 pl-11 pr-4 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-sm font-medium text-gray-800 dark:text-white placeholder-gray-400 outline-none focus:border-amber-500 focus:bg-white transition shadow-xs"
            />
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar pb-1.5">
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

      {/* Main Grid */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-6 flex-1 w-full space-y-6">
        <div className="flex items-center justify-end mb-4">
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {filteredMeals.map((meal) => {
            const inCart = mealCart.find((i) => i.meal.id === meal.id);
            const qty = inCart ? inCart.qty : 0;
            return (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-150 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col"
              >
                <img src={meal.image} alt={meal.name} className="w-full h-36 sm:h-40 object-cover" />
                <div className="p-3 flex flex-col flex-1">
                  <p className="text-[9px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider mb-0.5">{meal.category}</p>
                  <h4 className="font-extrabold text-xs text-gray-900 dark:text-white leading-snug line-clamp-2 flex-1">{meal.name}</h4>
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-slate-800/60">
                    <span className="font-black text-sm text-gray-900 dark:text-white">₹{meal.price}</span>
                    {qty === 0 ? (
                      <button
                        onClick={(e) => addToMealCart(meal, e)}
                        className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black px-3 py-1.5 rounded-xl transition shadow-2xs"
                      >
                        <Plus className="w-3 h-3" /> ADD
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 bg-amber-600 rounded-xl px-1.5 py-1 text-white">
                        <button onClick={(e) => updateMealQty(meal.id, -1, e)} className="w-4 h-4 flex items-center justify-center font-black"><Minus className="w-2.5 h-2.5" /></button>
                        <span className="font-black text-xs min-w-[12px] text-center">{qty}</span>
                        <button onClick={(e) => updateMealQty(meal.id, 1, e)} className="w-4 h-4 flex items-center justify-center font-black"><Plus className="w-2.5 h-2.5" /></button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    
      {/* Sticky Bottom Bar */}
      {cartCount > 0 && sheet === 'none' && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }}
          className="fixed bottom-20 left-4 right-4 z-30 max-w-lg mx-auto">
          <div className="bg-amber-600 rounded-2xl shadow-xl shadow-amber-600/30 p-4 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
               onClick={() => setSheet('cart')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white relative">
                <CookingPot className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 bg-white text-amber-700 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              </div>
              <div className="flex flex-col text-white">
                <span className="text-xs font-semibold opacity-90">{cartCount} items selected</span>
                <span className="font-black text-lg leading-none">₹{total}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-white font-bold bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
              View Cart <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </motion.div>
      )}

{/* ══════════════════════════════════════════════
          4-STEP STORE CHECKOUT WIZARD (Matches Booking UI)
      ══════════════════════════════════════════════ */}
      <BottomSheet open={sheet === 'cart' || sheet === 'checkout' || sheet === 'address' || sheet === 'review' || sheet === 'payment'} onClose={() => setSheet('none')}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            {checkoutStep > 1 && (
              <button
                onClick={() => setCheckoutStep(s => Math.max(1, s - 1) as any)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-none">STORE CHECKOUT</p>
              <h3 className="font-black text-base text-gray-900 dark:text-white mt-0.5">
                {checkoutStep === 1 ? 'Cart Items' : checkoutStep === 2 ? 'Select Address' : checkoutStep === 3 ? 'Apply Coupon' : 'Payment Gateway'}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">BASE PRICE</p>
              <p className="text-sm font-black text-blue-600 dark:text-blue-400">₹{subtotal}</p>
            </div>
            <button onClick={() => setSheet('none')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stepper Header (1. Schedule/Items, 2. Address, 3. Coupon, 4. Payment) */}
        <div className="px-5 py-3 bg-gray-50/80 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800 shrink-0">
          <div className="grid grid-cols-4 gap-2 relative">
            <div className="absolute top-4 left-[12%] right-[12%] h-0.5 bg-gray-200 dark:bg-slate-700 z-0" />
            {[
              { step: 1, label: 'Items' },
              { step: 2, label: 'Address' },
              { step: 3, label: 'Coupon' },
              { step: 4, label: 'Payment' },
            ].map((s) => {
              const isDone = checkoutStep > s.step;
              const isActive = checkoutStep === s.step;
              return (
                <button
                  key={s.step}
                  onClick={() => isDone && setCheckoutStep(s.step as any)}
                  disabled={!isDone && !isActive}
                  className="flex flex-col items-center z-10 focus:outline-none cursor-pointer disabled:cursor-not-allowed"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all shadow-sm ${
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : isActive
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/40 shadow-blue-500/30'
                        : 'bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-400'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4" strokeWidth={3} /> : s.step}
                  </div>
                  <span
                    className={`text-[10px] font-bold mt-1.5 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 font-extrabold'
                        : isDone
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* STEP 1: CART ITEMS */}
          {checkoutStep === 1 && (
            <div className="space-y-3">
              {deliveryFee === 0 && subtotal > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl px-4 py-2.5 flex items-center gap-2">
                  <span className="text-base">🎉</span>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Free delivery on this order!</span>
                </div>
              )}
              {storeSettings.delivery_threshold > 0 && subtotal > 0 && subtotal < storeSettings.delivery_threshold && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl px-4 py-2.5">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Add ₹{storeSettings.delivery_threshold - subtotal} more for <span className="underline">free delivery</span></p>
                  <div className="mt-1.5 bg-amber-200/50 rounded-full h-1.5">
                    <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, (subtotal / storeSettings.delivery_threshold) * 100)}%` }} />
                  </div>
                </div>
              )}

              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">CART ITEMS ({cartCount})</p>
              {mealCart.map(item => (
                <div key={item.meal.id} className="flex items-center gap-3 bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/80 rounded-2xl p-3 shadow-sm">
                  <img src={item.meal.image} alt={item.meal.name} className="w-14 h-14 rounded-xl object-cover shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=80'; }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-gray-900 dark:text-white line-clamp-1">{item.meal.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">₹{item.meal.price} × {item.qty} = <span className="font-bold text-gray-800 dark:text-gray-200">₹{item.meal.price * item.qty}</span></p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => updateMealQty(item.meal.id, -item.qty)}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg transition ${item.qty === 1 ? 'bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'}`}>
                      {item.qty === 1 ? <Trash2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                    </button>
                    <span className="font-black text-xs w-6 text-center text-gray-900 dark:text-white">{item.qty}</span>
                    <button onClick={() => addToMealCart(item.meal)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 2: ADDRESS (Matches Screenshot 3) */}
          {checkoutStep === 2 && (
            <div className="space-y-4">
              {!user && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-bold">Please <button onClick={() => navigate('/login')} className="underline">login</button> to manage saved addresses</p>
                </div>
              )}

              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <p className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">Saved Addresses</p>
                </div>

                {addresses.length === 0 && !showAddAddrForm && (
                  <p className="text-xs text-gray-400 italic bg-gray-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 text-center">No saved addresses yet. Tap below to add one.</p>
                )}

                <div className="space-y-2.5">
                  {addresses.map(addr => (
                    <button
                      key={addr.id}
                      onClick={() => setSelectedAddr(addr)}
                      className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition ${
                        selectedAddr?.id === addr.id
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/20'
                          : 'border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-blue-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        selectedAddr?.id === addr.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 dark:border-slate-600'
                      }`}>
                        {selectedAddr?.id === addr.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300">{addr.label}</span>
                        </div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white mt-1.5 leading-snug">{addr.address}{addr.landmark ? `, ${addr.landmark}` : ''}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{addr.city}, {addr.state} - {addr.pincode}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Add New Address Toggle / Form */}
              <div className="pt-2">
                <p className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">Or Add New Address</p>
                {!showAddAddrForm ? (
                  <button
                    onClick={() => setShowAddAddrForm(true)}
                    className="w-full border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl py-3.5 flex items-center justify-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600 transition"
                  >
                    <Plus className="w-4 h-4" /> Add New Address
                  </button>
                ) : (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-200 dark:border-slate-700 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-sm text-gray-900 dark:text-white">New Address Details</p>
                      <button onClick={() => setShowAddAddrForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Home', 'Office', 'Other'] as const).map(l => (
                        <button key={l} onClick={() => setAddrForm(f => ({ ...f, label: l }))}
                          className={`py-2 rounded-xl text-xs font-bold border transition ${addrForm.label === l ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400'}`}>{l}</button>
                      ))}
                    </div>
                    {[
                      { key: 'name', placeholder: 'Full Name', required: false },
                      { key: 'phone', placeholder: 'Phone Number', required: false },
                      { key: 'address', placeholder: 'House No, Street, Area *', required: true },
                      { key: 'landmark', placeholder: 'Landmark (optional)', required: false },
                      { key: 'city', placeholder: 'City *', required: true },
                      { key: 'pincode', placeholder: 'Pincode *', required: true },
                    ].map(({ key, placeholder }) => (
                      <input key={key} value={(addrForm as any)[key]} onChange={e => setAddrForm(f => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder} className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white outline-none focus:border-blue-500 transition" />
                    ))}
                    <button onClick={handleSaveAddress} disabled={savingAddr}
                      className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-60">
                      {savingAddr ? 'Saving...' : 'Save Address'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: COUPON (Matches Screenshot 2) */}
          {checkoutStep === 3 && (
            <div className="space-y-4">
              {/* Apply Coupon Code Input */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <p className="font-bold text-xs text-gray-900 dark:text-white">Apply Coupon Code</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon Code (e.g. FIRST50)"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    disabled={couponApplied}
                    className="flex-1 h-11 px-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-900 dark:text-white uppercase outline-none focus:border-blue-500 transition"
                  />
                  {couponApplied ? (
                    <button
                      onClick={removeCoupon}
                      className="h-11 px-4 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold rounded-xl transition"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={() => applyCoupon()}
                      disabled={validatingCoupon || !coupon.trim()}
                      className="h-11 px-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-500/20"
                    >
                      {validatingCoupon ? 'Validating...' : 'Apply'}
                    </button>
                  )}
                </div>
                {couponApplied && (
                  <div className="mt-3 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200/60">
                    <span>Coupon {appliedCouponCode || coupon} Applied Successfully!</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
              </div>

              {/* AVAILABLE COUPONS */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">AVAILABLE COUPONS</p>
                <div className="space-y-2.5">
                  {[
                    { code: 'FIRST50', discount: 50, type: 'percent', maxDiscount: 200, minOrder: 199, description: '50% off on first booking (max ₹200)' },
                    { code: 'CLEAN20', discount: 20, type: 'percent', maxDiscount: 500, minOrder: 999, description: '20% off on cleaning services (max ₹500)' },
                    { code: 'FLAT100', discount: 100, type: 'flat', maxDiscount: 100, minOrder: 499, description: 'Flat ₹100 off on orders above ₹499' },
                    { code: 'NEW200', discount: 200, type: 'flat', maxDiscount: 200, minOrder: 499, description: 'Flat ₹200 off on orders above ₹499' },
                  ].map((c) => (
                    <div
                      key={c.code}
                      className="bg-blue-50/50 dark:bg-blue-950/10 border-2 border-dashed border-blue-200 dark:border-blue-900/40 rounded-2xl p-3.5 flex items-center justify-between transition hover:border-blue-400"
                    >
                      <div>
                        <span className="font-black text-xs text-blue-600 dark:text-blue-400">{c.code}</span>
                        <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5">{c.description}</p>
                      </div>
                      <button
                        onClick={() => applyCoupon(c.code)}
                        className="text-xs font-black text-blue-600 dark:text-blue-400 hover:text-blue-800 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900/50 shadow-sm transition active:scale-95 cursor-pointer"
                      >
                        Use Code
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT (Matches Screenshot 1) */}
          {checkoutStep === 4 && (
            <div className="space-y-4">
              {/* Razorpay Unified Payments Card */}
              <div className="bg-white dark:bg-slate-800 border-2 border-blue-500/80 dark:border-blue-600 rounded-3xl p-5 shadow-xl shadow-blue-500/5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-blue-600" />
                    <h4 className="font-black text-sm text-gray-900 dark:text-white">Razorpay Unified Payments (UPI Only)</h4>
                  </div>
                  <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200">
                    🛡️ STRICT SECURITY
                  </span>
                </div>

                {/* Gateway Box */}
                <div className="bg-blue-50/60 dark:bg-blue-950/20 border-2 border-blue-500 rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                        Razorpay
                      </div>
                      <div>
                        <p className="font-black text-xs text-gray-900 dark:text-white">UPI Payment Gateway</p>
                        <p className="text-[9px] text-gray-500">Instant & Encrypted via Razorpay SDK</p>
                      </div>
                    </div>
                    <Check className="w-5 h-5 text-blue-600" strokeWidth={3} />
                  </div>

                  {/* App Badges */}
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    {['Google Pay', 'PhonePe', 'Paytm', 'BHIM / QR'].map(app => (
                      <div key={app} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 py-2 rounded-xl text-[9px] font-bold text-gray-700 dark:text-gray-300 shadow-2xs">
                        {app}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lock notice */}
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-3 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Cards, Net Banking, EMI, and Wallets are fully supported. Razorpay signature verification protects your order.</span>
                </div>
              </div>

              {/* Price Breakdown Table */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 p-4 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Base Product/Service Price:</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400">
                    <span>Coupon Discount Applied:</span>
                    <span className="font-black">-₹{discount}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Delivery & Platform Fee:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                </div>
                <div className="border-t border-gray-100 dark:border-slate-700 pt-2 flex items-center justify-between">
                  <span className="text-sm font-black text-gray-900 dark:text-white">Total Amount Payable:</span>
                  <span className="text-base font-black text-blue-600 dark:text-blue-400">₹{total}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Bar (Matches Screenshots 1, 2, 3) */}
        <div className="px-5 py-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shrink-0 flex items-center justify-between gap-3 shadow-2xl">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">TOTAL PAYABLE</p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">₹{total}</p>
          </div>

          <div className="flex items-center gap-2">
            {checkoutStep > 1 && (
              <button
                onClick={() => setCheckoutStep(s => Math.max(1, s - 1) as any)}
                className="w-11 h-12 rounded-2xl border-2 border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {checkoutStep < 4 ? (
              <button
                onClick={() => {
                  if (checkoutStep === 2 && !selectedAddr) {
                    toast('Please select a delivery address', 'error');
                    return;
                  }
                  setCheckoutStep(s => Math.min(4, s + 1) as any);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black text-sm h-12 px-8 rounded-2xl transition active:scale-[0.98] shadow-lg shadow-blue-600/30 flex items-center gap-2"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black text-sm h-12 px-6 rounded-2xl transition active:scale-[0.98] shadow-lg shadow-blue-600/30 flex items-center gap-2 disabled:opacity-60"
              >
                <ShieldCheck className="w-4 h-4" />
                {placingOrder ? 'Initializing...' : '📱 Pay & Confirm via Razorpay UPI'}
              </button>
            )}
          </div>
        </div>
      </BottomSheet>



      {/* ══════════════════════════════════════════════
          SHEET 5: ORDER SUCCESS
      ══════════════════════════════════════════════ */}
      <BottomSheet open={sheet === 'success'} onClose={() => {}}>
        <div className="flex-1 flex flex-col items-center justify-center px-5 py-8 text-center overflow-y-auto">
          {/* Animated checkmark */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30 mb-6"
          >
            <Check className="w-12 h-12 text-white" strokeWidth={3} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
              Order Placed Successfully!
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Your payment has been successfully verified. We will process your order shortly.
            </p>

            <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl px-6 py-4 mt-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Order ID</span>
                <span className="text-xs font-black text-gray-900 dark:text-white">{placedOrder?.id || 'HSV-DEMO'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Amount</span>
                <span className="text-xs font-black text-green-600">₹{placedOrder?.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Estimated Delivery</span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">7 Business Days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Payment Status</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Paid Online (Verified ✓)
                </span>
              </div>
            </div>

            {/* Tracking stages preview */}
            <div className="mt-5 space-y-2 text-left">
              {TRACKING_STAGES.slice(0, 3).map((stage, idx) => (
                <div key={stage.key} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${idx === 0 ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}>{stage.icon}</div>
                  <p className={`text-xs font-bold ${idx === 0 ? 'text-green-600' : 'text-gray-400'}`}>{stage.label}</p>
                  {idx === 0 && <span className="text-[8px] bg-green-100 text-green-700 font-black px-1.5 py-0.5 rounded-full">NOW</span>}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 dark:border-slate-800 shrink-0 space-y-2">
          {placedOrder?.id && (
            <a
              href={apiClient.downloadInvoicePdfUrl(placedOrder.id)}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs py-3 rounded-2xl transition flex items-center justify-center gap-2 border border-indigo-200"
            >
              📄 Download Invoice PDF
            </a>
          )}
          <button onClick={() => { if (placedOrder?.id) navigate(`/store/order/${placedOrder.id}`); else navigate('/store/orders'); setSheet('none'); }}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-black text-sm py-3.5 rounded-2xl transition active:scale-[0.98] shadow-lg">
            Track Order →
          </button>
          <button onClick={() => setSheet('none')} className="w-full border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold text-sm py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 transition">
            Continue Shopping
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
