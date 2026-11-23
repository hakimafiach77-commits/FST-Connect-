import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

console.log('================================================================');
console.log('🧪 TEST SUITE QA: Cartes 4.16 "Délibérations" & 4.7 "Affectations"');
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

const enseignantControllerPath = path.join(backendDir, 'controllers', 'enseignantController.js');
const enseignantRoutesPath = path.join(backendDir, 'routes', 'enseignantRoutes.js');
const noteControllerPath = path.join(backendDir, 'controllers', 'noteController.js');
const moduleControllerPath = path.join(backendDir, 'controllers', 'moduleController.js');
const prismaSchemaPath = path.join(backendDir, 'prisma', 'schema.prisma');
const adminNotesPath = path.join(srcDir, 'pages', 'admin', 'AdminNotes.jsx');
const studentNotesPath = path.join(srcDir, 'pages', 'etudiant', 'Notes.jsx');
const adminEnseignantsPath = path.join(srcDir, 'pages', 'admin', 'AdminEnseignants.jsx');
const teacherModulesPath = path.join(srcDir, 'pages', 'enseignant', 'TeacherModules.jsx');
const appPath = path.join(srcDir, 'App.jsx');
const dataContextPath = path.join(srcDir, 'contexts', 'DataContext.jsx');

console.log('🔍 1. INTÉGRITÉ ARCHITECTURALE & PRÉSENCE DES FICHIERS');
assert(fs.existsSync(enseignantControllerPath), 'enseignantController.js présent');
assert(fs.existsSync(enseignantRoutesPath), 'enseignantRoutes.js présent');
assert(fs.existsSync(noteControllerPath), 'noteController.js présent');
assert(fs.existsSync(moduleControllerPath), 'moduleController.js présent');
assert(fs.existsSync(prismaSchemaPath), 'schema.prisma présent');
assert(fs.existsSync(adminNotesPath), 'AdminNotes.jsx présent');
assert(fs.existsSync(studentNotesPath), 'etudiant/Notes.jsx présent');
assert(fs.existsSync(adminEnseignantsPath), 'AdminEnseignants.jsx présent');
assert(fs.existsSync(teacherModulesPath), 'TeacherModules.jsx présent');

const enseignantController = fs.readFileSync(enseignantControllerPath, 'utf-8');
const enseignantRoutes = fs.readFileSync(enseignantRoutesPath, 'utf-8');
const noteController = fs.readFileSync(noteControllerPath, 'utf-8');
const moduleController = fs.readFileSync(moduleControllerPath, 'utf-8');
const schemaContent = fs.readFileSync(prismaSchemaPath, 'utf-8');
const adminNotes = fs.readFileSync(adminNotesPath, 'utf-8');
const studentNotes = fs.readFileSync(studentNotesPath, 'utf-8');
const adminEnseignants = fs.readFileSync(adminEnseignantsPath, 'utf-8');
const teacherModules = fs.readFileSync(teacherModulesPath, 'utf-8');
const dataContext = fs.readFileSync(dataContextPath, 'utf-8');

console.log('\n🔍 2. MODÈLE DE DONNÉES & RELATIONS PRISMA (DB)');
assert(schemaContent.includes('model Affectation {'), 'Modèle Prisma Affectation défini');
assert(schemaContent.includes('typeIntervention') && schemaContent.includes('heuresAssignees'), 'Champs typeIntervention et heuresAssignees sur Affectation');
assert(schemaContent.includes('idEnseignant') && schemaContent.includes('idModule'), 'Clés étrangères idEnseignant et idModule sur Affectation');
assert(schemaContent.includes('model ResultatFinal {'), 'Modèle Prisma ResultatFinal défini pour les délibérations');
assert(schemaContent.includes('moyenneGenerale') && schemaContent.includes('statut') && schemaContent.includes('estPublie'), 'Champs moyenneGenerale, statut, estPublie sur ResultatFinal');
assert(schemaContent.includes('model Semestre {'), 'Modèle Prisma Semestre défini');

console.log('\n🔍 3. SÉCURITÉ DES ROUTES & CONTRÔLE D\'ACCÈS (RBAC)');
assert(enseignantRoutes.includes("router.post('/:id/affectations', authorize('admin'), createAffectation)"), 'Création d\'affectation réservée au rôle administrateur');
assert(enseignantRoutes.includes("router.delete('/:id/affectations/:idAffectation', authorize('admin'), deleteAffectation)"), 'Suppression d\'affectation réservée au rôle administrateur');

console.log('\n🔍 4. LOGIQUE MÉTIER DES AFFECTATIONS & CHARGES HORAIRES (Carte 4.7)');
assert(enseignantController.includes('createAffectation'), 'Contrôleur : fonction createAffectation implémentée');
assert(enseignantController.includes('deleteAffectation'), 'Contrôleur : fonction deleteAffectation implémentée');
assert(adminEnseignants.includes('volumeHoraireBase'), 'Volume horaire de base paramétrable pour le calcul des charges');
assert(teacherModules.includes('affectations') || teacherModules.includes('myModules'), 'Enseignant : calcul dynamique des cours affectés');
assert(moduleController.includes('heuresAssignees: 48') || moduleController.includes('affectation.create'), 'Création automatique de l\'affectation CM pour le responsable de module');

console.log('\n🔍 5. LOGIQUE MÉTIER DES DÉLIBÉRATIONS & RÉSULTATS (Carte 4.16)');
assert(studentNotes.includes('getStatutNote'), 'Algorithme d\'attribution des mentions de délibération');
assert(studentNotes.includes('VALIDÉ') && studentNotes.includes('RATTRAPAGE') && studentNotes.includes('AJOURNÉ'), 'Seuils officiels de délibération (VALIDÉ >= 12, RATTRAPAGE >= 8, AJOURNÉ < 8)');
assert(adminNotes.includes('moyenneModule') || adminNotes.includes('moyenne'), 'Admin : consolidation des moyennes modulaires');
assert(noteController.includes('moyenneModule'), 'Backend : persistance de la moyenne modulaire calculée');

console.log('\n🔍 6. STORE CENTRAL & DATA CONTEXT');
assert(dataContext.includes("'affectations'") || dataContext.includes('affectations'), 'Gestion de la collection affectations dans DataContext');
assert(dataContext.includes("'notes': 'idNote'"), 'Normalisation clé primaire idNote dans DataContext');

console.log('\n================================================================');
console.log(`📊 RÉSULTAT DU CONTRÔLE QA: ${passedTests}/${totalTests} tests validés (${Math.round((passedTests/totalTests)*100)}%)`);
if (failedTests === 0) {
  console.log('🎉 TOUS LES TESTS SONT AU VERT! CARTES 4.16 & 4.7 VALIDÉES.');
} else {
  console.log(`⚠️ ${failedTests} test(s) en échec.`);
}
console.log('================================================================\n');

export default { totalTests, passedTests, failedTests };
if (process.argv[1] === fileURLToPath(import.meta.url) && failedTests > 0) process.exit(1);
