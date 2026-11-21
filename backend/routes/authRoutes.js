const express = require('express');
const router = express.Router();
const { login, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// @desc    Login user
// @route   POST /api/auth/login
router.post('/login', login);

// @desc    Get current user profile
// @route   GET /api/auth/me
router.get('/me', protect, getMe);

// @desc    Demande de réinitialisation de mot de passe
// @route   POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// @desc    Réinitialisation effective avec jeton
// @route   POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

module.exports = router;
