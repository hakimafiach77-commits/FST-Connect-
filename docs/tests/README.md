# Dossier Central d'Assurance Qualité & Cahier de Recette (QA)

Ce dossier regroupe l'ensemble des **suites de tests exécutables**, des **procès-verbaux de recette** et du **suivi qualité** des modules développés pour la plateforme **FST-Connect** (Département GI).

---

## 📊 Matrice d'Avancement des Tests

| Carte Trello | Module Testé | Fichier de Test Exécutable | Rapport de Recette (PV) | Nb Tests | Statut QA |
|---|---|---|---|:---:|:---:|
| **4.1** | **Portail d'accueil** | [`tests-portail-accueil.mjs`](./tests-portail-accueil.mjs) | [PV 4.1 Portail](./test-report-4.1-portail-accueil.md) | 33 / 33 | **VALIDÉ (100%)** ✅ |
| **4.3** | **Gestion des étudiants** | [`tests-gestion-etudiants.mjs`](./tests-gestion-etudiants.mjs) | [PV 4.3 Étudiants](./test-report-4.3-gestion-etudiants.md) | 38 / 38 | **VALIDÉ (100%)** ✅ |
| **4.6** | **Gestion des enseignants** | [`tests-gestion-enseignants.mjs`](./tests-gestion-enseignants.mjs) | [PV 4.6 Enseignants](./test-report-4.6-gestion-enseignants.md) | 41 / 41 | **VALIDÉ (100%)** ✅ |
| **4.13** | **Filières, groupes & années** | [`tests-filieres-groupes.mjs`](./tests-filieres-groupes.mjs) | [PV 4.13 Filières](./test-report-4.13-filieres-groupes.md) | 44 / 44 | **VALIDÉ (100%)** ✅ |
| **4.15** | **Examens et notes** | [`tests-examens-notes.mjs`](./tests-examens-notes.mjs) | [PV 4.15 Examens](./test-report-4.15-examens-notes.md) | 55 / 55 | **VALIDÉ (100%)** ✅ |
| **4.8** | **Emplois du temps** | [`tests-emplois-du-temps.mjs`](./tests-emplois-du-temps.mjs) | [PV 4.8 EDT](./test-report-4.8-emplois-du-temps.md) | 59 / 59 | **VALIDÉ (100%)** ✅ |
| **4.10** | **Modules et documents** | [`tests-modules-documents.mjs`](./tests-modules-documents.mjs) | [PV 4.10 Modules](./test-report-4.10-modules-documents.md) | 60 / 60 | **VALIDÉ (100%)** ✅ |
| **TOTAL** | **Modules Recettés** | — | — | **330 / 330** | **100% SUCCÈS** 🎉 |

---

## 🚀 Comment Exécuter les Tests

Depuis la racine du projet :

```bash
# 1. Lancer l'intégralité des suites de tests (156 tests) :
npm test
# ou directement :
node docs/tests/run-all-tests.mjs

# 2. Lancer spécifiquement la suite 4.13 (Filières, groupes & années) :
node docs/tests/tests-filieres-groupes.mjs
```
