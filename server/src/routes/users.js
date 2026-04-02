const express = require('express');
const { updateProfile, getAllUsers, getUserStats } = require('../controllers/userController');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.put('/profile', auth, updateProfile);
router.get('/', auth, adminOnly, getAllUsers);
router.get('/stats', auth, getUserStats);

module.exports = router;
