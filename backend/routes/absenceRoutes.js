const express = require('express');
const router = express.Router();
const { recordAbsence, getMyAbsences, updateAbsence } = require('../controllers/absenceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Record absence (roll-call) - Teacher or Admin only
router.post('/', protect, authorize('teacher', 'admin'), recordAbsence);

// Update absence status / validate justificatif - Teacher or Admin only
router.patch('/:id', protect, authorize('teacher', 'admin'), updateAbsence);

// Get personal absences - Student only
router.get('/me', protect, getMyAbsences);

module.exports = router;
