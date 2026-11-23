const express = require('express');
const router = express.Router();
const { getAllStages, requestStage, getMyStages, updateStageStatut } = require('../controllers/stageController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Consultation générale (Admin & Enseignants)
router.get('/', authorize('admin', 'teacher'), getAllStages);

// Consultation personnelle
router.get('/me', getMyStages);

// Demande de convention (Étudiant uniquement)
router.post('/request', authorize('student'), requestStage);

// Décision / Validation administrative (Admin uniquement)
router.patch('/:id/statut', authorize('admin'), updateStageStatut);

module.exports = router;
