import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { I18N, formatNumber } from '../data/i18n';
import { HERO_DATE } from '../data/cases';
import { LiveTimer } from './LiveTimer';
import { getTimeParts } from '../utils/time';
import {
  ArrowRight,
  Compass,
  Clock,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
} from 'lucide-react';
import {
  isClockSoundEnabled,
  setClockSoundEnabled,
  playChronometerTick,
} from '../utils/audioTick';

interface HeroProps {
  lang: Language;
  now: number;
}

export const Hero: React.FC<HeroProps> = ({ lang, now }) => {
  const t = I18N[lang];
  const [viewMode, setViewMode] = useState<'hms' | 'totalDays'>('hms');
  const [soundOn, setSoundOn] = useState(false);
  const parts = getTimeParts(HERO_DATE, now);

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

  // Second angle (0 to 360 deg) for analog perimeter tick
  const secondAngle = (parts.s / 60) * 360;

  // Format current Dhaka time (GMT+6)
  const dhakaTimeStr = new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-US', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(new Date(now));

  return (
    <section
      id="home"
      className="relative max-w-6xl mx-auto px-4 pt-8 pb-16 md:pt-14 md:pb-24 grid lg:grid-cols-12 gap-10 lg:gap-14 items-center"
    >
      {/* Background radial atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-radial from-[#8B1E2D]/[0.035] via-transparent to-transparent pointer-events-none rounded-full blur-2xl" />

      {/* Left Column: Editorial Headline & Actions */}
      <div className="lg:col-span-7 space-y-6 relative z-10">
        {/* Live Status Pill with UTC+6 Badge */}
        <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 bg-white/90 backdrop-blur-md rounded-full border border-[#E4DED7] shadow-xs text-xs text-[#6B635E]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8B1E2D] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8B1E2D]" />
          </span>
          <span className="font-bold text-[#8B1E2D] tracking-wide">
            {lang === 'bn' ? 'সরাসরি ক্রোনোমিটার' : 'FORENSIC CHRONOMETER'}
          </span>
          <span className="text-[#E4DED7]" aria-hidden="true">|</span>
          <span className="font-mono text-[11px] text-[#26211F] font-semibold">
            Dhaka {dhakaTimeStr}
          </span>
        </div>

        {/* Main Serif Headline */}
        <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-[3.5rem] text-[#161211] leading-[1.12] tracking-tight text-balance">
          {t.h1}
        </h1>

        {/* Subtitle */}
        <p className="text-xl sm:text-2xl text-[#6B635E] font-serif leading-relaxed text-balance">
          {t.sub}
        </p>

        {/* Intro explanatory paragraph */}
        <p className="max-w-xl text-base text-[#26211F]/85 leading-relaxed font-sans">
          {t.intro}
        </p>

        {/* Dynamic Tactile CTA Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-4">
          <a
            href="#tracker"
            className="group btn-primary !py-3.5 !px-7 text-sm font-semibold flex items-center gap-2.5 shadow-[0_6px_20px_-4px_rgba(139,30,45,0.4)] hover:shadow-[0_10px_28px_-4px_rgba(139,30,45,0.5)] transition-all"
          >
            <span>{t.btn_explore}</span>
            <ArrowRight
              size={17}
              className="transition-transform duration-200 group-hover:translate-x-1.5"
            />
          </a>

          <a
            href="#about"
            className="group btn-ghost !py-3.5 !px-6 text-sm font-semibold flex items-center gap-2 hover:bg-[#26211F] hover:text-[#FAF8F5] transition-all"
          >
            <Compass size={17} className="transition-transform duration-200 group-hover:rotate-45" />
            <span>{t.btn_mission}</span>
          </a>
        </div>

        {/* Quick Highlights Bar */}
        <div className="pt-3 border-t border-[#E4DED7]/80 flex flex-wrap items-center gap-6 text-xs text-[#6B635E]">
          <div className="flex items-center gap-2">
            <Radio size={14} className="text-[#8B1E2D]" />
            <span>{lang === 'bn' ? 'স্বয়ংক্রিয় সংবাদ মনিটরিং' : 'Continuous News Discovery'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#C29B38]" />
            <span>{lang === 'bn' ? 'ফায়ারস্টোর লাইভ সিঙ্ক' : 'Real-time Firestore Sync'}</span>
          </div>
        </div>
      </div>

      {/* Right Column: Dynamic Master Horological Clockwork Centerpiece */}
      <div className="lg:col-span-5 relative z-10">
        <div className="clock-wrap py-3">
          <div className="clock-card relative overflow-hidden bg-white/95 backdrop-blur-md border border-[#CDC4B8] border-t-4 border-t-[#8B1E2D]">
            {/* Top Dial Header & Switcher */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E4DED7]">
              <div className="flex items-center gap-2.5">
                <span className="live" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#161211]">
                  {t.clock_label}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Subtle Mechanical Tick Sound Toggle */}
                <button
                  type="button"
                  onClick={toggleSound}
                  className={`p-1.5 rounded-md border text-xs flex items-center transition-all ${
                    soundOn
                      ? 'bg-[#8B1E2D]/10 text-[#8B1E2D] border-[#8B1E2D]/30 shadow-2xs'
                      : 'bg-[#FAF8F5] text-[#6B635E] border-[#E4DED7] hover:text-[#26211F]'
                  }`}
                  title={soundOn ? 'Mute chronometer tick' : 'Enable chronometer tick'}
                  aria-label={soundOn ? 'Mute sound' : 'Enable sound'}
                >
                  {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
                </button>

                {/* Dial Format Toggle */}
                <div className="flex items-center bg-[#FAF8F5] p-0.5 rounded-md border border-[#E4DED7] text-[11px]">
                  <button
                    type="button"
                    onClick={() => setViewMode('hms')}
                    className={`px-2.5 py-1 rounded font-semibold transition-all ${
                      viewMode === 'hms'
                        ? 'bg-white text-[#8B1E2D] shadow-2xs'
                        : 'text-[#6B635E] hover:text-[#26211F]'
                    }`}
                  >
                    D:H:M:S
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('totalDays')}
                    className={`px-2.5 py-1 rounded font-semibold transition-all ${
                      viewMode === 'totalDays'
                        ? 'bg-white text-[#8B1E2D] shadow-2xs'
                        : 'text-[#6B635E] hover:text-[#26211F]'
                    }`}
                  >
                    {lang === 'bn' ? 'মোট দিন' : 'Total Days'}
                  </button>
                </div>
              </div>
            </div>

            {/* Circular Perimeter Second Tracker Dial Visual */}
            <div className="my-5 relative">
              {viewMode === 'hms' ? (
                <div role="timer" aria-live="off">
                  <LiveTimer isoDate={HERO_DATE} now={now} lang={lang} small={false} />
                </div>
              ) : (
                <div className="p-6 bg-gradient-to-b from-white via-[#FAF8F5] to-[#F5F2EC] rounded-xl border border-[#E4DED7] text-center space-y-2 relative overflow-hidden shadow-inner">
                  {/* Glowing background halo */}
                  <div className="absolute inset-0 bg-radial from-[#8B1E2D]/5 to-transparent pointer-events-none" />

                  <div className="text-5xl sm:text-6xl font-serif font-bold text-[#8B1E2D] tabular-nums tracking-tight drop-shadow-xs">
                    {formatNumber(parts.d, lang)}
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#6B635E]">
                    {lang === 'bn' ? 'দিন অতিক্রান্ত হয়েছে' : 'Total Days Elapsed'}
                  </p>
                  <div className="pt-2 text-xs font-mono font-semibold text-[#6B635E] flex items-center justify-center gap-2">
                    <span className="px-2 py-0.5 bg-white rounded border border-[#E4DED7] shadow-2xs">
                      +{formatNumber(parts.h, lang)}h
                    </span>
                    <span>:</span>
                    <span className="px-2 py-0.5 bg-white rounded border border-[#E4DED7] shadow-2xs">
                      {formatNumber(parts.m, lang)}m
                    </span>
                    <span>:</span>
                    <span className="px-2 py-0.5 bg-[#8B1E2D]/10 text-[#8B1E2D] rounded border border-[#8B1E2D]/30 shadow-2xs">
                      {formatNumber(parts.s, lang)}s
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Dial Bottom Status Bar */}
            <div className="pt-4 border-t border-[#E4DED7] flex items-start gap-3">
              <div className="p-1.5 rounded-md bg-[#8B1E2D]/10 text-[#8B1E2D] shrink-0 mt-0.5">
                <Clock size={16} />
              </div>
              <div className="text-xs leading-relaxed">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#8B1E2D] uppercase tracking-wider text-[11px]">
                    {t.demo_label}
                  </span>
                  <span className="text-[#E4DED7]">·</span>
                  <span className="font-mono text-[10px] text-[#6B635E]">
                    Ref: 2025-03-14T00:00:00
                  </span>
                </div>
                <span className="text-[#6B635E] block mt-1">
                  {t.clock_note}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
