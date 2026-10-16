import React, { useEffect } from 'react';
import { CaseItem, Language } from '../types';
import { I18N, formatDate, formatNumber } from '../data/i18n';
import { STATUS_ICON } from '../data/cases';
import { LiveTimer } from './LiveTimer';
import { getApproxMonths } from '../utils/time';
import {
  X,
  AlertCircle,
  ExternalLink,
  Calendar,
  MapPin,
  Scale,
  ShieldCheck,
  Clock,
} from 'lucide-react';

interface CaseModalProps {
  c: CaseItem | null;
  lang: Language;
  now: number;
  onClose: () => void;
}

export const CaseModal: React.FC<CaseModalProps> = ({ c, lang, now, onClose }) => {
  const t = I18N[lang];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (c) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [c, onClose]);

  if (!c) return null;

  const renderTimerArea = () => {
    if (c.prec === 'day' && c.date) {
      return (
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E4DED7] shadow-xs" role="timer" aria-live="off">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E4DED7]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8B1E2D] flex items-center gap-1.5">
              <span className="live" aria-hidden="true" />
              <span>{lang === 'bn' ? 'সরাসরি অতিবাহিত সময়' : 'Real-time Elapsed Chronometer'}</span>
            </span>
            <span className="text-xs font-mono text-[#6B635E]">
              Ref: {c.date}T00:00:00
            </span>
          </div>
          <LiveTimer isoDate={`${c.date}T00:00:00`} now={now} small={false} lang={lang} />
        </div>
      );
    }

    if (c.prec === 'month' && c.date) {
      const { years, months } = getApproxMonths(c.date, now);
      const yStr = years > 0 ? formatNumber(years, lang) : '';
      const mStr = formatNumber(months, lang);
      return (
        <div className="p-4 bg-white rounded-xl border border-[#E4DED7] flex items-center gap-3 text-sm text-[#6B635E] shadow-2xs">
          <Clock size={18} className="text-[#8B1E2D] shrink-0" />
          <span>
            <strong className="text-[#161211]">{t.approx}:</strong> {t.about_n(yStr, mStr)}
          </span>
        </div>
      );
    }

    return (
      <div className="p-4 bg-white rounded-xl border border-[#E4DED7] text-sm text-[#6B635E] italic flex items-center gap-2">
        <Clock size={16} className="text-[#6B635E]/60 shrink-0" />
        <span>{t.noTimer}</span>
      </div>
    );
  };

  const getVerIcon = (ver: string) => {
    if (ver === 'verified') return '✔';
    if (ver === 'partial') return '◐';
    return '?';
  };

  const incidentDateText =
    c.prec === 'day'
      ? formatDate(c.date, lang, t.unknown)
      : c.prec === 'month'
      ? t.p_month
      : t.unknown;

  const row = (k: string, v: React.ReactNode) => (
    <div className="bg-white p-3.5 rounded-lg border border-[#E4DED7] shadow-2xs">
      <dt className="text-[11px] text-[#6B635E] font-bold uppercase tracking-wider">{k}</dt>
      <dd className="mt-1 font-semibold text-sm text-[#161211]">{v}</dd>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161211]/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF8F5] text-[#161211] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#CDC4B8] shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="caseModalTitle"
      >
        {/* Header */}
        <div className="flex justify-between items-start gap-4 border-b border-[#E4DED7] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-[10px] font-sans font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border shadow-2xs ${
                  c.raw?.publicationStatus === 'published'
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
              <span className="text-xs font-mono font-bold text-[#6B635E] bg-white px-2 py-0.5 rounded border border-[#E4DED7]">
                {c.id}
              </span>
            </div>

            <h2 id="caseModalTitle" className="font-serif font-bold text-2xl sm:text-3xl text-[#161211] leading-tight">
              {lang === 'bn' ? c.titleBn || t.case_t(c.n) : c.titleEn || t.case_t(c.n)}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg border border-[#E4DED7] bg-white hover:bg-[#161211] text-[#6B635E] hover:text-[#FAF8F5] transition-all shadow-2xs active:scale-95"
            aria-label={t.close}
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Chronometer */}
        <div className="mt-6">{renderTimerArea()}</div>

        {/* Metadata Grid */}
        <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {row(t.m_id, c.id)}
          {row(
            t.m_status,
            <span className="badge">
              <span className="text-[#8B1E2D] font-bold">{STATUS_ICON[c.status]}</span>{' '}
              {t[`st_${c.status}` as keyof typeof t] as string}
            </span>
          )}
          {row(t.m_inc, incidentDateText)}
          {row(t.m_prec, t[`p_${c.prec}` as keyof typeof t] as string)}
          {row(t.m_filed, formatDate(c.filed, lang, t.unknown))}
          {row(
            t.m_court,
            c.court ? (t.courts as Record<string, string>)[c.court] || c.court : t.noCourt
          )}
          {row(t.location, t.d_dist[c.district])}
          {row(
            t.m_ver,
            <span className="inline-flex items-center gap-1.5">
              <span>{formatDate(c.verified, lang, t.unknown)}</span>
              <span className="text-[#6B635E]">—</span>
              <span className="badge !py-0.5 !px-2">
                {getVerIcon(c.ver)} {t[`vs_${c.ver}` as keyof typeof t] as string}
              </span>
            </span>
          )}
        </dl>

        <p className="mt-3 text-xs text-[#6B635E] leading-relaxed">
          {t.filedVsInc}
        </p>

        {/* Timeline */}
        <div className="mt-8 border-t border-[#E4DED7] pt-6">
          <h3 className="font-serif font-bold text-xl text-[#161211]">
            {t.tl_title}
          </h3>
          <ol className="tl mt-4">
            {c.tl.map(([stage, date], idx) => (
              <li key={idx}>
                <b className="text-sm font-semibold text-[#161211]">
                  {t[`tl_${stage}` as keyof typeof t] as string}
                </b>
                <br />
                <span className="text-xs text-[#6B635E]">
                  {formatDate(date, lang, t.unknown)}
                </span>
              </li>
            ))}
          </ol>
          <p className="text-xs text-[#6B635E] italic mt-1">
            {t.tl_note}
          </p>
        </div>

        {/* Allegation vs Court Finding */}
        <div className="mt-6 border-l-4 border-[#8B1E2D] bg-white p-4 rounded-r-xl border border-[#E4DED7] border-l-[#8B1E2D] text-sm shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={18} className="text-[#8B1E2D] shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold text-[#161211]">
                {t.allegation}
              </strong>
              <p className="mt-1 text-[#6B635E] text-xs leading-relaxed">
                {t.alleg_a}
              </p>
            </div>
          </div>
        </div>

        {/* Supporting Sources */}
        {c.sources && c.sources.length > 0 && (
          <div className="mt-6 border-t border-[#E4DED7] pt-5">
            <h4 className="font-serif font-bold text-base text-[#161211]">
              {lang === 'bn' ? 'যাচাইকৃত তথ্যসূত্র ও নথি' : 'Verified Supporting Sources & Records'}
            </h4>
            <div className="mt-3 space-y-2">
              {c.sources.map((src, i) => (
                <div
                  key={i}
                  className="p-3 bg-white rounded-lg border border-[#E4DED7] text-xs flex flex-wrap items-center justify-between gap-2 shadow-2xs"
                >
                  <div>
                    <span className="font-semibold text-[#161211]">{src.publisher}</span>
                    <span className="text-[#6B635E] ml-2 font-mono">
                      ({src.sourceType.replace('_', ' ')})
                    </span>
                    {src.notes && <p className="text-[#6B635E] mt-0.5">{src.notes}</p>}
                  </div>
                  {src.url && src.url.startsWith('http') && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#8B1E2D] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Visit Source</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-[#E4DED7] pt-4 text-xs text-[#6B635E]">
          <p>
            {c.sources && c.sources.length > 0
              ? `${lang === 'bn' ? 'মোট নথিভুক্ত সূত্র' : 'Verified Sources'}: ${c.sources.length}`
              : t.source}
          </p>
          <button
            onClick={onClose}
            className="btn-primary !py-2 !px-5 text-xs shadow-md"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
