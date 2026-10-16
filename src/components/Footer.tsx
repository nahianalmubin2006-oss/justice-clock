import React from 'react';
import { Language } from '../types';
import { I18N } from '../data/i18n';
import { ShieldCheck, Scale, Globe } from 'lucide-react';

interface FooterProps {
  lang: Language;
  onSetLang: (lang: Language) => void;
  onOpenPrivacy: () => void;
  onOpenDisclaimer: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  onSetLang,
  onOpenPrivacy,
  onOpenDisclaimer,
}) => {
  const t = I18N[lang];

  return (
    <footer className="border-t border-[#E4DED7] bg-[#FAF8F5] relative">
      <div className="max-w-6xl mx-auto px-4 py-14 grid md:grid-cols-12 gap-8 sm:gap-10 text-sm">
        {/* Brand Column */}
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-center gap-2.5 font-serif font-bold text-xl text-[#161211]">
            <div className="w-6 h-6 rounded-full bg-[#8B1E2D] flex items-center justify-center text-white">
              <Scale size={13} />
            </div>
            <span>{t.brand}</span>
          </div>
          <p className="text-xs text-[#6B635E] max-w-sm leading-relaxed">
            {t.foot_mission}
          </p>
          <div className="pt-2 flex items-center gap-2 text-[11px] text-[#6B635E]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Public Civic Transparency Project · Bangladesh</span>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="md:col-span-4 flex flex-col gap-2.5 text-xs font-semibold text-[#161211]">
          <span className="text-[10px] uppercase tracking-wider text-[#6B635E] font-bold mb-1">
            Navigation
          </span>
          <a href="#home" className="hover:text-[#8B1E2D] transition-colors w-fit">
            {t.nav_home}
          </a>
          <a href="#tracker" className="hover:text-[#8B1E2D] transition-colors w-fit">
            {t.nav_tracker}
          </a>
          <a href="#about" className="hover:text-[#8B1E2D] transition-colors w-fit">
            {t.methodology}
          </a>
          <button
            onClick={onOpenPrivacy}
            className="text-left text-[#6B635E] hover:text-[#8B1E2D] cursor-pointer w-fit transition-colors"
          >
            {t.privacy}
          </button>
          <button
            onClick={onOpenDisclaimer}
            className="text-left text-[#6B635E] hover:text-[#8B1E2D] cursor-pointer w-fit transition-colors"
          >
            {t.disclaimer}
          </button>
        </div>

        {/* Language Selection Column */}
        <div className="md:col-span-3 space-y-3">
          <span className="text-[10px] uppercase tracking-wider text-[#6B635E] font-bold block">
            {t.language}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSetLang('en')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-2xs ${
                lang === 'en'
                  ? 'bg-[#161211] text-[#FAF8F5]'
                  : 'bg-white text-[#26211F] border border-[#E4DED7] hover:border-[#8B1E2D]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => onSetLang('bn')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-2xs ${
                lang === 'bn'
                  ? 'bg-[#8B1E2D] text-white'
                  : 'bg-white text-[#26211F] border border-[#E4DED7] hover:border-[#8B1E2D]'
              }`}
            >
              বাংলা
            </button>
          </div>
          <p className="pt-3 text-[#6B635E] text-[11px] leading-relaxed">
            {t.copy}
          </p>
        </div>
      </div>
    </footer>
  );
};
