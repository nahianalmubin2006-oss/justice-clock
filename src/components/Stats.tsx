import React, { useEffect, useRef, useState } from 'react';
import { CaseItem, Language } from '../types';
import { I18N, formatNumber } from '../data/i18n';
import { STATS } from '../data/cases';
import { Scale, FileSearch, Gavel, CheckCircle2, TrendingUp } from 'lucide-react';

interface StatsProps {
  lang: Language;
  cases?: CaseItem[];
}

export const Stats: React.FC<StatsProps> = ({ lang, cases }) => {
  const t = I18N[lang];
  const sectionRef = useRef<HTMLDivElement>(null);

  // Compute live counts if cases provided
  const computedStats = React.useMemo(() => {
    if (cases && cases.length > 0) {
      return [
        { key: 's1', count: cases.length, icon: Scale, color: 'text-[#8B1E2D] bg-[#8B1E2D]/10' },
        {
          key: 's2',
          count: cases.filter((c) => c.status === 'investigation').length,
          icon: FileSearch,
          color: 'text-amber-700 bg-amber-500/10',
        },
        {
          key: 's3',
          count: cases.filter((c) => c.status === 'trial').length,
          icon: Gavel,
          color: 'text-[#8B1E2D] bg-[#8B1E2D]/10',
        },
        {
          key: 's4',
          count: cases.filter((c) => c.status === 'judgment').length,
          icon: CheckCircle2,
          color: 'text-emerald-700 bg-emerald-500/10',
        },
      ];
    }
    return [
      { key: 's1', count: STATS[0].count, icon: Scale, color: 'text-[#8B1E2D] bg-[#8B1E2D]/10' },
      { key: 's2', count: STATS[1].count, icon: FileSearch, color: 'text-amber-700 bg-amber-500/10' },
      { key: 's3', count: STATS[2].count, icon: Gavel, color: 'text-[#8B1E2D] bg-[#8B1E2D]/10' },
      { key: 's4', count: STATS[3].count, icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-500/10' },
    ];
  }, [cases]);

  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0]);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const targets = computedStats.map((s) => s.count);

    if (hasAnimatedRef.current) {
      setCounts(targets);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          observer.disconnect();

          const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (prefersReduced) {
            setCounts(targets);
            return;
          }

          const startTime = performance.now();
          const duration = 1200;

          const animate = (time: number) => {
            const progress = Math.min(1, (time - startTime) / duration);
            setCounts(targets.map((tgt) => Math.round(tgt * progress)));

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [computedStats]);

  const isLiveDb = cases && cases.length > 0;

  return (
    <section
      ref={sectionRef}
      className="border-y border-[#E4DED7] bg-white relative overflow-hidden"
      aria-labelledby="statsT"
    >
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4DED7]">
          <div>
            <h2 id="statsT" className="font-serif font-bold text-2xl sm:text-3xl text-[#161211] tracking-tight">
              {t.stats_title}
            </h2>
          </div>

          {isLiveDb ? (
            <div className="flex items-center gap-2 self-start sm:self-center px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{lang === 'bn' ? 'সরাসরি ফায়ারস্টোর ডাটাবেস' : 'Live Firestore Telemetry'}</span>
            </div>
          ) : (
            <span className="text-xs font-bold text-[#8B1E2D] bg-[#8B1E2D]/5 border border-[#8B1E2D]/20 px-3 py-1 rounded-full self-start sm:self-center shadow-2xs">
              {t.demo_tag}
            </span>
          )}
        </div>

        {/* 4 Premium Metric Cards */}
        <div id="stats" className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {computedStats.map((stat, idx) => {
            const labelKey = stat.key as 's1' | 's2' | 's3' | 's4';
            const Icon = stat.icon;
            return (
              <div
                key={stat.key}
                className="group relative bg-gradient-to-b from-[#FAF8F5] via-white to-[#FAF8F5] p-5 sm:p-6 rounded-xl border border-[#E4DED7] shadow-xs hover:shadow-md hover:border-[#8B1E2D]/40 transition-all duration-200 flex flex-col justify-between"
              >
                {/* Metric Card Header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#6B635E] uppercase tracking-wider">
                    {t[labelKey]}
                  </span>
                  <div className={`p-2 rounded-lg ${stat.color} transition-transform group-hover:scale-110 duration-200`}>
                    <Icon size={16} />
                  </div>
                </div>

                {/* Animated Metric Number */}
                <div className="mt-4">
                  <span className="block font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-[#161211] tabular-nums tracking-tight">
                    {formatNumber(counts[idx], lang)}
                  </span>
                </div>

                {/* Bottom Meta */}
                <div className="mt-4 pt-3 border-t border-[#E4DED7]/70 flex items-center justify-between text-[11px] text-[#6B635E]">
                  <span className="font-medium">
                    {isLiveDb ? (lang === 'bn' ? 'যাচাইকৃত নথি' : 'Verified Records') : t.demo_tag}
                  </span>
                  <span className="font-mono text-[10px] font-semibold text-[#8B1E2D]">
                    TRACK-0{idx + 1}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-xs text-[#6B635E] text-center max-w-xl mx-auto leading-relaxed">
          {isLiveDb
            ? lang === 'bn'
              ? 'প্রকাশিত এবং যাচাইকৃত মামলার রিয়েল-টাইম ডাটাবেস পরিসংখ্যান।'
              : 'Real-time database statistics computed directly from verified published cases.'
            : t.stats_note}
        </p>
      </div>
    </section>
  );
};
