# Procès-Verbal de Recette & Validation des Tests (PV QA)

**Projet** : FST-Connect (Plateforme Digitale du Département GI)  
**Tickets / Cartes Trello** : 
- `4.9 Communication et notifications`
- `4.11 Absences et justificatifs`
- `4.17 Réclamations`
**Responsables Dév** : AB, SK  
**Responsable Recette & Tests (QA)** : Lead Documentation & Tests  
**Date du Test** : 23 Novembre 2026  
**Statut Global** : **VALIDÉ (100% PASS - 57/57 Tests Reçus)**

---

## 1. Contexte et Périmètre Testé
Vérification technique, sécuritaire et fonctionnelle des modules d'assiduité, communication et gestion des litiges :
- **Carte 4.9 : Communication et Notifications**
  - Contrôleurs `annonceController.js` et `notificationController.js`.
  - Publication d'annonces administratives (`statut: 'PUBLIEE'`, `urgent`, ciblage `tous`, `enseignants`, `etudiants`).
  - Système de notifications personnelles avec marquage lu/non-lu (`/api/notifications/:id/read`) et contrôle de propriété stricte.
- **Carte 4.11 : Absences et Justificatifs**
  - Contrôleur `absenceController.js` et routes `/api/absences`.
  - Enregistrement de la feuille d'appel avec calcul automatique de la durée de la séance (`durationHours`).
  - Transaction atomique `$transaction` assurant la cohérence avec le `CompteurAbsence` (incrément/décrément automatique).
  - Gestion des justificatifs (`JustificatifForm`) avec restriction de taille (max 5 MB) et arbitrage administratif.
- **Carte 4.17 : Réclamations**
  - Contrôleur `noteController.js` (endpoints `/reclaim`).
  - Dépôt de contestation avec vérification d'appartenance de la note (`note.etudiant.utilisateurId === req.user.id`).
  - Console d'arbitrage `AdminReclamations.jsx` avec répercussion automatique de la note rectifiée lors de la validation.

---

## 2. Synthèse de l'Exécution des Tests

| N° | Catégorie de Test | Tests | Statut |
|---|---|:---:|:---:|
| **01** | Intégrité Architecturale & Présence des Fichiers | 14 | **PASS** |
| **02** | Modèle de Données Prisma (DB) | 11 | **PASS** |
| **03** | Sécurité des Routes & Contrôle d'Accès (RBAC) | 9 | **PASS** |
| **04** | Logique Métier Annonces & Notifications (4.9) | 5 | **PASS** |
| **05** | Logique Métier Absences & Compteur (4.11) | 8 | **PASS** |
| **06** | Logique Métier Réclamations (4.17) | 4 | **PASS** |
| **07** | Routage Applicatif & Store Global (App & DataContext) | 6 | **PASS** |
| **TOTAL** | **Validation Cartes 4.9, 4.11 & 4.17** | **57 / 57** | **100% SUCCÈS** |

---

## 3. Recommandation QA
- **Décision** : **Validation QA Accordée**. Les cartes 4.9, 4.11 et 4.17 sont prêtes à être passées en statut "Terminé" ou "À valider par la MOA".
