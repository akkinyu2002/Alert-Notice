const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'db', 'alert_system.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Lightweight startup migration for image evidence on emergency alerts.
const emergencyAlertsTable = db
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'emergency_alerts'")
  .get();

if (emergencyAlertsTable) {
  const emergencyAlertColumns = db.prepare("PRAGMA table_info('emergency_alerts')").all();
  const hasImageUrlColumn = emergencyAlertColumns.some((column) => column.name === 'image_url');

  if (!hasImageUrlColumn) {
    db.exec('ALTER TABLE emergency_alerts ADD COLUMN image_url TEXT');
  }
}

module.exports = db;
