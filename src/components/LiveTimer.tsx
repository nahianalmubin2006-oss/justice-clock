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
    return (
      <div className="w-full">
        <div
          className="grid grid-cols-4 gap-1.5 p-1.5 bg-[#FAF8F5] rounded-xl border border-[#E4DED7] text-center"
          aria-hidden="true"
        >
          {/* Days */}
          <div className="bg-white rounded-lg border border-[#E4DED7]/80 py-2 px-1 min-w-0">
            <span className="block font-serif font-bold text-sm sm:text-base text-[#161211] tabular-nums leading-tight truncate">
              {formatUnitVal(parts.d, 'd')}
            </span>
            <span className="block text-[9px] text-[#6B635E] font-sans font-semibold uppercase tracking-wider mt-0.5 truncate">
              {t.u_d}
            </span>
          </div>

          {/* Hours */}
          <div className="bg-white rounded-lg border border-[#E4DED7]/80 py-2 px-1 min-w-0">
            <span className="block font-serif font-bold text-sm sm:text-base text-[#161211] tabular-nums leading-tight">
              {formatUnitVal(parts.h, 'h')}
            </span>
            <span className="block text-[9px] text-[#6B635E] font-sans font-semibold uppercase tracking-wider mt-0.5 truncate">
              {t.u_h}
            </span>
          </div>

          {/* Minutes */}
          <div className="bg-white rounded-lg border border-[#E4DED7]/80 py-2 px-1 min-w-0">
            <span className="block font-serif font-bold text-sm sm:text-base text-[#161211] tabular-nums leading-tight">
              {formatUnitVal(parts.m, 'm')}
            </span>
            <span className="block text-[9px] text-[#6B635E] font-sans font-semibold uppercase tracking-wider mt-0.5 truncate">
              {t.u_m}
            </span>
          </div>

          {/* Seconds */}
          <div className="bg-[#FFF6F7] rounded-lg border border-[#8B1E2D]/25 py-2 px-1 min-w-0">
            <span className="block font-serif font-bold text-sm sm:text-base text-[#8B1E2D] tabular-nums leading-tight">
              {formatUnitVal(parts.s, 's')}
            </span>
            <span className="block text-[9px] text-[#8B1E2D] font-sans font-bold uppercase tracking-wider mt-0.5 truncate">
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
  return (
    <div className="w-full">
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center w-full"
        aria-hidden="true"
      >
        {/* Days Unit Card */}
        <div className="dial-unit-card py-4 px-2 flex flex-col items-center justify-center min-w-0">
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#161211] tabular-nums tracking-tight leading-none truncate max-w-full">
            {formatUnitVal(parts.d, 'd')}
          </div>
          <div className="mt-2 text-[10px] font-sans font-bold uppercase tracking-widest text-[#6B635E] truncate max-w-full">
            {t.u_d}
          </div>
        </div>

        {/* Hours Unit Card */}
        <div className="dial-unit-card py-4 px-2 flex flex-col items-center justify-center min-w-0">
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#161211] tabular-nums tracking-tight leading-none">
            {formatUnitVal(parts.h, 'h')}
          </div>
          <div className="mt-2 text-[10px] font-sans font-bold uppercase tracking-widest text-[#6B635E] truncate max-w-full">
            {t.u_h}
          </div>
        </div>

        {/* Minutes Unit Card */}
        <div className="dial-unit-card py-4 px-2 flex flex-col items-center justify-center min-w-0">
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#161211] tabular-nums tracking-tight leading-none">
            {formatUnitVal(parts.m, 'm')}
          </div>
          <div className="mt-2 text-[10px] font-sans font-bold uppercase tracking-widest text-[#6B635E] truncate max-w-full">
            {t.u_m}
          </div>
        </div>

        {/* Seconds Unit Card */}
        <div className="dial-unit-card py-4 px-2 flex flex-col items-center justify-center min-w-0 !bg-[#FFF6F7] !border-[#8B1E2D]/30">
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#8B1E2D] tabular-nums tracking-tight leading-none">
            {formatUnitVal(parts.s, 's')}
          </div>
          <div className="mt-2 text-[10px] font-sans font-bold uppercase tracking-widest text-[#8B1E2D] truncate max-w-full">
            {t.u_s}
          </div>
        </div>
      </div>

      <span className="sr-only">{t.timerLabel(dayStr)}</span>
    </div>
  );
};

