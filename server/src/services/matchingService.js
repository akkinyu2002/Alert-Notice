const db = require('../config/db');
const { filterUsersWithinRadius } = require('./geoService');
const { createNotifications } = require('./notificationService');

/**
 * Find matching donors for a blood request
 * Criteria: blood group, availability, safe donation interval (56 days), distance
 */
function findMatchingDonors(bloodRequest) {
  const { blood_group, latitude, longitude, radius_km, id: requestId } = bloodRequest;

  // Get all potential donors with matching blood group who are available
  const donors = db
    .prepare(`
    SELECT * FROM users
    WHERE blood_group = ?
      AND available_to_donate = 1
      AND receive_blood_alerts = 1
      AND role = 'user'
      AND (
        last_donated_at IS NULL
        OR julianday('now') - julianday(last_donated_at) >= 56
      )
  `)
    .all(blood_group);

  // Filter by distance
  const nearbyDonors = filterUsersWithinRadius(donors, latitude, longitude, radius_km);

  // Create notifications for matched donors
  if (nearbyDonors.length > 0) {
    createNotifications(
      nearbyDonors.map((d) => d.id),
      `Blood Needed: ${blood_group}`,
      `${bloodRequest.hospital_name} urgently needs ${bloodRequest.units_needed} unit(s) of ${blood_group} blood. Distance: nearby. Can you donate?`,
      'blood_request',
      requestId,
      'blood_request'
    );
  }

  console.log(`[MATCHING] Found ${nearbyDonors.length} matching donors for blood request #${requestId} (${blood_group})`);
  return nearbyDonors;
}

/**
 * Find all users within radius for emergency alert
 */
function findUsersForEmergencyAlert(alert) {
  const { latitude, longitude, radius_km, id: alertId, title } = alert;

  const users = db
    .prepare(`
    SELECT * FROM users
    WHERE receive_emergency_alerts = 1
      AND role = 'user'
  `)
    .all();

  const nearbyUsers = filterUsersWithinRadius(users, latitude, longitude, radius_km);

  // Create notifications
  if (nearbyUsers.length > 0) {
    createNotifications(
      nearbyUsers.map((u) => u.id),
      `Emergency Alert: ${title}`,
      alert.description || 'Emergency alert in your area. Stay safe!',
      'emergency',
      alertId,
      'emergency_alert'
    );
  }

  console.log(`[MATCHING] Found ${nearbyUsers.length} users within ${radius_km}km for emergency alert #${alertId}`);
  return nearbyUsers;
}

module.exports = { findMatchingDonors, findUsersForEmergencyAlert };
