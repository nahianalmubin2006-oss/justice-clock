import React, { useState } from 'react';
import {
  CourtWiseCaseload,
  DivisionWiseCaseload,
  YearlyTrend,
  Language,
  District,
} from '../types';
import { I18N, formatNumber } from '../data/i18n';
import {
  OFFICIAL_COURT_CASELOADS,
  OFFICIAL_DIVISION_CASELOADS,
  OFFICIAL_YEARLY_TRENDS,
} from '../server/judicialStatsService';
import {
  BarChart3,
  MapPin,
  TrendingUp,
  Scale,
  Building,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info,
} from 'lucide-react';

interface JudicialVisualizationsProps {
  lang: Language;
}

export const JudicialVisualizations: React.FC<JudicialVisualizationsProps> = ({ lang }) => {
  const t = I18N[lang];
  const [activeTab, setActiveTab] = useState<'courts' | 'divisions' | 'trends'>('courts');
  const [selectedDivision, setSelectedDivision] = useState<District>('dhaka');

  const selectedDivData =
    OFFICIAL_DIVISION_CASELOADS.find((d) => d.division === selectedDivision) ||
    OFFICIAL_DIVISION_CASELOADS[0];

  return (
    <section className="bg-[#FAF8F5] border-b border-[#E4DED7] py-14 sm:py-18 relative">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E4DED7]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8B1E2D] mb-1">
              <BarChart3 size={14} />
              <span>{lang === 'bn' ? 'বিচারিক বিশ্লেষণ ও পরিসংখ্যান' : 'JUDICIAL BENCHMARKS & ANALYTICS'}</span>
            </div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#161211]">
              {lang === 'bn'
                ? 'আদালত ও বিভাগ ভিত্তিক মামলার চিত্র'
                : 'Court-Wise & Regional Judicial Analytics'}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#6B635E]">
              {lang === 'bn'
                ? 'সুপ্রীম কোর্ট ও অধস্তন আদালতের তুলনামূলক পরিসংখ্যান এবং আঞ্চলিক জটের বিভাজন।'
                : 'Verifiable breakdown across judicial tiers, regional divisions, and historical clearance rates.'}
            </p>
          </div>

          {/* Visualization Tab Switcher */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-[#E4DED7] shadow-2xs self-start md:self-auto text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('courts')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'courts'
                  ? 'bg-[#8B1E2D] text-white shadow-xs font-bold'
                  : 'text-[#6B635E] hover:text-[#161211]'
              }`}
            >
              {lang === 'bn' ? 'আদালত কাঠামো' : 'Court Hierarchy'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('divisions')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'divisions'
                  ? 'bg-[#8B1E2D] text-white shadow-xs font-bold'
                  : 'text-[#6B635E] hover:text-[#161211]'
              }`}
            >
              {lang === 'bn' ? '৮ প্রশাসনিক বিভাগ' : '8 Divisions'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('trends')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'trends'
                  ? 'bg-[#8B1E2D] text-white shadow-xs font-bold'
                  : 'text-[#6B635E] hover:text-[#161211]'
              }`}
            >
              {lang === 'bn' ? 'বার্ষিক প্রবণতা' : 'Historical Trends'}
            </button>
          </div>
        </div>

        {/* TAB 1: COURT HIERARCHY & CLEARANCE RATES */}
        {activeTab === 'courts' && (
          <div className="mt-8 space-y-6">
            <div className="grid md:grid-cols-3 gap-5">
              {OFFICIAL_COURT_CASELOADS.filter((c) => c.courtId !== 'supreme_court_all').map((court) => {
                const hasClearance = court.clearanceRate !== null;
                return (
                  <div
                    key={court.courtId}
                    className="bg-white p-5 sm:p-6 rounded-xl border border-[#E4DED7] shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-[#E4DED7]">
                        <span className="font-mono text-[10px] font-bold text-[#8B1E2D] uppercase tracking-wider">
                          {court.reportingPeriod}
                        </span>
                        {hasClearance && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            CR: {court.clearanceRate}%
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif font-bold text-lg text-[#161211] mt-3">
                        {lang === 'bn' ? court.nameBn : court.nameEn}
                      </h3>

                      <div className="mt-4 p-3 bg-[#FAF8F5] rounded-lg border border-[#E4DED7] space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#6B635E]">{lang === 'bn' ? 'অনিষ্পন্ন মামলা:' : 'Pending Backlog:'}</span>
                          <strong className="text-[#161211] font-mono text-sm">
                            {formatNumber(court.pending, lang)}
                          </strong>
                        </div>
                        {court.filings !== null && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#6B635E]">{lang === 'bn' ? 'নতুন ফাইলিং:' : 'New Filings:'}</span>
                            <span className="text-[#161211] font-mono font-medium">
                              {formatNumber(court.filings, lang)}
                            </span>
                          </div>
                        )}
                        {court.disposals !== null && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#6B635E]">{lang === 'bn' ? 'নিষ্পত্তিকৃত:' : 'Disposals:'}</span>
                            <span className="text-emerald-700 font-mono font-bold">
                              {formatNumber(court.disposals, lang)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Civil vs Criminal Breakdown */}
                      {(court.civilPending || court.criminalPending) && (
                        <div className="mt-3 pt-3 border-t border-[#E4DED7] text-[11px] text-[#6B635E] flex justify-between">
                          <span>
                            {lang === 'bn' ? 'দেওয়ানি: ' : 'Civil: '}
                            <strong className="text-[#161211]">
                              {formatNumber(court.civilPending || 0, lang)}
                            </strong>
                          </span>
                          <span>
                            {lang === 'bn' ? 'ফৌজদারি: ' : 'Criminal: '}
                            <strong className="text-[#161211]">
                              {formatNumber(court.criminalPending || 0, lang)}
                            </strong>
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="mt-4 text-[11px] text-[#6B635E] leading-relaxed pt-3 border-t border-[#E4DED7]/70">
                      {lang === 'bn' ? court.notesBn : court.notesEn}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Clearance Rate Methodology Alert Note */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-3">
              <Info size={17} className="text-emerald-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">
                  {lang === 'bn'
                    ? 'ক্লিয়ারেন্স রেট (Clearance Rate) গণনা পদ্ধতি ও স্বচ্ছতা নীতি'
                    : 'Clearance Rate Methodology & Verification Policy'}
                </p>
                <p className="text-emerald-900 leading-relaxed text-[11px]">
                  {t.lbl_clearance_formula_note}{' '}
                  {lang === 'bn'
                    ? '২০২৬ সালের সুপ্রীম কোর্ট ড্রাইভে নিষ্পত্তির সংখ্যা নতুন মামলার চেয়ে বেশি হওয়ায় (১১৮%) জট হ্রাস পেয়েছে। অধস্তন আদালতের জন্য সারা বছরের পূর্ণাঙ্গ ফাইলিং সরকারি গেজেটে প্রকাশের আগে কোনো কাল্পনিক অনুপাত তৈরি করা হয়নি।'
                    : 'In the 2026 Supreme Court drive, disposals outpaced new filings (117.89% combined clearance), actively cutting apex backlog. For subordinate courts, national filings are gazetted annually; no artificial clearance rate is fabricated without matching official denominators.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 8 ADMINISTRATIVE DIVISIONS */}
        {activeTab === 'divisions' && (
          <div className="mt-8 space-y-6">
            {/* Division Selector Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {OFFICIAL_DIVISION_CASELOADS.map((div) => {
                const isSelected = div.division === selectedDivision;
                return (
                  <button
                    key={div.division}
                    type="button"
                    onClick={() => setSelectedDivision(div.division)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-white border-[#8B1E2D] shadow-sm ring-1 ring-[#8B1E2D]'
                        : 'bg-white/70 border-[#E4DED7] hover:bg-white text-[#6B635E]'
                    }`}
                  >
                    <span className="block font-bold text-xs text-[#161211]">
                      {lang === 'bn' ? div.divisionNameBn : div.divisionNameEn.replace(' Division', '')}
                    </span>
                    <span className="block text-[10px] font-mono text-[#8B1E2D] mt-0.5">
                      {div.percentageOfNational}%
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Division Detailed Card */}
            <div className="bg-white p-6 rounded-xl border border-[#E4DED7] shadow-xs grid md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#8B1E2D]" />
                  <h3 className="font-serif font-bold text-2xl text-[#161211]">
                    {lang === 'bn' ? selectedDivData.divisionNameBn : selectedDivData.divisionNameEn}
                  </h3>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-[#6B635E]">{lang === 'bn' ? 'আনুমানিক আঞ্চলিক মামলা জট:' : 'Estimated Subordinate Caseload:'}</span>
                  <div className="text-3xl font-serif font-bold text-[#8B1E2D]">
                    {formatNumber(selectedDivData.estimatedPending, lang)}{' '}
                    <span className="text-xs font-sans font-normal text-[#6B635E]">
                      ({selectedDivData.percentageOfNational}% {lang === 'bn' ? 'জাতীয় মোট' : 'of National'})
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#6B635E] leading-relaxed pt-2 border-t border-[#E4DED7]">
                  {lang === 'bn' ? selectedDivData.notesBn : selectedDivData.notesEn}
                </p>
              </div>

              <div className="md:col-span-7 bg-[#FAF8F5] p-5 rounded-xl border border-[#E4DED7] space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E4DED7]">
                  <span className="font-bold text-[#161211] uppercase tracking-wider text-[11px]">
                    {lang === 'bn' ? 'বিচারিক ট্রাইব্যুনাল ও প্রধান আদালতসমূহ' : 'Specialized Tribunals & Primary Courts'}
                  </span>
                  <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#E4DED7] font-semibold text-[#8B1E2D]">
                    {selectedDivData.activeTribunalsCount} {lang === 'bn' ? 'টি বিশেষ ট্রাইব্যুনাল' : 'Tribunals'}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-2 text-xs">
                  {selectedDivData.primaryCourts.map((courtName, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-white rounded border border-[#E4DED7] text-[#26211F] text-[11px] flex items-center gap-2"
                    >
                      <Building size={13} className="text-[#8B1E2D] shrink-0" />
                      <span>{courtName}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HISTORICAL TRENDS (2023 - 2026) */}
        {activeTab === 'trends' && (
          <div className="mt-8 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-[#E4DED7] shadow-xs">
              <h3 className="font-serif font-bold text-lg text-[#161211] mb-2">
                {lang === 'bn'
                  ? 'সুপ্রীম কোর্ট বার্ষিক মামলা ফাইলিং ও নিষ্পত্তি গতিপ্রকৃতি (২০২৩ – ২০২৬)'
                  : 'Supreme Court Annual Case Dynamics & Trajectory (2023 – 2026)'}
              </h3>
              <p className="text-xs text-[#6B635E] mb-6">
                {lang === 'bn'
                  ? 'বার্ষিক প্রতিবেদন অনুসারে ফাইলিং ও নিষ্পত্তির তুলনামূলক চিত্র। ২০২৬ সালের বিশেষ পদক্ষেপে দীর্ঘদিনের মধ্যে প্রথমবারের মতো নিষ্পত্তির সংখ্যা ফাইলিংকে ছাড়িয়েছে।'
                  : 'Year-on-year trajectory based on Supreme Court annual reports. The 2026 drive achieved a positive net disposal rate for the first time in recent cycles.'}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E4DED7] bg-[#FAF8F5] text-[#161211]">
                      <th className="p-3 font-bold">{lang === 'bn' ? 'বছর' : 'Year'}</th>
                      <th className="p-3 font-bold">{lang === 'bn' ? 'বিভাগ / আদালত' : 'Court Tier'}</th>
                      <th className="p-3 font-bold">{lang === 'bn' ? 'নতুন ফাইলিং' : 'New Filings'}</th>
                      <th className="p-3 font-bold">{lang === 'bn' ? 'নিষ্পত্তি' : 'Disposals'}</th>
                      <th className="p-3 font-bold">{lang === 'bn' ? 'ক্লিয়ারেন্স রেট' : 'Clearance Rate'}</th>
                      <th className="p-3 font-bold">{lang === 'bn' ? 'অনিষ্পন্ন জট' : 'Pending'}</th>
                      <th className="p-3 font-bold">{lang === 'bn' ? 'উৎস ও তথ্য' : 'Official Citation'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4DED7]">
                    {OFFICIAL_YEARLY_TRENDS.map((trend, idx) => (
                      <tr key={idx} className="hover:bg-[#FAF8F5]/60 transition-colors">
                        <td className="p-3 font-bold font-mono text-[#8B1E2D]">{trend.year}</td>
                        <td className="p-3 font-medium text-[#161211]">{trend.court}</td>
                        <td className="p-3 font-mono">
                          {trend.filings ? formatNumber(trend.filings, lang) : '—'}
                        </td>
                        <td className="p-3 font-mono font-semibold text-emerald-700">
                          {formatNumber(trend.disposals, lang)}
                        </td>
                        <td className="p-3">
                          {trend.clearanceRate !== null ? (
                            <span
                              className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                                trend.clearanceRate >= 100
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {trend.clearanceRate}%
                            </span>
                          ) : (
                            <span className="text-[#6B635E] italic">Published annually</span>
                          )}
                        </td>
                        <td className="p-3 font-mono font-medium text-[#161211]">
                          {formatNumber(trend.pending, lang)}
                        </td>
                        <td className="p-3 text-[11px] text-[#6B635E] max-w-xs">{trend.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
