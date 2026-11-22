const express = require('express');
const router = express.Router();
const {
  getExamens,
  getExamenById,
  createExamen,
  updateExamen,
  deleteExamen
} = require('../controllers/examenController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Consultation des examens
router.get('/', getExamens);
router.get('/:id', getExamenById);

// Création et modification (Admin et Enseignant)
router.post('/', authorize('admin', 'teacher'), createExamen);
router.patch('/:id', authorize('admin', 'teacher'), updateExamen);

// Suppression (Admin uniquement avec garde-fou contre suppression avec notes)
router.delete('/:id', authorize('admin'), deleteExamen);

module.exports = router;

