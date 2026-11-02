import React, { useState, useEffect, useMemo } from 'react';
import { CaseItem, Language } from '../types';
import { I18N, formatDate, formatNumber } from '../data/i18n';
import { HERO_DATE } from '../data/cases';
import { LiveTimer } from './LiveTimer';
import { getTimeParts } from '../utils/time';
import {
  ArrowRight,
  Compass,
  Volume2,
  VolumeX,
  ArrowUpRight,
  MapPin,
  Calendar,
} from 'lucide-react';
import {
  setClockSoundEnabled,
  playChronometerTick,
} from '../utils/audioTick';

interface HeroProps {
  lang: Language;
  now: number;
  cases?: CaseItem[];
  onOpenDetails?: (c: CaseItem) => void;
}

export const Hero: React.FC<HeroProps> = ({
  lang,
  now,
  cases = [],
  onOpenDetails,
}) => {
  const t = I18N[lang];
  const [viewMode, setViewMode] = useState<'hms' | 'totalDays'>('hms');
  const [soundOn, setSoundOn] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('ref');

  // Top 3 exact-date cases for interactive switching on the clock
  const exactCases = useMemo(
    () => cases.filter((c) => c.prec === 'day' && c.date).slice(0, 3),
    [cases]
  );

  const activeCase = useMemo(
    () => exactCases.find((c) => c.id === selectedTargetId) || null,
    [exactCases, selectedTargetId]
  );

  const activeIsoDate = activeCase?.date
    ? `${activeCase.date}T00:00:00`
    : HERO_DATE;

  const parts = getTimeParts(activeIsoDate, now);
  const totalHours = parts.d * 24 + parts.h;

  // Play tick if sound is enabled
  useEffect(() => {
    if (soundOn) {
      playChronometerTick();
    }
  }, [parts.s, soundOn]);

  const toggleSound = () => {
    const nextState = !soundOn;
    setSoundOn(nextState);
    setClockSoundEnabled(nextState);
  };

  // Format current Dhaka time (GMT+6)
  const dhakaTimeStr = new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-US', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(new Date(now));

  // SVG progress circle calculation (radius = 14, circumference = ~87.96)
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (parts.s / 60) * circumference;

  return (
    <section
      id="home"
      className="relative max-w-6xl mx-auto px-4 pt-8 pb-14 md:pt-14 md:pb-20 grid lg:grid-cols-12 gap-8 lg:gap-10 items-center"
    >
      {/* Left Column: Simple Editorial Headline & Actions */}
      <div className="lg:col-span-6 xl:col-span-7 space-y-5 min-w-0">
        {/* Clean Live Dhaka Time Pill */}
        <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 bg-white rounded-full border border-[#E4DED7] shadow-2xs text-xs text-[#6B635E]">
          <span className="h-2 w-2 rounded-full bg-[#8B1E2D] shrink-0" />
          <span className="font-bold text-[#8B1E2D] tracking-wide">
            {lang === 'bn' ? 'লাইভ জাস্টিস ক্লক' : 'LIVE JUSTICE CLOCK'}
          </span>
          <span className="text-[#E4DED7]" aria-hidden="true">|</span>
          <span className="font-mono text-[11px] text-[#26211F] font-semibold tabular-nums">
            {lang === 'bn' ? 'ঢাকা' : 'Dhaka'} {dhakaTimeStr}
          </span>
        </div>

        {/* Main Serif Headline */}
        <h1 className="font-serif font-bold text-3xl sm:text-5xl lg:text-[3.25rem] text-[#161211] leading-[1.14] tracking-tight text-balance">
          {t.h1}
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-[#6B635E] font-serif leading-relaxed text-balance">
          {t.sub}
        </p>

        {/* Intro explanatory paragraph */}
        <p className="max-w-xl text-sm sm:text-base text-[#26211F]/80 leading-relaxed font-sans">
          {t.intro}
        </p>

        {/* Primary CTA Buttons */}
        <div className="pt-1 flex flex-wrap items-center gap-3.5">
          <a
            href="#tracker"
            className="group btn-primary !py-3 !px-6 text-sm font-semibold flex items-center gap-2"
          >
            <span>{t.btn_explore}</span>
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </a>

          <a
            href="#about"
            className="group btn-ghost !py-3 !px-5 text-sm font-semibold flex items-center gap-2"
          >
            <Compass size={16} />
            <span>{t.btn_mission}</span>
          </a>
        </div>
      </div>

      {/* Right Column: Stable, Simple & Interactive Magic Clock */}
      <div className="lg:col-span-6 xl:col-span-5 w-full min-w-0">
        <div className="clock-wrap">
          <div className="clock-card">
            {/* 1. Clock Header: Self-contained SVG Chronometer Ring + Controls */}
            <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-[#E4DED7]">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Contained 34x34 SVG Analog Second Ring */}
                <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
                  <svg
                    className="w-9 h-9 -rotate-90"
                    viewBox="0 0 36 36"
                    aria-hidden="true"
                  >
                    <circle
                      cx="18"
                      cy="18"
                      r={radius}
                      fill="none"
                      stroke="#EFEAE2"
                      strokeWidth="3"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r={radius}
                      fill="none"
                      stroke="#8B1E2D"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      className="transition-[stroke-dashoffset] duration-300 ease-out"
                    />
                  </svg>
                  <span className="absolute font-mono text-[10px] font-bold text-[#8B1E2D] tabular-nums">
                    {formatNumber(String(parts.s).padStart(2, '0'), lang)}
                  </span>
                </div>

                <div className="min-w-0">
                  <span className="block text-xs font-bold text-[#161211] truncate">
                    {activeCase
                      ? lang === 'bn'
                        ? activeCase.titleBn || t.case_t(activeCase.n)
                        : activeCase.titleEn || t.case_t(activeCase.n)
                      : lang === 'bn'
                      ? 'অতিবাহিত সময়ের ঘড়ি'
                      : 'Elapsed Time Clock'}
                  </span>
                  <span className="block text-[11px] text-[#6B635E] truncate">
                    {activeCase
                      ? `${t.d_dist[activeCase.district]} · ${
                          t[`st_${activeCase.status}` as keyof typeof t]
                        }`
                      : lang === 'bn'
                      ? '১ জানুয়ারি ২০২৪ থেকে গণনা'
                      : 'Counting since 1 Jan 2024'}
                  </span>
                </div>
              </div>

              {/* Sound & Mode Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={toggleSound}
                  className={`p-2 rounded-lg border text-xs flex items-center transition-colors ${
                    soundOn
                      ? 'bg-[#8B1E2D] text-white border-[#8B1E2D]'
                      : 'bg-[#FAF8F5] text-[#6B635E] border-[#E4DED7] hover:text-[#161211]'
                  }`}
                  title={soundOn ? 'Mute tick sound' : 'Play tick sound'}
                  aria-label={soundOn ? 'Mute sound' : 'Enable sound'}
                >
                  {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
                </button>

                <div className="flex items-center bg-[#FAF8F5] p-0.5 rounded-lg border border-[#E4DED7] text-[11px]">
                  <button
                    type="button"
                    onClick={() => setViewMode('hms')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                      viewMode === 'hms'
                        ? 'bg-white text-[#8B1E2D] shadow-2xs'
                        : 'text-[#6B635E] hover:text-[#161211]'
                    }`}
                  >
                    {lang === 'bn' ? 'পূর্ণ ঘড়ি' : 'Clock'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('totalDays')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                      viewMode === 'totalDays'
                        ? 'bg-white text-[#8B1E2D] shadow-2xs'
                        : 'text-[#6B635E] hover:text-[#161211]'
                    }`}
                  >
                    {lang === 'bn' ? 'মোট দিন' : 'Days'}
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Interactive Case Switcher Pills */}
            {exactCases.length > 0 && (
              <div className="pt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setSelectedTargetId('ref')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors shrink-0 ${
                    selectedTargetId === 'ref'
                      ? 'bg-[#161211] text-white border-[#161211]'
                      : 'bg-[#FAF8F5] text-[#6B635E] border-[#E4DED7] hover:border-[#161211]/30 hover:text-[#161211]'
                  }`}
                >
                  {lang === 'bn' ? 'মূল ঘড়ি' : 'Main Clock'}
                </button>
                {exactCases.map((c) => {
                  const isSelected = selectedTargetId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedTargetId(c.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors shrink-0 ${
                        isSelected
                          ? 'bg-[#8B1E2D] text-white border-[#8B1E2D]'
                          : 'bg-[#FAF8F5] text-[#6B635E] border-[#E4DED7] hover:border-[#8B1E2D]/40 hover:text-[#161211]'
                      }`}
                    >
                      {lang === 'bn'
                        ? `কেস #${formatNumber(c.n, 'bn')}`
                        : `Case #${String(c.n).padStart(2, '0')}`}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 3. Main Clock Display Area */}
            <div className="my-4">
              {viewMode === 'hms' ? (
                <div role="timer" aria-live="off">
                  <LiveTimer
                    isoDate={activeIsoDate}
                    now={now}
                    lang={lang}
                    small={false}
                  />
                </div>
              ) : (
                <div className="p-5 bg-[#FAF8F5] rounded-xl border border-[#E4DED7] text-center space-y-2">
                  <div className="text-4xl sm:text-5xl font-serif font-bold text-[#8B1E2D] tabular-nums tracking-tight leading-none">
                    {formatNumber(parts.d, lang)}
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#6B635E]">
                    {lang === 'bn' ? 'মোট দিন অতিক্রান্ত' : 'Total Days Elapsed'}
                  </p>
                  <div className="pt-1 flex flex-wrap items-center justify-center gap-2 text-xs text-[#6B635E] tabular-nums">
                    <span className="px-2.5 py-0.5 bg-white rounded-md border border-[#E4DED7] font-medium">
                      {formatNumber(totalHours.toLocaleString('en-US'), lang)}{' '}
                      {lang === 'bn' ? 'মোট ঘণ্টা' : 'total hours'}
                    </span>
                    <span className="px-2.5 py-0.5 bg-[#FFF6F7] text-[#8B1E2D] rounded-md border border-[#8B1E2D]/25 font-semibold">
                      +{formatNumber(parts.m, lang)}m {formatNumber(parts.s, lang)}s
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Clean Bottom Info & Interactive Action Bar */}
            <div className="pt-3.5 border-t border-[#E4DED7] flex items-center justify-between gap-3 text-xs">
              {activeCase ? (
                <>
                  <div className="flex items-center gap-3 text-[#6B635E] min-w-0 truncate">
                    <span className="inline-flex items-center gap-1 truncate">
                      <Calendar size={13} className="text-[#8B1E2D] shrink-0" />
                      <span className="truncate">
                        {formatDate(activeCase.date, lang, t.unknown)}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1 truncate">
                      <MapPin size={13} className="text-[#6B635E] shrink-0" />
                      <span className="truncate">
                        {t.d_dist[activeCase.district]}
                      </span>
                    </span>
                  </div>

                  {onOpenDetails && (
                    <button
                      type="button"
                      onClick={() => onOpenDetails(activeCase)}
                      className="inline-flex items-center gap-1 font-bold text-[#8B1E2D] hover:underline shrink-0"
                    >
                      <span>{lang === 'bn' ? 'বিস্তারিত' : 'Details'}</span>
                      <ArrowUpRight size={14} />
                    </button>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between w-full gap-2 text-[11px] text-[#6B635E]">
                  <span className="truncate">{t.clock_note}</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E4DED7] text-[#8B1E2D] font-semibold shrink-0">
                    {t.demo_tag}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

