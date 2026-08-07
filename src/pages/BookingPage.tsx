import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  ChevronLeft,
  ShieldCheck,
  Sparkles,
  QrCode,
  Smartphone,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../context/ToastContext';
import { services, coupons, savedAddresses } from '../data/sampleData';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import { processUPIPayment } from '../services/razorpay';
import type { Service, SavedAddress } from '../types';

const steps = ['Schedule', 'Address', 'Coupon', 'Payment'];

const timeSlots = [
  '09:00 AM - 10:30 AM',
  '10:30 AM - 12:00 PM',
  '12:00 PM - 01:30 PM',
  '02:00 PM - 03:30 PM',
  '04:00 PM - 05:30 PM',
  '06:00 PM - 07:30 PM',
];

function nextDays(count: number) {
  const days: { date: string; day: string; weekday: string; today: boolean }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      date: d.toISOString().slice(0, 10),
      day: d.toLocaleDateString('en-IN', { day: 'numeric' }),
      weekday: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      today: i === 0,
    });
  }
  return days;
}

function getSlotStartTimeIST(dateStr: string, slotStr: string): Date | null {
  if (!slotStr) return null;
  const startPart = slotStr.split(' - ')[0]; // e.g. "09:00 AM"
  const match = startPart.match(/^(\d{2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  
  const pad = (n: number) => String(n).padStart(2, '0');
  const isoStr = `${dateStr}T${pad(hours)}:${pad(minutes)}:00+05:30`;
  return new Date(isoStr);
}

function isSlotInvalidIST(dateStr: string, slotStr: string): boolean {
  const startTime = getSlotStartTimeIST(dateStr, slotStr);
  if (!startTime) return true;
  
  const now = new Date();
  const diffMs = startTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  return diffHours < 2;
}

export function BookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .getServices()
      .then((data) => {
        setServicesList(data);
        setLoading(false);
      })
      .catch(() => {
        setServicesList(services);
        setLoading(false);
      });
  }, []);

  // Reset selected slot if it becomes invalid on date change
  useEffect(() => {
    if (slot && isSlotInvalidIST(selectedDate, slot)) {
      setSlot('');
    }
  }, [selectedDate]);

  const service = servicesList.find((s) => s.slug === slug);

  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState(nextDays(1)[0].date);
  const [slot, setSlot] = useState('');
  const addresses = useMemo<SavedAddress[]>(() => {
    try {
      const stored = localStorage.getItem('homeseva.addresses');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return savedAddresses;
  }, []);

  const [addressId, setAddressId] = useState(addresses[0]?.id ?? '');
  const [newAddr, setNewAddr] = useState({ label: '', address: '', city: '', pincode: '' });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<(typeof coupons)[0] | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  const days = useMemo(() => nextDays(10), []);
  const discount = useMemo(() => {
    if (!appliedCoupon || !service) return 0;
    if (appliedCoupon.type === 'flat') return appliedCoupon.discount;
    const pct = Math.round((service.price * appliedCoupon.discount) / 100);
    return Math.min(pct, appliedCoupon.maxDiscount);
  }, [appliedCoupon, service]);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center p-6 text-sm font-bold">Loading booking details...</div>;
  }

  if (!service) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <EmptyState title="Service not found" action={<Button onClick={() => navigate('/services')}>Browse services</Button>} />
      </div>
    );
  }

  const total = service.price - discount;

  const applyCoupon = () => {
    const c = coupons.find((x) => x.code === couponCode.toUpperCase());
    if (!c) {
      toast('Invalid coupon code', 'error');
      return;
    }
    if (service.price < c.minOrder) {
      toast(`Minimum order ₹${c.minOrder} required`, 'error');
      return;
    }
    setAppliedCoupon(c);
    toast(`Coupon ${c.code} applied! Saved ₹${discount || c.discount}`, 'success');
  };

  const canProceed = () => {
    if (step === 0) return !!slot;
    if (step === 1) return !!addressId || (!!newAddr.address && !!newAddr.pincode);
    return true;
  };

  const handleContinue = () => {
    if (step === 0) {
      if (!slot) {
        toast('Please select a time slot', 'error');
        return;
      }
      if (isSlotInvalidIST(selectedDate, slot)) {
        toast('Please select a valid time slot', 'error');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleRazorpayUPIPayment = async () => {
    if (isSlotInvalidIST(selectedDate, slot)) {
      toast('Please select a valid time slot', 'error');
      setStep(0);
      return;
    }

    if (!user) {
      toast('Please sign in to complete booking', 'error');
      navigate('/login');
      return;
    }

    let finalAddressObj: any = {};
    if (addressId) {
      const addr = addresses.find((a) => a.id === addressId);
      finalAddressObj = {
        street: addr?.address || 'Selected Saved Address',
        city: addr?.city || 'Mumbai',
        state: 'Maharashtra',
        pincode: addr?.pincode || '400001',
        fullAddress: addr ? `${addr.address}, ${addr.city} - ${addr.pincode}` : '',
      };
    } else {
      finalAddressObj = {
        street: newAddr.address,
        city: newAddr.city || 'Mumbai',
        state: 'Maharashtra',
        pincode: newAddr.pincode,
        fullAddress: `${newAddr.address}, ${newAddr.city} - ${newAddr.pincode}`,
      };
    }

    setProcessingPayment(true);
    toast('Initializing Razorpay Secure UPI Gateway...', 'info');

    processUPIPayment({
      productName: service.name,
      productId: service.id,
      amount: total,
      discount: discount,
      customerName: user.name || 'Valued Customer',
      email: user.email || 'customer@bhalepadharya.com',
      phoneNumber: (user as any)?.phone || '9876543210',
      address: finalAddressObj,
      bookingDate: selectedDate,
      bookingTime: slot,
      showAllMethods: false,
      onSuccess: (resData) => {
        setProcessingPayment(false);
        toast('Payment Verified & Booking Confirmed!', 'success');
        navigate(
          `/payment/success?bookingId=${resData.bookingId}&invoiceNumber=${resData.invoiceNumber}&paymentId=${resData.booking?.razorpayPaymentId || ''}&orderId=${resData.booking?.razorpayOrderId || ''}&product=${encodeURIComponent(service.name)}`
        );
      },
      onFailure: (errMsg) => {
        setProcessingPayment(false);
        if (errMsg.includes('CANCELLED_BY_USER') || errMsg.toLowerCase().includes('cancelled by customer')) {
          const cleanMsg = errMsg.replace('CANCELLED_BY_USER: ', '');
          toast(cleanMsg || 'Payment cancelled. Your slot and details are saved—click Pay to try again.', 'info');
          return;
        }
        toast(errMsg, 'error');
        navigate(`/payment/failed?error=${encodeURIComponent(errMsg)}&slug=${slug}`);
      },
    });
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 pb-28 relative">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[10px] text-brand-600 dark:text-brand-400 font-extrabold uppercase tracking-wider">Book Service</span>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">{service.name}</h1>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-gray-400 font-extrabold uppercase">Base Price</span>
          <p className="text-lg font-black text-brand-600 dark:text-brand-400">₹{service.price}</p>
        </div>
      </div>

      {/* Smooth Gliding Stepper */}
      <div className="w-full mb-10 mt-4 px-2 sm:px-4">
        <div className="relative">
          {/* Background Track */}
          <div className="absolute top-5 sm:top-5 left-[12%] right-[12%] h-1.5 bg-gray-200 rounded-full z-0 overflow-hidden shadow-inner">
            {/* Smooth Gliding Progress Bar */}
            <div
              className="h-full bg-gradient-to-r from-brand-600 via-indigo-600 to-emerald-500 rounded-full transition-all duration-700 ease-in-out shadow-xs"
              style={{
                width: step === 0 ? '0%' : step === 1 ? '33.33%' : step === 2 ? '66.66%' : '100%',
              }}
            />
          </div>

          {/* Step Nodes */}
          <div className="relative z-10 flex items-center justify-between w-full">
            {steps.map((st, i) => {
              const isCompleted = i < step;
              const isCurrent = i === step;
              return (
                <div key={st} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold transition-all duration-500 transform ${
                      isCurrent
                        ? 'bg-brand-600 text-white ring-8 ring-brand-500/20 shadow-lg shadow-brand-500/40 scale-110'
                        : isCompleted
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30 ring-4 ring-emerald-100'
                        : 'bg-white border-2 border-gray-300 text-gray-400 shadow-xs'
                    }`}
                  >
                    {isCompleted ? '✓' : i + 1}
                  </div>
                  <span
                    className={`mt-2 text-xs sm:text-sm font-extrabold transition-colors duration-300 ${
                      isCurrent ? 'text-brand-600 font-black' : isCompleted ? 'text-emerald-700 font-bold' : 'text-gray-400 font-medium'
                    }`}
                  >
                    {st}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Contents */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-150 dark:border-slate-800 shadow-sm min-h-[380px]">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {/* STEP 0: SCHEDULE */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 mb-3">
                    <Calendar className="w-4 h-4 text-brand-600" /> Select Date
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {days.map((d) => (
                      <button
                        key={d.date}
                        onClick={() => setSelectedDate(d.date)}
                        className={`flex-1 min-w-[70px] p-3 rounded-2xl border text-center transition active-scale ${
                          selectedDate === d.date
                            ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-extrabold'
                            : 'border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                        }`}
                      >
                        <span className="block text-[10px] uppercase">{d.weekday}</span>
                        <span className="block text-lg font-black">{d.day}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 mb-3">
                    <Clock className="w-4 h-4 text-brand-600" /> Select Time Slot
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {timeSlots.map((ts) => {
                      const disabled = isSlotInvalidIST(selectedDate, ts);
                      return (
                        <button
                          key={ts}
                          disabled={disabled}
                          onClick={() => setSlot(ts)}
                          className={`p-3 rounded-2xl border text-xs text-left transition font-semibold ${
                            disabled
                              ? 'opacity-40 cursor-not-allowed border-gray-150 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 text-gray-400'
                              : slot === ts
                              ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-bold active-scale'
                              : 'border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 active-scale'
                          }`}
                        >
                          {ts}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: ADDRESS */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 mb-3">
                    <MapPin className="w-4 h-4 text-brand-600" /> Saved Addresses
                  </label>
                  <div className="space-y-2.5">
                    {addresses.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setAddressId(a.id)}
                        className={`w-full text-left p-4 rounded-2xl border transition flex items-start gap-3 active-scale ${
                          addressId === a.id
                            ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40'
                            : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 ${addressId === a.id ? 'border-brand-600 bg-brand-600' : 'border-gray-300'}`} />
                        <div>
                          <Badge tone="gray" className="mb-1 text-[9px] uppercase">{a.label}</Badge>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">{a.address}</p>
                          <p className="text-[10px] text-gray-500">{a.city} - {a.pincode}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-150 dark:border-slate-800">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3">Or Add New Address</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Input placeholder="House / Street" value={newAddr.address} onChange={(e) => { setAddressId(''); setNewAddr({ ...newAddr, address: e.target.value }); }} />
                    <Input placeholder="City" value={newAddr.city} onChange={(e) => { setAddressId(''); setNewAddr({ ...newAddr, city: e.target.value }); }} />
                    <Input placeholder="Pincode" value={newAddr.pincode} onChange={(e) => { setAddressId(''); setNewAddr({ ...newAddr, pincode: e.target.value }); }} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: COUPON */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 mb-3">
                    <Tag className="w-4 h-4 text-brand-600" /> Apply Coupon Code
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="ENTER COUPON"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="uppercase font-mono tracking-wider"
                    />
                    <Button onClick={applyCoupon} className="shrink-0 font-bold">Apply</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-gray-500 uppercase">Available Coupons</p>
                  {coupons.map((c) => (
                    <div key={c.code} className="p-3.5 rounded-2xl border border-dashed border-brand-300 dark:border-brand-900 bg-brand-50/50 dark:bg-brand-950/20 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-black text-xs text-brand-600 dark:text-brand-400">{c.code}</span>
                        <p className="text-[10px] text-gray-500">{c.description}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => { setCouponCode(c.code); setAppliedCoupon(c); }} className="text-xs text-brand-600 font-bold">
                        Use Code
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT (RAZORPAY UPI ONLY) */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-indigo-500" /> Razorpay Unified Payments (UPI Only)
                    </label>
                    <Badge tone="green" className="text-[10px] uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Strict Security
                    </Badge>
                  </div>

                  {/* UPI Gateway Card */}
                  <div className="p-5 rounded-2xl border-2 border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-600/20">
                          <QrCode className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white">UPI Payment Gateway</h4>
                          <p className="text-[11px] text-indigo-600 dark:text-indigo-300 font-medium">Instant & Encrypted via Razorpay SDK</p>
                        </div>
                      </div>
                      <CheckCircle2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-indigo-200/60 dark:border-indigo-900/60 text-center text-[10px] font-bold text-gray-700 dark:text-gray-300">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950">Google Pay</div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950">PhonePe</div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950">Paytm</div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950">BHIM / QR</div>
                    </div>

                    <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300">
                      <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Cards, Net Banking, EMI, and Wallets are completely disabled. Razorpay signature verification protects your order.</span>
                    </div>
                  </div>
                </div>

                {/* Bill Summary */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-150 dark:border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Base Service Price:</span>
                    <span>₹{service.price}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>GST (18% Included/Tax):</span>
                    <span>₹{Math.round(service.price * 0.18)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>Applied Coupon Discount:</span>
                      <span>- ₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-slate-800 text-sm font-black text-gray-900 dark:text-white">
                    <span>Total Amount Payable:</span>
                    <span className="text-indigo-600 dark:text-indigo-400">₹{total}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Floating Bar */}
      <div className="fixed bottom-0 inset-x-0 h-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-gray-150 dark:border-slate-800/60 px-6 py-3 z-40 flex items-center justify-between max-w-3xl mx-auto">
        <div>
          <span className="text-[9px] text-gray-400 font-extrabold uppercase">Total Payable</span>
          <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">₹{total}</p>
        </div>

        <div className="flex gap-2">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="h-12 w-12 rounded-xl flex items-center justify-center">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}

          {step < steps.length - 1 ? (
            <Button
              onClick={handleContinue}
              disabled={step === 0 ? !slot : !canProceed()}
              className="h-12 px-6 rounded-xl font-bold active-scale"
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleRazorpayUPIPayment}
              loading={processingPayment}
              className="h-12 px-6 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white active-scale shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4" /> Pay & Confirm via Razorpay UPI
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
