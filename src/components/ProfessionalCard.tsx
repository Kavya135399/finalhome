import { motion } from 'framer-motion';
import { BadgeCheck, MapPin } from 'lucide-react';
import type { Professional } from '../types';
import { Rating } from './ui/Rating';
import { Badge } from './ui/Badge';

export function ProfessionalCard({ professional, index = 0 }: { professional: Professional; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="card p-5 hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <img src={professional.avatar} alt={professional.name} className="w-16 h-16 rounded-2xl bg-gray-100" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{professional.name}</h3>
            {professional.verified && <BadgeCheck className="w-4 h-4 text-brand-600 shrink-0" />}
          </div>
          <p className="text-sm text-brand-600 dark:text-brand-400 font-medium">{professional.trade}</p>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <MapPin className="w-3 h-3" /> {professional.city} • {professional.experienceYears} yrs exp
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">{professional.bio}</p>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {professional.skills.map((s) => (
          <Badge key={s} tone="gray">{s}</Badge>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
        <Rating value={professional.rating} size="sm" count={professional.reviewCount} />
        <span className="text-xs text-gray-500">{professional.jobsCompleted.toLocaleString()} jobs</span>
      </div>
    </motion.div>
  );
}
