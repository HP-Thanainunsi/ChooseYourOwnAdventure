/**
 * database/db.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Singleton libSQL Database client instance for Turso Cloud & Local SQLite.
 *
 * Uses official @libsql/client. Connects to Turso Cloud when TURSO_DATABASE_URL
 * and TURSO_AUTH_TOKEN are set, or local file:data/adventure.db otherwise.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const path = require('path');
const fs   = require('fs');
const { createClient } = require('@libsql/client');

const DB_PATH  = path.resolve(__dirname, '../../data/adventure.db');
const DATA_DIR = path.dirname(DB_PATH);

let _db = null;

// ─── Initialise ────────────────────────────────────────────────────────────────
async function initDb() {
  if (_db) return _db;

  let url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    // If running on Vercel without Turso URL, fallback to writable /tmp directory
    const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
    const dbPath = isVercel ? '/tmp/adventure.db' : DB_PATH;
    const dataDir = path.dirname(dbPath);

    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
    } catch (fsErr) {
      console.debug('Note: mkdir check inside initDb:', fsErr.message);
    }

    url = `file:${dbPath}`;
  } else {
    // Only attempt creating local DATA_DIR if URL starts with file:
    if (url.startsWith('file:')) {
      try {
        if (!fs.existsSync(DATA_DIR)) {
          fs.mkdirSync(DATA_DIR, { recursive: true });
        }
      } catch (fsErr) {
        console.debug('Note: DATA_DIR mkdir check:', fsErr.message);
      }
    }
  }

  _db = createClient({
    url,
    authToken,
  });

  // Attach a compatibility .run helper method for execute({ sql, args })
  _db.run = async (sql, params = []) => {
    return await _db.execute({ sql, args: params });
  };

  // Attach a compatibility .exec helper method for executeMultiple(sql)
  _db.exec = async (sql) => {
    return await _db.executeMultiple(sql);
  };

  // Ensure tables and seed data exist on connection
  try {
    const { checkAndSeedData } = require('./init');
    await checkAndSeedData(_db);
  } catch (seedErr) {
    console.debug('Note: auto checkAndSeedData inside initDb:', seedErr.message);
  }

  console.log(`🗄   Connected to libSQL database (${authToken ? 'Turso Cloud' : url})`);

  // Enable foreign-key enforcement
  try {
    await _db.execute('PRAGMA foreign_keys = ON');
  } catch (err) {
    console.debug('Note: PRAGMA foreign_keys check:', err.message);
  }

  return _db;
}

// ─── Getter (throws if initDb() was not called first) ─────────────────────────
function getDb() {
  if (!_db) {
    throw new Error('Database is not initialised. Call initDb() before getDb().');
  }
  return _db;
}

// ─── Persist (No-op since @libsql/client persists directly on execute) ─────────
function saveDb() {
  // libSQL client writes directly to file/Turso Cloud upon query execution.
}

// ─── Query helpers (Async Promise-based API for @libsql/client) ───────────────

/**
 * Run a SELECT and return ALL matching rows as plain objects.
 * @param {object}   db
 * @param {string}   sql    - SQL with ? placeholders
 * @param {Array}    params - positional bind values
 * @returns {Promise<object[]>}
 */
async function queryAll(db, sql, params = []) {
  const res = await db.execute({ sql, args: params });
  return res.rows;
}

/**
 * Run a SELECT and return the FIRST matching row, or null.
 * @returns {Promise<object|null>}
 */
async function queryOne(db, sql, params = []) {
  const rows = await queryAll(db, sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Run an INSERT / UPDATE / DELETE and return the last inserted row ID.
 * @returns {Promise<number>} lastInsertRowid
 */
async function runInsert(db, sql, params = []) {
  const res = await db.execute({ sql, args: params });
  return Number(res.lastInsertRowid);
}

module.exports = { initDb, getDb, saveDb, queryAll, queryOne, runInsert, DB_PATH };
