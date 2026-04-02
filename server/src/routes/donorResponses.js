const express = require('express');
const { respondToRequest, getResponsesForRequest, getMyResponses } = require('../controllers/donorResponseController');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, respondToRequest);
router.get('/mine', auth, getMyResponses);
router.get('/request/:requestId', auth, adminOnly, getResponsesForRequest);

module.exports = router;
