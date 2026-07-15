import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock,
  Check,
  ShieldCheck,
  Star,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import { ServiceCard } from '../components/ServiceCard';
import { ReviewCard } from '../components/ReviewCard';
import { Button } from '../components/ui/Button';
import { Rating } from '../components/ui/Rating';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { services, reviews, professionals } from '../data/sampleData';

export function ServiceDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const service = services.find((s) => s.slug === slug);
  const [tab, setTab] = useState<'overview' | 'reviews' | 'similar'>('overview');

  if (!service) {
    return (
      <div className="pt-20">
        <EmptyState
          icon={<Star className="w-8 h-8" />}
          title="Service not found"
          description="The service you're looking for doesn't exist or has been removed."
          action={<Link to="/services"><Button>Browse services</Button></Link>}
        />
      </div>
    );
  }

  const serviceReviews = reviews.filter((r) => r.serviceId === service.id);
  const similar = services.filter((s) => s.categoryId === service.categoryId && s.id !== service.id).slice(0, 4);
  const pro = professionals[0];
  const discount = Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100);

  return (
    <div className="pt-20 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 py-5">
          <Link to="/" className="hover:text-brand-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/services" className="hover:text-brand-600">Services</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to={`/services?category=${service.categoryName.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-brand-600">{service.categoryName}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 dark:text-gray-100 truncate">{service.name}</span>
        </nav>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl overflow-hidden shadow-soft-lg mb-6"
            >
              <img src={service.image} alt={service.name} className="w-full h-72 lg:h-96 object-cover" />
            </motion.div>

            <div className="flex flex-wrap gap-2 mb-4">
              {service.tags.includes('bestseller') && <Badge tone="amber">Bestseller</Badge>}
              {service.tags.includes('same-day') && <Badge tone="green">Same-day available</Badge>}
              <Badge tone="brand"><ShieldCheck className="w-3 h-3" /> 45-day warranty</Badge>
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold font-display">{service.name}</h1>
            <div className="flex items-center gap-3 mt-3">
              <Rating value={service.rating} size="md" />
              <span className="text-sm text-gray-500">{service.reviewCount.toLocaleString()} reviews</span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1 text-sm text-gray-500"><Clock className="w-4 h-4" /> {service.duration}</span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-8 border-b border-gray-200 dark:border-slate-800">
              {(['overview', 'reviews', 'similar'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2.5 text-sm font-semibold capitalize border-b-2 transition ${
                    tab === t
                      ? 'border-brand-600 text-brand-600'
                      : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {t === 'reviews' ? `Reviews (${serviceReviews.length})` : t === 'similar' ? 'Similar Services' : 'Overview'}
                </button>
              ))}
            </div>

            <div className="mt-6">
              {tab === 'overview' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{service.longDescription}</p>
                  <h3 className="font-semibold text-lg mt-8 mb-4">What's included</h3>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {service.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-emerald-600" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {tab === 'reviews' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="card p-6 flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-5xl font-extrabold font-display text-brand-600">{service.rating}</p>
                      <Rating value={service.rating} size="sm" showValue={false} />
                      <p className="text-xs text-gray-500 mt-1">{service.reviewCount.toLocaleString()} reviews</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const pct = star === 5 ? 78 : star === 4 ? 15 : star === 3 ? 5 : star === 2 ? 1 : 1;
                        return (
                          <div key={star} className="flex items-center gap-2 text-xs">
                            <span className="w-3 text-gray-500">{star}</span>
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="w-8 text-gray-400">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {serviceReviews.length > 0 ? (
                    serviceReviews.map((r, i) => <ReviewCard key={r.id} review={r} index={i} />)
                  ) : (
                    <EmptyState icon={<Star className="w-8 h-8" />} title="No reviews yet" description="Be the first to review this service." />
                  )}
                </motion.div>
              )}

              {tab === 'similar' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {similar.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {similar.map((s, i) => <ServiceCard key={s.id} service={s} index={i} />)}
                    </div>
                  ) : (
                    <EmptyState title="No similar services" />
                  )}
                </motion.div>
              )}
            </div>
          </div>

          {/* Right — booking card */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold">₹{service.price}</span>
                {service.originalPrice > service.price && (
                  <>
                    <span className="text-base text-gray-400 line-through">₹{service.originalPrice}</span>
                    <Badge tone="green">{discount}% OFF</Badge>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>

              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-2.5 text-sm">
                  <Clock className="w-4 h-4 text-brand-600" /> {service.duration}
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> 45-day service warranty
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <MapPin className="w-4 h-4 text-brand-600" /> Available in your city
                </div>
              </div>

              <Button fullWidth size="lg" className="mt-6" onClick={() => navigate(`/book/${service.slug}`)}>
                Book Now
              </Button>
              <p className="text-xs text-center text-gray-500 mt-3">Free cancellation up to 2 hours before</p>
            </div>

            {/* Pro card */}
            <div className="card p-5 mt-4">
              <p className="text-sm font-semibold mb-3">Assigned professional</p>
              <div className="flex items-center gap-3">
                <img src={pro.avatar} alt={pro.name} className="w-12 h-12 rounded-xl bg-gray-100" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-sm">{pro.name}</p>
                    <ShieldCheck className="w-4 h-4 text-brand-600" />
                  </div>
                  <p className="text-xs text-gray-500">{pro.trade} • {pro.rating} ★</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
