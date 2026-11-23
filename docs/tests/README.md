# Dossier Central d'Assurance Qualité & Cahier de Recette (QA)

Ce dossier regroupe l'ensemble des **suites de tests exécutables**, des **procès-verbaux de recette** et du **suivi qualité** des modules développés pour la plateforme **FST-Connect** (Département GI).

---

## 📊 Matrice Complète d'Avancement des Tests (100% Validé)

| Carte Trello | Module Testé | Fichier de Test Exécutable | Rapport de Recette (PV) | Nb Tests | Statut QA |
|---|---|---|---|:---:|:---:|
| **4.1** | **Portail d'accueil** | [`tests-portail-accueil.mjs`](./tests-portail-accueil.mjs) | [PV 4.1 Portail](./test-report-4.1-portail-accueil.md) | 33 / 33 | **VALIDÉ (100%)** ✅ |
| **4.3** | **Gestion des étudiants** | [`tests-gestion-etudiants.mjs`](./tests-gestion-etudiants.mjs) | [PV 4.3 Étudiants](./test-report-4.3-gestion-etudiants.md) | 38 / 38 | **VALIDÉ (100%)** ✅ |
| **4.6** | **Gestion des enseignants** | [`tests-gestion-enseignants.mjs`](./tests-gestion-enseignants.mjs) | [PV 4.6 Enseignants](./test-report-4.6-gestion-enseignants.md) | 41 / 41 | **VALIDÉ (100%)** ✅ |
| **4.13** | **Filières, groupes & années** | [`tests-filieres-groupes.mjs`](./tests-filieres-groupes.mjs) | [PV 4.13 Filières](./test-report-4.13-filieres-groupes.md) | 44 / 44 | **VALIDÉ (100%)** ✅ |
| **4.15** | **Examens et notes** | [`tests-examens-notes.mjs`](./tests-examens-notes.mjs) | [PV 4.15 Examens](./test-report-4.15-examens-notes.md) | 55 / 55 | **VALIDÉ (100%)** ✅ |
| **4.8** | **Emplois du temps** | [`tests-emplois-du-temps.mjs`](./tests-emplois-du-temps.mjs) | [PV 4.8 EDT](./test-report-4.8-emplois-du-temps.md) | 59 / 59 | **VALIDÉ (100%)** ✅ |
| **4.10** | **Modules et documents** | [`tests-modules-documents.mjs`](./tests-modules-documents.mjs) | [PV 4.10 Modules](./test-report-4.10-modules-documents.md) | 60 / 60 | **VALIDÉ (100%)** ✅ |
| **4.9, 4.11, 4.17** | **Comm, Absences & Réclamations** | [`tests-communication-absences-reclamations.mjs`](./tests-communication-absences-reclamations.mjs) | [PV Comm & Absences](./test-report-4.9-4.11-4.17.md) | 57 / 57 | **VALIDÉ (100%)** ✅ |
| **4.4, 4.5** | **PFE & Stages** | [`tests-pfe-stages.mjs`](./tests-pfe-stages.mjs) | [PV PFE & Stages](./test-report-4.4-4.5.md) | 43 / 43 | **VALIDÉ (100%)** ✅ |
| **4.16, 4.7** | **Délibérations & Affectations** | [`tests-deliberations-affectations.mjs`](./tests-deliberations-affectations.mjs) | [PV Délibérations](./test-report-4.16-4.7.md) | 28 / 28 | **VALIDÉ (100%)** ✅ |
| **4.12, 4.19** | **Salles & Formations** | [`tests-salles-formations.mjs`](./tests-salles-formations.mjs) | [PV Salles](./test-report-4.12-4.19.md) | 29 / 29 | **VALIDÉ (100%)** ✅ |
| **4.14, 4.18** | **Tableaux de bord & Clubs** | [`tests-dashboard-clubs.mjs`](./tests-dashboard-clubs.mjs) | [PV Dashboard & Clubs](./test-report-4.14-4.18.md) | 26 / 26 | **VALIDÉ (100%)** ✅ |
| **TOTAL** | **Modules Recettés Global** | — | — | **513 / 513** | **100% SUCCÈS** 🎉 |

---

## 🚀 Comment Exécuter les Tests

Depuis la racine du projet :

```bash
# 1. Lancer l'intégralité des 12 suites de tests (513 tests validés) :
npm test
# ou directement :
node docs/tests/run-all-tests.mjs

# 2. Lancer une suite spécifique (exemple PFE & Stages) :
node docs/tests/tests-pfe-stages.mjs
```
