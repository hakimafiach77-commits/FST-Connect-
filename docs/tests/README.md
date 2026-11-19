# Dossier Central d'Assurance Qualité & Cahier de Recette (QA)

Ce dossier regroupe l'ensemble des **suites de tests exécutables**, des **procès-verbaux de recette** et du **suivi qualité** des modules développés pour la plateforme **FST-Connect** (Département GI).

---

## 📊 Matrice d'Avancement des Tests

| Carte Trello | Module Testé | Fichier de Test Exécutable | Rapport de Recette (PV) | Nb Tests | Statut QA |
|---|---|---|---|:---:|:---:|
| **4.1** | **Portail d'accueil** | [`tests-portail-accueil.mjs`](./tests-portail-accueil.mjs) | [PV 4.1 Portail](./test-report-4.1-portail-accueil.md) | 33 / 33 | **VALIDÉ (100%)** ✅ |
| **4.3** | **Gestion des étudiants** | [`tests-gestion-etudiants.mjs`](./tests-gestion-etudiants.mjs) | [PV 4.3 Étudiants](./test-report-4.3-gestion-etudiants.md) | 38 / 38 | **VALIDÉ (100%)** ✅ |
| **TOTAL** | **Modules Recettés** | — | — | **71 / 71** | **100% SUCCÈS** 🎉 |

---

## 🚀 Comment Exécuter les Tests

Depuis la racine du projet :

```bash
# 1. Lancer l'intégralité des suites de tests (71 tests) :
npm test
# ou directement :
node docs/tests/run-all-tests.mjs

# 2. Lancer spécifiquement la suite 4.1 (Portail d'accueil) :
node docs/tests/tests-portail-accueil.mjs

# 3. Lancer spécifiquement la suite 4.3 (Gestion des étudiants) :
node docs/tests/tests-gestion-etudiants.mjs
```

---

## 📂 Contenu du Dossier

* **`run-all-tests.mjs`** : Lanceur global de l'ensemble des suites de tests QA.
* **`tests-portail-accueil.mjs`** : Suite de tests automatisée pour la carte 4.1 (routage, vitrine, responsive, FAQ, redirections).
* **`tests-gestion-etudiants.mjs`** : Suite de tests automatisée pour la carte 4.3 (API REST, transactions atomiques, sécurité RBAC, filtres et interface d'administration).
* **`test-report-4.1-portail-accueil.md`** : Procès-Verbal de recette officiel de la carte 4.1.
* **`test-report-4.3-gestion-etudiants.md`** : Procès-Verbal de recette officiel de la carte 4.3.

