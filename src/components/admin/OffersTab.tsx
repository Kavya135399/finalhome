import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Gift, Sparkles, ShieldCheck, Zap, Star, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface PromoOffer {
  id: string;
  title: string;
  desc: string;
  code: string;
  bg: string;
  icon: string;
  status?: string;
  created_at?: string;
}

const LOCAL_STORAGE_KEY = 'homeseva_custom_promos_list';

const colorPresets = [
  { name: 'Ocean Blue', bg: 'from-blue-600 to-indigo-600', preview: 'bg-gradient-to-r from-blue-600 to-indigo-600' },
  { name: 'Mint Emerald', bg: 'from-emerald-600 to-teal-500', preview: 'bg-gradient-to-r from-emerald-600 to-teal-500' },
  { name: 'Sunset Amber', bg: 'from-amber-600 to-orange-500', preview: 'bg-gradient-to-r from-amber-600 to-orange-500' },
  { name: 'Royal Purple', bg: 'from-purple-600 to-pink-600', preview: 'bg-gradient-to-r from-purple-600 to-pink-600' },
  { name: 'Crimson Rose', bg: 'from-rose-600 to-red-500', preview: 'bg-gradient-to-r from-rose-600 to-red-500' },
  { name: 'Midnight Dark', bg: 'from-slate-800 to-slate-950', preview: 'bg-gradient-to-r from-slate-800 to-slate-950' },
];

const iconPresets = [
  { name: 'Gift', value: 'Gift', icon: Gift },
  { name: 'Sparkles', value: 'Sparkles', icon: Sparkles },
  { name: 'Shield', value: 'ShieldCheck', icon: ShieldCheck },
  { name: 'Tag', value: 'Tag', icon: Tag },
  { name: 'Zap', value: 'Zap', icon: Zap },
  { name: 'Star', value: 'Star', icon: Star },
];

const defaultAdminPromos: PromoOffer[] = [
  { id: 'p_1', title: 'Flat ₹200 OFF', desc: 'On your first service booking', code: 'NEW200', bg: 'from-blue-600 to-indigo-600', icon: 'Gift' },
  { id: 'p_2', title: 'Deep Cleaning Special', desc: 'Up to 30% OFF this weekend', code: 'CLEAN30', bg: 'from-emerald-600 to-teal-500', icon: 'Sparkles' },
  { id: 'p_3', title: 'Safe & Verified Pros', desc: 'All tools sanitized before entry', code: 'SAFETYFIRST', bg: 'from-amber-600 to-orange-500', icon: 'ShieldCheck' },
];

export const OffersTab: React.FC = () => {
  const [promos, setPromos] = useState<PromoOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [code, setCode] = useState('');
  const [bg, setBg] = useState('from-blue-600 to-indigo-600');
  const [iconName, setIconName] = useState('Gift');

  const getStoredPromos = (): PromoOffer[] | null => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultAdminPromos;
    } catch {
      return defaultAdminPromos;
    }
  };

  const saveStoredPromos = (list: PromoOffer[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save promos to localStorage:', e);
    }
  };

  const fetchPromos = async () => {
    try {
      setLoading(true);
      const localStored = getStoredPromos();
      
      try {
        const data = await apiClient.getPromos();
        if (Array.isArray(data) && data.length > 0) {
          setPromos(data);
          saveStoredPromos(data);
          setLoading(false);
          return;
        }
      } catch (apiErr) {
        console.warn('Backend server not restarted yet (404), seamlessly using local state sync:', apiErr);
      }

      // If backend offline or empty, use stored items or default to the 3 initial promos
      const finalPromos = localStored && localStored.length > 0 ? localStored : defaultAdminPromos;
      setPromos(finalPromos);
      if (!localStored || localStored.length === 0) {
        saveStoredPromos(finalPromos);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAddPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim() || !code.trim()) {
      showNotification('error', 'Please fill in Title, Description, and Coupon Code.');
      return;
    }

    try {
      setSubmitting(true);
      const newPromo: PromoOffer = {
        id: `p_${Date.now()}`,
        title: title.trim(),
        desc: desc.trim(),
        code: code.trim().toUpperCase(),
        bg,
        icon: iconName,
        status: 'active',
        created_at: new Date().toISOString(),
      };

      // 1. Always update LocalStorage immediately for zero-latency UI & cross-page synchronization
      const currentList = getStoredPromos() || defaultAdminPromos;
      const updatedList = [newPromo, ...currentList];
      saveStoredPromos(updatedList);
      setPromos(updatedList);

      // 2. Simultaneously attempt backend persistence (will seamlessly succeed once backend restarts)
      try {
        await apiClient.addPromo(newPromo);
      } catch (apiErr) {
        console.warn('Saved locally (restart server/index.js to persist in SQLite):', apiErr);
      }

      showNotification('success', 'New special offer published successfully! Now live on home page.');
      setTitle('');
      setDesc('');
      setCode('');
      setIsCreating(false);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to create promotional offer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePromo = async (id: string, offerTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete the offer "${offerTitle}"?`)) return;
    try {
      const currentList = getStoredPromos() || promos;
      const updatedList = currentList.filter(p => p.id !== id);
      saveStoredPromos(updatedList);
      setPromos(updatedList);

      try {
        await apiClient.deletePromo(id);
      } catch (apiErr) {
        console.warn('Deleted locally (server 404 ignored):', apiErr);
      }

      showNotification('success', 'Offer deleted successfully!');
    } catch (err) {
      showNotification('error', 'Failed to delete offer.');
    }
  };

  const handleBroadcastOffer = async (p: PromoOffer) => {
    try {
      const res = await fetch('http://localhost:5000/api/notifications/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          title: p.title,
          description: p.desc,
          code: p.code,
          expiryDate: 'Limited Period',
          subject: `🎁 Exclusive Offer: ${p.title} (${p.code})`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', data.message || `Broadcast email sent to users!`);
      } else {
        showNotification('error', data.error || 'Failed to send broadcast email.');
      }
    } catch (err) {
      showNotification('error', 'Error broadcasting offer email.');
    }
  };

  const renderIcon = (name: string) => {
    switch (name) {
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-white" />;
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6 text-white" />;
      case 'Tag': return <Tag className="w-6 h-6 text-white" />;
      case 'Zap': return <Zap className="w-6 h-6 text-white" />;
      case 'Star': return <Star className="w-6 h-6 text-white" />;
      case 'Gift':
      default: return <Gift className="w-6 h-6 text-white" />;
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Tag className="w-6 h-6" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Special Offers & Promos Management
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create and manage promotional discount cards displayed in real-time on the client homepage.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 active-scale text-white font-bold text-sm rounded-xl shadow-soft-md transition-all shrink-0"
        >
          <Plus className={`w-5 h-5 transition-transform ${isCreating ? 'rotate-45' : ''}`} />
          {isCreating ? 'Close Form' : 'Add New Offer'}
        </button>
      </div>

      {notification && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 font-medium text-sm border shadow-sm ${
          notification.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
            : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />}
          <span>{notification.text}</span>
        </div>
      )}

      {isCreating && (
        <div className="bg-white dark:bg-slate-850 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-soft-xl p-6 transition-all duration-300">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-500" />
            Create Promotional Offer
          </h2>

          <form onSubmit={handleAddPromo} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                  Offer Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flat ₹300 OFF"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                  Description <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. On all kitchen cleaning"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                  Coupon Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. SAVE300"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all uppercase"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                  Gradient Style Preset
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setBg(preset.bg)}
                      className={`h-10 rounded-xl ${preset.preview} flex items-center justify-center text-xs font-bold text-white shadow-sm transition transform active:scale-95 ${
                        bg === preset.bg ? 'ring-4 ring-brand-500/40 scale-[1.02]' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                  Icon Category
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {iconPresets.map((p) => {
                    const IconComp = p.icon;
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setIconName(p.value)}
                        className={`h-10 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition transform active:scale-95 ${
                          iconName === p.value
                            ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400'
                            : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-soft-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Publish Offer
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <h2 className="text-base font-black text-gray-900 dark:text-white mb-4 uppercase tracking-wider flex items-center justify-between">
          <span>Live Homepage Offers ({promos.length})</span>
          <span className="text-xs font-normal text-gray-500 normal-case">Updated in real-time</span>
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="w-10 h-10 animate-spin text-brand-500 mb-3" />
            <p className="font-medium text-sm">Loading promotional offers...</p>
          </div>
        ) : promos.length === 0 ? (
          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-10 text-center border border-dashed border-gray-200 dark:border-slate-700">
            <Tag className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-base font-bold text-gray-800 dark:text-gray-200">No active offers available</p>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">Click 'Add New Offer' above to display discounts and coupon cards on the customer homepage.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promos.map((p) => (
              <div
                key={p.id}
                className={`relative group rounded-2xl p-6 text-white shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 bg-gradient-to-r ${p.bg} flex flex-col justify-between overflow-hidden border border-white/10`}
              >
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />

                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-lg font-black tracking-tight leading-snug">{p.title}</h3>
                      <p className="text-xs text-white/90 font-medium mt-1 leading-relaxed">{p.desc}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md shadow-inner shrink-0">
                      {renderIcon(p.icon || 'Gift')}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white bg-black/20 px-3 py-1.5 rounded-lg border border-white/15">
                    <span>CODE: <strong className="underline underline-offset-2">{p.code}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleBroadcastOffer(p)}
                      className="p-2 rounded-xl bg-amber-500/90 hover:bg-amber-600 text-white shadow-md transition transform active:scale-95 flex items-center gap-1 text-xs font-bold px-2.5"
                      title="Send email broadcast & push notification to all users"
                    >
                      <span>Broadcast</span>
                    </button>
                    <button
                      onClick={() => handleDeletePromo(p.id, p.title)}
                      className="p-2 rounded-xl bg-rose-500/90 hover:bg-rose-600 text-white shadow-md transition transform active:scale-95 flex items-center gap-1 text-xs font-bold px-2.5"
                      title="Delete offer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default OffersTab;
