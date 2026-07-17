import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Category } from '../types';

export function CategoryCard({ category, index = 0 }: { category: Category; index?: number }) {
  const Icon = (Icons as unknown as Record<string, LucideIcon>)[category.icon] ?? Wrench;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="h-full"
    >
      <Link
        to={`/services?category=${category.slug}`}
        className="flex flex-col items-center justify-center p-3.5 card hover:shadow-soft-lg active-scale h-full text-center"
      >
        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-2.5 shadow-sm text-white shrink-0`}>
          <Icon className="w-5.5 h-5.5" />
        </div>
        <h3 className="font-bold text-[11px] text-gray-800 dark:text-gray-200 line-clamp-1 leading-tight">{category.name}</h3>
        <p className="text-[9px] text-gray-500 mt-0.5">{category.serviceCount} Services</p>
      </Link>
    </motion.div>
  );
}
