/**
 * api/index.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Serverless function entry point for Vercel (@vercel/node).
 * Wraps our Express application (`src/server.js`) and routes all /api and /images requests to it.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const app = require('../src/server.js');

module.exports = app;
