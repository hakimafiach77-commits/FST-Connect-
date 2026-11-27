-- Test uniquement sur une base dont les tables applicatives sont vides.
BEGIN;

DO $$
DECLARE
  t record;
  contient_des_donnees boolean;
BEGIN
  FOR t IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename <> '_prisma_migrations'
    ORDER BY tablename
  LOOP
    EXECUTE format('LOCK TABLE public.%I IN ACCESS EXCLUSIVE MODE', t.tablename);
  END LOOP;

  FOR t IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename <> '_prisma_migrations'
    ORDER BY tablename
  LOOP
    EXECUTE format('SELECT EXISTS (SELECT 1 FROM public.%I)', t.tablename)
      INTO contient_des_donnees;
    IF contient_des_donnees THEN
      RAISE EXCEPTION 'Migration arretee : la table % contient des donnees', t.tablename;
    END IF;
  END LOOP;
END $$;
-- DropForeignKey
ALTER TABLE "Absence" DROP CONSTRAINT "Absence_etudiantId_fkey";

-- DropForeignKey
ALTER TABLE "Absence" DROP CONSTRAINT "Absence_seanceId_fkey";

-- DropForeignKey
ALTER TABLE "Administrateur" DROP CONSTRAINT "Administrateur_utilisateurId_fkey";

-- DropForeignKey
ALTER TABLE "Annonce" DROP CONSTRAINT "Annonce_auteurId_fkey";

-- DropForeignKey
ALTER TABLE "Club" DROP CONSTRAINT "Club_responsableId_fkey";

-- DropForeignKey
ALTER TABLE "ClubMembre" DROP CONSTRAINT "ClubMembre_clubId_fkey";

-- DropForeignKey
ALTER TABLE "ClubMembre" DROP CONSTRAINT "ClubMembre_etudiantId_fkey";

-- DropForeignKey
ALTER TABLE "Enseignant" DROP CONSTRAINT "Enseignant_utilisateurId_fkey";

-- DropForeignKey
ALTER TABLE "Etudiant" DROP CONSTRAINT "Etudiant_filiereId_fkey";

-- DropForeignKey
ALTER TABLE "Etudiant" DROP CONSTRAINT "Etudiant_groupeTDId_fkey";

-- DropForeignKey
ALTER TABLE "Etudiant" DROP CONSTRAINT "Etudiant_groupeTPId_fkey";

-- DropForeignKey
ALTER TABLE "Etudiant" DROP CONSTRAINT "Etudiant_utilisateurId_fkey";

-- DropForeignKey
ALTER TABLE "Filiere" DROP CONSTRAINT "Filiere_coordinateurId_fkey";

-- DropForeignKey
ALTER TABLE "Groupe" DROP CONSTRAINT "Groupe_filiereId_fkey";

-- DropForeignKey
ALTER TABLE "Module" DROP CONSTRAINT "Module_enseignantResponsableId_fkey";

-- DropForeignKey
ALTER TABLE "Module" DROP CONSTRAINT "Module_filiereId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_etudiantId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "Pfe" DROP CONSTRAINT "Pfe_encadrantId_fkey";

-- DropForeignKey
ALTER TABLE "Pfe" DROP CONSTRAINT "Pfe_etudiantId_fkey";

-- DropForeignKey
ALTER TABLE "Seance" DROP CONSTRAINT "Seance_enseignantId_fkey";

-- DropForeignKey
ALTER TABLE "Seance" DROP CONSTRAINT "Seance_groupeId_fkey";

-- DropForeignKey
ALTER TABLE "Seance" DROP CONSTRAINT "Seance_moduleId_fkey";

-- AlterTable
ALTER TABLE "Absence" DROP CONSTRAINT "Absence_pkey",
DROP COLUMN "dateAbsence",
DROP COLUMN "dateJustification",
DROP COLUMN "etudiantId",
DROP COLUMN "id",
DROP COLUMN "motifJustification",
DROP COLUMN "seanceId",
ADD COLUMN     "dateSaisie" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "estExamen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "idAbsence" SERIAL NOT NULL,
ADD COLUMN     "idEtudiant" INTEGER NOT NULL,
ADD COLUMN     "idJustificatif" INTEGER,
ADD COLUMN     "idSeance" INTEGER NOT NULL,
ADD COLUMN     "typeSeance" VARCHAR(20),
ALTER COLUMN "statut" SET DATA TYPE VARCHAR(20),
ADD CONSTRAINT "Absence_pkey" PRIMARY KEY ("idAbsence");

-- AlterTable
ALTER TABLE "Administrateur" ALTER COLUMN "matricule" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "Annonce" DROP CONSTRAINT "Annonce_pkey",
DROP COLUMN "auteurId",
DROP COLUMN "id",
DROP COLUMN "isUrgente",
ADD COLUMN     "idAdminAuth" INTEGER,
ADD COLUMN     "idAnnonce" SERIAL NOT NULL,
ADD COLUMN     "idAuteur" INTEGER,
ADD COLUMN     "statut" VARCHAR(20) NOT NULL DEFAULT 'PUBLIEE',
ADD COLUMN     "urgent" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "titre" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "cible" SET DATA TYPE VARCHAR(100),
ADD CONSTRAINT "Annonce_pkey" PRIMARY KEY ("idAnnonce");

-- AlterTable
ALTER TABLE "Club" DROP CONSTRAINT "Club_pkey",
DROP COLUMN "id",
DROP COLUMN "responsableId",
ADD COLUMN     "idClub" SERIAL NOT NULL,
ADD COLUMN     "idResponsable" INTEGER,
ALTER COLUMN "nom" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "statut" SET DATA TYPE VARCHAR(20),
ADD CONSTRAINT "Club_pkey" PRIMARY KEY ("idClub");

-- AlterTable
ALTER TABLE "Enseignant" DROP CONSTRAINT "Enseignant_pkey",
DROP COLUMN "id",
ADD COLUMN     "idEnseignant" SERIAL NOT NULL,
ADD COLUMN     "statut" VARCHAR(20) NOT NULL DEFAULT 'ACTIF',
ADD COLUMN     "type" VARCHAR(50),
ALTER COLUMN "matricule" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "grade" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "specialite" SET DATA TYPE VARCHAR(100),
ADD CONSTRAINT "Enseignant_pkey" PRIMARY KEY ("idEnseignant");

-- AlterTable
ALTER TABLE "Etudiant" DROP CONSTRAINT "Etudiant_pkey",
DROP COLUMN "filiereId",
DROP COLUMN "groupeTDId",
DROP COLUMN "groupeTPId",
DROP COLUMN "id",
ADD COLUMN     "idEtudiant" SERIAL NOT NULL,
ADD COLUMN     "idFiliere" INTEGER,
ADD COLUMN     "idGroupeProjet" INTEGER,
ADD COLUMN     "idGroupeTD" INTEGER,
ADD COLUMN     "idGroupeTP" INTEGER,
ALTER COLUMN "cne" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "anneeInscription" SET NOT NULL,
ALTER COLUMN "anneeInscription" SET DEFAULT 1,
ALTER COLUMN "statut" SET DATA TYPE VARCHAR(20),
ADD CONSTRAINT "Etudiant_pkey" PRIMARY KEY ("idEtudiant");

-- AlterTable
ALTER TABLE "Filiere" DROP CONSTRAINT "Filiere_pkey",
DROP COLUMN "coordinateurId",
DROP COLUMN "dureeAnnees",
DROP COLUMN "id",
DROP COLUMN "niveau",
ADD COLUMN     "duree" INTEGER DEFAULT 3,
ADD COLUMN     "idFiliere" SERIAL NOT NULL,
ADD COLUMN     "niveauEtude" VARCHAR(50) DEFAULT 'Cycle d''Ingénieur',
ADD COLUMN     "nombreSemestres" INTEGER DEFAULT 6,
ALTER COLUMN "code" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "intitule" SET DATA TYPE VARCHAR(200),
ADD CONSTRAINT "Filiere_pkey" PRIMARY KEY ("idFiliere");

-- AlterTable
ALTER TABLE "Groupe" DROP CONSTRAINT "Groupe_pkey",
DROP COLUMN "filiereId",
DROP COLUMN "id",
ADD COLUMN     "annee" VARCHAR(10),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "idEnseignant" INTEGER,
ADD COLUMN     "idFiliere" INTEGER NOT NULL,
ADD COLUMN     "idGroupe" SERIAL NOT NULL,
ALTER COLUMN "nom" DROP NOT NULL,
ALTER COLUMN "nom" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "type" SET DATA TYPE VARCHAR(10),
ADD CONSTRAINT "Groupe_pkey" PRIMARY KEY ("idGroupe");

-- AlterTable
ALTER TABLE "Module" DROP CONSTRAINT "Module_pkey",
DROP COLUMN "enseignantResponsableId",
DROP COLUMN "filiereId",
DROP COLUMN "id",
ADD COLUMN     "idFiliere" INTEGER,
ADD COLUMN     "idModule" SERIAL NOT NULL,
ADD COLUMN     "idResponsable" INTEGER,
ALTER COLUMN "code" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "intitule" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "semestre" SET DATA TYPE VARCHAR(10),
ADD CONSTRAINT "Module_pkey" PRIMARY KEY ("idModule");

-- AlterTable
ALTER TABLE "Note" DROP CONSTRAINT "Note_pkey",
DROP COLUMN "etudiantId",
DROP COLUMN "id",
DROP COLUMN "isCloturee",
DROP COLUMN "moduleId",
DROP COLUMN "noteCC",
DROP COLUMN "noteExamen",
DROP COLUMN "noteFinale",
ADD COLUMN     "estVerrouillee" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "idEtudiant" INTEGER NOT NULL,
ADD COLUMN     "idExamen" INTEGER,
ADD COLUMN     "idModule" INTEGER NOT NULL,
ADD COLUMN     "idNote" SERIAL NOT NULL,
ADD COLUMN     "moyenneModule" DECIMAL(4,2),
ADD COLUMN     "valeurCC" DECIMAL(4,2),
ADD COLUMN     "valeurEF" DECIMAL(4,2),
ADD CONSTRAINT "Note_pkey" PRIMARY KEY ("idNote");

-- AlterTable
ALTER TABLE "Pfe" DROP CONSTRAINT "Pfe_pkey",
DROP COLUMN "encadrantId",
DROP COLUMN "etudiantId",
DROP COLUMN "id",
ADD COLUMN     "avisEncadrant" TEXT,
ADD COLUMN     "idEncadrant" INTEGER,
ADD COLUMN     "idEtudiant" INTEGER,
ADD COLUMN     "idJury" INTEGER,
ADD COLUMN     "idPG" SERIAL NOT NULL,
ADD COLUMN     "noteFinale" DECIMAL(4,2),
ADD COLUMN     "rapportDepose" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "titre" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "statut" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "dateSoutenance" SET DATA TYPE DATE,
ADD CONSTRAINT "Pfe_pkey" PRIMARY KEY ("idPG");

-- AlterTable
ALTER TABLE "Seance" DROP CONSTRAINT "Seance_pkey",
DROP COLUMN "enseignantId",
DROP COLUMN "groupeId",
DROP COLUMN "id",
DROP COLUMN "isRattrapage",
DROP COLUMN "moduleId",
DROP COLUMN "salle",
ADD COLUMN     "idEDT" INTEGER,
ADD COLUMN     "idEnseignant" INTEGER,
ADD COLUMN     "idGroupe" INTEGER,
ADD COLUMN     "idModule" INTEGER NOT NULL,
ADD COLUMN     "idSalle" INTEGER,
ADD COLUMN     "idSeance" SERIAL NOT NULL,
ADD COLUMN     "motifAnnulation" TEXT,
ALTER COLUMN "type" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "jour" SET NOT NULL,
ALTER COLUMN "jour" SET DATA TYPE VARCHAR(15),
ALTER COLUMN "heureDebut" SET NOT NULL,
ALTER COLUMN "heureFin" SET NOT NULL,
ALTER COLUMN "statut" SET DEFAULT 'VALIDE',
ALTER COLUMN "statut" SET DATA TYPE VARCHAR(20),
ADD CONSTRAINT "Seance_pkey" PRIMARY KEY ("idSeance");

-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "photo" VARCHAR(255),
ALTER COLUMN "nom" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "prenom" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "motDePasse" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "role" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "telephone" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "statut" SET DATA TYPE VARCHAR(20);

-- DropTable
DROP TABLE "ClubMembre";

-- CreateTable
CREATE TABLE "TokenReinit" (
    "id" SERIAL NOT NULL,
    "utilisateurId" INTEGER NOT NULL,
    "valeur" VARCHAR(255) NOT NULL,
    "dateExpiration" TIMESTAMP(3) NOT NULL,
    "statut" VARCHAR(20) NOT NULL DEFAULT 'ACTIF',

    CONSTRAINT "TokenReinit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionService" (
    "id" SERIAL NOT NULL,
    "logic" TEXT NOT NULL,
    "idUtilisateur" INTEGER NOT NULL,

    CONSTRAINT "SessionService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoriqueConnexion" (
    "id" SERIAL NOT NULL,
    "utilisateurId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adresseIP" VARCHAR(45),
    "statut" VARCHAR(20) NOT NULL,
    "resultat" TEXT,

    CONSTRAINT "HistoriqueConnexion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleService" (
    "id" SERIAL NOT NULL,
    "listeRoles" TEXT NOT NULL,
    "idUtilisateur" INTEGER NOT NULL,

    CONSTRAINT "RoleService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Affectation" (
    "idAffectation" SERIAL NOT NULL,
    "typeIntervention" VARCHAR(50) NOT NULL,
    "heuresAssignees" INTEGER NOT NULL,
    "idEnseignant" INTEGER NOT NULL,
    "idModule" INTEGER NOT NULL,

    CONSTRAINT "Affectation_pkey" PRIMARY KEY ("idAffectation")
);

-- CreateTable
CREATE TABLE "Document" (
    "idDocument" SERIAL NOT NULL,
    "titre" VARCHAR(200) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "cheminFichier" VARCHAR(255) NOT NULL,
    "dateUpload" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idModule" INTEGER,
    "idAuteur" INTEGER,
    "idFiliere" INTEGER,
    "version" VARCHAR(20) DEFAULT '1.0',
    "status" VARCHAR(20) DEFAULT 'PUBLIÉ',
    "author" VARCHAR(100) DEFAULT 'Administration',
    "dateLimite" DATE,
    "deadline" VARCHAR(50),
    "description" TEXT,
    "submissionsCount" INTEGER DEFAULT 0,
    "totalStudents" INTEGER DEFAULT 30,
    "nombreTelechargements" INTEGER DEFAULT 0,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("idDocument")
);

-- CreateTable
CREATE TABLE "Semestre" (
    "idSemestre" SERIAL NOT NULL,
    "libelle" VARCHAR(50) NOT NULL,
    "estCloture" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Semestre_pkey" PRIMARY KEY ("idSemestre")
);

-- CreateTable
CREATE TABLE "Edt" (
    "idEDT" SERIAL NOT NULL,
    "idFiliere" INTEGER NOT NULL,
    "idGroupe" INTEGER NOT NULL,
    "semestre" VARCHAR(10) NOT NULL,
    "statut" VARCHAR(20) NOT NULL DEFAULT 'PUBLIE',

    CONSTRAINT "Edt_pkey" PRIMARY KEY ("idEDT")
);

-- CreateTable
CREATE TABLE "Salle" (
    "idSalle" SERIAL NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "capaciteMax" INTEGER NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "statut" VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE',

    CONSTRAINT "Salle_pkey" PRIMARY KEY ("idSalle")
);

-- CreateTable
CREATE TABLE "Justificatif" (
    "idJustificatif" SERIAL NOT NULL,
    "scanDocument" VARCHAR(255),
    "motif" TEXT NOT NULL,
    "dateSoumission" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "etat" VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE',

    CONSTRAINT "Justificatif_pkey" PRIMARY KEY ("idJustificatif")
);

-- CreateTable
CREATE TABLE "CompteurAbsence" (
    "idEtudiant" INTEGER NOT NULL,
    "tauxActuel" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "totalHeuresAbsence" INTEGER NOT NULL DEFAULT 0,
    "totalHeuresModule" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CompteurAbsence_pkey" PRIMARY KEY ("idEtudiant")
);

-- CreateTable
CREATE TABLE "ServiceNotification" (
    "id" SERIAL NOT NULL,
    "logic" TEXT NOT NULL,
    "idCompteurAbsence" INTEGER NOT NULL,

    CONSTRAINT "ServiceNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Examen" (
    "idExamen" SERIAL NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "date" DATE NOT NULL,
    "heure" VARCHAR(10) NOT NULL,
    "idSalle" INTEGER,
    "idModule" INTEGER NOT NULL,

    CONSTRAINT "Examen_pkey" PRIMARY KEY ("idExamen")
);

-- CreateTable
CREATE TABLE "Reclamation" (
    "idReclamation" SERIAL NOT NULL,
    "idNote" INTEGER NOT NULL,
    "motif" TEXT NOT NULL,
    "reponseEnseignant" TEXT,
    "dateDepot" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" VARCHAR(20) NOT NULL DEFAULT 'OUVERTE',

    CONSTRAINT "Reclamation_pkey" PRIMARY KEY ("idReclamation")
);

-- CreateTable
CREATE TABLE "ResultatFinal" (
    "idResultat" SERIAL NOT NULL,
    "idSemestre" INTEGER NOT NULL,
    "moyenneGenerale" DECIMAL(4,2),
    "statut" VARCHAR(20),
    "estPublie" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ResultatFinal_pkey" PRIMARY KEY ("idResultat")
);

-- CreateTable
CREATE TABLE "Stage" (
    "idStage" SERIAL NOT NULL,
    "idEtudiant" INTEGER NOT NULL,
    "entreprise" VARCHAR(100) NOT NULL,
    "dateDebut" DATE NOT NULL,
    "dateFin" DATE NOT NULL,
    "conventionStatut" VARCHAR(30) NOT NULL DEFAULT 'EN_PREPARATION',
    "rapportDepose" BOOLEAN NOT NULL DEFAULT false,
    "noteStage" DECIMAL(4,2),

    CONSTRAINT "Stage_pkey" PRIMARY KEY ("idStage")
);

-- CreateTable
CREATE TABLE "Jury" (
    "idJury" SERIAL NOT NULL,
    "dateSoutenance" DATE NOT NULL,

    CONSTRAINT "Jury_pkey" PRIMARY KEY ("idJury")
);

-- CreateTable
CREATE TABLE "DocumentPfe" (
    "idDocument" SERIAL NOT NULL,
    "idStage" INTEGER,
    "fichierPDF" VARCHAR(255) NOT NULL,
    "dateArchivage" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" VARCHAR(50) NOT NULL,
    "idPG" INTEGER,

    CONSTRAINT "DocumentPfe_pkey" PRIMARY KEY ("idDocument")
);

-- CreateTable
CREATE TABLE "Notification" (
    "idNotification" SERIAL NOT NULL,
    "idUtilisateur" INTEGER NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "message" TEXT NOT NULL,
    "dateEnvoi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "priorite" VARCHAR(20) NOT NULL DEFAULT 'Normal',

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("idNotification")
);

-- CreateTable
CREATE TABLE "Dashboard" (
    "idDashboard" SERIAL NOT NULL,
    "idUtilisateur" INTEGER NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "dernierChargement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dashboard_pkey" PRIMARY KEY ("idDashboard")
);

-- CreateTable
CREATE TABLE "DashboardAdminData" (
    "id" SERIAL NOT NULL,
    "idDashboard" INTEGER NOT NULL,
    "nbNotesSaisies" INTEGER NOT NULL DEFAULT 0,
    "nbPFEEnCours" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DashboardAdminData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardEnseignantData" (
    "id" SERIAL NOT NULL,
    "idDashboard" INTEGER NOT NULL,
    "modulesPendants" TEXT,

    CONSTRAINT "DashboardEnseignantData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardEtudiantData" (
    "id" SERIAL NOT NULL,
    "idDashboard" INTEGER NOT NULL,
    "tauxAbsence" DECIMAL(5,2) NOT NULL DEFAULT 0,

    CONSTRAINT "DashboardEtudiantData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Formation" (
    "idFormation" SERIAL NOT NULL,
    "intitule" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "type" VARCHAR(50) NOT NULL,
    "statut" VARCHAR(20) NOT NULL DEFAULT 'OUVERTE',
    "idCollaborateur" INTEGER,

    CONSTRAINT "Formation_pkey" PRIMARY KEY ("idFormation")
);

-- CreateTable
CREATE TABLE "Collaborateur" (
    "idCollaborateur" SERIAL NOT NULL,
    "nomOrganisme" VARCHAR(100) NOT NULL,
    "contact" VARCHAR(150),
    "domaine" VARCHAR(100),

    CONSTRAINT "Collaborateur_pkey" PRIMARY KEY ("idCollaborateur")
);

-- CreateTable
CREATE TABLE "Inscription" (
    "idInscription" SERIAL NOT NULL,
    "idUtilisateur" INTEGER NOT NULL,
    "idFormation" INTEGER NOT NULL,
    "dateInscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" VARCHAR(20) NOT NULL DEFAULT 'VALIDEE',

    CONSTRAINT "Inscription_pkey" PRIMARY KEY ("idInscription")
);

-- CreateTable
CREATE TABLE "MailService" (
    "id" SERIAL NOT NULL,
    "logic" TEXT NOT NULL,
    "idAdministrateur" INTEGER NOT NULL,

    CONSTRAINT "MailService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_JuryEnseignants" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_JuryEnseignants_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ClubMembres" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ClubMembres_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "TokenReinit_valeur_key" ON "TokenReinit"("valeur");

-- CreateIndex
CREATE UNIQUE INDEX "SessionService_idUtilisateur_key" ON "SessionService"("idUtilisateur");

-- CreateIndex
CREATE UNIQUE INDEX "RoleService_idUtilisateur_key" ON "RoleService"("idUtilisateur");

-- CreateIndex
CREATE UNIQUE INDEX "Salle_nom_key" ON "Salle"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceNotification_idCompteurAbsence_key" ON "ServiceNotification"("idCompteurAbsence");

-- CreateIndex
CREATE UNIQUE INDEX "Dashboard_idUtilisateur_key" ON "Dashboard"("idUtilisateur");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardAdminData_idDashboard_key" ON "DashboardAdminData"("idDashboard");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardEnseignantData_idDashboard_key" ON "DashboardEnseignantData"("idDashboard");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardEtudiantData_idDashboard_key" ON "DashboardEtudiantData"("idDashboard");

-- CreateIndex
CREATE UNIQUE INDEX "MailService_idAdministrateur_key" ON "MailService"("idAdministrateur");

-- CreateIndex
CREATE INDEX "_JuryEnseignants_B_index" ON "_JuryEnseignants"("B");

-- CreateIndex
CREATE INDEX "_ClubMembres_B_index" ON "_ClubMembres"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Absence_idJustificatif_key" ON "Absence"("idJustificatif");

-- CreateIndex
CREATE UNIQUE INDEX "Note_idEtudiant_idModule_idExamen_key" ON "Note"("idEtudiant", "idModule", "idExamen");

-- AddForeignKey
ALTER TABLE "Administrateur" ADD CONSTRAINT "Administrateur_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenReinit" ADD CONSTRAINT "TokenReinit_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionService" ADD CONSTRAINT "SessionService_idUtilisateur_fkey" FOREIGN KEY ("idUtilisateur") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriqueConnexion" ADD CONSTRAINT "HistoriqueConnexion_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleService" ADD CONSTRAINT "RoleService_idUtilisateur_fkey" FOREIGN KEY ("idUtilisateur") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etudiant" ADD CONSTRAINT "Etudiant_idFiliere_fkey" FOREIGN KEY ("idFiliere") REFERENCES "Filiere"("idFiliere") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etudiant" ADD CONSTRAINT "Etudiant_idGroupeProjet_fkey" FOREIGN KEY ("idGroupeProjet") REFERENCES "Groupe"("idGroupe") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etudiant" ADD CONSTRAINT "Etudiant_idGroupeTD_fkey" FOREIGN KEY ("idGroupeTD") REFERENCES "Groupe"("idGroupe") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etudiant" ADD CONSTRAINT "Etudiant_idGroupeTP_fkey" FOREIGN KEY ("idGroupeTP") REFERENCES "Groupe"("idGroupe") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etudiant" ADD CONSTRAINT "Etudiant_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enseignant" ADD CONSTRAINT "Enseignant_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Groupe" ADD CONSTRAINT "Groupe_idEnseignant_fkey" FOREIGN KEY ("idEnseignant") REFERENCES "Enseignant"("idEnseignant") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Groupe" ADD CONSTRAINT "Groupe_idFiliere_fkey" FOREIGN KEY ("idFiliere") REFERENCES "Filiere"("idFiliere") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Club" ADD CONSTRAINT "Club_idResponsable_fkey" FOREIGN KEY ("idResponsable") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_idFiliere_fkey" FOREIGN KEY ("idFiliere") REFERENCES "Filiere"("idFiliere") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_idResponsable_fkey" FOREIGN KEY ("idResponsable") REFERENCES "Enseignant"("idEnseignant") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Affectation" ADD CONSTRAINT "Affectation_idEnseignant_fkey" FOREIGN KEY ("idEnseignant") REFERENCES "Enseignant"("idEnseignant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Affectation" ADD CONSTRAINT "Affectation_idModule_fkey" FOREIGN KEY ("idModule") REFERENCES "Module"("idModule") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_idFiliere_fkey" FOREIGN KEY ("idFiliere") REFERENCES "Filiere"("idFiliere") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_idModule_fkey" FOREIGN KEY ("idModule") REFERENCES "Module"("idModule") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edt" ADD CONSTRAINT "Edt_idFiliere_fkey" FOREIGN KEY ("idFiliere") REFERENCES "Filiere"("idFiliere") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edt" ADD CONSTRAINT "Edt_idGroupe_fkey" FOREIGN KEY ("idGroupe") REFERENCES "Groupe"("idGroupe") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seance" ADD CONSTRAINT "Seance_idEDT_fkey" FOREIGN KEY ("idEDT") REFERENCES "Edt"("idEDT") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seance" ADD CONSTRAINT "Seance_idEnseignant_fkey" FOREIGN KEY ("idEnseignant") REFERENCES "Enseignant"("idEnseignant") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seance" ADD CONSTRAINT "Seance_idGroupe_fkey" FOREIGN KEY ("idGroupe") REFERENCES "Groupe"("idGroupe") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seance" ADD CONSTRAINT "Seance_idModule_fkey" FOREIGN KEY ("idModule") REFERENCES "Module"("idModule") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seance" ADD CONSTRAINT "Seance_idSalle_fkey" FOREIGN KEY ("idSalle") REFERENCES "Salle"("idSalle") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Absence" ADD CONSTRAINT "Absence_idEtudiant_fkey" FOREIGN KEY ("idEtudiant") REFERENCES "Etudiant"("idEtudiant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Absence" ADD CONSTRAINT "Absence_idJustificatif_fkey" FOREIGN KEY ("idJustificatif") REFERENCES "Justificatif"("idJustificatif") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Absence" ADD CONSTRAINT "Absence_idSeance_fkey" FOREIGN KEY ("idSeance") REFERENCES "Seance"("idSeance") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompteurAbsence" ADD CONSTRAINT "CompteurAbsence_idEtudiant_fkey" FOREIGN KEY ("idEtudiant") REFERENCES "Etudiant"("idEtudiant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceNotification" ADD CONSTRAINT "ServiceNotification_idCompteurAbsence_fkey" FOREIGN KEY ("idCompteurAbsence") REFERENCES "CompteurAbsence"("idEtudiant") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Examen" ADD CONSTRAINT "Examen_idModule_fkey" FOREIGN KEY ("idModule") REFERENCES "Module"("idModule") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Examen" ADD CONSTRAINT "Examen_idSalle_fkey" FOREIGN KEY ("idSalle") REFERENCES "Salle"("idSalle") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_idEtudiant_fkey" FOREIGN KEY ("idEtudiant") REFERENCES "Etudiant"("idEtudiant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_idExamen_fkey" FOREIGN KEY ("idExamen") REFERENCES "Examen"("idExamen") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_idModule_fkey" FOREIGN KEY ("idModule") REFERENCES "Module"("idModule") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reclamation" ADD CONSTRAINT "Reclamation_idNote_fkey" FOREIGN KEY ("idNote") REFERENCES "Note"("idNote") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultatFinal" ADD CONSTRAINT "ResultatFinal_idSemestre_fkey" FOREIGN KEY ("idSemestre") REFERENCES "Semestre"("idSemestre") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pfe" ADD CONSTRAINT "Pfe_idEncadrant_fkey" FOREIGN KEY ("idEncadrant") REFERENCES "Enseignant"("idEnseignant") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pfe" ADD CONSTRAINT "Pfe_idEtudiant_fkey" FOREIGN KEY ("idEtudiant") REFERENCES "Etudiant"("idEtudiant") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pfe" ADD CONSTRAINT "Pfe_idJury_fkey" FOREIGN KEY ("idJury") REFERENCES "Jury"("idJury") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_idEtudiant_fkey" FOREIGN KEY ("idEtudiant") REFERENCES "Etudiant"("idEtudiant") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPfe" ADD CONSTRAINT "DocumentPfe_idPG_fkey" FOREIGN KEY ("idPG") REFERENCES "Pfe"("idPG") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPfe" ADD CONSTRAINT "DocumentPfe_idStage_fkey" FOREIGN KEY ("idStage") REFERENCES "Stage"("idStage") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Annonce" ADD CONSTRAINT "Annonce_idAdminAuth_fkey" FOREIGN KEY ("idAdminAuth") REFERENCES "Administrateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Annonce" ADD CONSTRAINT "Annonce_idAuteur_fkey" FOREIGN KEY ("idAuteur") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_idUtilisateur_fkey" FOREIGN KEY ("idUtilisateur") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dashboard" ADD CONSTRAINT "Dashboard_idUtilisateur_fkey" FOREIGN KEY ("idUtilisateur") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardAdminData" ADD CONSTRAINT "DashboardAdminData_idDashboard_fkey" FOREIGN KEY ("idDashboard") REFERENCES "Dashboard"("idDashboard") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardEnseignantData" ADD CONSTRAINT "DashboardEnseignantData_idDashboard_fkey" FOREIGN KEY ("idDashboard") REFERENCES "Dashboard"("idDashboard") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardEtudiantData" ADD CONSTRAINT "DashboardEtudiantData_idDashboard_fkey" FOREIGN KEY ("idDashboard") REFERENCES "Dashboard"("idDashboard") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Formation" ADD CONSTRAINT "Formation_idCollaborateur_fkey" FOREIGN KEY ("idCollaborateur") REFERENCES "Collaborateur"("idCollaborateur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscription" ADD CONSTRAINT "Inscription_idFormation_fkey" FOREIGN KEY ("idFormation") REFERENCES "Formation"("idFormation") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscription" ADD CONSTRAINT "Inscription_idUtilisateur_fkey" FOREIGN KEY ("idUtilisateur") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MailService" ADD CONSTRAINT "MailService_idAdministrateur_fkey" FOREIGN KEY ("idAdministrateur") REFERENCES "Administrateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JuryEnseignants" ADD CONSTRAINT "_JuryEnseignants_A_fkey" FOREIGN KEY ("A") REFERENCES "Enseignant"("idEnseignant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JuryEnseignants" ADD CONSTRAINT "_JuryEnseignants_B_fkey" FOREIGN KEY ("B") REFERENCES "Jury"("idJury") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClubMembres" ADD CONSTRAINT "_ClubMembres_A_fkey" FOREIGN KEY ("A") REFERENCES "Club"("idClub") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClubMembres" ADD CONSTRAINT "_ClubMembres_B_fkey" FOREIGN KEY ("B") REFERENCES "Etudiant"("idEtudiant") ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;
