/**
 * Database module for Raja Rani
 * Provides persistent storage for room histories, game sessions, and player scores.
 * Supports SQLite with graceful fallback to a persistent JSON-file store.
 */

const fs = require('fs');
const path = require('path');

const DB_DIR = path.resolve(__dirname, '../../database');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const SQLITE_FILE = path.join(DB_DIR, 'rajarani.sqlite');
const JSON_BACKUP_FILE = path.join(DB_DIR, 'rajarani_records.json');

let db = null;
let useJsonStore = false;

try {
  const sqlite3 = require('sqlite3').verbose();
  db = new sqlite3.Database(SQLITE_FILE, (err) => {
    if (err) {
      console.warn('SQLite init error, falling back to JSON persistence:', err.message);
      useJsonStore = true;
    } else {
      initTables();
    }
  });
} catch (e) {
  console.warn('SQLite module unavailable, utilizing JSON file store:', e.message);
  useJsonStore = true;
}

function initTables() {
  if (!db) return;
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id TEXT PRIMARY KEY,
        room_code TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        total_rounds INTEGER DEFAULT 1,
        winner_name TEXT,
        winner_score INTEGER,
        stats_json TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS game_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        room_code TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        event_type TEXT NOT NULL,
        log_message TEXT NOT NULL
      )
    `);
  });
}

function readJsonStore() {
  if (!fs.existsSync(JSON_BACKUP_FILE)) {
    return { sessions: [], logs: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(JSON_BACKUP_FILE, 'utf8'));
  } catch {
    return { sessions: [], logs: [] };
  }
}

function writeJsonStore(data) {
  try {
    fs.writeFileSync(JSON_BACKUP_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write JSON backup DB:', err);
  }
}

/**
 * Save a completed game session
 */
function saveGameSession({ sessionId, roomCode, rounds, winnerName, winnerScore, stats, history }) {
  if (db && !useJsonStore) {
    const stmt = db.prepare(`
      INSERT INTO game_sessions (id, room_code, created_at, total_rounds, winner_name, winner_score, stats_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      sessionId,
      roomCode,
      Date.now(),
      rounds || 1,
      winnerName || 'Unknown',
      winnerScore || 0,
      JSON.stringify(stats || {})
    );
    stmt.finalize();

    if (Array.isArray(history)) {
      const logStmt = db.prepare(`
        INSERT INTO game_logs (session_id, room_code, timestamp, event_type, log_message)
        VALUES (?, ?, ?, ?, ?)
      `);
      history.forEach(h => {
        logStmt.run(sessionId, roomCode, h.timestamp || Date.now(), h.type || 'EVENT', h.message || '');
      });
      logStmt.finalize();
    }
  } else {
    const data = readJsonStore();
    data.sessions.push({
      id: sessionId,
      roomCode,
      createdAt: Date.now(),
      totalRounds: rounds || 1,
      winnerName,
      winnerScore,
      stats
    });
    if (Array.isArray(history)) {
      history.forEach(h => {
        data.logs.push({
          sessionId,
          roomCode,
          timestamp: h.timestamp || Date.now(),
          type: h.type,
          message: h.message
        });
      });
    }
    writeJsonStore(data);
  }
}

/**
 * Get recent game history
 */
function getRecentGames(limit = 10, callback) {
  if (db && !useJsonStore) {
    db.all(`SELECT * FROM game_sessions ORDER BY created_at DESC LIMIT ?`, [limit], (err, rows) => {
      if (err) callback(err, null);
      else callback(null, rows);
    });
  } else {
    const data = readJsonStore();
    const recent = data.sessions.slice(-limit).reverse();
    callback(null, recent);
  }
}

module.exports = {
  saveGameSession,
  getRecentGames
};
