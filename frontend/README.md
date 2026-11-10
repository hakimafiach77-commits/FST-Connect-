# 02 - Frontend Lead (Développement Front-End Principal)

## 1. Rôle et Responsabilités
Le Frontend Lead est responsable de l'architecture, du développement, de l'ergonomie et de la qualité des interfaces utilisateurs de la plateforme. Il supervise la conception des écrans centraux, assure la cohérence graphique du portail web et garantit une expérience utilisateur fluide, réactive et conforme aux exigences métier pour les trois profils de la communauté universitaire (Administrateurs, Enseignants, Étudiants).

### Responsabilités principales :
- **Portail d'Accueil Institutionnel** : Conception de la vitrine publique du département (actualités, événements, communication générale, liens utiles).
- **Parcours d'Authentification & Contrôle d'Accès** : Écrans de connexion, gestion des sessions, redirection dynamique selon le profil (Admin, Enseignant, Étudiant) et sécurisation des routes.
- **Tableaux de Bord Métier** : Conception des dashboards personnalisés par profil avec restitution visuelle d'indicateurs de performance (KPIs) et graphiques analytiques via Chart.js.
- **Socle UI & Design System** : Mise en place du layout global, de la barre latérale rétractable (Sidebar), de l'en-tête (Header), des panneaux coulissants (SlidePanel), du système de notifications visuelles (ToastContext) et des styles Tailwind CSS.
- **Modules Académiques Majeurs** :
  - Gestion des utilisateurs (Étudiants, Enseignants) pour l'administration et annuaires publics.
  - Gestion des évaluations et saisie des notes (AdminNotes, TeacherGrades, Notes étudiant).
  - Suivi de l'assiduité (AdminAbsences, TeacherAbsences, Absences étudiant).
  - Gestion des structures pédagogiques (Filières, Groupes, Modules d'enseignement, Documents de cours).
  - Gestion de la communication (Annonces administratives, notifications).
- **WBS & Gestion des Risques Front-End** : Estimation des charges de développement (J/H) et identification des risques techniques pour le registre central.

---

## 2. Inventaire des Fichiers et Modules Copiés

### 2.1 Socle Applicatif, Design System et Contextes
- `public/hero_graduation.png` : Image d'illustration haute résolution pour le bandeau d'accueil.
- `src/main.jsx` : Point d'entrée React et amorçage du DOM virtuel.
- `src/App.jsx` : Définition des routes applicatives et imbrication des contextes globaux.
- `src/index.css` : Feuilles de styles principales, directives Tailwind CSS et variables de thème.
- `src/services/api.js` : Client HTTP Axios/Fetch configuré avec intercepteurs pour l'authentification JWT.
- `src/contexts/AuthContext.jsx` : Gestion de l'état d'authentification, stockage du jeton JWT et données du profil actif.
- `src/contexts/DataContext.jsx` : Gestion centralisée de la synchronisation des données métier (`/api/sync`).
- `src/contexts/ToastContext.jsx` : Gestion des alertes et notifications contextuelles à l'écran.

### 2.2 Composants Communs et Layouts
- `src/components/Header.jsx` : Barre de navigation supérieure (profil, alertes, déconnexion).
- `src/components/Sidebar.jsx` : Barre latérale adaptative avec menu contextuel selon le rôle.
- `src/components/SlidePanel.jsx` : Tiroir coulissant pour la saisie et modification rapide de données.
- `src/components/ProtectedRoute.jsx` : Garde de route vérifiant l'authentification et les permissions de rôle.
- `src/components/etudiant/AccessGuard.jsx` : Composant de restriction d'accès aux services étudiants selon statut académique.
- `src/layouts/AppLayout.jsx` : Gabarit standard pour l'espace d'administration et enseignants.
- `src/layouts/EtudiantLayout.jsx` : Gabarit ergonomique dédié à l'espace étudiant.
- `src/layouts/PublicLayout.jsx` : Gabarit épuré pour le portail d'accueil public et la connexion.

### 2.3 Portail Public, Authentification et Dashboards
- `src/pages/LandingPage.jsx` : Portail public d'accueil du département.
- `src/pages/AuthScreen.jsx` : Écran unifié de connexion avec sélection ou reconnaissance du rôle.
- `src/pages/Dashboard.jsx` : Routeur de redirection vers le dashboard adéquat selon profil.
- `src/pages/admin/AdminDashboard.jsx` : Tableau de bord administratif avec indicateurs statistiques.
- `src/pages/enseignant/EnseignantDashboard.jsx` : Tableau de bord enseignant (planning, cours, alertes assiduité).
- `src/pages/etudiant/EtudiantDashboard.jsx` : Tableau de bord étudiant (prochains cours, notes récentes, absences).
- `src/pages/etudiant/Profil.jsx` : Consultation et mise à jour des informations personnelles de l'étudiant.

### 2.4 Gestion des Utilisateurs (Étudiants & Enseignants)
- `src/pages/Students.jsx` : Vue générale de gestion des étudiants.
- `src/pages/Teachers.jsx` : Annuaire et gestion du corps professoral.
- `src/pages/PublicStudents.jsx` : Consultation publique ou semi-restreinte des listes d'étudiants.
- `src/pages/admin/AdminEtudiants.jsx` : Module complet d'administration des dossiers étudiants (création, filière, statut).
- `src/pages/admin/AdminEnseignants.jsx` : Module d'administration des enseignants (affectations, département).

### 2.5 Évaluations (Notes) et Assiduité (Absences)
- `src/pages/admin/AdminNotes.jsx` : Vue administrative et validation globale des procès-verbaux de notes.
- `src/pages/admin/AdminAbsences.jsx` : Suivi départemental des taux d'absentéisme et traitement des justificatifs.
- `src/pages/enseignant/TeacherGrades.jsx` : Grille de saisie des notes par module et session pour les enseignants.
- `src/pages/enseignant/TeacherAbsences.jsx` : Émargement électronique des séances de cours, TD et TP.
- `src/pages/etudiant/Notes.jsx` : Consultation sécurisée du relevé de notes semestriel et statut de validation.
- `src/pages/etudiant/Absences.jsx` : Suivi individuel des absences et soumission en ligne de justificatifs.

### 2.6 Structures Pédagogiques et Communication
- `src/pages/Announcements.jsx` : Flux public et interne des annonces et communiqués.
- `src/pages/admin/AdminAnnonces.jsx` : Outil de publication et de ciblage des annonces par filière ou profil.
- `src/pages/Filieres.jsx` : Présentation détaillée des cursus et formations du département.
- `src/pages/admin/AdminFilieres.jsx` : Gestion administrative des filières et parcours universitaires.
- `src/pages/ModulesManager.jsx` : Supervision globale des modules pédagogiques.
- `src/pages/ModulesRouter.jsx` : Routage intelligent des modules selon le contexte d'affichage.
- `src/pages/admin/AdminModules.jsx` : Création et configuration des fiches modules et coefficients.
- `src/pages/enseignant/TeacherModules.jsx` : Espace enseignant de gestion des modules attribués et dépôts de supports.
- `src/pages/etudiant/Ressources.jsx` : Espace de téléchargement des cours, TD et supports numériques.

---

## 3. Statut d'Avancement des Responsabilités

| Domaine de Responsabilité | Statut | Synthèse de l'Existant et Besoins Résiduels |
|---|---|---|
| **Portail d'Accueil & Authentification** | DONE | Interfaces complètes, responsive, formulaire d'authentification fonctionnel. |
| **Gabarits Globaux & Navigation** | DONE | Sidebar adaptative, Header, Layouts par profil et SlidePanel intégrés. |
| **Dashboards Multi-Profils** | DONE | Tableaux de bord Admin, Enseignant et Étudiant conçus avec graphiques Chart.js. |
| **Gestion Académique (Filières, Modules)**| PARTIAL | Interfaces développées ; finaliser l'export PDF des fiches filières et contrôle de saisie. |
| **Gestion des Notes & Évaluations** | PARTIAL | Composants de saisie opérationnels ; intégrer le calcul dynamique de rattrapage et verrouillage PV. |
| **Gestion des Absences & Justificatifs** | PARTIAL | Saisie et affichage effectifs ; intégrer le flux de validation d'upload des pièces justificatives. |
| **WBS & Risques Techniques** | PARTIAL | Documentés et formalisés dans `WORK_TO_DO.md`. |

---

## 4. Dépendances Vis-à-Vis des Autres Membres

- **03-backend-lead** :
  - Endpoints d'authentification `/api/auth/login`, renouvellement de jeton et profil utilisateur.
  - Endpoints de gestion académique (`/api/etudiants`, `/api/enseignants`, `/api/filieres`, `/api/modules`).
  - API de synchronisation globale `/api/sync` pour le chargement des états applicatifs.
  - Endpoints de saisie et de validation des notes (`/api/notes`) et des absences (`/api/absences`).
- **04-database-architecture** :
  - Cohérence des champs de données retournés avec les modèles relationnels (noms d'attributs, contraintes).
- **06-devops-frontend-support** :
  - Fichiers de configuration racine hébergés sous `shared-config/` (`package.json`, `vite.config.js`).
  - Pages front-end secondaires développées par le support front (Clubs, Formations, Réclamations, Emplois du temps).
