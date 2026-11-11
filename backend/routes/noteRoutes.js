const express = require('express');
const router = express.Router();
const { recordNote, recordBulkNotes, getMyNotes, submitReclamation, updateReclamation } = require('../controllers/noteController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Record/Update grade - Teacher Only
router.post('/', protect, authorize('teacher'), recordNote);

// Record bulk notes - Teacher Only
router.post('/bulk', protect, authorize('teacher'), recordBulkNotes);

// Get personal grades - Student Only
router.get('/me', protect, getMyNotes);

// Submit complaint - Student Only
router.post('/reclaim', protect, authorize('student'), submitReclamation);

// Update complaint status - Admin Only
router.patch('/reclaim/:id', protect, authorize('admin'), updateReclamation);

module.exports = router;
