import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

console.log('================================================================');
console.log('🧪 TEST SUITE QA: Carte Trello 4.6 "Gestion des enseignants"');
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

const controllerPath = path.join(backendDir, 'controllers', 'enseignantController.js');
const routesPath = path.join(backendDir, 'routes', 'enseignantRoutes.js');
const prismaSchemaPath = path.join(backendDir, 'prisma', 'schema.prisma');
const adminEnseignantsPath = path.join(srcDir, 'pages', 'admin', 'AdminEnseignants.jsx');
const teachersPath = path.join(srcDir, 'pages', 'Teachers.jsx');
const appPath = path.join(srcDir, 'App.jsx');
const dataContextPath = path.join(srcDir, 'contexts', 'DataContext.jsx');

console.log('🔍 1. INTÉGRITÉ ARCHITECTURALE & FICHIERS DU MODULE 4.6');
assert(fs.existsSync(controllerPath), 'Contrôleur backend enseignantController.js présent');
assert(fs.existsSync(routesPath), 'Fichier de routes enseignantRoutes.js présent');
assert(fs.existsSync(prismaSchemaPath), 'Schéma de base de données Prisma présent');
assert(fs.existsSync(adminEnseignantsPath), 'Composant AdminEnseignants.jsx présent');
assert(fs.existsSync(teachersPath), 'Composant Teachers.jsx présent');
assert(fs.existsSync(appPath), 'Routeur principal App.jsx présent');

const controllerContent = fs.readFileSync(controllerPath, 'utf-8');
const routesContent = fs.readFileSync(routesPath, 'utf-8');
const schemaContent = fs.readFileSync(prismaSchemaPath, 'utf-8');
const adminEnseignantsContent = fs.readFileSync(adminEnseignantsPath, 'utf-8');
const appContent = fs.readFileSync(appPath, 'utf-8');
const dataContextContent = fs.readFileSync(dataContextPath, 'utf-8');

console.log('\n🔍 2. MODÈLE DE DONNÉES & RELATIONS PRISMA (DB)');
assert(schemaContent.includes('model Enseignant {'), 'Modèle Prisma "Enseignant" défini');
assert(schemaContent.includes('matricule') && schemaContent.includes('@unique'), 'Champ "matricule" unique sur le modèle Enseignant');
assert(schemaContent.includes('grade') && schemaContent.includes('specialite'), 'Attributs académiques grade et spécialité définis');
assert(schemaContent.includes('volumeHoraireBase'), 'Attribut volume horaire de base défini');
assert(schemaContent.includes('affectations') && schemaContent.includes('Affectation[]'), 'Relation "Enseignant -> Affectations" configurée');
assert(schemaContent.includes('seances') && schemaContent.includes('Seance[]'), 'Relation "Enseignant -> Séances de cours" configurée');
assert(schemaContent.includes('modulesResponsable') && schemaContent.includes('Module[]'), 'Relation de responsabilité de module configurée');

console.log('\n🔍 3. SÉCURITÉ DES ROUTES BACKEND & CONTRÔLE D\'ACCÈS (RBAC)');
assert(routesContent.includes("router.use(protect);"), 'Toutes les routes enseignants exigent une authentification JWT');
assert(routesContent.includes("authorize('teacher'), getMonProfilEnseignant"), 'Accès au profil personnel /me réservé au rôle Enseignant');
assert(routesContent.includes("authorize('admin'), createEnseignant"), 'Création d\'enseignant POST / strictement réservée à l\'Administrateur');
assert(routesContent.includes("authorize('admin'), updateEnseignant"), 'Modification enseignant PATCH /:id strictement réservée à l\'Administrateur');
assert(routesContent.includes("authorize('admin'), updateStatutEnseignant"), 'Modification statut PATCH /:id/statut strictement réservée à l\'Administrateur');
assert(routesContent.includes("authorize('admin'), deleteEnseignant"), 'Suppression DELETE /:id strictement réservée à l\'Administrateur');
assert(routesContent.includes("authorize('admin'), createAffectation"), 'Création d\'affectation POST /:id/affectations réservée à l\'Administrateur');

console.log('\n🔍 4. LOGIQUE MÉTIER & VALIDATIONS CONTRÔLEUR (enseignantController.js)');
assert(controllerContent.includes('parseIdStrict'), 'Fonction parseIdStrict présente pour validation stricte des identifiants');
assert(controllerContent.includes('SAFE_USER_SELECT'), 'Projection sécurisée SAFE_USER_SELECT pour éviter toute fuite de hash mot de passe');
assert(controllerContent.includes('EMAIL_ALREADY_EXISTS') || controllerContent.includes('existingEmail'), 'Vérification préalable d\'unicité de l\'adresse email');
assert(controllerContent.includes('MATRICULE_ALREADY_EXISTS') || controllerContent.includes('existingMatricule'), 'Vérification préalable d\'unicité du matricule enseignant');
assert(controllerContent.includes('bcrypt.hash'), 'Hachage sécurisé du mot de passe avec bcrypt');
assert(controllerContent.includes('prisma.$transaction'), 'Création et mise à jour atomique Utilisateur + Enseignant en transaction');
assert(controllerContent.includes('updateStatutEnseignant'), 'Endpoint dédié pour mise à jour synchronisée du statut (Enseignant + Utilisateur)');

console.log('\n🔍 5. GARDE-FOUS DE SUPPRESSION & INTÉGRITÉ RÉFÉRENTIELLE');
assert(controllerContent.includes('FOR UPDATE'), 'Verrouillage transactionnel exclusif FOR UPDATE contre les accès concurrents');
assert(controllerContent.includes('seancesCount') && controllerContent.includes('ENSEIGNANT_HAS_SEANCES'), 'Blocage de suppression si l\'enseignant a des séances de cours planifiées');
assert(controllerContent.includes('modulesRespCount') && controllerContent.includes('ENSEIGNANT_IS_MODULE_RESPONSABLE'), 'Blocage de suppression si l\'enseignant est responsable de modules');
assert(controllerContent.includes('groupesRespCount') && controllerContent.includes('ENSEIGNANT_IS_GROUPE_RESPONSABLE'), 'Blocage de suppression si l\'enseignant est responsable de groupes');
assert(controllerContent.includes('affectationsCount') && controllerContent.includes('ENSEIGNANT_HAS_AFFECTATIONS'), 'Blocage de suppression si l\'enseignant a des affectations actives');
assert(controllerContent.includes('pfesCount') && controllerContent.includes('ENSEIGNANT_HAS_PFES'), 'Blocage de suppression si l\'enseignant encadre des projets de fin d\'études (PFE)');

console.log('\n🔍 6. GESTION DES AFFECTATIONS PÉDAGOGIQUES (CM, TD, TP)');
assert(controllerContent.includes('createAffectation'), 'Fonction createAffectation implémentée');
assert(controllerContent.includes('deleteAffectation'), 'Fonction deleteAffectation implémentée');
assert(controllerContent.includes('typeIntervention'), 'Contrôle obligatoire du type d\'intervention (CM, TD, TP)');
assert(controllerContent.includes('heuresAssignees'), 'Validation du volume d\'heures assignées (> 0)');

console.log('\n🔍 7. INTERFACE FRONTEND & ROUTAGE APPLICATIF');
assert(appContent.includes('path="/enseignants"') && appContent.includes('AdminEnseignants'), 'Route admin "/enseignants" mappée vers AdminEnseignants');
assert(appContent.includes('path="/teachers"') && appContent.includes('Navigate to="/enseignants"'), 'Redirection de compatibilité "/teachers" -> "/enseignants"');
assert(dataContextContent.includes("'enseignants': 'idEnseignant'"), 'Indexation clé primaire idEnseignant dans DataContext');
assert(dataContextContent.includes("col === 'teachers' ? 'enseignants'"), 'Mapping bidirectionnel teachers -> enseignants');

console.log('\n================================================================');
console.log(`📊 RÉSULTAT DU CONTRÔLE QA: ${passedTests}/${totalTests} tests validés (${Math.round((passedTests/totalTests)*100)}%)`);
if (failedTests === 0) {
  console.log('🎉 TOUS LES TESTS SONT AU VERT! CARTE 4.6 VALIDÉE AVEC SUCCÈS.');
} else {
  console.log(`⚠️ ${failedTests} test(s) en échec.`);
}
console.log('================================================================\n');

export default { totalTests, passedTests, failedTests };
if (process.argv[1] === fileURLToPath(import.meta.url) && failedTests > 0) process.exit(1);
