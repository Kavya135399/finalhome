export type Role = 'customer' | 'professional' | 'admin';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  serviceCount: number;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  description: string;
  longDescription: string;
  features: string[];
  price: number;
  originalPrice: number;
  duration: string;
  rating: number;
  reviewCount: number;
  image: string;
  popular: boolean;
  tags: string[];
}

export interface Professional {
  id: string;
  name: string;
  avatar: string;
  trade: string;
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
  experienceYears: number;
  city: string;
  verified: boolean;
  bio: string;
  skills: string[];
}

export interface Review {
  id: string;
  serviceId: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  serviceTitle: string;
}

export interface Testimonial {
  id: string;
  author: string;
  avatar: string;
  location: string;
  rating: number;
  text: string;
  service: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceImage: string;
  professionalName: string;
  date: string;
  timeSlot: string;
  address: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'in-progress';
  price: number;
  paymentMethod: 'card' | 'upi' | 'cash';
  paid: boolean;
}

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

export interface Notification {
  id: string;
  type: 'booking' | 'promo' | 'system' | 'review';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
}

export interface Coupon {
  code: string;
  discount: number;
  type: 'percent' | 'flat';
  maxDiscount: number;
  minOrder: number;
  description: string;
}
