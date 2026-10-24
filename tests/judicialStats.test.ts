import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

function expect<T>(actual: T) {
  return {
    toBe: (expected: any) => assert.strictEqual(actual, expected),
    toBeNull: () => assert.strictEqual(actual, null),
    toBeDefined: () => assert.notStrictEqual(actual, undefined),
    toBeGreaterThan: (n: number) => assert.ok((actual as any) > n, `${actual} should be > ${n}`),
    toBeGreaterThanOrEqual: (n: number) => assert.ok((actual as any) >= n, `${actual} should be >= ${n}`),
    toHaveLength: (n: number) => assert.strictEqual((actual as any).length, n),
    toContain: (item: any) => assert.ok((actual as any).includes(item), `${actual} should contain ${item}`),
    toMatch: (reg: RegExp) => assert.match(String(actual), reg),
  };
}
import {
  calculateClearanceRate,
  OFFICIAL_SUMMARY_STATS,
  OFFICIAL_COURT_CASELOADS,
  OFFICIAL_DIVISION_CASELOADS,
  OFFICIAL_YEARLY_TRENDS,
  OFFICIAL_DATA_SOURCES,
  getJudicialStatsData,
  refreshJudicialStats,
} from '../src/server/judicialStatsService';
import {
  getPublisherFromUrl,
  JUDICIAL_KEYWORDS,
  getPublicNewsArticles,
} from '../src/server/newsDiscovery';

describe('Judicial Clearance Rate Calculations', () => {
  it('correctly calculates clearance rate for positive numbers and rounds to 2 decimal places', () => {
    // 98,732 disposals / 83,746 filings = 117.8946... -> 117.89%
    const rate = calculateClearanceRate(98732, 83746);
    expect(rate).toBe(117.89);
  });

  it('correctly handles equal filings and disposals (100.00%)', () => {
    const rate = calculateClearanceRate(5000, 5000);
    expect(rate).toBe(100.0);
  });

  it('correctly handles disposals lower than filings', () => {
    // 5349 / 11938 = 44.8064... -> 44.81%
    const rate = calculateClearanceRate(5349, 11938);
    expect(rate).toBe(44.81);
  });

  it('returns null when filings count is 0 (division by zero safeguard)', () => {
    expect(calculateClearanceRate(100, 0)).toBeNull();
  });

  it('returns null for negative filings or disposals', () => {
    expect(calculateClearanceRate(-10, 50)).toBeNull();
    expect(calculateClearanceRate(50, -10)).toBeNull();
  });

  it('returns null for NaN or non-numeric inputs', () => {
    expect(calculateClearanceRate(NaN, 100)).toBeNull();
    expect(calculateClearanceRate(100, NaN)).toBeNull();
    // @ts-ignore
    expect(calculateClearanceRate(undefined, 100)).toBeNull();
  });
});

describe('Official Judicial Statistics Normalization', () => {
  it('contains valid non-zero positive numbers for all nationwide and court backlogs', () => {
    expect(OFFICIAL_SUMMARY_STATS.totalPendingNationwide).toBeGreaterThan(4500000);
    expect(OFFICIAL_SUMMARY_STATS.subordinatePending).toBeGreaterThan(4000000);
    expect(OFFICIAL_SUMMARY_STATS.highCourtPending).toBeGreaterThan(500000);
    expect(OFFICIAL_SUMMARY_STATS.appellatePending).toBeGreaterThan(35000);
  });

  it('ensures subordinate civil and criminal backlog totals match the subordinate sum', () => {
    const sum =
      OFFICIAL_SUMMARY_STATS.subordinateCivilPending +
      OFFICIAL_SUMMARY_STATS.subordinateCriminalPending;
    expect(sum).toBe(OFFICIAL_SUMMARY_STATS.subordinatePending);
  });

  it('ensures 2026 drive disposals exceed filings by exactly the reported net reduction', () => {
    const drive = OFFICIAL_SUMMARY_STATS.supremeCourtDrive2026;
    expect(drive.disposals - drive.filings).toBe(drive.netReduction);
    expect(drive.clearanceRate).toBeGreaterThan(100);
  });

  it('contains data for all 8 administrative divisions of Bangladesh totaling 100%', () => {
    expect(OFFICIAL_DIVISION_CASELOADS).toHaveLength(8);

    const requiredDivisions = [
      'dhaka',
      'chattogram',
      'rajshahi',
      'khulna',
      'sylhet',
      'rangpur',
      'barishal',
      'mymensingh',
    ];

    const presentDivisions = OFFICIAL_DIVISION_CASELOADS.map((d) => d.division);
    for (const div of requiredDivisions) {
      expect(presentDivisions).toContain(div as any);
    }

    const totalPercentage = OFFICIAL_DIVISION_CASELOADS.reduce(
      (sum, d) => sum + d.percentageOfNational,
      0
    );
    expect(Math.round(totalPercentage)).toBe(100);
  });

  it('verifies court caseload items have non-empty names and reporting dates', () => {
    for (const c of OFFICIAL_COURT_CASELOADS) {
      expect(c.nameEn.length).toBeGreaterThan(0);
      expect(c.nameBn.length).toBeGreaterThan(0);
      expect(c.reportingDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(c.pending).toBeGreaterThan(0);
    }
  });

  it('verifies yearly trends span from 2023 through 2026', () => {
    const years = OFFICIAL_YEARLY_TRENDS.map((y) => y.year);
    expect(years).toContain(2023);
    expect(years).toContain(2024);
    expect(years).toContain(2025);
    expect(years).toContain(2026);
  });
});

describe('Data Source Transparency Registry', () => {
  it('registers all key official institutions with valid URLs', () => {
    expect(OFFICIAL_DATA_SOURCES.length).toBeGreaterThanOrEqual(4);
    const urls = OFFICIAL_DATA_SOURCES.map((s) => s.url);
    expect(urls).toContain('https://www.supremecourt.gov.bd/');
    expect(urls).toContain('https://judiciary.gov.bd/');
    expect(urls).toContain('http://bdlaws.minlaw.gov.bd/');
  });

  it('provides asynchronous data fetching via getJudicialStatsData', async () => {
    const data = await getJudicialStatsData();
    expect(data.summary).toBeDefined();
    expect(data.courtCaseloads.length).toBeGreaterThan(0);
    expect(data.divisionCaseloads.length).toBe(8);
    expect(data.sources.length).toBeGreaterThan(0);
  });

  it('supports refreshJudicialStats without throwing and preserves data', async () => {
    const res = await refreshJudicialStats(false);
    expect(res.success).toBe(true);
    expect(res.summary.totalPendingNationwide).toBe(4639476);
  });
});

describe('News Media Ingestion & Extraction', () => {
  it('correctly maps news article domains to publisher names', () => {
    expect(getPublisherFromUrl('https://www.thedailystar.net/news/bangladesh/court-123')).toBe(
      'The Daily Star'
    );
    expect(getPublisherFromUrl('https://en.prothomalo.com/bangladesh/crime/post-456')).toBe(
      'Prothom Alo'
    );
    expect(getPublisherFromUrl('https://www.dhakatribune.com/bangladesh/law-789')).toBe(
      'Dhaka Tribune'
    );
    expect(getPublisherFromUrl('https://unknownsite.org/news')).toBe('Verified National Media');
  });

  it('includes English and Bengali judicial keywords', () => {
    expect(JUDICIAL_KEYWORDS).toContain('court');
    expect(JUDICIAL_KEYWORDS).toContain('supreme court');
    expect(JUDICIAL_KEYWORDS).toContain('bail');
    expect(JUDICIAL_KEYWORDS).toContain('আদালত');
    expect(JUDICIAL_KEYWORDS).toContain('রায়');
    expect(JUDICIAL_KEYWORDS).toContain('মামলা');
  });

  it('provides cached public news articles with graceful fallback', async () => {
    const news = await getPublicNewsArticles(false);
    expect(news.articles).toBeDefined();
    expect(Array.isArray(news.articles)).toBe(true);
    expect(news.articles.length).toBeGreaterThan(0);
    expect(news.lastUpdated).toBeDefined();

    // Check structure of first article
    const first = news.articles[0];
    expect(first.headline).toBeDefined();
    expect(first.publisher).toBeDefined();
    expect(first.articleUrl).toMatch(/^https?:\/\//);
  });
});
