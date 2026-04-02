const express = require('express');
const { getNotifications, markNotificationRead, markAllRead } = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getNotifications);
router.put('/read-all', auth, markAllRead);
router.put('/:id/read', auth, markNotificationRead);

module.exports = router;
