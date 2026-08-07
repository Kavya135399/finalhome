import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, Mail, Phone, MapPin, Share2, Globe } from 'lucide-react';
import { categories } from '../data/sampleData';
import { apiClient } from '../services/apiClient';

const companyLinks = [
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
  { to: '/services', label: 'All Services' },
];

const legalLinks = [
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms & Conditions' },
];

export function Footer() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    apiClient.getSettings()
      .then(data => setSettings(data))
      .catch(err => console.warn('Failed to load settings in Footer:', err));
  }, []);

  return (
    <footer className="bg-gray-900 text-gray-300 mt-12 sm:mt-16 md:mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
                <HomeIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold font-display text-white">Bhale<span className="text-brand-400">Padharya</span></span>
            </Link>
            <p className="text-xs sm:text-sm leading-relaxed text-gray-400 max-w-xs">
              Trusted home services at your fingertips. Book verified professionals for 20+ services across 35+ cities.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[Share2, Globe].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-brand-600 flex items-center justify-center transition active-scale" aria-label="Social link">
                  <Icon className="w-4.5 h-4.5 text-gray-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold text-white mb-3 sm:mb-4 uppercase tracking-wider">Top Categories</h4>
            <ul className="space-y-2">
              {categories.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <Link to={`/services?category=${c.slug}`} className="text-xs sm:text-sm text-gray-400 hover:text-brand-400 transition py-1 inline-block">{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold text-white mb-3 sm:mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2">
              {companyLinks.map((l) => (
                <li key={l.to}><Link to={l.to} className="text-xs sm:text-sm text-gray-400 hover:text-brand-400 transition py-1 inline-block">{l.label}</Link></li>
              ))}
              {legalLinks.map((l) => (
                <li key={l.to}><Link to={l.to} className="text-xs sm:text-sm text-gray-400 hover:text-brand-400 transition py-1 inline-block">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold text-white mb-3 sm:mb-4 uppercase tracking-wider">Get in Touch</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-400">
              <li className="flex items-start gap-2.5"><Mail className="w-4 h-4 mt-0.5 text-brand-400 shrink-0" /> <span className="break-all">{settings?.business_email || 'support@bhalepadharya.com'}</span></li>
              <li className="flex items-start gap-2.5"><Phone className="w-4 h-4 mt-0.5 text-brand-400 shrink-0" /> {settings?.business_phone || '1800-200-3000'}</li>
              <li className="flex items-start gap-2.5"><MapPin className="w-4 h-4 mt-0.5 text-brand-400 shrink-0" /> {settings?.business_address || 'Bhale Padharya Tower, BKC, Mumbai 400051'}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 sm:mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-[11px] sm:text-xs text-gray-500">© {new Date().getFullYear()} Bhale Padharya Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 sm:gap-5">
            {legalLinks.map((l) => (
              <Link key={l.to} to={l.to} className="text-[11px] sm:text-xs text-gray-500 hover:text-gray-300 transition py-1">{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
