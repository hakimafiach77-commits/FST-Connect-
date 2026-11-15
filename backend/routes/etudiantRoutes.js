const express = require('express');
const router = express.Router();
const {
  getEtudiants,
  getMonProfilEtudiant,
  getEtudiantById,
  createEtudiant,
  updateEtudiant,
  deleteEtudiant,
  affecterEtudiantsGroupes
} = require('../controllers/etudiantController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Toutes les routes exigent une authentification valide
router.use(protect);

// 1. Profil de l'étudiant actuellement connecté (doit être déclaré avant /:id)
router.get('/me', getMonProfilEtudiant);

// 2. Affectation collective d'étudiants aux groupes TD / TP (doit être déclaré avant /:id)
router.post('/affecter', authorize('admin'), affecterEtudiantsGroupes);

// 3. Liste des étudiants (Admin et Enseignants) et Inscription (Admin)
router.route('/')
  .get(authorize('admin', 'teacher'), getEtudiants)
  .post(authorize('admin'), createEtudiant);

// 4. Consultation unitaire, Modification et Suppression sécurisée
router.route('/:id')
  .get(getEtudiantById)
  .patch(authorize('admin'), updateEtudiant)
  .delete(authorize('admin'), deleteEtudiant);

module.exports = router;
