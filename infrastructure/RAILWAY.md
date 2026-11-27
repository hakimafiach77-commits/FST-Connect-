# Deploiement Railway - demonstration



## Services



- Frontend : FST-Connect-

- Backend : divine-stillness

- Base de donnees : PostgreSQL sur Railway



Lien : https://fst-connect-production.up.railway.app



## Configuration



Le frontend est construit avec Dockerfile.railway.

VITE_API_URL pointe vers le backend.



Le backend utilise DATABASE_URL et JWT_SECRET.

Les valeurs secretes ne doivent pas etre ajoutees a Git.



La base fst_demo est une base separee, initialisee avec

Prisma db push. Elle contient des comptes de demonstration.



## Verifications realisees



- La page d'accueil est accessible.

- Le backend indique que la base est connectee.

- Les connexions etudiant, enseignant et admin ont ete testees.

- Apres une periode de veille, le backend a retrouve les 3 comptes.



## Limites



- Les migrations ne reproduisent pas encore completement le schema Prisma.

- Un test complet sur environnement propre reste a faire.

- La securite et le health check restent a revoir.

- Railway Free peut mettre les services en veille ou les arreter

  si le credit est epuise.

- Cette configuration est une demonstration, pas une production validee.


