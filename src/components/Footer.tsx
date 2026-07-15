import { Link } from 'react-router-dom';
import { Home as HomeIcon, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { categories } from '../data/sampleData';

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
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
                <HomeIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold font-display text-white">Home<span className="text-brand-400">Seva</span></span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
              Trusted home services at your fingertips. Book verified professionals for 20+ services across 35+ cities.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-brand-600 flex items-center justify-center transition" aria-label="Social link">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Top Categories</h4>
            <ul className="space-y-2.5">
              {categories.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <Link to={`/services?category=${c.slug}`} className="text-sm text-gray-400 hover:text-brand-400 transition">{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((l) => (
                <li key={l.to}><Link to={l.to} className="text-sm text-gray-400 hover:text-brand-400 transition">{l.label}</Link></li>
              ))}
              {legalLinks.map((l) => (
                <li key={l.to}><Link to={l.to} className="text-sm text-gray-400 hover:text-brand-400 transition">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Get in Touch</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2.5"><Mail className="w-4 h-4 mt-0.5 text-brand-400" /> support@homeseva.com</li>
              <li className="flex items-start gap-2.5"><Phone className="w-4 h-4 mt-0.5 text-brand-400" /> 1800-200-3000</li>
              <li className="flex items-start gap-2.5"><MapPin className="w-4 h-4 mt-0.5 text-brand-400" /> HomeSeva Tower, BKC, Mumbai 400051</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} HomeSeva Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {legalLinks.map((l) => (
              <Link key={l.to} to={l.to} className="text-xs text-gray-500 hover:text-gray-300 transition">{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
