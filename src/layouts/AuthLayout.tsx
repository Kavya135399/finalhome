import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home as HomeIcon, ShieldCheck, Star, Users } from 'lucide-react';

export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — form */}
      <div className="flex flex-col p-6 sm:p-10 lg:p-16">
        <Link to="/" className="flex items-center gap-2 mb-auto">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
            <HomeIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold font-display">Home<span className="text-brand-600">Seva</span></span>
        </Link>

        <div className="max-w-md w-full mx-auto py-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className="text-3xl font-extrabold font-display">{title}</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{subtitle}</p>
          </motion.div>
          <div className="mt-8">{children}</div>
        </div>

        <p className="text-xs text-gray-400 mt-auto">© {new Date().getFullYear()} HomeSeva Technologies</p>
      </div>

      {/* Right — visual */}
      <div className="hidden lg:flex relative bg-gradient-to-br from-brand-600 to-brand-800 p-16 flex-col justify-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-light opacity-20" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative max-w-md"
        >
          <h2 className="text-4xl font-extrabold font-display leading-tight">Trusted home services, one tap away.</h2>
          <p className="mt-4 text-brand-100 text-lg">Join 12M+ customers who trust HomeSeva for quality, verified home services.</p>

          <div className="mt-10 space-y-4">
            {[
              { icon: ShieldCheck, text: '50K+ background-verified professionals' },
              { icon: Star, text: '4.8 average rating across 45M+ services' },
              { icon: Users, text: 'Trusted by families in 35+ cities' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                  <item.icon className="w-5 h-5" />
                </div>
                <p className="text-brand-50">{item.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
