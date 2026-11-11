const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// @desc    Login user
// @route   POST /api/auth/login
router.post('/login', login);

// @desc    Get current user profile
// @route   GET /api/auth/me
router.get('/me', protect, getMe);

module.exports = router;
