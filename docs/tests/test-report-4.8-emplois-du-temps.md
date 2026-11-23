# Procès-Verbal de Recette & Validation des Tests (PV QA)

**Projet** : FST-Connect (Plateforme Digitale du Département GI)  
**Ticket / Carte Trello** : `4.8 Emplois du temps`  
**Responsables Dév (Assignés)** : AB, SK  
**Responsable Recette & Tests (QA)** : Lead Documentation & Tests  
**Date du Test** : 23 Novembre 2026  
**Statut Global** : **VALIDÉ (100% PASS - 59/59 Tests Reçus)**

---

## 1. Contexte et Périmètre Testé
Vérification technique, sécuritaire et fonctionnelle du module **Emplois du temps** (Tâche 4.8) :
- **Architecture Backend & Contrôleur d'EDT** :
  - Contrôleur `scheduleController.js` et routes `/api/schedule`.
  - Consultation contextuelle `/api/schedule/me` selon le rôle connecté (`student`, `teacher`, `admin`).
  - Mutations administratives (`POST`, `PATCH`, `DELETE`) strictement réservées au rôle Administrateur (`protect, authorize('admin')`).
- **Moteur Anti-Conflit & Détection des Chevauchements (`checkOverlap`)** :
  - Détection préventive des chevauchements d'horaires (`heureDebut`, `heureFin`) sur un même jour.
  - Détection de conflit enseignant : impossibilité pour un enseignant d'être affecté à 2 séances simultanées (`teacherConflict`).
  - Détection de conflit salle : impossibilité d'attribuer une salle à 2 séances concurrentes (`roomConflict`).
  - Détection de conflit groupe : impossibilité pour un groupe d'étudiants (TD/TP) d'avoir 2 séances sur la même plage (`groupConflict`).
  - Exclusion de la séance modifiée (`excludeId`) pour permettre l'ajustement sans faux positif.
- **Modèle de Données & Relations Prisma** :
  - Modèle `Edt` : filière, groupe, semestre, statut ('PUBLIE'), relation avec `Seance[]`.
  - Modèle `Seance` : type, jour, heureDebut, heureFin, statut ('VALIDE'), motif d'annulation, relations avec Module, Enseignant, Salle, Groupe, Absence[].
  - Modèle `Salle` : capacité d'accueil et typologie (Amphi, Salle TP, Salle TD).
- **Interfaces Utilisateur (Frontend)** :
  - `AdminEDT.jsx` : Gestion par onglets (documents PDF/officiels et grille de planning interactive), filtres par filière et jour, formulaires latéraux de création de séances et documents.
  - `PublicEDT.jsx` : Vitrine publique sans authentification pour consultation et téléchargement des emplois du temps officiels par filière.
  - `MonPlanning.jsx` : Espace enseignant avec navigation hebdomadaire (semaine précédente / courante / suivante) et module direct de feuille d'appel.
  - `EmploiDuTemps.jsx` : Espace étudiant personnalisé avec affichage selon ses groupes TD/TP, code couleur distinctif par type de séance et export PDF.

---

## 2. Synthèse de l'Exécution des Tests

| N° | Catégorie de Test | Tests | Statut |
|---|---|:---:|:---:|
| **01** | Intégrité Architecturale & Présence des Fichiers | 9 | **PASS** |
| **02** | Modèle de Données & Relations Prisma (DB) | 8 | **PASS** |
| **03** | Sécurité des Routes & Contrôle d'Accès (RBAC) | 4 | **PASS** |
| **04** | Détection des Conflits & Chevauchements (checkOverlap) | 8 | **PASS** |
| **05** | Logique Métier & Gestion Multi-Profils | 9 | **PASS** |
| **06** | Interfaces Admin, Public, Enseignant & Étudiant | 12 | **PASS** |
| **07** | Routage Applicatif & Store Global (App & DataContext) | 9 | **PASS** |
| **TOTAL** | **Validation Complète du Module Emplois du Temps** | **59 / 59** | **100% SUCCÈS** |

---

## 3. Matrice Détaillée des Cas de Tests

| ID | Cas de Test | Résultat Attendu | Résultat Obtenu | Verdict |
|---|---|---|---|:---:|
| **TC-EDT-01** | Contrôleur EDT | `scheduleController.js` présent sous `backend/controllers/` | Conforme | **OK** |
| **TC-EDT-02** | Routes EDT | `scheduleRoutes.js` présent sous `backend/routes/` | Conforme | **OK** |
| **TC-EDT-03** | Schéma Prisma | `schema.prisma` présent sous `backend/prisma/` | Conforme | **OK** |
| **TC-EDT-04** | Composant Admin EDT | `AdminEDT.jsx` présent sous `src/pages/admin/` | Conforme | **OK** |
| **TC-EDT-05** | Composant Public EDT | `PublicEDT.jsx` présent sous `src/pages/` | Conforme | **OK** |
| **TC-EDT-06** | Composant Enseignant Planning | `MonPlanning.jsx` présent sous `src/pages/enseignant/` | Conforme | **OK** |
| **TC-EDT-07** | Composant Étudiant EDT | `EmploiDuTemps.jsx` présent sous `src/pages/etudiant/` | Conforme | **OK** |
| **TC-EDT-08** | Routeur applicatif | `App.jsx` présent sous `src/` | Conforme | **OK** |
| **TC-EDT-09** | Contexte global | `DataContext.jsx` présent sous `src/contexts/` | Conforme | **OK** |
| **TC-EDT-10** | Modèle Prisma Edt | Modèle `Edt` présent avec identifiant primaire | Conforme | **OK** |
| **TC-EDT-11** | Clés Edt | Présence de `idEDT`, `idFiliere`, `idGroupe` | Conforme | **OK** |
| **TC-EDT-12** | Modèle Prisma Seance | Modèle `Seance` défini dans le schéma | Conforme | **OK** |
| **TC-EDT-13** | Attributs temporels | Définition de `heureDebut`, `heureFin` | Conforme | **OK** |
| **TC-EDT-14** | Clés étrangères séance | Liaisons avec `Module`, `Enseignant`, `Salle` | Conforme | **OK** |
| **TC-EDT-15** | Statut par défaut | Valeur par défaut `VALIDE` sur la séance | Conforme | **OK** |
| **TC-EDT-16** | Motif d'annulation | Prise en charge du champ `motifAnnulation` | Conforme | **OK** |
| **TC-EDT-17** | Modèle Prisma Salle | Modèle `Salle` présent pour affectation | Conforme | **OK** |
| **TC-EDT-18** | GET /api/schedule/me | Protégé par le middleware JWT `protect` | Conforme | **OK** |
| **TC-EDT-19** | POST /api/schedule | Réservé strictement à l'administrateur | Conforme | **OK** |
| **TC-EDT-20** | PATCH /api/schedule/:id | Réservé strictement à l'administrateur | Conforme | **OK** |
| **TC-EDT-21** | DELETE /api/schedule/:id | Réservé strictement à l'administrateur | Conforme | **OK** |
| **TC-EDT-22** | Moteur checkOverlap | Algorithme de vérification d'intersection temporelle | Conforme | **OK** |
| **TC-EDT-23** | Chevauchement début | Détection de début de séance en conflit | Conforme | **OK** |
| **TC-EDT-24** | Chevauchement fin | Détection de fin de séance en conflit | Conforme | **OK** |
| **TC-EDT-25** | Séances englobées | Détection d'intersection complète de créneau | Conforme | **OK** |
| **TC-EDT-26** | Conflit Enseignant | Blocage avec code `TEACHER_CONFLICT` | Conforme | **OK** |
| **TC-EDT-27** | Conflit Salle | Blocage avec code `ROOM_CONFLICT` | Conforme | **OK** |
| **TC-EDT-28** | Conflit Groupe | Blocage avec code `GROUP_CONFLICT` | Conforme | **OK** |
| **TC-EDT-29** | Exclusion mise à jour | Ignorer l'ID de séance en cours de modification | Conforme | **OK** |
| **TC-EDT-30** | Profil Étudiant | Filtrage sur `idGroupeTD` et `idGroupeTP` | Conforme | **OK** |
| **TC-EDT-31** | Groupes TD/TP Étudiant | Requête OR pour rattachement complet | Conforme | **OK** |
| **TC-EDT-32** | Profil Enseignant | Filtrage sur `idEnseignant` | Conforme | **OK** |
| **TC-EDT-33** | Séances Enseignant | Renvoi des séances de cours assignées | Conforme | **OK** |
| **TC-EDT-34** | Profil Administrateur | Visibilité transversale de tous les cours | Conforme | **OK** |
| **TC-EDT-35** | Validation Jours | Contrôle sur liste `ALLOWED_DAYS` | Conforme | **OK** |
| **TC-EDT-36** | Validation ID strict | Filtrage des valeurs numériques `parseIdStrict` | Conforme | **OK** |
| **TC-EDT-37** | Erreur 404 Séance | Notification normalisée `SEANCE_NOT_FOUND` | Conforme | **OK** |
| **TC-EDT-38** | Suppression de séance | Suppression sécurisée par clé primaire | Conforme | **OK** |
| **TC-EDT-39** | Onglets AdminEDT | Bascule entre vue Documents et Planning | Conforme | **OK** |
| **TC-EDT-40** | Créneaux réglementaires | Définition des slots (08h30, 10h30, 14h30, 16h30) | Conforme | **OK** |
| **TC-EDT-41** | Formulaires coulissants | SlidePanels pour création de séances et docs | Conforme | **OK** |
| **TC-EDT-42** | Filtre filière Admin | Affichage conditionné par filière sélectionnée | Conforme | **OK** |
| **TC-EDT-43** | Catalogue Public | Affichage et recherche des documents EDT | Conforme | **OK** |
| **TC-EDT-44** | Lien Connexion Espace | Raccourci vers `/auth` depuis la vitrine | Conforme | **OK** |
| **TC-EDT-45** | Planning Enseignant | Affichage hebdomadaire personnalisé | Conforme | **OK** |
| **TC-EDT-46** | Défilement semaines | Navigation temporelle multi-semaines | Conforme | **OK** |
| **TC-EDT-47** | Feuille d'appel direct | Modal de saisie des absences en direct | Conforme | **OK** |
| **TC-EDT-48** | EDT personnalisé Étudiant | Cours filtrés par TD/TP de la promotion | Conforme | **OK** |
| **TC-EDT-49** | Codes couleurs types | Différenciation visuelle (Cours, TD, TP, Examen) | Conforme | **OK** |
| **TC-EDT-50** | Exportation PDF | Bouton de génération de document officiel | Conforme | **OK** |
| **TC-EDT-51** | Route /edt | Raccordement à `<PublicEDT />` | Conforme | **OK** |
| **TC-EDT-52** | Route /admin/edt | Raccordement à `<AdminEDT />` | Conforme | **OK** |
| **TC-EDT-53** | Route /teacher/planning | Raccordement à `<MonPlanning />` | Conforme | **OK** |
| **TC-EDT-54** | Route /etudiant/edt | Raccordement à `<EmploiDuTemps />` | Conforme | **OK** |
| **TC-EDT-55** | Clé primaire seances | Normalisation `seances: 'idSeance'` | Conforme | **OK** |
| **TC-EDT-56** | Clé primaire salles | Normalisation `salles: 'idSalle'` | Conforme | **OK** |
| **TC-EDT-57** | Collection edts | Prise en charge dans le store global | Conforme | **OK** |
| **TC-EDT-58** | Alias sessions -> seances | Résolution automatique dans DataContext | Conforme | **OK** |
| **TC-EDT-59** | Alias rooms -> salles | Résolution automatique dans DataContext | Conforme | **OK** |

---

## 4. Recommandation QA & Validation
- **Résultat Technique** : Le module 4.8 remplit l'ensemble des critères d'acceptation fonctionnels, de sécurité RBAC, de détection prédictive des conflits et de réactivité de l'interface.
- **Décision** : **Validation QA Accordée**. La carte Trello 4.8 peut être déplacée vers la colonne **"À valider par la MOA"** ou **"Terminé"**.
