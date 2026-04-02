const db = require('../config/db');
const { createNotifications } = require('../services/notificationService');

function respondToRequest(req, res) {
  try {
    const { request_id, response_status } = req.body;

    if (!request_id || !response_status) {
      return res.status(400).json({ error: 'request_id and response_status are required.' });
    }

    if (!['willing', 'unavailable'].includes(response_status)) {
      return res.status(400).json({ error: 'response_status must be willing or unavailable.' });
    }

    // Check if blood request exists
    const request = db.prepare('SELECT * FROM blood_requests WHERE id = ?').get(request_id);
    if (!request) {
      return res.status(404).json({ error: 'Blood request not found.' });
    }

    // Check if already responded
    const existing = db.prepare('SELECT * FROM donor_responses WHERE request_id = ? AND user_id = ?').get(request_id, req.user.id);
    if (existing) {
      // Update existing response
      db.prepare("UPDATE donor_responses SET response_status = ?, responded_at = datetime('now') WHERE id = ?").run(
        response_status,
        existing.id
      );
    } else {
      db
        .prepare('INSERT INTO donor_responses (request_id, user_id, response_status) VALUES (?, ?, ?)')
        .run(request_id, req.user.id, response_status);
    }

    // Notify the request creator
    if (response_status === 'willing') {
      const donor = db.prepare('SELECT name, blood_group FROM users WHERE id = ?').get(req.user.id);
      createNotifications(
        [request.created_by],
        'Donor Available',
        `${donor.name} (${donor.blood_group}) is willing to donate for your blood request at ${request.hospital_name}.`,
        'response',
        request_id,
        'blood_request'
      );
    }

    res.json({ message: 'Response recorded successfully.', response_status });
  } catch (err) {
    console.error('Respond error:', err);
    res.status(500).json({ error: 'Failed to record response.' });
  }
}

function getResponsesForRequest(req, res) {
  try {
    const responses = db
      .prepare(`
      SELECT dr.*, u.name, u.phone, u.blood_group, u.district
      FROM donor_responses dr
      JOIN users u ON dr.user_id = u.id
      WHERE dr.request_id = ?
      ORDER BY dr.responded_at DESC
    `)
      .all(req.params.requestId);

    res.json(responses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get responses.' });
  }
}

function getMyResponses(req, res) {
  try {
    const responses = db
      .prepare(`
      SELECT dr.*, br.hospital_name, br.blood_group as requested_blood_group, br.urgency, br.contact_number
      FROM donor_responses dr
      JOIN blood_requests br ON dr.request_id = br.id
      WHERE dr.user_id = ?
      ORDER BY dr.responded_at DESC
    `)
      .all(req.user.id);

    res.json(responses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get responses.' });
  }
}

module.exports = { respondToRequest, getResponsesForRequest, getMyResponses };
