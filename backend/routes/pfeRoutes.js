const express = require('express');
const router = express.Router();
const { proposePFE, getMyPFE, assignEncadrant, updatePFE, setFinalGrade } = require('../controllers/pfeController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get personal/assigned projects
router.get('/me', protect, getMyPFE);

// Student: Propose project
router.post('/propose', protect, authorize('student'), proposePFE);

// Admin: Assign supervisor
router.patch('/assign', protect, authorize('admin'), assignEncadrant);

// Update details/status
router.patch('/:id', protect, authorize('admin', 'teacher'), updatePFE);

// Record final grade
router.patch('/:id/grade', protect, authorize('admin'), setFinalGrade);

module.exports = router;
