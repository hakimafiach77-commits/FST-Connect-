const express = require('express');
const router = express.Router();
const { getMyNotifications, markAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// Get my notification list
router.get('/', protect, getMyNotifications);

// Mark notification as read
router.patch('/:id/read', protect, markAsRead);

module.exports = router;
