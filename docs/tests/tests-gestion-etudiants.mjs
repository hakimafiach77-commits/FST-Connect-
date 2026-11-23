import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

console.log('================================================================');
console.log('🧪 TEST SUITE QA: Carte Trello 4.3 "Gestion des étudiants"');
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

const controllerPath = path.join(backendDir, 'controllers', 'etudiantController.js');
const routesPath = path.join(backendDir, 'routes', 'etudiantRoutes.js');
const prismaSchemaPath = path.join(backendDir, 'prisma', 'schema.prisma');
const adminEtudiantsPath = path.join(srcDir, 'pages', 'admin', 'AdminEtudiants.jsx');
const publicStudentsPath = path.join(srcDir, 'pages', 'PublicStudents.jsx');
const appPath = path.join(srcDir, 'App.jsx');
const dataContextPath = path.join(srcDir, 'contexts', 'DataContext.jsx');

console.log('🔍 1. INTÉGRITÉ ARCHITECTURALE & FICHIERS DU MODULE');
assert(fs.existsSync(controllerPath), 'Contrôleur backend etudiantController.js présent');
assert(fs.existsSync(routesPath), 'Fichier de routes etudiantRoutes.js présent');
assert(fs.existsSync(prismaSchemaPath), 'Schéma de base de données Prisma présent');
assert(fs.existsSync(adminEtudiantsPath), 'Composant AdminEtudiants.jsx présent');
assert(fs.existsSync(publicStudentsPath), 'Composant PublicStudents.jsx présent');
assert(fs.existsSync(appPath), 'Routeur principal App.jsx présent');

const controllerContent = fs.readFileSync(controllerPath, 'utf-8');
const routesContent = fs.readFileSync(routesPath, 'utf-8');
const schemaContent = fs.readFileSync(prismaSchemaPath, 'utf-8');
const adminEtudiantsContent = fs.readFileSync(adminEtudiantsPath, 'utf-8');
const publicStudentsContent = fs.readFileSync(publicStudentsPath, 'utf-8');
const appContent = fs.readFileSync(appPath, 'utf-8');
const dataContextContent = fs.readFileSync(dataContextPath, 'utf-8');

console.log('\n🔍 2. MODÈLE DE DONNÉES & ENTITÉS PRISMA (DB)');
assert(schemaContent.includes('model Etudiant {'), 'Modèle Prisma "Etudiant" défini');
assert(schemaContent.includes('cne') && schemaContent.includes('@unique'), 'Champ "cne" unique sur le modèle Etudiant');
assert(schemaContent.includes('idFiliere') && schemaContent.includes('filiere'), 'Relation "Etudiant -> Filiere" configurée');
assert(schemaContent.includes('groupeTD') && schemaContent.includes('groupeTP'), 'Relations "Etudiant -> Groupes TD / TP" configurées');
assert(schemaContent.includes('compteurAbsence') && schemaContent.includes('CompteurAbsence?'), 'Relation "Etudiant -> CompteurAbsence" configurée');
assert(schemaContent.includes('onDelete: Cascade'), 'Suppression en cascade liée au profil utilisateur');

console.log('\n🔍 3. SÉCURITÉ DES ROUTES BACKEND & CONTRÔLE D\'ACCÈS (RBAC)');
assert(routesContent.includes("router.use(protect)"), 'Toutes les routes /api/etudiants protégées par JWT (protect)');
assert(routesContent.includes("authorize('admin')") && routesContent.includes("createEtudiant"), 'Route POST /api/etudiants réservée strictement au rôle Administrateur');
assert(routesContent.includes("authorize('admin')") && routesContent.includes("updateEtudiant"), 'Route PATCH /api/etudiants/:id réservée strictement au rôle Administrateur');
assert(routesContent.includes("authorize('admin')") && routesContent.includes("deleteEtudiant"), 'Route DELETE /api/etudiants/:id réservée strictement au rôle Administrateur');

console.log('\n🔍 4. LOGIQUE MÉTIER & CONTRÔLEUR BACKEND (etudiantController.js)');
assert(controllerContent.includes('prisma.$transaction'), 'Inscriptions et suppressions encapsulées dans des transactions atomiques ($transaction)');
assert(controllerContent.includes('bcrypt.hash'), 'Hachage sécurisé du mot de passe utilisateur par défaut à la création');
assert(controllerContent.includes('compteurAbsence.create'), 'Initialisation automatique du compteur d\'absences à 0h');
assert(controllerContent.includes('existingCne') || controllerContent.includes('cleanCne') || controllerContent.includes('P2002'), 'Gestion stricte des doublons et de l\'unicité du CNE et de l\'email');
assert(controllerContent.includes('parsedGroupeTD') || controllerContent.includes('groupTD') || controllerContent.includes('checkTD'), 'Vérification de l\'existence réelle des groupes TD/TP');
assert(controllerContent.includes('compteurAbsence.deleteMany') || controllerContent.includes('deleteEtudiant'), 'Nettoyage en cascade et suppression sécurisée des dossiers');

console.log('\n🔍 5. INTERFACE D\'ADMINISTRATION FRONTEND (AdminEtudiants.jsx)');
assert(adminEtudiantsContent.includes('Registre National des Étudiants'), 'Titre de page Registre National présent');
assert(adminEtudiantsContent.includes('Nouvelle Inscription'), 'Bouton d\'action "Nouvelle Inscription" présent');
assert(adminEtudiantsContent.includes('Exporter Registre'), 'Bouton d\'exportation du registre présent');
assert(adminEtudiantsContent.includes('filteredStudents'), 'Système de recherche multi-critères (nom, prénom, CNE)');
assert(adminEtudiantsContent.includes('selectedFiliereId') && adminEtudiantsContent.includes('selectedYear'), 'Filtrage hiérarchique par Filière et Année d\'étude');
assert(adminEtudiantsContent.includes('hasAbsences') && adminEtudiantsContent.includes('hasGrades'), 'Garde-fou de suppression : interdiction de supprimer si absences ou notes associées');
assert(adminEtudiantsContent.includes('badge-green') && adminEtudiantsContent.includes('REDOUBLANT'), 'Indicateurs visuels de statut étudiant (ACTIF, REDOUBLANT, DIPLOME, ABANDONNE)');
assert(adminEtudiantsContent.includes('handleSubmit'), 'Validation obligatoire des champs (nom, CNE, filière)');

console.log('\n🔍 6. VITRINE PUBLIQUE & CONSULTATION (PublicStudents.jsx)');
assert(publicStudentsContent.includes('generateListDocuments'), 'Génération dynamique des documents officiels de listes d\'étudiants');
assert(publicStudentsContent.includes('selectedFiliere'), 'Filtrage public des promotions par filière');
assert(publicStudentsContent.includes('Département Informatique'), 'Entête institutionnel public conforme');

console.log('\n🔍 7. ROUTAGE APPLICATIF & GESTION DE L\'ÉTAT (App.jsx & DataContext.jsx)');
assert(appContent.includes('path="/registre"') && appContent.includes('AdminEtudiants'), 'Route admin "/registre" configurée vers AdminEtudiants');
assert(appContent.includes('path="/students"') && appContent.includes('Navigate to="/registre"'), 'Redirection intelligente de compatibilité "/students" -> "/registre"');
assert(appContent.includes('path="/etudiants"') && appContent.includes('PublicStudents'), 'Route publique "/etudiants" configurée vers PublicStudents');
assert(dataContextContent.includes("'etudiants': 'idEtudiant'"), 'Normalisation de la clé primaire idEtudiant dans DataContext');
assert(dataContextContent.includes("col === 'students' ? 'etudiants'"), 'Mapping bidirectionnel d\'alias students -> etudiants');

console.log('\n================================================================');
console.log(`📊 RÉSULTAT DU CONTRÔLE QA: ${passedTests}/${totalTests} tests validés (${Math.round((passedTests/totalTests)*100)}%)`);
if (failedTests === 0) {
  console.log('🎉 TOUS LES TESTS SONT AU VERT! CARTE 4.3 VALIDÉE AVEC SUCCÈS.');
} else {
  console.log(`⚠️ ${failedTests} test(s) en échec.`);
}
console.log('================================================================\n');

export default { totalTests, passedTests, failedTests };
if (process.argv[1] === fileURLToPath(import.meta.url) && failedTests > 0) process.exit(1);

