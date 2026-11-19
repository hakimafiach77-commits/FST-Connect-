# Procès-Verbal de Recette & Validation des Tests (PV QA)

**Projet** : FST-Connect (Plateforme Digitale du Département GI)  
**Ticket / Carte Trello** : `4.1 Portail d'accueil`  
**Responsable Dév (Assigné)** : AB  
**Responsable Recette & Tests (QA)** : Lead Documentation & Tests  
**Date du Test** : 12 Novembre 2026  
**Statut Global** : **VALIDE (100% PASS - 33/33 Tests Reçus)**

---

## 1. Contexte et Périmètre Testé
Vérification fonctionnelle, structurelle et d'intégration de la vitrine publique du département (`LandingPage.jsx`, `PublicLayout.jsx`, routes `/` et `/landing`).
Conformité stricte avec les maquettes UI (`01` à `05`) fournies dans `frontend/mockups/`.

---

## 2. Synthèse de l'Exécution des Tests

| N° | Catégorie de Test | Nombre de Tests | Statut |
|---|---|---|---|
| **01** | Intégrité des Fichiers & Assets | 4 | **PASS** |
| **02** | Routage & Accessibilité Publique | 3 | **PASS** |
| **03** | Barre Supérieure & Coordonnées de Contact | 4 | **PASS** |
| **04** | Section Hero & CTA (Accès Espace Privé) | 3 | **PASS** |
| **05** | Raccourcis de Services (Shortcuts) | 5 | **PASS** |
| **06** | Offre de Formations & Statistiques Clés | 6 | **PASS** |
| **07** | Dernières Actualités & Événements (Agenda) | 4 | **PASS** |
| **08** | FAQ Interactive & Partenaires Industriels | 2 | **PASS** |
| **09** | Footer Institutionnel & Mentions Légales | 2 | **PASS** |
| **TOTAL** | **Validation Complète du Portail** | **33 / 33** | **100% SUCCÈS** |

---

## 3. Matrice Détaillée des Cas de Tests

| ID | Cas de Test | Résultat Attendu | Résultat Obtenu | Verdict |
|---|---|---|---|---|
| **TC-01** | Présence du composant `LandingPage.jsx` | Fichier accessible sous `src/pages/` | Conforme | **OK** |
| **TC-02** | Présence du layout `PublicLayout.jsx` | Fichier accessible sous `src/layouts/` | Conforme | **OK** |
| **TC-03** | Présence du routeur `App.jsx` | Fichier accessible sous `src/` | Conforme | **OK** |
| **TC-04** | Présence de l'asset `hero_graduation.png` | Fichier existant sous `public/` | Conforme | **OK** |
| **TC-05** | Route racine `/` | Affiche `LandingPage` sans authentification | Conforme | **OK** |
| **TC-06** | Alias `/landing` | Redirige ou affiche `LandingPage` | Conforme | **OK** |
| **TC-07** | Protection des routes | Aucune restriction JWT appliquée sur le portail public | Conforme | **OK** |
| **TC-08** | Email de contact | Affiche `contact-info@fstt.ac.ma` | Conforme | **OK** |
| **TC-09** | Téléphone officiel | Affiche `+212 5 39 39 39 53` | Conforme | **OK** |
| **TC-10** | Lien site institutionnel | Redirige vers `https://www.fstt.ac.ma` | Conforme | **OK** |
| **TC-11** | Bouton Navbar "ESPACE PRIVÉ" | Lien direct vers `/auth` | Conforme | **OK** |
| **TC-12** | Titre Hero Banner | "Département Informatique" visible avec style contrasté | Conforme | **OK** |
| **TC-13** | Image de fond Hero | Image `hero_graduation.png` avec gradient sombre | Conforme | **OK** |
| **TC-14** | Bouton CTA Hero | "Accéder à la plateforme de gestion GDI" redirigeant vers `/auth` | Conforme | **OK** |
| **TC-15** | Raccourci "Emplois du Temps" | Redirection interne vers `/edt` | Conforme | **OK** |
| **TC-16** | Raccourci "Listes des Étudiants" | Redirection interne vers `/etudiants` | Conforme | **OK** |
| **TC-17** | Raccourci "E-Learning (Moodle)" | Redirection externe vers `moodle-fstt.uae.ac.ma` | Conforme | **OK** |
| **TC-18** | Raccourci "Scolarité & Documents" | Redirection externe vers `edoc-fstt.uae.ac.ma/login` | Conforme | **OK** |
| **TC-19** | Raccourci "Clubs & Vie Étudiante" | Redirection interne vers `/clubs` | Conforme | **OK** |
| **TC-20** | Compteur Étudiants inscrits | Affiche "800+" | Conforme | **OK** |
| **TC-21** | Compteur Enseignants | Affiche "45" | Conforme | **OK** |
| **TC-22** | Compteur Filières actives | Affiche "6" | Conforme | **OK** |
| **TC-23** | Carte formation Licence | Intitulé "Licence (LST)" avec description GI | Conforme | **OK** |
| **TC-24** | Carte formation Master | Intitulé "Master (MST)" avec description IA & GL | Conforme | **OK** |
| **TC-25** | Carte formation Ingénieur | Intitulé "Cycle d'Ingénieur" avec description LSI | Conforme | **OK** |
| **TC-26** | Actualité 1 | Soutenances PFE Master IA | Conforme | **OK** |
| **TC-27** | Actualité 2 | Appel à candidature Doctorat 2024 | Conforme | **OK** |
| **TC-28** | Agenda Événement 1 | Hackathon "Smart City Tanger" (24 Mai) | Conforme | **OK** |
| **TC-29** | Agenda Événement 2 | Séminaire Cybersécurité (05 Juin) | Conforme | **OK** |
| **TC-30** | Section FAQ interactive | Dépliement/repliement fonctionnel | Conforme | **OK** |
| **TC-31** | Partenaires industriels | Logos/Badges Capgemini, IBM, Oracle, Cisco, Microsoft... | Conforme | **OK** |
| **TC-32** | Footer institutionnel | Copyright 2026 Faculté des Sciences et Techniques de Tanger | Conforme | **OK** |
| **TC-33** | Email Footer | Contact `d.informatique@fstt.ac.ma` | Conforme | **OK** |

---

## 4. Test de Compilation & Build
- Commande exécutée : `vite build`
- Modules transformés : **1520 modules**
- Temps de compilation : **9.98s**
- Erreurs bloquantes : **0 erreur**

---

## 5. Conclusion & Décision QA
La carte **4.1 Portail d'accueil** remplit 100% des critères d'acceptation fonctionnels et visuels.  
**Recommandation** : Déplacement immédiat du ticket Trello vers la colonne **« À valider par la MOA »** (ou **« Terminé »**).

