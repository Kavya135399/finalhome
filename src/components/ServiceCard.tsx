import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import type { Service } from '../types';
import { Rating } from './ui/Rating';
import { Badge } from './ui/Badge';

export function ServiceCard({ service, index = 0 }: { service: Service; index?: number }) {
  const discount = Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link to={`/services/${service.slug}`} className="group block card overflow-hidden hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 h-full">
        <div className="relative h-44 overflow-hidden">
          <img
            src={service.image}
            alt={service.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 flex gap-1.5">
            {service.tags.includes('bestseller') && <Badge tone="amber">Bestseller</Badge>}
            {service.tags.includes('same-day') && <Badge tone="green">Same-day</Badge>}
          </div>
          {discount > 0 && (
            <div className="absolute top-3 right-3 bg-brand-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-soft">
              {discount}% OFF
            </div>
          )}
        </div>
        <div className="p-4">
          <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mb-1">{service.categoryName}</p>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5 line-clamp-1 group-hover:text-brand-600 transition">{service.name}</h3>
          <div className="flex items-center gap-2 mb-3">
            <Rating value={service.rating} size="sm" showValue={false} />
            <span className="text-xs text-gray-500">{service.rating} • {service.reviewCount.toLocaleString()} reviews</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <Clock className="w-3.5 h-3.5" /> {service.duration}
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-gray-900 dark:text-white">₹{service.price}</span>
                {service.originalPrice > service.price && (
                  <span className="text-xs text-gray-400 line-through">₹{service.originalPrice}</span>
                )}
              </div>
            </div>
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1 group-hover:gap-2 transition-all">
              Book <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
