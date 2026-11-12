import express from 'express';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here    = path.dirname(fileURLToPath(import.meta.url));
const root    = path.join(here, '..');          // project root
const distDir = path.join(root, 'dist');
const dataDir = path.join(here, 'data');
const dataFile = path.join(dataDir, 'tastings.json');

const app = express();
app.use(express.json({ limit: '12kb' }));

/* ── Persistence helpers ───────────────────────────────────── */

let queue = Promise.resolve();

async function readTastings() {
  try { return JSON.parse(await readFile(dataFile, 'utf8')); }
  catch (e) { if (e.code === 'ENOENT') return []; throw e; }
}

async function writeTastings(rows) {
  queue = queue.then(async () => {
    await mkdir(dataDir, { recursive: true });
    await writeFile(dataFile, JSON.stringify(rows, null, 2), 'utf8');
  });
  return queue;
}

/* ── API routes (must come before static serving) ─────────── */

app.get('/api/health', (_req, res) =>
  res.json({ ok: true, app: 'Little Joys Flavour Finder' })
);

app.get('/api/tastings', async (_req, res, next) => {
  try { res.json(await readTastings()); } catch (e) { next(e); }
});

app.post('/api/tastings', async (req, res, next) => {
  try {
    const { flavour, rating, texture, wouldChoose, note = '' } = req.body ?? {};
    const allowedFlavours = ['Chocolate', 'Strawberry', 'Vanilla'];
    const allowedTextures = ['smooth', 'okay', 'not-for-us'];
    const allowedChoose   = ['yes', 'maybe', 'no'];

    const errors = [];
    if (!allowedFlavours.includes(flavour))
      errors.push('flavour must be Chocolate, Strawberry, or Vanilla');
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      errors.push('rating must be an integer 1–5');
    if (!allowedTextures.includes(texture))
      errors.push('texture must be smooth, okay, or not-for-us');
    if (!allowedChoose.includes(wouldChoose))
      errors.push('wouldChoose must be yes, maybe, or no');
    if (errors.length) return res.status(400).json({ error: errors.join('; ') });

    const rows = await readTastings();
    const row = {
      id: crypto.randomUUID(),
      flavour,
      rating,
      texture,
      wouldChoose,
      note: String(note).slice(0, 180),
      createdAt: new Date().toISOString(),
    };
    rows.push(row);
    await writeTastings(rows.slice(-100));
    res.status(201).json(row);
  } catch (e) { next(e); }
});

app.delete('/api/tastings', async (_req, res, next) => {
  try { await writeTastings([]); res.status(204).end(); } catch (e) { next(e); }
});

/* ── Production static serving ─────────────────────────────── */
// Serve the Vite-built frontend when dist/ is present (production / deploy).
// Falls back to index.html so React client-side routing works.

async function distExists() {
  try { await access(path.join(distDir, 'index.html')); return true; }
  catch { return false; }
}

const isProd = process.env.NODE_ENV === 'production' || await distExists();

if (isProd) {
  app.use(express.static(distDir));
  // Express 5 requires explicit wildcard — use regex or '{*path}' syntax
  app.get(/.*/, (_req, res) =>
    res.sendFile(path.join(distDir, 'index.html'))
  );
  console.log(`Serving static frontend from ${distDir}`);
} else {
  console.log('No dist/ found — static serving disabled. Run: npm run build');
}

/* ── Global error handler ──────────────────────────────────── */

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

/* ── Start ─────────────────────────────────────────────────── */

const port = Number(process.env.PORT || process.env.API_PORT || 3101);
app.listen(port, '0.0.0.0', () =>
  console.log(`Flavour Finder listening on http://localhost:${port}`)
);
