/**
 * server.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Express application entry point.
 *
 * Because sql.js initialises asynchronously (WebAssembly bootstrap), we must
 * await initDb() BEFORE calling app.listen(). This guarantees the database
 * is ready the moment the first request arrives.
 *
 * Start:            node src/server.js
 * Dev (hot-reload): npm run dev
 * Init database:    npm run init-db
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const path    = require('node:path');
const express = require('express');
const cors    = require('cors');

const { initDb } = require('./database/db');

const app  = express();
app.disable('x-powered-by');
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
  origin:  process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Parse JSON bodies; limit to 100kb to allow complete stage+options payloads
app.use(express.json({ limit: '100kb' }));

// Serve static assets (drink images, option images, etc.)
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// ─── Routes ───────────────────────────────────────────────────────────────────
const gameRoutes  = require('./routes/gameRoutes');
const adminRoutes = require('./routes/adminRoutes');
app.use('/api', gameRoutes);
app.use('/api/admin', adminRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({ success: false, error: 'An unexpected error occurred.' });
});

// ─── Bootstrap: init DB first, then start HTTP server ────────────────────────
async function bootstrap() {
  try {
    await initDb();   // loads/creates the SQLite DB via WebAssembly
    app.listen(PORT, () => {
      console.log(`\n🚀  Server running on http://localhost:${PORT}`);
      console.log(`    GET  http://localhost:${PORT}/api/game-flow`);
      console.log(`    POST http://localhost:${PORT}/api/calculate-result`);
      console.log(`    GET  http://localhost:${PORT}/health`);
      console.log(`\n    ⚠️   Run "npm run init-db" first if this is a fresh install.\n`);
    });
  } catch (err) {
    console.error('❌  Failed to start server:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  bootstrap();
}

module.exports = app;
