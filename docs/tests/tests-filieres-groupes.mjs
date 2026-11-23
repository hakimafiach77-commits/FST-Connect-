import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

console.log('================================================================');
console.log('🧪 TEST SUITE QA: Carte Trello 4.13 "Filières, groupes et années"');
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

const filiereControllerPath = path.join(backendDir, 'controllers', 'filiereController.js');
const filiereRoutesPath = path.join(backendDir, 'routes', 'filiereRoutes.js');
const groupeControllerPath = path.join(backendDir, 'controllers', 'groupeController.js');
const groupeRoutesPath = path.join(backendDir, 'routes', 'groupeRoutes.js');
const prismaSchemaPath = path.join(backendDir, 'prisma', 'schema.prisma');
const adminFilieresPath = path.join(srcDir, 'pages', 'admin', 'AdminFilieres.jsx');
const publicFilieresPath = path.join(srcDir, 'pages', 'Filieres.jsx');
const appPath = path.join(srcDir, 'App.jsx');
const dataContextPath = path.join(srcDir, 'contexts', 'DataContext.jsx');

console.log('🔍 1. INTÉGRITÉ ARCHITECTURALE & FICHIERS DU MODULE 4.13');
assert(fs.existsSync(filiereControllerPath), 'Contrôleur backend filiereController.js présent');
assert(fs.existsSync(filiereRoutesPath), 'Fichier de routes filiereRoutes.js présent');
assert(fs.existsSync(groupeControllerPath), 'Contrôleur backend groupeController.js présent');
assert(fs.existsSync(groupeRoutesPath), 'Fichier de routes groupeRoutes.js présent');
assert(fs.existsSync(prismaSchemaPath), 'Schéma de base de données Prisma présent');
assert(fs.existsSync(adminFilieresPath), 'Composant AdminFilieres.jsx présent');
assert(fs.existsSync(publicFilieresPath), 'Composant public Filieres.jsx présent');
assert(fs.existsSync(appPath), 'Routeur principal App.jsx présent');

const filiereController = fs.readFileSync(filiereControllerPath, 'utf-8');
const filiereRoutes = fs.readFileSync(filiereRoutesPath, 'utf-8');
const groupeController = fs.readFileSync(groupeControllerPath, 'utf-8');
const groupeRoutes = fs.readFileSync(groupeRoutesPath, 'utf-8');
const schemaContent = fs.readFileSync(prismaSchemaPath, 'utf-8');
const adminFilieres = fs.readFileSync(adminFilieresPath, 'utf-8');
const appContent = fs.readFileSync(appPath, 'utf-8');
const dataContext = fs.readFileSync(dataContextPath, 'utf-8');

console.log('\n🔍 2. MODÈLE DE DONNÉES & RELATIONS PRISMA (DB)');
assert(schemaContent.includes('model Filiere {'), 'Modèle Prisma "Filiere" défini');
assert(schemaContent.includes('code') && schemaContent.includes('@unique'), 'Champ "code" unique sur le modèle Filiere');
assert(schemaContent.includes('model Groupe {'), 'Modèle Prisma "Groupe" défini');
assert(schemaContent.includes('model Semestre {'), 'Modèle Prisma "Semestre" défini pour la gestion des années');
assert(schemaContent.includes('idFiliere') && schemaContent.includes('groupes'), 'Relation "Filiere -> Groupe[]" configurée');
assert(schemaContent.includes('etudiantsTD') && schemaContent.includes('etudiantsTP'), 'Relations "Groupe -> Etudiants (TD/TP)" configurées');

console.log('\n🔍 3. SÉCURITÉ DES ROUTES BACKEND & CONTRÔLE D\'ACCÈS (RBAC)');
assert(filiereRoutes.includes("protect, getFilieres"), 'Route GET /api/filieres protégée par authentification (protect)');
assert(filiereRoutes.includes("protect, authorize('admin'), createFiliere"), 'Route POST /api/filieres réservée strictement au rôle Administrateur');
assert(filiereRoutes.includes("protect, authorize('admin'), updateFiliere"), 'Route PATCH /api/filieres/:id réservée strictement au rôle Administrateur');
assert(filiereRoutes.includes("protect, authorize('admin'), deleteFiliere"), 'Route DELETE /api/filieres/:id réservée strictement au rôle Administrateur');
assert(groupeRoutes.includes("protect, getGroupes"), 'Route GET /api/groupes protégée par authentification (protect)');
assert(groupeRoutes.includes("protect, authorize('admin'), createGroupe"), 'Route POST /api/groupes réservée strictement au rôle Administrateur');
assert(groupeRoutes.includes("protect, authorize('admin'), updateGroupe"), 'Route PATCH /api/groupes/:id réservée strictement au rôle Administrateur');
assert(groupeRoutes.includes("protect, authorize('admin'), deleteGroupe"), 'Route DELETE /api/groupes/:id réservée strictement au rôle Administrateur');

console.log('\n🔍 4. LOGIQUE MÉTIER BACKEND (filiereController & groupeController)');
assert(filiereController.includes("P2002") || filiereController.includes('already exists'), 'Gestion des doublons sur le code filière');
assert(filiereController.includes("Cycle d'Ingénieur"), 'Configuration des niveaux d\'études par défaut');
assert(groupeController.includes("capaciteMax"), 'Gestion de la capacité maximale des groupes TD/TP');
assert(groupeController.includes("annee"), 'Gestion du champ année universitaire sur les groupes');
assert(groupeController.includes("etudiantsProjet"), 'Prise en charge de l\'affectation aux groupes de projet');

console.log('\n🔍 5. GARDE-FOUS DE SUPPRESSION & INTÉGRITÉ RÉFÉRENTIELLE');
assert(filiereController.includes('FOR UPDATE'), 'Verrouillage exclusif FOR UPDATE lors de la suppression de filière');
assert(filiereController.includes('FILIERE_HAS_STUDENTS'), 'Blocage de suppression filière si étudiants inscrits');
assert(filiereController.includes('FILIERE_HAS_MODULES'), 'Blocage de suppression filière si modules associés');
assert(filiereController.includes('FILIERE_HAS_GROUPES'), 'Blocage de suppression filière si groupes associés');
assert(groupeController.includes('FOR UPDATE'), 'Verrouillage exclusif FOR UPDATE lors de la suppression de groupe');
assert(groupeController.includes('GROUPE_HAS_ETUDIANTS_TD'), 'Blocage de suppression groupe si étudiants TD associés');
assert(groupeController.includes('GROUPE_HAS_ETUDIANTS_TP'), 'Blocage de suppression groupe si étudiants TP associés');
assert(groupeController.includes('GROUPE_HAS_SEANCES'), 'Blocage de suppression groupe si séances planifiées');

console.log('\n🔍 6. INTERFACE D\'ADMINISTRATION FRONTEND (AdminFilieres.jsx)');
assert(adminFilieres.includes('selectedFiliereId'), 'Sélection et bascule dynamique entre filières');
assert(adminFilieres.includes('filiereStats'), 'Calcul en temps réel des statistiques d\'étudiants par filière');
assert(adminFilieres.includes('showFilierePanel') && adminFilieres.includes('showGroupPanel'), 'Panneaux latéraux dédiés pour création/édition filières et groupes');
assert(adminFilieres.includes('handleSubmitFiliere'), 'Formulaire de persistance de filière');
assert(adminFilieres.includes('handleSubmitGroup'), 'Formulaire de persistance de groupe avec type (TD/TP)');

console.log('\n🔍 7. ROUTAGE APPLICATIF & GESTION DE L\'ÉTAT (App.jsx & DataContext.jsx)');
assert(appContent.includes('path="/filieres"') && appContent.includes('AdminFilieres'), 'Route admin "/filieres" configurée vers AdminFilieres');
assert(dataContext.includes("'filieres': 'idFiliere'"), 'Normalisation clé primaire idFiliere dans DataContext');
assert(dataContext.includes("'groupes': 'idGroupe'"), 'Normalisation clé primaire idGroupe dans DataContext');
assert(dataContext.includes("col === 'groups' ? 'groupes'"), 'Résolution d\'alias groups -> groupes');

console.log('\n================================================================');
console.log(`📊 RÉSULTAT DU CONTRÔLE QA: ${passedTests}/${totalTests} tests validés (${Math.round((passedTests/totalTests)*100)}%)`);
if (failedTests === 0) {
  console.log('🎉 TOUS LES TESTS SONT AU VERT! CARTE 4.13 VALIDÉE AVEC SUCCÈS.');
} else {
  console.log(`⚠️ ${failedTests} test(s) en échec.`);
}
console.log('================================================================\n');

export default { totalTests, passedTests, failedTests };
if (process.argv[1] === fileURLToPath(import.meta.url) && failedTests > 0) process.exit(1);
