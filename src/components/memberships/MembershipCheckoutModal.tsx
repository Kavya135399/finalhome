import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Lock, X, Loader2, Sparkles, CreditCard, Calendar, MapPin, User, Mail, Phone, Building } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { processUPIPayment } from '../../services/razorpay';
import { savedAddresses } from '../../data/sampleData';

export interface PlanDetails {
  id: string;
  name: string;
  desc: string;
  price: string;
  numericPrice?: number;
  features: string[];
}

interface MembershipCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanDetails | null;
  onSuccess: (membershipData: any) => void;
}

const TENURES = [
  { id: '1m', months: 1, label: '1 Month', discountPct: 0, tag: 'Standard' },
  { id: '6m', months: 6, label: '6 Months', discountPct: 10, tag: 'Save 10%' },
  { id: '12m', months: 12, label: '1 Year', discountPct: 20, tag: 'Best Value (Save 20%)' },
];

export function MembershipCheckoutModal({ isOpen, onClose, plan, onSuccess }: MembershipCheckoutModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedTenure, setSelectedTenure] = useState(TENURES[0]);
  
  // Customer details state
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [pincode, setPincode] = useState('400001');
  const [selectedSavedAddr, setSelectedSavedAddr] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);

  // Pre-fill user data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (user) {
        setCustomerName(user.name || '');
        setEmail(user.email || '');
      }
      if (savedAddresses && savedAddresses.length > 0) {
        const defaultAddr = savedAddresses[0];
        setSelectedSavedAddr(defaultAddr.id);
        setStreetAddress(defaultAddr.address);
        setCity(defaultAddr.city);
        setPincode(defaultAddr.pincode);
      }
    }
  }, [isOpen, user]);

  const handleSavedAddrChange = (addrId: string) => {
    setSelectedSavedAddr(addrId);
    if (addrId === 'new') {
      setStreetAddress('');
      setCity('Mumbai');
      setPincode('');
    } else {
      const found = savedAddresses.find((a) => a.id === addrId);
      if (found) {
        setStreetAddress(found.address);
        setCity(found.city);
        setPincode(found.pincode);
      }
    }
  };

  if (!isOpen || !plan) return null;

  const basePricePerMonth = plan.numericPrice || 4999;
  const subtotal = basePricePerMonth * selectedTenure.months;
  const discountAmount = Math.round((subtotal * selectedTenure.discountPct) / 100);
  const taxableAmount = subtotal - discountAmount;
  const gstAmount = Math.round(taxableAmount * 0.18);
  const totalAmount = taxableAmount + gstAmount;

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast('Please sign in to purchase a membership plan', 'error');
      return;
    }

    if (!customerName.trim()) {
      toast('Please enter your full name', 'error');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast('Please enter a valid email address', 'error');
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      toast('Please enter a valid 10-digit phone number', 'error');
      return;
    }
    if (!streetAddress.trim()) {
      toast('Please provide your property address', 'error');
      return;
    }

    setIsProcessing(true);

    const fullAddressObj = {
      street: streetAddress,
      city,
      state: 'Maharashtra',
      pincode,
      fullAddress: `${streetAddress}, ${city} - ${pincode}`,
    };

    const productName = `HomeSeva ${plan.name} (${selectedTenure.label})`;
    const productId = `mem_${plan.id}_${selectedTenure.id}`;

    await processUPIPayment({
      productName,
      productId,
      amount: totalAmount,
      discount: discountAmount,
      customerName,
      email,
      phoneNumber: phone,
      address: fullAddressObj,
      showAllMethods: false,
      onSuccess: (data) => {
        setIsProcessing(false);
        const subscribedAtDate = new Date();
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + selectedTenure.months);

        const membershipRecord = {
          planId: plan.id,
          planName: plan.name,
          tenure: selectedTenure.label,
          months: selectedTenure.months,
          price: plan.price,
          amountPaid: totalAmount,
          customerName,
          email,
          phone,
          address: fullAddressObj,
          subscribedAt: subscribedAtDate.toISOString(),
          expiryDate: expiryDate.toISOString(),
          bookingId: data.bookingId,
          invoiceNumber: data.invoiceNumber,
          transactionId: data.booking?.transactionId || data.bookingId,
          status: 'Active',
        };

        localStorage.setItem('homeseva_active_membership', JSON.stringify(membershipRecord));
        toast(`Payment Successful! Subscribed to ${plan.name} (${selectedTenure.label})`, 'success');
        onSuccess(membershipRecord);
        onClose();
      },
      onFailure: (err) => {
        setIsProcessing(false);
        if (err.includes('CANCELLED_BY_USER')) {
          toast('Payment process was cancelled.', 'info');
        } else {
          toast(err || 'Payment failed. Please try again.', 'error');
        }
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 transform transition-all">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                Membership Checkout
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                Subscribe to {plan.name}
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2">
            Fill in your details and select your billing cycle to activate your membership via Razorpay.
          </p>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleProceedToPayment} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Billing Cycle Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Select Billing Duration</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TENURES.map((t) => {
                const isSelected = selectedTenure.id === t.id;
                const mPrice = basePricePerMonth * t.months;
                const mDiscount = Math.round((mPrice * t.discountPct) / 100);
                const finalMPrice = mPrice - mDiscount;

                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setSelectedTenure(t)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{t.label}</span>
                        {t.tag && (
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {t.tag}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-base font-extrabold text-slate-900 dark:text-white">
                        ₹{finalMPrice.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                      ₹{Math.round(finalMPrice / t.months).toLocaleString('en-IN')}/mo
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer Personal Details */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Customer Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Phone Number (for booking & updates) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile number"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Property Service Location Details */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Property / Service Location</span>
              </h3>
              {savedAddresses && savedAddresses.length > 0 && (
                <select
                  value={selectedSavedAddr}
                  onChange={(e) => handleSavedAddrChange(e.target.value)}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-transparent outline-none cursor-pointer"
                >
                  {savedAddresses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}: {a.address.slice(0, 20)}...
                    </option>
                  ))}
                  <option value="new">+ Enter New Address</option>
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Street / Apartment / House No. *
                </label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Flat No, Building Name, Street"
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="400001"
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  State
                </label>
                <input
                  type="text"
                  disabled
                  value="Maharashtra"
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Payment Breakdown / Summary */}
          <div className="bg-slate-50 dark:bg-slate-950/70 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span>Order Summary</span>
              <span className="text-[10px] font-normal text-slate-500">Includes 18% GST</span>
            </h4>

            <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-1">
              <span>{plan.name} ({selectedTenure.label})</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Duration Discount ({selectedTenure.discountPct}%)</span>
                <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>GST (18%)</span>
              <span>+ ₹{gstAmount.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between text-sm sm:text-base font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
              <span>Total Payable</span>
              <span className="text-blue-600 dark:text-blue-400">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Razorpay Trust Badge & Submit Button */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                256-bit SSL Encrypted
              </span>
              <span className="flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                Razorpay Checkout (UPI / Cards / NetBanking)
              </span>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to Razorpay...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay ₹{totalAmount.toLocaleString('en-IN')} via Razorpay</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
