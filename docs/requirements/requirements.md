# Spécification des Exigences Fonctionnelles (SRS)

## Module 4 : Portail Public & Gestion des Utilisateurs

### 4.1 Portail d'Accueil Institutionnel (Statut : TESTÉ & VALIDÉ ✅)
- **RF-4.1.1** : Le portail doit être accessible publiquement aux routes `/` et `/landing` sans authentification préalable.
- **RF-4.1.2** : Présentation du bandeau Hero avec visuel haute définition (`hero_graduation.png`) et bouton d'action principal redirigeant vers l'espace de connexion (`/auth`).
- **RF-4.1.3** : Affichage d'une barre de contact avec email (`contact-info@fstt.ac.ma`), téléphone et lien vers le portail officiel de la faculté.
- **RF-4.1.4** : Navigation rapide vers les sections clés (Département, Formations, Recherche) et accès directs aux services :
  - Emplois du temps (`/edt`)
  - Listes des étudiants (`/etudiants`)
  - Plateforme e-learning Moodle
  - Système de scolarité eDoc
  - Clubs et vie étudiante (`/clubs`)
- **RF-4.1.5** : Affichage dynamique des indicateurs clés (800+ étudiants, 45 enseignants, 6 filières).
- **RF-4.1.6** : Restitution de l'offre académique (Licence LST, Master MST, Cycle d'Ingénieur).
- **RF-4.1.7** : Flux des actualités récentes et calendrier des événements majeurs.
- **RF-4.1.8** : Foire aux questions (FAQ) sous forme d'accordéon interactif.
- **RF-4.1.9** : Pied de page complet comprenant l'adresse physique, les contacts et les mentions légales.

### 4.2 Gestion des Comptes Utilisateurs (Statut : À valider par la MOA ⏳)
- Gestion des rôles Administrateur, Enseignant, Étudiant, politique de mots de passe et historique de connexion.

### 4.3 Gestion des Dossiers Étudiants (Statut : TESTÉ & VALIDÉ ✅)
- **RF-4.3.1** : Consultation du registre national des étudiants avec vue hiérarchique par filière et promotion (Années 1, 2, 3).
- **RF-4.3.2** : Moteur de recherche réactif multi-critères permettant le filtrage par nom, prénom ou identifiant unique CNE.
- **RF-4.3.3** : Inscription administrative d'un nouvel étudiant (création atomique compte utilisateur + mot de passe haché bcrypt + profil étudiant + initialisation compteur d'absences à 0h).
- **RF-4.3.4** : Affectation pédagogique à une filière et vérification d'intégrité de l'existence des groupes de TD et TP assignés.
- **RF-4.3.5** : Gestion et modification du cycle de vie académique via les statuts (`ACTIF`, `REDOUBLANT`, `DIPLOME`, `ABANDONNE`).
- **RF-4.3.6** : Sécurisation de la radiation avec garde-fous stricts (interdiction de suppression si l'étudiant possède des notes ou des absences enregistrées).
- **RF-4.3.7** : Contrôle d'accès strict (RBAC) : mutations (POST, PATCH, DELETE) strictement réservées aux administrateurs.
- **RF-4.3.8** : Vitrine publique `/etudiants` permettant la consultation des listes de promotions par filière.

### 4.6 Gestion des Enseignants & Affectations (Statut : TESTÉ & VALIDÉ ✅)
- **RF-4.6.1** : Annuaire complet et filtrable des enseignants avec recherche multi-critères (nom, prénom, email, matricule, grade, spécialité).
- **RF-4.6.2** : Création administrative atomique d'un enseignant (création compte `Utilisateur` rôle `teacher` + profil `Enseignant` avec matricule unique et mot de passe sécurisé haché bcrypt).
- **RF-4.6.3** : Gestion et modification des données professionnelles (grade, spécialité, type permanent/vacataire, volume horaire de base).
- **RF-4.6.4** : Gestion du statut enseignant (`ACTIF`, `INACTIF`, `BLOQUE`) avec synchronisation conjointe du compte utilisateur.
- **RF-4.6.5** : Garde-fous stricts d'intégrité référentielle et verrouillage concurrence (`FOR UPDATE`) empêchant la suppression si l'enseignant possède des séances planifiées, des responsabilités de modules/groupes, des affectations actives ou des encadrements PFE.
- **RF-4.6.6** : Gestion des affectations pédagogiques (attribution et retrait d'interventions CM, TD, TP par module avec calcul des heures).
- **RF-4.6.7** : Espace personnel enseignant (`/api/enseignants/me`) permettant la consultation de son planning, de ses modules assignés et la mise à jour de ses coordonnées / mot de passe.
- **RF-4.6.8** : Contrôle d'accès strict (RBAC) protégeant les opérations d'administration contre les accès non autorisés.

### 4.13 Filières, Groupes & Années Universitaires (Statut : TESTÉ & VALIDÉ ✅)
- **RF-4.13.1** : Configuration des filières académiques (code unique, intitulé, durée en années, cycle d'étude, nombre de semestres).
- **RF-4.13.2** : Création et gestion des structures de groupes pédagogiques (types TD, TP et Projet avec capacité d'accueil maximale).
- **RF-4.13.3** : Gestion de l'année universitaire et association d'enseignants responsables aux groupes.
- **RF-4.13.4** : Protection d'intégrité référentielle interdisant la suppression d'une filière avec étudiants, modules, groupes, documents ou EDTs rattachés.
- **RF-4.13.5** : Protection d'intégrité référentielle interdisant la suppression d'un groupe avec étudiants (TD/TP/Projet) ou séances planifiées.
- **RF-4.13.6** : Dashboard administratif réactif permettant la consultation en temps réel des effectifs par filière et la configuration par tiroirs coulissants.
- **RF-4.13.7** : Vitrine publique des formations accessible aux candidats et visiteurs.
