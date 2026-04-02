const express = require('express');
const { createAlert, getAlerts, getAllAlerts, getAlertById } = require('../controllers/emergencyController');
const { auth, optionalAuth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/', optionalAuth, createAlert);
router.get('/', getAlerts);
router.get('/all', auth, adminOnly, getAllAlerts);
router.get('/:id', getAlertById);

module.exports = router;
