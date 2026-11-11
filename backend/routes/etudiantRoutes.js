const express = require('express');
const router = express.Router();
const { getEtudiants, createEtudiant, updateEtudiant, deleteEtudiant } = require('../controllers/etudiantController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getEtudiants);
router.post('/', protect, authorize('admin'), createEtudiant);
router.patch('/:id', protect, authorize('admin'), updateEtudiant);
router.delete('/:id', protect, authorize('admin'), deleteEtudiant);

module.exports = router;
