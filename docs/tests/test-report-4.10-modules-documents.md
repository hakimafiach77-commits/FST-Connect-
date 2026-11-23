# Procès-Verbal de Recette & Validation des Tests (PV QA)

**Projet** : FST-Connect (Plateforme Digitale du Département GI)  
**Ticket / Carte Trello** : `4.10 Modules pédagogiques et documents`  
**Responsables Dév (Assignés)** : AB, SK  
**Responsable Recette & Tests (QA)** : Lead Documentation & Tests  
**Date du Test** : 23 Novembre 2026  
**Statut Global** : **VALIDÉ (100% PASS - 60/60 Tests Reçus)**

---

## 1. Contexte et Périmètre Testé
Vérification technique, sécuritaire et fonctionnelle du module **Modules pédagogiques et documents** (Tâche 4.10) :
- **Gestion des Modules d'Enseignement** :
  - Contrôleur `moduleController.js` et routes `/api/modules`.
  - Consultation contextuelle `/api/modules` et `/api/modules/:id` selon le rôle (`student` : modules de sa filière ; `teacher` : modules affectés ; `admin` : vue globale).
  - Administration des modules (`POST`, `PATCH`, `DELETE`) strictement réservée au rôle Administrateur (`protect, authorize('admin')`).
  - Garde-fous d'intégrité référentielle stricts et verrouillage transactionnel `FOR UPDATE` interdisant la suppression d'un module si des dépendances subsistent :
    - `MODULE_HAS_NOTES` : notes enregistrées.
    - `MODULE_HAS_EXAMENS` : examens planifiés.
    - `MODULE_HAS_SEANCES` : créneaux d'emplois du temps.
    - `MODULE_HAS_AFFECTATIONS` : affectations d'enseignants.
    - `MODULE_HAS_DOCUMENTS` : supports ou devoirs rattachés.
- **Gestion des Documents & Supports Pédagogiques** :
  - Contrôleur `documentController.js` et routes `/api/documents`.
  - Dépôt de supports (cours, TD, TP, devoirs) réservé aux enseignants et administrateurs (`protect, authorize('teacher', 'admin')`).
  - Validation des métadonnées (`titre`, `type`, `cheminFichier`, `idModule`).
  - Sécurité Anti-IDOR : interdiction stricte de modification ou de suppression d'un document si l'utilisateur n'en est pas l'auteur ou s'il n'a pas le rôle Administrateur (`existing.idAuteur !== req.user.id && req.user.role !== 'admin'`).
- **Interfaces Utilisateur (Frontend)** :
  - `AdminModules.jsx` : Gestion globale avec double filtrage filière/semestre, formulaires modaux et affectation du responsable d'enseignement.
  - `TeacherModules.jsx` : Espace enseignant avec onglets Ressources et Devoirs, formulaire d'importation et publication de supports.
  - `Ressources.jsx` : Espace étudiant en lecture seule stricte (règle RG32), affichage par badges chromatiques selon le type d'enseignement et téléchargement direct.

---

## 2. Synthèse de l'Exécution des Tests

| N° | Catégorie de Test | Tests | Statut |
|---|---|:---:|:---:|
| **01** | Intégrité Architecturale & Présence des Fichiers | 10 | **PASS** |
| **02** | Modèle de Données & Relations Prisma (DB) | 8 | **PASS** |
| **03** | Sécurité des Routes & Contrôle d'Accès (RBAC) | 9 | **PASS** |
| **04** | Logique Métier & Garde-fous de Suppression (moduleController) | 10 | **PASS** |
| **05** | Logique Métier & Contrôle Anti-IDOR (documentController) | 6 | **PASS** |
| **06** | Interfaces Admin, Enseignant & Étudiant (React) | 10 | **PASS** |
| **07** | Routage Applicatif & Store Global (App & DataContext) | 7 | **PASS** |
| **TOTAL** | **Validation Complète du Module Modules & Documents** | **60 / 60** | **100% SUCCÈS** |

---

## 3. Matrice Détaillée des Cas de Tests

| ID | Cas de Test | Résultat Attendu | Résultat Obtenu | Verdict |
|---|---|---|---|:---:|
| **TC-MOD-01** | Contrôleur modules | `moduleController.js` présent sous `backend/controllers/` | Conforme | **OK** |
| **TC-MOD-02** | Routes modules | `moduleRoutes.js` présent sous `backend/routes/` | Conforme | **OK** |
| **TC-MOD-03** | Contrôleur documents | `documentController.js` présent sous `backend/controllers/` | Conforme | **OK** |
| **TC-MOD-04** | Routes documents | `documentRoutes.js` présent sous `backend/routes/` | Conforme | **OK** |
| **TC-MOD-05** | Schéma Prisma | `schema.prisma` présent sous `backend/prisma/` | Conforme | **OK** |
| **TC-MOD-06** | Composant Admin Modules | `AdminModules.jsx` présent sous `src/pages/admin/` | Conforme | **OK** |
| **TC-MOD-07** | Composant Enseignant Modules | `TeacherModules.jsx` présent sous `src/pages/enseignant/` | Conforme | **OK** |
| **TC-MOD-08** | Composant Étudiant Ressources | `Ressources.jsx` présent sous `src/pages/etudiant/` | Conforme | **OK** |
| **TC-MOD-09** | Routeur applicatif | `App.jsx` présent sous `src/` | Conforme | **OK** |
| **TC-MOD-10** | Contexte global | `DataContext.jsx` présent sous `src/contexts/` | Conforme | **OK** |
| **TC-MOD-11** | Modèle Prisma Module | Modèle `Module` défini avec clé primaire auto-incrémentée | Conforme | **OK** |
| **TC-MOD-12** | Unicité code module | Contrainte `@unique` sur le code module | Conforme | **OK** |
| **TC-MOD-13** | Attributs Module | Présence de `intitule`, `coefficient`, `semestre` | Conforme | **OK** |
| **TC-MOD-14** | Liaisons Filière & Responsable | Présence de `idFiliere`, `idResponsable` | Conforme | **OK** |
| **TC-MOD-15** | Modèle Prisma Document | Modèle `Document` défini avec relations | Conforme | **OK** |
| **TC-MOD-16** | Attributs Document | Présence de `titre`, `cheminFichier`, `idModule` | Conforme | **OK** |
| **TC-MOD-17** | Traçabilité auteur | Attribut `idAuteur` configuré sur Document | Conforme | **OK** |
| **TC-MOD-18** | Horodatage upload | Valeur par défaut `@default(now())` sur `dateUpload` | Conforme | **OK** |
| **TC-MOD-19** | GET /api/modules | Protégé par authentification (`protect`) | Conforme | **OK** |
| **TC-MOD-20** | GET /api/modules/:id | Protégé par authentification (`protect`) | Conforme | **OK** |
| **TC-MOD-21** | POST /api/modules | Réservé strictement au rôle Administrateur | Conforme | **OK** |
| **TC-MOD-22** | PATCH /api/modules/:id | Réservé strictement au rôle Administrateur | Conforme | **OK** |
| **TC-MOD-23** | DELETE /api/modules/:id | Réservé strictement au rôle Administrateur | Conforme | **OK** |
| **TC-MOD-24** | POST /api/documents | Réservé aux rôles `teacher` et `admin` | Conforme | **OK** |
| **TC-MOD-25** | GET /api/documents/module/:id | Protégé par authentification (`protect`) | Conforme | **OK** |
| **TC-MOD-26** | PATCH /api/documents/:id | Réservé aux rôles `teacher` et `admin` | Conforme | **OK** |
| **TC-MOD-27** | DELETE /api/documents/:id | Réservé aux rôles `teacher` et `admin` | Conforme | **OK** |
| **TC-MOD-28** | Filtrage filière Étudiant | Restreint à `etudiant.idFiliere` | Conforme | **OK** |
| **TC-MOD-29** | Filtrage Enseignant | Restreint aux affectations de l'enseignant | Conforme | **OK** |
| **TC-MOD-30** | Vue Admin Modules | Accès complet sans restriction | Conforme | **OK** |
| **TC-MOD-31** | Verrouillage FOR UPDATE | Verrouillage exclusif lors de la suppression | Conforme | **OK** |
| **TC-MOD-32** | Garde Notes Module | Rejet de suppression avec `MODULE_HAS_NOTES` | Conforme | **OK** |
| **TC-MOD-33** | Garde Examens Module | Rejet de suppression avec `MODULE_HAS_EXAMENS` | Conforme | **OK** |
| **TC-MOD-34** | Garde Séances Module | Rejet de suppression avec `MODULE_HAS_SEANCES` | Conforme | **OK** |
| **TC-MOD-35** | Garde Affectations Module | Rejet de suppression avec `MODULE_HAS_AFFECTATIONS` | Conforme | **OK** |
| **TC-MOD-36** | Garde Documents Module | Rejet de suppression avec `MODULE_HAS_DOCUMENTS` | Conforme | **OK** |
| **TC-MOD-37** | Atomicité transactionnelle | Opérations sous transaction Prisma `$transaction` | Conforme | **OK** |
| **TC-MOD-38** | Validation titre document | Rejet si titre manquant avec `TITLE_REQUIRED` | Conforme | **OK** |
| **TC-MOD-39** | Validation module document | Contrôle de conformité de l'ID module | Conforme | **OK** |
| **TC-MOD-40** | Vérification existence module | Rejet 404 `MODULE_NOT_FOUND` si absent | Conforme | **OK** |
| **TC-MOD-41** | Sécurité Anti-IDOR | Blocage 403 si utilisateur non auteur et non admin | Conforme | **OK** |
| **TC-MOD-42** | Erreur 404 Document | Notification normalisée `DOCUMENT_NOT_FOUND` | Conforme | **OK** |
| **TC-MOD-43** | Suppression de document | Suppression sécurisée par clé primaire | Conforme | **OK** |
| **TC-MOD-44** | Filtre filière & semestre | Double filtrage interactif dans AdminModules | Conforme | **OK** |
| **TC-MOD-45** | Modal création/édition | Formulaire complet de gestion des modules | Conforme | **OK** |
| **TC-MOD-46** | Responsable de module | Attribution de l'enseignant coordinateur | Conforme | **OK** |
| **TC-MOD-47** | Modules assignés Enseignant | Filtrage dynamique selon `myModules` | Conforme | **OK** |
| **TC-MOD-48** | Onglets Ressources / Devoirs | Séparation claire des types de livrables | Conforme | **OK** |
| **TC-MOD-49** | Formulaire d'upload | Modal de téléversement des supports pédagogiques | Conforme | **OK** |
| **TC-MOD-50** | Modules filière Étudiant | Visibilité exclusive sur la filière d'inscription | Conforme | **OK** |
| **TC-MOD-51** | Règle RG32 (Lecture seule) | Consultation et téléchargement uniquement | Conforme | **OK** |
| **TC-MOD-52** | Typologie visuelle | Badges de couleur (Cours, TD, TP, Examen) | Conforme | **OK** |
| **TC-MOD-53** | Téléchargement supports | Fonctionnalité de téléchargement des fichiers | Conforme | **OK** |
| **TC-MOD-54** | Route admin /modules | Raccordement à `<AdminModules />` | Conforme | **OK** |
| **TC-MOD-55** | Route enseignant /teacher/modules | Raccordement à `<TeacherModules />` | Conforme | **OK** |
| **TC-MOD-56** | Route étudiant /etudiant/ressources | Raccordement à `<Ressources />` | Conforme | **OK** |
| **TC-MOD-57** | Clé primaire modules | Normalisation `modules: 'idModule'` dans DataContext | Conforme | **OK** |
| **TC-MOD-58** | Clé primaire documents | Normalisation `documents: 'idDocument'` dans DataContext | Conforme | **OK** |
| **TC-MOD-59** | Endpoint /modules | Mappage API conforme dans le store global | Conforme | **OK** |
| **TC-MOD-60** | Endpoint /documents | Mappage API conforme dans le store global | Conforme | **OK** |

---

## 4. Recommandation QA & Validation
- **Résultat Technique** : Le module 4.10 remplit l'ensemble des critères d'acceptation fonctionnels, de sécurité RBAC, de protection Anti-IDOR et d'intégrité transactionnelle.
- **Décision** : **Validation QA Accordée**. La carte Trello 4.10 peut être déplacée vers la colonne **"À valider par la MOA"** ou **"Terminé"**.
