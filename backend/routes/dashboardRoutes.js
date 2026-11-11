const express = require('express');
const router = express.Router();
const { getUserDashboard, refreshDashboard } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// Get contextual dashboard - Protected (Any logged in user)
router.get('/', protect, getUserDashboard);

// Refresh dashboard timestamp
router.patch('/refresh', protect, refreshDashboard);

module.exports = router;
