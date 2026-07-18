import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import type { Testimonial } from '../types';

export function TestimonialCard({ testimonial, index = 0 }: { testimonial: Testimonial; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="card p-6 h-full flex flex-col justify-between border border-gray-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:shadow-soft-lg hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group shadow-soft"
    >
      <span className="absolute -top-4 -right-2 text-7xl font-serif text-brand-100 dark:text-slate-800/30 select-none pointer-events-none opacity-50 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12">
        ”
      </span>
      <div>
        <div className="flex gap-0.5 mb-3.5">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium italic relative z-10">
          "{testimonial.text}"
        </p>
      </div>
      <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-slate-800">
        <img src={testimonial.avatar} alt={testimonial.author} className="w-10 h-10 rounded-full bg-brand-50 dark:bg-slate-800 border border-brand-100/20 shadow-sm" />
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-gray-900 dark:text-white truncate">{testimonial.author}</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
            {testimonial.location} • <span className="text-brand-600 dark:text-brand-400 font-semibold">{testimonial.service}</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
