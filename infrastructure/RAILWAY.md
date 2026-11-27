# Deploiement Railway - demonstration



## Services



* Frontend : FST-Connect-
* Backend : divine-stillness
* Base de donnees : PostgreSQL sur Railway



Lien : https://fst-connect-production.up.railway.app



## Configuration



Le frontend est construit avec Dockerfile.railway.

VITE\_API\_URL pointe vers le backend.



Le backend utilise DATABASE\_URL et JWT\_SECRET.

Les valeurs secretes ne doivent pas etre ajoutees a Git.



La base fst\_demo est une base separee, initialisee avec

Prisma db push. Elle contient des comptes de demonstration.



## Verifications realisees



* La page d'accueil est accessible.
* Le backend indique que la base est connectee.
* Les connexions etudiant, enseignant et admin ont ete testees.
* Apres une periode de veille, le backend a retrouve les 3 comptes.



## Limites



* Les migrations ne reproduisent pas encore completement le schema Prisma.
* Un test complet sur environnement propre reste a faire.
* La securite et le health check restent a revoir.
* Railway Free peut mettre les services en veille ou les arreter

  si le credit est epuise.

* Cette configuration est une demonstration, pas une production validee.
* Tests complementaires
* 
* Le health check a ete teste en local et sur Railway.
* Le compte etudiant fonctionne apres redeploiement de PostgreSQL.
* Sans connexion, la liste des utilisateurs retourne HTTP 401.
* La sauvegarde de fst\_demo a ete telechargee et son empreinte verifiee.
* 
* Reste a valider
* 
* Tester la restauration dans une base separee.
* Tester le refus d acces admin pour un etudiant connecte.
* Faire relire la migration reservee aux bases vides.
* Ne pas appliquer cette migration a fst\_demo.
* Verifier la securite avant une mise en production.
* La sauvegarde de fst\_demo a ete restauree dans une base de test
* separee sur Railway. Les trois utilisateurs y sont presents.

