const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../../vinylshop.db');
const db = new Database(dbPath);

// Enable WAL mode and foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

module.exports = db;
