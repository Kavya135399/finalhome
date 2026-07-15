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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
    >
      <Link
        to={`/services?category=${category.slug}`}
        className="group block card p-5 hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300"
      >
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 shadow-soft group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1 group-hover:text-brand-600 transition">{category.name}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{category.description}</p>
        <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mt-2">{category.serviceCount} services</p>
      </Link>
    </motion.div>
  );
}
