import React, { useMemo } from 'react';
import { Language } from '../types';
import { I18N, formatNumber } from '../data/i18n';
import { getTimeParts } from '../utils/time';

interface LiveTimerProps {
  isoDate: string;
  now: number;
  small?: boolean;
  lang: Language;
}

export const LiveTimer: React.FC<LiveTimerProps> = ({
  isoDate,
  now,
  small = false,
  lang,
}) => {
  const parts = useMemo(() => getTimeParts(isoDate, now), [isoDate, now]);
  const t = I18N[lang];

  const formatUnitVal = (v: number, unit: 'd' | 'h' | 'm' | 's') => {
    const rawStr =
      unit === 'h' || unit === 'm' || unit === 's'
        ? String(v).padStart(2, '0')
        : String(v);
    return formatNumber(rawStr, lang);
  };

  const dayStr = formatNumber(parts.d, lang);

  // ----------------------------------------------------
  // Compact / Card Clock Display
  // ----------------------------------------------------
  if (small) {
    const secondProgress = (parts.s / 60) * 100;

    return (
      <div className="w-full">
        <div
          className="grid grid-cols-4 gap-1.5 p-1.5 bg-gradient-to-b from-[#F5F2EC] to-[#FAF8F5] rounded-lg border border-[#E4DED7] text-center font-mono relative overflow-hidden shadow-2xs"
          aria-hidden="true"
        >
          {/* Top Micro Hairline Progress Bar */}
          <div
            className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-[#8B1E2D] to-[#b82d40] transition-all duration-1000 ease-linear opacity-80"
            style={{ width: `${secondProgress}%` }}
          />

          {/* Days */}
          <div className="dial-unit-card py-1.5 px-1 relative overflow-hidden">
            <span className="block font-serif font-bold text-sm sm:text-base text-[#161211] tabular-nums leading-tight">
              {formatUnitVal(parts.d, 'd')}
            </span>
            <span className="block text-[9px] text-[#6B635E] font-sans font-semibold uppercase tracking-wider mt-0.5">
              {t.u_d}
            </span>
          </div>

          {/* Hours */}
          <div className="dial-unit-card py-1.5 px-1 relative overflow-hidden">
            <span className="block font-serif font-bold text-sm sm:text-base text-[#161211] tabular-nums leading-tight">
              {formatUnitVal(parts.h, 'h')}
            </span>
            <span className="block text-[9px] text-[#6B635E] font-sans font-semibold uppercase tracking-wider mt-0.5">
              {t.u_h}
            </span>
          </div>

          {/* Minutes */}
          <div className="dial-unit-card py-1.5 px-1 relative overflow-hidden">
            <span className="block font-serif font-bold text-sm sm:text-base text-[#161211] tabular-nums leading-tight">
              {formatUnitVal(parts.m, 'm')}
            </span>
            <span className="block text-[9px] text-[#6B635E] font-sans font-semibold uppercase tracking-wider mt-0.5">
              {t.u_m}
            </span>
          </div>

          {/* Seconds (Pulsing live chronometer unit) */}
          <div className="dial-unit-card py-1.5 px-1 border-[#8B1E2D]/40 bg-gradient-to-b from-[#FFF5F6] to-[#FFF0F2] relative overflow-hidden group">
            {/* Pulsing sub-second radar ring */}
            <span
              className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#8B1E2D] transition-transform duration-300"
              style={{
                transform: `scale(${parts.s % 2 === 0 ? 1.35 : 0.85})`,
                opacity: parts.s % 2 === 0 ? 1 : 0.4,
              }}
            />
            <span className="block font-serif font-bold text-sm sm:text-base text-[#8B1E2D] tabular-nums leading-tight">
              {formatUnitVal(parts.s, 's')}
            </span>
            <span className="block text-[9px] text-[#8B1E2D] font-sans font-bold uppercase tracking-wider mt-0.5">
              {t.u_s}
            </span>
          </div>
        </div>
        <span className="sr-only">{t.timerLabel(dayStr)}</span>
      </div>
    );
  }

  // ----------------------------------------------------
  // Master / Hero / Modal Precision Chronometer Display
  // ----------------------------------------------------
  const secondProgress = (parts.s / 60) * 100;

  return (
    <div className="space-y-3.5">
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center"
        aria-hidden="true"
      >
        {/* Days Unit Card */}
        <div className="dial-unit-card p-3 sm:p-4 rounded-xl border border-[#E4DED7] relative group hover:border-[#8B1E2D]/40 transition-all duration-200">
          <div className="dial-split-crease" />
          <div className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#161211] tabular-nums tracking-tight leading-none drop-shadow-2xs">
            {formatUnitVal(parts.d, 'd')}
          </div>
          <div className="mt-2.5 text-[11px] font-sans font-bold uppercase tracking-widest text-[#6B635E]">
            {t.u_d}
          </div>
        </div>

        {/* Hours Unit Card */}
        <div className="dial-unit-card p-3 sm:p-4 rounded-xl border border-[#E4DED7] relative group hover:border-[#8B1E2D]/40 transition-all duration-200">
          <div className="dial-split-crease" />
          <div className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#161211] tabular-nums tracking-tight leading-none drop-shadow-2xs">
            {formatUnitVal(parts.h, 'h')}
          </div>
          <div className="mt-2.5 text-[11px] font-sans font-bold uppercase tracking-widest text-[#6B635E]">
            {t.u_h}
          </div>
        </div>

        {/* Minutes Unit Card */}
        <div className="dial-unit-card p-3 sm:p-4 rounded-xl border border-[#E4DED7] relative group hover:border-[#8B1E2D]/40 transition-all duration-200">
          <div className="dial-split-crease" />
          <div className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#161211] tabular-nums tracking-tight leading-none drop-shadow-2xs">
            {formatUnitVal(parts.m, 'm')}
          </div>
          <div className="mt-2.5 text-[11px] font-sans font-bold uppercase tracking-widest text-[#6B635E]">
            {t.u_m}
          </div>
        </div>

        {/* Seconds Unit Card (Live Chronograph Beat) */}
        <div className="dial-unit-card p-3 sm:p-4 rounded-xl border border-[#8B1E2D]/40 bg-gradient-to-b from-[#FFFDFD] via-[#FFF8F8] to-[#FFF0F2] relative overflow-hidden group shadow-[0_4px_16px_-4px_rgba(139,30,45,0.15)]">
          <div className="dial-split-crease" />

          {/* Smooth dynamic progress sweep along bottom */}
          <div
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#8B1E2D] to-[#C29B38] transition-all duration-1000 ease-linear"
            style={{ width: `${secondProgress}%` }}
          />

          <div className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#8B1E2D] tabular-nums tracking-tight leading-none drop-shadow-2xs relative z-10">
            {formatUnitVal(parts.s, 's')}
          </div>
          <div className="mt-2.5 text-[11px] font-sans font-bold uppercase tracking-widest text-[#8B1E2D] flex items-center justify-center gap-1.5 relative z-10">
            <span
              className="w-2 h-2 rounded-full bg-[#8B1E2D] inline-block transition-transform duration-200"
              style={{
                transform: `scale(${parts.s % 2 === 0 ? 1.4 : 0.8})`,
                boxShadow: parts.s % 2 === 0 ? '0 0 8px rgba(139, 30, 45, 0.6)' : 'none',
              }}
            />
            <span>{t.u_s}</span>
          </div>
        </div>
      </div>

      <span className="sr-only">{t.timerLabel(dayStr)}</span>
    </div>
  );
};
