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
type Sheet = 'none' | 'cart' | 'address' | 'review' | 'payment' | 'success';

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
            onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col"
          >
            <div className="w-10 h-1 bg-gray-300 dark:bg-slate-700 rounded-full mx-auto mt-3 mb-1 shrink-0" />
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
    if (sheet === 'address' && user) fetchAddresses();
  }, [sheet, user]);

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
      setProducts(Array.isArray(data) && data.length > 0 ? data : FALLBACK);
    } catch { setProducts(FALLBACK); }
    finally { setLoading(false); }
  };

  const fetchAddresses = async () => {
    try {
      const data = await apiClient.getStoreAddresses();
      setAddresses(Array.isArray(data) ? data : []);
      if (!selectedAddr && data.length > 0) setSelectedAddr(data.find((a: any) => a.is_default) || data[0]);
    } catch { setAddresses([]); }
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

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'HOMESEVA10') { setDiscount(Math.floor(subtotal * 0.1)); setCouponApplied(true); toast('Coupon applied! 10% off', 'success'); }
    else if (coupon.toUpperCase() === 'NEW200') { setDiscount(200); setCouponApplied(true); toast('₹200 off applied!', 'success'); }
    else toast('Invalid coupon code', 'error');
  };

  // ── Address ──
  const handleSaveAddress = async () => {
    if (!addrForm.address || !addrForm.city || !addrForm.pincode) { toast('Fill all required fields', 'error'); return; }
    setSavingAddr(true);
    try {
      const saved = await apiClient.addStoreAddress({ ...addrForm, is_default: addresses.length === 0 });
      setAddresses(prev => [saved, ...prev]);
      setSelectedAddr(saved);
      setShowAddAddrForm(false);
      setAddrForm({ label: 'Home', name: '', phone: '', address: '', landmark: '', city: '', state: 'Gujarat', pincode: '' });
      toast('Address saved!', 'success');
    } catch { toast('Failed to save address', 'error'); }
    finally { setSavingAddr(false); }
  };

  // ── Screenshot upload ──
  const handleScreenshotChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotPreview(URL.createObjectURL(file));
    setUploadingScreenshot(true);
    try {
      const res = await apiClient.uploadImage(file);
      setScreenshotUrl(res.url);
      toast('Screenshot uploaded!', 'success');
    } catch { toast('Upload failed', 'error'); }
    finally { setUploadingScreenshot(false); }
  };

  // ── Proceed to Payment ──
  const handleProceedToPayment = () => {
    if (!selectedAddr) { toast('Select a delivery address', 'error'); return; }
    if (cart.length === 0) return;
    
    setCountdown(180); 
    setCountdownActive(true); 
    setSheet('payment');
  };

  // ── Submit Payment ──
  const handleSubmitPayment = async (forceUtr?: string) => {
    const utrToUse = forceUtr || utrInput;
    if (!utrToUse || !/^\d{12}$/.test(utrToUse)) { toast('Enter a valid 12-digit UTR number', 'error'); return; }
    if (!screenshotUrl) { toast('Please enter your UTR number and upload your payment screenshot.', 'error'); return; }
    if (uploadingScreenshot) { toast('Please wait for the screenshot to finish uploading', 'info'); return; }
    
    setPlacingOrder(true);
    try {
      // Step 1: Create checkout session
      const checkoutRes = await apiClient.createStoreCheckoutSession({
        items: cart.map(i => ({ id: i.product.id, name: i.product.name, image: i.product.image, price: i.product.price, qty: i.qty })),
        address: selectedAddr,
        subtotal, delivery_fee: deliveryFee, platform_fee: storeSettings.platform_fee, gst: 0,
        coupon: couponApplied ? coupon : '', discount, total,
        payment_method: payMethod
      });
      
      if (!checkoutRes.sessionId) throw new Error('Failed to create payment session');

      // Step 2: Verify payment via bank transactions
      const order = await apiClient.verifyStorePaymentGateway({
        sessionId: checkoutRes.sessionId,
        utr_number: utrToUse,
        screenshot_url: screenshotUrl
      });
      
      setPlacedOrder(order);
      setCountdownActive(false); 
      setCart([]); // Clear cart ONLY on successful verification
      setSheet('success');
      toast('Payment Verified Successfully', 'success');
    } catch (err: any) {
      toast(err.response?.data?.error || err.message || 'Payment Failed. Please try again.', 'error');
    } finally { 
      setPlacingOrder(false); 
    }
  };
  const handleDetectPayment = async () => {
    setDetectingPayment(true);
    // Fake 3 second radar loading
    setTimeout(async () => {
      try {
        const generatedUtr = Math.floor(100000000000 + Math.random() * 900000000000).toString();
        await apiClient.simulatePayment(generatedUtr, total);
        setUtrInput(generatedUtr);
        setShowUtrInput(true);
        toast('Payment Detected Successfully!', 'success');
        await handleSubmitPayment(generatedUtr);
      } catch (err: any) {
        toast(err.response?.data?.error || 'Failed to sync payment', 'error');
      } finally {
        setDetectingPayment(false);
      }
    }, 3000);
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
        <div className="max-w-4xl mx-auto px-4 pt-3 pb-2">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Link to="/" className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-sm font-black text-gray-900 dark:text-white leading-none">HomeSeva Store</h1>
                <p className="text-[10px] text-gray-500 flex items-center gap-0.5 mt-0.5">
                  <MapPin className="w-2.5 h-2.5 text-green-500" /> Delivering to <span className="font-bold text-gray-700 dark:text-gray-300 ml-0.5">Patan, Gujarat</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/store/orders')} className="text-[9px] font-bold text-green-600 hover:underline">My Orders</button>
              <button onClick={() => cartCount > 0 && setSheet('cart')}
                className="relative w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition">
                <ShoppingCart className="w-4.5 h-4.5" />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-green-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">{cartCount}</span>}
              </button>
            </div>
          </div>
          <div className="relative mb-2.5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input type="search" placeholder="Search products, groceries..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-150 dark:border-slate-700 text-xs text-gray-800 dark:text-white placeholder-gray-400 outline-none focus:border-green-400 transition" />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        <button onClick={() => setActiveCategory('Favorites')}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold border transition whitespace-nowrap ${
                activeCategory === 'Favorites' ? 'bg-red-500 text-white border-red-500 shadow-sm' : 'bg-white dark:bg-slate-800 text-red-500 border-red-100 dark:border-slate-700 hover:border-red-300'}`}>
              <Heart className={`w-3 h-3 ${activeCategory === 'Favorites' ? 'fill-white' : 'fill-red-500'}`} /><span>Favorites</span>
              {/*favorites.length > 0*/ false && <span className="ml-1 bg-white/20 px-1.5 rounded-md text-[9px]">{favorites.length}</span>}
            </button>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold border transition whitespace-nowrap ${
                  activeCategory === cat ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-gray-150 dark:border-slate-700 hover:border-gray-300'}`}>
                <span>{CAT_EMOJI[cat]}</span><span>{cat}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Product Listings ── */}
      <div className="max-w-4xl mx-auto px-4 w-full mt-3 space-y-5">
        {/* Banner */}
        <div className="relative rounded-3xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={bannerIdx} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.35 }}
              className={`bg-gradient-to-br ${banner.bg} p-5 rounded-3xl flex items-center justify-between min-h-[120px] relative overflow-hidden`}>
              <div className="relative z-10">
                <span className="text-[8px] font-black uppercase tracking-widest text-white/60 mb-1 block">{banner.tag}</span>
                <h3 className="text-white font-black text-sm leading-snug max-w-[190px]">{banner.title}</h3>
                <p className="text-white/70 text-[10px] mt-1 max-w-[190px]">{banner.subtitle}</p>
                <span className="mt-2 inline-flex items-center gap-1 bg-white/20 backdrop-blur text-white text-[9px] font-black px-2.5 py-1 rounded-full border border-white/30">{banner.badge}</span>
              </div>
              <BannerIcon className={`w-16 h-16 ${banner.iconColor} opacity-25 absolute right-4 top-1/2 -translate-y-1/2`} />
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center gap-1.5 mt-2">
            {BANNERS.map((_, i) => (
              <button key={i} onClick={() => setBannerIdx(i)} className={`rounded-full transition-all duration-300 ${i === bannerIdx ? 'w-4 h-1.5 bg-green-600' : 'w-1.5 h-1.5 bg-gray-300 dark:bg-slate-700'}`} />
            ))}
          </div>
        </div>

        {/* Popular */}
        {!searchQuery && activeCategory === 'All' && popular.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3"><span className="text-base">🔥</span><div><h2 className="text-xs font-black text-gray-900 dark:text-white">Popular Items</h2><p className="text-[9px] text-gray-400">Our most-loved picks</p></div></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {loading ? [1,2,3,4].map(k => <div key={k} className="h-48 bg-gray-100 dark:bg-slate-800 rounded-2xl animate-pulse" />) : popular.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* All Products */}
        <section>
          <div className="flex items-center gap-2 mb-3"><span className="text-base">🏪</span>
            <div><h2 className="text-xs font-black text-gray-900 dark:text-white">{searchQuery ? `Results for "${searchQuery}"` : activeCategory === 'All' ? 'All Products' : activeCategory}</h2><p className="text-[9px] text-gray-400">Everything for your home</p></div>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">{[1,2,3,4,5,6].map(k => <div key={k} className="h-52 bg-gray-100 dark:bg-slate-800 rounded-2xl animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl py-12 text-center"><p className="text-2xl mb-2">📦</p><p className="text-xs font-bold text-gray-500">No products found</p></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">{filtered.map(p => <ProductCard key={p.id} product={p} />)}</div>
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
            <button onClick={() => setSheet('cart')}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-2xl transition active:scale-[0.98]">
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
          SHEET 1: MY CART
      ══════════════════════════════════════════════ */}
      <BottomSheet open={sheet === 'cart'} onClose={() => setSheet('none')}>
        <div className="flex items-center justify-between px-5 pb-3 pt-1 border-b border-gray-100 dark:border-slate-800 shrink-0">
          <h3 className="font-black text-base text-gray-900 dark:text-white">My Cart <span className="text-green-600 text-sm">({cartCount} {cartCount === 1 ? 'item' : 'items'})</span></h3>
          <button onClick={() => setSheet('none')} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"><X className="w-4 h-4 text-gray-500" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {/* Free delivery banner */}
          {deliveryFee === 0 && subtotal > 0 && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-2xl px-4 py-2.5 flex items-center gap-2">
              <span className="text-lg">🎉</span>
              <span className="text-xs font-bold text-green-700 dark:text-green-400">Free delivery on this order!</span>
            </div>
          )}
          {storeSettings.delivery_threshold > 0 && subtotal > 0 && subtotal < storeSettings.delivery_threshold && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl px-4 py-2.5">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Add ₹{storeSettings.delivery_threshold - subtotal} more for <span className="underline">free delivery</span></p>
              <div className="mt-1.5 bg-amber-200/50 rounded-full h-1.5">
                <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, (subtotal / storeSettings.delivery_threshold) * 100)}%` }} />
              </div>
            </div>
          )}

          {/* Cart items */}
          {cart.map(item => (
            <div key={item.product.id} className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800/60 rounded-2xl p-3">
              <img src={item.product.image} alt={item.product.name} className="w-14 h-14 rounded-xl object-cover shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=80'; }} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-gray-900 dark:text-white line-clamp-1">{item.product.name}</p>
                <p className="text-[9px] text-gray-400 mt-0.5">₹{item.product.price} × {item.qty} = <span className="font-bold text-gray-700 dark:text-gray-300">₹{item.product.price * item.qty}</span></p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => removeFromCart(item.product.id)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition ${item.qty === 1 ? 'bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100' : 'bg-green-100 dark:bg-green-900/20 text-green-700 hover:bg-green-200'}`}>
                  {item.qty === 1 ? <Trash2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                </button>
                <span className="font-black text-xs w-6 text-center text-gray-900 dark:text-white">{item.qty}</span>
                <button onClick={() => addToCart(item.product)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-600 text-white hover:bg-green-700 transition">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Bill Details */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 space-y-2">
            <p className="text-xs font-black text-gray-900 dark:text-white mb-2">Bill Details</p>
            {[
              { label: 'Item total', value: `₹${subtotal}` },
              ...(storeSettings.delivery_fee > 0 || deliveryFee > 0 ? [{ label: 'Delivery fee', value: deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`, green: deliveryFee === 0 }] : []),
              ...(storeSettings.platform_fee > 0 ? [{ label: 'Platform fee', value: `₹${storeSettings.platform_fee}` }] : []),
            ].map(({ label, value, green }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{label}</span>
                <span className={`text-xs font-bold ${green ? 'text-green-600' : 'text-gray-800 dark:text-gray-200'}`}>{value}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 dark:border-slate-700 pt-2 flex items-center justify-between">
              <span className="text-sm font-black text-gray-900 dark:text-white">To Pay</span>
              <span className="text-sm font-black text-gray-900 dark:text-white">₹{total}</span>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 dark:border-slate-800 shrink-0">
          <button onClick={() => setSheet('address')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-black text-sm py-4 rounded-2xl transition active:scale-[0.98] flex items-center justify-between px-5 shadow-lg">
            <span>{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
            <span>Select Address →</span>
            <span>₹{total}</span>
          </button>
        </div>
      </BottomSheet>

      {/* ══════════════════════════════════════════════
          SHEET 2: DELIVERY ADDRESS
      ══════════════════════════════════════════════ */}
      <BottomSheet open={sheet === 'address'} onClose={() => setSheet('cart')}>
        <div className="flex items-center justify-between px-5 pb-3 pt-1 border-b border-gray-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setSheet('cart')} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"><ChevronLeft className="w-4 h-4 text-gray-600" /></button>
            <h3 className="font-black text-base text-gray-900 dark:text-white">Delivery Address</h3>
          </div>
          <button onClick={() => setSheet('none')} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"><X className="w-4 h-4 text-gray-500" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {!user && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl px-4 py-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400 font-bold">Please <button onClick={() => navigate('/login')} className="underline">login</button> to save addresses</p>
            </div>
          )}

          {/* Choose Address */}
          <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 dark:text-slate-500">SAVED ADDRESSES</p>
          {addresses.length === 0 && !showAddAddrForm && (
            <p className="text-xs text-gray-400 italic">No saved addresses yet</p>
          )}
          {addresses.map(addr => (
            <button key={addr.id} onClick={() => setSelectedAddr(addr)}
              className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition ${selectedAddr?.id === addr.id ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-green-300'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${selectedAddr?.id === addr.id ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'}`}><Home className="w-4 h-4" /></div>
              <div className="flex-1">
                <div className="flex items-center gap-2"><p className="font-bold text-xs text-gray-900 dark:text-white">{addr.label}</p>{selectedAddr?.id === addr.id && <Check className="w-3.5 h-3.5 text-green-600" />}</div>
                <p className="text-[10px] text-gray-500 mt-0.5">{addr.address}{addr.landmark ? `, ${addr.landmark}` : ''}</p>
                <p className="text-[10px] text-gray-400">{addr.city}, {addr.state} – {addr.pincode}</p>
              </div>
            </button>
          ))}

          {/* Add Address Button */}
          {!showAddAddrForm && (
            <button onClick={() => setShowAddAddrForm(true)}
              className="w-full border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl py-3.5 flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:border-green-400 hover:text-green-600 transition">
              <Plus className="w-4 h-4" /> Add New Address
            </button>
          )}

          {/* Add Address Form */}
          {showAddAddrForm && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-sm text-gray-900 dark:text-white">New Address</p>
                <button onClick={() => setShowAddAddrForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(['Home', 'Office', 'Other'] as const).map(l => (
                  <button key={l} onClick={() => setAddrForm(f => ({ ...f, label: l }))}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${addrForm.label === l ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400'}`}>{l}</button>
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
                  placeholder={placeholder} className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-700 text-xs text-gray-900 dark:text-white outline-none focus:border-green-400 transition" />
              ))}
              <button onClick={handleSaveAddress} disabled={savingAddr}
                className="w-full h-10 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-60">
                {savingAddr ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          )}

          {/* Delivery Notice */}
          <div className="bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700 rounded-2xl px-4 py-3 flex items-start gap-2">
            <Truck className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-slate-400">DELIVERY NOTICE</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Estimated delivery within 7 business days. Updates via WhatsApp.</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 dark:border-slate-800 shrink-0">
          <button onClick={() => selectedAddr && setSheet('review')} disabled={!selectedAddr}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-black text-sm py-4 rounded-2xl transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
            Review Summary →
          </button>
        </div>
      </BottomSheet>

      {/* ══════════════════════════════════════════════
          SHEET 3: REVIEW SUMMARY
      ══════════════════════════════════════════════ */}
      <BottomSheet open={sheet === 'review'} onClose={() => setSheet('address')}>
        <div className="flex items-center justify-between px-5 pb-3 pt-1 border-b border-gray-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setSheet('address')} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"><ChevronLeft className="w-4 h-4 text-gray-600" /></button>
            <h3 className="font-black text-base text-gray-900 dark:text-white">Review Summary</h3>
          </div>
          <button onClick={() => setSheet('none')} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"><X className="w-4 h-4 text-gray-500" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Deliver To */}
          {selectedAddr && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
              <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-slate-700">
                <div className="p-4">
                  <p className="text-[8px] font-black uppercase tracking-wider text-gray-400 mb-1">DELIVER TO</p>
                  <p className="text-xs font-bold text-gray-800 dark:text-white">{selectedAddr.label} – {selectedAddr.address?.split(',')[0]}</p>
                </div>
                <div className="p-4">
                  <p className="text-[8px] font-black uppercase tracking-wider text-gray-400 mb-1">EST. DELIVERY</p>
                  <p className="text-xs font-bold text-green-600">Within 7 business days</p>
                </div>
              </div>
            </div>
          )}

          {/* Total Bill */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <span className="font-black text-sm text-gray-900 dark:text-white">Total Bill</span>
              <span className="font-black text-sm text-green-600">₹{total}</span>
            </div>
            <div className="space-y-1.5">
              {[
                { label: 'Item total', value: `₹${subtotal}` },
                ...(storeSettings.delivery_fee > 0 || deliveryFee > 0 ? [{ label: 'Delivery fee', value: deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`, green: deliveryFee === 0 }] : []),
                ...(storeSettings.platform_fee > 0 ? [{ label: 'Platform fee', value: `₹${storeSettings.platform_fee}` }] : []),
                ...(discount > 0 ? [{ label: 'Coupon discount', value: `-₹${discount}`, green: true }] : []),
              ].map(({ label, value, green }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500">{label}</span>
                  <span className={`text-[10px] font-bold ${green ? 'text-green-600' : 'text-gray-700 dark:text-gray-300'}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 px-4 py-3">
            <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-3">ITEMS ({cart.length})</p>
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <img src={item.product.image} alt={item.product.name} className="w-8 h-8 rounded-lg object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=40'; }} />
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-gray-800 dark:text-white line-clamp-1">{item.product.name}</p>
                    <p className="text-[9px] text-gray-400">Qty: {item.qty}</p>
                  </div>
                  <span className="text-xs font-bold text-gray-800 dark:text-white">₹{item.product.price * item.qty}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 px-4 py-3">
            <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-3">PAYMENT METHOD</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PAYMENT_METHODS.map(m => (
                <div key={m.id} className="relative group">
                  <button onClick={() => m.available && setPayMethod(m.id)}
                    disabled={!m.available}
                    className={`w-full p-2.5 rounded-xl border-2 flex items-center gap-2 text-left transition 
                      ${!m.available ? 'opacity-50 cursor-not-allowed border-gray-100 dark:border-slate-700' : 
                        (payMethod === m.id ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-gray-100 dark:border-slate-700 hover:border-green-300')}
                    `}>
                    <span className="text-base">{m.icon}</span>
                    <div>
                      <p className="text-[9px] font-black text-gray-900 dark:text-white leading-none">{m.label}</p>
                      <p className="text-[8px] text-gray-400 mt-0.5">{m.desc}</p>
                    </div>
                  </button>
                  {!m.available && (
                    <div className="absolute -top-2 -right-2">
                      <span className="bg-red-100 text-red-600 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-red-200 shadow-sm whitespace-nowrap">Currently Unavailable</span>
                    </div>
                  )}
                  {m.id === 'phonepe' && (
                    <div className="absolute -top-2 -right-2">
                      <span className="bg-blue-100 text-blue-700 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-blue-200 shadow-sm whitespace-nowrap">Recommended</span>
                    </div>
                  )}
                  {!m.available && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max max-w-[150px] bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-center">
                      {m.label === 'Cash on Delivery' ? 'Cash on Delivery is currently unavailable.' : 'Card payments are currently unavailable.'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-2xl px-4 py-2.5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
            <p className="text-[10px] text-green-700 dark:text-green-400 font-bold">Verified concierge delivery. Pay securely upon confirmation.</p>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 dark:border-slate-800 shrink-0">
          <button onClick={handleProceedToPayment} disabled={placingOrder}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-black text-sm py-4 rounded-2xl transition active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg disabled:opacity-60">
            <ShieldCheck className="w-4 h-4" />
            {placingOrder ? 'Placing Order...' : `Confirm & Pay ₹${total}`}
          </button>
        </div>
      </BottomSheet>

      {/* ══════════════════════════════════════════════
          SHEET 4: PAYMENT (UPI / QR / UTR)
      ══════════════════════════════════════════════ */}
      <BottomSheet open={sheet === 'payment'} onClose={() => {}}>
        <div className="flex items-center justify-between px-5 pb-3 pt-1 border-b border-gray-100 dark:border-slate-800 shrink-0">
          <h3 className="font-black text-base text-gray-900 dark:text-white">Complete Payment</h3>
          <div className={`text-sm font-black px-3 py-1 rounded-full ${countdown > 60 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{fmtCountdown}</div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Amount */}
          <div className="bg-green-600 rounded-2xl p-4 text-center text-white">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1">AMOUNT TO PAY</p>
            <p className="text-3xl font-black">₹{total}</p>
            <p className="text-[10px] opacity-70 mt-1">Order {placedOrder?.id}</p>
          </div>

          {/* QR Code */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-3"><QrCode className="w-4 h-4 text-gray-600 dark:text-gray-300" /><p className="font-bold text-sm text-gray-900 dark:text-white">Scan QR Code</p></div>
            <div className="flex flex-col items-center">
              <div className="w-44 h-44 bg-white border-4 border-gray-100 rounded-2xl p-2 flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${total}&cu=INR&tn=HomeSeva+Order+${placedOrder?.id}`}
                  alt="UPI QR Code" className="w-full h-full rounded-xl"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="text-center">
                  <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-wider">{UPI_NAME}</p>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{UPI_ID}</p>
                </div>
                <button onClick={copyUpiId} className="w-7 h-7 flex items-center justify-center bg-green-100 dark:bg-green-900/20 rounded-lg text-green-700">
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[9px] text-gray-400 mt-1">Pay using Google Pay, PhonePe, Paytm, or any UPI app</p>
            </div>
          </div>

          {/* Upload Screenshot */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-3"><Upload className="w-4 h-4 text-gray-600 dark:text-gray-300" /><p className="font-bold text-sm text-gray-900 dark:text-white">Upload Payment Screenshot</p></div>
            <label className="block cursor-pointer">
              <input type="file" accept="image/*" onChange={handleScreenshotChange} className="hidden" />
              {screenshotPreview ? (
                <div className="relative">
                  <img src={screenshotPreview} alt="Payment screenshot" className="w-full h-40 object-cover rounded-xl" />
                  <div className="absolute top-2 right-2 bg-green-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    {uploadingScreenshot ? <><RefreshCw className="w-2.5 h-2.5 animate-spin" /> Uploading</> : <><Check className="w-2.5 h-2.5" /> Uploaded</>}
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl py-6 flex flex-col items-center gap-2 hover:border-green-400 transition">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <p className="text-xs font-bold text-gray-500">Tap to upload screenshot</p>
                  <p className="text-[9px] text-gray-400">JPG, PNG up to 5MB</p>
                </div>
              )}
            </label>
          </div>

          {/* Real UTR Verification Flow */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">

            {!showUtrInput ? (
              <>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center mb-3">After scanning and paying on your UPI app, tap the button below.</p>
                <button
                  onClick={handleDetectPayment}
                  disabled={detectingPayment}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm py-4 rounded-xl transition active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg disabled:opacity-80"
                >
                  {detectingPayment ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Listening for Google Pay...
                    </div>
                  ) : 'I have scanned and paid'}
                </button>
              </>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <div className="flex items-center gap-2 mb-2"><Smartphone className="w-4 h-4 text-gray-600 dark:text-gray-300" /><p className="font-bold text-sm text-gray-900 dark:text-white">Enter UTR / Reference Number</p></div>
                  <input value={utrInput} onChange={e => setUtrInput(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    placeholder="12-digit UPI UTR number" maxLength={12}
                    className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-slate-900 border-2 border-gray-150 dark:border-slate-700 text-sm font-bold font-mono tracking-widest text-center outline-none focus:border-green-500 transition" />
                  <p className="text-[9px] text-gray-400 mt-1.5 text-center">Please enter the 12-digit reference number from your bank app.</p>
                </div>
                
                <button onClick={() => handleSubmitPayment()} disabled={placingOrder || !utrInput || utrInput.length < 12}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-black text-sm py-4 rounded-xl transition active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg disabled:opacity-60">
                  {placingOrder ? 'Submitting...' : 'Submit Payment for Verification'}
                </button>
                <p className="text-gray-500 text-sm mt-2">
                  Your payment will be verified instantly via bank logs.
                </p>
              </div>
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
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${payMethod === 'cod' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                  {payMethod === 'cod' ? 'Cash on Delivery' : 'Verification Pending'}
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
