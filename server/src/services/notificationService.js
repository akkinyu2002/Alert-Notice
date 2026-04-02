const db = require('../config/db');

/**
 * Create notifications for multiple users
 * Simulates push notification + SMS delivery
 */
function createNotifications(userIds, title, message, type, referenceId, referenceType) {
  const insert = db.prepare(`
    INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction(() => {
    for (const userId of userIds) {
      insert.run(userId, title, message, type, referenceId, referenceType);
      // Simulate push notification
      console.log(`[FCM-MOCK] Push notification sent to user #${userId}: ${title}`);
      // Simulate SMS
      const user = db.prepare('SELECT phone FROM users WHERE id = ?').get(userId);
      if (user && user.phone) {
        console.log(`[SMS-MOCK] SMS sent to ${user.phone}: ${title}`);
      }
    }
  });

  insertMany();
  return userIds.length;
}

/**
 * Get notifications for a user
 */
function getUserNotifications(userId, limit = 50) {
  return db.prepare(`
    SELECT * FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).all(userId, limit);
}

/**
 * Mark notification as read
 */
function markAsRead(notificationId, userId) {
  return db.prepare(`
    UPDATE notifications SET read = 1
    WHERE id = ? AND user_id = ?
  `).run(notificationId, userId);
}

/**
 * Mark all notifications as read for a user
 */
function markAllAsRead(userId) {
  return db.prepare(`
    UPDATE notifications SET read = 1
    WHERE user_id = ? AND read = 0
  `).run(userId);
}

/**
 * Get unread count
 */
function getUnreadCount(userId) {
  const result = db.prepare(`
    SELECT COUNT(*) as count FROM notifications
    WHERE user_id = ? AND read = 0
  `).get(userId);
  return result.count;
}

module.exports = { createNotifications, getUserNotifications, markAsRead, markAllAsRead, getUnreadCount };
