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
      className="card p-6 h-full flex flex-col"
    >
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed flex-1">"{testimonial.text}"</p>
      <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-100 dark:border-slate-800">
        <img src={testimonial.avatar} alt={testimonial.author} className="w-10 h-10 rounded-full bg-gray-100" />
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{testimonial.author}</p>
          <p className="text-xs text-gray-500">{testimonial.location} • {testimonial.service}</p>
        </div>
      </div>
    </motion.div>
  );
}
