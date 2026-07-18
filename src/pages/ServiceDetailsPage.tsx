import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Check, ShieldCheck, Star } from 'lucide-react';
import { ServiceCard } from '../components/ServiceCard';
import { ReviewCard } from '../components/ReviewCard';
import { Button } from '../components/ui/Button';
import { Rating } from '../components/ui/Rating';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { services, reviews, professionals } from '../data/sampleData';
import { apiClient } from '../services/apiClient';
import type { Service } from '../types';

export function ServiceDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.getServices()
      .then((data) => {
        setServicesList(data);
        setLoading(false);
      })
      .catch(() => {
        setServicesList(services);
        setLoading(false);
      });
  }, []);

  const service = servicesList.find((s) => s.slug === slug);
  const [tab, setTab] = useState<'overview' | 'reviews' | 'similar'>('overview');

  if (loading) {
    return <div className="flex-1 flex items-center justify-center p-6 text-sm font-bold">Loading details...</div>;
  }

  if (!service) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <EmptyState
          icon={<Star className="w-8 h-8" />}
          title="Service not found"
          description="The service you are looking for does not exist."
          action={<Button onClick={() => navigate('/services')}>Browse services</Button>}
        />
      </div>
    );
  }

  const serviceReviews = reviews.filter((r) => r.serviceId === service.id);
  const similar = services.filter((s) => s.categoryId === service.categoryId && s.id !== service.id).slice(0, 3);
  const pro = professionals[0];


  return (
    <div className="flex flex-col flex-1 bg-gray-50 dark:bg-slate-950 pb-12 select-none">
      <div className="max-w-4xl mx-auto w-full bg-white dark:bg-slate-900 min-h-screen border-x border-gray-150 dark:border-slate-800/60 pb-24 relative flex flex-col">
        {/* Banner Image */}
        <div className="relative h-60 w-full overflow-hidden bg-gray-150 shrink-0">
          <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="text-[10px] bg-brand-600 px-2 py-0.5 rounded font-black uppercase tracking-wider">
              {service.categoryName}
            </span>
            <h1 className="text-xl font-black mt-1 leading-tight">{service.name}</h1>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-white/80">
              <span className="flex items-center gap-1 font-bold text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> {service.rating}
              </span>
              <span>({service.reviewCount} bookings)</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {service.duration}</span>
            </div>
          </div>
        </div>

        {/* Main Container */}
        <div className="p-4 flex-1">
          
          {/* Core Badges */}
          <div className="flex flex-wrap gap-1.5 mb-5 select-none">
            {service.tags.includes('bestseller') && <Badge tone="amber">Bestseller</Badge>}
            {service.tags.includes('same-day') && <Badge tone="green">Same-day available</Badge>}
            <Badge tone="brand"><ShieldCheck className="w-3.5 h-3.5 inline mr-1" /> 45-day warranty</Badge>
          </div>

          {/* Tab Controls */}
          <div className="flex border-b border-gray-200 dark:border-slate-800 mb-4 select-none">
            {(['overview', 'reviews', 'similar'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 text-center py-2.5 text-xs font-black capitalize border-b-2 transition ${
                  tab === t
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                {t === 'reviews' ? `Reviews (${serviceReviews.length})` : t === 'similar' ? 'Similar' : 'Details'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            {tab === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-white mb-2">Description</h3>
                  <p className="text-xs text-gray-650 dark:text-gray-400 leading-relaxed">{service.longDescription}</p>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-white mb-3">What's included</h3>
                  <ul className="space-y-2.5">
                    {service.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-gray-300">
                        <span className="w-4.5 h-4.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                        </span>
                        <span className="flex-1 leading-normal">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Service Pro Info card */}
                <div className="card p-4 flex items-center gap-3 bg-white dark:bg-slate-900">
                  <img src={pro.avatar} alt={pro.name} className="w-11 h-11 rounded-xl bg-gray-100" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Assigned Professional</p>
                    <p className="font-extrabold text-xs text-gray-900 dark:text-white flex items-center gap-1 mt-0.5">
                      {pro.name} <ShieldCheck className="w-3.5 h-3.5 text-brand-650" />
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{pro.trade} • {pro.rating} ★</p>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === 'reviews' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="card p-4 flex items-center gap-6 bg-white dark:bg-slate-900">
                  <div className="text-center select-none shrink-0">
                    <p className="text-4xl font-black text-brand-600 dark:text-brand-400">{service.rating}</p>
                    <div className="flex justify-center mt-1"><Rating value={service.rating} size="sm" showValue={false} /></div>
                    <p className="text-[9px] text-gray-400 mt-1">{service.reviewCount.toLocaleString()} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1 select-none">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const pct = star === 5 ? 78 : star === 4 ? 15 : star === 3 ? 5 : star === 2 ? 1 : 1;
                      return (
                        <div key={star} className="flex items-center gap-2 text-[10px] text-gray-500">
                          <span className="w-2.5 text-right">{star}</span>
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-6 text-right text-gray-400">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="space-y-3">
                  {serviceReviews.length > 0 ? (
                    serviceReviews.map((r, i) => <ReviewCard key={r.id} review={r} index={i} />)
                  ) : (
                    <EmptyState icon={<Star className="w-8 h-8" />} title="No reviews yet" />
                  )}
                </div>
              </motion.div>
            )}

            {tab === 'similar' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {similar.length > 0 ? (
                  similar.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)
                ) : (
                  <EmptyState title="No similar services" />
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Sticky Bottom Actions Bar */}
        <div className="absolute bottom-0 inset-x-0 h-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-gray-150 dark:border-slate-800/60 px-4 py-3 z-40 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wide">Total Price</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-gray-900 dark:text-white">₹{service.price}</span>
              {service.originalPrice > service.price && (
                <span className="text-xs text-gray-400 line-through">₹{service.originalPrice}</span>
              )}
            </div>
            <span className="text-[8px] text-gray-400 mt-0.5">Free Cancellation</span>
          </div>
          
          <Button size="lg" onClick={() => navigate(`/book/${service.slug}`)} className="h-12 px-6 rounded-xl font-extrabold active-scale shadow-glow">
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}
