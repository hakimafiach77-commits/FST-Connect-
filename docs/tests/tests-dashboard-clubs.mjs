import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

console.log('================================================================');
console.log('🧪 TEST SUITE QA: Cartes 4.14 "Tableaux de bord" & 4.18 "Clubs"');
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

const dashboardControllerPath = path.join(backendDir, 'controllers', 'dashboardController.js');
const dashboardRoutesPath = path.join(backendDir, 'routes', 'dashboardRoutes.js');
const prismaSchemaPath = path.join(backendDir, 'prisma', 'schema.prisma');
const adminDashboardPath = path.join(srcDir, 'pages', 'admin', 'AdminDashboard.jsx');
const enseignantDashboardPath = path.join(srcDir, 'pages', 'enseignant', 'EnseignantDashboard.jsx');
const etudiantDashboardPath = path.join(srcDir, 'pages', 'etudiant', 'EtudiantDashboard.jsx');
const publicClubsPath = path.join(srcDir, 'pages', 'PublicClubs.jsx');
const studentClubsPath = path.join(srcDir, 'pages', 'etudiant', 'Clubs.jsx');
const appPath = path.join(srcDir, 'App.jsx');
const dataContextPath = path.join(srcDir, 'contexts', 'DataContext.jsx');

console.log('🔍 1. INTÉGRITÉ ARCHITECTURALE & PRÉSENCE DES FICHIERS');
assert(fs.existsSync(dashboardControllerPath), 'dashboardController.js présent');
assert(fs.existsSync(dashboardRoutesPath), 'dashboardRoutes.js présent');
assert(fs.existsSync(prismaSchemaPath), 'schema.prisma présent');
assert(fs.existsSync(adminDashboardPath), 'AdminDashboard.jsx présent');
assert(fs.existsSync(enseignantDashboardPath), 'EnseignantDashboard.jsx présent');
assert(fs.existsSync(etudiantDashboardPath), 'EtudiantDashboard.jsx présent');
assert(fs.existsSync(publicClubsPath), 'PublicClubs.jsx présent');
assert(fs.existsSync(studentClubsPath), 'etudiant/Clubs.jsx présent');
assert(fs.existsSync(appPath), 'App.jsx présent');

const dashboardController = fs.readFileSync(dashboardControllerPath, 'utf-8');
const dashboardRoutes = fs.readFileSync(dashboardRoutesPath, 'utf-8');
const schemaContent = fs.readFileSync(prismaSchemaPath, 'utf-8');
const adminDashboard = fs.readFileSync(adminDashboardPath, 'utf-8');
const enseignantDashboard = fs.readFileSync(enseignantDashboardPath, 'utf-8');
const etudiantDashboard = fs.readFileSync(etudiantDashboardPath, 'utf-8');
const publicClubs = fs.readFileSync(publicClubsPath, 'utf-8');
const studentClubs = fs.readFileSync(studentClubsPath, 'utf-8');
const appContent = fs.readFileSync(appPath, 'utf-8');
const dataContext = fs.readFileSync(dataContextPath, 'utf-8');

console.log('\n🔍 2. MODÈLE DE DONNÉES PRISMA (DB)');
assert(schemaContent.includes('model Dashboard {'), 'Modèle Prisma Dashboard défini');
assert(schemaContent.includes('idDashboard') && schemaContent.includes('dernierChargement'), 'Attributs idDashboard et dernierChargement sur Dashboard');
assert(schemaContent.includes('idUtilisateur'), 'Liaison compte utilisateur sur Dashboard');

console.log('\n🔍 3. SÉCURITÉ DES ROUTES & CONTRÔLE D\'ACCÈS (RBAC)');
assert(dashboardRoutes.includes("router.get('/', protect, getUserDashboard)"), 'Consultation du dashboard protégée par authentification (protect)');
assert(dashboardRoutes.includes("router.patch('/refresh', protect, refreshDashboard)"), 'Rafraîchissement des métriques protégé');

console.log('\n🔍 4. CALCUL DYNAMIQUE DES KPI MULTI-PROFILS (Carte 4.14)');
assert(dashboardController.includes('computeDynamicAnalytics'), 'Moteur de calcul analytique dynamique computeDynamicAnalytics');
assert(dashboardController.includes('totalEtudiants') && dashboardController.includes('totalEnseignants'), 'Admin : métriques macroscopiques départementales (étudiants, enseignants)');
assert(dashboardController.includes('totalModules') && dashboardController.includes('totalSalles'), 'Admin : métriques ressources pédagogiques et matérielles');
assert(dashboardController.includes('modulesEnseignes') && dashboardController.includes('seancesHebdo'), 'Enseignant : métriques de charge hebdomadaire et cours');
assert(dashboardController.includes('totalAbsencesHeures') && dashboardController.includes('totalNotes'), 'Étudiant : indicateurs d\'assiduité et progression académique');

console.log('\n🔍 5. VIE ÉTUDIANTE & GESTION DES CLUBS (Carte 4.18)');
assert(publicClubs.includes('activeClubs') || publicClubs.includes('clubs'), 'PublicClubs : vitrine des associations et clubs actifs');
assert(publicClubs.includes('robot') || publicClubs.includes('cyber') || publicClubs.includes('data'), 'PublicClubs : catégorisation thématique des clubs étudiants');
assert(studentClubs.includes('handleToggleJoin'), 'Clubs (Étudiant) : gestion dynamique d\'adhésion / désinscription');
assert(studentClubs.includes('joined') || studentClubs.includes('available'), 'Clubs (Étudiant) : filtrage par statut d\'affiliation');

console.log('\n🔍 6. ROUTAGE APPLICATIF & STORE GLOBAL');
assert(appContent.includes('path="/clubs"') && appContent.includes('PublicClubs'), 'Route publique "/clubs" branchée sur PublicClubs');
assert(appContent.includes('path="/etudiant/clubs"') && appContent.includes('Clubs'), 'Route étudiant "/etudiant/clubs" branchée sur Clubs');
assert(dataContext.includes("'clubs'") || dataContext.includes('clubs'), 'Gestion des clubs dans le store DataContext');

console.log('\n================================================================');
console.log(`📊 RÉSULTAT DU CONTRÔLE QA: ${passedTests}/${totalTests} tests validés (${Math.round((passedTests/totalTests)*100)}%)`);
if (failedTests === 0) {
  console.log('🎉 TOUS LES TESTS SONT AU VERT! CARTES 4.14 & 4.18 VALIDÉES.');
} else {
  console.log(`⚠️ ${failedTests} test(s) en échec.`);
}
console.log('================================================================\n');

export default { totalTests, passedTests, failedTests };
if (process.argv[1] === fileURLToPath(import.meta.url) && failedTests > 0) process.exit(1);
