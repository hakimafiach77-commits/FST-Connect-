# Procès-Verbal de Recette & Validation des Tests (PV QA)

**Projet** : FST-Connect (Plateforme Digitale du Département GI)  
**Ticket / Carte Trello** : `4.13 Filières, groupes et années universitaires`  
**Responsable Dév (Assigné)** : AS  
**Responsable Recette & Tests (QA)** : Lead Documentation & Tests  
**Date du Test** : 23 Novembre 2026  
**Statut Global** : **VALIDÉ (100% PASS - 44/44 Tests Reçus)**

---

## 1. Contexte et Périmètre Testé
Vérification technique, sécuritaire et fonctionnelle du module **Filières, groupes et années universitaires** (Tâche 4.13) :
- **API REST Backend** : Contrôleurs `filiereController.js` et `groupeController.js`, routes `/api/filieres` et `/api/groupes`, sécurité RBAC stricte (`protect`, `authorize('admin')`).
- **Modèle de Données & Relations Prisma** : `Filiere` (code unique, intitulé, durée, niveau d'étude, semestres), `Groupe` (nom, type TD/TP/Projet, capacité maximale, année, description, enseignant responsable), `Semestre` (libellé, état de clôture).
- **Garde-fous d'Intégrité Référentielle & Verrou FOR UPDATE** :
  - Interdiction de supprimer une filière si elle possède des étudiants, modules, groupes, documents ou emplois du temps associés (`FILIERE_HAS_STUDENTS`, etc.).
  - Interdiction de supprimer un groupe s'il possède des étudiants assignés en TD, TP ou Projet, ou des séances planifiées (`GROUPE_HAS_ETUDIANTS_TD`, etc.).
- **Frontend & Navigation** : Composant `AdminFilieres.jsx`, vitrine publique `Filieres.jsx`, calcul réactif des statistiques d'étudiants par filière (`filiereStats`), gestion des panneaux coulissants (`SlidePanel`).

---

## 2. Synthèse de l'Exécution des Tests

| N° | Catégorie de Test | Tests | Statut |
|---|---|:---:|:---:|
| **01** | Intégrité Architecturale & Fichiers du Module | 8 | **PASS** |
| **02** | Modèle de Données & Relations Prisma (DB) | 6 | **PASS** |
| **03** | Sécurité des Routes & Contrôle d'Accès (RBAC) | 8 | **PASS** |
| **04** | Logique Métier Backend (Filières & Groupes) | 5 | **PASS** |
| **05** | Garde-fous de Suppression & Verrouillage `FOR UPDATE` | 8 | **PASS** |
| **06** | Interface d'Administration Frontend (AdminFilieres) | 5 | **PASS** |
| **07** | Routage Applicatif & Gestion de l'État (DataContext) | 4 | **PASS** |
| **TOTAL** | **Validation Complète du Module Filières & Groupes** | **44 / 44** | **100% SUCCÈS** |

---

## 3. Matrice Détaillée des Cas de Tests

| ID | Cas de Test | Résultat Attendu | Résultat Obtenu | Verdict |
|---|---|---|---|:---:|
| **TC-FIL-01** | Contrôleur filière | `filiereController.js` présent sous `backend/controllers/` | Conforme | **OK** |
| **TC-FIL-02** | Routes filière | `filiereRoutes.js` présent sous `backend/routes/` | Conforme | **OK** |
| **TC-FIL-03** | Contrôleur groupe | `groupeController.js` présent sous `backend/controllers/` | Conforme | **OK** |
| **TC-FIL-04** | Routes groupe | `groupeRoutes.js` présent sous `backend/routes/` | Conforme | **OK** |
| **TC-FIL-05** | Schéma Prisma | `schema.prisma` présent sous `backend/prisma/` | Conforme | **OK** |
| **TC-FIL-06** | Composant admin | `AdminFilieres.jsx` présent sous `src/pages/admin/` | Conforme | **OK** |
| **TC-FIL-07** | Composant public | `Filieres.jsx` présent sous `src/pages/` | Conforme | **OK** |
| **TC-FIL-08** | Routeur applicatif | `App.jsx` présent sous `src/` | Conforme | **OK** |
| **TC-FIL-09** | Modèle Filiere | Modèle défini avec clé primaire auto-incrémentée | Conforme | **OK** |
| **TC-FIL-10** | Unicité code filière | Contrainte `@unique` sur le code (ex: LSI, MIPC...) | Conforme | **OK** |
| **TC-FIL-11** | Modèle Groupe | Modèle défini avec types TD, TP, Projet | Conforme | **OK** |
| **TC-FIL-12** | Modèle Semestre | Modèle défini pour l'organisation semestrielle | Conforme | **OK** |
| **TC-FIL-13** | Relation Filière-Groupes | Relation `Filiere -> Groupe[]` configurée | Conforme | **OK** |
| **TC-FIL-14** | Relation Groupe-Étudiants | Relations distinctes pour TD, TP et Projet | Conforme | **OK** |
| **TC-FIL-15** | GET /api/filieres | Accessible avec authentification (`protect`) | Conforme | **OK** |
| **TC-FIL-16** | POST /api/filieres | Réservé au rôle Administrateur (`authorize('admin')`) | Conforme | **OK** |
| **TC-FIL-17** | PATCH /api/filieres/:id | Réservé au rôle Administrateur (`authorize('admin')`) | Conforme | **OK** |
| **TC-FIL-18** | DELETE /api/filieres/:id | Réservé au rôle Administrateur (`authorize('admin')`) | Conforme | **OK** |
| **TC-FIL-19** | GET /api/groupes | Accessible avec authentification (`protect`) | Conforme | **OK** |
| **TC-FIL-20** | POST /api/groupes | Réservé au rôle Administrateur (`authorize('admin')`) | Conforme | **OK** |
| **TC-FIL-21** | PATCH /api/groupes/:id | Réservé au rôle Administrateur (`authorize('admin')`) | Conforme | **OK** |
| **TC-FIL-22** | DELETE /api/groupes/:id | Réservé au rôle Administrateur (`authorize('admin')`) | Conforme | **OK** |
| **TC-FIL-23** | Gestion doublons filière | Interception de l'unicité de code filière (P2002) | Conforme | **OK** |
| **TC-FIL-24** | Niveaux d'études | Prise en charge des cycles (Ingénieur, Master, Licence) | Conforme | **OK** |
| **TC-FIL-25** | Capacité max groupe | Gestion et validation de la capacité d'accueil | Conforme | **OK** |
| **TC-FIL-26** | Année universitaire | Enregistrement de l'année d'exercice sur le groupe | Conforme | **OK** |
| **TC-FIL-27** | Groupes de projet | Liaison des étudiants aux groupes de projet | Conforme | **OK** |
| **TC-FIL-28** | Verrou filière | Verrouillage transactionnel `FOR UPDATE` avant suppression | Conforme | **OK** |
| **TC-FIL-29** | Garde étudiants filière | Rejet de suppression avec code `FILIERE_HAS_STUDENTS` | Conforme | **OK** |
| **TC-FIL-30** | Garde modules filière | Rejet de suppression avec code `FILIERE_HAS_MODULES` | Conforme | **OK** |
| **TC-FIL-31** | Garde groupes filière | Rejet de suppression avec code `FILIERE_HAS_GROUPES` | Conforme | **OK** |
| **TC-FIL-32** | Verrou groupe | Verrouillage transactionnel `FOR UPDATE` avant suppression | Conforme | **OK** |
| **TC-FIL-33** | Garde étudiants TD | Rejet de suppression avec code `GROUPE_HAS_ETUDIANTS_TD` | Conforme | **OK** |
| **TC-FIL-34** | Garde étudiants TP | Rejet de suppression avec code `GROUPE_HAS_ETUDIANTS_TP` | Conforme | **OK** |
| **TC-FIL-35** | Garde séances groupe | Rejet de suppression avec code `GROUPE_HAS_SEANCES` | Conforme | **OK** |
| **TC-FIL-36** | Sélection filière | Bascule interactive de la filière active dans l'UI | Conforme | **OK** |
| **TC-FIL-37** | Statistiques filières | Comptage en temps réel des effectifs étudiants | Conforme | **OK** |
| **TC-FIL-38** | Tiroirs coulissants | Affichage contextuel des panneaux de configuration | Conforme | **OK** |
| **TC-FIL-39** | Sauvegarde filière | Soumission et validation des informations filière | Conforme | **OK** |
| **TC-FIL-40** | Sauvegarde groupe | Soumission et validation des informations groupe | Conforme | **OK** |
| **TC-FIL-41** | Route admin `/filieres` | Navigation sécurisée sous layout administrateur | Conforme | **OK** |
| **TC-FIL-42** | Indexation filières | Clé `idFiliere` normalisée dans DataContext | Conforme | **OK** |
| **TC-FIL-43** | Indexation groupes | Clé `idGroupe` normalisée dans DataContext | Conforme | **OK** |
| **TC-FIL-44** | Alias groups | Proxy transparent `groups` vers `groupes` | Conforme | **OK** |

---

## 4. Test de Compilation & Build
- Commande exécutée : `vite build`
- Modules transformés : **1520 modules**
- Statut de compilation : **0 erreur (Succès)**

---

## 5. Conclusion & Décision QA
Le module de la carte **4.13 Filières, groupes et années universitaires** est **100% conforme et robuste**.  
**Recommandation QA** : Déplacement de la carte Trello de la colonne **« En test »** vers la colonne **« À valider par la MOA »**.
