const db = require('../config/db');

function updateProfile(req, res) {
  try {
    const { name, phone, blood_group, age, district, latitude, longitude, last_donated_at, available_to_donate, receive_emergency_alerts, receive_blood_alerts } = req.body;

    db.prepare(`
      UPDATE users SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        blood_group = COALESCE(?, blood_group),
        age = COALESCE(?, age),
        district = COALESCE(?, district),
        latitude = COALESCE(?, latitude),
        longitude = COALESCE(?, longitude),
        last_donated_at = COALESCE(?, last_donated_at),
        available_to_donate = COALESCE(?, available_to_donate),
        receive_emergency_alerts = COALESCE(?, receive_emergency_alerts),
        receive_blood_alerts = COALESCE(?, receive_blood_alerts),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      name || null, phone || null, blood_group || null, age || null,
      district || null, latitude || null, longitude || null,
      last_donated_at || null,
      available_to_donate !== undefined ? (available_to_donate ? 1 : 0) : null,
      receive_emergency_alerts !== undefined ? (receive_emergency_alerts ? 1 : 0) : null,
      receive_blood_alerts !== undefined ? (receive_blood_alerts ? 1 : 0) : null,
      req.user.id
    );

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    const { password_hash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
}

function getAllUsers(req, res) {
  try {
    const users = db.prepare(`
      SELECT id, name, email, phone, blood_group, age, district, latitude, longitude, 
             last_donated_at, available_to_donate, receive_emergency_alerts, receive_blood_alerts, role, created_at
      FROM users ORDER BY created_at DESC
    `).all();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get users.' });
  }
}

function getUserStats(req, res) {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('user').count;
    const availableDonors = db.prepare('SELECT COUNT(*) as count FROM users WHERE available_to_donate = 1 AND role = ?').get('user').count;
    const activeAlerts = db.prepare("SELECT COUNT(*) as count FROM emergency_alerts WHERE status = 'active'").get().count;
    const activeBloodRequests = db.prepare("SELECT COUNT(*) as count FROM blood_requests WHERE status = 'active'").get().count;
    const totalResponses = db.prepare('SELECT COUNT(*) as count FROM donor_responses').get().count;

    const bloodGroupStats = db.prepare(`
      SELECT blood_group, COUNT(*) as count 
      FROM users WHERE blood_group IS NOT NULL AND role = 'user'
      GROUP BY blood_group
    `).all();

    res.json({ totalUsers, availableDonors, activeAlerts, activeBloodRequests, totalResponses, bloodGroupStats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get stats.' });
  }
}

module.exports = { updateProfile, getAllUsers, getUserStats };
