import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  Droplets,
  Zap,
  Wind,
  Paintbrush,
  ClipboardCheck,
  Sparkles,
  UtensilsCrossed,
  CookingPot,
  Box,
  PhoneCall,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { services as catalogServices } from '../data/serviceCatalog';
import { apiClient } from '../services/apiClient';
import { processUPIPayment } from '../services/razorpay';
import type { Service } from '../types';

interface SavedAddress {
  id: string;
  title: string;
  address: string;
  city: string;
  pincode: string;
}

const defaultAddresses: SavedAddress[] = [
  {
    id: 'addr-1',
    title: 'Home - 32',
    address: 'Bungalow 32, Navarangpura',
    city: 'Ahmedabad',
    pincode: '380009',
  },
  {
    id: 'addr-2',
    title: 'Office - Complex 4B',
    address: 'Sardar Patel Ring Road, SG Highway',
    city: 'Ahmedabad',
    pincode: '380054',
  },
];

const timeSlots = [
  '09:00 AM - 10:30 AM',
  '11:00 AM - 12:30 PM',
  '01:00 PM - 02:30 PM',
  '03:00 PM - 04:30 PM',
  '05:00 PM - 06:30 PM',
];

const getServiceIcon = (s: Service, isSelected: boolean) => {
  const text = `${s.slug || ''} ${s.name || ''} ${s.categoryName || ''}`.toLowerCase();
  
  if (text.includes('plumb') || text.includes('water') || text.includes('tap') || text.includes('pipe'))
    return <Droplets className={`w-5 h-5 ${isSelected ? 'text-brand-600' : 'text-blue-600'}`} />;
  if (text.includes('electr') || text.includes('wir') || text.includes('switch') || text.includes('light') || text.includes('fan'))
    return <Zap className={`w-5 h-5 ${isSelected ? 'text-brand-600' : 'text-amber-500'}`} />;
  if (text.includes('ac-') || text.includes('hvac') || text.includes('cooling') || text.includes('air'))
    return <Wind className={`w-5 h-5 ${isSelected ? 'text-brand-600' : 'text-cyan-500'}`} />;
  if (text.includes('paint') || text.includes('artisan') || text.includes('wall'))
    return <Paintbrush className={`w-5 h-5 ${isSelected ? 'text-brand-600' : 'text-purple-600'}`} />;
  if (text.includes('inspect') || text.includes('check') || text.includes('audit'))
    return <ClipboardCheck className={`w-5 h-5 ${isSelected ? 'text-brand-600' : 'text-emerald-600'}`} />;
  if (text.includes('key') || text.includes('surveill') || text.includes('security') || text.includes('box'))
    return <Box className={`w-5 h-5 ${isSelected ? 'text-brand-600' : 'text-indigo-600'}`} />;
  if (text.includes('emergency') || text.includes('rapid') || text.includes('support'))
    return <PhoneCall className={`w-5 h-5 ${isSelected ? 'text-brand-600' : 'text-rose-600'}`} />;
  if (text.includes('clean') || text.includes('sofa') || text.includes('carpet') || text.includes('festival') || s.categoryId === 'c7')
    return <Sparkles className={`w-5 h-5 ${isSelected ? 'text-brand-600' : 'text-teal-500'}`} />;
  if (text.includes('cater') || text.includes('buffet') || s.categoryId === 'c1')
    return <UtensilsCrossed className={`w-5 h-5 ${isSelected ? 'text-brand-600' : 'text-orange-500'}`} />;
  if (text.includes('meal') || text.includes('cook') || text.includes('tiffin') || s.categoryId === 'c2')
    return <CookingPot className={`w-5 h-5 ${isSelected ? 'text-brand-600' : 'text-emerald-500'}`} />;
  return <Wrench className={`w-5 h-5 ${isSelected ? 'text-brand-600' : 'text-brand-600'}`} />;
};

export function ServicesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<number>(1);
  const [servicesList, setServicesList] = useState<Service[]>(catalogServices);
  const [selectedIds, setSelectedIds] = useState<string[]>(['s35']); // Default select Plumbing to display active styling

  // Address & Scheduling State
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(defaultAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('addr-1');
  const [isChangingAddress, setIsChangingAddress] = useState<boolean>(false);
  const [newAddressForm, setNewAddressForm] = useState({ title: '', address: '', city: 'Ahmedabad', pincode: '' });
  
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);
  const [selectedDate, setSelectedDate] = useState<string>(tomorrow);
  const [selectedTime, setSelectedTime] = useState<string>('11:00 AM - 12:30 PM');
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);

  // Dynamically fetch services from backend so any additions via Admin/DB show up immediately
  useEffect(() => {
    apiClient.getServices()
      .then((data: Service[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setServicesList(data);
        } else {
          setServicesList(catalogServices);
        }
      })
      .catch(() => setServicesList(catalogServices));
  }, []);

  // Exclude legacy simple items (s1-s33) to strictly display the 9 executive packages from the reference image,
  // while retaining full capability to display any brand new services created via the backend database/Admin.
  const displayedServices = useMemo(() => {
    const legacyIds = new Set([
      's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10',
      's11', 's12', 's13', 's14', 's15', 's16', 's17', 's18', 's19', 's20',
      's21', 's22', 's23', 's24', 's25', 's26', 's27', 's28', 's29', 's30',
      's31', 's32', 's33'
    ]);
    const targetOrder = ['s34', 's35', 's36', 's37', 's38', 's39', 's40', 's41', 's42'];
    const result = servicesList.filter((s) => !legacyIds.has(s.id));
    
    result.sort((a, b) => {
      const idxA = targetOrder.indexOf(a.id);
      const idxB = targetOrder.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });
    return result;
  }, [servicesList]);

  const selectedServices = useMemo(() => {
    return servicesList.filter((s) => selectedIds.includes(s.id));
  }, [servicesList, selectedIds]);

  const totalAmount = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  }, [selectedServices]);

  const currentAddress = useMemo(() => {
    return savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0];
  }, [savedAddresses, selectedAddressId]);

  const handleToggleService = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleRemoveItem = (id: string) => {
    const updated = selectedIds.filter((item) => item !== id);
    setSelectedIds(updated);
    if (updated.length === 0 && step === 4) {
      toast('All services removed. Returning to selection.', 'info');
      setStep(1);
    }
  };

  const handleSaveNewAddress = () => {
    if (!newAddressForm.title || !newAddressForm.address || !newAddressForm.pincode) {
      toast('Please fill out Title, Street Address and Pincode', 'info');
      return;
    }
    const created: SavedAddress = {
      id: `addr-${Date.now()}`,
      title: newAddressForm.title,
      address: newAddressForm.address,
      city: newAddressForm.city || 'Ahmedabad',
      pincode: newAddressForm.pincode,
    };
    setSavedAddresses([created, ...savedAddresses]);
    setSelectedAddressId(created.id);
    setNewAddressForm({ title: '', address: '', city: 'Ahmedabad', pincode: '' });
    setIsChangingAddress(false);
    toast('New delivery address saved & selected!', 'success');
  };

  const handleProceedToPayment = async () => {
    if (selectedServices.length === 0) {
      toast('Please select at least one service', 'info');
      setStep(1);
      return;
    }
    if (!user) {
      toast('Please sign in to complete your booking', 'info');
      navigate('/login');
      return;
    }

    setProcessingPayment(true);
    toast('Initializing Razorpay Secure UPI Gateway...', 'info');

    const combinedTitle =
      selectedServices.length === 1
        ? selectedServices[0].name
        : `${selectedServices[0].name} + ${selectedServices.length - 1} more service${selectedServices.length > 2 ? 's' : ''}`;

    const combinedIds = selectedServices.map((s) => s.id).join(',');

    const finalAddressObj = {
      street: currentAddress.address,
      city: currentAddress.city,
      state: 'Gujarat',
      pincode: currentAddress.pincode,
      fullAddress: `${currentAddress.title} — ${currentAddress.address}, ${currentAddress.city} - ${currentAddress.pincode}`,
    };

    processUPIPayment({
      productName: combinedTitle,
      productId: combinedIds,
      amount: totalAmount,
      discount: 0,
      customerName: user.name || 'Valued Customer',
      email: user.email || 'customer@homeseva.com',
      phoneNumber: (user as any)?.phone || '9876543210',
      address: finalAddressObj,
      bookingDate: selectedDate,
      bookingTime: selectedTime,
      onSuccess: (resData) => {
        setProcessingPayment(false);
        toast('Payment Verified & Booking Confirmed!', 'success');
        navigate(
          `/payment/success?bookingId=${resData.bookingId}&invoiceNumber=${resData.invoiceNumber}&paymentId=${resData.booking?.razorpayPaymentId || ''}&orderId=${resData.booking?.razorpayOrderId || ''}&product=${encodeURIComponent(combinedTitle)}`
        );
      },
      onFailure: (errMsg) => {
        setProcessingPayment(false);
        if (errMsg.includes('CANCELLED_BY_USER') || errMsg.toLowerCase().includes('cancelled by customer')) {
          const cleanMsg = errMsg.replace('CANCELLED_BY_USER: ', '');
          toast(cleanMsg || 'Payment cancelled. Your booking selections are preserved.', 'info');
          return;
        }
        toast(errMsg, 'error');
        navigate(`/payment/failed?error=${encodeURIComponent(errMsg)}&slug=services-bundle`);
      },
    });
  };

  const handleBackNavigation = () => {
    if (step === 1) {
      navigate('/');
    } else {
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-[#F8FAFC] text-gray-900 select-none pb-24 pt-6">
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6">
        
        {/* Wizard Header Bar with Consistent Back Button across all steps */}
        <div className="flex items-center justify-between text-sm font-semibold mb-3 px-1">
          <button
            onClick={handleBackNavigation}
            className="flex items-center gap-1.5 text-gray-600 hover:text-brand-600 font-bold text-sm transition py-1"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
            <span>{step === 1 ? 'Home' : 'Back'}</span>
          </button>
          <span className="text-xs font-extrabold text-gray-500 tracking-wide">
            Step {step} of 4
          </span>
        </div>

        {/* Modern Interactive & Smooth Stepper */}
        <div className="w-full mb-10 mt-2 px-2 sm:px-8">
          <div className="relative">
            {/* Background Track */}
            <div className="absolute top-5 sm:top-5 left-[12%] right-[12%] h-1.5 bg-gray-200 rounded-full z-0 overflow-hidden shadow-inner">
              {/* Smooth Gliding Progress Bar */}
              <div
                className="h-full bg-gradient-to-r from-brand-600 via-indigo-600 to-emerald-500 rounded-full transition-all duration-700 ease-in-out shadow-xs"
                style={{
                  width: step === 1 ? '0%' : step === 2 ? '33.33%' : step === 3 ? '66.66%' : '100%',
                }}
              />
            </div>

            {/* Step Nodes Row */}
            <div className="relative z-10 flex items-center justify-between w-full">
              {[
                { num: 1, label: 'Services', icon: Sparkles },
                { num: 2, label: 'Location', icon: MapPin },
                { num: 3, label: 'Schedule', icon: Clock },
                { num: 4, label: 'Checkout', icon: ShieldCheck },
              ].map((item) => {
                const isCompleted = step > item.num;
                const isCurrent = step === item.num;
                const IconComponent = item.icon;

                return (
                  <div
                    key={item.num}
                    onClick={() => {
                      if (isCompleted) {
                        setStep(item.num);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={`flex flex-col items-center group ${isCompleted ? 'cursor-pointer' : ''}`}
                  >
                    {/* Circle Node */}
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-extrabold text-sm sm:text-base transition-all duration-500 transform ${
                        isCurrent
                          ? 'bg-brand-600 text-white ring-8 ring-brand-500/20 shadow-lg shadow-brand-500/40 scale-110'
                          : isCompleted
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30 ring-4 ring-emerald-100 group-hover:scale-105'
                          : 'bg-white border-2 border-gray-300 text-gray-400 hover:border-gray-400 shadow-xs'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-in zoom-in-50 duration-300" />
                      ) : (
                        <IconComponent
                          className={`w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform duration-300 ${
                            isCurrent ? 'animate-pulse' : ''
                          }`}
                        />
                      )}
                    </div>

                    {/* Label & Subtitle */}
                    <div className="mt-2.5 flex flex-col items-center">
                      <span
                        className={`text-xs sm:text-sm font-extrabold tracking-wide transition-colors duration-300 ${
                          isCurrent
                            ? 'text-brand-600 font-black'
                            : isCompleted
                            ? 'text-emerald-700 font-bold'
                            : 'text-gray-400 font-medium'
                        }`}
                      >
                        {item.label}
                      </span>
                      <span className="hidden sm:inline-block text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                        {isCurrent ? 'In Progress' : isCompleted ? 'Completed' : `Step ${item.num}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* STEP 1: SELECT SERVICES */}
        {step === 1 && (
          <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 sm:py-9 shadow-sm relative">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-display tracking-tight">
              Select Services
            </h1>
            <p className="text-sm sm:text-base text-gray-500 font-medium mt-1 mb-8">
              What exactly does your property need right now?
            </p>

            {/* Service Cards Grid (Strict 9 reference packages + any dynamic newly added backend services) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 pb-12">
              {displayedServices.map((s) => {
                const isSelected = selectedIds.includes(s.id);
                const icon = getServiceIcon(s, isSelected);

                return (
                  <div
                    key={s.id}
                    onClick={() => handleToggleService(s.id)}
                    className={`cursor-pointer p-4 sm:p-6 rounded-2xl border-2 transition-all duration-200 flex flex-row sm:flex-col items-center sm:items-start sm:justify-between gap-4 sm:gap-6 relative text-left select-none group sm:min-h-[160px] ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/20 shadow-md shadow-brand-500/5'
                        : 'border-gray-200/90 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Circular Icon Container */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      isSelected ? 'bg-brand-100/70 border border-brand-200/60' : 'bg-slate-50 border border-slate-200/70'
                    }`}>
                      {icon}
                    </div>

                    {/* Middle Text Block (Inline next to icon on mobile, underneath on desktop) */}
                    <div className="flex-1 min-w-0 sm:w-full">
                      <h3 className="font-extrabold text-gray-900 text-sm sm:text-base leading-snug mb-0.5 sm:mb-1 pr-2 sm:pr-0 truncate sm:whitespace-normal">
                        {s.name}
                      </h3>
                      <p className="text-[11px] sm:text-xs font-semibold text-gray-500">
                        Starts at <span className="text-gray-700 font-bold">₹{Number(s.price || 0).toLocaleString('en-IN')}</span>
                      </p>
                    </div>

                    {/* Right Badge on mobile, Top-Right Badge on desktop */}
                    <div className="shrink-0 sm:absolute sm:top-6 sm:right-6 flex items-center">
                      {isSelected ? (
                        <div className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-600 shadow-xs">
                          <CheckCircle2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-brand-600 text-white" />
                        </div>
                      ) : (
                        s.popular && (
                          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg bg-[#FFF4E5] text-[#D97706] font-extrabold text-[9px] sm:text-[10px] uppercase tracking-wider">
                            POPULAR
                          </span>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Action Bar with Back button */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBackNavigation}
                  className="text-sm font-bold text-gray-600 hover:text-gray-900 transition flex items-center gap-1 py-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <span className="hidden sm:inline-block h-4 w-px bg-gray-200" />
                <span className="text-sm font-bold text-gray-600">
                  {selectedIds.length === 0 ? '0 Services Selected' : `${selectedIds.length} ${selectedIds.length === 1 ? 'Service' : 'Services'} Selected`}
                </span>
              </div>
              <button
                onClick={() => {
                  if (selectedIds.length === 0) {
                    toast('Please select at least one service to continue', 'info');
                    return;
                  }
                  setStep(2);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={selectedIds.length === 0}
                className="px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-extrabold text-sm shadow-md shadow-brand-600/20 flex items-center gap-1.5 transition disabled:opacity-50 disabled:pointer-events-none"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SERVICE LOCATION & ADDRESS */}
        {step === 2 && (
          <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-sm relative max-w-3xl mx-auto">
            
            {/* Selected Services Summary Banner */}
            <div className="p-4 sm:p-5 rounded-2xl border border-gray-200 bg-gray-50/70 flex items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-black text-xs shadow-xs">
                  ✓
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedServices.length} {selectedServices.length === 1 ? 'Service' : 'Services'} Selected
                  </p>
                  <p className="text-xs text-gray-500 font-medium truncate max-w-[220px] sm:max-w-sm">
                    {selectedServices.map(s => s.name).join(', ')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setStep(1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3.5 py-2 rounded-xl border border-brand-200 bg-white text-brand-600 hover:bg-brand-50 font-extrabold text-xs transition whitespace-nowrap shadow-xs"
              >
                Change Services
              </button>
            </div>

            {/* Service Location Section */}
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
              SERVICE LOCATION
            </p>

            <div className="p-4 sm:p-5 rounded-2xl border border-gray-200 bg-white flex items-center justify-between gap-4 shadow-xs mb-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-extrabold text-gray-900">
                    {currentAddress ? `${currentAddress.title} — ${currentAddress.city}` : 'Select Delivery Address'}
                  </p>
                  {currentAddress && (
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      {currentAddress.address}, {currentAddress.city} - {currentAddress.pincode}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsChangingAddress(!isChangingAddress)}
                className="text-brand-600 hover:text-brand-700 font-extrabold text-xs sm:text-sm transition px-2 py-1"
              >
                {isChangingAddress ? 'Close' : 'Change'}
              </button>
            </div>

            {/* Interactive Address Selection / Add Modal Form */}
            {isChangingAddress && (
              <div className="p-5 rounded-2xl border border-dashed border-gray-300 bg-gray-50 mb-8 space-y-6">
                <div>
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                    Saved Addresses
                  </p>
                  <div className="space-y-2.5">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => {
                          setSelectedAddressId(addr.id);
                          setIsChangingAddress(false);
                          toast(`Selected address: ${addr.title}`, 'success');
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                          selectedAddressId === addr.id
                            ? 'border-brand-600 bg-brand-50/50 font-bold'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-extrabold text-gray-900">{addr.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{addr.address}, {addr.city} - {addr.pincode}</p>
                        </div>
                        {selectedAddressId === addr.id && (
                          <span className="text-xs text-brand-600 font-extrabold">Selected ✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-brand-600" /> Add New Delivery Address
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Title (e.g. Home - 45, Office)"
                      value={newAddressForm.title}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, title: e.target.value })}
                      className="h-10 px-3 rounded-lg border border-gray-200 text-xs font-medium outline-none focus:border-brand-600 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="City (e.g. Ahmedabad, Mumbai)"
                      value={newAddressForm.city}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                      className="h-10 px-3 rounded-lg border border-gray-200 text-xs font-medium outline-none focus:border-brand-600 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Street Address / Bungalow No / Area"
                      value={newAddressForm.address}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, address: e.target.value })}
                      className="sm:col-span-2 h-10 px-3 rounded-lg border border-gray-200 text-xs font-medium outline-none focus:border-brand-600 bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Pincode (6 digits)"
                      value={newAddressForm.pincode}
                      maxLength={6}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, pincode: e.target.value })}
                      className="h-10 px-3 rounded-lg border border-gray-200 text-xs font-medium outline-none focus:border-brand-600 bg-white"
                    />
                    <button
                      onClick={handleSaveNewAddress}
                      className="h-10 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center"
                    >
                      Save & Select Address
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Action Bar with Back button */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-between mt-12">
              <button
                onClick={handleBackNavigation}
                className="text-sm font-bold text-gray-600 hover:text-gray-900 transition flex items-center gap-1.5 py-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => {
                  if (!currentAddress) {
                    toast('Please select or add a delivery address to continue', 'info');
                    return;
                  }
                  setStep(3);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-extrabold text-sm shadow-md shadow-brand-600/20 flex items-center gap-1.5 transition"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SCHEDULE TIME */}
        {step === 3 && (
          <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-sm relative max-w-3xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-display tracking-tight">
              Schedule Time
            </h1>
            <p className="text-sm sm:text-base text-gray-500 font-medium mt-1 mb-8">
              Select when you need the worker to visit.
            </p>

            {/* PICK A DATE */}
            <div className="mb-8">
              <p className="flex items-center gap-1.5 text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                <CalendarIcon className="w-3.5 h-3.5 text-brand-600" />
                <span>PICK A DATE</span>
              </p>
              <div className="max-w-xs">
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200/90 bg-white text-gray-900 font-bold text-sm outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-500/10 shadow-xs cursor-pointer"
                />
              </div>
            </div>

            {/* PICK A TIME */}
            <div className="mb-12">
              <p className="flex items-center gap-1.5 text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                <Clock className="w-3.5 h-3.5 text-brand-600" />
                <span>PICK A TIME</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {timeSlots.map((slot) => {
                  const isActive = selectedTime === slot;
                  return (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`h-12 px-3 sm:px-4 rounded-xl border text-xs sm:text-sm transition-all duration-200 flex items-center justify-center font-bold ${
                        isActive
                          ? 'border-brand-600 bg-brand-50/70 text-brand-600 shadow-xs ring-1 ring-brand-600/40'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50/50'
                      }`}
                    >
                      <span>{slot}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Action Bar with Back button */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={handleBackNavigation}
                className="text-sm font-bold text-gray-600 hover:text-gray-900 transition flex items-center gap-1.5 py-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => {
                  if (!selectedDate || !selectedTime) {
                    toast('Please choose both date and time slot to proceed', 'info');
                    return;
                  }
                  setStep(4);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-extrabold text-sm shadow-md shadow-brand-600/20 flex items-center gap-1.5 transition"
              >
                <span>Review Booking</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW BOOKING & RAZORPAY CHECKOUT */}
        {step === 4 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
              
              {/* Top Location Summary */}
              <div className="flex items-start gap-3.5 pb-6 border-b border-gray-100">
                <MapPin className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-base text-gray-900">
                    {currentAddress?.title || 'Home - 32'}
                  </p>
                  <p className="text-xs font-semibold text-gray-500 mt-0.5">
                    {currentAddress ? `${currentAddress.address}, ${currentAddress.city}` : 'Ahmedabad, Gujarat'}
                  </p>
                </div>
              </div>

              {/* Selected Services Breakdown List */}
              <div className="divide-y divide-gray-100">
                {selectedServices.map((s) => (
                  <div key={s.id} className="py-5 flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-black text-gray-900 text-base mb-1">
                        {s.name}
                      </h4>
                      <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                        <span>{selectedDate} at {selectedTime}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-base text-gray-900">
                        ₹{Number(s.price || 0).toLocaleString('en-IN')}
                      </p>
                      <button
                        onClick={() => handleRemoveItem(s.id)}
                        className="text-xs font-bold text-rose-500 hover:text-rose-600 transition mt-1.5"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Safe & Verified Guarantee Box */}
              <div className="my-6 p-4 rounded-xl bg-blue-50/60 border border-blue-100/80 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-black text-gray-900">Safe & Verified</p>
                  <p className="text-xs text-gray-600 font-medium mt-0.5">
                    You will receive photo updates upon completion of jobs.
                  </p>
                </div>
              </div>

              {/* Total Estimate Bottom Total */}
              <div className="pt-5 border-t-2 border-gray-200/90 flex items-center justify-between">
                <span className="font-black text-xs uppercase tracking-widest text-gray-500">
                  TOTAL ESTIMATE
                </span>
                <span className="font-black text-2xl text-gray-900">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Sticky/Footer Actions Row with Back button in Step 4 */}
            <div className="mt-6 pt-4 flex items-center justify-between px-2 max-w-2xl mx-auto">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBackNavigation}
                  className="text-sm font-bold text-gray-600 hover:text-gray-900 transition flex items-center gap-1.5 py-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <span className="h-4 w-px bg-gray-300" />
                <button
                  onClick={() => {
                    setStep(1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-sm font-extrabold text-brand-600 hover:text-brand-700 transition flex items-center gap-1 py-2"
                >
                  <span>+ Add More</span>
                </button>
              </div>
              
              <button
                onClick={handleProceedToPayment}
                disabled={processingPayment || selectedServices.length === 0}
                className="px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-slate-900/20 active:scale-95 transition flex items-center gap-2 disabled:opacity-50"
              >
                <span>{processingPayment ? 'Connecting Razorpay...' : 'Proceed'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
