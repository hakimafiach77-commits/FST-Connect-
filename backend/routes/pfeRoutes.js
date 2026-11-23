const express = require('express');
const router = express.Router();
const { getAllPFE, proposePFE, getMyPFE, assignEncadrant, updatePFE, setFinalGrade } = require('../controllers/pfeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// 1. Consultation des PFEs
router.get('/', authorize('admin', 'teacher'), getAllPFE);
router.get('/me', getMyPFE);

// 2. Proposition de PFE (Étudiant)
router.post('/propose', authorize('student'), proposePFE);

// 3. Attribution d'un encadrant (Admin)
router.patch('/assign', authorize('admin'), assignEncadrant);

// 4. Mise à jour détails / état (Admin ou Enseignant encadrant)
router.patch('/:id', authorize('admin', 'teacher'), updatePFE);

// 5. Enregistrement note finale (Admin)
router.patch('/:id/grade', authorize('admin'), setFinalGrade);

module.exports = router;
