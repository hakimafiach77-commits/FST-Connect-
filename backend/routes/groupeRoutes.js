const express = require('express');
const router = express.Router();
const { getGroupes, createGroupe, updateGroupe, deleteGroupe } = require('../controllers/groupeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getGroupes);
router.post('/', protect, authorize('admin'), createGroupe);
router.patch('/:id', protect, authorize('admin'), updateGroupe);
router.delete('/:id', protect, authorize('admin'), deleteGroupe);

module.exports = router;
