import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import type { Review } from '../types';

export function ReviewCard({ review, index = 0 }: { review: Review; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="card p-5"
    >
      <div className="flex items-start gap-3">
        <img src={review.avatar} alt={review.author} className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{review.author}</p>
            <span className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          <div className="flex gap-0.5 my-1.5">
            {Array.from({ length: review.rating }).map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{review.comment}</p>
        </div>
      </div>
    </motion.div>
  );
}
