const express = require('express');
const router = express.Router();
const { getFilieres, createFiliere, updateFiliere, deleteFiliere } = require('../controllers/filiereController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get all programs - Any authenticated user
router.get('/', protect, getFilieres);

// Create program - Admin only
router.post('/', protect, authorize('admin'), createFiliere);

// Update program - Admin only
router.patch('/:id', protect, authorize('admin'), updateFiliere);

// Delete program - Admin only
router.delete('/:id', protect, authorize('admin'), deleteFiliere);

module.exports = router;
