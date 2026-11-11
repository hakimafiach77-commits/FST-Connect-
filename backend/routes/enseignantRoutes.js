const express = require('express');
const router = express.Router();
const { getEnseignants, createEnseignant, updateEnseignant, deleteEnseignant } = require('../controllers/enseignantController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getEnseignants);
router.post('/', protect, authorize('admin'), createEnseignant);
router.patch('/:id', protect, authorize('admin'), updateEnseignant);
router.delete('/:id', protect, authorize('admin'), deleteEnseignant);

module.exports = router;
