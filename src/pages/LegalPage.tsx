import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

interface LegalSection {
  heading: string;
  body: string[];
}

export function LegalPage({ title, lastUpdated, intro, sections }: { title: string; lastUpdated: string; intro: string; sections: LegalSection[] }) {
  return (
    <div className="pt-20 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-brand-600" />
            <span className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Legal</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold font-display">{title}</h1>
          <p className="text-sm text-gray-500 mt-2">Last updated: {lastUpdated}</p>
          <p className="mt-6 text-gray-600 dark:text-gray-400 leading-relaxed">{intro}</p>
        </motion.div>

        <div className="mt-10 space-y-8">
          {sections.map((s, i) => (
            <motion.section key={s.heading} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <h2 className="text-xl font-bold mb-3">{s.heading}</h2>
              {s.body.map((p, j) => (
                <p key={j} className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-2">{p}</p>
              ))}
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
}
