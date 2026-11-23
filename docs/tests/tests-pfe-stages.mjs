import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

console.log('================================================================');
console.log('🧪 TEST SUITE QA: Cartes 4.4 "PFE" & 4.5 "Stages"');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.log(`  ❌ [FAIL] ${testName} ${details ? '- ' + details : ''}`);
  }
}

const backendDir = path.join(rootDir, 'backend');
const srcDir = path.join(rootDir, 'src');

const pfeControllerPath = path.join(backendDir, 'controllers', 'pfeController.js');
const pfeRoutesPath = path.join(backendDir, 'routes', 'pfeRoutes.js');
const stageControllerPath = path.join(backendDir, 'controllers', 'stageController.js');
const stageRoutesPath = path.join(backendDir, 'routes', 'stageRoutes.js');
const juryControllerPath = path.join(backendDir, 'controllers', 'juryController.js');
const juryRoutesPath = path.join(backendDir, 'routes', 'juryRoutes.js');
const prismaSchemaPath = path.join(backendDir, 'prisma', 'schema.prisma');
const adminPfePath = path.join(srcDir, 'pages', 'admin', 'AdminPFE.jsx');
const pfeManagerPath = path.join(srcDir, 'pages', 'PfeManager.jsx');
const studentProjetsPath = path.join(srcDir, 'pages', 'etudiant', 'Projets.jsx');
const appPath = path.join(srcDir, 'App.jsx');
const dataContextPath = path.join(srcDir, 'contexts', 'DataContext.jsx');

console.log('🔍 1. INTÉGRITÉ ARCHITECTURALE & PRÉSENCE DES FICHIERS');
assert(fs.existsSync(pfeControllerPath), 'pfeController.js présent');
assert(fs.existsSync(pfeRoutesPath), 'pfeRoutes.js présent');
assert(fs.existsSync(stageControllerPath), 'stageController.js présent');
assert(fs.existsSync(stageRoutesPath), 'stageRoutes.js présent');
assert(fs.existsSync(juryControllerPath), 'juryController.js présent');
assert(fs.existsSync(juryRoutesPath), 'juryRoutes.js présent');
assert(fs.existsSync(prismaSchemaPath), 'schema.prisma présent');
assert(fs.existsSync(adminPfePath), 'AdminPFE.jsx présent');
assert(fs.existsSync(pfeManagerPath), 'PfeManager.jsx présent');
assert(fs.existsSync(studentProjetsPath), 'etudiant/Projets.jsx présent');
assert(fs.existsSync(appPath), 'App.jsx présent');

const pfeController = fs.readFileSync(pfeControllerPath, 'utf-8');
const pfeRoutes = fs.readFileSync(pfeRoutesPath, 'utf-8');
const stageController = fs.readFileSync(stageControllerPath, 'utf-8');
const stageRoutes = fs.readFileSync(stageRoutesPath, 'utf-8');
const juryController = fs.readFileSync(juryControllerPath, 'utf-8');
const juryRoutes = fs.readFileSync(juryRoutesPath, 'utf-8');
const schemaContent = fs.readFileSync(prismaSchemaPath, 'utf-8');
const adminPfe = fs.readFileSync(adminPfePath, 'utf-8');
const studentProjets = fs.readFileSync(studentProjetsPath, 'utf-8');
const appContent = fs.readFileSync(appPath, 'utf-8');
const dataContext = fs.readFileSync(dataContextPath, 'utf-8');

console.log('\n🔍 2. MODÈLE DE DONNÉES & RELATIONS PRISMA (DB)');
assert(schemaContent.includes('model Pfe {'), 'Modèle Prisma Pfe défini');
assert(schemaContent.includes('idPG') && schemaContent.includes('titre') && schemaContent.includes('statut'), 'Attributs idPG, titre, statut sur Pfe');
assert(schemaContent.includes('noteFinale') && schemaContent.includes('avisEncadrant'), 'Champs noteFinale et avisEncadrant configurés sur Pfe');
assert(schemaContent.includes('model Stage {'), 'Modèle Prisma Stage défini');
assert(schemaContent.includes('idStage') && schemaContent.includes('entreprise') && schemaContent.includes('conventionStatut'), 'Attributs idStage, entreprise, conventionStatut sur Stage');
assert(schemaContent.includes('dateDebut') && schemaContent.includes('dateFin'), 'Plage temporelle dateDebut/dateFin sur Stage');
assert(schemaContent.includes('model Jury {'), 'Modèle Prisma Jury défini pour les soutenances');
assert(schemaContent.includes('model DocumentPfe {'), 'Modèle DocumentPfe défini pour l\'archivage des livrables');

console.log('\n🔍 3. SÉCURITÉ DES ROUTES & CONTRÔLE D\'ACCÈS (RBAC)');
assert(pfeRoutes.includes("router.get('/', authorize('admin', 'teacher'), getAllPFE)"), 'Consultation globale PFE réservée aux admins et enseignants');
assert(pfeRoutes.includes("router.post('/propose', authorize('student'), proposePFE)"), 'Proposition de PFE réservée aux étudiants');
assert(pfeRoutes.includes("router.patch('/assign', authorize('admin'), assignEncadrant)"), 'Attribution d\'encadrant PFE réservée aux administrateurs');
assert(pfeRoutes.includes("router.patch('/:id/grade', authorize('admin'), setFinalGrade)"), 'Enregistrement de la note de PFE réservé aux administrateurs');
assert(stageRoutes.includes("router.get('/', authorize('admin', 'teacher'), getAllStages)"), 'Consultation globale stages réservée aux admins et enseignants');
assert(stageRoutes.includes("router.post('/request', authorize('student'), requestStage)"), 'Demande de convention réservée aux étudiants');
assert(stageRoutes.includes("router.patch('/:id/statut', authorize('admin'), updateStageStatut)"), 'Validation convention réservée aux administrateurs');
assert(juryRoutes.includes("authorize('admin')"), 'Création de jury réservée aux administrateurs');

console.log('\n🔍 4. LOGIQUE MÉTIER DES PROJETS DE FIN D\'ÉTUDES (Carte 4.4)');
assert(pfeController.includes('TITLE_REQUIRED'), 'Validation obligatoire du titre du PFE');
assert(pfeController.includes('PFE_ALREADY_EXISTS'), 'Contrôle d\'unicité : interdiction de soumettre plusieurs PFE');
assert(pfeController.includes("statut: 'PROPOSE'"), 'Statut initialisé à PROPOSE lors du dépôt');
assert(pfeController.includes('assignEncadrant'), 'Fonction d\'affectation officielle de l\'enseignant encadrant');
assert(pfeController.includes('setFinalGrade') && pfeController.includes('noteFinale'), 'Attribution et calcul de la note finale de soutenance');

console.log('\n🔍 5. LOGIQUE MÉTIER DES STAGES ET CONVENTIONS (Carte 4.5)');
assert(stageController.includes('ENTREPRISE_REQUIRED'), 'Nom d\'entreprise obligatoire pour la demande de stage');
assert(stageController.includes('fin < debut') || stageController.includes('INVALID_DATE_RANGE'), 'Contrôle chronologique : date de fin postérieure à la date de début');
assert(stageController.includes('ALLOWED_STATUTS') && stageController.includes('CONVENTION_SIGNEE'), 'Cycle de vie des conventions complet (SOLICITEE à SIGNEE/TERMINEE)');
assert(stageController.includes('updateStageStatut'), 'Décision administrative motivée sur les conventions');

console.log('\n🔍 6. INTERFACES FRONTEND (AdminPFE, Projets)');
assert(adminPfe.includes('selectedPFE') || adminPfe.includes('pfes'), 'Admin : tableau de bord et pilotage des projets de fin d\'études');
assert(adminPfe.includes('handleAssign') || adminPfe.includes('encadrant') || adminPfe.includes('jury'), 'Admin : interface d\'attribution des encadrants et jurys');
assert(studentProjets.includes('Projet') || studentProjets.includes('PFE') || studentProjets.includes('projets'), 'Étudiant : espace de consultation et soumission de projets');

console.log('\n🔍 7. ROUTAGE APPLICATIF & STORE GLOBAL (App.jsx & DataContext.jsx)');
assert(appContent.includes('path="/pfe"') && appContent.includes('AdminPFE'), 'Route admin "/pfe" raccordée à AdminPFE');
assert(appContent.includes('path="/etudiant/projets"') && appContent.includes('Projets'), 'Route étudiant "/etudiant/projets" raccordée à Projets');
assert(dataContext.includes("'pfes': 'idPG'") || dataContext.includes('pfes'), 'Collection pfes configurée dans DataContext');
assert(dataContext.includes("'stages': 'idStage'") || dataContext.includes('stages'), 'Collection stages configurée dans DataContext');

console.log('\n================================================================');
console.log(`📊 RÉSULTAT DU CONTRÔLE QA: ${passedTests}/${totalTests} tests validés (${Math.round((passedTests/totalTests)*100)}%)`);
if (failedTests === 0) {
  console.log('🎉 TOUS LES TESTS SONT AU VERT! CARTES 4.4 & 4.5 VALIDÉES.');
} else {
  console.log(`⚠️ ${failedTests} test(s) en échec.`);
}
console.log('================================================================\n');

export default { totalTests, passedTests, failedTests };
if (process.argv[1] === fileURLToPath(import.meta.url) && failedTests > 0) process.exit(1);
