const express = require('express');
const router = express.Router();
const { getMySchedule, createSeance, deleteSeance } = require('../controllers/scheduleController');
const { protect, authorize } = require('../middleware/authMiddleware');

// User's own schedule
router.get('/me', protect, getMySchedule);

// Admin-only management
router.post('/', protect, authorize('admin'), createSeance);
router.delete('/:id', protect, authorize('admin'), deleteSeance);

module.exports = router;
