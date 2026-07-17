import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center py-12 text-center select-none bg-gray-50 dark:bg-slate-950">
      <div className="mx-auto max-w-sm px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <p className="text-7xl font-black font-display text-brand-600">404</p>
          <h1 className="text-xl font-bold mt-4">Page Not Found</h1>
          <p className="mt-3 text-xs text-gray-500 leading-relaxed">The page you're looking for doesn't exist or has been moved.</p>
          <div className="flex gap-2.5 mt-8 justify-center select-none">
            <Link to="/"><Button leftIcon={<Home className="w-4 h-4" />}>Go home</Button></Link>
            <Link to="/services"><Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>Browse services</Button></Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
