-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "telephone" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Administrateur" (
    "id" SERIAL NOT NULL,
    "utilisateurId" INTEGER NOT NULL,
    "matricule" TEXT NOT NULL,

    CONSTRAINT "Administrateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Filiere" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "intitule" TEXT NOT NULL,
    "niveau" TEXT,
    "dureeAnnees" INTEGER NOT NULL DEFAULT 3,
    "coordinateurId" INTEGER,

    CONSTRAINT "Filiere_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Groupe" (
    "id" SERIAL NOT NULL,
    "filiereId" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capaciteMax" INTEGER,

    CONSTRAINT "Groupe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Etudiant" (
    "id" SERIAL NOT NULL,
    "utilisateurId" INTEGER NOT NULL,
    "cne" TEXT NOT NULL,
    "filiereId" INTEGER,
    "groupeTDId" INTEGER,
    "groupeTPId" INTEGER,
    "anneeInscription" INTEGER,
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',

    CONSTRAINT "Etudiant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enseignant" (
    "id" SERIAL NOT NULL,
    "utilisateurId" INTEGER NOT NULL,
    "matricule" TEXT NOT NULL,
    "grade" TEXT,
    "specialite" TEXT,
    "volumeHoraireBase" INTEGER,

    CONSTRAINT "Enseignant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "intitule" TEXT NOT NULL,
    "filiereId" INTEGER,
    "enseignantResponsableId" INTEGER,
    "coefficient" DECIMAL(4,2),
    "semestre" TEXT,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seance" (
    "id" SERIAL NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "enseignantId" INTEGER,
    "groupeId" INTEGER,
    "type" TEXT NOT NULL,
    "jour" TEXT,
    "heureDebut" VARCHAR(10),
    "heureFin" VARCHAR(10),
    "salle" TEXT,
    "isRattrapage" BOOLEAN NOT NULL DEFAULT false,
    "statut" TEXT NOT NULL DEFAULT 'PLANIFIEE',

    CONSTRAINT "Seance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Absence" (
    "id" SERIAL NOT NULL,
    "etudiantId" INTEGER NOT NULL,
    "seanceId" INTEGER NOT NULL,
    "dateAbsence" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" TEXT NOT NULL DEFAULT 'INJUSTIFIEE',
    "motifJustification" TEXT,
    "dateJustification" TIMESTAMP(3),

    CONSTRAIN
0 Files With Changes
￼Review Changes
T "Absence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" SERIAL NOT NULL,
    "etudiantId" INTEGER NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "noteCC" DECIMAL(4,2),
    "noteExamen" DECIMAL(4,2),
    "noteFinale" DECIMAL(4,2),
    "dateSaisie" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isCloturee" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Club" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "responsableId" INTEGER,
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubMembre" (
    "clubId" INTEGER NOT NULL,
    "etudiantId" INTEGER NOT NULL,
    "dateAdhesion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClubMembre_pkey" PRIMARY KEY ("clubId","etudiantId")
);

-- CreateTable
CREATE TABLE "Annonce" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isUrgente" BOOLEAN NOT NULL DEFAULT false,
    "cible" TEXT NOT NULL DEFAULT 'tous',
    "auteurId" INTEGER,

    CONSTRAINT "Annonce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pfe" (
    "id" SERIAL NOT NULL,
    "etudiantId" INTEGER,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "encadrantId" INTEGER,
    "statut" TEXT NOT NULL DEFAULT 'EN_COURS',
    "dateSoutenance" TIMESTAMP(3),

    CONSTRAINT "Pfe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Administrateur_utilisateurId_key" ON "Administrateur"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "Administrateur_matricule_key" ON "Administrateur"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "Filiere_code_key" ON "Filiere"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Etudiant_utilisateurId_key" ON "Etudiant"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "Etudiant_cne_key" ON "Etudiant"("cne");

-- CreateIndex
CREATE UNIQUE INDEX "Enseignant_utilisateurId_key" ON "Enseignant"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "Enseignant_matricule_key" ON "Enseignant"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "Module_code_key" ON "Module"("code");

-- AddForeignKey
ALTER TABLE "Administrateur" ADD CONSTRAINT "Administrateur_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Filiere" ADD CONSTRAINT "Filiere_coordinateurId_fkey" FOREIGN KEY ("coordinateurId") REFERENCES "Enseignant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Groupe" ADD CONSTRAINT "Groupe_filiereId_fkey" FOREIGN KEY ("filiereId") REFERENCES "Filiere"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etudiant" ADD CONSTRAINT "Etudiant_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etudiant" ADD CONSTRAINT "Etudiant_filiereId_fkey" FOREIGN KEY ("filiereId") REFERENCES "Filiere"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etudiant" ADD CONSTRAINT "Etudiant_groupeTDId_fkey" FOREIGN KEY ("groupeTDId") REFERENCES "Groupe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etudiant" ADD CONSTRAINT "Etudiant_groupeTPId_fkey" FOREIGN KEY ("groupeTPId") REFERENCES "Groupe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enseignant" ADD CONSTRAINT "Enseignant_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_filiereId_fkey" FOREIGN KEY ("filiereId") REFERENCES "Filiere"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_enseignantResponsableId_fkey" FOREIGN KEY ("enseignantResponsableId") REFERENCES "Enseignant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seance" ADD CONSTRAINT "Seance_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seance" ADD CONSTRAINT "Seance_enseignantId_fkey" FOREIGN KEY ("enseignantId") REFERENCES "Enseignant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seance" ADD CONSTRAINT "Seance_groupeId_fkey" FOREIGN KEY ("groupeId") REFERENCES "Groupe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Absence" ADD CONSTRAINT "Absence_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "Etudiant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Absence" ADD CONSTRAINT "Absence_seanceId_fkey" FOREIGN KEY ("seanceId") REFERENCES "Seance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "Etudiant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Club" ADD CONSTRAINT "Club_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "Enseignant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubMembre" ADD CONSTRAINT "ClubMembre_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubMembre" ADD CONSTRAINT "ClubMembre_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "Etudiant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Annonce" ADD CONSTRAINT "Annonce_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pfe" ADD CONSTRAINT "Pfe_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "Etudiant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pfe" ADD CONSTRAINT "Pfe_encadrantId_fkey" FOREIGN KEY ("encadrantId") REFERENCES "Enseignant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
