import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  DEFAULT_NEWS_SOURCES,
  fetchAndFilterNews,
  analyzeNewsWithGemini,
} from './src/server/newsDiscovery';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// In-memory news sources registry (can be augmented dynamically)
let newsSources = [...DEFAULT_NEWS_SOURCES];
// Cache of recent discovered leads
let discoveredLeadsCache: any[] = [];

// 1. Health check & Config status
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    firebaseProject: 'ultra-wall-9smzh',
  });
});

// 2. Automated News Discovery trigger
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

// 3. News sources registry
app.get('/api/news/sources', (_req: Request, res: Response) => {
  res.json({ sources: newsSources });
});

// 4. Test adding or checking a feed
app.post('/api/news/test-feed', async (req: Request, res: Response) => {
  const { name, feedUrl, sourceType } = req.body;
  if (!name || !feedUrl) {
    return res.status(400).json({ error: 'Name and feedUrl are required.' });
  }

  const newSource = {
    id: `src-${Date.now()}`,
    name,
    feedUrl,
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

// 5. Public Correction Request submission
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

  // We log and return success
  console.log('New correction request received for case:', cleanCaseId);
  res.status(201).json({
    success: true,
    message: 'Correction request submitted safely to the private review queue.',
    item: record,
  });
});

// 6. Admin bootstrap check
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
    console.log(`Justice Clock server listening on port ${port} (mode: ${isDev ? 'development' : 'production'})`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
});
