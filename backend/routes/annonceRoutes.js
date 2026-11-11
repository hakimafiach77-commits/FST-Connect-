const express = require('express');
const router = express.Router();
const { publishAnnonce, getAnnonces, updateAnnonce, deleteAnnonce } = require('../controllers/annonceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get all announcements - Publicly viewable
router.get('/', getAnnonces);

// Create announcement - Admin Only
router.post('/', protect, authorize('admin'), publishAnnonce);

// Update announcement - Admin Only
router.patch('/:id', protect, authorize('admin'), updateAnnonce);

// Delete announcement - Admin Only
router.delete('/:id', protect, authorize('admin'), deleteAnnonce);

module.exports = router;
