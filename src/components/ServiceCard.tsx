import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Star, Plus } from 'lucide-react';
import type { Service } from '../types';

export function ServiceCard({ service, index = 0 }: { service: Service; index?: number }) {
  // Support both camelCase (frontend data) and snake_case (API response)
  const price = service.price ?? 0;
  const originalPrice = (service.originalPrice ?? (service as any).original_price) ?? price;
  const reviewCount = (service.reviewCount ?? (service as any).review_count) ?? 0;
  const duration = service.duration ?? '60 min';
  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
    >
      <Link
        to={`/services/${service.slug}`}
        className="group block card p-3 hover:shadow-soft-lg transition-all duration-200 active-scale"
      >
        <div className="flex items-center gap-3">
          {/* Left: Thumbnail Image */}
          <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0">
            <img
              src={service.image || 'https://images.pexels.com/photos/4239034/pexels-photo-4239034.jpeg?auto=compress&cs=tinysrgb&w=400'}
              alt={service.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {discount > 0 && (
              <div className="absolute top-1 left-1 bg-brand-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">
                {discount}% OFF
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-between h-24 py-0.5">
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 truncate">
                  {service.categoryName}
                </span>
                
                {/* Duration */}
                <span className="text-[10px] text-gray-400 flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3 text-gray-450" /> {duration.split(' ')[0]}hr
                </span>
              </div>

              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white truncate mt-0.5 group-hover:text-brand-600 transition">
                {service.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-500">
                <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-1 py-0.5 rounded font-extrabold shrink-0">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  {service.rating}
                </div>
                <span className="truncate">({reviewCount.toLocaleString()} bookings)</span>
              </div>
            </div>

            {/* Price & Book Button */}
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-extrabold text-gray-900 dark:text-white">₹{price}</span>
                {originalPrice > price && (
                  <span className="text-xs text-gray-400 line-through">₹{originalPrice}</span>
                )}
              </div>

              {/* Tap Target Optimized button */}
              <div className="h-8 min-w-[70px] bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 px-3 border border-brand-100/30 group-hover:bg-brand-600 group-hover:text-white transition">
                <span>Book</span>
                <Plus className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
