import React, { useState, useEffect } from 'react';
import { PublicNewsArticle, Language } from '../types';
import { I18N } from '../data/i18n';
import {
  Newspaper,
  ExternalLink,
  RefreshCw,
  Clock,
  Radio,
  Building2,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface JusticeNewsSectionProps {
  lang: Language;
}

export const JusticeNewsSection: React.FC<JusticeNewsSectionProps> = ({ lang }) => {
  const t = I18N[lang];
  const [articles, setArticles] = useState<PublicNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isStale, setIsStale] = useState(false);
  const [publisherFilter, setPublisherFilter] = useState<string>('all');

  const fetchNews = async (isManual = false) => {
    if (isManual) setLoading(true);
    try {
      const res = await fetch('/api/news/public');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.articles)) {
          setArticles(json.articles);
          setLastUpdated(json.lastUpdated || new Date().toISOString());
          setIsStale(!!json.isStale);
        }
      }
    } catch (err) {
      console.warn('Could not fetch live public news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // Auto-refresh news every 15 minutes
    const interval = setInterval(() => {
      fetchNews();
    }, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredArticles = articles.filter((a) => {
    if (publisherFilter === 'all') return true;
    return a.publisher.toLowerCase().includes(publisherFilter.toLowerCase());
  });

  const getPublisherBadgeColor = (publisher: string) => {
    if (publisher.includes('Daily Star')) return 'bg-red-50 text-red-800 border-red-200';
    if (publisher.includes('Prothom Alo')) return 'bg-blue-50 text-blue-800 border-blue-200';
    if (publisher.includes('Dhaka Tribune')) return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-gray-50 text-gray-800 border-gray-200';
  };

  return (
    <section id="news" className="bg-[#FAF8F5] border-b border-[#E4DED7] py-14 sm:py-18 relative">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E4DED7]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8B1E2D] mb-1">
              <Radio size={14} className="text-[#8B1E2D]" />
              <span>{lang === 'bn' ? 'সরাসরি গণমাধ্যম ফিড' : 'LIVE JUDICIAL MEDIA MONITOR'}</span>
            </div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#161211]">
              {t.lbl_justice_news}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#6B635E]">
              {t.lbl_justice_news_sub}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Publisher Filter */}
            <select
              value={publisherFilter}
              onChange={(e) => setPublisherFilter(e.target.value)}
              className="text-xs font-semibold border border-[#CDC4B8] rounded-lg px-2.5 py-1.5 bg-white shadow-2xs cursor-pointer"
            >
              <option value="all">{lang === 'bn' ? 'সকল গণমাধ্যম' : 'All Publishers'}</option>
              <option value="Daily Star">The Daily Star</option>
              <option value="Dhaka Tribune">Dhaka Tribune</option>
              <option value="Prothom Alo">Prothom Alo</option>
            </select>

            {/* Manual Refresh */}
            <button
              onClick={() => fetchNews(true)}
              disabled={loading}
              className="p-1.5 rounded-lg bg-white border border-[#E4DED7] hover:border-[#8B1E2D] text-[#6B635E] hover:text-[#8B1E2D] transition-colors shadow-2xs"
              title="Refresh news feed"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-[#8B1E2D]' : ''} />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading && articles.length === 0 ? (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-xl border border-[#E4DED7] shadow-xs space-y-3 animate-pulse"
              >
                <div className="h-4 bg-[#E4DED7]/60 rounded w-1/3" />
                <div className="h-5 bg-[#E4DED7] rounded w-5/6" />
                <div className="h-16 bg-[#E4DED7]/40 rounded" />
                <div className="h-3 bg-[#E4DED7]/50 rounded w-1/4 pt-2" />
              </div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="mt-8 p-12 text-center bg-white rounded-xl border border-dashed border-[#CDC4B8]">
            <Newspaper size={36} className="mx-auto text-[#6B635E] mb-2 opacity-60" />
            <p className="font-serif font-bold text-lg text-[#161211]">
              {lang === 'bn' ? 'কোনো সংবাদ পাওয়া যায়নি' : 'No news articles found for this filter'}
            </p>
            <p className="text-xs text-[#6B635E] mt-1">
              {lang === 'bn' ? 'ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।' : 'Select "All Publishers" or refresh the feed.'}
            </p>
          </div>
        ) : (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredArticles.map((article) => {
              const badgeColor = getPublisherBadgeColor(article.publisher);
              return (
                <article
                  key={article.id}
                  className="group bg-white p-5 rounded-xl border border-[#E4DED7] shadow-xs hover:shadow-md hover:border-[#8B1E2D]/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={`px-2 py-0.5 rounded-full font-bold border ${badgeColor}`}>
                        {article.publisher}
                      </span>
                      <time className="text-[#6B635E] font-mono text-[10px]">
                        {new Date(article.publishedAt).toLocaleDateString(
                          lang === 'bn' ? 'bn-BD' : 'en-US',
                          { month: 'short', day: 'numeric', year: 'numeric' }
                        )}
                      </time>
                    </div>

                    <h3 className="font-serif font-bold text-base text-[#161211] leading-snug group-hover:text-[#8B1E2D] transition-colors">
                      <a
                        href={article.articleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-start justify-between gap-1"
                      >
                        <span>{article.headline}</span>
                      </a>
                    </h3>

                    {article.excerpt && (
                      <p className="text-xs text-[#6B635E] leading-relaxed line-clamp-3">
                        {article.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E4DED7]/70 flex items-center justify-between text-[11px]">
                    <span className="text-[#6B635E] text-[10px] font-medium">
                      {article.category || 'Judicial News'}
                    </span>
                    <a
                      href={article.articleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#8B1E2D] font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>{lang === 'bn' ? 'মূল সংবাদ পড়ুন' : 'Read Article'}</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Responsible AI Notice */}
        <div className="mt-6 p-4 bg-white/80 rounded-xl border border-[#E4DED7] text-xs text-[#6B635E] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>
            {lang === 'bn'
              ? 'সাংবাদিকতার নীতি: মূল প্রতিবেদনের সত্যতা অক্ষুণ্ণ রাখা হয়েছে। কোনো সংবাদ বা আইনি বিবৃতি কৃত্রিমভাবে তৈরি করা হয় না।'
              : 'Journalistic Integrity: The original reporting is preserved as the single source of truth. AI summaries are strictly segregated in the review queue.'}
          </span>
          <span className="text-[11px] font-mono text-[#6B635E] shrink-0">
            {isStale && '· Cached (Offline)'}
          </span>
        </div>
      </div>
    </section>
  );
};
