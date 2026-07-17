import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

interface LegalSection {
  heading: string;
  body: string[];
}

export function LegalPage({ title, lastUpdated, intro, sections }: { title: string; lastUpdated: string; intro: string; sections: LegalSection[] }) {
  return (
    <div className="flex flex-col flex-1 bg-gray-50 dark:bg-slate-950 p-4 pb-16 select-none">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-1.5 mb-2">
          <Shield className="w-4.5 h-4.5 text-brand-600" />
          <span className="text-[10px] font-extrabold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Legal Document</span>
        </div>
        <h1 className="text-lg font-black text-gray-900 dark:text-white leading-tight">{title}</h1>
        <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase">Last updated: {lastUpdated}</p>
        <p className="mt-3.5 text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{intro}</p>
      </motion.div>

      <div className="mt-6 space-y-6">
        {sections.map((s, i) => (
          <motion.section
            key={s.heading}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="card p-4 bg-white dark:bg-slate-900"
          >
            <h2 className="font-extrabold text-xs text-gray-900 dark:text-white mb-2">{s.heading}</h2>
            {s.body.map((p, j) => (
              <p key={j} className="text-[11px] text-gray-500 dark:text-gray-450 leading-relaxed mb-2 last:mb-0">{p}</p>
            ))}
          </motion.section>
        ))}
      </div>
    </div>
  );
}
