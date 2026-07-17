import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home as HomeIcon, ChevronLeft } from 'lucide-react';

export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 px-5 py-6 justify-between min-h-0 select-none text-left">
      
      {/* Top bar with back arrow and small logo */}
      <div className="flex items-center justify-between shrink-0 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-150 dark:hover:bg-slate-800 text-gray-650 dark:text-gray-250 transition touch-target"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-1.5">
          <div className="w-6.5 h-6.5 rounded-lg bg-brand-600 flex items-center justify-center">
            <HomeIcon className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-extrabold tracking-tight font-display text-gray-900 dark:text-white">
            Home<span className="text-brand-600">Seva</span>
          </span>
        </Link>
      </div>

      {/* Main Form content wrapper */}
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col justify-center max-w-sm w-full mx-auto py-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-black font-display text-gray-900 dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        </motion.div>

        <div className="mt-6">{children}</div>
      </div>

      {/* Footer text */}
      <p className="text-[10px] text-gray-400 text-center shrink-0 mt-4 select-none">
        © {new Date().getFullYear()} HomeSeva Technologies. Secure Connection.
      </p>

    </div>
  );
}
