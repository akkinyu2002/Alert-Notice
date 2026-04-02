const db = require('../config/db');
const { findMatchingDonors } = require('../services/matchingService');

function createBloodRequest(req, res) {
  try {
    const { hospital_name, blood_group, units_needed, urgency, contact_number, latitude, longitude, radius_km, expires_at } = req.body;

    if (!hospital_name || !blood_group || !urgency || !contact_number || !latitude || !longitude || !expires_at) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const validUrgencies = ['normal', 'urgent', 'critical'];

    if (!validBloodGroups.includes(blood_group)) {
      return res.status(400).json({ error: `Invalid blood group. Must be one of: ${validBloodGroups.join(', ')}` });
    }
    if (!validUrgencies.includes(urgency)) {
      return res.status(400).json({ error: `Invalid urgency. Must be one of: ${validUrgencies.join(', ')}` });
    }

    const result = db.prepare(`
      INSERT INTO blood_requests (hospital_name, blood_group, units_needed, urgency, contact_number, latitude, longitude, radius_km, expires_at, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(hospital_name, blood_group, units_needed || 1, urgency, contact_number, latitude, longitude, radius_km || 5, expires_at, req.user.id);

    const request = db.prepare('SELECT * FROM blood_requests WHERE id = ?').get(result.lastInsertRowid);

    // Find and notify matching donors
    const matchedDonors = findMatchingDonors(request);

    res.status(201).json({ request, matchedDonors: matchedDonors.length });
  } catch (err) {
    console.error('Create blood request error:', err);
    res.status(500).json({ error: 'Failed to create blood request.' });
  }
}

function getBloodRequests(req, res) {
  try {
    const { status = 'active' } = req.query;
    const requests = db.prepare(`
      SELECT br.*, u.name as created_by_name,
        (SELECT COUNT(*) FROM donor_responses dr WHERE dr.request_id = br.id AND dr.response_status = 'willing') as willing_count,
        (SELECT COUNT(*) FROM donor_responses dr WHERE dr.request_id = br.id) as total_responses
      FROM blood_requests br
      LEFT JOIN users u ON br.created_by = u.id
      WHERE br.status = ?
      ORDER BY 
        CASE br.urgency WHEN 'critical' THEN 0 WHEN 'urgent' THEN 1 ELSE 2 END,
        br.created_at DESC
    `).all(status);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get blood requests.' });
  }
}

function getAllBloodRequests(req, res) {
  try {
    const requests = db.prepare(`
      SELECT br.*, u.name as created_by_name,
        (SELECT COUNT(*) FROM donor_responses dr WHERE dr.request_id = br.id AND dr.response_status = 'willing') as willing_count,
        (SELECT COUNT(*) FROM donor_responses dr WHERE dr.request_id = br.id) as total_responses
      FROM blood_requests br
      LEFT JOIN users u ON br.created_by = u.id
      ORDER BY br.created_at DESC
    `).all();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get blood requests.' });
  }
}

function getBloodRequestById(req, res) {
  try {
    const request = db.prepare(`
      SELECT br.*, u.name as created_by_name
      FROM blood_requests br
      LEFT JOIN users u ON br.created_by = u.id
      WHERE br.id = ?
    `).get(req.params.id);

    if (!request) return res.status(404).json({ error: 'Blood request not found.' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get blood request.' });
  }
}

module.exports = { createBloodRequest, getBloodRequests, getAllBloodRequests, getBloodRequestById };
