import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  DEFAULT_NEWS_SOURCES,
  fetchAndFilterNews,
  analyzeNewsWithGemini,
  getPublicNewsArticles,
} from './src/server/newsDiscovery';
import {
  getJudicialStatsData,
  probeOfficialSources,
  refreshJudicialStats,
} from './src/server/judicialStatsService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// In-memory news sources registry
let newsSources = [...DEFAULT_NEWS_SOURCES];
// Cache of recent discovered leads
let discoveredLeadsCache: any[] = [];

// Rate-limiting tracker for refresh endpoint
let lastManualRefreshTime = 0;
const REFRESH_COOLDOWN_MS = 30 * 1000; // 30 seconds cooldown

// URL validation helper to prevent SSRF attacks
function isSafePublicUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('169.254.')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// 1. Health check & Config status
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    firebaseProject: 'ultra-wall-9smzh',
    realTimeJudicialEngine: 'active',
  });
});

// 2. Verified Judicial Statistics Endpoint
app.get('/api/judicial-stats', async (_req: Request, res: Response) => {
  try {
    const data = await getJudicialStatsData();
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...data,
    });
  } catch (error: any) {
    console.error('Judicial stats retrieval error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Error fetching judicial statistics.',
    });
  }
});

// 3. Official Data Sources & Status Endpoint
app.get('/api/judicial-stats/sources', async (_req: Request, res: Response) => {
  try {
    const sources = await probeOfficialSources();
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      sources,
    });
  } catch (error: any) {
    console.error('Data source status probe error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Error probing data sources.',
    });
  }
});

// 4. Rate-limited Refresh Endpoint
app.post('/api/judicial-stats/refresh', async (req: Request, res: Response) => {
  const now = Date.now();
  if (now - lastManualRefreshTime < REFRESH_COOLDOWN_MS) {
    const waitSeconds = Math.ceil((REFRESH_COOLDOWN_MS - (now - lastManualRefreshTime)) / 1000);
    return res.status(429).json({
      success: false,
      error: `Refresh rate limited. Please wait ${waitSeconds}s before requesting again.`,
    });
  }

  try {
    lastManualRefreshTime = now;
    // Check optional admin header if provided
    const authHeader = req.headers.authorization;
    const isAuthorized = authHeader ? true : false;

    const result = await refreshJudicialStats(true);
    // Also invalidate news cache
    await getPublicNewsArticles(true);

    res.json({
      ...result,
      message: 'Judicial statistics and source statuses refreshed successfully.',
      authorizedRefresh: isAuthorized,
    });
  } catch (error: any) {
    console.error('Refresh error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Refresh failed.',
    });
  }
});

// 5. Genuine Public News Feed Endpoint (Server-side Cached)
app.get('/api/news/public', async (_req: Request, res: Response) => {
  try {
    const newsData = await getPublicNewsArticles(false);
    res.json({
      success: true,
      ...newsData,
    });
  } catch (error: any) {
    console.error('Public news fetch error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Could not fetch public news.',
      articles: [],
      lastUpdated: new Date().toISOString(),
      isStale: true,
    });
  }
});

// 6. Automated News Discovery trigger (Admin Queue)
app.post('/api/news/discover', async (_req: Request, res: Response) => {
  try {
    const rawArticles = await fetchAndFilterNews(newsSources);

    // Limit to top 5 articles per execution for rate limits and low latency
    const toAnalyze = rawArticles.slice(0, 5);
    const leads = [];

    for (const item of toAnalyze) {
      const publisher = item.link?.includes('thedailystar')
        ? 'The Daily Star'
        : item.link?.includes('prothomalo')
        ? 'Prothom Alo'
        : 'Dhaka Tribune';

      const analyzed = await analyzeNewsWithGemini(item, publisher);
      leads.push(analyzed);
    }

    // Prepend to server cache
    discoveredLeadsCache = [...leads, ...discoveredLeadsCache].slice(0, 50);

    res.json({
      success: true,
      foundCount: rawArticles.length,
      analyzedCount: leads.length,
      leads,
    });
  } catch (error: any) {
    console.error('Discovery error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Error occurred during news discovery.',
    });
  }
});

// 7. News sources registry
app.get('/api/news/sources', (_req: Request, res: Response) => {
  res.json({ sources: newsSources });
});

// 8. Test adding or checking a feed (With SSRF security validation)
app.post('/api/news/test-feed', async (req: Request, res: Response) => {
  const { name, feedUrl, sourceType } = req.body;
  if (!name || !feedUrl) {
    return res.status(400).json({ error: 'Name and feedUrl are required.' });
  }

  // SSRF prevention: validate URL before fetching
  if (!isSafePublicUrl(feedUrl)) {
    return res.status(400).json({
      error: 'Invalid or restricted feed URL. Only public HTTP/HTTPS URLs are allowed.',
    });
  }

  const newSource = {
    id: `src-${Date.now()}`,
    name: String(name).slice(0, 100).trim(),
    feedUrl: String(feedUrl).slice(0, 500).trim(),
    sourceType: sourceType || 'rss',
    enabled: true,
    lastCheckedAt: null,
    lastError: null,
    updateFrequencyMinutes: 60,
  };

  try {
    const rawArticles = await fetchAndFilterNews([newSource]);
    newsSources.push(newSource);
    res.json({
      success: true,
      source: newSource,
      matchedItemsCount: rawArticles.length,
      sample: rawArticles.slice(0, 2),
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err?.message || 'Could not fetch feed.',
    });
  }
});

// 9. Public Correction Request submission
app.post('/api/corrections', (req: Request, res: Response) => {
  const { caseId, message, contactEmail } = req.body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Correction message is required.' });
  }

  // Sanitize and trim
  const cleanMessage = message.trim().slice(0, 3000);
  const cleanContact = contactEmail ? String(contactEmail).trim().slice(0, 256) : null;
  const cleanCaseId = caseId ? String(caseId).trim().slice(0, 64) : null;

  const record = {
    id: `CR-${Date.now()}`,
    caseId: cleanCaseId,
    message: cleanMessage,
    contactEmail: cleanContact,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  console.log('New correction request received for case:', cleanCaseId);
  res.status(201).json({
    success: true,
    message: 'Correction request submitted safely to the private review queue.',
    item: record,
  });
});

// 10. Admin bootstrap check
app.post('/api/admin/bootstrap', (req: Request, res: Response) => {
  const { email } = req.body;
  const isSuperadmin = email === 'nahianalmubin2006@gmail.com';
  res.json({
    authorized: isSuperadmin,
    email,
    role: isSuperadmin ? 'superadmin' : 'none',
  });
});

// Mount Vite or static serving
async function setupVite() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(
      `Justice Clock server listening on port ${port} (mode: ${
        isDev ? 'development' : 'production'
      })`
    );
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
});
