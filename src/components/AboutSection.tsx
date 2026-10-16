import React from 'react';
import { Language } from '../types';
import { I18N } from '../data/i18n';
import { ShieldCheck, BookOpen, Compass } from 'lucide-react';

interface AboutSectionProps {
  lang: Language;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ lang }) => {
  const t = I18N[lang];

  return (
    <section id="about" className="max-w-6xl mx-auto px-4 py-16 md:py-24" aria-labelledby="abT">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E4DED7]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8B1E2D] mb-1">
            <Compass size={14} />
            <span>{lang === 'bn' ? 'পদ্ধতি ও নৈতিক মানদণ্ড' : 'METHODOLOGY & STANDARDS'}</span>
          </div>
          <h2 id="abT" className="font-serif font-bold text-3xl sm:text-4xl text-[#161211] tracking-tight">
            {t.about_title}
          </h2>
          <p className="mt-2 text-sm text-[#6B635E] max-w-xl">
            {lang === 'bn'
              ? 'আইনি স্বচ্ছতা, তথ্য যাচাইকরণ এবং অতিবাহিত সময় গণনার পদ্ধতিগত নির্দেশিকা।'
              : 'Methodological framework, verification criteria, and ethical standards governing tracked legal cases.'}
          </p>
        </div>
      </div>

      {/* Methodology Notice Banner */}
      <div className="mt-8 bg-gradient-to-r from-white via-[#FAF8F5] to-white p-5 sm:p-6 rounded-xl border border-[#E4DED7] shadow-xs max-w-3xl">
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-lg bg-[#8B1E2D]/10 text-[#8B1E2D] shrink-0 mt-0.5">
            <ShieldCheck size={20} />
          </div>
          <p className="text-sm font-semibold text-[#161211] leading-relaxed">
            {t.proto}
          </p>
        </div>
      </div>

      {/* Curatorial 2-Column Methodology Grid */}
      <div
        id="aboutList"
        className="mt-10 grid md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl"
      >
        {t.about.map(([heading, body], idx) => (
          <div
            key={idx}
            className="group relative bg-white p-6 sm:p-7 rounded-xl border border-[#E4DED7] shadow-xs hover:shadow-md hover:border-[#8B1E2D]/40 transition-all duration-200 flex flex-col justify-between overflow-hidden"
          >
            {/* Top Micro Accent Line on Hover */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#8B1E2D] to-[#C29B38] opacity-0 group-hover:opacity-100 transition-opacity" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-[#8B1E2D] font-bold tracking-widest px-2 py-0.5 rounded bg-[#8B1E2D]/5 border border-[#8B1E2D]/15">
                  #0{idx + 1}
                </span>
                <span className="text-[11px] text-[#6B635E] uppercase tracking-wider font-semibold font-mono">
                  Principle
                </span>
              </div>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-[#161211] group-hover:text-[#8B1E2D] transition-colors">
                {heading}
              </h3>
              <p className="mt-2.5 text-sm text-[#6B635E] leading-relaxed">
                {body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
