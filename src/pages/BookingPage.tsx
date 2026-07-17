import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  CreditCard,
  Wallet,
  Banknote,
  ChevronLeft,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../context/ToastContext';
import { services, coupons, savedAddresses } from '../data/sampleData';

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

export function BookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const service = services.find((s) => s.slug === slug);

  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState(nextDays(1)[0].date);
  const [slot, setSlot] = useState('');
  const [addressId, setAddressId] = useState(savedAddresses[0]?.id ?? '');
  const [newAddr, setNewAddr] = useState({ label: '', address: '', city: '', pincode: '' });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<typeof coupons[0] | null>(null);
  const [payment, setPayment] = useState<'card' | 'upi' | 'cash'>('upi');

  const days = useMemo(() => nextDays(10), []);
  const discount = useMemo(() => {
    if (!appliedCoupon || !service) return 0;
    if (appliedCoupon.type === 'flat') return appliedCoupon.discount;
    const pct = Math.round((service.price * appliedCoupon.discount) / 100);
    return Math.min(pct, appliedCoupon.maxDiscount);
  }, [appliedCoupon, service]);

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
    if (!c) { toast('Invalid coupon code', 'error'); return; }
    if (service.price < c.minOrder) { toast(`Minimum order ₹${c.minOrder} required`, 'error'); return; }
    setAppliedCoupon(c);
    toast(`Coupon ${c.code} applied! Saved ₹${discount || c.discount}`, 'success');
  };

  const canProceed = () => {
    if (step === 0) return !!slot;
    if (step === 1) return !!addressId || (!!newAddr.address && !!newAddr.pincode);
    return true;
  };

  const confirmBooking = () => {
    toast('Booking confirmed! Check your dashboard for details.', 'success');
    navigate('/dashboard?tab=bookings');
  };

  return (
    <div className="flex flex-col flex-1 bg-gray-50 dark:bg-slate-950 p-4 pb-28 relative select-none">
      
      {/* Compact Top Header & Stepper */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Step {step + 1} of 4</p>
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white mt-0.5">{steps[step]}</h2>
        </div>
        {/* Simple Progress Ring/Bar indicator */}
        <div className="w-20 h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-brand-600 transition-all duration-300" style={{ width: `${((step + 1) / 4) * 100}%` }} />
        </div>
      </div>

      {/* Main Content (Step dependent) */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Step 0: Date & Time Slots */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-1.5">
                    <Calendar className="w-4.5 h-4.5 text-brand-600" /> Select Date
                  </h3>
                  <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
                    {days.map((d) => (
                      <button
                        key={d.date}
                        onClick={() => setSelectedDate(d.date)}
                        className={`shrink-0 w-15 py-3 rounded-2xl border text-center transition active-scale ${
                          selectedDate === d.date
                            ? 'border-brand-650 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                            : 'border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-650'
                        }`}
                      >
                        <p className="text-[9px] text-gray-400 font-bold uppercase">{d.weekday}</p>
                        <p className="text-base font-black mt-0.5">{d.day}</p>
                        {d.today && <p className="text-[8px] font-extrabold text-brand-600 mt-0.5">Today</p>}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-1.5">
                    <Clock className="w-4.5 h-4.5 text-brand-600" /> Select Time Slot
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {timeSlots.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSlot(s)}
                        className={`py-3.5 px-3 rounded-2xl border text-center text-xs font-bold transition active-scale ${
                          slot === s
                            ? 'border-brand-650 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                            : 'border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Address selection */}
            {step === 1 && (
              <div className="space-y-5">
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                  <MapPin className="w-4.5 h-4.5 text-brand-600" /> Service Location
                </h3>
                
                <div className="space-y-3">
                  {savedAddresses.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setAddressId(a.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition flex items-start gap-3 active-scale ${
                        addressId === a.id
                          ? 'border-brand-650 bg-brand-50 dark:bg-brand-950/40'
                          : 'border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                        addressId === a.id ? 'border-brand-600' : 'border-gray-350'
                      }`}>
                        {addressId === a.id && <div className="w-2.5 h-2.5 rounded-full bg-brand-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs flex items-center gap-2">
                          {a.label}
                          {a.isDefault && <Badge tone="brand" className="text-[8px] py-0.5 px-1">Default</Badge>}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{a.address}, {a.city} - {a.pincode}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-150 dark:border-slate-850">
                  <p className="font-extrabold text-xs text-gray-500 mb-3">Or create a new address</p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Label (e.g. Home)" value={newAddr.label} onChange={(e) => { setAddressId(''); setNewAddr({ ...newAddr, label: e.target.value }); }} />
                      <Input label="Pincode" placeholder="400050" value={newAddr.pincode} onChange={(e) => { setAddressId(''); setNewAddr({ ...newAddr, pincode: e.target.value }); }} />
                    </div>
                    <Input label="Full Address Details" placeholder="House no, block, area..." value={newAddr.address} onChange={(e) => { setAddressId(''); setNewAddr({ ...newAddr, address: e.target.value }); }} />
                    <Input label="City" placeholder="Mumbai" value={newAddr.city} onChange={(e) => { setAddressId(''); setNewAddr({ ...newAddr, city: e.target.value }); }} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Coupons */}
            {step === 2 && (
              <div className="space-y-5">
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Tag className="w-4.5 h-4.5 text-brand-600" /> Apply Coupon
                </h3>

                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="ENTER COUPON CODE"
                    className="flex-1 h-11 px-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 text-xs font-bold uppercase tracking-wider outline-none"
                  />
                  <Button variant="outline" onClick={applyCoupon} className="h-11 px-5 rounded-xl font-bold">
                    Apply
                  </Button>
                </div>

                {appliedCoupon && (
                  <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/30 p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4.5 h-4.5 text-emerald-605" />
                      <div>
                        <p className="font-bold text-xs text-emerald-800 dark:text-emerald-350">{appliedCoupon.code} Applied</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-450 mt-0.5">{appliedCoupon.description}</p>
                      </div>
                    </div>
                    <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="text-xs text-emerald-700 font-bold hover:underline">
                      Remove
                    </button>
                  </div>
                )}

                <div className="pt-2">
                  <p className="font-extrabold text-xs text-gray-500 mb-3">Available Offers</p>
                  <div className="space-y-2.5">
                    {coupons.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => { setCouponCode(c.code); setAppliedCoupon(c); toast(`Coupon ${c.code} applied!`, 'success'); }}
                        className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center justify-between active-scale ${
                          appliedCoupon?.code === c.code
                            ? 'border-emerald-350 bg-emerald-50 dark:bg-emerald-950/30'
                            : 'border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-xs text-gray-900 dark:text-white">{c.code}</p>
                          <p className="text-[10px] text-gray-550 dark:text-gray-400 mt-0.5">{c.description}</p>
                        </div>
                        <Tag className="w-4 h-4 text-brand-650 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                  <CreditCard className="w-4.5 h-4.5 text-brand-600" /> Payment Selection
                </h3>

                <div className="space-y-3">
                  {[
                    { id: 'upi', label: 'UPI Payment', desc: 'Pay instantly via GPay, PhonePe, Paytm', icon: Wallet },
                    { id: 'card', label: 'Credit / Debit Card', desc: 'Secure card checkout via Stripe', icon: CreditCard },
                    { id: 'cash', label: 'Cash on Service', desc: 'Pay helper directly after work is done', icon: Banknote },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setPayment(m.id as typeof payment)}
                      className={`w-full text-left p-4 rounded-2xl border transition flex items-center gap-3 active-scale ${
                        payment === m.id
                          ? 'border-brand-650 bg-brand-50 dark:bg-brand-950/40'
                          : 'border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                        payment === m.id ? 'border-brand-600' : 'border-gray-350'
                      }`}>
                        {payment === m.id && <div className="w-2 h-2 rounded-full bg-brand-600" />}
                      </div>
                      <m.icon className="w-4.5 h-4.5 text-gray-400 shrink-0" />
                      <div>
                        <p className="font-bold text-xs text-gray-900 dark:text-white">{m.label}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{m.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-4 flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Encrypted secure payment processing.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky Bottom Summary Checkout Sheet */}
      <div className="absolute bottom-0 inset-x-0 h-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-gray-150 dark:border-slate-800/60 px-4 py-3 z-40 flex items-center justify-between">
        <div>
          <span className="text-[9px] text-gray-400 font-extrabold uppercase">Total Bill</span>
          <p className="text-lg font-black text-brand-600 dark:text-brand-400">₹{total}</p>
          <span className="text-[8px] text-gray-400">{service.duration} service duration</span>
        </div>

        <div className="flex gap-2">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="h-12 w-12 rounded-xl flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          
          {step < steps.length - 1 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="h-12 px-6 rounded-xl font-bold active-scale"
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={confirmBooking}
              className="h-12 px-6 rounded-xl font-bold bg-brand-600 text-white active-scale"
            >
              Book Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
