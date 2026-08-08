const fs = require('fs');
const path = require('path');

const mealsFile = path.join(__dirname, 'src', 'pages', 'MealsPage.tsx');
let mealsCode = fs.readFileSync(mealsFile, 'utf8');

const storeFile = path.join(__dirname, 'src', 'pages', 'StorePage.tsx');
const storeCode = fs.readFileSync(storeFile, 'utf8');

// 1. Extract BottomSheet & Constants from StorePage
const constantsBlock = `
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
`;

// Insert constants before export function MealsPage
mealsCode = mealsCode.replace('export function MealsPage() {', constantsBlock + '\nexport function MealsPage() {');

// 2. Add missing imports
const missingImports = `
import axios from 'axios';
import { apiClient } from '../services/apiClient';
import { 
  ChevronLeft, X, Package, Trash2, Copy, Upload, AlertCircle, QrCode, Smartphone, Truck, RefreshCw, Star, CookingPot
} from 'lucide-react';
`;
mealsCode = mealsCode.replace("import { useToast } from '../context/ToastContext';", "import { useToast } from '../context/ToastContext';\n" + missingImports);

// 3. Add states and functions inside MealsPage
const statesAndFunctions = `
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
      apiClient.getAddresses().then(res => {
        if (res.data?.success) {
          setAddresses(res.data.addresses || []);
          if (res.data.addresses?.length > 0) setSelectedAddr(res.data.addresses[0]);
        }
      }).catch(() => {});
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
      const res = await apiClient.addAddress(addrForm);
      if (res.data?.success) {
        toast('Address saved successfully', 'success');
        setAddresses(prev => [...prev, res.data.address]);
        setSelectedAddr(res.data.address);
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
        const res = await apiClient.uploadStoreScreenshot(formData);
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
      const verifyRes = await apiClient.verifyStoreRazorpayPayment({ razorpay_payment_id: pid, razorpay_order_id: oid, razorpay_signature: sig });
      if (verifyRes.data?.success) {
        toast('Payment Verified Successfully!', 'success');
        
        // Place the final order in DB
        const items = mealCart.map(i => ({ id: i.meal.id, name: i.meal.name, quantity: i.qty, price: i.meal.price }));
        const orderRes = await apiClient.placeStoreOrder({
          items, address: selectedAddr, subtotal, delivery_fee: deliveryFee, platform_fee: storeSettings.platform_fee,
          gst: 0, coupon, discount, total, payment_method: 'phonepe_razorpay',
          notes: 'Meal Order paid via Razorpay', utr_number: pid
        });
        
        setPlacedOrder(orderRes.data);
        setMealCart([]);
        setSheet('success');
      } else {
        toast('Payment verification failed on server.', 'error');
      }
    } catch (err: any) {
      console.error(err);
      toast('Payment verification failed.', 'error');
    } finally {
      setPlacingOrder(false);
    }
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
        const res = await apiClient.createStoreCheckout({ amount: total });
        const { order, key } = res.data;
        const options = {
          key: key,
          amount: order.amount,
          currency: order.currency,
          name: "Bhale Padharya",
          description: "Meal Order Payment",
          order_id: order.id,
          handler: function (response: any) {
            verifyRazorpay(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
          },
          prefill: { name: user?.name || '', email: user?.email || '', contact: user?.mobile || '' },
          theme: { color: "#3399cc" }
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
`;

// Insert the states
mealsCode = mealsCode.replace('const [dbMeals, setDbMeals] = useState<MealItem[]>(SAMPLE_MEALS);', 'const [dbMeals, setDbMeals] = useState<MealItem[]>(SAMPLE_MEALS);\n' + statesAndFunctions);

// 4. Extract Sheets from StorePage
const sheetStartStr = '4-STEP STORE CHECKOUT WIZARD';
const sheetStartIndex = storeCode.indexOf(sheetStartStr);
const actualStart = storeCode.lastIndexOf('{/*', sheetStartIndex);
const sheetEndIndex = storeCode.lastIndexOf('</BottomSheet>') + 14;

if (actualStart !== -1 && sheetEndIndex !== -1) {
  let sheetsBlock = storeCode.substring(actualStart, sheetEndIndex);
  
  // Replace cart stuff for meals
  sheetsBlock = sheetsBlock.replace(/cart\.length/g, 'mealCart.length');
  sheetsBlock = sheetsBlock.replace(/cart\.map/g, 'mealCart.map');
  sheetsBlock = sheetsBlock.replace(/cart\.reduce/g, 'mealCart.reduce');
  sheetsBlock = sheetsBlock.replace(/item\.product\.name/g, 'item.meal.name');
  sheetsBlock = sheetsBlock.replace(/item\.product\.image/g, 'item.meal.image');
  sheetsBlock = sheetsBlock.replace(/item\.product\.price/g, 'item.meal.price');
  sheetsBlock = sheetsBlock.replace(/item\.product\.id/g, 'item.meal.id');
  sheetsBlock = sheetsBlock.replace(/item\.product/g, 'item.meal');
  sheetsBlock = sheetsBlock.replace(/updateQty\(/g, 'updateMealQty(');
  sheetsBlock = sheetsBlock.replace(/setCart\(\[\]\)/g, 'setMealCart([])');
  sheetsBlock = sheetsBlock.replace(/removeFromCart\(item\.meal\.id\)/g, 'updateMealQty(item.meal.id, -item.qty)');

  const stickyBottomBar = `
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
`;

  // Inject before the final div closure in MealsPage
  mealsCode = mealsCode.replace('    </div>\n  );\n}', stickyBottomBar + '\n' + sheetsBlock + '\n    </div>\n  );\n}');
  fs.writeFileSync(mealsFile, mealsCode);
  console.log('Successfully injected BottomSheets and Cart Bar.');
} else {
  console.log('Failed to find exact block limits for BottomSheet.');
}
