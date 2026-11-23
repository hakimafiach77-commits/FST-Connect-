# Procès-Verbal de Recette & Validation des Tests (PV QA)

**Projet** : FST-Connect (Plateforme Digitale du Département GI)  
**Tickets / Cartes Trello** : 
- `4.12 Salles et ressources`
- `4.19 Formations`
**Responsables Dév** : AB, SK  
**Responsable Recette & Tests (QA)** : Lead Documentation & Tests  
**Date du Test** : 23 Novembre 2026  
**Statut Global** : **VALIDÉ (100% PASS - 29/29 Tests Reçus)**

---

## 1. Contexte et Périmètre Testé
Vérification technique, sécuritaire et fonctionnelle des ressources d'infrastructure et de formation continue :
- **Carte 4.12 : Salles et Ressources**
  - Contrôleur `salleController.js` et routes `/api/salles`.
  - Typologie (Cours, TP, TD, Amphi), capacité maximale et état de disponibilité.
  - Garde-fou d'intégrité interdisant la suppression d'une salle assignée à des séances d'EDT.
- **Carte 4.19 : Formations**
  - Contrôleur `formationController.js` et routes `/api/formations`.
  - Consultation des programmes certifiants ouverts et inscriptions avec partenaires industriels (`Collaborateur`).

---

## 2. Synthèse de l'Exécution des Tests

| N° | Catégorie de Test | Tests | Statut |
|---|---|:---:|:---:|
| **01** | Intégrité Architecturale & Présence des Fichiers | 9 | **PASS** |
| **02** | Modèle de Données & Relations Prisma (DB) | 5 | **PASS** |
| **03** | Sécurité des Routes & Contrôle d'Accès (RBAC) | 6 | **PASS** |
| **04** | Logique Métier Salles (4.12) | 3 | **PASS** |
| **05** | Logique Métier Formations (4.19) | 3 | **PASS** |
| **06** | Routage Applicatif & Store Global | 3 | **PASS** |
| **TOTAL** | **Validation Cartes 4.12 & 4.19** | **29 / 29** | **100% SUCCÈS** |

---

## 3. Recommandation QA
- **Décision** : **Validation QA Accordée**. Les cartes 4.12 et 4.19 sont validées pour transfert vers "Terminé" ou "À valider par la MOA".
