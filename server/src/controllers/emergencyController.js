const db = require('../config/db');
const { findUsersForEmergencyAlert } = require('../services/matchingService');
const { broadcastEmergencyToCellTowers, sanitizeTowerIds } = require('../services/cellBroadcastService');

async function createAlert(req, res) {
  try {
    const {
      title,
      description,
      type,
      severity,
      radius_km,
      latitude,
      longitude,
      expires_at,
      tower_ids,
      broadcast_to_towers,
    } = req.body;

    const missingRequired =
      title == null ||
      type == null ||
      severity == null ||
      latitude == null ||
      longitude == null ||
      expires_at == null;

    if (missingRequired) {
      return res.status(400).json({
        error: 'Missing required fields: title, type, severity, latitude, longitude, expires_at',
      });
    }

    const validTypes = ['flood', 'fire', 'earthquake', 'road_blockage', 'landslide', 'public_danger', 'other'];
    const validSeverities = ['low', 'medium', 'high', 'critical'];

    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
    }
    if (!validSeverities.includes(severity)) {
      return res.status(400).json({ error: `Invalid severity. Must be one of: ${validSeverities.join(', ')}` });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    const radiusKm = Number(radius_km || 10);

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(radiusKm) || radiusKm <= 0) {
      return res.status(400).json({
        error: 'Invalid coordinates or radius_km. latitude/longitude must be numbers and radius_km must be > 0.',
      });
    }

    const creatorId = req.user?.id || null;

    const result = db
      .prepare(`
      INSERT INTO emergency_alerts (title, description, type, severity, radius_km, latitude, longitude, expires_at, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
      .run(title, description || '', type, severity, radiusKm, lat, lng, expires_at, creatorId);

    const alert = db.prepare('SELECT * FROM emergency_alerts WHERE id = ?').get(result.lastInsertRowid);

    const notifiedUsers = findUsersForEmergencyAlert(alert);

    const shouldBroadcastToTowers =
      !(
        broadcast_to_towers === false ||
        broadcast_to_towers === 0 ||
        String(broadcast_to_towers).toLowerCase() === 'false'
      );
    let towerBroadcast = {
      attempted: false,
      sent: false,
      reason: 'broadcast_to_towers is false',
    };

    if (shouldBroadcastToTowers) {
      towerBroadcast = await broadcastEmergencyToCellTowers(alert, {
        towerIds: sanitizeTowerIds(tower_ids),
        message: description,
      });
    }

    res.status(201).json({
      alert,
      notifiedCount: notifiedUsers.length,
      towerBroadcast,
    });
  } catch (err) {
    console.error('Create alert error:', err);
    res.status(500).json({ error: 'Failed to create alert.' });
  }
}

function getAlerts(req, res) {
  try {
    const { status = 'active' } = req.query;
    const alerts = db
      .prepare(`
      SELECT ea.*, u.name as created_by_name
      FROM emergency_alerts ea
      LEFT JOIN users u ON ea.created_by = u.id
      WHERE ea.status = ?
      ORDER BY ea.created_at DESC
    `)
      .all(status);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get alerts.' });
  }
}

function getAllAlerts(req, res) {
  try {
    const alerts = db
      .prepare(`
      SELECT ea.*, u.name as created_by_name
      FROM emergency_alerts ea
      LEFT JOIN users u ON ea.created_by = u.id
      ORDER BY ea.created_at DESC
    `)
      .all();
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get alerts.' });
  }
}

function getAlertById(req, res) {
  try {
    const alert = db
      .prepare(`
      SELECT ea.*, u.name as created_by_name
      FROM emergency_alerts ea
      LEFT JOIN users u ON ea.created_by = u.id
      WHERE ea.id = ?
    `)
      .get(req.params.id);

    if (!alert) return res.status(404).json({ error: 'Alert not found.' });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get alert.' });
  }
}

module.exports = { createAlert, getAlerts, getAllAlerts, getAlertById };
