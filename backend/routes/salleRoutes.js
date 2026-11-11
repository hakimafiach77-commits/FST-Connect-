const express = require('express');
const router = express.Router();
const { getSalles, createSalle, updateSalle, deleteSalle } = require('../controllers/salleController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getSalles);
router.post('/', protect, authorize('admin'), createSalle);
router.patch('/:id', protect, authorize('admin'), updateSalle);
router.delete('/:id', protect, authorize('admin'), deleteSalle);

module.exports = router;
