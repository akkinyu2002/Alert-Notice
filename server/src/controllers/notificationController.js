const { getUserNotifications, markAsRead, markAllAsRead, getUnreadCount } = require('../services/notificationService');

function getNotifications(req, res) {
  try {
    const notifications = getUserNotifications(req.user.id);
    const unreadCount = getUnreadCount(req.user.id);
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get notifications.' });
  }
}

function markNotificationRead(req, res) {
  try {
    markAsRead(req.params.id, req.user.id);
    res.json({ message: 'Notification marked as read.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification.' });
  }
}

function markAllRead(req, res) {
  try {
    markAllAsRead(req.user.id);
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notifications.' });
  }
}

module.exports = { getNotifications, markNotificationRead, markAllRead };
