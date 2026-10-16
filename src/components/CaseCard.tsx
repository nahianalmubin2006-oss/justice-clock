import React from 'react';
import { CaseItem, Language } from '../types';
import { I18N, formatDate, formatNumber } from '../data/i18n';
import { STATUS_ICON } from '../data/cases';
import { LiveTimer } from './LiveTimer';
import { getApproxMonths } from '../utils/time';
import {
  ArrowUpRight,
  Clock,
  MapPin,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface CaseCardProps {
  c: CaseItem;
  lang: Language;
  now: number;
  onOpenDetails: (c: CaseItem) => void;
  isListView?: boolean;
}

export const CaseCard: React.FC<CaseCardProps> = ({
  c,
  lang,
  now,
  onOpenDetails,
  isListView = false,
}) => {
  const t = I18N[lang];

  const getVerBadge = (ver: string) => {
    if (ver === 'verified') {
      return {
        icon: CheckCircle2,
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        label: t.vs_verified,
      };
    }
    if (ver === 'partial') {
      return {
        icon: AlertCircle,
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        label: t.vs_partial,
      };
    }
    return {
      icon: HelpCircle,
      color: 'text-stone-700 bg-stone-100 border-stone-200',
      label: t.vs_unverified,
    };
  };

  const renderTimerArea = () => {
    if (c.prec === 'day' && c.date) {
      return (
        <div role="timer" aria-live="off" className="my-1 w-full">
          <LiveTimer isoDate={`${c.date}T00:00:00`} now={now} small={true} lang={lang} />
        </div>
      );
    }

    if (c.prec === 'month' && c.date) {
      const { years, months } = getApproxMonths(c.date, now);
      const yStr = years > 0 ? formatNumber(years, lang) : '';
      const mStr = formatNumber(months, lang);
      return (
        <div className="my-1 p-2.5 bg-gradient-to-b from-[#FAF8F5] to-[#F5F2EC] rounded-lg border border-[#E4DED7] flex items-center gap-2.5 text-xs text-[#6B635E] shadow-2xs">
          <Clock size={15} className="text-[#8B1E2D] shrink-0" />
          <span>
            <strong className="text-[#161211] font-semibold">{t.approx}:</strong>{' '}
            {t.about_n(yStr, mStr)}
          </span>
        </div>
      );
    }

    return (
      <div className="my-1 p-2.5 bg-[#FAF8F5] rounded-lg border border-[#E4DED7] text-xs text-[#6B635E] italic flex items-center gap-2">
        <Clock size={14} className="text-[#6B635E]/60 shrink-0" />
        <span>{t.noTimer}</span>
      </div>
    );
  };

  const incidentDateText =
    c.prec === 'day'
      ? formatDate(c.date, lang, t.unknown)
      : c.prec === 'month'
      ? t.p_month
      : t.unknown;

  const isVerifiedRecord =
    c.raw?.publicationStatus === 'published' || c.ver === 'verified';

  const verBadge = getVerBadge(c.ver);
  const VerIcon = verBadge.icon;

  const getStatusBorderColor = (st: string) => {
    switch (st) {
      case 'judgment':
        return 'from-emerald-500 to-teal-600';
      case 'trial':
        return 'from-[#8B1E2D] to-[#b82d40]';
      case 'investigation':
        return 'from-amber-500 to-orange-600';
      default:
        return 'from-stone-400 to-stone-500';
    }
  };

  return (
    <article
      className={`group bg-white rounded-xl border border-[#E4DED7] p-5 sm:p-6 flex flex-col gap-4 shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-[#8B1E2D]/50 transition-all duration-200 relative overflow-hidden ${
        isListView ? 'lg:flex-row lg:items-center lg:justify-between' : ''
      }`}
      data-s={c.status}
    >
      {/* Top 3.5px Status Gradient Accent Strip */}
      <div
        className={`absolute top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r ${getStatusBorderColor(
          c.status
        )}`}
      />

      <div className="flex flex-col gap-3 flex-1">
        {/* Top Badges Bar */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-[10px] font-sans font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border shadow-2xs ${
              isVerifiedRecord
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-[#8B1E2D] border-amber-200'
            }`}
          >
            {c.raw?.publicationStatus === 'published'
              ? lang === 'bn'
                ? 'যাচাইকৃত রেকর্ড'
                : 'VERIFIED RECORD'
              : t.demo_label}
          </span>

          <span className="text-xs font-mono font-bold text-[#6B635E] bg-[#FAF8F5] px-2.5 py-0.5 rounded-md border border-[#E4DED7] shadow-2xs">
            {c.id}
          </span>
        </div>

        {/* Case Title */}
        <h3 className="font-serif font-bold text-xl text-[#161211] group-hover:text-[#8B1E2D] transition-colors leading-snug">
          {lang === 'bn' ? c.titleBn || t.case_t(c.n) : c.titleEn || t.case_t(c.n)}
        </h3>

        {/* Location & Incident Date Badges */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B635E]">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E4DED7]/80">
            <MapPin size={13} className="text-[#8B1E2D] shrink-0" />
            <span>
              {t.location}:{' '}
              <strong className="text-[#161211] font-semibold">{t.d_dist[c.district]}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E4DED7]/80">
            <Clock size={13} className="text-[#6B635E] shrink-0" />
            <span>
              {t.m_inc}:{' '}
              <strong className="text-[#161211] font-semibold">{incidentDateText}</strong>
            </span>
          </div>
        </div>

        {/* Status and Verification Tags */}
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="badge">
            <span aria-hidden="true" className="text-[#8B1E2D] font-bold text-sm">
              {STATUS_ICON[c.status] || '●'}
            </span>
            <span>{String((t as any)[`st_${c.status}`] || c.status)}</span>
          </span>

          <span className={`badge ${verBadge.color}`}>
            <VerIcon size={12} className="shrink-0" />
            <span>{verBadge.label}</span>
          </span>
        </div>

        {/* Real-time Dynamic Live Chronometer */}
        <div className="pt-1">{renderTimerArea()}</div>

        {/* Source Citation */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#6B635E] truncate pt-0.5">
          <FileText size={12} className="shrink-0 text-[#8B1E2D]/70" />
          <span className="truncate">
            {c.sources && c.sources.length > 0
              ? `${lang === 'bn' ? 'সূত্র' : 'Source'}: ${c.sources.map((s) => s.publisher).join(', ')}`
              : t.source}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div
        className={`mt-2 ${
          isListView
            ? 'lg:mt-0 lg:pl-6 lg:border-l lg:border-[#E4DED7] lg:w-48 shrink-0'
            : 'mt-auto'
        }`}
      >
        <button
          className="btn-ghost w-full text-xs font-bold !py-2.5 !px-3.5 flex items-center justify-center gap-2 group-hover:bg-[#161211] group-hover:text-[#FAF8F5] group-hover:border-[#161211] transition-all shadow-2xs"
          onClick={() => onOpenDetails(c)}
          data-open={c.id}
        >
          <span>{t.details}</span>
          <ArrowUpRight
            size={15}
            className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 text-[#8B1E2D] group-hover:text-[#FAF8F5]"
          />
        </button>
      </div>
    </article>
  );
};
