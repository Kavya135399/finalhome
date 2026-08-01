import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, ShoppingCart, ChevronLeft, ChevronRight,
  Plus, Minus, X, Star, Clock, Package, Zap, Crown, Trash2,
  Home, Tag, Check, Copy, Upload, AlertCircle, QrCode,
  Smartphone, Truck, ShieldCheck, RefreshCw, Heart
} from 'lucide-react';
import axios from 'axios';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from '../context/ToastContext';

// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORIES = ['All', 'Snacks', 'Beverages', 'Breakfast Items', 'Fruits', 'Groceries', 'Daily Essentials', 'Emergency Supplies'];
const CAT_EMOJI: Record<string, string> = { All: '🛒', Snacks: '🍿', Beverages: '☕', 'Breakfast Items': '🥣', Fruits: '🍎', Groceries: '🛍️', 'Daily Essentials': '🧴', 'Emergency Supplies': '⚡' };
const UPI_ID = 'tulsibhaiparmar9723@okicici';
const UPI_NAME = 'Tulsibhai Parmar';
const BANNERS = [
  { id: 1, tag: 'EMERGENCY READY', title: 'Critical supplies always available', subtitle: 'From medicines to cleaning — we have it', badge: 'Priority ✓', bg: 'from-violet-700 via-purple-700 to-indigo-800', icon: Zap, iconColor: 'text-yellow-300' },
  { id: 2, tag: 'MEMBERS EXCLUSIVE', title: 'Fresh groceries delivered in 30 min', subtitle: 'Same-day delivery, quality guaranteed', badge: 'Fresh ✓', bg: 'from-emerald-600 via-teal-600 to-cyan-700', icon: Package, iconColor: 'text-emerald-200' },
  { id: 3, tag: 'PREMIUM PICKS', title: 'Handpicked quality products', subtitle: 'Curated selection for HomeSeva members', badge: 'Premium ✓', bg: 'from-amber-600 via-orange-600 to-rose-700', icon: Crown, iconColor: 'text-yellow-200' },
];
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

// ─── Types ───────────────────────────────────────────────────────────────────
interface Product { id: string; name: string; category: string; description: string; price: number; stock: number; image: string; is_active: number; is_featured: number; is_popular: number; }
interface CartItem { product: Product; qty: number; }
type Sheet = 'none' | 'cart' | 'checkout' | 'address' | 'review' | 'payment' | 'success';

const FALLBACK: Product[] = [
  { id: 'sp_001', name: 'Cold-Brew Black Coffee', category: 'Beverages', description: '12-hour steeped organic Arabica cold brew in a 300ml bottle.', price: 180, stock: 15, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=400', is_active: 1, is_featured: 0, is_popular: 1 },
  { id: 'sp_002', name: 'Heavy-Duty LED Flashlight', category: 'Emergency Supplies', description: '1000 lumen water-resistant aircraft-grade aluminium tactical torch.', price: 999, stock: 11, image: 'https://images.unsplash.com/photo-1567608346699-89d59c4e5b31?auto=format&fit=crop&q=80&w=400', is_active: 1, is_featured: 1, is_popular: 1 },
  { id: 'sp_003', name: 'Organic Alphonso Mangoes', category: 'Fruits', description: 'Box of 6 handpicked, naturally ripened Ratnagiri Alphonso mangoes.', price: 899, stock: 12, image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=400', is_active: 1, is_featured: 1, is_popular: 1 },
  { id: 'sp_004', name: 'Premium Aged Basmati Rice', category: 'Groceries', description: '5 kg bag of 2-year aged extra-long grain basmati.', price: 320, stock: 40, image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&q=80&w=400', is_active: 1, is_featured: 1, is_popular: 1 },
  { id: 'sp_005', name: 'Premium Roasted Cashews', category: 'Snacks', description: 'Lightly salted whole cashews, slow-roasted in small batches. 200g pack.', price: 349, stock: 25, image: 'https://images.unsplash.com/photo-1567892737950-30c4db6e22aa?auto=format&fit=crop&q=80&w=400', is_active: 1, is_featured: 0, is_popular: 1 },
  { id: 'sp_006', name: 'Masala Oats Breakfast Mix', category: 'Breakfast Items', description: 'Instant savoury oats with mixed vegetables. Ready in 3 minutes. 500g.', price: 220, stock: 30, image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&q=80&w=400', is_active: 1, is_featured: 1, is_popular: 0 },
  { id: 'sp_007', name: 'Hand Sanitiser 500ml', category: 'Daily Essentials', description: '70% isopropyl alcohol gel sanitiser with aloe vera.', price: 149, stock: 60, image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&q=80&w=400', is_active: 1, is_featured: 0, is_popular: 0 },
  { id: 'sp_008', name: 'First Aid Kit', category: 'Emergency Supplies', description: 'Compact 32-piece first aid kit in a hard case.', price: 599, stock: 18, image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&q=80&w=400', is_active: 1, is_featured: 1, is_popular: 0 },
];

// ─── Bottom Sheet Wrapper ────────────────────────────────────────────────────
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

// ─── Main Component ───────────────────────────────────────────────────────────
export function StorePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Products & UI
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [bannerIdx, setBannerIdx] = useState(0);
  const bannerTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  // Multi-step sheet
  const [sheet, setSheet] = useState<Sheet>('none');
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3 | 4>(1);

  // Favorites
  const { isFavorite, toggleFavorite: toggleFav } = useFavorites();
  const toggleFavoriteLocal = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await toggleFav(id, 'store_product');
  };

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
  const [storeSettings, setStoreSettings] = useState({ delivery_fee: 0, platform_fee: 0, delivery_threshold: 0 });

  // ── Computed values ──
  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const deliveryFee = (storeSettings.delivery_threshold > 0 && subtotal >= storeSettings.delivery_threshold) 
    ? 0 : (subtotal > 0 ? storeSettings.delivery_fee : 0);
  const total = subtotal > 0 ? subtotal + deliveryFee + storeSettings.platform_fee - discount : 0;
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // ── Effects ──
  useEffect(() => {
    fetchProducts();
    fetchSettings();
    bannerTimer.current = setInterval(() => setBannerIdx(i => (i + 1) % BANNERS.length), 4000);
    return () => { if (bannerTimer.current) clearInterval(bannerTimer.current); };
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [sheet, user, checkoutStep]);

  useEffect(() => {
    if (!countdownActive) return;
    if (countdown <= 0) { setCountdownActive(false); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, countdownActive]);

  const fetchSettings = async () => {
    try {
      const data = await apiClient.getStoreSettings();
      setStoreSettings({
        delivery_fee: Number(data.delivery_fee) || 0,
        platform_fee: Number(data.platform_fee) || 0,
        delivery_threshold: Number(data.delivery_threshold) || 0,
      });
    } catch (e) {
      console.error('Failed to fetch settings');
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getStoreProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts(FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    let loaded: any[] = [];

    // 1. Fetch from backend if logged in
    if (user) {
      try {
        const data = await apiClient.getStoreAddresses();
        if (Array.isArray(data) && data.length > 0) {
          loaded = data;
        }
      } catch (e) {
        console.warn('Backend address fetch warning, checking localStorage');
      }
    }

    // 2. Fallback to localStorage
    if (loaded.length === 0) {
      try {
        const localData = localStorage.getItem('hs_saved_addresses');
        if (localData) {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            loaded = parsed;
          }
        }
      } catch (e) {
        console.error('Failed to parse localStorage addresses');
      }
    }

    // 3. Fallback default addresses if empty
    if (loaded.length === 0) {
      loaded = [
        {
          id: 'addr_default_home',
          label: 'Home',
          name: user?.name || 'Valued Customer',
          phone: '9876543210',
          address: '402, Sunshine Apartments, CG Road',
          landmark: 'Near City Mall',
          city: 'Ahmedabad',
          state: 'Gujarat',
          pincode: '380009',
          is_default: 1,
        },
        {
          id: 'addr_default_office',
          label: 'Office',
          name: user?.name || 'Valued Customer',
          phone: '9876543210',
          address: '801, Tech Park Towers, SG Highway',
          landmark: 'Opposite ISKCON Temple',
          city: 'Ahmedabad',
          state: 'Gujarat',
          pincode: '380015',
          is_default: 0,
        },
      ];
    }

    setAddresses(loaded);
    setSelectedAddr((prev: any) => {
      if (prev && loaded.some(a => a.id === prev.id)) return prev;
      return loaded.find((a: any) => a.is_default) || loaded[0];
    });
  };

  // ── Cart helpers ──
  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id);
      if (ex) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === productId);
      if (!ex) return prev;
      if (ex.qty === 1) return prev.filter(i => i.product.id !== productId);
      return prev.map(i => i.product.id === productId ? { ...i, qty: i.qty - 1 } : i);
    });
  }, []);

  const getQty = (id: string) => cart.find(i => i.product.id === id)?.qty ?? 0;

  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCouponCode, setAppliedCouponCode] = useState('');

  const calculateLocalDiscount = (codeStr: string, currentSubtotal: number): { valid: true; code: string; discount: number } | { valid: false; error: string } => {
    const clean = codeStr.trim().toUpperCase();
    const couponsMap: Record<string, { discount: number; type: 'percent' | 'flat'; maxDiscount?: number; minOrder?: number }> = {
      'FIRST50': { discount: 50, type: 'percent', maxDiscount: 200, minOrder: 0 },
      'CLEAN20': { discount: 20, type: 'percent', maxDiscount: 500, minOrder: 0 },
      'FLAT100': { discount: 100, type: 'flat', maxDiscount: 100, minOrder: 0 },
      'NEW200': { discount: 200, type: 'flat', maxDiscount: 200, minOrder: 0 },
      'HOMESEVA10': { discount: 10, type: 'percent', maxDiscount: 300, minOrder: 0 },
      'SAFETYFIRST': { discount: 150, type: 'flat', maxDiscount: 150, minOrder: 0 },
    };

    const found = couponsMap[clean];
    if (!found) return { valid: false, error: 'Invalid coupon code' };
    if (found.minOrder && currentSubtotal < found.minOrder) {
      return { valid: false, error: `Minimum subtotal of ₹${found.minOrder} required for coupon ${clean}` };
    }
    let disc = 0;
    if (found.type === 'percent') {
      disc = Math.round(currentSubtotal * (found.discount / 100));
      if (found.maxDiscount && disc > found.maxDiscount) disc = found.maxDiscount;
    } else {
      disc = Math.min(currentSubtotal, found.discount);
    }
    return { valid: true, code: clean, discount: disc };
  };

  const applyCoupon = async (codeToUse?: string) => {
    const targetCode = typeof codeToUse === 'string' ? codeToUse.trim().toUpperCase() : coupon.trim().toUpperCase();
    if (!targetCode) {
      toast('Enter a coupon code', 'error');
      return;
    }
    if (subtotal <= 0) {
      toast('Add items to cart before applying coupon', 'error');
      return;
    }
    setValidatingCoupon(true);
    setCoupon(targetCode);

    // Instant calculation
    const localRes = calculateLocalDiscount(targetCode, subtotal);
    if (localRes.valid) {
      setDiscount(localRes.discount);
      setCouponApplied(true);
      setAppliedCouponCode(localRes.code);
      toast(`Coupon ${localRes.code} applied! Saved ₹${localRes.discount}`, 'success');
      setValidatingCoupon(false);
      return;
    }

    try {
      const res = await apiClient.validateCoupon(targetCode, subtotal);
      if (res.valid) {
        setDiscount(res.discount);
        setCouponApplied(true);
        setAppliedCouponCode(res.code);
        toast(`Coupon ${res.code} applied! Saved ₹${res.discount}`, 'success');
      } else {
        toast(res.message || 'Invalid coupon code', 'error');
        setCouponApplied(false);
        setDiscount(0);
        setAppliedCouponCode('');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || localRes.error || 'Invalid coupon code';
      toast(msg, 'error');
      setCouponApplied(false);
      setDiscount(0);
      setAppliedCouponCode('');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCoupon('');
    setCouponApplied(false);
    setDiscount(0);
    setAppliedCouponCode('');
    toast('Coupon removed', 'info');
  };

  // ── Address ──
  const handleSaveAddress = async () => {
    if (!addrForm.address || !addrForm.city || !addrForm.pincode) { toast('Fill all required fields', 'error'); return; }
    setSavingAddr(true);
    const newAddr = {
      id: `addr_${Date.now()}`,
      label: addrForm.label || 'Home',
      name: addrForm.name || user?.name || 'Valued Customer',
      phone: addrForm.phone || '9876543210',
      address: addrForm.address,
      landmark: addrForm.landmark || '',
      city: addrForm.city,
      state: addrForm.state || 'Gujarat',
      pincode: addrForm.pincode,
      is_default: addresses.length === 0 ? 1 : 0,
    };

    try {
      if (user) {
        try {
          const saved = await apiClient.addStoreAddress({ ...addrForm, is_default: addresses.length === 0 });
          if (saved && saved.id) {
            newAddr.id = saved.id;
          }
        } catch (e) {
          console.warn('Backend address save warning, continuing with local save');
        }
      }

      const updated = [newAddr, ...addresses.filter(a => a.id !== newAddr.id)];
      setAddresses(updated);
      setSelectedAddr(newAddr);
      localStorage.setItem('hs_saved_addresses', JSON.stringify(updated));

      setShowAddAddrForm(false);
      setAddrForm({ label: 'Home', name: '', phone: '', address: '', landmark: '', city: '', state: 'Gujarat', pincode: '' });
      toast('Address saved successfully!', 'success');
    } catch {
      toast('Failed to save address', 'error');
    } finally {
      setSavingAddr(false);
    }
  };

  // ── Razorpay Store Payment Integration ──
  const handleRazorpayStoreCheckout = async () => {
    if (!selectedAddr) {
      toast('Please select a delivery address first', 'error');
      setSheet('address');
      return;
    }
    if (cart.length === 0) {
      toast('Your cart is empty', 'error');
      return;
    }

    setPlacingOrder(true);
    try {
      const cartCount = cart.reduce((s, i) => s + i.qty, 0);
      const itemsPayload = cart.map(i => ({
        id: i.product.id,
        name: i.product.name,
        image: i.product.image,
        price: i.product.price,
        qty: i.qty
      }));

      const { processUPIPayment } = await import('../services/razorpay');

      await processUPIPayment({
        productName: `HomeSeva Store Order (${cartCount} item${cartCount > 1 ? 's' : ''})`,
        productId: 'store_order',
        amount: total, // exact discounted final amount
        discount: discount,
        customerName: selectedAddr.name || user?.name || 'Valued Customer',
        email: user?.email || 'customer@example.com',
        phoneNumber: selectedAddr.phone || '9876543210',
        address: selectedAddr,
        showAllMethods: false,
        onSuccess: async (data: any) => {
          try {
            // Verify HMAC signature on backend & create store_order record
            const orderRes = await apiClient.verifyStoreRazorpayPayment({
              razorpay_order_id: data.razorpay_order_id || data.orderId,
              razorpay_payment_id: data.razorpay_payment_id || data.paymentId,
              razorpay_signature: data.razorpay_signature || data.signature,
              orderDetails: {
                userId: user?.id,
                items: itemsPayload,
                address: selectedAddr,
                subtotal,
                delivery_fee: deliveryFee,
                platform_fee: storeSettings.platform_fee,
                gst: 0,
                coupon: couponApplied ? appliedCouponCode || coupon : '',
                discount,
                total,
                notes: 'Paid via Razorpay'
              }
            });

            if (orderRes.order) {
              setPlacedOrder({
                ...orderRes.order,
                invoiceUrl: apiClient.downloadInvoicePdfUrl(orderRes.order.id)
              });
              setCart([]); // Clear cart only on successful payment verification
              setCouponApplied(false);
              setDiscount(0);
              setCoupon('');
              setAppliedCouponCode('');
              setSheet('success');
              toast('Payment Verified & Store Order Placed!', 'success');
            }
          } catch (verifyErr: any) {
            toast(verifyErr.response?.data?.error || verifyErr.message || 'Payment Verification Failed', 'error');
          } finally {
            setPlacingOrder(false);
          }
        },
        onFailure: (errMsg: string) => {
          setPlacingOrder(false);
          if (errMsg.includes('CANCELLED_BY_USER') || errMsg.toLowerCase().includes('cancelled by customer')) {
            const cleanMsg = errMsg.replace('CANCELLED_BY_USER: ', '');
            toast(cleanMsg || 'Payment cancelled. Items remain in your cart—try again whenever ready.', 'info');
            return;
          }
          toast(errMsg, 'error');
        }
      });
    } catch (err: any) {
      setPlacingOrder(false);
      toast(err.message || 'Failed to initialize payment gateway', 'error');
    }
  };


  const copyUpiId = () => { navigator.clipboard.writeText(UPI_ID); toast('UPI ID copied!', 'success'); };
  const fmtCountdown = `${String(Math.floor(countdown / 60)).padStart(2, '0')}:${String(countdown % 60).padStart(2, '0')}`;

  // ─── Product Card ─────────────────────────────────────────────────────────
  const ProductCard = ({ product }: { product: Product }) => {
    const qty = getQty(product.id);
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col">
        <div className="relative cursor-pointer" onClick={() => {}}>
          <img src={product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'}
            alt={product.name} className="w-full h-36 sm:h-40 object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'; }} />
          {product.is_featured === 1 && <span className="absolute top-2 left-2 bg-amber-500 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">Featured</span>}
          <button 
            onClick={(e) => toggleFavoriteLocal(e, product.id)}
            className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm z-10 hover:scale-110 transition"
          >
            <Heart className={`w-4 h-4 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
          </button>
        </div>
        <div className="p-2.5 flex flex-col flex-1">
          <p className="text-[9px] text-green-600 dark:text-green-400 font-bold uppercase tracking-wider mb-0.5">{product.category}</p>
          <h4 className="font-extrabold text-xs text-gray-900 dark:text-white leading-snug line-clamp-2 flex-1">{product.name}</h4>
          <div className="flex items-center gap-1 mt-1 mb-2">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-[9px] text-gray-500 font-semibold">4.5</span>
            <span className="text-gray-300 mx-0.5">•</span>
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-[9px] text-gray-500">30 min</span>
          </div>
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50 dark:border-slate-800/50">
            <span className="font-black text-sm text-gray-900 dark:text-white">₹{product.price}</span>
            {qty === 0 ? (
              <button onClick={() => addToCart(product)}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-black px-3 py-1.5 rounded-xl transition active:scale-95">
                <Plus className="w-3 h-3" /> ADD
              </button>
            ) : (
              <div className="flex items-center gap-1 bg-green-600 rounded-xl px-1.5 py-1">
                <button onClick={() => removeFromCart(product.id)} className="text-white w-4 h-4 flex items-center justify-center"><Minus className="w-2.5 h-2.5" /></button>
                <span className="text-white font-black text-xs min-w-[12px] text-center">{qty}</span>
                <button onClick={() => addToCart(product)} className="text-white w-4 h-4 flex items-center justify-center"><Plus className="w-2.5 h-2.5" /></button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const filtered = products.filter(p => {
    if (activeCategory === 'Favorites') return isFavorite(p.id) && (!searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const mc = activeCategory === 'All' || p.category === activeCategory;
    const ms = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return mc && ms;
  });
  const popular = products.filter(p => p.is_popular === 1);
  const banner = BANNERS[bannerIdx];
  const BannerIcon = banner.icon;

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col flex-1 bg-gray-50 dark:bg-slate-950 min-h-screen pb-28">

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800/60 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-4 pb-3.5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-green-600 shrink-0 drop-shadow-2xs" />
              <div className="flex flex-col justify-center">
                <span className="text-[11px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 leading-tight">
                  Delivering to
                </span>
                <h2 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white leading-snug tracking-tight">
                  Patan, Gujarat
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigate('/store/orders')}
                className="px-3.5 py-2 rounded-xl border border-green-200 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 transition shadow-2xs flex items-center gap-1.5"
              >
                <Package className="w-4 h-4 text-green-600" />
                <span>My Orders</span>
              </button>
              <button
                onClick={() => cartCount > 0 && setSheet('cart')}
                className="relative w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition border border-gray-200 dark:border-slate-700/80"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          <div className="relative mb-3.5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search products, groceries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 sm:h-12 pl-11 pr-4 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-sm font-medium text-gray-800 dark:text-white placeholder-gray-400 outline-none focus:border-green-500 focus:bg-white transition shadow-xs"
            />
          </div>
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
                    ? 'bg-green-600 text-white border-green-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-gray-300'
                }`}
              >
                <span>{CAT_EMOJI[cat]}</span>
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Product Listings ── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 w-full mt-6 space-y-8">
        {/* Banner */}
        <div className="relative rounded-3xl sm:rounded-[2rem] overflow-hidden shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={bannerIdx}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.35 }}
              className={`bg-gradient-to-br ${banner.bg} p-6 sm:p-10 rounded-3xl sm:rounded-[2rem] flex items-center justify-between min-h-[160px] sm:min-h-[220px] relative overflow-hidden`}
            >
              <div className="relative z-10 max-w-lg sm:max-w-2xl">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white/70 mb-1 sm:mb-2 block">
                  {banner.tag}
                </span>
                <h3 className="text-white font-black text-lg sm:text-2xl md:text-3xl leading-snug">
                  {banner.title}
                </h3>
                <p className="text-white/85 text-xs sm:text-sm font-medium mt-1 sm:mt-2">
                  {banner.subtitle}
                </p>
                <span className="mt-3 sm:mt-5 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full border border-white/30 shadow-xs">
                  {banner.badge}
                </span>
              </div>
              <BannerIcon className={`w-24 h-24 sm:w-40 sm:h-40 ${banner.iconColor} opacity-25 absolute right-6 sm:right-12 top-1/2 -translate-y-1/2 transform rotate-12 transition-transform duration-700 hover:scale-105`} />
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center gap-2 mt-3">
            {BANNERS.map((_, i) => (
              <button
                key={i}
                onClick={() => setBannerIdx(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === bannerIdx ? 'w-6 h-2 bg-green-600' : 'w-2 h-2 bg-gray-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Popular */}
        {!searchQuery && activeCategory === 'All' && popular.length > 0 && (
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-xl">🔥</span>
              <div>
                <h2 className="text-sm sm:text-base font-black text-gray-900 dark:text-white">Popular Items</h2>
                <p className="text-xs text-gray-400 font-medium">Our most-loved picks</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
              {loading
                ? [1, 2, 3, 4, 5, 6].map((k) => (
                    <div key={k} className="h-52 bg-gray-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                  ))
                : popular.slice(0, 6).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* All Products */}
        <section>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-xl">🏪</span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-gray-900 dark:text-white">
                {searchQuery ? `Results for "${searchQuery}"` : activeCategory === 'All' ? 'All Products' : activeCategory}
              </h2>
              <p className="text-xs text-gray-400 font-medium">Everything for your home</p>
            </div>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((k) => (
                <div key={k} className="h-56 bg-gray-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl py-16 text-center border border-gray-100 shadow-xs">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-sm font-bold text-gray-500">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ══════════════════════════════════════════════
          STICKY VIEW CART BAR (Blinkit style)
      ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {cartCount > 0 && sheet === 'none' && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-20 left-4 right-4 z-30 max-w-lg mx-auto">
            <button onClick={() => { setCheckoutStep(1); setSheet('cart'); }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-2xl transition active:scale-[0.98]">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-green-800/40 rounded-xl flex items-center justify-center font-black text-sm">{cartCount}</div>
                <span className="font-black text-sm">View Cart</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm">₹{subtotal}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
              {cart.map(item => (
                <div key={item.product.id} className="flex items-center gap-3 bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/80 rounded-2xl p-3 shadow-sm">
                  <img src={item.product.image} alt={item.product.name} className="w-14 h-14 rounded-xl object-cover shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=80'; }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-gray-900 dark:text-white line-clamp-1">{item.product.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">₹{item.product.price} × {item.qty} = <span className="font-bold text-gray-800 dark:text-gray-200">₹{item.product.price * item.qty}</span></p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => removeFromCart(item.product.id)}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg transition ${item.qty === 1 ? 'bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'}`}>
                      {item.qty === 1 ? <Trash2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                    </button>
                    <span className="font-black text-xs w-6 text-center text-gray-900 dark:text-white">{item.qty}</span>
                    <button onClick={() => addToCart(item.product)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
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
                onClick={handleRazorpayStoreCheckout}
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
