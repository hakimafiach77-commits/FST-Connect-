# FST-Connect — Installation Docker en développement

Ce guide explique comment démarrer le frontend, le backend et PostgreSQL
sur un ordinateur local avec Docker.

## 1. Prérequis

- Git installé.
- Docker Desktop installé et démarré.
- Les ports locaux 5173, 3000 et 5433 disponibles.

Pour vérifier Docker :

```cmd
docker --version
docker compose version
docker ps
```

## 2. Récupérer le projet

Cloner le dépôt :

```cmd
git clone https://github.com/hakimafiach77-commits/FST-Connect-.git
cd FST-Connect-
git checkout develop
git pull --ff-only origin develop
```

Si le projet est déjà présent sur l'ordinateur, ouvrir son dossier
et vérifier sa branche et ses modifications avec `git status` avant
de changer de branche ou de faire un pull.

## 3. Préparer les variables d'environnement

À la racine du projet, si le fichier `.env` n'existe pas encore :

```cmd
copy .env.example .env
```

Adapter les valeurs pour l'environnement local si nécessaire.
Ne pas partager ou envoyer le fichier `.env` sur GitHub.
Les valeurs d'exemple ne doivent pas être utilisées en production.

## 4. Démarrer les services

```cmd
docker compose up --build -d
docker compose ps
```

Vérifier que les trois services sont démarrés et que la base `db`
est indiquée comme `healthy`.

## 5. Préparer la base de données

Sur une base locale de développement, appliquer les migrations existantes :

```cmd
docker compose exec backend npx prisma migrate deploy
```

Pour vérifier leur état :

```cmd
docker compose exec backend npx prisma migrate status
```

Les migrations créent ou modifient la structure de la base ; elles
ne créent pas nécessairement des comptes ou des données de test.

Avant utilisation par l'équipe, faire valider par la responsable
base de données que les migrations correspondent au schéma Prisma
actuel. Ne pas lancer le script de seed sur une base contenant des
données importantes : il peut supprimer des données.

## 6. Vérifier le démarrage

- Frontend : http://localhost:5173
- Statut du backend : http://localhost:3000/api/status
- PostgreSQL depuis l'ordinateur : port 5433

Le statut du backend vérifie une connexion à la base, mais ne remplace
pas les tests des fonctionnalités complètes de l'application.

## 7. Arrêter et redémarrer

Pour arrêter les services sans supprimer le volume de données :

```cmd
docker compose stop
```

Pour les redémarrer :

```cmd
docker compose start
```

## 8. Dépannage et précautions

Si Docker ne répond pas, ouvrir Docker Desktop et attendre son démarrage.

Pour voir l'état des services ou les journaux :

```cmd
docker compose ps
docker compose logs backend
docker compose logs db
```

Attention : les journaux peuvent contenir des informations sensibles.
Ne pas les partager sans les vérifier.

Le volume PostgreSQL porte un nom fixe. Un nouveau clone sur le même
ordinateur peut donc réutiliser les données existantes : ce n'est pas
forcément une installation propre.

Ne pas supprimer le volume ni utiliser `docker compose down -v` sans
avoir vérifié et sauvegardé les données à conserver.