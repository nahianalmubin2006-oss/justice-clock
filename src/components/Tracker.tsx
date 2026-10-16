import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  CaseItem,
  Language,
  District,
  CaseStatus,
  VerificationStatus,
} from '../types';
import { I18N, formatNumber } from '../data/i18n';
import { DISTRICTS, STATUSES, VERIFS } from '../data/cases';
import { CaseCard } from './CaseCard';
import {
  Search,
  LayoutGrid,
  List as ListIcon,
  RotateCcw,
  ShieldCheck,
  Filter,
  X,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';

interface TrackerProps {
  lang: Language;
  now: number;
  cases: CaseItem[];
  isDbLoaded: boolean;
  onOpenDetails: (c: CaseItem) => void;
  onOpenAdmin?: () => void;
}

export const Tracker: React.FC<TrackerProps> = ({
  lang,
  now,
  cases,
  isDbLoaded,
  onOpenDetails,
  onOpenAdmin,
}) => {
  const t = I18N[lang];
  const [q, setQ] = useState('');
  const [dist, setDist] = useState<string>('all');
  const [stat, setStat] = useState<string>('all');
  const [ver, setVer] = useState<string>('all');
  const [sort, setSort] = useState<'new' | 'old'>('new');
  const [isListView, setIsListView] = useState(false);
  const [isLoading, setIsLoading] = useState(!isDbLoaded);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDbLoaded) {
      setIsLoading(false);
    }
  }, [isDbLoaded]);

  // Keyboard shortcut '/' to jump to search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const hasActiveFilters =
    q.trim() !== '' || dist !== 'all' || stat !== 'all' || ver !== 'all';

  const handleReset = () => {
    setQ('');
    setDist('all');
    setStat('all');
    setVer('all');
    setSort('new');
  };

  const filteredCases = useMemo(() => {
    const nz = (x: string) => x.toLowerCase().replace(/\b0+(\d)/g, '$1');
    const query = nz(q.trim());

    const result = cases.filter((c) => {
      const matchQuery =
        !query ||
        nz(c.titleEn || '').includes(query) ||
        nz(c.titleBn || '').includes(query) ||
        nz(t.case_t(c.n)).includes(query) ||
        nz(I18N.en.case_t(c.n)).includes(query) ||
        nz(c.id).includes(query);

      const matchDist = dist === 'all' || c.district === dist;
      const matchStat = stat === 'all' || c.status === stat;
      const matchVer = ver === 'all' || c.ver === ver;

      return matchQuery && matchDist && matchStat && matchVer;
    });

    // Cases with unknown dates always sort last
    result.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return sort === 'new'
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date);
    });

    return result;
  }, [cases, q, dist, stat, ver, sort, t]);

  const searchPlaceholder =
    lang === 'bn' ? 'মামলা নম্বর (যেমন: JC-BD-0001) বা নাম...' : 'Filter by case ID (e.g. JC-BD-0001) or title...';

  return (
    <section id="tracker" className="bg-white border-y border-[#E4DED7] relative" aria-labelledby="trT">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E4DED7]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8B1E2D] mb-1">
              <SlidersHorizontal size={14} />
              <span>{lang === 'bn' ? 'কেস রিপোজিটরি ও টাইম ট্র্যাকার' : 'CASE REPOSITORY & TIME TRACKER'}</span>
            </div>
            <h2 id="trT" className="font-serif font-bold text-3xl sm:text-4xl text-[#161211]">
              {t.tr_title}
            </h2>
            <p className="mt-1.5 text-sm text-[#6B635E]">
              {lang === 'bn'
                ? 'সরাসরি ডাটাবেস রেকর্ড অনুসন্ধান এবং আইনি পর্যায় অনুযায়ী ফিল্টার করুন।'
                : 'Filter and inspect published cases synchronized in real-time from the database.'}
            </p>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg border border-[#8B1E2D]/30 bg-[#8B1E2D]/5 text-xs font-bold text-[#8B1E2D] hover:bg-[#8B1E2D]/10 flex items-center gap-1.5 self-start md:self-auto transition-all shadow-2xs"
            >
              <RotateCcw size={13} />
              <span>{t.reset}</span>
            </button>
          )}
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-8 p-4 sm:p-5 bg-gradient-to-b from-[#FAF8F5] to-[#F5F2EC]/60 rounded-xl border border-[#E4DED7] shadow-xs">
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-12" role="search">
            {/* Search Input (Takes 5 columns on large screen) */}
            <div className="lg:col-span-5">
              <label className="lbl flex items-center justify-between" htmlFor="q">
                <span>{t.search}</span>
                <span className="text-[10px] text-[#6B635E] font-mono font-normal">Press '/'</span>
              </label>
              <div className="relative">
                <input
                  ref={searchInputRef}
                  id="q"
                  type="search"
                  className="field pl-9 pr-9 bg-white shadow-2xs"
                  placeholder={searchPlaceholder}
                  autoComplete="off"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B1E2D]"
                />
                {q && (
                  <button
                    type="button"
                    onClick={() => setQ('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B635E] hover:text-[#161211] p-1"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* District Filter (Takes 2 or 3 cols) */}
            <div className="lg:col-span-3">
              <label className="lbl" htmlFor="fDist">
                {t.f_district}
              </label>
              <div className="relative">
                <select
                  id="fDist"
                  className="field cursor-pointer bg-white shadow-2xs appearance-none pr-8"
                  value={dist}
                  onChange={(e) => setDist(e.target.value)}
                >
                  <option value="all">{t.all}</option>
                  {DISTRICTS.map((d: District) => (
                    <option key={d} value={d}>
                      {t.d_dist[d]}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B635E]" />
              </div>
            </div>

            {/* Legal Status Filter */}
            <div className="lg:col-span-2">
              <label className="lbl" htmlFor="fStat">
                {t.f_status}
              </label>
              <div className="relative">
                <select
                  id="fStat"
                  className="field cursor-pointer bg-white shadow-2xs appearance-none pr-8"
                  value={stat}
                  onChange={(e) => setStat(e.target.value)}
                >
                  <option value="all">{t.all}</option>
                  {STATUSES.map((s: CaseStatus) => (
                    <option key={s} value={s}>
                      {String((t as any)[`st_${s}`] || s)}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B635E]" />
              </div>
            </div>

            {/* Verification Status Filter */}
            <div className="lg:col-span-2">
              <label className="lbl" htmlFor="fVer">
                {t.f_verif}
              </label>
              <div className="relative">
                <select
                  id="fVer"
                  className="field cursor-pointer bg-white shadow-2xs appearance-none pr-8"
                  value={ver}
                  onChange={(e) => setVer(e.target.value)}
                >
                  <option value="all">{t.all}</option>
                  {VERIFS.map((v: VerificationStatus) => (
                    <option key={v} value={v}>
                      {String((t as any)[`vs_${v}`] || v)}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B635E]" />
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="mt-3 pt-3 border-t border-[#E4DED7] flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-[#6B635E] uppercase tracking-wider">
                {lang === 'bn' ? 'সক্রিয় ফিল্টার:' : 'Active Filters:'}
              </span>

              {q.trim() && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-[#E4DED7] text-xs text-[#161211] shadow-2xs font-medium">
                  <span>"{q.trim()}"</span>
                  <button onClick={() => setQ('')} className="hover:text-[#8B1E2D]">
                    <X size={12} />
                  </button>
                </span>
              )}

              {dist !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-[#E4DED7] text-xs text-[#161211] shadow-2xs font-medium">
                  <span>{t.d_dist[dist as District]}</span>
                  <button onClick={() => setDist('all')} className="hover:text-[#8B1E2D]">
                    <X size={12} />
                  </button>
                </span>
              )}

              {stat !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-[#E4DED7] text-xs text-[#161211] shadow-2xs font-medium">
                  <span>{String((t as any)[`st_${stat}`] || stat)}</span>
                  <button onClick={() => setStat('all')} className="hover:text-[#8B1E2D]">
                    <X size={12} />
                  </button>
                </span>
              )}

              {ver !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-[#E4DED7] text-xs text-[#161211] shadow-2xs font-medium">
                  <span>{String((t as any)[`vs_${ver}`] || ver)}</span>
                  <button onClick={() => setVer('all')} className="hover:text-[#8B1E2D]">
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Counter, Sorting & View-Mode Toggle Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#E4DED7] pb-3.5">
          <p id="count" className="text-sm font-semibold text-[#161211] flex items-center gap-2" aria-live="polite">
            <span className="w-2 h-2 rounded-full bg-[#8B1E2D]" />
            <span>
              {t.showing(
                formatNumber(filteredCases.length, lang),
                formatNumber(cases.length, lang)
              )}
            </span>
          </p>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                id="sort"
                className="text-xs font-semibold border border-[#CDC4B8] rounded-lg pl-3 pr-8 py-1.5 bg-white cursor-pointer shadow-2xs appearance-none hover:border-[#8B1E2D] transition-colors"
                value={sort}
                onChange={(e) => setSort(e.target.value as 'new' | 'old')}
                aria-label={t.sort}
              >
                <option value="new">{t.sort_new}</option>
                <option value="old">{t.sort_old}</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B635E]" />
            </div>

            {/* Layout Toggle Segment */}
            <div className="flex items-center bg-[#FAF8F5] p-0.5 rounded-lg border border-[#CDC4B8] shadow-2xs">
              <button
                type="button"
                onClick={() => setIsListView(false)}
                className={`p-1.5 rounded-md flex items-center gap-1 text-xs font-bold transition-all ${
                  !isListView
                    ? 'bg-white text-[#8B1E2D] shadow-2xs'
                    : 'text-[#6B635E] hover:text-[#161211]'
                }`}
                aria-label="Grid layout"
                title="Grid layout"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setIsListView(true)}
                className={`p-1.5 rounded-md flex items-center gap-1 text-xs font-bold transition-all ${
                  isListView
                    ? 'bg-white text-[#8B1E2D] shadow-2xs'
                    : 'text-[#6B635E] hover:text-[#161211]'
                }`}
                aria-label="List layout"
                title="List layout"
              >
                <ListIcon size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div id="loading" className="mt-12 text-center py-20 text-[#6B635E] space-y-3">
            <div className="w-8 h-8 border-3 border-[#8B1E2D] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-serif text-lg text-[#161211] font-semibold">{t.loading}</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="mt-8 border border-dashed border-[#CDC4B8] bg-[#FAF8F5] rounded-xl p-10 sm:p-14 text-center space-y-4 shadow-xs">
            <p className="font-serif font-bold text-2xl text-[#161211]">
              {lang === 'bn' ? 'ডাটাবেসে কোনো প্রকাশিত মামলা নেই' : 'No Published Cases in Database Yet'}
            </p>
            <p className="text-sm text-[#6B635E] max-w-lg mx-auto leading-relaxed">
              {lang === 'bn'
                ? 'ডাটাবেসে এখনো কোনো যাচাইকৃত মামলা প্রকাশিত হয়নি। অনুমোদিত অ্যাডমিন হিসেবে অ্যাডমিন প্যানেলে লগইন করে নতুন মামলা তৈরি করতে পারেন অথবা এক ক্লিকে প্রাথমিক টেমপ্লেট রেকর্ড ইনিশিয়ালাইজ করতে পারেন।'
                : 'No verified cases have been published to the live database yet. As an authorized administrator, open the Admin Dashboard to create a case or seed initial template records.'}
            </p>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="btn-primary !py-3 !px-7 text-sm inline-flex items-center gap-2"
              >
                <ShieldCheck size={16} />
                <span>{lang === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ডে যান' : 'Open Admin Dashboard'}</span>
              </button>
            )}
          </div>
        ) : filteredCases.length > 0 ? (
          <div
            id="cases"
            className={`mt-6 grid gap-6 ${
              isListView ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {filteredCases.map((c) => (
              <CaseCard
                key={c.id}
                c={c}
                lang={lang}
                now={now}
                onOpenDetails={onOpenDetails}
                isListView={isListView}
              />
            ))}
          </div>
        ) : (
          <div
            id="empty"
            className="mt-8 border border-dashed border-[#CDC4B8] bg-[#FAF8F5]/80 rounded-xl p-12 text-center shadow-xs"
          >
            <p className="font-serif font-bold text-2xl text-[#161211]">
              {t.empty_t}
            </p>
            <p className="mt-2 text-[#6B635E] text-sm max-w-md mx-auto leading-relaxed">
              {t.empty_d}
            </p>
            <button
              id="resetBtn"
              onClick={handleReset}
              className="btn-primary mt-6 inline-flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <RotateCcw size={16} />
              <span>{t.reset}</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
