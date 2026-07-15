import { Star } from 'lucide-react';

interface RatingProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  count?: number;
}

const sizeMap = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' };

export function Rating({ value, size = 'md', showValue = true, count }: RatingProps) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`${sizeMap[size]} ${n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-slate-600'}`}
          />
        ))}
      </div>
      {showValue && <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{value.toFixed(1)}</span>}
      {count !== undefined && <span className="text-xs text-gray-400">({count.toLocaleString()})</span>}
    </div>
  );
}
