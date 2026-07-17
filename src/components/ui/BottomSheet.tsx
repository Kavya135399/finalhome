import { useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxHeight?: string;
}

export function BottomSheet({ open, onClose, title, children, maxHeight = 'max-h-[85vh]' }: BottomSheetProps) {
  // Prevent body scrolling when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/40 dark:bg-slate-950/60 backdrop-blur-xs"
          />

          {/* Sheet Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={`relative w-full max-w-[450px] ${maxHeight} bg-white dark:bg-slate-900 rounded-t-3xl shadow-soft-lg flex flex-col overflow-hidden border-t border-gray-150 dark:border-slate-800 z-10`}
          >
            {/* Native indicator drag handle */}
            <div className="flex justify-center py-2.5 shrink-0 cursor-pointer" onClick={onClose}>
              <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-slate-700" />
            </div>

            {/* Header */}
            {title && (
              <div className="px-5 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-slate-800 shrink-0">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-none">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-gray-105 dark:hover:bg-slate-850 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
                  aria-label="Close sheet"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 no-scrollbar pb-10">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
