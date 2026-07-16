/**
 * database/db.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Singleton sql.js Database instance.
 *
 * sql.js is a WebAssembly port of SQLite – no native C++ compilation required.
 * Because the entire database lives in memory, we persist it manually to a
 * file on disk and reload it on startup.
 *
 * Public API:
 *   initDb()  → Promise<Database>   initialise / load DB from disk
 *   getDb()   → Database            get the already-initialised DB
 *   saveDb()                        write in-memory DB back to disk
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const path = require('path');
const fs   = require('fs');
const initSqlJs = require('sql.js');

const DB_PATH  = path.resolve(__dirname, '../../data/adventure.db');
const DATA_DIR = path.dirname(DB_PATH);

let _db = null;

// ─── Initialise ────────────────────────────────────────────────────────────────
async function initDb() {
  if (_db) return _db;

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    // Load existing database file into memory
    const fileBuffer = fs.readFileSync(DB_PATH);
    _db = new SQL.Database(fileBuffer);
    console.log('🗄   Loaded existing database from:', DB_PATH);
  } else {
    // Fresh in-memory database
    _db = new SQL.Database();
    console.log('🗄   Created new in-memory database.');
  }

  // Enable foreign-key enforcement
  _db.run('PRAGMA foreign_keys = ON');

  return _db;
}

// ─── Getter (throws if initDb() was not called first) ─────────────────────────
function getDb() {
  if (!_db) {
    throw new Error('Database is not initialised. Call initDb() before getDb().');
  }
  return _db;
}

// ─── Persist to disk ──────────────────────────────────────────────────────────
function saveDb() {
  if (!_db) return;
  const data   = _db.export();          // Uint8Array
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
  console.log('💾  Database saved to:', DB_PATH);
}

// ─── Query helpers (sql.js has a lower-level API than better-sqlite3) ─────────

/**
 * Run a SELECT and return ALL matching rows as plain objects.
 * @param {Database} db
 * @param {string}   sql    - SQL with ? placeholders
 * @param {Array}    params - positional bind values
 * @returns {object[]}
 */
function queryAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Run a SELECT and return the FIRST matching row, or null.
 */
function queryOne(db, sql, params = []) {
  const rows = queryAll(db, sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Run an INSERT / UPDATE / DELETE and return the last inserted row ID.
 * @returns {number} lastInsertRowid
 */
function runInsert(db, sql, params = []) {
  db.run(sql, params);
  const result = db.exec('SELECT last_insert_rowid()');
  return result[0].values[0][0];
}

module.exports = { initDb, getDb, saveDb, queryAll, queryOne, runInsert, DB_PATH };
