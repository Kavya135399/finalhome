import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, X, Star } from 'lucide-react';
import { ServiceCard } from '../components/ServiceCard';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { GridSkeleton } from '../components/ui/Loader';
import { categories, services } from '../data/sampleData';

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

const PAGE_SIZE = 6;

export function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const query = searchParams.get('q') ?? '';
  const categorySlug = searchParams.get('category') ?? '';
  const [sort, setSort] = useState('popular');
  const [priceRange, setPriceRange] = useState<number | null>(null);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [query, categorySlug, sort, priceRange, minRating]);

  useEffect(() => setPage(1), [query, categorySlug, sort, priceRange, minRating]);

  const filtered = useMemo(() => {
    let result = [...services];
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
  }, [query, categorySlug, sort, priceRange, minRating]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(0, page * PAGE_SIZE);

  const setCategory = (slug: string) => {
    const next = new URLSearchParams(searchParams);
    if (slug) next.set('category', slug); else next.delete('category');
    setSearchParams(next);
  };

  const setQuery = (val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set('q', val); else next.delete('q');
    setSearchParams(next);
  };

  const clearAll = () => {
    setPriceRange(null);
    setMinRating(0);
    setSort('popular');
    setSearchParams({});
  };

  const activeFilters = (priceRange !== null ? 1 : 0) + (minRating > 0 ? 1 : 0) + (categorySlug ? 1 : 0);

  return (
    <div className="pt-20 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-b from-brand-50/60 to-transparent dark:from-brand-950/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl lg:text-4xl font-extrabold font-display">All Services</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Browse {services.length}+ trusted home services across {categories.length} categories.</p>

          {/* Search bar */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search services…"
                className="input-base pl-10"
              />
            </div>
            <Button variant="outline" leftIcon={<SlidersHorizontal className="w-4 h-4" />} onClick={() => setShowFilters((v) => !v)} className="sm:hidden">
              Filters {activeFilters > 0 && `(${activeFilters})`}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          {/* Sidebar filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="card p-5 sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filters</h3>
                {activeFilters > 0 && (
                  <button onClick={clearAll} className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear all
                  </button>
                )}
              </div>

              {/* Category */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Category</h4>
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  <button
                    onClick={() => setCategory('')}
                    className={`block w-full text-left text-sm px-3 py-1.5 rounded-lg transition ${!categorySlug ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-medium' : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300'}`}
                  >
                    All categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCategory(c.slug)}
                      className={`block w-full text-left text-sm px-3 py-1.5 rounded-lg transition ${categorySlug === c.slug ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-medium' : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Price Range</h4>
                <div className="space-y-1.5">
                  {priceRanges.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => setPriceRange(priceRange === i ? null : i)}
                      className={`block w-full text-left text-sm px-3 py-1.5 rounded-lg transition ${priceRange === i ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-medium' : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300'}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Minimum Rating</h4>
                <div className="space-y-1.5">
                  {[0, 4, 4.5, 4.8].map((r) => (
                    <button
                      key={r}
                      onClick={() => setMinRating(r)}
                      className={`flex items-center gap-2 w-full text-left text-sm px-3 py-1.5 rounded-lg transition ${minRating === r ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-medium' : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300'}`}
                    >
                      {r === 0 ? 'Any rating' : <><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {r}+ & up</>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500">
                {loading ? 'Loading…' : `${filtered.length} service${filtered.length !== 1 ? 's' : ''} found`}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 hidden sm:inline">Sort by</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="input-base !w-auto py-2 text-sm font-medium cursor-pointer"
                >
                  {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {loading ? (
              <GridSkeleton count={6} />
            ) : paged.length === 0 ? (
              <EmptyState
                icon={<Search className="w-8 h-8" />}
                title="No services found"
                description="Try adjusting your filters or search query to find what you need."
                action={<Button onClick={clearAll}>Clear filters</Button>}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {paged.map((s, i) => (
                    <ServiceCard key={s.id} service={s} index={i} />
                  ))}
                </div>

                {page < totalPages && (
                  <div className="flex justify-center mt-10">
                    <Button variant="outline" size="lg" onClick={() => setPage((p) => p + 1)}>
                      Load more services
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
