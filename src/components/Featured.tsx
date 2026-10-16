import React from 'react';
import { CaseItem, Language } from '../types';
import { I18N } from '../data/i18n';
import { CaseCard } from './CaseCard';
import { Sparkles, Flame } from 'lucide-react';

interface FeaturedProps {
  lang: Language;
  now: number;
  cases: CaseItem[];
  onOpenDetails: (c: CaseItem) => void;
}

export const Featured: React.FC<FeaturedProps> = ({
  lang,
  now,
  cases,
  onOpenDetails,
}) => {
  const t = I18N[lang];
  // Filter cases with exact day precision first, or fallback to first 3
  const exactCases = cases.filter((c) => c.prec === 'day');
  const featuredCases = (exactCases.length > 0 ? exactCases : cases).slice(0, 3);

  if (featuredCases.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 py-16 md:py-20" aria-labelledby="featT">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E4DED7]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8B1E2D] mb-1">
            <Flame size={14} className="text-[#8B1E2D]" />
            <span>{lang === 'bn' ? 'প্রধান ক্রোনোমিটার রেকর্ড' : 'KEY INCIDENT CHRONOMETERS'}</span>
          </div>
          <h2 id="featT" className="font-serif font-bold text-3xl sm:text-4xl text-[#161211] tracking-tight">
            {t.feat_title}
          </h2>
        </div>
        <p className="text-sm text-[#6B635E] max-w-md">
          {t.feat_sub}
        </p>
      </div>

      <div id="featured" className="mt-8 grid md:grid-cols-3 gap-6 sm:gap-7">
        {featuredCases.map((c) => (
          <CaseCard
            key={c.id}
            c={c}
            lang={lang}
            now={now}
            onOpenDetails={onOpenDetails}
          />
        ))}
      </div>
    </section>
  );
};
