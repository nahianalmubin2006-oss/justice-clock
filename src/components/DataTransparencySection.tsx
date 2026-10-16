import React, { useState, useEffect } from 'react';
import { DataSourceStatus, Language } from '../types';
import { I18N } from '../data/i18n';
import { OFFICIAL_DATA_SOURCES } from '../server/judicialStatsService';
import {
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Database,
  Radio,
  FileText,
} from 'lucide-react';

interface DataTransparencySectionProps {
  lang: Language;
}

export const DataTransparencySection: React.FC<DataTransparencySectionProps> = ({ lang }) => {
  const t = I18N[lang];
  const [sources, setSources] = useState<DataSourceStatus[]>(OFFICIAL_DATA_SOURCES);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>(
    new Date().toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US')
  );

  const fetchSourceStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/judicial-stats/sources');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.sources)) {
          setSources(json.sources);
          setLastChecked(new Date().toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US'));
        }
      }
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSourceStatus();
  }, []);

  const getStatusBadge = (status: DataSourceStatus['status']) => {
    switch (status) {
      case 'current':
        return {
          label: lang === 'bn' ? 'সক্রিয় / হালনাগাদ' : 'Verified / Current',
          className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'periodic':
        return {
          label: lang === 'bn' ? 'পর্যায়ক্রমিক সরকারি রিপোর্ট' : 'Periodic Gazette Report',
          className: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
        };
      case 'delayed':
        return {
          label: lang === 'bn' ? 'বিলম্বিত সংযোগ' : 'Delayed Probe',
          className: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'stale':
      default:
        return {
          label: lang === 'bn' ? 'ক্যাশকৃত রেকর্ড' : 'Cached Archive',
          className: 'bg-gray-100 text-gray-800 border-gray-300',
          dot: 'bg-gray-400',
        };
    }
  };

  return (
    <section className="bg-white border-b border-[#E4DED7] py-14 sm:py-16 relative">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E4DED7]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8B1E2D] mb-1">
              <ShieldCheck size={14} />
              <span>{lang === 'bn' ? 'উৎস স্বচ্ছতা ও উন্মুক্ত তথ্য' : 'DATA INTEGRITY & SOURCE TRANSPARENCY'}</span>
            </div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#161211]">
              {t.lbl_data_freshness}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#6B635E]">
              {t.lbl_data_freshness_sub}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#6B635E] self-start sm:self-auto">
            <span>
              {lang === 'bn' ? 'যাচাই সময়: ' : 'Checked: '}
              <strong>{lastChecked}</strong>
            </span>
            <button
              onClick={fetchSourceStatus}
              disabled={loading}
              className="p-1.5 rounded-lg border border-[#E4DED7] hover:border-[#8B1E2D] text-[#6B635E] hover:text-[#8B1E2D] transition-colors shadow-2xs"
              title="Refresh source health"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-[#8B1E2D]' : ''} />
            </button>
          </div>
        </div>

        {/* Source Cards Grid */}
        <div className="mt-8 grid md:grid-cols-2 gap-4 sm:gap-6">
          {sources.map((src) => {
            const badge = getStatusBadge(src.status);
            return (
              <div
                key={src.id}
                className="bg-[#FAF8F5] p-5 rounded-xl border border-[#E4DED7] shadow-xs flex flex-col justify-between hover:border-[#8B1E2D]/40 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E4DED7]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0 bg-[#8B1E2D]" />
                      <h3 className="font-serif font-bold text-base text-[#161211]">
                        {src.name}
                      </h3>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${badge.className}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <p className="text-[#26211F] font-medium leading-relaxed">
                      {lang === 'bn' ? src.coverageBn : src.coverage}
                    </p>
                    <p className="text-[#6B635E] text-[11px] leading-relaxed">
                      {src.verificationNotes}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E4DED7]/70 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#6B635E]">
                  <div className="flex items-center gap-3">
                    <span>
                      {lang === 'bn' ? 'রিপোর্ট তারিখ: ' : 'Reporting Date: '}
                      <strong className="text-[#161211] font-mono">{src.reportingDate}</strong>
                    </span>
                    <span>·</span>
                    <span className="italic">{src.updateFrequency}</span>
                  </div>

                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8B1E2D] hover:underline font-bold inline-flex items-center gap-1 ml-auto"
                  >
                    <span>{t.lbl_view_source}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mandatory Transparency Disclaimer */}
        <div className="mt-6 p-4 bg-white rounded-xl border border-[#E4DED7] text-xs text-[#6B635E] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
            <span>
              {lang === 'bn'
                ? 'আইনি নিশ্চয়তা: এখানে কোনো সংখ্যা কৃত্রিমভাবে বাড়ানো বা কাল্পনিকভাবে পরিবর্তন করা হয় না। প্রতিটি সংখ্যা সরকারি নথির সাথে হুবহু সামঞ্জস্যপূর্ণ।'
                : 'Data Integrity Commitment: No judicial figures are artificially incremented or fabricated. All displayed numbers reflect verifiable published disclosures.'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
