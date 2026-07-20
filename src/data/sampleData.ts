import type {
  Category,
  Service,
  Professional,
  Review,
  Testimonial,
  Booking,
  SavedAddress,
  Notification,
  WalletTransaction,
  Coupon,
} from '../types';
import { categories, services } from './serviceCatalog';

export { categories, services };

const img = (id: number, w = 800, h = 600) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`;

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

export const legacyCategories: Category[] = [
  { id: 'c1', name: 'Electrical', slug: 'electrician', icon: 'Zap', color: 'from-amber-400 to-orange-500', description: 'Wiring, repairs, installations', serviceCount: 24 },
  { id: 'c2', name: 'Plumbing', slug: 'plumber', icon: 'Wrench', color: 'from-sky-400 to-blue-500', description: 'Leaks, fittings, fixtures', serviceCount: 18 },
  { id: 'c3', name: 'Carpenter', slug: 'carpenter', icon: 'Hammer', color: 'from-amber-600 to-yellow-700', description: 'Furniture, doors, repairs', serviceCount: 15 },
  { id: 'c4', name: 'AC Repair', slug: 'ac-repair', icon: 'Snowflake', color: 'from-cyan-400 to-sky-500', description: 'Service, install, gas refill', serviceCount: 21 },
  { id: 'c5', name: 'Appliance Repair', slug: 'appliance-repair', icon: 'Plug', color: 'from-violet-400 to-indigo-500', description: 'All home appliances', serviceCount: 19 },
  { id: 'c6', name: 'Home Cleaning', slug: 'home-cleaning', icon: 'Sparkles', color: 'from-emerald-400 to-teal-500', description: 'Full home deep clean', serviceCount: 12 },
  { id: 'c7', name: 'Bathroom Cleaning', slug: 'bathroom-cleaning', icon: 'ShowerHead', color: 'from-blue-400 to-cyan-500', description: 'Sparkling sanitation', serviceCount: 8 },
  { id: 'c8', name: 'Kitchen Cleaning', slug: 'kitchen-cleaning', icon: 'CookingPot', color: 'from-rose-400 to-pink-500', description: 'Degrease & sanitize', serviceCount: 9 },
  { id: 'c9', name: 'Sofa Cleaning', slug: 'sofa-cleaning', icon: 'Sofa', color: 'from-fuchsia-400 to-purple-500', description: 'Stain & odor removal', serviceCount: 7 },
  { id: 'c10', name: 'Pipe Leak Repair', slug: 'pest-control', icon: 'Bug', color: 'from-lime-400 to-green-500', description: 'Cockroach, termite, rats', serviceCount: 11 },
  { id: 'c11', name: 'Painting', slug: 'painting', icon: 'PaintRoller', color: 'from-orange-400 to-red-500', description: 'Interior & exterior', serviceCount: 14 },
  { id: 'c12', name: 'Water Purifier', slug: 'water-purifier', icon: 'Droplets', color: 'from-teal-400 to-emerald-500', description: 'RO service & filters', serviceCount: 6 },
  { id: 'c13', name: 'CCTV Installation', slug: 'cctv', icon: 'Cctv', color: 'from-slate-500 to-gray-700', description: 'Camera setup & setup', serviceCount: 5 },
  { id: 'c14', name: 'RO Repair', slug: 'ro-repair', icon: 'Droplet', color: 'from-cyan-400 to-blue-500', description: 'RO maintenance', serviceCount: 6 },
  { id: 'c15', name: 'Washing Machine', slug: 'washing-machine', icon: 'WashingMachine', color: 'from-indigo-400 to-blue-500', description: 'Front & top load', serviceCount: 8 },
  { id: 'c16', name: 'Refrigerator', slug: 'refrigerator', icon: 'Refrigerator', color: 'from-sky-400 to-cyan-500', description: 'Cooling & compressor', serviceCount: 7 },
  { id: 'c17', name: 'Microwave', slug: 'microwave', icon: 'Microwave', color: 'from-amber-400 to-yellow-500', description: 'Heating & panel', serviceCount: 5 },
  { id: 'c18', name: 'Geyser', slug: 'geyser', icon: 'Flame', color: 'from-red-400 to-orange-500', description: 'Install & repair', serviceCount: 4 },
  { id: 'c19', name: 'TV Repair', slug: 'tv-repair', icon: 'Tv', color: 'from-slate-400 to-slate-600', description: 'LED, LCD, OLED', serviceCount: 6 },
  { id: 'c20', name: 'Laptop Repair', slug: 'laptop-repair', icon: 'Laptop', color: 'from-zinc-400 to-slate-500', description: 'Hardware & software', serviceCount: 9 },
  { id: 'c21', name: 'Interior Design', slug: 'interior-design', icon: 'Palette', color: 'from-rose-400 to-orange-400', description: 'Modular & decor', serviceCount: 10 },
  { id: 'c22', name: 'Home Renovation', slug: 'home-renovation', icon: 'HardHat', color: 'from-amber-500 to-stone-600', description: 'Full home makeover', serviceCount: 8 },
];

export const legacyServices: Service[] = [
  { id: 's1', name: 'Wedding Catering', slug: 'ac-service-repair', categoryId: 'c4', categoryName: 'AC Repair', description: 'Complete AC servicing with foam jet cleaning and gas top-up.', longDescription: 'Our certified technicians provide a comprehensive AC service that includes foam jet cleaning of indoor and outdoor units, coil cleaning, gas pressure check, and performance optimization. We service all major brands including Daikin, LG, Voltas, Samsung, and more.', features: ['Foam jet cleaning', 'Coil & filter wash', 'Gas pressure check', 'Performance test', '45-day service warranty'], price: 499, originalPrice: 799, duration: '60-90 min', rating: 4.8, reviewCount: 12453, image: img(7526962), popular: true, tags: ['bestseller', 'same-day'] },
  { id: 's2', name: 'Full Home Cleaning', slug: 'full-home-deep-cleaning', categoryId: 'c6', categoryName: 'Home Cleaning', description: 'Professional deep cleaning for your entire home.', longDescription: 'A thorough deep cleaning service covering every room in your home. Our trained professionals use eco-friendly cleaning agents and professional-grade equipment to leave your home spotless. Includes kitchen degreasing, bathroom sanitization, dusting, vacuuming, and floor scrubbing.', features: ['All rooms covered', 'Eco-friendly chemicals', 'Professional equipment', '2-3 trained cleaners', 'Satisfaction guaranteed'], price: 2499, originalPrice: 3499, duration: '4-6 hours', rating: 4.7, reviewCount: 8932, image: img(4239034), popular: true, tags: ['bestseller'] },
  { id: 's3', name: 'Electrical Inspection', slug: 'electrician-visit', categoryId: 'c1', categoryName: 'Electrical', description: 'General electrician visit for repairs and installations.', longDescription: 'Book a verified electrician for any electrical work — switchboard repair, fan installation, light fitting, MCB replacement, wiring checks, and more. Transparent pricing with no hidden charges.', features: ['Verified electrician', 'All minor repairs', 'Safety inspected', '30-day warranty', 'Material support'], price: 149, originalPrice: 249, duration: '30-45 min', rating: 4.6, reviewCount: 15678, image: img(6476753), popular: true, tags: ['same-day'] },
  { id: 's4', name: 'Pipe Leak Repair', slug: 'plumber-visit', categoryId: 'c2', categoryName: 'Plumbing', description: 'Trusted plumber for leaks, fittings and fixtures.', longDescription: 'Book a professional plumber for tap repair, pipe leakage, drainage cleaning, geyser installation, bathroom fittings, and more. All work backed by service warranty.', features: ['Leak detection', 'Tap & fitting repair', 'Drain cleaning', 'Geyser install', '45-day warranty'], price: 129, originalPrice: 199, duration: '30-60 min', rating: 4.7, reviewCount: 11234, image: img(8961345), popular: true, tags: ['same-day'] },
  { id: 's5', name: 'Bathroom Cleaning', slug: 'bathroom-deep-cleaning', categoryId: 'c7', categoryName: 'Bathroom Cleaning', description: 'Sparkling clean bathroom with stain and odor removal.', longDescription: 'A detailed bathroom cleaning service that removes hard water stains, sanitizes surfaces, cleans tiles and grout, and leaves your bathroom fresh and hygienic.', features: ['Hard water stain removal', 'Tile & grout cleaning', 'Sanitization', 'Fixture polishing', 'Deodorizing'], price: 399, originalPrice: 599, duration: '60-90 min', rating: 4.8, reviewCount: 6754, image: img(6585757), popular: false, tags: [] },
  { id: 's6', name: 'Kitchen Deep Cleaning', slug: 'kitchen-deep-cleaning', categoryId: 'c8', categoryName: 'Kitchen Cleaning', description: 'Degrease and sanitize your kitchen thoroughly.', longDescription: 'Comprehensive kitchen cleaning including chimney degreasing, tile scrubbing, countertop sanitization, cabinet exterior cleaning, and floor mopping. Food-safe cleaning agents used.', features: ['Chimney degreasing', 'Tile scrubbing', 'Countertop sanitize', 'Cabinet cleaning', 'Food-safe agents'], price: 599, originalPrice: 899, duration: '90-120 min', rating: 4.7, reviewCount: 5421, image: img(2724749), popular: false, tags: [] },
  { id: 's7', name: 'Washing Machine Repair', slug: 'washing-machine-repair', categoryId: 'c15', categoryName: 'Washing Machine', description: 'Expert repair for front and top load machines.', longDescription: 'Diagnose and repair all washing machine issues — drainage problems, spin cycle faults, noise issues, motor problems, and more. All brands serviced with genuine parts.', features: ['All brands serviced', 'Genuine parts', 'Drainage repair', 'Motor fix', '90-day part warranty'], price: 299, originalPrice: 499, duration: '45-90 min', rating: 4.6, reviewCount: 4523, image: img(4109738), popular: false, tags: [] },
  { id: 's8', name: 'Refrigerator Repair', slug: 'refrigerator-repair', categoryId: 'c16', categoryName: 'Refrigerator', description: 'Cooling issues, compressor, and gas refill.', longDescription: 'Professional refrigerator repair for cooling problems, compressor issues, gas refill, thermostat replacement, and more. Single and double door, all brands.', features: ['Cooling fix', 'Compressor check', 'Gas refill', 'Thermostat replace', '90-day warranty'], price: 349, originalPrice: 549, duration: '45-90 min', rating: 4.5, reviewCount: 3876, image: img(4099305), popular: false, tags: [] },
  { id: 's9', name: 'Sofa & Carpet Cleaning', slug: 'sofa-carpet-cleaning', categoryId: 'c9', categoryName: 'Sofa Cleaning', description: 'Deep clean sofa and carpets with stain removal.', longDescription: 'Professional sofa and carpet shampoo cleaning that removes stains, dust mites, and odors. Suitable for fabric, leather, and synthetic materials.', features: ['Stain removal', 'Shampoo cleaning', 'Dust mite removal', 'Odor neutralization', 'Fabric safe'], price: 449, originalPrice: 699, duration: '60-90 min', rating: 4.7, reviewCount: 3210, image: img(1571460), popular: false, tags: [] },
  { id: 's10', name: 'Pipe Leak Repair Treatment', slug: 'pest-control-treatment', categoryId: 'c10', categoryName: 'Pipe Leak Repair', description: 'Cockroach, termite, and general pest treatment.', longDescription: 'Effective pest control treatment for cockroaches, termites, ants, and rodents. Odorless, herbal-based chemicals safe for kids and pets. Includes 3-month warranty.', features: ['Cockroach treatment', 'Termite control', 'Odorless chemicals', 'Pet & kid safe', '3-month warranty'], price: 799, originalPrice: 1199, duration: '60-120 min', rating: 4.6, reviewCount: 2890, image: img(2662179), popular: false, tags: [] },
  { id: 's11', name: 'Interior Wall Painting', slug: 'interior-wall-painting', categoryId: 'c11', categoryName: 'Painting', description: 'Premium interior painting with putty and primer.', longDescription: 'Transform your walls with premium interior painting. Includes putty work, primer coat, and two finish coats. Choose from 1000+ shades. Paint cost included.', features: ['Putty & primer', '2 finish coats', '1000+ shades', 'Paint included', '1-year warranty'], price: 12, originalPrice: 18, duration: '2-3 days', rating: 4.8, reviewCount: 1876, image: img(1669754), popular: false, tags: [] },
  { id: 's12', name: 'Laptop Repair & Service', slug: 'laptop-repair-service', categoryId: 'c20', categoryName: 'Laptop Repair', description: 'Hardware, software, and OS issues fixed.', longDescription: 'Expert laptop repair for screen replacement, keyboard issues, slow performance, OS installation, virus removal, and hardware upgrades. All brands serviced.', features: ['Screen replacement', 'OS install', 'Virus removal', 'Hardware upgrade', 'Data backup'], price: 399, originalPrice: 599, duration: '45-120 min', rating: 4.6, reviewCount: 5432, image: img(459653), popular: false, tags: [] },
];

export const professionals: Professional[] = [
  { id: 'p1', name: 'Rajesh Kumar', avatar: avatar('Rajesh'), trade: 'Catering Manager', rating: 4.9, reviewCount: 2843, jobsCompleted: 3210, experienceYears: 8, city: 'Mumbai', verified: true, bio: 'Event catering specialist for weddings, birthdays, and corporate gatherings.', skills: ['Wedding Catering', 'Event Catering', 'Live Counters'] },
  { id: 'p2', name: 'Priya Sharma', avatar: avatar('Priya'), trade: 'Meal Plan Expert', rating: 4.8, reviewCount: 1923, jobsCompleted: 2150, experienceYears: 5, city: 'Delhi', verified: true, bio: 'Healthy meal and tiffin specialist focused on fresh daily food.', skills: ['Daily Meals', 'Tiffin Service', 'Healthy Plans'] },
  { id: 'p3', name: 'Amit Patel', avatar: avatar('Amit'), trade: 'Electrical & Plumbing Pro', rating: 4.7, reviewCount: 3120, jobsCompleted: 3500, experienceYears: 10, city: 'Bengaluru', verified: true, bio: 'Licensed technician handling plumbing and electrical work with safety first.', skills: ['Electrical Inspection', 'Wiring Repair', 'Pipe Leak Repair'] },
  { id: 'p4', name: 'Sunita Reddy', avatar: avatar('Sunita'), trade: 'Deep Cleaning Expert', rating: 4.9, reviewCount: 1567, jobsCompleted: 1890, experienceYears: 6, city: 'Hyderabad', verified: true, bio: 'Detail-oriented cleaner specializing in full home, kitchen, sofa, and office cleaning.', skills: ['Full Home Cleaning', 'Sofa Cleaning', 'Office Cleaning'] },
];

export const reviews: Review[] = [
  { id: 'r1', serviceId: 's1', author: 'Vikram Singh', avatar: avatar('Vikram'), rating: 5, date: '2024-12-10', comment: 'Wedding catering was well organized, tasty, and served on time. Guests loved the live counters.', serviceTitle: 'Wedding Catering' },
  { id: 'r2', serviceId: 's5', author: 'Neha Gupta', avatar: avatar('Neha'), rating: 5, date: '2024-12-08', comment: 'Daily meals are fresh and neatly packed. Perfect for office lunch.', serviceTitle: 'Daily Meals' },
  { id: 'r3', serviceId: 's10', author: 'Arjun Mehta', avatar: avatar('Arjun'), rating: 4, date: '2024-12-05', comment: 'Airport pickup was smooth and the driver helped with luggage.', serviceTitle: 'Airport Pickup' },
  { id: 'r4', serviceId: 's27', author: 'Kavya Iyer', avatar: avatar('Kavya'), rating: 5, date: '2024-12-12', comment: 'The full home cleaning team was thorough and professional. My home looks brand new.', serviceTitle: 'Full Home Cleaning' },
  { id: 'r5', serviceId: 's18', author: 'Rohit Das', avatar: avatar('Rohit'), rating: 5, date: '2024-12-09', comment: 'Pipe leak was fixed quickly with clear pricing and clean work.', serviceTitle: 'Pipe Leak Repair' },
  { id: 'r6', serviceId: 's22', author: 'Meera Joshi', avatar: avatar('Meera'), rating: 5, date: '2024-12-11', comment: 'Electrical inspection was detailed and the technician explained every safety point.', serviceTitle: 'Electrical Inspection' },
];

export const testimonials: Testimonial[] = [
  { id: 't1', author: 'Ananya Krishnan', avatar: avatar('Ananya'), location: 'Mumbai', rating: 5, text: 'HomeSeva handled our birthday catering beautifully. The food and setup were both excellent.', service: 'Birthday Catering' },
  { id: 't2', author: 'Siddharth Rao', avatar: avatar('Siddharth'), location: 'Bengaluru', rating: 5, text: 'I booked a deep cleaning service and was amazed by the attention to detail. The team was professional and courteous.', service: 'Full Home Cleaning' },
  { id: 't3', author: 'Pooja Nair', avatar: avatar('Pooja'), location: 'Delhi', rating: 5, text: 'Transparent pricing, verified professionals, and live tracking. HomeSeva truly delivers on its promise.', service: 'Taxi' },
  { id: 't4', author: 'Karan Malhotra', avatar: avatar('Karan'), location: 'Pune', rating: 4, text: 'Great platform. The plumbing work was clean, quick, and professionally handled.', service: 'Pipe Leak Repair' },
];

export const userBookings: Booking[] = [
  { id: 'b1', serviceId: 's1', serviceName: 'Wedding Catering', serviceImage: img(587741), professionalName: 'Rajesh Kumar', date: '2026-08-20', timeSlot: '06:00 PM - 11:00 PM', address: '221B, Hill Road, Bandra West, Mumbai', status: 'upcoming', price: 49999, paymentMethod: 'upi', paid: true },
  { id: 'b2', serviceId: 's27', serviceName: 'Full Home Cleaning', serviceImage: img(4239034), professionalName: 'Sunita Reddy', date: '2026-08-15', timeSlot: '09:00 AM - 01:00 PM', address: '221B, Hill Road, Bandra West, Mumbai', status: 'upcoming', price: 2499, paymentMethod: 'card', paid: true },
  { id: 'b3', serviceId: 's22', serviceName: 'Electrical Inspection', serviceImage: img(257736), professionalName: 'Amit Patel', date: '2026-07-28', timeSlot: '02:00 PM - 03:00 PM', address: '221B, Hill Road, Bandra West, Mumbai', status: 'completed', price: 499, paymentMethod: 'upi', paid: true },
  { id: 'b4', serviceId: 's29', serviceName: 'Bathroom Cleaning', serviceImage: img(6585757), professionalName: 'Sunita Reddy', date: '2026-07-15', timeSlot: '11:00 AM - 12:30 PM', address: '221B, Hill Road, Bandra West, Mumbai', status: 'completed', price: 399, paymentMethod: 'upi', paid: true },
  { id: 'b5', serviceId: 's18', serviceName: 'Pipe Leak Repair', serviceImage: img(8961345), professionalName: 'Amit Patel', date: '2026-07-10', timeSlot: '04:00 PM - 05:00 PM', address: '221B, Hill Road, Bandra West, Mumbai', status: 'cancelled', price: 299, paymentMethod: 'card', paid: true },
];

export const savedAddresses: SavedAddress[] = [
  { id: 'a1', label: 'Home', address: '221B, Hill Road, Bandra West', city: 'Mumbai', pincode: '400050', isDefault: true },
  { id: 'a2', label: 'Office', address: '5th Floor, Trade Tower, BKC', city: 'Mumbai', pincode: '400051', isDefault: false },
];

export const notifications: Notification[] = [
  { id: 'n1', type: 'booking', title: 'Booking Confirmed', message: 'Your Wedding Catering is confirmed for Aug 20, 6:00 PM.', time: '2h ago', read: false },
  { id: 'n2', type: 'promo', title: '20% Off Cleaning', message: 'Use code CLEAN20 on your next deep cleaning booking.', time: '1d ago', read: false },
  { id: 'n3', type: 'review', title: 'Rate your experience', message: 'How was your Electrical visit on Dec 28?', time: '3d ago', read: true },
  { id: 'n4', type: 'system', title: 'Welcome to HomeSeva', message: 'Complete your profile for personalized service.', time: '1w ago', read: true },
];

export const walletTransactions: WalletTransaction[] = [
  { id: 'w1', type: 'credit', amount: 500, description: 'Cashback — Wedding Catering', date: '2025-01-10' },
  { id: 'w2', type: 'debit', amount: 2499, description: 'Full Home Cleaning', date: '2025-01-08' },
  { id: 'w3', type: 'credit', amount: 200, description: 'Referral bonus', date: '2024-12-20' },
  { id: 'w4', type: 'debit', amount: 399, description: 'Bathroom Cleaning', date: '2024-12-15' },
];

export const coupons: Coupon[] = [
  { code: 'FIRST50', discount: 50, type: 'percent', maxDiscount: 200, minOrder: 199, description: '50% off on first booking (max ₹200)' },
  { code: 'CLEAN20', discount: 20, type: 'percent', maxDiscount: 500, minOrder: 999, description: '20% off on cleaning services (max ₹500)' },
  { code: 'FLAT100', discount: 100, type: 'flat', maxDiscount: 100, minOrder: 499, description: 'Flat ₹100 off on orders above ₹499' },
];

export const cities = ['Patan, Gujarat'];

export const stats = [
  { label: 'Happy Customers', value: '12M+' },
  { label: 'Verified Professionals', value: '50K+' },
  { label: 'Cities Served', value: '35+' },
  { label: 'Services Completed', value: '45M+' },
];

export const faqs = [
  { q: 'How does HomeSeva verify professionals?', a: 'Every professional undergoes a background check, skill assessment, and in-person training before joining our platform. We verify identity, address, and experience.' },
  { q: 'Can I reschedule or cancel my booking?', a: 'Yes. You can reschedule or cancel free of charge up to 2 hours before your appointment from your dashboard. Same-day changes may incur a nominal fee.' },
  { q: 'What payment methods are accepted?', a: 'We accept UPI, credit/debit cards, net banking, and cash on service. Wallet payments and gift cards are also supported.' },
  { q: 'Is there a service warranty?', a: 'Most services come with a 30-90 day warranty. If the issue recurs within the warranty period, we re-service at no extra cost.' },
  { q: 'How does OTP verification work?', a: 'On arrival, the professional shares a 4-digit OTP that you verify in the app. This confirms the right professional is at your door before service begins.' },
  { q: 'Do you offer same-day service?', a: 'Yes, many services are available same-day. Look for the "Same-day" tag on service cards, or check available slots during booking.' },
];

