const db = require('../src/config/db');
const bcrypt = require('bcryptjs');

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

console.log('✅ Database tables created successfully');

// Seed data
const adminPassword = bcrypt.hashSync('admin123', 10);
const userPassword = bcrypt.hashSync('user123', 10);

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (name, email, password_hash, phone, blood_group, age, district, latitude, longitude, last_donated_at, available_to_donate, role)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const users = [
  ['Admin Nepal', 'admin@alert.np', adminPassword, '9841000001', 'O+', 35, 'Kathmandu', 27.7172, 85.3240, null, 0, 'admin'],
  ['Bir Hospital', 'bir@hospital.np', adminPassword, '9841000002', null, null, 'Kathmandu', 27.7050, 85.3140, null, 0, 'hospital'],
  ['Grande Hospital', 'grande@hospital.np', adminPassword, '9841000003', null, null, 'Kathmandu', 27.6880, 85.3340, null, 0, 'hospital'],
  ['Ram Sharma', 'ram@gmail.com', userPassword, '9841100001', 'A+', 28, 'Kathmandu', 27.7100, 85.3200, '2024-01-15', 1, 'user'],
  ['Sita Thapa', 'sita@gmail.com', userPassword, '9841100002', 'B+', 25, 'Kathmandu', 27.7200, 85.3100, '2024-06-20', 1, 'user'],
  ['Hari Basnet', 'hari@gmail.com', userPassword, '9841100003', 'O+', 30, 'Lalitpur', 27.6680, 85.3206, '2024-03-10', 1, 'user'],
  ['Gita Rai', 'gita@gmail.com', userPassword, '9841100004', 'AB+', 22, 'Bhaktapur', 27.6710, 85.4298, null, 1, 'user'],
  ['Krishna KC', 'krishna@gmail.com', userPassword, '9841100005', 'A-', 32, 'Pokhara', 28.2096, 83.9856, '2024-08-01', 1, 'user'],
  ['Maya Gurung', 'maya@gmail.com', userPassword, '9841100006', 'B-', 27, 'Pokhara', 28.2200, 83.9900, null, 1, 'user'],
  ['Bikash Shrestha', 'bikash@gmail.com', userPassword, '9841100007', 'O-', 29, 'Kathmandu', 27.7300, 85.3400, '2024-09-15', 1, 'user'],
  ['Anita Tamang', 'anita@gmail.com', userPassword, '9841100008', 'A+', 24, 'Lalitpur', 27.6600, 85.3100, null, 1, 'user'],
  ['Dipak Magar', 'dipak@gmail.com', userPassword, '9841100009', 'B+', 31, 'Butwal', 27.7006, 83.4483, '2024-07-20', 1, 'user'],
];

const insertMany = db.transaction(() => {
  for (const u of users) {
    insertUser.run(...u);
  }
});
insertMany();
console.log('✅ Users seeded');

// Seed emergency alerts
const insertAlert = db.prepare(`
  INSERT OR IGNORE INTO emergency_alerts (title, description, type, severity, radius_km, latitude, longitude, expires_at, created_by)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const alerts = [
  ['Flood Warning - Bagmati River', 'Heavy rainfall expected. Bagmati river water level rising rapidly. Evacuate low-lying areas immediately.', 'flood', 'critical', 15, 27.7000, 85.3300, '2026-04-05 23:59:59', 1],
  ['Road Blockage - Prithvi Highway', 'Landslide near Mugling. Prithvi Highway blocked. Avoid travel between Mugling-Narayanghat section.', 'road_blockage', 'high', 20, 27.8700, 84.5600, '2026-04-03 18:00:00', 1],
  ['Fire Alert - Thamel Area', 'Fire reported in commercial building near Thamel Chowk. Fire brigade on the way. Stay away from the area.', 'fire', 'medium', 5, 27.7153, 85.3126, '2026-04-02 12:00:00', 1],
];

const insertAlerts = db.transaction(() => {
  for (const a of alerts) {
    insertAlert.run(...a);
  }
});
insertAlerts();
console.log('✅ Emergency alerts seeded');

// Seed blood requests
const insertBlood = db.prepare(`
  INSERT OR IGNORE INTO blood_requests (hospital_name, blood_group, units_needed, urgency, contact_number, latitude, longitude, radius_km, expires_at, created_by)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const bloodRequests = [
  ['Bir Hospital', 'A+', 3, 'critical', '01-4221119', 27.7050, 85.3140, 8, '2026-04-03 23:59:59', 2],
  ['Grande Hospital', 'O+', 2, 'urgent', '01-5159266', 27.6880, 85.3340, 6, '2026-04-04 23:59:59', 3],
  ['Bir Hospital', 'B+', 1, 'normal', '01-4221119', 27.7050, 85.3140, 10, '2026-04-05 23:59:59', 2],
];

const insertBloods = db.transaction(() => {
  for (const b of bloodRequests) {
    insertBlood.run(...b);
  }
});
insertBloods();
console.log('✅ Blood requests seeded');

// Seed some notifications
const insertNotif = db.prepare(`
  INSERT OR IGNORE INTO notifications (user_id, title, message, type, reference_id, reference_type)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const notifs = [
  [4, '🚨 Flood Warning', 'Heavy rainfall warning for Bagmati River area. Stay safe!', 'emergency', 1, 'emergency_alert'],
  [5, '🚨 Flood Warning', 'Heavy rainfall warning for Bagmati River area. Stay safe!', 'emergency', 1, 'emergency_alert'],
  [4, '🩸 Blood Needed: A+', 'Bir Hospital urgently needs A+ blood. Can you donate?', 'blood_request', 1, 'blood_request'],
  [11, '🩸 Blood Needed: A+', 'Bir Hospital urgently needs A+ blood. Can you donate?', 'blood_request', 1, 'blood_request'],
];

const insertNotifs = db.transaction(() => {
  for (const n of notifs) {
    insertNotif.run(...n);
  }
});
insertNotifs();
console.log('✅ Notifications seeded');
console.log('\\n🎉 Database initialization complete!');
