import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Calendar, DollarSign, Star,
  Wrench, Search, Download, ChevronLeft,
  Plus, Edit, Trash2, Check, XCircle, Inbox, Settings, FileText,
  ShieldAlert, Activity, RefreshCw, Send, Database, Menu, X, Clock,
  CarTaxiFront, Camera, LogOut, ShoppingBag, Package, Eye, AlertTriangle, Tag
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import {
  services as mockServices,
  userBookings as mockBookings,
  reviews as mockReviews
} from '../data/sampleData';

const mockUsers = [
  { id: 'usr1', name: 'Vikram Singh', email: 'vikram@example.com', role: 'customer', status: 'active', created_at: new Date().toISOString() },
  { id: 'usr2', name: 'Rajesh Kumar', email: 'rajesh@example.com', role: 'professional', status: 'active', created_at: new Date().toISOString() },
  { id: 'usr3', name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active', created_at: new Date().toISOString() },
  { id: 'usr4', name: 'Amit Patel', email: 'amit@example.com', role: 'staff', status: 'active', created_at: new Date().toISOString() },
  { id: 'usr5', name: 'Sunita Reddy', email: 'sunita@example.com', role: 'manager', status: 'active', created_at: new Date().toISOString() }
];

const mockOrders = [
  { id: 'ord_1', booking_id: 'b1', customer_name: 'Vikram Singh', service_name: 'Wedding Catering', amount: 49999, status: 'paid', payment_method: 'upi', date: new Date().toISOString() },
  { id: 'ord_2', booking_id: 'b2', customer_name: 'Vikram Singh', service_name: 'Full Home Cleaning', amount: 2499, status: 'paid', payment_method: 'card', date: new Date().toISOString() }
];

const mockMessages = [
  { id: 'msg_1', name: 'Karan Malhotra', email: 'karan@example.com', subject: 'Catering Quote', message: 'Hi, I would like to get a quote for a birthday party catering for 50 people.', status: 'unread', date: new Date().toISOString() },
  { id: 'msg_2', name: 'Pooja Nair', email: 'pooja@example.com', subject: 'Plumbing service warranty query', message: 'Hi, I booked a pipe leak repair last week. Is there a service warranty?', status: 'archived', date: new Date().toISOString() }
];

const mockLogs = [
  { id: 'log_1', user_id: 'usr3', user_name: 'Admin User', action: 'Admin Login', details: 'Admin logged in from IP 192.168.1.1', timestamp: new Date().toISOString() },
  { id: 'log_2', user_id: 'usr1', user_name: 'Vikram Singh', action: 'Create Booking', details: 'Created booking #b1 for Wedding Catering', timestamp: new Date().toISOString() }
];

const mockSettings = {
  appName: 'HomeSeva Pro',
  contactEmail: 'support@homeseva.com',
  contactPhone: '+91 98765 43210',
  address: '221B, Hill Road, Bandra West, Mumbai, India',
  currency: 'INR'
};

const fleetData = [
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

type AdminTab = 'overview' | 'services' | 'store_orders' | 'meal_orders' | 'plumbing_orders' | 'taxi' | 'premium_orders' | 'deep_clean_orders' | 'catering_orders' | 'electrical_orders';



const Pagination = ({ total, limit, current, onChange }: any) => {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-slate-800 flex-wrap gap-2">
      <span className="text-xs text-gray-500">Page {current} of {pages} ({total} items)</span>
      <div className="flex gap-2">
        <button onClick={() => onChange(current - 1)} disabled={current === 1} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 dark:border-slate-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-slate-800 transition">Prev</button>
        <button onClick={() => onChange(current + 1)} disabled={current === pages} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 dark:bg-slate-800 disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-slate-700 transition">Next</button>
      </div>
    </div>
  );
};

function CategoryBookingsTab({ 
  categorySlug, 
  categoryName,
  bookings, 
  users, 
  services,
  onTrack,
  onVerify,
  onAccept,
  onCancel
}: any) {
  const [searchBooking, setSearchBooking] = useState('');
  const [filterBookingStatus, setFilterBookingStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Find the category ID from services if matching by categoryName, or just filter bookings by serviceName
  const filtered = bookings.filter((b: any) => {
    let matchesCategory = false;
    
    // We try to find the service to get its category
    const svc = services.find((s: any) => s.id === b.serviceId || s.name === b.serviceName);
    const catName = svc?.categoryName?.toLowerCase() || '';
    const bSvcName = (b.serviceName || '').toLowerCase();

    if (categorySlug === 'meal_orders') {
      matchesCategory = catName.includes('meal') || catName.includes('catering') || bSvcName.includes('meal') || bSvcName.includes('cater');
    } else if (categorySlug === 'plumbing_orders') {
      matchesCategory = catName.includes('plumb') || bSvcName.includes('plumb');
    } else if (categorySlug === 'premium_orders') {
      matchesCategory = catName.includes('premium') || catName.includes('luxury') || bSvcName.includes('premium') || bSvcName.includes('luxury');
    } else if (categorySlug === 'deep_clean_orders') {
      matchesCategory = catName.includes('clean') || bSvcName.includes('clean');
    } else if (categorySlug === 'catering_orders') {
      matchesCategory = catName.includes('cater') || bSvcName.includes('cater');
    } else if (categorySlug === 'electrical_orders') {
      matchesCategory = catName.includes('electric') || bSvcName.includes('electric') || catName.includes('ac ') || bSvcName.includes('ac ');
    }

    const q = searchBooking.toLowerCase();
    const matchSearch = bSvcName.includes(q) || (b.id || '').toLowerCase().includes(q) || (b.utr || '').toLowerCase().includes(q);
    const matchStatus = filterBookingStatus === 'all' || b.status === filterBookingStatus;
    
    return matchesCategory && matchSearch && matchStatus;
  });

  const paginated = filtered.slice((currentPage - 1) * limit, currentPage * limit);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center border-b border-gray-150 dark:border-slate-800 pb-3">
        <h3 className="font-extrabold text-xs uppercase text-gray-450 tracking-wider">{categoryName} & Timelines</h3>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 select-none">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchBooking}
            onChange={(e) => setSearchBooking(e.target.value)}
            placeholder="Search booking ID, service, UTR..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 text-xs text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>
        <select
          value={filterBookingStatus}
          onChange={(e) => setFilterBookingStatus(e.target.value)}
          className="h-10 px-3 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 text-gray-700 dark:text-gray-300 outline-none"
        >
          <option value="all">All Bookings</option>
          <option value="pending">Pending Requests</option>
          <option value="upcoming">Confirmed</option>
          <option value="in-progress">In-Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="card p-0 bg-white dark:bg-slate-900 overflow-hidden border border-gray-100 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-850/60 border-b border-gray-100 dark:border-slate-800 font-extrabold text-gray-450 uppercase tracking-wider select-none">
                <th className="p-3.5 pl-4 whitespace-nowrap">BookingID / UTR</th>
                <th className="p-3.5 whitespace-nowrap">Customer Info</th>
                <th className="p-3.5 whitespace-nowrap">Service</th>
                <th className="p-3.5 whitespace-nowrap">Status</th>
                <th className="p-3.5 text-right pr-4 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-105 dark:divide-slate-800">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">
                    No orders found in this category.
                  </td>
                </tr>
              ) : paginated.map((b: any) => {
                const customer = users.find((u: any) => u.id === b.userId);
                return (
                  <tr key={b.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-850/20 text-gray-700 dark:text-gray-350">
                    <td className="p-3.5 pl-4 font-bold text-gray-900 dark:text-white uppercase whitespace-nowrap">
                      {b.id.slice(0,8)}
                      {b.paymentMethod === 'upi' && (
                        <span className="block text-[8px] bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-black tracking-wider uppercase px-1 rounded w-max mt-1">UPI Pay</span>
                      )}
                      {b.utr && (
                        <span className="block text-[9px] text-gray-450 font-mono mt-1 select-all bg-gray-50 dark:bg-slate-850 px-1 py-0.5 rounded w-max">UTR: {b.utr}</span>
                      )}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-bold text-gray-900 dark:text-white">{customer?.name || b.userId}</div>
                      <div className="text-[10px] text-gray-500">{customer?.email || 'No email'}</div>
                    </td>
                    <td className="p-3.5 font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {b.serviceName}
                      <div className="text-[10px] font-normal text-gray-450 leading-relaxed mt-1">{new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {b.timeSlot}</div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <Badge tone={b.status === 'completed' ? 'green' : b.status === 'cancelled' ? 'red' : b.status === 'pending' && b.paymentMethod === 'upi' && !b.paid ? 'amber' : 'amber'} className="capitalize text-[7.5px] font-bold">
                        {b.status === 'pending' && b.paymentMethod === 'upi' && !b.paid ? 'Pending Pay Verify' : b.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right pr-4 whitespace-nowrap">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => onTrack(b)}
                          className="px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-[10px] text-brand-650 dark:text-brand-400 font-extrabold uppercase hover:bg-brand-50 dark:hover:bg-slate-850 transition active-scale"
                        >
                          Track Details
                        </button>
                        {b.status === 'pending' && (
                          <button
                            onClick={() => {
                              if (b.paymentMethod === 'upi') {
                                onVerify(b);
                              } else {
                                onAccept(b.id);
                              }
                            }}
                            className="p-1.5 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition active-scale"
                            title={b.paymentMethod === 'upi' ? "Verify UPI Payment & Confirm" : "Accept & Confirm Job"}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {(b.status === 'upcoming' || b.status === 'pending') && (
                          <button
                            onClick={() => {
                              if (b.status === 'pending' && b.paymentMethod === 'upi') {
                                onVerify(b);
                              } else {
                                onCancel(b.id);
                              }
                            }}
                            className="p-1.5 rounded bg-rose-50 text-red-500 hover:bg-rose-100 transition active-scale"
                            title={b.status === 'pending' && b.paymentMethod === 'upi' ? "Inspect / Reject Payment" : "Cancel Booking"}
                          >
                            {b.status === 'pending' && b.paymentMethod === 'upi' ? <Search className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination total={filtered.length} limit={limit} current={currentPage} onChange={setCurrentPage} />
      </div>
    </div>
  );
}



function CatalogManagerTab({ services, fetchServices }: any) {
  const [viewType, setViewType] = useState<'service' | 'store_product'>('service');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  
  const [storeProducts, setStoreProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Unified form data
  const [formData, setFormData] = useState({ 
    id: '', name: '', slug: '', categoryId: '', categoryName: '', 
    description: '', price: '', originalPrice: '', image: '', 
    duration: '', features: '', stock: '' 
  });

  const fetchStoreProducts = async () => {
    setLoadingProducts(true);
    try {
      const data = await apiClient.getAdminStoreProducts();
      setStoreProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (viewType === 'store_product') fetchStoreProducts();
  }, [viewType]);

  const activeList = viewType === 'service' ? services : storeProducts;
  const filtered = activeList.filter((item: any) => 
    item.name?.toLowerCase().includes(search.toLowerCase()) || 
    (item.categoryName || item.category)?.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((currentPage - 1) * limit, currentPage * limit);

  const handleEdit = (item: any) => {
    if (viewType === 'service') {
      setFormData({ ...item, categoryName: item.categoryName, features: item.features?.join('\n') || '' });
    } else {
      setFormData({ ...item, categoryName: item.category, stock: String(item.stock || 0) });
    }
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      if (viewType === 'service') {
        await apiClient.deleteService(id);
        fetchServices();
      } else {
        await apiClient.deleteStoreProduct(id);
        fetchStoreProducts();
      }
    } catch (e) { console.error(e); }
  };

  const handleUploadImage = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await apiClient.uploadImage(file);
      if (data.url) setFormData(prev => ({ ...prev, image: data.url }));
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (viewType === 'service') {
        const payload = {
          ...formData,
          price: Number(formData.price),
          originalPrice: Number(formData.originalPrice),
          features: formData.features ? formData.features.split('\n').filter((f:string) => f.trim()) : []
        };
        if (formData.id) {
          await apiClient.updateService(formData.id, payload);
        } else {
          await apiClient.addService(payload as any);
        }
        fetchServices();
      } else {
        const payload = {
          name: formData.name,
          category: formData.categoryName,
          description: formData.description,
          price: Number(formData.price),
          stock: Number(formData.stock),
          image: formData.image,
          is_active: true,
          is_featured: false,
          is_popular: false
        };
        if (formData.id) {
          await apiClient.updateStoreProduct(formData.id, payload);
        } else {
          await apiClient.addStoreProduct(payload);
        }
        fetchStoreProducts();
      }
      
      setFormOpen(false);
      setFormData({ id: '', name: '', slug: '', categoryId: '', categoryName: '', description: '', price: '', originalPrice: '', image: '', duration: '', features: '', stock: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (formOpen) {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="flex justify-between items-center border-b border-gray-150 dark:border-slate-800 pb-3">
          <h3 className="font-extrabold text-sm uppercase text-gray-900 dark:text-white">
            {formData.id ? 'Edit' : 'Add New'} {viewType === 'service' ? 'Service' : 'Store Product'}
          </h3>
          <button onClick={() => setFormOpen(false)} className="text-gray-500 hover:text-gray-700">Cancel</button>
        </div>
        
        {/* Toggle Type if adding new */}
        {!formData.id && (
          <div className="flex gap-4 mb-4">
            <button onClick={() => setViewType('service')} className={`px-4 py-2 rounded-xl text-xs font-bold ${viewType === 'service' ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'}`}>Service Item</button>
            <button onClick={() => setViewType('store_product')} className={`px-4 py-2 rounded-xl text-xs font-bold ${viewType === 'store_product' ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'}`}>Store Product</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card p-5 bg-white dark:bg-slate-900 space-y-4 border border-gray-100 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 block">Name</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs" />
            </div>
            {viewType === 'service' && (
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 block">URL Slug</label>
                <input required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs" />
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 block">Category</label>
              <select required value={formData.categoryName} onChange={e => setFormData({...formData, categoryName: e.target.value, categoryId: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs">
                <option value="">Select Category...</option>
                {viewType === 'service' ? (
                  <>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Deep Clean">Deep Clean</option>
                    <option value="Premium Service">Premium Service</option>
                    <option value="Catering">Catering</option>
                    <option value="Meal Order">Meal Order</option>
                    <option value="Taxi">Taxi</option>
                  </>
                ) : (
                  <>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Breakfast Items">Breakfast Items</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Daily Essentials">Daily Essentials</option>
                    <option value="Emergency Supplies">Emergency Supplies</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 block">Price (₹)</label>
              <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs" />
            </div>
            
            {viewType === 'store_product' && (
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 block">Stock / Quantity</label>
                <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs" />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 block">Description</label>
              <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs min-h-[80px]" />
            </div>
            
            {viewType === 'service' && (
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 block">Features (One per line)</label>
                <textarea value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs min-h-[80px]" />
              </div>
            )}
            
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 block">Image Upload</label>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {formData.image && <img src={formData.image} alt="preview" className="w-20 h-20 object-cover rounded-xl border border-gray-200 dark:border-slate-700" />}
                <input type="file" accept="image/*" onChange={handleUploadImage} className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-brand-700 hover:file:bg-gray-200 cursor-pointer" />
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full h-10 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Item'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-150 dark:border-slate-800 pb-3 gap-3">
        <h3 className="font-extrabold text-sm uppercase text-gray-900 dark:text-white">Catalog Manager</h3>
        <button onClick={() => {
          setFormData({ id: '', name: '', slug: '', categoryId: '', categoryName: '', description: '', price: '', originalPrice: '', image: '', duration: '', features: '', stock: '50' });
          setFormOpen(true);
        }} className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-500/20">
          + Add New Item
        </button>
      </div>

      <div className="flex gap-2 border-b border-gray-150 dark:border-slate-800 pb-4">
        <button onClick={() => { setViewType('service'); setCurrentPage(1); }} className={`px-5 py-2 rounded-full text-xs font-bold transition ${viewType === 'service' ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700'}`}>
          Services
        </button>
        <button onClick={() => { setViewType('store_product'); setCurrentPage(1); }} className={`px-5 py-2 rounded-full text-xs font-bold transition ${viewType === 'store_product' ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700'}`}>
          Store Products
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          placeholder={`Search ${viewType === 'service' ? 'services' : 'store products'}...`}
          className="w-full h-11 pl-10 pr-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 text-xs shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition"
        />
      </div>

      <div className="card p-0 overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gray-50 dark:bg-slate-850/60 border-b border-gray-100 dark:border-slate-800">
              <tr>
                <th className="p-3 pl-4 whitespace-nowrap">Item</th>
                <th className="p-3 whitespace-nowrap">Category</th>
                <th className="p-3 whitespace-nowrap">Price</th>
                {viewType === 'store_product' && <th className="p-3 whitespace-nowrap">Stock</th>}
                <th className="p-3 text-right pr-4 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-105 dark:divide-slate-800">
              {loadingProducts && viewType === 'store_product' ? (
                <tr><td colSpan={5} className="p-6 text-center text-gray-400 font-bold">Loading...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-gray-400 font-bold">No items found.</td></tr>
              ) : (
                paginated.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-850/20 transition">
                    <td className="p-3 pl-4 flex items-center gap-3 min-w-[200px]">
                      <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-200 border border-gray-100 dark:border-slate-700" />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-gray-500 line-clamp-1 w-48">{item.description}</p>
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg">{item.categoryName || item.category}</span>
                    </td>
                    <td className="p-3 whitespace-nowrap font-black text-brand-600">₹{item.price}</td>
                    {viewType === 'store_product' && (
                      <td className="p-3 whitespace-nowrap font-bold text-gray-700 dark:text-gray-300">{item.stock} units</td>
                    )}
                    <td className="p-3 text-right pr-4 whitespace-nowrap">
                      <button onClick={() => handleEdit(item)} className="text-brand-600 hover:text-brand-700 hover:underline font-bold mr-3 transition">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600 hover:underline font-bold transition">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination total={filtered.length} limit={limit} current={currentPage} onChange={setCurrentPage} />
      </div>
    </div>
  );
}
export function AdminDashboardPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast('Successfully signed out', 'success');
      navigate('/');
    } catch (err: any) {
      toast(err.message || 'Failed to sign out', 'error');
    }
  };

  // App States
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Database Records
  const [usersList, setUsersList] = useState<any[]>([]);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [messagesList, setMessagesList] = useState<any[]>([]);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [appSettings, setAppSettings] = useState<any>({});
  const [vehiclesList, setVehiclesList] = useState<any[]>([]);
  const [storeProductsList, setStoreProductsList] = useState<any[]>([]);

  // Store Products States
  const [storeSearch, setStoreSearch] = useState('');
  const [storePage, setStorePage] = useState(1);
  const storePageSize = 8;
  const [storeModal, setStoreModal] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: any }>({ open: false, mode: 'add' });
  const [storeForm, setStoreForm] = useState({ name: '', category: 'Daily Essentials', description: '', price: '', stock: '50', image: '', is_active: true, is_featured: false, is_popular: false });
  const [storeSaving, setStoreSaving] = useState(false);
  
  // Store Orders States
  const [storeOrders, setStoreOrders] = useState<any[]>([]);
  const [storeOrdersSearch, setStoreOrdersSearch] = useState('');
  const [storeOrdersFilter, setStoreOrdersFilter] = useState('');
  const [storeOrdersPayFilter, setStoreOrdersPayFilter] = useState('');
  const [selectedStoreOrder, setSelectedStoreOrder] = useState<any | null>(null);
  const [storeOrdersPage, setStoreOrdersPage] = useState(1);
  const [verifyingStorePayment, setVerifyingStorePayment] = useState(false);
  const [storeOrderRejReason, setStoreOrderRejReason] = useState('');
  const [assignWorkerForm, setAssignWorkerForm] = useState({ worker_name: '', worker_phone: '' });
  const [assigningWorker, setAssigningWorker] = useState(false);
  const [trackingStageForm, setTrackingStageForm] = useState('');
  const [updatingTracking, setUpdatingTracking] = useState(false);
  
  const [storeSettings, setStoreSettings] = useState({ delivery_fee: 0, platform_fee: 0, delivery_threshold: 0 });
  const [storeSettingsSaving, setStoreSettingsSaving] = useState(false);

  // Filter States
  const [searchUser, setSearchUser] = useState('');
  const [filterUserRole, setFilterUserRole] = useState('all');
  const [searchService, setSearchService] = useState('');
  const [filterServiceCat, setFilterServiceCat] = useState('all');
  const [searchBooking, setSearchBooking] = useState('');
  const [filterBookingStatus, setFilterBookingStatus] = useState('all');
  const [searchVehicle, setSearchVehicle] = useState('');
  const [vehiclePage, setVehiclePage] = useState(1);
  const vehiclePageSize = 5;

  // Vehicle CRUD Modal
  const [vehicleModal, setVehicleModal] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: any }>({ open: false, mode: 'add' });
  const [vehicleForm, setVehicleForm] = useState({ name: '', type: 'Sedan', passengers: 4, luggage: 2, rate: '', image: '', status: 'Available' });
  const [vehicleImageFile, setVehicleImageFile] = useState<File | null>(null);
  const [vehicleImagePreview, setVehicleImagePreview] = useState<string>('');
  const [vehicleDragOver, setVehicleDragOver] = useState(false);

  // Modals & Forms
  const [userModal, setUserModal] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: any }>({ open: false, mode: 'add' });
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  
  const [serviceModal, setServiceModal] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: any }>({ open: false, mode: 'add' });
  const [serviceForm, setServiceForm] = useState({ name: '', categoryName: 'Electrical', price: '', description: '', duration: '60 min', featuresText: '', image: '', longDescription: '', popular: false });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageDragOver, setImageDragOver] = useState(false);

  const [replyModal, setReplyModal] = useState<{ open: boolean; messageId?: string; customerEmail?: string }>({ open: false });
  const [replyText, setReplyText] = useState('');

  const [assignModal, setAssignModal] = useState<{ open: boolean; bookingId?: string }>({ open: false });
  const [assignHelperName, setAssignHelperName] = useState('Rajesh Kumar');

  const [trackModal, setTrackModal] = useState<{ open: boolean; booking?: any }>({ open: false });
  const [customNote, setCustomNote] = useState('');

  const [verifyModal, setVerifyModal] = useState<{ open: boolean; booking?: any }>({ open: false });
  const [verifyUtrInput, setVerifyUtrInput] = useState('');
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [rejectingPayment, setRejectingPayment] = useState(false);

  // Taxi Booking States
  const [taxiTabFilter, setTaxiTabFilter] = useState<'bookings' | 'vehicles' | 'packages' | 'gallery'>('bookings');
  const [taxiStatusFilter, setTaxiStatusFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all');
  const [manageTaxiModal, setManageTaxiModal] = useState<{ open: boolean; booking?: any }>({ open: false });
  const [taxiDriverInput, setTaxiDriverInput] = useState('');
  const [taxiDriverPhoneInput, setTaxiDriverPhoneInput] = useState('');
  const [taxiLicensePlateInput, setTaxiLicensePlateInput] = useState('');
  const [taxiStatusInput, setTaxiStatusInput] = useState('');
  const [taxiTimelineNoteInput, setTaxiTimelineNoteInput] = useState('');

  // Fetch all db parameters
  const fetchData = async () => {
    setLoading(true);
    try {
      const [u, s, b, o, m, r, l, sett, v, storeSett] = await Promise.all([
        apiClient.getUsers(),
        apiClient.getServices(),
        apiClient.getBookings({}),
        apiClient.getOrders(),
        apiClient.getMessages(),
        apiClient.getReviews(),
        apiClient.getLogs(),
        apiClient.getSettings(),
        apiClient.getVehicles(),
        apiClient.getStoreSettings()
      ]);
      setUsersList(u);
      setServicesList(s);
      setBookingsList(b);
      setOrdersList(o);
      setMessagesList(m);
      setReviewsList(r);
      setAuditLogs(l);
      setAppSettings(sett);
      setVehiclesList(v);
      setStoreSettings(storeSett);
      // Fetch store products
      try {
        const sp = await apiClient.getAdminStoreProducts();
        setStoreProductsList(Array.isArray(sp) ? sp : []);
      } catch { setStoreProductsList([]); }
    } catch (err: any) {
      console.warn('Backend API connection failed, falling back to local mock data:', err);
      toast('Backend offline: loaded local mock data', 'info');
      setUsersList(mockUsers);
      setServicesList(mockServices);
      setBookingsList(mockBookings);
      setOrdersList(mockOrders);
      setMessagesList(mockMessages);
      setReviewsList(mockReviews);
      setAuditLogs(mockLogs);
      setAppSettings(mockSettings);
      setVehiclesList(fleetData);
    } finally {
      setLoading(false);
    }
  };

  const fetchServicesData = async () => {
    try {
      const data = await apiClient.getServices();
      setServicesList(data);
    } catch {}
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ==========================================
  // Actions: Vehicles Management
  // ==========================================
  const openAddVehicle = () => {
    setVehicleForm({
      name: '',
      type: 'Sedan',
      passengers: 4,
      luggage: 2,
      rate: '',
      image: '',
      status: 'Available'
    });
    setVehicleImagePreview('');
    setVehicleImageFile(null);
    setVehicleModal({ open: true, mode: 'add' });
  };

  const openEditVehicle = (car: any) => {
    setVehicleForm({
      name: car.name,
      type: car.type,
      passengers: car.passengers,
      luggage: car.luggage,
      rate: car.rate.toString(),
      image: car.image || '',
      status: car.status || 'Available'
    });
    setVehicleImagePreview(car.image || '');
    setVehicleImageFile(null);
    setVehicleModal({ open: true, mode: 'edit', data: car });
  };
  const handleVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleForm.name.trim()) {
      toast('Vehicle name is required', 'error');
      return;
    }
    if (!vehicleForm.rate) {
      toast('Rate per km is required', 'error');
      return;
    }

    try {
      let finalImageUrl = vehicleForm.image;

      if (vehicleImageFile) {
        try {
          const uploaded = await apiClient.uploadImage(vehicleImageFile);
          finalImageUrl = `http://localhost:5000/uploads/${uploaded.filename}`;
        } catch (uploadErr) {
          console.error('File upload failed, falling back to base64 preview:', uploadErr);
          finalImageUrl = vehicleImagePreview || 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=400';
        }
      }

      const payload = {
        name: vehicleForm.name,
        type: vehicleForm.type,
        passengers: Number(vehicleForm.passengers),
        luggage: Number(vehicleForm.luggage),
        rate: Number(vehicleForm.rate),
        image: finalImageUrl || 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=400',
        status: vehicleForm.status
      };

      if (vehicleModal.mode === 'add') {
        await apiClient.addVehicle(payload);
        toast('Vehicle added to fleet successfully!', 'success');
      } else {
        await apiClient.updateVehicle(vehicleModal.data.id, payload);
        toast('Vehicle details updated successfully!', 'success');
      }

      setVehicleModal({ open: false, mode: 'add' });
      setVehicleForm({ name: '', type: 'Sedan', passengers: 4, luggage: 2, rate: '', image: '', status: 'Available' });
      setVehicleImageFile(null);
      setVehicleImagePreview('');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to save vehicle details', 'error');
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this vehicle from active fleet?')) return;
    try {
      await apiClient.deleteVehicle(id);
      toast('Vehicle deleted from fleet.', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to delete vehicle', 'error');
    }
  };

  // ==========================================
  // Actions: User Management
  // ==========================================
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (userModal.mode === 'add') {
        const added = await apiClient.addUser(userForm);
        setUsersList((prev) => [...prev, added]);
        toast('New user account added', 'success');
      } else {
        const updated = await apiClient.updateUser(userModal.data.id, userForm);
        setUsersList((prev) => prev.map((u) => (u.id === userModal.data.id ? updated : u)));
        toast('User information updated', 'success');
      }
      setUserModal({ open: false, mode: 'add' });
      setUserForm({ name: '', email: '', password: '', role: 'customer' });
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Action failed', 'error');
    }
  };

  const toggleUserStatus = async (id: string, current: string) => {
    const next = current === 'suspended' ? 'active' : 'suspended';
    try {
      const updated = await apiClient.updateUserStatus(id, next);
      setUsersList((prev) => prev.map((u) => (u.id === id ? updated : u)));
      toast(`User account ${next === 'suspended' ? 'suspended' : 'activated'}`, 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to update user status', 'error');
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await apiClient.deleteUser(id);
      setUsersList((prev) => prev.filter((u) => u.id !== id));
      toast('User deleted successfully', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to delete user', 'error');
    }
  };

  // ==========================================
  // Actions: Service Catalog
  // ==========================================
  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalImageUrl = serviceForm.image;

    // Upload file if a new file was selected
    if (imageFile) {
      try {
        setImageUploading(true);
        const uploaded = await apiClient.uploadImage(imageFile);
        finalImageUrl = uploaded.url;
      } catch (err: any) {
        toast('Image upload failed: ' + (err.response?.data?.error || err.message), 'error');
        setImageUploading(false);
        return;
      } finally {
        setImageUploading(false);
      }
    }

    const dataPayload = {
      ...serviceForm,
      image: finalImageUrl,
      price: Number(serviceForm.price),
      features: serviceForm.featuresText.split(',').map((f) => f.trim()).filter(Boolean)
    };

    try {
      if (serviceModal.mode === 'add') {
        const added = await apiClient.addService(dataPayload);
        setServicesList((prev) => [added, ...prev]);
        toast('Catalog service created', 'success');
      } else {
        const updated = await apiClient.updateService(serviceModal.data.id, dataPayload);
        setServicesList((prev) => prev.map((s) => (s.id === serviceModal.data.id ? updated : s)));
        toast('Catalog service updated', 'success');
      }
      setServiceModal({ open: false, mode: 'add' });
      setServiceForm({ name: '', categoryName: 'Electrical', price: '', description: '', duration: '60 min', featuresText: '', image: '', longDescription: '', popular: false });
      setImageFile(null);
      setImagePreview('');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Action failed', 'error');
    }
  };

  const duplicateService = async (id: string) => {
    try {
      const duplicated = await apiClient.duplicateService(id);
      setServicesList((prev) => [duplicated, ...prev]);
      toast('Service catalog duplicated', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to duplicate service', 'error');
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await apiClient.deleteService(id);
      setServicesList((prev) => prev.filter((s) => s.id !== id));
      toast('Service deleted from catalog', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to delete service', 'error');
    }
  };

  // ==========================================
  // Actions: Booking Timeline Updates
  // ==========================================
  const assignHelperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModal.bookingId) return;
    try {
      const updated = await apiClient.assignBookingHelper(assignModal.bookingId, assignHelperName);
      setBookingsList((prev) => prev.map((b) => (b.id === assignModal.bookingId ? updated : b)));
      toast('Technician helper assigned successfully', 'success');
      setAssignModal({ open: false });
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to assign helper', 'error');
    }
  };

  const addTimelineNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackModal.booking) return;
    try {
      const updated = await apiClient.addBookingNote(trackModal.booking.id, customNote);
      setBookingsList((prev) => prev.map((b) => (b.id === trackModal.booking.id ? updated : b)));
      setTrackModal((prev) => ({ ...prev, booking: updated }));
      setCustomNote('');
      toast('Timeline progress log note attached', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to add timeline note', 'error');
    }
  };

  const updateBookingStatus = async (id: string, status: string) => {
    try {
      const updated = await apiClient.updateBookingStatus(id, status);
      setBookingsList((prev) => prev.map((b) => (b.id === id ? updated : b)));
      if (trackModal.open && trackModal.booking?.id === id) {
        setTrackModal((prev) => ({ ...prev, booking: updated }));
      }
      toast(`Booking status updated to ${status}`, 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleVerifyPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyModal.booking) return;
    if (!verifyUtrInput) {
      toast('Please enter a UTR number to verify', 'error');
      return;
    }
    if (!/^\d{12}$/.test(verifyUtrInput)) {
      toast('UTR format is invalid. Must be exactly 12 digits.', 'error');
      return;
    }
    setVerifyingPayment(true);
    try {
      const res = await apiClient.verifyBookingPayment(verifyModal.booking.id, verifyUtrInput);
      if (res.success) {
        toast('Payment verified and booking confirmed successfully!', 'success');
        setVerifyModal({ open: false });
        fetchData();
      }
    } catch (err: any) {
      toast(err.response?.data?.error || err.message || 'Payment verification failed', 'error');
    } finally {
      setVerifyingPayment(false);
    }
  };

  const handleRejectPaymentSubmit = async () => {
    if (!verifyModal.booking) return;
    if (!window.confirm('Are you sure you want to reject the payment and cancel this booking?')) return;
    setRejectingPayment(true);
    try {
      const res = await apiClient.rejectBookingPayment(verifyModal.booking.id);
      if (res.success) {
        toast('UPI payment rejected and booking cancelled.', 'success');
        setVerifyModal({ open: false });
        fetchData();
      }
    } catch (err: any) {
      toast(err.response?.data?.error || err.message || 'Action failed', 'error');
    } finally {
      setRejectingPayment(false);
    }
  };

  // ==========================================
  // Actions: Orders, Inbox Messages, Reviews
  // ==========================================
  const handleOrderRefund = async (id: string, status: 'refunded' | 'cancelled') => {
    try {
      const updated = await apiClient.updateOrderStatus(id, status);
      setOrdersList((prev) => prev.map((o) => (o.id === id ? updated : o)));
      toast(`Order status marked as ${status}`, 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to update order', 'error');
    }
  };

  const archiveInboxMessage = async (id: string) => {
    try {
      const updated = await apiClient.archiveMessage(id);
      setMessagesList((prev) => prev.map((m) => (m.id === id ? updated : m)));
      toast('Support message archived', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to archive message', 'error');
    }
  };

  const deleteInboxMessage = async (id: string) => {
    try {
      await apiClient.deleteMessage(id);
      setMessagesList((prev) => prev.filter((m) => m.id !== id));
      toast('Support query deleted', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to delete message', 'error');
    }
  };

  const sendInboxReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyModal.messageId) return;
    try {
      await apiClient.replyToMessage(replyModal.messageId, replyText);
      toast('Email reply simulated & logged successfully', 'success');
      setReplyModal({ open: false });
      setReplyText('');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to send reply', 'error');
    }
  };

  const updateReviewApproveStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const updated = await apiClient.updateReviewStatus(id, status);
      setReviewsList((prev) => prev.map((r) => (r.id === id ? updated : r)));
      toast(`Review marked as ${status}`, 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to update review', 'error');
    }
  };

  const deleteReviewLog = async (id: string) => {
    try {
      await apiClient.deleteReview(id);
      setReviewsList((prev) => prev.filter((r) => r.id !== id));
      toast('Review removed from history', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to delete review', 'error');
    }
  };

  // ==========================================
  // Actions: Global Settings & Backups
  // ==========================================
  const handleSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await apiClient.updateSettings(appSettings);
      setAppSettings(updated);
      toast('Global settings configuration saved', 'success');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Failed to save settings', 'error');
    }
  };

  const downloadDatabaseBackup = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify({ usersList, servicesList, bookingsList, ordersList, reviewsList, messagesList }, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `homeseva_db_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast('JSON database schema backup downloaded!', 'success');
  };

  const exportCSV = (type: 'users' | 'bookings' | 'orders') => {
    let headers = '';
    let rows: string[] = [];
    
    if (type === 'users') {
      headers = 'ID,Name,Email,Role,Status\n';
      rows = usersList.map((u) => `${u.id},${u.name},${u.email},${u.role},${u.status || 'active'}`);
    } else if (type === 'bookings') {
      headers = 'BookingID,Service,Date,Slot,Helper,Price,Status\n';
      rows = bookingsList.map((b) => `${b.id},${b.serviceName},${b.date},${b.timeSlot},${b.professionalName},â‚¹${b.price},${b.status}`);
    } else {
      headers = 'OrderID,Customer,Service,Amount,Method,Status,Date\n';
      rows = ordersList.map((o) => `${o.id},${o.customerName},${o.serviceName},â‚¹${o.amount},${o.paymentMethod},${o.status},${o.date}`);
    }

    const csvContent = `data:text/csv;charset=utf-8,${encodeURIComponent(headers + rows.join('\n'))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute('download', `homeseva_${type}_report_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast(`${type.toUpperCase()} CSV report exported successfully!`, 'success');
  };

  // ==========================================
  // Rendering Helpers & Analytics Calculations
  // ==========================================
  const filteredUsers = usersList.filter((u) => {
    const q = searchUser.toLowerCase();
    const matchSearch = (u.name ?? '').toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q);
    const matchRole = filterUserRole === 'all' || u.role === filterUserRole;
    return matchSearch && matchRole;
  });

  const filteredServices = servicesList.filter((s) => {
    const q = searchService.toLowerCase();
    const matchSearch = (s.name ?? '').toLowerCase().includes(q) || (s.description ?? '').toLowerCase().includes(q);
    const matchCat = filterServiceCat === 'all' || (s.categoryName ?? '') === filterServiceCat;
    return matchSearch && matchCat;
  });

  const filteredBookings = bookingsList.filter((b) => {
    const q = searchBooking.toLowerCase();
    const matchSearch = (b.serviceName ?? '').toLowerCase().includes(q) || (b.id ?? '').toLowerCase().includes(q) || (b.professionalName ?? '').toLowerCase().includes(q);
    const matchStatus = filterBookingStatus === 'all' || b.status === filterBookingStatus;
    return matchSearch && matchStatus;
  });

  const totalRevenue = ordersList
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  const pendingBookings = bookingsList.filter((b) => b.status === 'pending').length;
  const inProgressBookings = bookingsList.filter((b) => b.status === 'in-progress').length;

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-slate-950 min-h-screen text-center">
        <RefreshCw className="w-10 h-10 text-brand-650 animate-spin mb-4" />
        <p className="text-sm font-bold text-gray-900 dark:text-white">Connecting system database...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row flex-1 bg-gray-50 dark:bg-slate-950 min-h-[90vh]">
      
      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-gray-150 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-brand-600 animate-pulse" />
          <span className="font-extrabold text-sm text-gray-900 dark:text-white tracking-tight">Admin Portal</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1 rounded-lg text-gray-550 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`w-full md:w-60 bg-white dark:bg-slate-900 border-r border-gray-150 dark:border-slate-800/80 shrink-0 flex flex-col justify-between ${
        isSidebarOpen ? 'block' : 'hidden md:flex'
      }`}>
        <div className="p-4 space-y-4">
          <div className="hidden md:flex items-center gap-2 mb-6 select-none pl-2">
            <Wrench className="w-5.5 h-5.5 text-brand-650 shrink-0" />
            <h1 className="font-black text-sm text-gray-900 dark:text-white tracking-tight uppercase">HomeSeva Admin</h1>
          </div>

          <nav className="space-y-1 select-none">
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: Activity },
              { id: 'services', label: 'Service Catalog', icon: Wrench },
              { id: 'store_orders', label: 'Store Orders', icon: ShoppingBag },
              { id: 'meal_orders', label: 'Meal Orders', icon: Calendar },
              { id: 'plumbing_orders', label: 'Plumbing Orders', icon: Wrench },
              { id: 'taxi', label: 'Taxi Orders', icon: CarTaxiFront },
              { id: 'premium_orders', label: 'Premium Orders', icon: Star },
              { id: 'deep_clean_orders', label: 'Deep Clean Orders', icon: Star },
              { id: 'catering_orders', label: 'Catering Orders', icon: Calendar },
              { id: 'electrical_orders', label: 'Electrical Orders', icon: Wrench },
            ].map((navTab) => {
              const isActive = activeTab === navTab.id;
              return (
                <button
                  key={navTab.id}
                  onClick={() => {
                    setActiveTab(navTab.id as AdminTab);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-bold transition text-left active-scale ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-soft-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <navTab.icon className="w-4 h-4 shrink-0" />
                  {navTab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-slate-800/50 space-y-2">
          <button
            onClick={() => navigate('/dashboard?tab=profile')}
            className="w-full flex items-center justify-between text-xs font-bold text-brand-650 hover:underline px-2 py-1.5"
          >
            <span className="flex items-center gap-1.5"><ChevronLeft className="w-4.5 h-4.5" /> Return Dashboard</span>
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 text-left active-scale"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Administrative Control Panel Body */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-5xl w-full mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-5"
          >
            {/* 1. DASHBOARD OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-150 dark:border-slate-800 pb-3">
                  <h2 className="font-extrabold text-sm uppercase text-gray-450 tracking-wider">Dashboard Overview</h2>
                  <Badge tone="brand" className="py-1 px-2.5 font-bold uppercase text-[9px] tracking-wider">Live Analytics</Badge>
                </div>

                {/* KPI Metrics Dashboard Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 select-none">
                  {[
                    { label: 'Total Revenue', value: `â‚¹${totalRevenue}`, change: '+18.2%', icon: DollarSign, tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' },
                    { label: 'Total Users', value: usersList.length.toString(), change: '+12.4%', icon: Users, tone: 'bg-blue-50 text-blue-600 dark:bg-blue-950/20' },
                    { label: 'Pending Bookings', value: pendingBookings.toString(), change: 'Urgent', icon: Clock, tone: 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' },
                    { label: 'Ongoing Services', value: inProgressBookings.toString(), change: 'Live', icon: Activity, tone: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20' },
                  ].map((kpi) => (
                    <div key={kpi.label} className="card p-4 flex flex-col justify-between h-24 hover:shadow-soft transition-all duration-300">
                      <div className="flex justify-between items-start">
                        <div className={`w-8 h-8 rounded-lg ${kpi.tone} flex items-center justify-center`}>
                          <kpi.icon className="w-4.5 h-4.5" />
                        </div>
                        <Badge tone={kpi.label === 'Pending Bookings' ? 'red' : 'green'} className="text-[7.5px] font-bold uppercase py-0.5">{kpi.change}</Badge>
                      </div>
                      <div>
                        <p className="text-base font-black text-gray-900 dark:text-white leading-none mt-2">{kpi.value}</p>
                        <p className="text-[9px] text-gray-400 font-extrabold uppercase mt-1 tracking-wider">{kpi.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simulated Business SVG charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Revenue Growth chart wrapper */}
                  <div className="card p-4 bg-white dark:bg-slate-900 select-none">
                    <h3 className="font-extrabold text-xs text-gray-950 dark:text-white mb-4">Revenue Trend (â‚¹)</h3>
                    <div className="flex items-end justify-between h-36 gap-2">
                      {[15, 28, 42, 38, 48, 55, 62].map((val, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                          <div
                            className="w-full bg-gradient-to-t from-emerald-600 to-teal-500 rounded-t-lg relative transition-all duration-300 hover:brightness-95"
                            style={{ height: `${(val / 62) * 100}%` }}
                          >
                            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              â‚¹{val}k
                            </span>
                          </div>
                          <span className="text-[8px] text-gray-400 font-extrabold">W{idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Booking Metrics growth charts */}
                  <div className="card p-4 bg-white dark:bg-slate-900 select-none">
                    <h3 className="font-extrabold text-xs text-gray-950 dark:text-white mb-4">User Growth Stats</h3>
                    <div className="flex items-end justify-between h-36 gap-2">
                      {[12, 18, 25, 34, 48, 52, 60].map((val, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                          <div
                            className="w-full bg-gradient-to-t from-brand-650 to-brand-450 rounded-t-lg relative transition-all duration-300 hover:brightness-95"
                            style={{ height: `${(val / 60) * 100}%` }}
                          >
                            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              +{val}%
                            </span>
                          </div>
                          <span className="text-[8px] text-gray-400 font-extrabold">M{idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Audit Logs Quick View */}
                <div className="card p-4 bg-white dark:bg-slate-900">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-slate-800">
                    <h3 className="font-extrabold text-xs text-gray-950 dark:text-white">Recent System Log Audit Trail</h3>
                    <button onClick={() => setActiveTab('settings')} className="text-[10px] text-brand-650 hover:underline font-extrabold uppercase">See Log Table</button>
                  </div>
                  <div className="space-y-3">
                    {auditLogs.slice(0, 4).map((log) => (
                      <div key={log.id} className="text-xs flex justify-between items-start gap-4">
                        <div>
                          <p className="font-bold text-gray-800 dark:text-gray-200">{log.action}</p>
                          <p className="text-[10px] text-gray-450 mt-0.5">{log.details}</p>
                        </div>
                        <span className="text-[9px] text-gray-400 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. USER MANAGEMENT TAB */}
            {activeTab === 'taxi' && (
              <div className="space-y-5">
                <div className="card p-5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-3xl relative select-none text-left">
                  <span className="text-[9px] uppercase tracking-wider text-brand-600 font-extrabold flex items-center gap-1">
                    <CarTaxiFront className="w-3.5 h-3.5" /> ADMIN PORTAL
                  </span>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white mt-1">Taxi Booking Services</h2>
                  <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5 max-w-2xl">
                    Manage driver assignments, active vehicles list, travel packages, and logs for transport concierge rides.
                  </p>
                </div>

                {/* Sub Tab Pills */}
                <div className="flex bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 p-1 rounded-2xl w-max gap-1 select-none">
                  {[
                    { id: 'bookings', label: 'BOOKINGS' },
                    { id: 'vehicles', label: 'VEHICLES' },
                    { id: 'packages', label: 'TAXI PACKAGES' },
                    { id: 'gallery', label: 'GALLERY' }
                  ].map((subT) => (
                    <button
                      key={subT.id}
                      onClick={() => setTaxiTabFilter(subT.id as any)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition ${
                        taxiTabFilter === subT.id
                          ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow'
                          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      {subT.label}
                    </button>
                  ))}
                </div>

                {/* BOOKINGS TABLE SECTION */}
                {taxiTabFilter === 'bookings' && (
                  <div className="space-y-4">
                    {/* Status filter buttons */}
                    <div className="flex gap-2 select-none">
                      {[
                        { id: 'all', label: 'ALL' },
                        { id: 'pending', label: 'PENDING' },
                        { id: 'active', label: 'ACTIVE' },
                        { id: 'completed', label: 'COMPLETED' }
                      ].map((st) => (
                        <button
                          key={st.id}
                          onClick={() => setTaxiStatusFilter(st.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition ${
                            taxiStatusFilter === st.id
                              ? 'bg-brand-600 text-white'
                              : 'bg-gray-100 dark:bg-slate-850/60 text-gray-550 border border-transparent dark:border-slate-800'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>

                    {/* Table of taxi bookings */}
                    <div className="card p-0 bg-white dark:bg-slate-900 overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-slate-850/60 border-b border-gray-100 dark:border-slate-800 font-extrabold text-gray-400 uppercase tracking-wider select-none text-[10px]">
                              <th className="p-3.5 pl-4">CUSTOMER</th>
                              <th className="p-3.5">TRIP DETAILS</th>
                              <th className="p-3.5">PASSENGER INFO</th>
                              <th className="p-3.5">STATUS</th>
                              <th className="p-3.5">ASSIGNED DRIVER</th>
                              <th className="p-3.5 text-right pr-4">ACTIONS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80 text-gray-650 dark:text-gray-400">
                            {bookingsList
                              .filter((b) => {
                                const isTaxi =
                                  b.serviceId?.startsWith('t_') ||
                                  b.serviceId?.startsWith('p_') ||
                                  b.serviceName?.toLowerCase().includes('taxi') ||
                                  b.serviceName?.toLowerCase().includes('cab');
                                if (!isTaxi) return false;
                                
                                if (taxiStatusFilter === 'pending') return b.status === 'pending';
                                if (taxiStatusFilter === 'active') return b.status === 'in-progress';
                                if (taxiStatusFilter === 'completed') return b.status === 'completed';
                                return true;
                              })
                              .map((b) => {
                                const addressStr = b.address || '';
                                const notesStr = b.notes || '';
                                
                                const pickupLoc = addressStr.includes('Pickup: ')
                                  ? addressStr.split(' | ')[0].replace('Pickup: ', '')
                                  : 'abc';
                                const dropLoc = addressStr.includes('Drop: ')
                                  ? addressStr.split(' | ')[1].replace('Drop: ', '')
                                  : 'behwi';
                                  
                                const passengersVal = notesStr.includes('Pax: ')
                                  ? notesStr.split(' | ')[0].replace('Pax: ', '')
                                  : '1';
                                const carVal = notesStr.includes('Car: ')
                                  ? notesStr.split(' | ')[1].replace('Car: ', '')
                                  : 'SUV';
                                const luggageVal = notesStr.includes('Luggage: ')
                                  ? notesStr.split(' | ')[2].replace('Luggage: ', '')
                                  : 'up to 3 bags';

                                const showUtrVerification = b.status === 'pending' && !b.paid;

                                return (
                                  <tr key={b.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-850/10">
                                    <td className="p-3.5 pl-4">
                                      <div className="font-bold text-gray-900 dark:text-white capitalize">{b.userName || 'trupti'}</div>
                                      <div className="text-[10px] text-gray-450 mt-0.5">{b.userEmail || 'ridhiparmar07@gmail.com'}</div>
                                    </td>
                                    <td className="p-3.5">
                                      <div className="font-bold text-gray-900 dark:text-white">{b.serviceName}</div>
                                      <div className="text-[10px] text-gray-500 mt-0.5 font-semibold">
                                        From: {pickupLoc} <span className="text-gray-400">â†’</span> To: {dropLoc}
                                      </div>
                                      <div className="text-[9px] text-gray-400 mt-0.5">{b.date} at {b.timeSlot}</div>
                                    </td>
                                    <td className="p-3.5">
                                      <div className="font-semibold text-gray-700 dark:text-gray-300">{passengersVal} Pax</div>
                                      <div className="text-[10px] text-gray-405 mt-0.5">Car: {carVal}</div>
                                      <div className="text-[9px] text-gray-450 italic mt-0.5">Luggage: {luggageVal}</div>
                                    </td>
                                    <td className="p-3.5">
                                      {showUtrVerification ? (
                                        <span className="px-2.5 py-0.5 bg-amber-50 text-amber-600 dark:bg-amber-950/20 border border-amber-200/20 rounded text-[8.5px] font-black uppercase tracking-wider">
                                          Payment Under Verification
                                        </span>
                                      ) : (
                                        <Badge tone={b.status === 'completed' ? 'green' : b.status === 'cancelled' ? 'red' : 'brand'} className="text-[7.5px] uppercase font-bold px-1.5 py-0.5">
                                          {b.status}
                                        </Badge>
                                      )}
                                    </td>
                                    <td className="p-3.5">
                                      <span className={b.professionalName ? 'font-bold text-gray-805 dark:text-white' : 'italic text-gray-400 font-semibold'}>
                                        {b.professionalName || 'Unassigned'}
                                      </span>
                                    </td>
                                    <td className="p-3.5 text-right pr-4">
                                      <button
                                        onClick={() => {
                                          setTaxiDriverInput(b.professionalName || '');
                                          setTaxiDriverPhoneInput(b.driverPhone || '');
                                          setTaxiLicensePlateInput(b.licensePlate || '');
                                          setTaxiStatusInput(b.status);
                                          setTaxiTimelineNoteInput('');
                                          setManageTaxiModal({ open: true, booking: b });
                                        }}
                                        className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black px-3.5 py-1.5 rounded-lg hover:bg-slate-800 dark:hover:bg-gray-100 transition active-scale shadow-sm"
                                      >
                                        Manage
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* VEHICLES TAB */}
                {taxiTabFilter === 'vehicles' && (
                  <div className="space-y-4">
                    {/* Header toolbar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 select-none">
                      <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">Active Fleet Vehicles</h3>
                      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        {/* Search Bar */}
                        <div className="relative flex-1 sm:w-64">
                          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search vehicles..."
                            value={searchVehicle}
                            onChange={(e) => {
                              setSearchVehicle(e.target.value);
                              setVehiclePage(1); // reset to page 1 on search
                            }}
                            className="w-full h-9 pl-9 pr-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500 transition"
                          />
                        </div>

                        {/* Add Vehicle Button */}
                        <button
                          onClick={openAddVehicle}
                          className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-soft transition active-scale shrink-0"
                        >
                          <Plus className="w-4 h-4" /> Add Vehicle
                        </button>
                      </div>
                    </div>

                    {/* Table of active vehicles */}
                    <div className="card p-0 bg-white dark:bg-slate-900 overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-slate-850/60 border-b border-gray-100 dark:border-slate-800 font-extrabold text-gray-400 uppercase tracking-wider select-none text-[10px]">
                              <th className="p-3.5 pl-4">VEHICLE NAME</th>
                              <th className="p-3.5">TYPE</th>
                              <th className="p-3.5">CAPACITY (PAX/BAGS)</th>
                              <th className="p-3.5">BASE RATE / KM</th>
                              <th className="p-3.5">STATUS</th>
                              <th className="p-3.5 text-right pr-4">ACTIONS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80 text-gray-650 dark:text-gray-400">
                            {(() => {
                              const filtered = vehiclesList.filter((v) =>
                                v.name.toLowerCase().includes(searchVehicle.toLowerCase()) ||
                                v.type.toLowerCase().includes(searchVehicle.toLowerCase())
                              );
                              
                              const totalCount = filtered.length;
                              const paginated = filtered.slice((vehiclePage - 1) * vehiclePageSize, vehiclePage * vehiclePageSize);

                              if (totalCount === 0) {
                                return (
                                  <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-400 select-none">
                                      No vehicles found in fleet.
                                    </td>
                                  </tr>
                                );
                              }

                              return paginated.map((car) => (
                                <tr key={car.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-850/10">
                                  <td className="p-3.5 pl-4">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={car.image || 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=400'}
                                        alt={car.name}
                                        className="w-12 h-9 object-cover rounded-lg border border-gray-100 dark:border-slate-800"
                                      />
                                      <span className="font-bold text-gray-900 dark:text-white">{car.name}</span>
                                    </div>
                                  </td>
                                  <td className="p-3.5">
                                    <span className="font-semibold">{car.type}</span>
                                  </td>
                                  <td className="p-3.5 text-gray-500 font-semibold">
                                    {car.passengers} Pax / {car.luggage} Bags
                                  </td>
                                  <td className="p-3.5 font-bold text-gray-900 dark:text-white">
                                    â‚¹{car.rate}
                                  </td>
                                  <td className="p-3.5">
                                    <Badge
                                      tone={car.status === 'Available' ? 'green' : car.status === 'Booked' ? 'brand' : 'amber'}
                                      className="text-[7.5px] uppercase font-bold"
                                    >
                                      {car.status || 'Available'}
                                    </Badge>
                                  </td>
                                  <td className="p-3.5 text-right pr-4">
                                    <div className="flex items-center justify-end gap-2.5">
                                      <button
                                        onClick={() => openEditVehicle(car)}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/20 transition active-scale"
                                        title="Edit Vehicle"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteVehicle(car.id)}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition active-scale"
                                        title="Delete Vehicle"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ));
                            })()}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Bar */}
                      {(() => {
                        const filtered = vehiclesList.filter((v) =>
                          v.name.toLowerCase().includes(searchVehicle.toLowerCase()) ||
                          v.type.toLowerCase().includes(searchVehicle.toLowerCase())
                        );
                        const totalCount = filtered.length;
                        const pages = Math.ceil(totalCount / vehiclePageSize);
                        if (totalCount === 0 || pages <= 1) return null;

                        const startIdx = (vehiclePage - 1) * vehiclePageSize + 1;
                        const endIdx = Math.min(vehiclePage * vehiclePageSize, totalCount);

                        return (
                          <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-800/80 px-4 py-3 bg-gray-50/50 dark:bg-slate-850/20 select-none text-[10px] font-semibold text-gray-500">
                            <div>
                              Showing <span className="text-gray-900 dark:text-white font-bold">{startIdx}-{endIdx}</span> of <span className="text-gray-900 dark:text-white font-bold">{totalCount}</span> entries
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setVehiclePage((p) => Math.max(1, p - 1))}
                                disabled={vehiclePage === 1}
                                className="px-3 py-1.5 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition active-scale"
                              >
                                Previous
                              </button>
                              <button
                                onClick={() => setVehiclePage((p) => Math.min(pages, p + 1))}
                                disabled={vehiclePage === pages}
                                className="px-3 py-1.5 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition active-scale"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* TAXI PACKAGES MOCK TAB */}
                {taxiTabFilter === 'packages' && (
                  <div className="space-y-3 select-none text-left">
                    {packagesData.map((p) => (
                      <div key={p.id} className="card p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <h4 className="font-extrabold text-xs text-gray-900 dark:text-white">{p.name}</h4>
                          <p className="text-[10px] text-gray-400 mt-1">{p.desc}</p>
                        </div>
                        <span className="font-black text-xs text-brand-650 dark:text-brand-400 ml-4 shrink-0">â‚¹{p.price}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* GALLERY MOCK TAB */}
                {taxiTabFilter === 'gallery' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 select-none">
                    {fleetData.map((car) => (
                      <div key={car.id} className="card p-1 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
                        <img src={car.image} alt={car.name} className="w-full h-24 object-cover rounded-xl" />
                        <p className="text-[9.5px] font-bold text-gray-700 dark:text-gray-300 text-center py-1 truncate">{car.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        
            
            {/* SERVICES TAB */}
            {activeTab === 'services' && (
              <CatalogManagerTab services={servicesList} fetchServices={fetchServicesData} />
            )}

            {/* CATEGORY ORDERS */}
            {['meal_orders', 'plumbing_orders', 'premium_orders', 'deep_clean_orders', 'catering_orders', 'electrical_orders'].includes(activeTab) && (
              <CategoryBookingsTab 
                categorySlug={activeTab}
                categoryName={activeTab.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                bookings={bookingsList}
                users={usersList}
                services={servicesList}
                onTrack={(b: any) => {
                  setTrackModal({ open: true, booking: b });
                  setCustomNote('');
                }}
                onVerify={(b: any) => {
                  setVerifyUtrInput(b.utr || '');
                  setVerifyModal({ open: true, booking: b });
                }}
                onAccept={(id: string) => updateBookingStatus(id, 'upcoming')}
                onCancel={(id: string) => updateBookingStatus(id, 'cancelled')}
              />
            )}

        </AnimatePresence>
      </main>

      {/* ========================================================================= */}
      {/* DIALOG PORTALS / MODAL OVERLAYS */}
      {/* ========================================================================= */}

      {/* Manage Taxi Booking Modal */}
      {manageTaxiModal.open && manageTaxiModal.booking && (() => {
        const addressStr = manageTaxiModal.booking.address || '';
        const notesStr = manageTaxiModal.booking.notes || '';

        const pickupLoc = addressStr.includes('Pickup: ')
          ? addressStr.split(' | ')[0].replace('Pickup: ', '')
          : 'abc';
        const dropLoc = addressStr.includes('Drop: ')
          ? addressStr.split(' | ')[1].replace('Drop: ', '')
          : 'behwi';
          
        const passengersVal = notesStr.includes('Pax: ')
          ? notesStr.split(' | ')[0].replace('Pax: ', '')
          : '1';
        const carVal = notesStr.includes('Car: ')
          ? notesStr.split(' | ')[1].replace('Car: ', '')
          : 'SUV';
        const luggageVal = notesStr.includes('Luggage: ')
          ? notesStr.split(' | ')[2].replace('Luggage: ', '')
          : 'up to 3 bags';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-soft-lg text-left"
            >
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-slate-800 pb-2.5">
                <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">
                  Manage Taxi Booking
                </h4>
                <button
                  onClick={() => setManageTaxiModal({ open: false })}
                  className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Trip Overview Box */}
                <div className="bg-gray-50/50 dark:bg-slate-950/40 p-4 rounded-2xl border border-gray-150/60 dark:border-slate-800/80 text-xs space-y-2 select-none">
                  <span className="text-[8px] uppercase tracking-wider text-gray-400 font-extrabold block mb-1">Trip Overview</span>
                  <div>
                    <span className="font-semibold text-gray-500">Customer: </span>
                    <span className="font-extrabold text-gray-800 dark:text-gray-200 capitalize">{manageTaxiModal.booking.userName || 'trupti'}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500">Trip Type: </span>
                    <span className="font-extrabold text-gray-805 dark:text-gray-200">{manageTaxiModal.booking.serviceName}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500">Route: </span>
                    <span className="font-extrabold text-gray-805 dark:text-gray-200">{pickupLoc} <span className="text-gray-400">â†’</span> {dropLoc}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500">Schedule: </span>
                    <span className="font-extrabold text-gray-805 dark:text-gray-200">{manageTaxiModal.booking.date} at {manageTaxiModal.booking.timeSlot}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500">Passengers: </span>
                    <span className="font-extrabold text-gray-805 dark:text-gray-200">{passengersVal} Pax ({carVal})</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500">Luggage: </span>
                    <span className="font-extrabold text-gray-805 dark:text-gray-200">Luggage preference: {luggageVal}.</span>
                  </div>
                </div>

                {/* Verification indicator if unpaid */}
                {manageTaxiModal.booking.utr && !manageTaxiModal.booking.paid && (
                  <div className="bg-amber-50/45 dark:bg-amber-950/10 p-3 rounded-2xl border border-amber-200/20 text-xs">
                    <span className="text-[8.5px] uppercase font-bold text-amber-600 block">Entered UTR: {manageTaxiModal.booking.utr}</span>
                    <button
                      onClick={async () => {
                        try {
                          await apiClient.verifyBookingPayment(manageTaxiModal.booking.id, manageTaxiModal.booking.utr);
                          toast('Payment Verified & Booking Confirmed!', 'success');
                          setManageTaxiModal({ open: false });
                          fetchData();
                        } catch (err: any) {
                          toast(err.message || 'Verification failed', 'error');
                        }
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black py-2 rounded-xl mt-2 shadow-sm transition active-scale"
                    >
                      Confirm Payment & Verify UTR
                    </button>
                  </div>
                )}

                {/* Driver Name & Phone Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-extrabold mb-1.5">Driver Name</label>
                    <input
                      type="text"
                      value={taxiDriverInput}
                      onChange={(e) => setTaxiDriverInput(e.target.value)}
                      placeholder="e.g. Ramesh Patel"
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-150 dark:border-slate-805 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500 transition font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-extrabold mb-1.5">Driver Phone</label>
                    <input
                      type="text"
                      value={taxiDriverPhoneInput}
                      onChange={(e) => setTaxiDriverPhoneInput(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-150 dark:border-slate-805 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500 transition font-semibold"
                    />
                  </div>
                </div>

                {/* License Plate Number */}
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-extrabold mb-1.5">License Plate Number</label>
                  <input
                    type="text"
                    value={taxiLicensePlateInput}
                    onChange={(e) => setTaxiLicensePlateInput(e.target.value)}
                    placeholder="e.g. GJ24AB1234"
                    className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-150 dark:border-slate-805 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500 transition font-semibold"
                  />
                </div>

                {/* Ride Stage Status dropdown */}
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-extrabold mb-1.5">Ride Stage Status</label>
                  <select
                    value={taxiStatusInput}
                    onChange={(e) => setTaxiStatusInput(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-150 dark:border-slate-805 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500 transition font-semibold"
                  >
                    <option value="pending">Pending Confirmation</option>
                    <option value="confirmed">Driver Assigned</option>
                    <option value="on-route">Driver On Route</option>
                    <option value="started">Trip Started</option>
                    <option value="completed">Trip Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Add timeline note */}
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-extrabold mb-1.5">Add Timeline Note / Log Update</label>
                  <textarea
                    rows={3}
                    value={taxiTimelineNoteInput}
                    onChange={(e) => setTaxiTimelineNoteInput(e.target.value)}
                    placeholder="e.g. Driver Ramesh dispatched for pick up."
                    className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-150 dark:border-slate-805 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500 transition font-semibold resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 dark:border-slate-800/40 pt-4 mt-5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setManageTaxiModal({ open: false })}
                  className="h-9 text-[10px] font-bold"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={async () => {
                    try {
                      await apiClient.manageTaxiBooking(manageTaxiModal.booking.id, {
                        driverName: taxiDriverInput,
                        driverPhone: taxiDriverPhoneInput,
                        licensePlate: taxiLicensePlateInput,
                        status: taxiStatusInput,
                        timelineNote: taxiTimelineNoteInput
                      });

                      toast('Taxi booking updated successfully!', 'success');
                      setManageTaxiModal({ open: false });
                      fetchData();
                    } catch (err: any) {
                      toast(err.message || 'Failed to save updates', 'error');
                    }
                  }}
                  className="h-9 text-[10px] font-bold px-4 bg-brand-600 text-white"
                >
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </div>
        );
      })()}

      {/* Active Fleet Vehicle CRUD Modal */}
      {vehicleModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 backdrop-blur-sm p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-soft-lg text-left"
          >
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-slate-800 pb-2.5">
              <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">
                {vehicleModal.mode === 'add' ? 'Add Active Fleet Vehicle' : 'Edit Active Fleet Vehicle'}
              </h4>
              <button
                onClick={() => setVehicleModal({ open: false, mode: 'add' })}
                className="p-1 rounded-full text-gray-400 hover:text-gray-650 dark:hover:text-gray-200"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleVehicleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-extrabold mb-1.5">Vehicle Name</label>
                  <input
                    type="text"
                    required
                    value={vehicleForm.name}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, name: e.target.value })}
                    placeholder="e.g. Toyota Innova Crysta"
                    className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-150 dark:border-slate-805 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500 transition"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-extrabold mb-1.5">Vehicle Class / Type</label>
                  <select
                    value={vehicleForm.type}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, type: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-150 dark:border-slate-805 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500 transition"
                  >
                    <option>Sedan</option>
                    <option>SUV</option>
                    <option>MUV</option>
                    <option>Luxury Cruiser</option>
                    <option>Premium Car</option>
                    <option>Hatchback</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-extrabold mb-1.5">Passenger Cap</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={vehicleForm.passengers}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, passengers: Number(e.target.value) })}
                    placeholder="e.g. 7"
                    className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-150 dark:border-slate-805 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-extrabold mb-1.5">Luggage Cap</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={vehicleForm.luggage}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, luggage: Number(e.target.value) })}
                    placeholder="e.g. 4"
                    className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-150 dark:border-slate-805 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-extrabold mb-1.5">Rate / KM (INR)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={vehicleForm.rate}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, rate: e.target.value })}
                    placeholder="e.g. 18"
                    className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-150 dark:border-slate-805 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500 transition"
                  />
                </div>
              </div>

              {/* Photo Upload Container */}
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-extrabold mb-1.5">Vehicle Photo File</label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setVehicleDragOver(true); }}
                  onDragLeave={() => setVehicleDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setVehicleDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      setVehicleImageFile(file);
                      const r = new FileReader();
                      r.onloadend = () => setVehicleImagePreview(r.result as string);
                      r.readAsDataURL(file);
                    }
                  }}
                  onClick={() => document.getElementById('vehicle-image-picker')?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition select-none ${
                    vehicleDragOver
                      ? 'border-brand-500 bg-brand-50/20'
                      : vehicleImagePreview
                      ? 'border-gray-200 dark:border-slate-800 bg-gray-55/10'
                      : 'border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/20 hover:border-gray-300 dark:hover:border-slate-700'
                  }`}
                >
                  <input
                    type="file"
                    id="vehicle-image-picker"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setVehicleImageFile(file);
                        const r = new FileReader();
                        r.onloadend = () => setVehicleImagePreview(r.result as string);
                        r.readAsDataURL(file);
                      }
                    }}
                  />
                  {vehicleImagePreview ? (
                    <div className="relative w-full h-28">
                      <img src={vehicleImagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                      <div className="absolute inset-0 bg-black/40 hover:bg-black/60 rounded-xl flex items-center justify-center text-[10px] text-white opacity-0 hover:opacity-100 transition duration-200">
                        Click to change photo
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-slate-800 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-2">
                        <Camera className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-gray-800 dark:text-white">Click to upload files</span>
                      <span className="text-[10px] text-gray-405 mt-1">PNG, JPG, JPEG, PDF up to 5MB</span>
                    </>
                  )}
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-gray-400 font-extrabold mb-1.5">Fleet Status</label>
                <select
                  value={vehicleForm.status}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, status: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-150 dark:border-slate-805 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500 transition font-semibold"
                >
                  <option>Available</option>
                  <option>Booked</option>
                  <option>Out of Service</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 dark:border-slate-800/40 pt-4 mt-5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setVehicleModal({ open: false, mode: 'add' })}
                  className="h-9 text-[10px] font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 text-[10px] font-bold px-4 bg-brand-600 text-white"
                >
                  Save Vehicle
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* User CRUD Modal */}
      {userModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-5 shadow-soft-lg text-left"
          >
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-slate-800 pb-2.5">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-900 dark:text-white">
                {userModal.mode === 'add' ? 'Add New User Account' : 'Edit User Profile'}
              </h4>
              <button onClick={() => setUserModal({ open: false, mode: 'add' })} className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Rajesh Kumar"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                required
              />
              <Input
                label="Email Address"
                placeholder="rajesh@example.com"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="Password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                required={userModal.mode === 'add'}
              />
              
              <div>
                <label className="block text-xs font-bold text-gray-450 dark:text-gray-400 mb-1.5">User Access Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500"
                >
                  <option value="customer">Customer</option>
                  <option value="professional">Professional Helper</option>
                  <option value="staff">Staff Member</option>
                  <option value="manager">Regional Manager</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={() => setUserModal({ open: false, mode: 'add' })} variant="outline" type="button" fullWidth className="h-10 text-xs">
                  Cancel
                </Button>
                <Button type="submit" fullWidth className="h-10 text-xs font-bold">
                  Save Account
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Service CRUD Modal */}
      {serviceModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 shadow-soft-lg text-left max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-brand-600" />
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-900 dark:text-white">
                  {serviceModal.mode === 'add' ? 'Create New Catalog Service' : 'Edit Service Details'}
                </h4>
              </div>
              <button
                onClick={() => {
                  setServiceModal({ open: false, mode: 'add' });
                  setImageFile(null);
                  setImagePreview('');
                }}
                className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleServiceSubmit} className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

              {/* â”€â”€ IMAGE UPLOAD ZONE â”€â”€ */}
              <div>
                <label className="block text-xs font-bold text-gray-450 dark:text-gray-400 mb-2">
                  Service Photo <span className="text-gray-400 font-normal">(drag & drop or click)</span>
                </label>

                {/* Drag-drop zone / preview */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setImageDragOver(true); }}
                  onDragLeave={() => setImageDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setImageDragOver(false);
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) {
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                      setServiceForm((prev) => ({ ...prev, image: '' }));
                    }
                  }}
                  onClick={() => document.getElementById('svc-img-input')?.click()}
                  className={`relative w-full h-40 rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden transition-all ${
                    imageDragOver
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/20'
                      : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-850/40 hover:border-brand-400 hover:bg-brand-50/30'
                  }`}
                >
                  {(imagePreview || serviceForm.image) ? (
                    <>
                      <img
                        src={imagePreview || serviceForm.image}
                        alt="preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/4239034/pexels-photo-4239034.jpeg?auto=compress&cs=tinysrgb&w=400'; }}
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="text-white text-center">
                          <Plus className="w-6 h-6 mx-auto mb-1" />
                          <p className="text-[10px] font-bold">Change Photo</p>
                        </div>
                      </div>
                      {imageFile && (
                        <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                          New Upload
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 select-none">
                      <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                        <Plus className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-400 font-bold">Drop photo here or click to browse</p>
                      <p className="text-[10px] text-gray-300 dark:text-gray-600">JPG, PNG, WebP â€” max 5 MB</p>
                    </div>
                  )}
                </div>
                <input
                  id="svc-img-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                      setServiceForm((prev) => ({ ...prev, image: '' }));
                    }
                  }}
                />

                {/* URL fallback */}
                <div className="mt-2">
                  <p className="text-[10px] text-gray-400 mb-1 font-bold uppercase tracking-wider">â€” Or paste image URL â€”</p>
                  <input
                    type="url"
                    placeholder="https://images.pexels.com/..."
                    value={serviceForm.image}
                    onChange={(e) => {
                      setServiceForm({ ...serviceForm, image: e.target.value });
                      if (e.target.value) {
                        setImageFile(null);
                        setImagePreview('');
                      }
                    }}
                    className="w-full h-9 px-3 rounded-xl text-[11px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 outline-none focus:border-brand-500 placeholder-gray-300"
                  />
                </div>
              </div>

              {/* Service Name */}
              <Input
                label="Service Name"
                placeholder="e.g. Sofa Deep Cleaning"
                value={serviceForm.name}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                required
              />

              {/* Category + Price row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-450 dark:text-gray-400 mb-1.5">Category</label>
                  <select
                    value={serviceForm.categoryName}
                    onChange={(e) => setServiceForm({ ...serviceForm, categoryName: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500"
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Carpenter">Carpenter</option>
                    <option value="AC Repair">AC Repair</option>
                    <option value="Home Cleaning">Home Cleaning</option>
                    <option value="Painting">Painting</option>
                    <option value="Pest Control">Pest Control</option>
                    <option value="Appliance Repair">Appliance Repair</option>
                  </select>
                </div>
                <Input
                  label="Price (â‚¹)"
                  type="number"
                  placeholder="e.g. 599"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                  required
                />
              </div>

              {/* Duration + Popular toggle row */}
              <div className="grid grid-cols-2 gap-3 items-end">
                <Input
                  label="Duration"
                  placeholder="e.g. 60-90 min"
                  value={serviceForm.duration}
                  onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                />
                <div>
                  <label className="block text-xs font-bold text-gray-450 dark:text-gray-400 mb-1.5">Mark as Popular</label>
                  <button
                    type="button"
                    onClick={() => setServiceForm((prev) => ({ ...prev, popular: !prev.popular }))}
                    className={`w-full h-11 rounded-xl border text-xs font-bold transition ${
                      serviceForm.popular
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white dark:bg-slate-900 text-gray-500 border-gray-200 dark:border-slate-700 hover:border-brand-400'
                    }`}
                  >
                    {serviceForm.popular ? 'â­  Featured' : 'Not Featured'}
                  </button>
                </div>
              </div>

              {/* Features */}
              <Input
                label="Key Features (comma separated)"
                placeholder="e.g. Verified helper, 30-day warranty, Same day service"
                value={serviceForm.featuresText}
                onChange={(e) => setServiceForm({ ...serviceForm, featuresText: e.target.value })}
              />

              {/* Short Description */}
              <div>
                <label className="block text-xs font-bold text-gray-455 mb-1.5">Short Description <span className="text-red-500">*</span></label>
                <textarea
                  rows={2}
                  placeholder="Brief overview shown on service cards..."
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  required
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 text-xs text-gray-900 dark:text-white outline-none resize-none focus:border-brand-500"
                />
              </div>

              {/* Long Description */}
              <div>
                <label className="block text-xs font-bold text-gray-455 mb-1.5">Full Details Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed information shown on service detail page..."
                  value={serviceForm.longDescription}
                  onChange={(e) => setServiceForm({ ...serviceForm, longDescription: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 text-xs text-gray-900 dark:text-white outline-none resize-none focus:border-brand-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1 pb-2">
                <Button
                  onClick={() => {
                    setServiceModal({ open: false, mode: 'add' });
                    setImageFile(null);
                    setImagePreview('');
                  }}
                  variant="outline"
                  type="button"
                  fullWidth
                  className="h-10 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  fullWidth
                  disabled={imageUploading}
                  className="h-10 text-xs font-bold"
                >
                  {imageUploading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploadingâ€¦
                    </span>
                  ) : (
                    serviceModal.mode === 'add' ? 'Publish to Catalog' : 'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}


      {/* Compose Inbox Reply Modal */}
      {replyModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-5 shadow-soft-lg text-left"
          >
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-slate-800 pb-2.5">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
                <Send className="w-4 h-4 text-brand-600" /> Compose Email Reply
              </h4>
              <button onClick={() => setReplyModal({ open: false })} className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            
            <form onSubmit={sendInboxReplySubmit} className="space-y-4">
              <div>
                <p className="text-[10px] text-gray-450 uppercase font-extrabold">Customer Email</p>
                <p className="text-xs font-bold mt-0.5">{replyModal.customerEmail}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-455 mb-1.5">Reply message text</label>
                <textarea
                  rows={4}
                  placeholder="Hi, thank you for writing. Here are details..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 text-xs text-gray-900 dark:text-white outline-none resize-none focus:border-brand-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={() => setReplyModal({ open: false })} variant="outline" type="button" fullWidth className="h-10 text-xs">
                  Cancel
                </Button>
                <Button type="submit" fullWidth className="h-10 text-xs font-bold">
                  Send Response Email
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Assign Employee Helper Modal */}
      {assignModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-5 shadow-soft-lg text-left"
          >
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-slate-800 pb-2.5">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-900 dark:text-white">
                Assign Pro Helper
              </h4>
              <button onClick={() => setAssignModal({ open: false })} className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            
            <form onSubmit={assignHelperSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-450 dark:text-gray-400 mb-1.5">Select helper professional</label>
                <select
                  value={assignHelperName}
                  onChange={(e) => setAssignHelperName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-500"
                >
                  <option value="Rajesh Kumar">Rajesh Kumar (Catering Specialist)</option>
                  <option value="Priya Sharma">Priya Sharma (Meal Prep Planner)</option>
                  <option value="Amit Patel">Amit Patel (Electrical & Plumbing Pro)</option>
                  <option value="Sunita Reddy">Sunita Reddy (Deep Cleaning Manager)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={() => setAssignModal({ open: false })} variant="outline" type="button" fullWidth className="h-10 text-xs">
                  Cancel
                </Button>
                <Button type="submit" fullWidth className="h-10 text-xs font-bold">
                  Confirm Assign helper
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Booking Track Timeline Details Modal */}
      {trackModal.open && trackModal.booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-5 shadow-soft-lg text-left max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-slate-800 pb-2.5">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-900 dark:text-white">
                Live Timeline Tracking Details
              </h4>
              <button onClick={() => setTrackModal({ open: false })} className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-gray-400 font-extrabold uppercase">Service Booked</p>
                <p className="text-xs font-black mt-0.5">{trackModal.booking.serviceName} â€¢ {trackModal.booking.id}</p>
                <p className="text-[10px] text-gray-500 mt-1">Date: {trackModal.booking.date} â€¢ {trackModal.booking.timeSlot}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Assigned: {trackModal.booking.professionalName}</p>
              </div>

              {/* Booking status transition buttons */}
              <div>
                <p className="text-[10px] text-gray-450 font-extrabold uppercase mb-2">Update status state</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'pending', label: 'Place Order', bg: 'bg-amber-600' },
                    { id: 'upcoming', label: 'Confirm Booking', bg: 'bg-blue-600' },
                    { id: 'in-progress', label: 'Start Travel / Travel', bg: 'bg-indigo-650' },
                    { id: 'completed', label: 'Complete service', bg: 'bg-emerald-600' },
                    { id: 'cancelled', label: 'Cancel booking', bg: 'bg-red-500' }
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => updateBookingStatus(trackModal.booking.id, st.id)}
                      className={`px-2 py-1.5 rounded-lg text-white text-[10px] font-bold transition active-scale ${st.bg}`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vertical timeline details */}
              <div className="bg-gray-50 dark:bg-slate-950/30 p-3.5 rounded-2xl border border-gray-100 dark:border-slate-800/80">
                <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-3">Milestones history logs</p>
                <div className="relative pl-5 space-y-4">
                  <div className="absolute left-2 top-1.5 bottom-1.5 w-0.5 bg-gray-200 dark:bg-slate-800" />
                  
                  {trackModal.booking.timeline && trackModal.booking.timeline.map((step: any, idx: number) => (
                    <div key={idx} className="relative text-[11px] leading-relaxed">
                      <div className="absolute left-0 -translate-x-[17.5px] w-3 h-3 rounded-full bg-brand-650 border border-white dark:border-slate-900" />
                      <p className="font-extrabold text-gray-900 dark:text-white capitalize">{step.status}</p>
                      <p className="text-[10px] text-gray-500 leading-snug mt-0.5">{step.note}</p>
                      <p className="text-[8px] text-gray-400 mt-0.5">{new Date(step.time).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Append custom notes form */}
              <form onSubmit={addTimelineNoteSubmit} className="space-y-3 pt-2">
                <Input
                  label="Attach timeline log note"
                  placeholder="e.g. Helper reached traffic signal, or material purchased"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  required
                />
                <Button type="submit" size="sm" fullWidth className="h-9 text-[10px] font-bold">
                  Publish Milestone Log
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Verify UPI Payment / UTR Modal */}
      {verifyModal.open && verifyModal.booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-5 shadow-soft-lg text-left"
          >
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-slate-800 pb-2.5">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
                <Database className="w-4 h-4 text-purple-650" /> Verify UPI Payment
              </h4>
              <button onClick={() => setVerifyModal({ open: false })} className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-gray-400 font-extrabold uppercase">Booking ID</p>
                <p className="text-xs font-black uppercase text-gray-800 dark:text-white mt-0.5">{verifyModal.booking.id}</p>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 font-extrabold uppercase">Service Booked</p>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-200 mt-0.5">{verifyModal.booking.serviceName}</p>

              </div>

              <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 p-3 rounded-2xl">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-purple-800 dark:text-purple-300">Bill Amount:</span>
                  <span className="font-black text-purple-950 dark:text-purple-200">â‚¹{verifyModal.booking.price}</span>
                </div>
              </div>

              {/* Verify Form */}
              <form onSubmit={handleVerifyPaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-455 mb-1.5">Customer Entered UTR / Ref Number</label>
                  <input
                    type="text"
                    maxLength={12}
                    placeholder="Enter 12-digit UPI UTR Code"
                    value={verifyUtrInput}
                    onChange={(e) => setVerifyUtrInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full h-11 px-3 rounded-xl border border-gray-250 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold font-mono tracking-widest text-center outline-none focus:border-brand-500"
                    required
                  />
                  <p className="text-[9.5px] text-gray-455 mt-1.5">
                    Verify this reference number matches the bank transaction logs.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleRejectPaymentSubmit}
                    disabled={verifyingPayment || rejectingPayment}
                    variant="outline"
                    type="button"
                    className="h-10 text-xs border-red-200 hover:bg-red-50 hover:text-red-650 font-bold"
                    fullWidth
                  >
                    {rejectingPayment ? 'Rejecting...' : 'Reject Booking'}
                  </Button>
                  <Button
                    type="submit"
                    disabled={verifyingPayment || rejectingPayment}
                    className="h-10 text-xs font-bold bg-purple-650 hover:bg-purple-750 text-white"
                    fullWidth
                  >
                    {verifyingPayment ? 'Verifying...' : 'Verify & Confirm'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* ============================================
          STORE PRODUCTS TAB
      ============================================ */}
      {activeTab === 'store_orders' && (() => {
        const fetchStoreOrders = async () => {
          try {
            const data = await apiClient.getAdminStoreOrders({
              status: storeOrdersFilter || undefined,
              payment_status: storeOrdersPayFilter || undefined,
              search: storeOrdersSearch || undefined,
            });
            setStoreOrders(Array.isArray(data) ? data : []);
          } catch { setStoreOrders([]); }
        };

        const limit = 10;
        const paginatedStoreOrders = storeOrders.slice((storeOrdersPage - 1) * limit, storeOrdersPage * limit);

        const handleVerifyStorePayment = async (action: 'approve' | 'reject' | 'reupload') => {
          if (!selectedStoreOrder) return;
          if ((action === 'reject' || action === 'reupload') && !storeOrderRejReason) {
            toast('Enter a reason', 'error'); return;
          }
          setVerifyingStorePayment(true);
          try {
            const updated = await apiClient.verifyStorePayment(selectedStoreOrder.id, { action, rejection_reason: storeOrderRejReason });
            setStoreOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
            setSelectedStoreOrder(updated);
            setStoreOrderRejReason('');
            toast(action === 'approve' ? 'Payment approved!' : action === 'reject' ? 'Payment rejected' : 'Re-upload requested', action === 'approve' ? 'success' : 'info');
          } catch { toast('Action failed', 'error'); }
          finally { setVerifyingStorePayment(false); }
        };

        const handleAssignWorker = async () => {
          if (!selectedStoreOrder || !assignWorkerForm.worker_name) { toast('Enter worker name', 'error'); return; }
          setAssigningWorker(true);
          try {
            const updated = await apiClient.assignStoreWorker(selectedStoreOrder.id, assignWorkerForm);
            setStoreOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
            setSelectedStoreOrder(updated);
            setAssignWorkerForm({ worker_name: '', worker_phone: '' });
            toast('Worker assigned!', 'success');
          } catch { toast('Failed to assign worker', 'error'); }
          finally { setAssigningWorker(false); }
        };

        const handleUpdateTracking = async () => {
          if (!selectedStoreOrder || !trackingStageForm) { toast('Select a stage', 'error'); return; }
          setUpdatingTracking(true);
          try {
            const updated = await apiClient.updateStoreTracking(selectedStoreOrder.id, { tracking_stage: trackingStageForm });
            setStoreOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
            setSelectedStoreOrder(updated);
            toast('Tracking updated!', 'success');
          } catch { toast('Update failed', 'error'); }
          finally { setUpdatingTracking(false); }
        };

        const PAY_STATUS_CLS: Record<string, string> = {
          pending: 'bg-amber-100 text-amber-700',
          verification_pending: 'bg-blue-100 text-blue-700',
          verified: 'bg-green-100 text-green-700',
          rejected: 'bg-red-100 text-red-700',
          reupload_requested: 'bg-orange-100 text-orange-700',
          cod_pending: 'bg-amber-100 text-amber-700',
        };
        const ORD_STATUS_CLS: Record<string, string> = {
          placed: 'bg-gray-100 text-gray-700',
          confirmed: 'bg-green-100 text-green-700',
          processing: 'bg-blue-100 text-blue-700',
          delivered: 'bg-green-100 text-green-700',
          cancelled: 'bg-red-100 text-red-700',
          payment_failed: 'bg-red-100 text-red-700',
        };
        const TRACK_STAGES = ['order_placed','payment_verification','confirmed','worker_assigned','on_the_way','delivered'];

        let selItems: any[] = [], selAddr: any = {};
        if (selectedStoreOrder) {
          try { selItems = JSON.parse(selectedStoreOrder.items_json || '[]'); } catch {}
          try { selAddr = JSON.parse(selectedStoreOrder.address_json || '{}'); } catch {}
        }

        return (
          <div className="space-y-5">
            <div className="card p-5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
              <p className="text-[9px] font-black uppercase tracking-widest text-green-600 mb-1">ADMIN PANEL</p>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Store Orders</h2>
              <p className="text-xs text-gray-500 mt-0.5">Verify payments, assign workers, track delivery stages.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input type="search" placeholder="Search order ID or customer..." value={storeOrdersSearch}
                  onChange={e => setStoreOrdersSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-150 dark:border-slate-700 text-xs text-gray-800 dark:text-white outline-none focus:border-brand-400" />
              </div>
              <select value={storeOrdersFilter} onChange={e => setStoreOrdersFilter(e.target.value)}
                className="h-9 px-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-150 dark:border-slate-700 text-xs text-gray-800 dark:text-white outline-none">
                <option value="">All Statuses</option>
                {['placed','confirmed','processing','delivered','cancelled','payment_failed'].map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
              </select>
              <select value={storeOrdersPayFilter} onChange={e => setStoreOrdersPayFilter(e.target.value)}
                className="h-9 px-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-150 dark:border-slate-700 text-xs text-gray-800 dark:text-white outline-none">
                <option value="">All Payments</option>
                {['pending','verification_pending','verified','rejected','reupload_requested','cod_pending'].map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
              </select>
              <button onClick={fetchStoreOrders} className="h-9 px-4 bg-brand-600 hover:bg-brand-700 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3" /> Load
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Orders List */}
              <div className="lg:col-span-2">
                <div className="card bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 overflow-hidden">
                  {storeOrders.length === 0 ? (
                    <div className="py-16 text-center">
                      <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-xs font-bold text-gray-400">No orders yet — click Load to fetch</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100 dark:border-slate-800">
                            {['Order ID', 'Customer', 'Amount', 'Payment', 'Status', 'Date', ''].map(h => (
                              <th key={h} className="text-[8px] uppercase tracking-widest text-gray-400 font-extrabold px-4 py-3 text-left whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
                          {paginatedStoreOrders.map(order => (
                            <tr key={order.id} onClick={() => { setSelectedStoreOrder(order); setTrackingStageForm(order.tracking_stage); }}
                              className={`cursor-pointer hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition ${selectedStoreOrder?.id === order.id ? 'bg-green-50/50 dark:bg-green-950/10' : ''}`}>
                              <td className="px-4 py-3"><p className="text-[10px] font-black text-gray-900 dark:text-white font-mono">{order.id}</p></td>
                              <td className="px-4 py-3"><p className="text-[10px] font-bold text-gray-700 dark:text-gray-300 max-w-[100px] truncate">{order.user_name || order.user_email || order.user_id}</p></td>
                              <td className="px-4 py-3"><p className="text-[10px] font-black text-gray-900 dark:text-white">₹{order.total}</p></td>
                              <td className="px-4 py-3"><span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full capitalize ${PAY_STATUS_CLS[order.payment_status] || 'bg-gray-100 text-gray-700'}`}>{order.payment_status?.replace(/_/g,' ')}</span></td>
                              <td className="px-4 py-3"><span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full capitalize ${ORD_STATUS_CLS[order.order_status] || 'bg-gray-100 text-gray-700'}`}>{order.order_status?.replace(/_/g,' ')}</span></td>
                              <td className="px-4 py-3"><p className="text-[9px] text-gray-400 whitespace-nowrap">{new Date(order.created_at).toLocaleDateString('en-IN')}</p></td>
                              <td className="px-4 py-3"><Eye className="w-3.5 h-3.5 text-gray-400" /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Detail Panel */}
              <div className="space-y-3">
                {selectedStoreOrder ? (
                  <>
                    {/* Order Info */}
                    <div className="card bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="font-black text-sm text-gray-900 dark:text-white">{selectedStoreOrder.id}</p>
                        <button onClick={() => setSelectedStoreOrder(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><p className="text-[8px] text-gray-400 uppercase font-bold">Customer</p><p className="font-bold text-gray-800 dark:text-white">{selectedStoreOrder.user_name || 'Guest'}</p></div>
                        <div><p className="text-[8px] text-gray-400 uppercase font-bold">Amount</p><p className="font-black text-green-600">₹{selectedStoreOrder.total}</p></div>
                        <div><p className="text-[8px] text-gray-400 uppercase font-bold">Payment Method</p><p className="font-bold text-gray-700 dark:text-gray-300 capitalize">{selectedStoreOrder.payment_method}</p></div>
                        <div><p className="text-[8px] text-gray-400 uppercase font-bold">UTR Number</p><p className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300">{selectedStoreOrder.utr_number || '—'}</p></div>
                      </div>
                      {/* Address */}
                      {selAddr?.address && (
                        <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-2.5">
                          <p className="text-[8px] font-black uppercase text-gray-400 mb-1">Delivery Address</p>
                          <p className="text-[10px] text-gray-700 dark:text-gray-300">{selAddr.address}, {selAddr.city} – {selAddr.pincode}</p>
                        </div>
                      )}
                      {/* Items */}
                      <div className="space-y-2">
                        {selItems.map((it: any, i: number) => (
                          <div key={i} className="flex items-center gap-2">
                            <img src={it.image} alt={it.name} className="w-8 h-8 rounded-lg object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=40'; }} />
                            <div className="flex-1"><p className="text-[10px] font-bold text-gray-800 dark:text-white line-clamp-1">{it.name}</p><p className="text-[8px] text-gray-400">Qty {it.qty}</p></div>
                            <p className="text-[10px] font-black text-gray-800 dark:text-white">₹{it.price * it.qty}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Screenshot */}
                    {selectedStoreOrder.screenshot_url && (
                      <div className="card bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4">
                        <p className="text-[8px] font-black uppercase text-gray-400 mb-2">Payment Screenshot</p>
                        <a href={selectedStoreOrder.screenshot_url} target="_blank" rel="noreferrer">
                          <img src={selectedStoreOrder.screenshot_url} alt="Payment" className="w-full rounded-xl object-cover max-h-48 hover:opacity-90 transition" />
                        </a>
                      </div>
                    )}

                    {/* Verify Payment */}
                    {(selectedStoreOrder.payment_status === 'verification_pending' || selectedStoreOrder.payment_status === 'pending') && (
                      <div className="card bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 space-y-3">
                        <p className="text-[8px] font-black uppercase text-gray-400">Verify Payment</p>
                        <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3">
                          <p className="text-[9px] text-gray-500 mb-0.5">UTR Number</p>
                          <p className="font-mono font-black text-sm text-gray-900 dark:text-white">{selectedStoreOrder.utr_number || 'Not provided'}</p>
                        </div>
                        <textarea value={storeOrderRejReason} onChange={e => setStoreOrderRejReason(e.target.value)} rows={2}
                          placeholder="Rejection reason (required for reject/re-upload)"
                          className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-150 dark:border-slate-700 text-xs text-gray-900 dark:text-white outline-none resize-none" />
                        <div className="grid grid-cols-3 gap-2">
                          <button onClick={() => handleVerifyStorePayment('approve')} disabled={verifyingStorePayment}
                            className="h-9 bg-green-600 hover:bg-green-700 text-white text-[9px] font-black rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-1">
                            <Check className="w-3 h-3" /> Approve
                          </button>
                          <button onClick={() => handleVerifyStorePayment('reupload')} disabled={verifyingStorePayment}
                            className="h-9 bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-black rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Re-upload
                          </button>
                          <button onClick={() => handleVerifyStorePayment('reject')} disabled={verifyingStorePayment}
                            className="h-9 bg-red-600 hover:bg-red-700 text-white text-[9px] font-black rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-1">
                            <XCircle className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Assign Worker */}
                    {selectedStoreOrder.order_status === 'confirmed' && (
                      <div className="card bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 space-y-2">
                        <p className="text-[8px] font-black uppercase text-gray-400">Assign Delivery Worker</p>
                        <input value={assignWorkerForm.worker_name} onChange={e => setAssignWorkerForm(f => ({ ...f, worker_name: e.target.value }))}
                          placeholder="Worker Name *" className="w-full h-9 px-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-150 dark:border-slate-700 text-xs outline-none" />
                        <input value={assignWorkerForm.worker_phone} onChange={e => setAssignWorkerForm(f => ({ ...f, worker_phone: e.target.value }))}
                          placeholder="Phone Number" className="w-full h-9 px-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-150 dark:border-slate-700 text-xs outline-none" />
                        <button onClick={handleAssignWorker} disabled={assigningWorker}
                          className="w-full h-9 bg-brand-600 hover:bg-brand-700 text-white text-xs font-black rounded-xl transition disabled:opacity-60">
                          {assigningWorker ? 'Assigning...' : 'Assign Worker'}
                        </button>
                      </div>
                    )}

                    {/* Update Tracking */}
                    <div className="card bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 space-y-2">
                      <p className="text-[8px] font-black uppercase text-gray-400">Update Tracking Stage</p>
                      <select value={trackingStageForm} onChange={e => setTrackingStageForm(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-150 dark:border-slate-700 text-xs text-gray-900 dark:text-white outline-none">
                        <option value="">Select Stage</option>
                        {TRACK_STAGES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                      </select>
                      <button onClick={handleUpdateTracking} disabled={updatingTracking || !trackingStageForm}
                        className="w-full h-9 bg-brand-600 hover:bg-brand-700 text-white text-xs font-black rounded-xl transition disabled:opacity-60">
                        {updatingTracking ? 'Updating...' : 'Update Stage'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="card bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-8 text-center">
                    <Eye className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-gray-400">Select an order to see details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═════════════════════════════
          STORE SETTINGS TAB
      ═════════════════════════════ */}


          </div>
  );
}
