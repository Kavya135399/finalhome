import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, Search, Star } from 'lucide-react';
import { ServiceCard } from '../components/ServiceCard';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ListSkeleton } from '../components/ui/Loader';
import { BottomSheet } from '../components/ui/BottomSheet';
import { categories, services } from '../data/sampleData';
import { apiClient } from '../services/apiClient';
import type { Service } from '../types';

const sortOptions = [
  { value: 'popular', label: 'Popularity' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const priceRanges = [
  { label: 'Under ₹200', min: 0, max: 200 },
  { label: '₹200 - ₹500', min: 200, max: 500 },
  { label: '₹500 - ₹1500', min: 500, max: 1500 },
  { label: '₹1500+', min: 1500, max: Infinity },
];

const PAGE_SIZE = 8;

export function ServicesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [showFiltersSheet, setShowFiltersSheet] = useState(false);
  const [page, setPage] = useState(1);
  const [servicesList, setServicesList] = useState<Service[]>([]);

  useEffect(() => {
    apiClient.getServices()
      .then((data) => setServicesList(data))
      .catch(() => setServicesList(services));
  }, []);

  const query = searchParams.get('q') ?? '';
  const categorySlug = searchParams.get('category') ?? '';
  const [sort, setSort] = useState('popular');
  const [priceRange, setPriceRange] = useState<number | null>(null);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, [query, categorySlug, sort, priceRange, minRating]);

  useEffect(() => setPage(1), [query, categorySlug, sort, priceRange, minRating]);

  const filtered = useMemo(() => {
    let result = [...servicesList];
    if (query) {
      const q = query.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q) || s.categoryName.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    }
    if (categorySlug) {
      const cat = categories.find((c) => c.slug === categorySlug);
      if (cat) result = result.filter((s) => s.categoryId === cat.id);
    }
    if (priceRange !== null) {
      const range = priceRanges[priceRange];
      result = result.filter((s) => s.price >= range.min && s.price < range.max);
    }
    if (minRating > 0) result = result.filter((s) => s.rating >= minRating);

    switch (sort) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      default: result.sort((a, b) => Number(b.popular) - Number(a.popular));
    }
    return result;
  }, [query, categorySlug, sort, priceRange, minRating, servicesList]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(0, page * PAGE_SIZE);

  const setCategory = (slug: string) => {
    if (slug === 'taxi') {
      navigate('/taxi');
      return;
    }
    const next = new URLSearchParams(searchParams);
    if (slug) next.set('category', slug); else next.delete('category');
    setSearchParams(next);
  };

  const handleSearchChange = (val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set('q', val); else next.delete('q');
    setSearchParams(next);
  };

  const clearAll = () => {
    setPriceRange(null);
    setMinRating(0);
    setSort('popular');
    setSearchParams({});
    setShowFiltersSheet(false);
  };

  const activeFilters = (priceRange !== null ? 1 : 0) + (minRating > 0 ? 1 : 0);

  return (
    <div className="flex flex-col flex-1 bg-gray-50 dark:bg-slate-950 select-none">
      <div className="max-w-7xl mx-auto w-full px-4 py-4 flex flex-col flex-1">
        {/* Header Search & Filter Bar */}
        <div className="flex flex-col gap-3.5 mb-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
            <input
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search services..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-155 dark:border-slate-800 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-gray-900 dark:text-white"
            />
          </div>

          {/* Categories Horizontal Scrolling Pills Row */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
            <button
              onClick={() => setCategory('')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                !categorySlug
                  ? 'bg-brand-600 text-white border-brand-600 shadow-soft'
                  : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 border-gray-155 dark:border-slate-800'
              }`}
            >
              All Services
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                  categorySlug === c.slug
                    ? 'bg-brand-600 text-white border-brand-600 shadow-soft'
                    : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 border-gray-155 dark:border-slate-800'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Control Actions Row (Filter Pill, Sorting Dropdown) */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFiltersSheet(true)}
            className={`h-9 px-4 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 active-scale ${
              activeFilters > 0
                ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border-brand-200'
                : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border-gray-155 dark:border-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters {activeFilters > 0 && `(${activeFilters})`}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-9 px-3.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-gray-155 dark:border-slate-800 text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Services Results List */}
        <div className="flex-1">
          {loading ? (
            <ListSkeleton count={4} />
          ) : paged.length === 0 ? (
            <EmptyState
              icon={<Search className="w-8 h-8" />}
              title="No services found"
              description="Try adjusting your filters or search query."
              action={<Button onClick={clearAll}>Clear filters</Button>}
            />
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paged.map((s, i) => (
                  <ServiceCard key={s.id} service={s} index={i} />
                ))}
              </div>

              {page < totalPages && (
                <div className="flex justify-center mt-6">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} className="w-full h-11 rounded-xl">
                    Load more services
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <BottomSheet
        open={showFiltersSheet}
        onClose={() => setShowFiltersSheet(false)}
        title="Filter Services"
      >
        <div className="space-y-6">
          
          {/* Price Range selection */}
          <div>
            <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-3">Price Range</h4>
            <div className="grid grid-cols-2 gap-2">
              {priceRanges.map((r, i) => (
                <button
                  key={i}
                  onClick={() => setPriceRange(priceRange === i ? null : i)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-center transition active-scale ${
                    priceRange === i
                      ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                      : 'border-gray-150 dark:border-slate-800 bg-gray-50 dark:bg-slate-850 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating filter */}
          <div>
            <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-3">Minimum Rating</h4>
            <div className="flex flex-col gap-2">
              {[0, 4, 4.5, 4.8].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={`flex items-center gap-2.5 w-full text-left py-3 px-4 rounded-xl border text-xs font-bold transition active-scale ${
                    minRating === r
                      ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                      : 'border-gray-150 dark:border-slate-800 bg-gray-50 dark:bg-slate-850 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    minRating === r ? 'border-brand-600' : 'border-gray-300'
                  }`}>
                    {minRating === r && <div className="w-2 h-2 rounded-full bg-brand-600" />}
                  </div>
                  {r === 0 ? 'Any rating' : <><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {r}+ & up</>}
                </button>
              ))}
            </div>
          </div>

          {/* Sheet Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-850">
            {activeFilters > 0 && (
              <Button variant="outline" onClick={clearAll} className="flex-1 h-12 rounded-xl">
                Reset
              </Button>
            )}
            <Button onClick={() => setShowFiltersSheet(false)} className="flex-1 h-12 rounded-xl">
              Apply Filters
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
