const db = require('../src/config/db');
const bcrypt = require('bcryptjs');

const ADMIN_PANEL_USER_LIMIT = 4;
const DEMO_LIMIT = 2;

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone TEXT,
    blood_group TEXT,
    age INTEGER,
    district TEXT,
    latitude REAL DEFAULT 27.7172,
    longitude REAL DEFAULT 85.3240,
    last_donated_at TEXT,
    available_to_donate INTEGER DEFAULT 1,
    receive_emergency_alerts INTEGER DEFAULT 1,
    receive_blood_alerts INTEGER DEFAULT 1,
    role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin', 'hospital')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS emergency_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK(type IN ('flood', 'fire', 'earthquake', 'road_blockage', 'landslide', 'public_danger', 'other')),
    severity TEXT NOT NULL CHECK(severity IN ('low', 'medium', 'high', 'critical')),
    radius_km REAL DEFAULT 10,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    expires_at TEXT NOT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now')),
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'expired', 'cancelled'))
  );

  CREATE TABLE IF NOT EXISTS blood_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hospital_name TEXT NOT NULL,
    blood_group TEXT NOT NULL,
    units_needed INTEGER NOT NULL DEFAULT 1,
    urgency TEXT NOT NULL CHECK(urgency IN ('normal', 'urgent', 'critical')),
    contact_number TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    radius_km REAL DEFAULT 5,
    expires_at TEXT NOT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now')),
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'fulfilled', 'expired', 'cancelled'))
  );

  CREATE TABLE IF NOT EXISTS donor_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL REFERENCES blood_requests(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    response_status TEXT NOT NULL CHECK(response_status IN ('willing', 'unavailable')),
    responded_at TEXT DEFAULT (datetime('now')),
    UNIQUE(request_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    message TEXT,
    type TEXT NOT NULL CHECK(type IN ('emergency', 'blood_request', 'response', 'system')),
    read INTEGER DEFAULT 0,
    reference_id INTEGER,
    reference_type TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_users_blood_group ON users(blood_group);
  CREATE INDEX IF NOT EXISTS idx_users_available ON users(available_to_donate);
  CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude);
  CREATE INDEX IF NOT EXISTS idx_emergency_status ON emergency_alerts(status);
  CREATE INDEX IF NOT EXISTS idx_blood_status ON blood_requests(status);
  CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);
  CREATE INDEX IF NOT EXISTS idx_donor_responses_request ON donor_responses(request_id);
`);

console.log('Database tables created successfully');

// Seed users (4 total for admin panel)
const adminPassword = bcrypt.hashSync('admin123', 10);
const userPassword = bcrypt.hashSync('user123', 10);

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (name, email, password_hash, phone, blood_group, age, district, latitude, longitude, last_donated_at, available_to_donate, role)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const users = [
  ['Admin Nepal', 'admin@alert.np', adminPassword, '9841000001', 'O+', 35, 'Kathmandu', 27.7172, 85.3240, null, 0, 'admin'],
  ['Bir Hospital', 'bir@hospital.np', adminPassword, '9841000002', null, null, 'Kathmandu', 27.7050, 85.3140, null, 0, 'hospital'],
  ['Demo Donor One', 'donor1@example.com', userPassword, '9841100001', 'A+', 28, 'Kathmandu', 27.7100, 85.3200, '2024-01-15', 1, 'user'],
  ['Demo Donor Two', 'donor2@example.com', userPassword, '9841100002', 'B+', 32, 'Kathmandu', 27.7150, 85.3300, null, 1, 'user'],
].slice(0, ADMIN_PANEL_USER_LIMIT);

const insertMany = db.transaction(() => {
  for (const user of users) {
    insertUser.run(...user);
  }
});
insertMany();
console.log('Users seeded');

const getUserId = db.prepare('SELECT id FROM users WHERE email = ?');
const adminUserId = getUserId.get('admin@alert.np')?.id;
const hospitalUserId = getUserId.get('bir@hospital.np')?.id;
const donorOneId = getUserId.get('donor1@example.com')?.id;
const donorTwoId = getUserId.get('donor2@example.com')?.id;

if (!adminUserId || !hospitalUserId || !donorOneId || !donorTwoId) {
  throw new Error('Required seed users were not found.');
}

// Seed emergency alerts (max 2 demos)
const insertAlert = db.prepare(`
  INSERT OR IGNORE INTO emergency_alerts (title, description, type, severity, radius_km, latitude, longitude, expires_at, created_by)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const alerts = [
  ['Flood Warning - Kathmandu Valley', 'Heavy rainfall expected. Kathmandu valley at risk. Stay alert and avoid flooded areas.', 'flood', 'high', 15, 27.7172, 85.3240, '2026-04-10 23:59:59', adminUserId],
  ['Road Blockage - Ring Road Section', 'Traffic disruption reported near major junctions. Use alternate routes and avoid congested sections.', 'road_blockage', 'medium', 8, 27.7090, 85.3320, '2026-04-12 23:59:59', adminUserId],
].slice(0, DEMO_LIMIT);

const insertAlerts = db.transaction(() => {
  for (const alert of alerts) {
    insertAlert.run(...alert);
  }
});
insertAlerts();
console.log('Emergency alerts seeded');

// Seed blood requests (max 2 demos)
const insertBlood = db.prepare(`
  INSERT OR IGNORE INTO blood_requests (hospital_name, blood_group, units_needed, urgency, contact_number, latitude, longitude, radius_km, expires_at, created_by)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const bloodRequests = [
  ['Bir Hospital', 'A+', 3, 'critical', '01-4221119', 27.7050, 85.3140, 8, '2026-04-10 23:59:59', hospitalUserId],
  ['Bir Hospital', 'O+', 2, 'urgent', '01-4221119', 27.7050, 85.3140, 8, '2026-04-12 23:59:59', hospitalUserId],
].slice(0, DEMO_LIMIT);

const insertBloods = db.transaction(() => {
  for (const bloodRequest of bloodRequests) {
    insertBlood.run(...bloodRequest);
  }
});
insertBloods();
console.log('Blood requests seeded');

// Seed notifications (max 2 demos)
const insertNotif = db.prepare(`
  INSERT OR IGNORE INTO notifications (user_id, title, message, type, reference_id, reference_type)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const notifications = [
  [donorOneId, 'Flood Warning', 'Heavy rainfall warning for Kathmandu Valley. Stay safe!', 'emergency', null, null],
  [donorTwoId, 'Blood Needed: A+', 'Bir Hospital urgently needs A+ blood. Can you donate?', 'blood_request', null, null],
].slice(0, DEMO_LIMIT);

const insertNotifs = db.transaction(() => {
  for (const notification of notifications) {
    insertNotif.run(...notification);
  }
});
insertNotifs();
console.log('Notifications seeded');
console.log('\nDatabase initialization complete');
