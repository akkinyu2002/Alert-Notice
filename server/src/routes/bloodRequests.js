const express = require('express');
const { createBloodRequest, getBloodRequests, getAllBloodRequests, getBloodRequestById } = require('../controllers/bloodRequestController');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, adminOnly, createBloodRequest);
router.get('/', getBloodRequests);
router.get('/all', auth, adminOnly, getAllBloodRequests);
router.get('/:id', getBloodRequestById);

module.exports = router;
