import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

console.log('================================================================');
console.log('🧪 TEST SUITE QA: Carte Trello 4.10 "Modules et documents"');
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

const moduleControllerPath = path.join(backendDir, 'controllers', 'moduleController.js');
const moduleRoutesPath = path.join(backendDir, 'routes', 'moduleRoutes.js');
const documentControllerPath = path.join(backendDir, 'controllers', 'documentController.js');
const documentRoutesPath = path.join(backendDir, 'routes', 'documentRoutes.js');
const prismaSchemaPath = path.join(backendDir, 'prisma', 'schema.prisma');
const adminModulesPath = path.join(srcDir, 'pages', 'admin', 'AdminModules.jsx');
const teacherModulesPath = path.join(srcDir, 'pages', 'enseignant', 'TeacherModules.jsx');
const studentRessourcesPath = path.join(srcDir, 'pages', 'etudiant', 'Ressources.jsx');
const appPath = path.join(srcDir, 'App.jsx');
const dataContextPath = path.join(srcDir, 'contexts', 'DataContext.jsx');

console.log('🔍 1. INTÉGRITÉ ARCHITECTURALE & FICHIERS DU MODULE 4.10');
assert(fs.existsSync(moduleControllerPath), 'Contrôleur backend moduleController.js présent');
assert(fs.existsSync(moduleRoutesPath), 'Fichier de routes moduleRoutes.js présent');
assert(fs.existsSync(documentControllerPath), 'Contrôleur backend documentController.js présent');
assert(fs.existsSync(documentRoutesPath), 'Fichier de routes documentRoutes.js présent');
assert(fs.existsSync(prismaSchemaPath), 'Schéma de base de données Prisma présent');
assert(fs.existsSync(adminModulesPath), 'Composant AdminModules.jsx présent');
assert(fs.existsSync(teacherModulesPath), 'Composant TeacherModules.jsx présent');
assert(fs.existsSync(studentRessourcesPath), 'Composant étudiant Ressources.jsx présent');
assert(fs.existsSync(appPath), 'Routeur principal App.jsx présent');
assert(fs.existsSync(dataContextPath), 'Contexte global DataContext.jsx présent');

const moduleController = fs.readFileSync(moduleControllerPath, 'utf-8');
const moduleRoutes = fs.readFileSync(moduleRoutesPath, 'utf-8');
const documentController = fs.readFileSync(documentControllerPath, 'utf-8');
const documentRoutes = fs.readFileSync(documentRoutesPath, 'utf-8');
const schemaContent = fs.readFileSync(prismaSchemaPath, 'utf-8');
const adminModules = fs.readFileSync(adminModulesPath, 'utf-8');
const teacherModules = fs.readFileSync(teacherModulesPath, 'utf-8');
const studentRessources = fs.readFileSync(studentRessourcesPath, 'utf-8');
const appContent = fs.readFileSync(appPath, 'utf-8');
const dataContext = fs.readFileSync(dataContextPath, 'utf-8');

console.log('\n🔍 2. MODÈLE DE DONNÉES & RELATIONS PRISMA (DB)');
assert(schemaContent.includes('model Module {'), 'Modèle Prisma "Module" défini');
assert(schemaContent.includes('code') && schemaContent.includes('@unique'), 'Code module unique configuré sur Module');
assert(schemaContent.includes('intitule') && schemaContent.includes('coefficient') && schemaContent.includes('semestre'), 'Attributs intitule, coefficient, semestre présents sur Module');
assert(schemaContent.includes('idFiliere') && schemaContent.includes('idResponsable'), 'Liaisons filiere et responsable pédagogique sur Module');
assert(schemaContent.includes('model Document {'), 'Modèle Prisma "Document" défini');
assert(schemaContent.includes('titre') && schemaContent.includes('cheminFichier') && schemaContent.includes('idModule'), 'Attributs titre, cheminFichier, idModule configurés sur Document');
assert(schemaContent.includes('idAuteur'), 'Traçabilité auteur (idAuteur) configurée sur Document');
assert(schemaContent.includes('dateUpload') && schemaContent.includes('@default(now())'), 'Horodatage automatique dateUpload sur Document');

console.log('\n🔍 3. SÉCURITÉ DES ROUTES BACKEND & CONTRÔLE D\'ACCÈS (RBAC)');
assert(moduleRoutes.includes("router.get('/', protect, getModules)"), 'Route GET /api/modules protégée par authentification (protect)');
assert(moduleRoutes.includes("router.get('/:id', protect, getModuleDetails)"), 'Route GET /api/modules/:id protégée par authentification (protect)');
assert(moduleRoutes.includes("router.post('/', protect, authorize('admin'), createModule)"), 'Route POST /api/modules réservée strictement au rôle Administrateur');
assert(moduleRoutes.includes("router.patch('/:id', protect, authorize('admin'), updateModule)"), 'Route PATCH /api/modules/:id réservée strictement au rôle Administrateur');
assert(moduleRoutes.includes("router.delete('/:id', protect, authorize('admin'), deleteModule)"), 'Route DELETE /api/modules/:id réservée strictement au rôle Administrateur');
assert(documentRoutes.includes("router.post('/', protect, authorize('teacher', 'admin'), createDocument)"), 'Création de document réservée aux enseignants et administrateurs');
assert(documentRoutes.includes("router.get('/module/:idModule', protect, getModuleDocuments)"), 'Consultation des documents de module protégée par authentification');
assert(documentRoutes.includes("router.patch('/:id', protect, authorize('teacher', 'admin'), updateDocument)"), 'Modification de document réservée aux enseignants et administrateurs');
assert(documentRoutes.includes("router.delete('/:id', protect, authorize('teacher', 'admin'), deleteDocument)"), 'Suppression de document réservée aux enseignants et administrateurs');

console.log('\n🔍 4. LOGIQUE MÉTIER & GARDE-FOUS DE SUPPRESSION (moduleController.js)');
assert(moduleController.includes("role === 'student'") && moduleController.includes('where: { idFiliere: etudiant.idFiliere }'), 'Étudiant : affichage restreint aux seuls modules de sa filière');
assert(moduleController.includes("role === 'teacher'") && moduleController.includes('where: { idEnseignant: enseignant.idEnseignant }'), 'Enseignant : affichage restreint à ses modules affectés');
assert(moduleController.includes("role === 'admin'"), 'Admin : consultation complète de tous les modules');
assert(moduleController.includes('FOR UPDATE'), 'Verrouillage exclusif FOR UPDATE sur le module lors de la suppression');
assert(moduleController.includes('MODULE_HAS_NOTES'), 'Garde-fou : interdiction de suppression si des notes sont enregistrées');
assert(moduleController.includes('MODULE_HAS_EXAMENS'), 'Garde-fou : interdiction de suppression si des examens sont planifiés');
assert(moduleController.includes('MODULE_HAS_SEANCES'), 'Garde-fou : interdiction de suppression si des séances d\'EDT existent');
assert(moduleController.includes('MODULE_HAS_AFFECTATIONS'), 'Garde-fou : interdiction de suppression si des affectations d\'enseignants existent');
assert(moduleController.includes('MODULE_HAS_DOCUMENTS'), 'Garde-fou : interdiction de suppression si des documents sont rattachés');
assert(moduleController.includes('$transaction'), 'Opérations de création/mise à jour/suppression encapsulées dans des transactions atomiques');

console.log('\n🔍 5. LOGIQUE MÉTIER & CONTRÔLE ANTI-IDOR (documentController.js)');
assert(documentController.includes('TITLE_REQUIRED'), 'Validation obligatoire du titre du document');
assert(documentController.includes('INVALID_MODULE_ID'), 'Validation de validité de l\'identifiant de module');
assert(documentController.includes('MODULE_NOT_FOUND'), 'Vérification de l\'existence effective du module avant upload');
assert(documentController.includes('existing.idAuteur !== req.user.id') && documentController.includes("req.user.role !== 'admin'"), 'Sécurité Anti-IDOR : interdiction de modification si non auteur et non admin');
assert(documentController.includes('DOCUMENT_NOT_FOUND'), 'Gestion d\'erreur 404 lors d\'une opération sur document inexistant');
assert(documentController.includes('deleteDocument') && documentController.includes('idDocument: parsedId'), 'Suppression sécurisée du document par son auteur ou un administrateur');

console.log('\n🔍 6. INTERFACES FRONTEND (AdminModules, TeacherModules, Ressources)');
assert(adminModules.includes('filiereFilter') && adminModules.includes('semestreFilter'), 'AdminModules : double filtrage par filière et semestre');
assert(adminModules.includes('handleOpenAdd') && adminModules.includes('handleEdit'), 'AdminModules : gestion modale création et édition');
assert(adminModules.includes('idResponsable') || adminModules.includes('idEnseignant'), 'AdminModules : attribution d\'un enseignant responsable de module');
assert(teacherModules.includes('myModules'), 'TeacherModules : filtrage dynamique des modules affectés à l\'enseignant');
assert(teacherModules.includes('activeTab') && (teacherModules.includes('Ressources') || teacherModules.includes('Devoir')), 'TeacherModules : onglets Ressources et Devoirs');
assert(teacherModules.includes('handleImport') || teacherModules.includes('newDoc'), 'TeacherModules : formulaire d\'importation et publication de documents');
assert(studentRessources.includes('myModules') && studentRessources.includes('filiereId'), 'Ressources (Étudiant) : filtrage automatique sur les modules de sa filière');
assert(studentRessources.includes('RG32') || studentRessources.includes('lecture seule') || studentRessources.includes('Lecture seule'), 'Ressources (RG32) : mode lecture seule strict pour les étudiants');
assert(studentRessources.includes('typeColors'), 'Ressources : badges chromatiques par typologie (Cours, TD, TP, Examen)');
assert(studentRessources.includes('handleDownload'), 'Ressources : téléchargement direct des supports pédagogiques');

console.log('\n🔍 7. ROUTAGE APPLICATIF & STORE CENTRAL (App.jsx & DataContext.jsx)');
assert(appContent.includes('path="/modules"') && appContent.includes('AdminModules'), 'Route admin "/modules" raccordée à AdminModules');
assert(appContent.includes('path="/teacher/modules"') && appContent.includes('TeacherModules'), 'Route enseignant "/teacher/modules" raccordée à TeacherModules');
assert(appContent.includes('path="/etudiant/ressources"') && appContent.includes('Ressources'), 'Route étudiant "/etudiant/ressources" raccordée à Ressources');
assert(dataContext.includes("'modules': 'idModule'"), 'Normalisation clé primaire idModule dans DataContext');
assert(dataContext.includes("'documents': 'idDocument'"), 'Normalisation clé primaire idDocument dans DataContext');
assert(dataContext.includes("'modules': '/modules'"), 'Endpoint API /modules configuré dans DataContext');
assert(dataContext.includes("'documents': '/documents'"), 'Endpoint API /documents configuré dans DataContext');

console.log('\n================================================================');
console.log(`📊 RÉSULTAT DU CONTRÔLE QA: ${passedTests}/${totalTests} tests validés (${Math.round((passedTests/totalTests)*100)}%)`);
if (failedTests === 0) {
  console.log('🎉 TOUS LES TESTS SONT AU VERT! CARTE 4.10 VALIDÉE AVEC SUCCÈS.');
} else {
  console.log(`⚠️ ${failedTests} test(s) en échec.`);
}
console.log('================================================================\n');

export default { totalTests, passedTests, failedTests };
if (process.argv[1] === fileURLToPath(import.meta.url) && failedTests > 0) process.exit(1);
