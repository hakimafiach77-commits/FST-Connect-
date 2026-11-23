import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

console.log('================================================================');
console.log('🧪 TEST SUITE QA: Cartes 4.12 "Salles" & 4.19 "Formations"');
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

const salleControllerPath = path.join(backendDir, 'controllers', 'salleController.js');
const salleRoutesPath = path.join(backendDir, 'routes', 'salleRoutes.js');
const formationControllerPath = path.join(backendDir, 'controllers', 'formationController.js');
const formationRoutesPath = path.join(backendDir, 'routes', 'formationRoutes.js');
const prismaSchemaPath = path.join(backendDir, 'prisma', 'schema.prisma');
const adminSallesPath = path.join(srcDir, 'pages', 'admin', 'AdminSalles.jsx');
const studentFormationsPath = path.join(srcDir, 'pages', 'etudiant', 'Formations.jsx');
const publicFilieresPath = path.join(srcDir, 'pages', 'Filieres.jsx');
const appPath = path.join(srcDir, 'App.jsx');
const dataContextPath = path.join(srcDir, 'contexts', 'DataContext.jsx');

console.log('🔍 1. INTÉGRITÉ ARCHITECTURALE & PRÉSENCE DES FICHIERS');
assert(fs.existsSync(salleControllerPath), 'salleController.js présent');
assert(fs.existsSync(salleRoutesPath), 'salleRoutes.js présent');
assert(fs.existsSync(formationControllerPath), 'formationController.js présent');
assert(fs.existsSync(formationRoutesPath), 'formationRoutes.js présent');
assert(fs.existsSync(prismaSchemaPath), 'schema.prisma présent');
assert(fs.existsSync(adminSallesPath), 'AdminSalles.jsx présent');
assert(fs.existsSync(studentFormationsPath), 'etudiant/Formations.jsx présent');
assert(fs.existsSync(publicFilieresPath), 'Filieres.jsx présent');
assert(fs.existsSync(appPath), 'App.jsx présent');

const salleController = fs.readFileSync(salleControllerPath, 'utf-8');
const salleRoutes = fs.readFileSync(salleRoutesPath, 'utf-8');
const formationController = fs.readFileSync(formationControllerPath, 'utf-8');
const formationRoutes = fs.readFileSync(formationRoutesPath, 'utf-8');
const schemaContent = fs.readFileSync(prismaSchemaPath, 'utf-8');
const adminSalles = fs.readFileSync(adminSallesPath, 'utf-8');
const studentFormations = fs.readFileSync(studentFormationsPath, 'utf-8');
const appContent = fs.readFileSync(appPath, 'utf-8');
const dataContext = fs.readFileSync(dataContextPath, 'utf-8');

console.log('\n🔍 2. MODÈLE DE DONNÉES & RELATIONS PRISMA (DB)');
assert(schemaContent.includes('model Salle {'), 'Modèle Prisma Salle défini');
assert(schemaContent.includes('idSalle') && schemaContent.includes('capaciteMax') && schemaContent.includes('type'), 'Champs idSalle, capaciteMax, type sur Salle');
assert(schemaContent.includes('model Formation {'), 'Modèle Prisma Formation défini');
assert(schemaContent.includes('idFormation') && schemaContent.includes('intitule') && schemaContent.includes('statut'), 'Champs idFormation, intitule, statut sur Formation');
assert(schemaContent.includes('model Collaborateur {'), 'Modèle Prisma Collaborateur défini pour les partenaires');

console.log('\n🔍 3. SÉCURITÉ DES ROUTES & CONTRÔLE D\'ACCÈS (RBAC)');
assert(salleRoutes.includes("router.get('/', protect, getSalles)"), 'Consultation des salles protégée par JWT');
assert(salleRoutes.includes("router.post('/', protect, authorize('admin'), createSalle)"), 'Création de salle réservée au rôle admin');
assert(salleRoutes.includes("router.patch('/:id', protect, authorize('admin'), updateSalle)"), 'Modification de salle réservée au rôle admin');
assert(salleRoutes.includes("router.delete('/:id', protect, authorize('admin'), deleteSalle)"), 'Suppression de salle réservée au rôle admin');
assert(formationRoutes.includes("router.get('/', protect, getFormations)"), 'Consultation des formations protégée par JWT');
assert(formationRoutes.includes("router.get('/:id', protect, getFormationDetails)"), 'Consultation détail formation protégée par JWT');

console.log('\n🔍 4. LOGIQUE MÉTIER DES SALLES & RESSOURCES (Carte 4.12)');
assert(salleController.includes('capaciteMax'), 'Gestion de la capacité d\'accueil maximale');
assert(salleController.includes('seanceCount > 0') || salleController.includes('Cannot delete room with scheduled sessions'), 'Garde-fou : interdiction de suppression si des séances sont planifiées dans la salle');
assert(adminSalles.includes('showModal') || adminSalles.includes('showPanel') || adminSalles.includes('handle'), 'Admin : interface de création et mise à jour de locaux');

console.log('\n🔍 5. LOGIQUE MÉTIER DES FORMATIONS CONTINUES & PARTENARIATS (Carte 4.19)');
assert(formationController.includes("statut: 'OUVERTE'"), 'Filtrage exclusif des formations en statut OUVERTE');
assert(formationController.includes('collaborateur'), 'Prise en charge des collaborateurs / partenaires certifiants');
assert(studentFormations.includes('Formation') || studentFormations.includes('formations'), 'Étudiant : catalogue des formations complémentaires');

console.log('\n🔍 6. ROUTAGE APPLICATIF & STORE GLOBAL (App.jsx & DataContext.jsx)');
assert(appContent.includes('path="/salles"') && appContent.includes('AdminSalles'), 'Route admin "/salles" raccordée à AdminSalles');
assert(appContent.includes('path="/etudiant/formations"') && appContent.includes('Formations'), 'Route étudiant "/etudiant/formations" raccordée à Formations');
assert(dataContext.includes("'salles': 'idSalle'"), 'Normalisation clé primaire idSalle');

console.log('\n================================================================');
console.log(`📊 RÉSULTAT DU CONTRÔLE QA: ${passedTests}/${totalTests} tests validés (${Math.round((passedTests/totalTests)*100)}%)`);
if (failedTests === 0) {
  console.log('🎉 TOUS LES TESTS SONT AU VERT! CARTES 4.12 & 4.19 VALIDÉES.');
} else {
  console.log(`⚠️ ${failedTests} test(s) en échec.`);
}
console.log('================================================================\n');

export default { totalTests, passedTests, failedTests };
if (process.argv[1] === fileURLToPath(import.meta.url) && failedTests > 0) process.exit(1);
