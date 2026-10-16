import React, { useEffect, useRef, useState, useMemo } from 'react';
import { CaseItem, Language, JudicialSummaryStats } from '../types';
import { I18N, formatNumber } from '../data/i18n';
import {
  Scale,
  FileCheck2,
  Gavel,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Building2,
  Layers,
  Calendar,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { OFFICIAL_SUMMARY_STATS } from '../server/judicialStatsService';

interface StatsProps {
  lang: Language;
  cases?: CaseItem[];
  onToast?: (msg: string) => void;
}

type ViewMode = 'sc_drive' | 'national_backlog' | 'tracked_records';

export const Stats: React.FC<StatsProps> = ({ lang, cases, onToast }) => {
  const t = I18N[lang];
  const sectionRef = useRef<HTMLDivElement>(null);

  const [statsData, setStatsData] = useState<JudicialSummaryStats>(OFFICIAL_SUMMARY_STATS);
  const [viewMode, setViewMode] = useState<ViewMode>('sc_drive');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(
    new Date().toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US')
  );

  // Fetch official verified judicial statistics from server
  const fetchStats = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch('/api/judicial-stats');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.summary) {
          setStatsData(json.summary);
          setLastRefreshedAt(new Date().toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US'));
          if (isManual && onToast) {
            onToast(
              lang === 'bn'
                ? 'বিচারিক তথ্য সফলভাবে হালনাগাদ করা হয়েছে।'
                : 'Judicial statistics refreshed successfully.'
            );
          }
        }
      }
    } catch (err) {
      console.warn('Could not reach judicial stats API, using verified cache:', err);
      if (isManual && onToast) {
        onToast(
          lang === 'bn'
            ? 'সার্ভার সংযোগ বিচ্ছিন্ন; ক্যাশকৃত তথ্য প্রদর্শিত হচ্ছে।'
            : 'Could not contact server; showing cached verified data.'
        );
      }
    } finally {
      if (isManual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Periodic refresh every 10 minutes
    const interval = setInterval(() => {
      fetchStats();
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute stats cards based on selected perspective
  const activeMetrics = useMemo(() => {
    if (viewMode === 'sc_drive') {
      const drive = statsData.supremeCourtDrive2026;
      return [
        {
          id: 'sc-disp',
          label: lang === 'bn' ? 'নিষ্পত্তিকৃত মামলা (ড্রাইভ)' : 'Cases Disposed (SC Drive)',
          value: drive.disposals,
          unit: lang === 'bn' ? 'টি নিষ্পত্তি' : 'disposals',
          icon: CheckCircle2,
          color: 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20',
          badge: lang === 'bn' ? '+১৪,৯৮৬ বেশি নিষ্পত্তি' : '+14,986 Over Filings',
          period: drive.period,
        },
        {
          id: 'sc-filings',
          label: lang === 'bn' ? 'নতুন ফাইলিং (ড্রাইভ)' : 'New Cases Filed (SC Drive)',
          value: drive.filings,
          unit: lang === 'bn' ? 'টি নতুন মামলা' : 'new filings',
          icon: Gavel,
          color: 'text-amber-700 bg-amber-500/10 border-amber-500/20',
          badge: lang === 'bn' ? '৮ মাসে ফাইলিং' : '8-Month Filings',
          period: drive.period,
        },
        {
          id: 'sc-rate',
          label: lang === 'bn' ? 'মামলা নিষ্পত্তি হার' : 'Case Clearance Rate',
          value: drive.clearanceRate,
          isPercentage: true,
          unit: '%',
          icon: TrendingUp,
          color: 'text-[#8B1E2D] bg-[#8B1E2D]/10 border-[#8B1E2D]/20',
          badge: lang === 'bn' ? '১০০% এর বেশি = জট হ্রাস' : '>100% Reducts Backlog',
          period: drive.period,
        },
        {
          id: 'sc-pending',
          label: lang === 'bn' ? 'সুপ্রীম কোর্ট বর্তমান জট' : 'Apex Court Current Backlog',
          value: drive.pendingEnd,
          unit: lang === 'bn' ? 'টি অনিষ্পন্ন' : 'pending cases',
          icon: Scale,
          color: 'text-blue-700 bg-blue-500/10 border-blue-500/20',
          badge: lang === 'bn' ? '৩১ আগস্ট ২০২৬ পর্যন্ত' : 'As of Aug 31, 2026',
          period: statsData.reportingDate,
        },
      ];
    }

    if (viewMode === 'national_backlog') {
      return [
        {
          id: 'nat-total',
          label: lang === 'bn' ? 'সারাদেশে মোট অনিষ্পন্ন' : 'Total Pending Nationwide',
          value: statsData.totalPendingNationwide,
          unit: lang === 'bn' ? 'টি অনিষ্পন্ন মামলা' : 'total pending',
          icon: Building2,
          color: 'text-[#8B1E2D] bg-[#8B1E2D]/10 border-[#8B1E2D]/20',
          badge: lang === 'bn' ? 'সংসদে রিপোর্টকৃত' : 'Parliament Disclosure',
          period: 'As of March 31, 2026',
        },
        {
          id: 'nat-sub',
          label: lang === 'bn' ? 'অধস্তন ও জেলা আদালত' : 'Subordinate / District Courts',
          value: statsData.subordinatePending,
          unit: lang === 'bn' ? 'টি জেলা জট' : 'district court backlog',
          icon: Layers,
          color: 'text-amber-700 bg-amber-500/10 border-amber-500/20',
          badge: lang === 'bn' ? '৮৭.৯% মোট মামলার' : '87.9% of National Total',
          period: 'As of March 31, 2026',
        },
        {
          id: 'nat-hc',
          label: lang === 'bn' ? 'হাইকোর্ট বিভাগ জট' : 'High Court Division Backlog',
          value: statsData.highCourtPending,
          unit: lang === 'bn' ? 'টি অনিষ্পন্ন' : 'pending in HC',
          icon: Scale,
          color: 'text-indigo-700 bg-indigo-500/10 border-indigo-500/20',
          badge: lang === 'bn' ? 'দেওয়ানি ও ফৌজদারি' : 'Civil & Criminal',
          period: 'Official SC Report',
        },
        {
          id: 'nat-app',
          label: lang === 'bn' ? 'আপীল বিভাগ জট' : 'Appellate Division Backlog',
          value: statsData.appellatePending,
          unit: lang === 'bn' ? 'টি শীর্ষ আপীল' : 'apex court appeals',
          icon: Gavel,
          color: 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20',
          badge: lang === 'bn' ? 'শীর্ষ আদালত' : 'Apex Court',
          period: 'Official SC Report',
        },
      ];
    }

    // viewMode === 'tracked_records' (Firestore Database)
    const list = cases || [];
    return [
      {
        id: 'db-total',
        label: lang === 'bn' ? 'প্রকাশিত নথি সংখ্যা' : 'Published Incident Timelines',
        value: list.length,
        unit: lang === 'bn' ? 'টি নথি' : 'case records',
        icon: Scale,
        color: 'text-[#8B1E2D] bg-[#8B1E2D]/10 border-[#8B1E2D]/20',
        badge: lang === 'bn' ? 'সরাসরি ফায়ারস্টোর' : 'Live Firestore DB',
        period: 'Real-time database sync',
      },
      {
        id: 'db-inv',
        label: lang === 'bn' ? 'তদন্তাধীন নথি' : 'Under Investigation',
        value: list.filter((c) => c.status === 'investigation').length,
        unit: lang === 'bn' ? 'টি ঘটনা' : 'investigations',
        icon: FileCheck2,
        color: 'text-amber-700 bg-amber-500/10 border-amber-500/20',
        badge: lang === 'bn' ? 'চার্জশিট অপেক্ষমাণ' : 'Pending Chargesheet',
        period: 'Real-time database sync',
      },
      {
        id: 'db-trial',
        label: lang === 'bn' ? 'বিচারিক শুনানি চলমান' : 'Trials Ongoing',
        value: list.filter((c) => c.status === 'trial').length,
        unit: lang === 'bn' ? 'টি বিচার' : 'trials active',
        icon: Gavel,
        color: 'text-indigo-700 bg-indigo-500/10 border-indigo-500/20',
        badge: lang === 'bn' ? 'আদালতে সাক্ষ্য গ্রহণ' : 'Witness & Evidence',
        period: 'Real-time database sync',
      },
      {
        id: 'db-judge',
        label: lang === 'bn' ? 'রায় ঘোষিত নথি' : 'Judgments Delivered',
        value: list.filter((c) => c.status === 'judgment').length,
        unit: lang === 'bn' ? 'টি রায়' : 'verdicts',
        icon: CheckCircle2,
        color: 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20',
        badge: lang === 'bn' ? 'সম্পন্ন বিচার' : 'Completed',
        period: 'Real-time database sync',
      },
    ];
  }, [viewMode, statsData, cases, lang]);

  const [animatedValues, setAnimatedValues] = useState<number[]>([0, 0, 0, 0]);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const targets = activeMetrics.map((m) => m.value);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setAnimatedValues(targets);
      return;
    }

    const startTime = performance.now();
    const duration = 900;

    const animate = (time: number) => {
      const progress = Math.min(1, (time - startTime) / duration);
      setAnimatedValues(
        targets.map((tgt) => (Number.isInteger(tgt) ? Math.round(tgt * progress) : Math.round(tgt * progress * 10) / 10))
      );

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [activeMetrics]);

  return (
    <section
      ref={sectionRef}
      className="border-y border-[#E4DED7] bg-white relative overflow-hidden"
      aria-labelledby="statsT"
    >
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E4DED7]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8B1E2D] bg-[#8B1E2D]/5 px-2.5 py-1 rounded-full border border-[#8B1E2D]/20">
                <Scale size={13} />
                <span>{t.judicial_stats_badge}</span>
              </span>
              <span className="text-xs text-[#6B635E] font-medium hidden sm:inline">
                · {statsData.asOfDate}
              </span>
            </div>
            <h2 id="statsT" className="font-serif font-bold text-2xl sm:text-3xl text-[#161211] tracking-tight">
              {t.judicial_stats_title}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#6B635E] max-w-2xl leading-relaxed">
              {t.judicial_stats_subtitle}
            </p>
          </div>

          {/* Perspective View Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <div className="inline-flex p-1 bg-[#FAF8F5] border border-[#E4DED7] rounded-xl text-xs font-semibold shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('sc_drive')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'sc_drive'
                    ? 'bg-white text-[#8B1E2D] shadow-xs font-bold border border-[#E4DED7]'
                    : 'text-[#6B635E] hover:text-[#161211]'
                }`}
              >
                {t.tab_supreme_court}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('national_backlog')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'national_backlog'
                    ? 'bg-white text-[#8B1E2D] shadow-xs font-bold border border-[#E4DED7]'
                    : 'text-[#6B635E] hover:text-[#161211]'
                }`}
              >
                {t.tab_national}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('tracked_records')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'tracked_records'
                    ? 'bg-white text-[#8B1E2D] shadow-xs font-bold border border-[#E4DED7]'
                    : 'text-[#6B635E] hover:text-[#161211]'
                }`}
              >
                {lang === 'bn' ? 'কেস রেকর্ড নথি' : 'Tracked Records'}
              </button>
            </div>

            {/* Manual Refresh Button */}
            <button
              type="button"
              onClick={() => fetchStats(true)}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-white border border-[#E4DED7] hover:border-[#8B1E2D]/40 text-[#6B635E] hover:text-[#8B1E2D] transition-colors shadow-2xs"
              title={lang === 'bn' ? 'তথ্য পুনরায় যাচাই করুন' : 'Check for updates'}
              aria-label="Refresh data"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-[#8B1E2D]' : ''} />
            </button>
          </div>
        </div>

        {/* 4 Statistical Metric Cards */}
        <div id="stats" className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {activeMetrics.map((stat, idx) => {
            const Icon = stat.icon;
            const displayedVal = animatedValues[idx] ?? stat.value;
            return (
              <div
                key={stat.id}
                className="group relative bg-gradient-to-b from-[#FAF8F5] via-white to-[#FAF8F5] p-5 sm:p-6 rounded-xl border border-[#E4DED7] shadow-xs hover:shadow-md hover:border-[#8B1E2D]/40 transition-all duration-200 flex flex-col justify-between"
              >
                {/* Metric Card Top */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-[#6B635E] tracking-tight uppercase leading-snug">
                    {stat.label}
                  </span>
                  <div className={`p-2 rounded-lg ${stat.color} shrink-0 transition-transform group-hover:scale-105 duration-200 border`}>
                    <Icon size={16} />
                  </div>
                </div>

                {/* Metric Number */}
                <div className="mt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif font-bold text-3xl sm:text-4xl text-[#161211] tabular-nums tracking-tight">
                      {stat.isPercentage
                        ? (displayedVal).toFixed(1)
                        : formatNumber(displayedVal, lang)}
                    </span>
                    {stat.isPercentage && <span className="font-serif font-bold text-2xl text-[#8B1E2D]">%</span>}
                  </div>
                  <span className="text-[11px] font-medium text-[#6B635E] mt-0.5 block">
                    {stat.unit}
                  </span>
                </div>

                {/* Bottom Meta & Attribution */}
                <div className="mt-4 pt-3 border-t border-[#E4DED7]/70 flex items-center justify-between text-[11px] text-[#6B635E]">
                  <span className="font-medium inline-flex items-center gap-1 text-[10px] bg-white px-2 py-0.5 rounded border border-[#E4DED7] text-[#26211F]">
                    {stat.badge}
                  </span>
                  <span className="font-mono text-[10px] font-semibold text-[#8B1E2D]">
                    {stat.period}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Attribution & Transparent Formula Details */}
        <div className="mt-6 pt-4 border-t border-[#E4DED7]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#6B635E]">
          <p className="leading-relaxed">
            <strong className="text-[#161211]">
              {lang === 'bn' ? 'তথ্যসূত্র: ' : 'Attribution: '}
            </strong>
            {statsData.sourceAttribution} · {t.lbl_reporting_date}: {statsData.reportingDate}
          </p>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[11px] text-[#6B635E]">
              {t.lbl_last_synced}: {lastRefreshedAt}
            </span>
            <a
              href={statsData.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8B1E2D] hover:underline font-semibold inline-flex items-center gap-1 text-[11px]"
            >
              <span>{t.lbl_view_source}</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
