const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getUtilisateurs,
  getUtilisateurById,
  createUtilisateur,
  updateUtilisateur,
  toggleStatutUtilisateur
} = require('../controllers/utilisateurController');

// Toutes les routes utilisateurs exigent une authentification valide
router.use(protect);

// 1. Liste et création administrative
router.route('/')
  .get(authorize('admin'), getUtilisateurs)
  .post(authorize('admin'), createUtilisateur);

// 2. Consultation et mise à jour (admin ou propriétaire contrôlé dans le contrôleur)
router.route('/:id')
  .get(getUtilisateurById)
  .patch(updateUtilisateur);

// 3. Changement de statut administratif (activation / désactivation)
router.patch('/:id/statut', authorize('admin'), toggleStatutUtilisateur);

module.exports = router;

