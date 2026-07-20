import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  QrCode,
  CheckCircle,
  FileText
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';

interface TaxiServiceCard {
  id: string;
  name: string;
  type: string;
  passengers: number;
  luggage: number;
  rate: number;
  image: string;
  status?: string;
}

const fleetData: TaxiServiceCard[] = [
  {
    id: 't_suv',
    name: 'Compact SUV (Brezza / Creta)',
    type: 'SUV',
    passengers: 5,
    luggage: 3,
    rate: 15,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 't_luxury',
    name: 'Elite Luxury Cruiser (Mustang / BMW)',
    type: 'Luxury Cruiser',
    passengers: 4,
    luggage: 3,
    rate: 25,
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 't_muv',
    name: 'Luxury MUV (Toyota Innova Crysta)',
    type: 'MUV',
    passengers: 7,
    luggage: 5,
    rate: 18,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 't_hatch',
    name: 'Economy Hatchback (Alto / Swift)',
    type: 'Hatchback',
    passengers: 4,
    luggage: 2,
    rate: 11,
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=400'
  }
];

const packagesData = [
  { 
    id: 'p_drop', 
    name: 'Ahmedabad Airport [Drop]', 
    desc: 'One-way stress-free private professional driver, direct highway transit included.', 
    price: 3500, 
    distance: '130 km', 
    duration: '2.5 hours', 
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: 'p_local', 
    name: 'Local City Ride', 
    desc: 'Dedicated vehicle and driver on-call for sightseeing in Patan (Rani ki Vav, Sahastralinga Talav, Patola weavers house).', 
    price: 1500, 
    distance: '80 km', 
    duration: '8 hours', 
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400' 
  },
  { 
    id: 'p_out', 
    name: 'Outstation Travel', 
    desc: 'Full day excursion from Patan to the Modhera Sun Temple and traditional Sidhpur havelis. Includes waiting charges.', 
    price: 5000, 
    distance: '180 km', 
    duration: '10 hours', 
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=400' 
  }
];

export function TaxiBookingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'fleet' | 'book' | 'rides'>('fleet');
  const [fleetSubTab, setFleetSubTab] = useState<'fleet' | 'packages'>('fleet');

  const [vehicles, setVehicles] = useState<TaxiServiceCard[]>(fleetData);

  // Booking Form States
  const [taxiType, setTaxiType] = useState('Local Taxi');
  const [vehicleChoice, setVehicleChoice] = useState('Sedan');
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [luggage, setLuggage] = useState('');
  const [propertyAssociation, setPropertyAssociation] = useState('No property association');
  const [utr, setUtr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User Rides States
  const [rides, setRides] = useState<any[]>([]);
  const [loadingRides, setLoadingRides] = useState(false);
  const [selectedRideForTrack, setSelectedRideForTrack] = useState<any | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const data = await apiClient.getVehicles();
      if (Array.isArray(data)) {
        setVehicles(data);
      }
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
    }
  };

  useEffect(() => {
    fetchUserRides();
  }, [user]);

  const fetchUserRides = async () => {
    if (!user) return;
    setLoadingRides(true);
    try {
      const allBookings = await apiClient.getBookings({ userId: user.id });
      // Filter for bookings containing Taxi or starting with t_ / p_ prefix
      const taxiRides = allBookings.filter(
        (b: any) =>
          b.serviceId?.startsWith('t_') ||
          b.serviceId?.startsWith('p_') ||
          b.serviceName?.toLowerCase().includes('taxi') ||
          b.serviceName?.toLowerCase().includes('cab')
      );
      setRides(taxiRides);
    } catch (err) {
      console.error('Failed to load taxi rides:', err);
    } finally {
      setLoadingRides(false);
    }
  };

  const handleSelectVehicle = (car: TaxiServiceCard) => {
    setVehicleChoice(car.type);
    setActiveTab('book');
  };

  const handleSelectPackage = (pkg: any) => {
    setTaxiType(pkg.name);
    setActiveTab('book');
  };

  const handleSimulatePay = async () => {
    const selectedCar = vehicles.find((c) => c.type === vehicleChoice);
    const rate = selectedCar?.rate ?? 15;
    
    const matchedPackage = packagesData.find((p) => p.name === taxiType);
    const estimatedPrice = matchedPackage ? matchedPackage.price : rate * 30;

    const randomUtr = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
    try {
      await apiClient.simulateReceivePayment(randomUtr, estimatedPrice);
      setUtr(randomUtr);
      toast(`Payment Simulated! ₹${estimatedPrice} received. UTR code auto-filled.`, 'success');
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Simulation failed';
      toast(errMsg, 'error');
    }
  };

  const handleBookCab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast('Please login to book a cab', 'error');
      navigate('/login');
      return;
    }
    if (!pickup || !drop || !date || !time) {
      toast('Please enter pickup, drop, date, and pickup time details', 'error');
      return;
    }
    if (!utr || !/^\d{12}$/.test(utr)) {
      toast('Please enter a valid 12-digit UTR Transaction ID', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Find pricing based on selected vehicle/type
      const selectedCar = vehicles.find((c) => c.type === vehicleChoice);
      const rate = selectedCar?.rate ?? 15;
      
      const matchedPackage = packagesData.find((p) => p.name === taxiType);
      const estimatedPrice = matchedPackage ? matchedPackage.price : rate * 30; // standard estimation of 30kms

      // Serialize trip details inside booking address field
      const formattedAddress = `Pickup: ${pickup} | Drop: ${drop}`;
      const notesString = `Pax: ${passengers} | Car: ${vehicleChoice} | Luggage: ${luggage || 'None'} | Prop: ${propertyAssociation}`;

      const bookingPayload = {
        userId: user.id,
        serviceId: selectedCar?.id || 't_generic',
        serviceName: `${taxiType} (${vehicleChoice})`,
        serviceImage: selectedCar?.image || 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=400',
        date,
        timeSlot: time,
        address: formattedAddress,
        notes: notesString,
        price: estimatedPrice,
        paymentMethod: 'upi',
        utr,
        paid: 0, // Unpaid until admin verifies UTR
        status: 'pending' as const
      };

      await apiClient.createBooking(bookingPayload);
      toast('Cab request submitted! Awaiting payment verification.', 'success');
      
      // Clear form
      setPickup('');
      setDrop('');
      setUtr('');
      
      // Refresh rides and show rides tab
      await fetchUserRides();
      setActiveTab('rides');
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Cab booking failed';
      toast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { id: 'pending', label: 'Payment Under Verification', desc: 'Admin is reviewing UPI UTR ID' },
    { id: 'upcoming', label: 'Driver Confirmed', desc: 'Cab and driver assigned successfully' },
    { id: 'in-progress', label: 'Ride Started', desc: 'Chauffeur has initiated the trip' },
    { id: 'completed', label: 'Ride Completed', desc: 'Cab arrived at destination' }
  ];

  return (
    <div className="flex flex-col flex-1 bg-gray-50 dark:bg-slate-950 pb-8 text-left select-none">
      <div className="p-4 max-w-2xl mx-auto w-full space-y-5">
        
        {/* Header Block */}
        <div className="card p-5 flex items-center justify-between bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800/80 rounded-3xl relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sky-50 dark:bg-sky-950/20 text-sky-500 rounded-2xl flex items-center justify-center border border-sky-100/50">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 dark:text-white">Taxi Cabs Booking</h2>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-normal max-w-[280px] sm:max-w-sm">
                Book on-demand premium airport transfers, city local cabs and outstation trips.
              </p>
            </div>
          </div>
          {activeTab === 'fleet' ? (
            <button
              onClick={() => setActiveTab('book')}
              className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold px-4 py-2.5 rounded-2xl shadow active-scale transition shrink-0"
            >
              + Book a Cab
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('fleet')}
              className="border border-gray-200 dark:border-slate-750 text-gray-650 dark:text-gray-200 text-[10px] font-bold px-3 py-2 rounded-2xl flex items-center gap-1 hover:bg-gray-50 active-scale shrink-0"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Fleet
            </button>
          )}
        </div>

        {/* Tab Pills Bar */}
        <div className="flex bg-gray-100 dark:bg-slate-900/60 p-1 rounded-2xl border border-gray-150/40 dark:border-slate-800/40">
          {(['fleet', 'book', 'rides'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setActiveTab(t);
                setSelectedRideForTrack(null);
              }}
              className={`flex-1 text-center py-2.5 rounded-xl text-xs font-extrabold capitalize transition-all duration-200 ${
                activeTab === t
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t === 'fleet' ? 'Fleet & Packages' : t === 'book' ? 'Book a Ride' : 'My Rides'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* TAB 1: FLEET & PACKAGES */}
          {activeTab === 'fleet' && (
            <motion.div
              key="tab-fleet"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex gap-4 border-b border-gray-150 dark:border-slate-800/50 pb-1 w-max">
                <button
                  onClick={() => setFleetSubTab('fleet')}
                  className={`text-xs font-extrabold pb-2 px-1 relative transition ${
                    fleetSubTab === 'fleet' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'
                  }`}
                >
                  Our Fleet
                  {fleetSubTab === 'fleet' && (
                    <motion.div layoutId="fleet-underline" className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-600 dark:bg-brand-400" />
                  )}
                </button>
                <button
                  onClick={() => setFleetSubTab('packages')}
                  className={`text-xs font-extrabold pb-2 px-1 relative transition ${
                    fleetSubTab === 'packages' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'
                  }`}
                >
                  Travel Packages
                  {fleetSubTab === 'packages' && (
                    <motion.div layoutId="fleet-underline" className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-600 dark:bg-brand-400" />
                  )}
                </button>
              </div>

              {fleetSubTab === 'fleet' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {vehicles.map((car) => (
                    <div key={car.id} className="card p-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 flex flex-row sm:flex-col items-center sm:items-stretch gap-3 shadow-sm hover:shadow-soft transition duration-300">
                      <img src={car.image} alt={car.name} className="w-24 h-24 sm:w-full sm:h-36 object-cover rounded-2xl shrink-0" />
                      <div className="flex-1 flex flex-row sm:flex-col justify-between items-center sm:items-stretch gap-2 w-full">
                        <div className="text-left">
                          <h4 className="font-extrabold text-xs text-gray-900 dark:text-white line-clamp-1">{car.name}</h4>
                          <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1.5 flex-wrap">
                            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-gray-400" /> {car.passengers} Pax</span>
                            <span>•</span>
                            <span>{car.luggage} bags</span>
                          </p>
                          <span className="font-black text-xs text-brand-600 dark:text-brand-400 block sm:hidden mt-1">₹{car.rate}/km</span>
                        </div>
                        <div className="flex flex-row sm:flex-col items-center sm:items-stretch sm:justify-between sm:border-t sm:border-gray-50 sm:dark:border-slate-800/40 sm:pt-3 sm:mt-3 gap-2 shrink-0">
                          <div className="hidden sm:block text-left">
                            <span className="text-[8px] uppercase tracking-wider text-gray-400 font-extrabold block">Rate Per KM</span>
                            <span className="font-black text-sm text-gray-900 dark:text-white">₹{car.rate}</span>
                          </div>
                          {car.status && car.status !== 'Available' ? (
                            <button
                              disabled
                              className="bg-gray-100 dark:bg-slate-800 text-gray-400 text-[10px] font-extrabold px-3 py-2 rounded-xl cursor-not-allowed select-none"
                            >
                              {car.status}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSelectVehicle(car)}
                              className="bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-black px-4 py-2.5 rounded-xl shadow-soft transition active-scale"
                            >
                              Book
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {packagesData.map((pkg) => (
                    <div key={pkg.id} className="card p-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 flex flex-col gap-3 shadow-sm hover:shadow-soft transition duration-300">
                      <img src={pkg.image} alt={pkg.name} className="w-full h-36 object-cover rounded-2xl" />
                      <div className="px-1 text-left flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-extrabold text-xs text-gray-900 dark:text-white line-clamp-1">{pkg.name}</h4>
                          <p className="text-[10px] text-gray-400 mt-1 leading-relaxed line-clamp-3 min-h-[45px]">{pkg.desc}</p>
                          <p className="text-[10px] text-brand-600 dark:text-brand-400 font-bold mt-2">
                            {pkg.distance} • {pkg.duration}
                          </p>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-50 dark:border-slate-800/40 pt-3 mt-3">
                          <div>
                            <span className="text-[8px] uppercase tracking-wider text-gray-400 font-extrabold block">Base Price</span>
                            <span className="font-black text-sm text-gray-900 dark:text-white">₹{pkg.price}</span>
                          </div>
                          <button
                            onClick={() => handleSelectPackage(pkg)}
                            className="bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-black px-4 py-2 rounded-xl shadow-soft transition active-scale"
                          >
                            Book
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: BOOK A RIDE FORM */}
          {activeTab === 'book' && (
            <motion.div
              key="tab-book"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <form onSubmit={handleBookCab} className="card p-5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-extrabold mb-1.5">Taxi Type</label>
                    <select
                      value={taxiType}
                      onChange={(e) => setTaxiType(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-150 dark:border-slate-700 text-xs text-gray-800 dark:text-white font-semibold outline-none focus:border-brand-500 transition"
                    >
                      <option>Local Taxi</option>
                      <option>Airport Transfer</option>
                      <option>Outstation Trip</option>
                      {packagesData.map((p) => <option key={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-extrabold mb-1.5">Vehicle Choice</label>
                    <select
                      value={vehicleChoice}
                      onChange={(e) => setVehicleChoice(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-150 dark:border-slate-700 text-xs text-gray-800 dark:text-white font-semibold outline-none focus:border-brand-500 transition"
                    >
                      <option>Sedan</option>
                      <option>SUV</option>
                      <option>Luxury Cruiser</option>
                      <option>MUV</option>
                      <option>Hatchback</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Pickup Location" placeholder="Enter pickup address / station" value={pickup} onChange={(e) => setPickup(e.target.value)} required />
                  <Input label="Drop Destination" placeholder="Enter drop location details" value={drop} onChange={(e) => setDrop(e.target.value)} required />
                </div>

                <div className="grid grid-cols-3 gap-3.5">
                  <Input label="Passenger Count" type="number" min={1} max={10} value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} required />
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-extrabold mb-1.5">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-150 dark:border-slate-750 text-xs text-gray-900 dark:text-white outline-none"
                    />
                  </div>
                  <Input label="Pickup Time" placeholder="e.g. 05:30 AM" value={time} onChange={(e) => setTime(e.target.value)} required />
                </div>

                <Input label="Luggage Details (Optional)" placeholder="e.g. 2 large bags, 1 handbag" value={luggage} onChange={(e) => setLuggage(e.target.value)} />

                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-extrabold mb-1.5">Property Association (Optional)</label>
                  <select
                    value={propertyAssociation}
                    onChange={(e) => setPropertyAssociation(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-150 dark:border-slate-700 text-xs text-gray-850 dark:text-white outline-none focus:border-brand-500 transition font-semibold"
                  >
                    <option>No property association</option>
                    <option>Ayushi Patel Residency</option>
                    <option>Siddharth Heights</option>
                  </select>
                </div>

                {/* Scan & Pay Section */}
                <div className="border-t border-gray-100 dark:border-slate-800/80 pt-5 space-y-4">
                  <div className="bg-brand-50/20 dark:bg-slate-950/25 border border-brand-100/50 dark:border-slate-800/50 rounded-2xl p-4 flex flex-col items-center text-center">
                    <span className="text-[9px] uppercase tracking-wider text-brand-600 font-black block mb-3">Scan & Pay via GPay / Any UPI App</span>
                    
                    <div className="w-32 h-32 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center relative mb-3">
                      <QrCode className="w-28 h-28 text-slate-850" />
                    </div>

                    <p className="text-[10px] font-bold text-gray-650 dark:text-gray-300">
                      UPI Handle: <span className="text-brand-600">3232_Ayushi Patel</span>
                    </p>
                    
                    <button
                      type="button"
                      onClick={handleSimulatePay}
                      className="text-[9px] font-extrabold text-brand-600 dark:text-brand-400 hover:underline mt-2 flex items-center gap-1"
                    >
                      💡 Hint: Click "Simulate Pay" to auto-fill a valid UTR code
                    </button>
                  </div>

                  <div className="space-y-1">
                    <Input
                      label="Enter UTR / Transaction ID (12 digits)"
                      placeholder="Enter 12-digit UTR/Ref Number"
                      value={utr}
                      onChange={(e) => setUtr(e.target.value.replace(/\D/g, '').slice(0, 12))}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  fullWidth
                  loading={isSubmitting}
                  className="h-11 rounded-xl text-xs font-black shadow-md mt-2"
                >
                  Confirm & Book Cab
                </Button>
              </form>
            </motion.div>
          )}

          {/* TAB 3: USER RIDE BOOKINGS */}
          {activeTab === 'rides' && (
            <motion.div
              key="tab-rides"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {loadingRides ? (
                <p className="text-xs text-gray-500 text-center py-8">Fetching booking database...</p>
              ) : selectedRideForTrack ? (
                /* Dynamic Ride Tracker Subview */
                <div className="card p-5 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800/80 pb-3">
                    <div>
                      <h4 className="font-extrabold text-xs text-gray-900 dark:text-white">Ride ID: #{selectedRideForTrack.id}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">{selectedRideForTrack.serviceName}</p>
                    </div>
                    <button
                      onClick={() => setSelectedRideForTrack(null)}
                      className="text-[10px] font-bold text-brand-600 hover:underline"
                    >
                      Close Tracker
                    </button>
                  </div>

                  <div className="text-xs space-y-2 leading-relaxed text-gray-650 dark:text-gray-400">
                    <p><span className="font-bold text-gray-900 dark:text-white">Route:</span> {selectedRideForTrack.address}</p>
                    <p><span className="font-bold text-gray-900 dark:text-white">Schedule:</span> {selectedRideForTrack.date} at {selectedRideForTrack.timeSlot}</p>
                    <p><span className="font-bold text-gray-900 dark:text-white">Chauffeur:</span> {selectedRideForTrack.professionalName || 'Pending driver assignment'}</p>
                    {selectedRideForTrack.utr && (
                      <p><span className="font-bold text-gray-905 dark:text-white">UTR/Ref:</span> <span className="font-mono bg-gray-50 dark:bg-slate-850 px-1 py-0.5 rounded">{selectedRideForTrack.utr}</span></p>
                    )}
                  </div>

                  <div className="relative pl-6 space-y-5 border-t border-gray-100 dark:border-slate-800/80 pt-4 mt-2">
                    <div className="absolute left-2 w-0.5 top-5 bottom-5 bg-gray-250 dark:bg-slate-800" />
                    
                    {stepsList.map((step, idx) => {
                      const statusIdx = stepsList.findIndex((s) => s.id === selectedRideForTrack.status);
                      const isPassed = idx <= statusIdx;
                      const isCurrent = idx === statusIdx;

                      return (
                        <div key={step.id} className="relative flex gap-3 text-xs leading-normal">
                          {isCurrent ? (
                            <div className="absolute left-0 -translate-x-[7px] w-4 h-4">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-450 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-600 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              </span>
                            </div>
                          ) : isPassed ? (
                            <div className="absolute left-0 -translate-x-[7px] w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                              <CheckCircle className="w-2.5 h-2.5 text-white" />
                            </div>
                          ) : (
                            <div className="absolute left-0 -translate-x-[7px] w-4 h-4 rounded-full border-2 border-gray-250 dark:border-slate-700 bg-white dark:bg-slate-900" />
                          )}
                          <div className="pl-2.5">
                            <p className={`font-black ${isCurrent ? 'text-brand-600 dark:text-brand-400' : isPassed ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                              {step.label}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : rides.length > 0 ? (
                <>
                  {/* Section: Upcoming */}
                  <div className="space-y-3">
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-brand-600" /> Upcoming Rides
                    </h3>
                    
                    {rides.filter((r) => r.status !== 'completed' && r.status !== 'cancelled').map((ride) => (
                      <div key={ride.id} className="card p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 flex items-center justify-between hover:shadow-soft transition">
                        <div className="space-y-1.5">
                          <h4 className="font-extrabold text-xs text-gray-900 dark:text-white">
                            {ride.serviceName}
                          </h4>
                          <p className="text-[10.5px] text-gray-500 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" /> {ride.address?.replace('Pickup: ', '').replace(' | Drop: ', ' → ')}
                          </p>
                          <p className="text-[9.5px] text-gray-450 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" /> {ride.date} at {ride.timeSlot}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedRideForTrack(ride)}
                          className="px-3.5 py-1.5 border border-gray-200 dark:border-slate-700 text-[10px] font-extrabold text-gray-650 dark:text-gray-250 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition active-scale shrink-0 ml-4"
                        >
                          Track Live
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Section: History */}
                  <div className="space-y-3 pt-2">
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-gray-400" /> Ride History
                    </h3>

                    {rides.map((ride) => {
                      const isUpcoming = ride.status !== 'completed' && ride.status !== 'cancelled';
                      if (isUpcoming) return null; // only show history here
                      
                      const showVerificationBadge = ride.status === 'pending' && !ride.paid;

                      return (
                        <div key={ride.id} className="card p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 flex items-center justify-between opacity-85">
                          <div className="space-y-1">
                            <h4 className="font-bold text-xs text-gray-700 dark:text-gray-300">
                              {ride.serviceName}
                            </h4>
                            <p className="text-[9.5px] text-gray-400">ID: #{ride.id} • {ride.date} at {ride.timeSlot}</p>
                            <p className="text-[10px] text-gray-550 mt-1">{ride.address?.replace('Pickup: ', '').replace(' | Drop: ', ' → ')}</p>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1.5 shrink-0 ml-4">
                            {showVerificationBadge ? (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-600 dark:bg-amber-950/20 border border-amber-200/20 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider">
                                Payment Under Verification
                              </span>
                            ) : (
                              <Badge tone={ride.status === 'completed' ? 'green' : 'red'} className="text-[8px] font-extrabold uppercase">
                                {ride.status}
                              </Badge>
                            )}
                            <button
                              onClick={() => setSelectedRideForTrack(ride)}
                              className="text-[10.5px] text-brand-600 hover:underline font-bold"
                            >
                              Track Cab
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="card py-10 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 border border-gray-150">
                  <Car className="w-10 h-10 text-gray-400 mb-2.5 animate-bounce" />
                  <h4 className="font-extrabold text-xs text-gray-900 dark:text-white">No active rides</h4>
                  <p className="text-[10px] text-gray-500 mt-1">Book your airport drop or local taxi today.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
