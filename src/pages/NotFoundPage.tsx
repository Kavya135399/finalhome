import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="pt-20 min-h-screen flex items-center">
      <div className="mx-auto max-w-lg px-4 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <p className="text-8xl lg:text-9xl font-extrabold font-display text-brand-600">404</p>
          <h1 className="text-2xl font-bold mt-4">Page not found</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400">The page you're looking for doesn't exist or has been moved. Let's get you back on track.</p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link to="/"><Button leftIcon={<Home className="w-4 h-4" />}>Go home</Button></Link>
            <Link to="/services"><Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>Browse services</Button></Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
