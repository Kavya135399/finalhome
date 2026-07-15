import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Calendar,
  Clock,
  MapPin,
  Tag,
  CreditCard,
  Wallet,
  Banknote,
  ChevronLeft,
  ChevronRight,
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

  const days = useMemo(() => nextDays(14), []);
  const discount = useMemo(() => {
    if (!appliedCoupon || !service) return 0;
    if (appliedCoupon.type === 'flat') return appliedCoupon.discount;
    const pct = Math.round((service.price * appliedCoupon.discount) / 100);
    return Math.min(pct, appliedCoupon.maxDiscount);
  }, [appliedCoupon, service]);

  if (!service) {
    return (
      <div className="pt-20">
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
    toast(`Coupon ${c.code} applied! You saved ₹${c.type === 'flat' ? c.discount : Math.min(Math.round((service.price * c.discount) / 100), c.maxDiscount)}`, 'success');
  };

  const canProceed = () => {
    if (step === 0) return !!slot;
    if (step === 1) return !!addressId || (newAddr.address && newAddr.pincode);
    return true;
  };

  const confirmBooking = () => {
    toast('Booking confirmed! Check your dashboard for details.', 'success');
    navigate('/dashboard');
  };

  return (
    <div className="pt-20 pb-16 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-6">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-2xl lg:text-3xl font-extrabold font-display mb-2">Book: {service.name}</h1>
        <p className="text-gray-500 mb-8">Complete your booking in a few simple steps.</p>

        {/* Stepper */}
        <div className="flex items-center mb-10">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition ${
                    i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-brand-600 text-white shadow-glow' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'
                  }`}
                >
                  {i < step ? <Check className="w-5 h-5" /> : i + 1}
                </div>
                <span className={`text-xs mt-1.5 font-medium hidden sm:block ${i <= step ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}`}>{label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 rounded transition ${i < step ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-800'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Step content */}
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {step === 0 && (
                  <div className="card p-6">
                    <h2 className="font-semibold text-lg mb-1 flex items-center gap-2"><Calendar className="w-5 h-5 text-brand-600" /> Select a date</h2>
                    <p className="text-sm text-gray-500 mb-4">Choose from the next 14 days</p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {days.map((d) => (
                        <button
                          key={d.date}
                          onClick={() => setSelectedDate(d.date)}
                          className={`shrink-0 w-16 py-3 rounded-xl border text-center transition ${
                            selectedDate === d.date
                              ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                              : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                          }`}
                        >
                          <p className="text-xs text-gray-500">{d.weekday}</p>
                          <p className="text-lg font-bold">{d.day}</p>
                          {d.today && <p className="text-[10px] text-brand-600">Today</p>}
                        </button>
                      ))}
                    </div>

                    <h2 className="font-semibold text-lg mt-8 mb-1 flex items-center gap-2"><Clock className="w-5 h-5 text-brand-600" /> Select a time slot</h2>
                    <p className="text-sm text-gray-500 mb-4">All times are in IST</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {timeSlots.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSlot(s)}
                          className={`py-3 px-3 rounded-xl border text-sm font-medium transition ${
                            slot === s
                              ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                              : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="card p-6">
                    <h2 className="font-semibold text-lg mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-brand-600" /> Service address</h2>
                    <div className="space-y-3 mb-6">
                      {savedAddresses.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => setAddressId(a.id)}
                          className={`w-full text-left p-4 rounded-xl border transition flex items-start gap-3 ${
                            addressId === a.id ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${addressId === a.id ? 'border-brand-600' : 'border-gray-300'}`}>
                            {addressId === a.id && <div className="w-2.5 h-2.5 rounded-full bg-brand-600" />}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{a.label} {a.isDefault && <Badge tone="brand" className="ml-1">Default</Badge>}</p>
                            <p className="text-sm text-gray-500">{a.address}, {a.city} - {a.pincode}</p>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="pt-5 border-t border-gray-100 dark:border-slate-800">
                      <p className="font-semibold text-sm mb-3">Or add a new address</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Input label="Label" placeholder="e.g. Home, Office" value={newAddr.label} onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })} />
                        <Input label="Pincode" placeholder="400050" value={newAddr.pincode} onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })} />
                        <div className="sm:col-span-2">
                          <Input label="Full address" placeholder="House no, street, area" value={newAddr.address} onChange={(e) => setNewAddr({ ...newAddr, address: e.target.value })} />
                        </div>
                        <Input label="City" placeholder="Mumbai" value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="card p-6">
                    <h2 className="font-semibold text-lg mb-1 flex items-center gap-2"><Tag className="w-5 h-5 text-brand-600" /> Apply coupon</h2>
                    <p className="text-sm text-gray-500 mb-4">Save on your booking with available offers</p>
                    <div className="flex gap-2 mb-6">
                      <input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="input-base uppercase"
                      />
                      <Button variant="outline" onClick={applyCoupon}>Apply</Button>
                    </div>

                    {appliedCoupon && (
                      <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/30 p-4 flex items-center gap-3 mb-6">
                        <Sparkles className="w-5 h-5 text-emerald-600" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-emerald-800 dark:text-emerald-300">{appliedCoupon.code} applied</p>
                          <p className="text-xs text-emerald-700 dark:text-emerald-400">{appliedCoupon.description}</p>
                        </div>
                        <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline">Remove</button>
                      </div>
                    )}

                    <p className="font-semibold text-sm mb-3">Available offers</p>
                    <div className="space-y-2">
                      {coupons.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => { setCouponCode(c.code); setAppliedCoupon(c); toast(`Coupon ${c.code} applied!`, 'success'); }}
                          className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between ${
                            appliedCoupon?.code === c.code ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                          }`}
                        >
                          <div>
                            <p className="font-bold text-sm">{c.code}</p>
                            <p className="text-xs text-gray-500">{c.description}</p>
                          </div>
                          <Tag className="w-4 h-4 text-brand-600" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="card p-6">
                    <h2 className="font-semibold text-lg mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-brand-600" /> Payment method</h2>
                    <div className="space-y-3">
                      {[
                        { id: 'upi', label: 'UPI', desc: 'Pay via any UPI app', icon: Wallet },
                        { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay', icon: CreditCard },
                        { id: 'cash', label: 'Cash on Service', desc: 'Pay after service completion', icon: Banknote },
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setPayment(m.id as typeof payment)}
                          className={`w-full text-left p-4 rounded-xl border transition flex items-center gap-3 ${
                            payment === m.id ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${payment === m.id ? 'border-brand-600' : 'border-gray-300'}`}>
                            {payment === m.id && <div className="w-2.5 h-2.5 rounded-full bg-brand-600" />}
                          </div>
                          <m.icon className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="font-semibold text-sm">{m.label}</p>
                            <p className="text-xs text-gray-500">{m.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-4 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Payments are secure and encrypted. Stripe-protected.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Nav buttons */}
            <div className="flex items-center justify-between mt-6">
              <Button variant="ghost" onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)} leftIcon={<ChevronLeft className="w-4 h-4" />}>
                {step === 0 ? 'Back' : 'Previous'}
              </Button>
              {step < steps.length - 1 ? (
                <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Continue
                </Button>
              ) : (
                <Button onClick={confirmBooking} size="lg">Confirm Booking</Button>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="card overflow-hidden">
              <img src={service.image} alt={service.name} className="w-full h-32 object-cover" />
              <div className="p-5">
                <h3 className="font-semibold mb-1">{service.name}</h3>
                <p className="text-xs text-gray-500 mb-4">{service.categoryName} • {service.duration}</p>

                <div className="space-y-2.5 text-sm border-t border-gray-100 dark:border-slate-800 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Service price</span>
                    <span className="font-medium">₹{service.price}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Coupon discount</span>
                      <span className="font-medium">-₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>Platform fee</span>
                    <span className="font-medium">₹0</span>
                  </div>
                  <div className="flex justify-between items-baseline border-t border-gray-100 dark:border-slate-800 pt-3 mt-2">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-extrabold text-brand-600">₹{total}</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-800 space-y-2 text-xs text-gray-500">
                  {selectedDate && <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>}
                  {slot && <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {slot}</p>}
                  <p className="flex items-center gap-1.5 capitalize"><CreditCard className="w-3.5 h-3.5" /> {payment === 'cash' ? 'Cash on service' : payment === 'card' ? 'Card' : 'UPI'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
