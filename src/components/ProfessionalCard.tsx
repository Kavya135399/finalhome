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
      className="card p-4 hover:shadow-soft-lg hover:-translate-y-1.5 transition-all duration-300 h-full flex flex-col justify-between border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-soft"
    >
      <div>
        <div className="flex items-start gap-3">
          <img src={professional.avatar} alt={professional.name} className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-brand-50 dark:bg-slate-800 object-cover shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white truncate">{professional.name}</h3>
              {professional.verified && <BadgeCheck className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />}
            </div>
            <p className="text-xs sm:text-sm text-brand-600 dark:text-brand-400 font-bold mt-0.5">{professional.trade}</p>
            <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
              <MapPin className="w-3 h-3 text-gray-400 shrink-0" /> <span className="truncate">{professional.city} • {professional.experienceYears} yrs exp</span>
            </div>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-3.5 line-clamp-2 leading-relaxed">{professional.bio}</p>
        <div className="flex flex-wrap gap-1 mt-3">
          {professional.skills.map((s) => (
            <Badge key={s} tone="gray">{s}</Badge>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-gray-100 dark:border-slate-800">
        <Rating value={professional.rating} size="sm" count={professional.reviewCount} />
        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{professional.jobsCompleted.toLocaleString()} jobs</span>
      </div>
    </motion.div>
  );
}
