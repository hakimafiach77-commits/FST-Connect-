const express = require('express');
const router = express.Router();
const {
  getEnseignants,
  getEnseignantById,
  getMonProfilEnseignant,
  updateMonProfilEnseignant,
  getMesModulesEnseignant,
  createEnseignant,
  updateEnseignant,
  updateStatutEnseignant,
  deleteEnseignant,
  getModulesEnseignant,
  createAffectation,
  deleteAffectation
} = require('../controllers/enseignantController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Toutes les routes enseignants nécessitent d'être connecté
router.use(protect);

// ── Profil personnel de l'enseignant connecté (role: teacher) ──
// IMPORTANT: Déclarer '/me' AVANT '/:id' pour éviter que 'me' soit capturé comme paramètre ':id'
router.get('/me', authorize('teacher'), getMonProfilEnseignant);
router.patch('/me', authorize('teacher'), updateMonProfilEnseignant);
router.get('/me/modules', authorize('teacher'), getMesModulesEnseignant);

// ── Répertoire et Inscription des enseignants ──
router.get('/', authorize('admin', 'teacher'), getEnseignants);
router.post('/', authorize('admin'), createEnseignant);

// ── Détails & Actions par ID Enseignant ──
router.get('/:id', authorize('admin', 'teacher'), getEnseignantById);
router.patch('/:id', authorize('admin'), updateEnseignant);
router.patch('/:id/statut', authorize('admin'), updateStatutEnseignant);
router.delete('/:id', authorize('admin'), deleteEnseignant);

// ── Modules associés & Gestion des affectations d'enseignement ──
router.get('/:id/modules', authorize('admin', 'teacher'), getModulesEnseignant);
router.post('/:id/affectations', authorize('admin'), createAffectation);
router.delete('/:id/affectations/:idAffectation', authorize('admin'), deleteAffectation);

module.exports = router;
