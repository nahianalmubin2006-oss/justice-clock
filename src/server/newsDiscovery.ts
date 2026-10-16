import { GoogleGenAI, Type } from '@google/genai';
import { XMLParser } from 'fast-xml-parser';
import { NewsLeadItem, NewsSourceItem } from '../types';

// Built-in reputable news sources registry
export const DEFAULT_NEWS_SOURCES: NewsSourceItem[] = [
  {
    id: 'dt-crime',
    name: 'Dhaka Tribune (Bangladesh)',
    feedUrl: 'https://www.dhakatribune.com/feed',
    sourceType: 'rss',
    enabled: true,
    lastCheckedAt: null,
    lastError: null,
    updateFrequencyMinutes: 60,
  },
  {
    id: 'tds-national',
    name: 'The Daily Star (National/Law)',
    feedUrl: 'https://www.thedailystar.net/rss',
    sourceType: 'rss',
    enabled: true,
    lastCheckedAt: null,
    lastError: null,
    updateFrequencyMinutes: 60,
  },
  {
    id: 'pa-bangla',
    name: 'Prothom Alo (Bangladesh)',
    feedUrl: 'https://en.prothomalo.com/feed',
    sourceType: 'rss',
    enabled: true,
    lastCheckedAt: null,
    lastError: null,
    updateFrequencyMinutes: 60,
  },
];

// Initialize Gemini SDK with recommended server-side settings
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const parser = new XMLParser({
  ignoreAttributes: false,
  trimValues: true,
});

const KEYWORDS = [
  'rape',
  'gang-rape',
  'sexual assault',
  'sexual harassment',
  'tribunal',
  'nari o shishu',
  'ধর্ষণ',
  'নারী নির্যাতন',
  'যৌন নির্যাতন',
  'যৌন নিপীড়ন',
  'নারী ও শিশু নির্যাতন',
  'অভিযোগপত্র',
  'চার্জশিট',
  'রায়',
  'মামলা দায়ের',
];

interface RawFeedItem {
  title?: string;
  link?: string;
  pubDate?: string;
  description?: string;
  content?: string;
  guid?: string;
}

export async function fetchAndFilterNews(
  sources: NewsSourceItem[] = DEFAULT_NEWS_SOURCES
): Promise<RawFeedItem[]> {
  const matchedArticles: RawFeedItem[] = [];

  for (const src of sources) {
    if (!src.enabled) continue;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(src.feedUrl, {
        headers: {
          'User-Agent': 'JusticeClockBangladesh/1.0 (Public Interest Verification Bot; non-scraping)',
          Accept: 'application/rss+xml, application/xml, text/xml',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        src.lastError = `HTTP ${res.status}: ${res.statusText}`;
        continue;
      }

      const xmlText = await res.text();
      src.lastCheckedAt = new Date().toISOString();
      src.lastError = null;

      const parsed = parser.parse(xmlText);
      const items =
        parsed?.rss?.channel?.item ||
        parsed?.feed?.entry ||
        [];

      const rawItems: RawFeedItem[] = Array.isArray(items) ? items : [items];

      for (const item of rawItems) {
        const title = typeof item.title === 'string' ? item.title : '';
        const desc = typeof item.description === 'string' ? item.description : '';
        const textToScan = `${title} ${desc}`.toLowerCase();

        const isRelevant = KEYWORDS.some((kw) => textToScan.includes(kw.toLowerCase()));
        if (isRelevant && title) {
          matchedArticles.push({
            title: title.replace(/<[^>]+>/g, '').trim(),
            link: typeof item.link === 'string' ? item.link : item.link?.['@_href'] || '',
            pubDate: item.pubDate || new Date().toISOString(),
            description: desc.replace(/<[^>]+>/g, '').slice(0, 800).trim(),
          });
        }
      }
    } catch (err: unknown) {
      src.lastError = err instanceof Error ? err.message : String(err);
    }
  }

  // De-duplicate by link or title
  const seen = new Set<string>();
  return matchedArticles.filter((item) => {
    const key = item.link || item.title;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function analyzeNewsWithGemini(
  article: RawFeedItem,
  publisherName: string = 'Reported Publisher'
): Promise<NewsLeadItem> {
  const retrievedAt = new Date().toISOString();
  const headline = article.title || 'Untitled Report';
  const articleUrl = article.link || '';
  const excerpt = article.description || '';
  const publishedAt = article.pubDate || retrievedAt;

  // If Gemini API Key is missing or unavailable, provide safe rule-based baseline
  if (!process.env.GEMINI_API_KEY) {
    return {
      headline,
      publisher: publisherName,
      articleUrl,
      publishedAt,
      retrievedAt,
      excerpt,
      aiSummary: 'Preliminary lead discovered from news RSS feed. Awaiting human verification.',
      aiConfidence: 50,
      suggestedIncidentDate: null,
      suggestedDistrict: null,
      suggestedStatus: 'unverified',
      missingInfoWarnings: [
        'AI key not configured: fallback keyword extraction applied.',
        'Human review required before publishing.',
      ],
      reviewStatus: 'pending',
    };
  }

  try {
    const prompt = `You are a careful, rigorous legal assistant for "Justice Clock — Bangladesh", a public-awareness project tracking legal time elapsed since reported incidents.
Analyze the following news item:
Title: "${headline}"
Publisher: "${publisherName}"
Excerpt: "${excerpt}"
Date: "${publishedAt}"

Strict Rules:
1. Treat all statements about suspects as ALLEGATIONS, not established facts or proof of guilt.
2. NEVER guess or invent dates. Only output a suggestedIncidentDate if the article explicitly specifies when the incident took place (in YYYY-MM-DD or approximate format). Otherwise output null.
3. Identify the Bangladesh administrative district if mentioned (dhaka, chattogram, rajshahi, khulna, sylhet, barishal, rangpur, mymensingh). If unknown or unspecified, output null.
4. Suggested legal status must be one of: "investigation", "awaiting_trial", "trial", "judgment", "appeal", "unverified".
5. Note any missing info warnings or privacy concerns (e.g. "Victim is reportedly a minor - ensure complete anonymization", "Allegation only - no court record yet cited", "Filing date differs from incident date").
6. Provide an objective, respectful summary (under 250 words) in English.
7. Estimated confidence score from 0 to 100 based on factual clarity of the text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            confidence: { type: Type.INTEGER },
            suggestedIncidentDate: { type: Type.STRING },
            suggestedDistrict: { type: Type.STRING },
            suggestedStatus: { type: Type.STRING },
            warnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['summary', 'confidence', 'suggestedStatus', 'warnings'],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || '{}');

    return {
      headline,
      publisher: publisherName,
      articleUrl,
      publishedAt,
      retrievedAt,
      excerpt,
      aiSummary: parsedJson.summary || 'Summary unavailable.',
      aiConfidence: typeof parsedJson.confidence === 'number' ? Math.min(100, Math.max(0, parsedJson.confidence)) : 60,
      suggestedIncidentDate: parsedJson.suggestedIncidentDate || null,
      suggestedDistrict: parsedJson.suggestedDistrict || null,
      suggestedStatus: parsedJson.suggestedStatus || 'unverified',
      missingInfoWarnings: Array.isArray(parsedJson.warnings) ? parsedJson.warnings : ['Human verification required.'],
      reviewStatus: 'pending',
    };
  } catch (err: unknown) {
    console.error('Gemini news analysis error:', err);
    return {
      headline,
      publisher: publisherName,
      articleUrl,
      publishedAt,
      retrievedAt,
      excerpt,
      aiSummary: 'News lead recorded from RSS feed. Automatic AI extraction encountered an error; please review manually.',
      aiConfidence: 40,
      suggestedIncidentDate: null,
      suggestedDistrict: null,
      suggestedStatus: 'unverified',
      missingInfoWarnings: ['AI analysis error: ' + (err instanceof Error ? err.message : String(err))],
      reviewStatus: 'pending',
    };
  }
}
