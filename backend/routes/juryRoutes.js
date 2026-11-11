const express = require('express');
const router = express.Router();
const { createJury, getJuries } = require('../controllers/juryController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Create jury - Admin Only
router.post('/', protect, authorize('admin'), createJury);

// Get all juries
router.get('/', protect, getJuries);

module.exports = router;
