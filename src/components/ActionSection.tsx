import React from 'react';
import { Language } from '../types';
import { I18N } from '../data/i18n';
import { Share2, BookOpen, MessageSquarePlus, Scale, ShieldCheck, HeartHandshake } from 'lucide-react';

interface ActionSectionProps {
  lang: Language;
  onShare: () => void;
  onLearnProcess: () => void;
  onSuggestCorrection: () => void;
}

export const ActionSection: React.FC<ActionSectionProps> = ({
  lang,
  onShare,
  onLearnProcess,
  onSuggestCorrection,
}) => {
  const t = I18N[lang];

  return (
    <section
      id="action"
      className="bg-[#161211] text-[#FAF8F5] relative overflow-hidden border-t border-[#2d2624]"
      aria-labelledby="acT"
    >
      {/* Dynamic ambient radial gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-radial from-[#8B1E2D]/25 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-radial from-[#C29B38]/15 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-[#E4DED7] mb-4">
          <HeartHandshake size={14} className="text-[#C29B38]" />
          <span className="font-semibold tracking-wider uppercase text-[10px]">
            {lang === 'bn' ? 'জনসচেতনতা ও তথ্যসমৃদ্ধ নাগরিক সমাজ' : 'PUBLIC EMPOWERMENT & AWARENESS'}
          </span>
        </div>

        <h2 id="acT" className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl accent-line text-[#FAF8F5] tracking-tight">
          {t.act_title}
        </h2>

        <p className="mt-4 max-w-2xl text-[#FAF8F5]/85 text-base sm:text-lg leading-relaxed font-sans">
          {t.act_sub}
        </p>

        {/* Dynamic Tactile Action Buttons */}
        <div className="mt-9 flex flex-wrap gap-4 sm:gap-5">
          <button
            id="shareBtn"
            onClick={onShare}
            className="group btn-light gap-2.5 inline-flex items-center !py-3.5 !px-6 text-sm font-bold shadow-lg hover:shadow-2xl active:scale-[0.98] transition-all"
          >
            <Share2 size={16} className="text-[#8B1E2D] group-hover:scale-110 transition-transform" />
            <span>{t.share}</span>
          </button>

          <button
            id="learnBtn"
            onClick={onLearnProcess}
            className="group btn-outline-light gap-2.5 inline-flex items-center !py-3.5 !px-6 text-sm font-semibold hover:border-white hover:bg-white/15 active:scale-[0.98] transition-all shadow-md"
          >
            <BookOpen size={16} className="text-[#C29B38] group-hover:scale-110 transition-transform" />
            <span>{t.learn}</span>
          </button>

          <button
            id="fixBtn"
            onClick={onSuggestCorrection}
            className="group btn-outline-light gap-2.5 inline-flex items-center !py-3.5 !px-6 text-sm font-semibold hover:border-white hover:bg-white/15 active:scale-[0.98] transition-all shadow-md"
          >
            <MessageSquarePlus size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>{t.correct}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
