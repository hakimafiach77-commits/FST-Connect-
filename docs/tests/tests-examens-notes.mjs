import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

console.log('================================================================');
console.log('🧪 TEST SUITE QA: Carte Trello 4.15 "Examens et notes"');
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

const examenControllerPath = path.join(backendDir, 'controllers', 'examenController.js');
const examenRoutesPath = path.join(backendDir, 'routes', 'examenRoutes.js');
const noteControllerPath = path.join(backendDir, 'controllers', 'noteController.js');
const noteRoutesPath = path.join(backendDir, 'routes', 'noteRoutes.js');
const prismaSchemaPath = path.join(backendDir, 'prisma', 'schema.prisma');
const adminNotesPath = path.join(srcDir, 'pages', 'admin', 'AdminNotes.jsx');
const adminReclamationsPath = path.join(srcDir, 'pages', 'admin', 'AdminReclamations.jsx');
const teacherGradesPath = path.join(srcDir, 'pages', 'enseignant', 'TeacherGrades.jsx');
const studentNotesPath = path.join(srcDir, 'pages', 'etudiant', 'Notes.jsx');
const appPath = path.join(srcDir, 'App.jsx');
const dataContextPath = path.join(srcDir, 'contexts', 'DataContext.jsx');

console.log('🔍 1. INTÉGRITÉ ARCHITECTURALE & FICHIERS DU MODULE 4.15');
assert(fs.existsSync(examenControllerPath), 'Contrôleur backend examenController.js présent');
assert(fs.existsSync(examenRoutesPath), 'Fichier de routes examenRoutes.js présent');
assert(fs.existsSync(noteControllerPath), 'Contrôleur backend noteController.js présent');
assert(fs.existsSync(noteRoutesPath), 'Fichier de routes noteRoutes.js présent');
assert(fs.existsSync(prismaSchemaPath), 'Schéma de base de données Prisma présent');
assert(fs.existsSync(adminNotesPath), 'Composant AdminNotes.jsx présent');
assert(fs.existsSync(adminReclamationsPath), 'Composant AdminReclamations.jsx présent');
assert(fs.existsSync(teacherGradesPath), 'Composant TeacherGrades.jsx présent');
assert(fs.existsSync(studentNotesPath), 'Composant étudiant Notes.jsx présent');
assert(fs.existsSync(appPath), 'Routeur principal App.jsx présent');

const examenController = fs.readFileSync(examenControllerPath, 'utf-8');
const examenRoutes = fs.readFileSync(examenRoutesPath, 'utf-8');
const noteController = fs.readFileSync(noteControllerPath, 'utf-8');
const noteRoutes = fs.readFileSync(noteRoutesPath, 'utf-8');
const schemaContent = fs.readFileSync(prismaSchemaPath, 'utf-8');
const adminNotes = fs.readFileSync(adminNotesPath, 'utf-8');
const adminReclamations = fs.readFileSync(adminReclamationsPath, 'utf-8');
const teacherGrades = fs.readFileSync(teacherGradesPath, 'utf-8');
const studentNotes = fs.readFileSync(studentNotesPath, 'utf-8');
const appContent = fs.readFileSync(appPath, 'utf-8');
const dataContext = fs.readFileSync(dataContextPath, 'utf-8');

console.log('\n🔍 2. MODÈLE DE DONNÉES & RELATIONS PRISMA (DB)');
assert(schemaContent.includes('model Examen {'), 'Modèle Prisma "Examen" défini');
assert(schemaContent.includes('idExamen') && schemaContent.includes('idSalle') && schemaContent.includes('idModule'), 'Champs clés idExamen, idSalle, idModule sur le modèle Examen');
assert(schemaContent.includes('model Note {'), 'Modèle Prisma "Note" défini');
assert(schemaContent.includes('valeurCC') && schemaContent.includes('valeurEF') && schemaContent.includes('moyenneModule'), 'Composantes de notation (CC, EF, Moyenne) présentes sur le modèle Note');
assert(schemaContent.includes('estVerrouillee Boolean'), 'Drapeau de publication/verrouillage estVerrouillee présent sur Note');
assert(schemaContent.includes('@@unique([idEtudiant, idModule, idExamen])'), 'Contrainte d\'unicité composite @@unique([idEtudiant, idModule, idExamen])');
assert(schemaContent.includes('model Reclamation {'), 'Modèle Prisma "Reclamation" défini');
assert(schemaContent.includes('statut') && schemaContent.includes('reponseEnseignant') && schemaContent.includes('idNote'), 'Attributs statut, reponseEnseignant, idNote configurés sur Reclamation');

console.log('\n🔍 3. SÉCURITÉ DES ROUTES BACKEND & CONTRÔLE D\'ACCÈS (RBAC)');
assert(examenRoutes.includes('router.use(protect)'), 'Sécurisation globale de toutes les routes examens par le middleware protect');
assert(examenRoutes.includes("router.post('/', authorize('admin', 'teacher')"), 'Création d\'examen restreinte aux administrateurs et enseignants');
assert(examenRoutes.includes("router.patch('/:id', authorize('admin', 'teacher')"), 'Modification d\'examen restreinte aux administrateurs et enseignants');
assert(examenRoutes.includes("router.delete('/:id', authorize('admin')"), 'Suppression d\'examen réservée strictement au rôle Administrateur');
assert(noteRoutes.includes("router.post('/', protect, authorize('teacher')"), 'Saisie individuelle de note réservée au rôle Enseignant');
assert(noteRoutes.includes("router.post('/bulk', protect, authorize('teacher')"), 'Saisie par lot (bulk) réservée au rôle Enseignant');
assert(noteRoutes.includes("router.get('/me', protect, getMyNotes)"), 'Consultation des notes personnelles protégée par authentification');
assert(noteRoutes.includes("router.post('/reclaim', protect, authorize('student')"), 'Dépôt de réclamation réservé au rôle Étudiant');
assert(noteRoutes.includes("router.patch('/reclaim/:id', protect, authorize('admin')"), 'Traitement des réclamations réservé au rôle Administrateur');

console.log('\n🔍 4. LOGIQUE MÉTIER DES EXAMENS (examenController.js)');
assert(examenController.includes('isTeacherAssignedToModule'), 'Vérification de l\'affectation pédagogique de l\'enseignant au module');
assert(examenController.includes("req.user.role === 'student'") && examenController.includes('where.module = { idFiliere: etudiant.idFiliere }'), 'Protection anti-fuite : filtrage des examens selon la filière de l\'étudiant');
assert(examenController.includes('EXAMEN_NOT_FOUND'), 'Gestion d\'erreur 404 si l\'examen n\'existe pas');
assert(examenController.includes('TYPE_REQUIRED') && examenController.includes('DATE_REQUIRED'), 'Validation stricte des champs obligatoires (type, date) lors de la création');
assert(examenController.includes('EXAMEN_HAS_NOTES'), 'Garde-fou d\'intégrité : blocage de la suppression d\'un examen si des notes y sont rattachées');

console.log('\n🔍 5. LOGIQUE MÉTIER DES NOTES & RÉCLAMATIONS (noteController.js)');
assert(noteController.includes('recordNote') && noteController.includes('recordBulkNotes'), 'Fonctions de saisie unitaire et groupée des notes implémentées');
assert(noteController.includes('coeffCC') && noteController.includes('coeffEF'), 'Calcul automatique de la moyenne selon les coefficients CC/EF du module');
assert(noteController.includes('$transaction'), 'Transaction atomique $transaction pour la saisie massive des notes');
assert(noteController.includes('estVerrouillee: false'), 'Filtrage de confidentialité : seules les notes publiées/déverrouillées sont visibles par l\'étudiant');
assert(noteController.includes('note.etudiant.utilisateurId !== req.user.id'), 'Contrôle anti-usurpation : vérification que la note réclamée appartient bien à l\'étudiant connecté');
assert(noteController.includes('statut: \'OUVERTE\''), 'Statut initialisé à OUVERTE lors de la création d\'une réclamation');

console.log('\n🔍 6. INTERFACES ENSEIGNANT, ÉTUDIANT & ADMIN (TeacherGrades, Notes, AdminNotes)');
assert(teacherGrades.includes('myModules') && teacherGrades.includes('affectations'), 'Enseignant : affichage restreint aux seuls modules affectés');
assert(teacherGrades.includes('valeurCC') || teacherGrades.includes('cc'), 'Enseignant : formulaire de saisie du contrôle continu');
assert(teacherGrades.includes('valeurEF') || teacherGrades.includes('final'), 'Enseignant : formulaire de saisie de l\'examen final');
assert(teacherGrades.includes('publiee'), 'Enseignant : bascule de publication/verrouillage des notes');
assert(studentNotes.includes('CountdownTimer') && studentNotes.includes('7 * 24 * 60 * 60 * 1000'), 'Étudiant (RG58) : décompte légal de 7 jours (J+7) pour soumettre un recours');
assert(studentNotes.includes('getStatutNote') && studentNotes.includes('VALIDÉ') && studentNotes.includes('RATTRAPAGE'), 'Étudiant (RG50) : calcul automatique du statut (VALIDÉ / RATTRAPAGE / AJOURNÉ)');
assert(studentNotes.includes('ReclamationForm'), 'Étudiant : modal et formulaire structuré de soumission de litige');
assert(adminNotes.includes('selectedFiliereId') && adminNotes.includes('selectedModuleId'), 'Admin Notes : navigation et vue hiérarchique par filière et par module');
assert(adminReclamations.includes('statutFilter') && adminReclamations.includes('handleAction'), 'Admin Réclamations : filtrage par statut et actions de validation/rejet');
assert(adminReclamations.includes("newStatut === 'VALIDEE'") && adminReclamations.includes('newNote'), 'Admin Réclamations : mise à jour automatique de la note en cas de validation de litige');

console.log('\n🔍 7. ROUTAGE APPLICATIF & GESTION DU STORE (App.jsx & DataContext.jsx)');
assert(appContent.includes('path="/notes"') && appContent.includes('AdminNotes'), 'Route admin "/notes" branchée sur AdminNotes');
assert(appContent.includes('path="/reclamations"') && appContent.includes('AdminReclamations'), 'Route admin "/reclamations" branchée sur AdminReclamations');
assert(appContent.includes('path="/teacher/notes"') && appContent.includes('TeacherGrades'), 'Route enseignant "/teacher/notes" branchée sur TeacherGrades');
assert(appContent.includes('path="/etudiant/notes"') && appContent.includes('Notes'), 'Route étudiant "/etudiant/notes" branchée sur Notes');
assert(dataContext.includes("'notes': 'idNote'"), 'Normalisation clé primaire idNote dans DataContext');
assert(dataContext.includes("'reclamations': 'idReclamation'"), 'Normalisation clé primaire idReclamation dans DataContext');
assert(dataContext.includes("col === 'grades' ? 'notes'"), 'Résolution d\'alias grades -> notes dans DataContext');

console.log('\n================================================================');
console.log(`📊 RÉSULTAT DU CONTRÔLE QA: ${passedTests}/${totalTests} tests validés (${Math.round((passedTests/totalTests)*100)}%)`);
if (failedTests === 0) {
  console.log('🎉 TOUS LES TESTS SONT AU VERT! CARTE 4.15 VALIDÉE AVEC SUCCÈS.');
} else {
  console.log(`⚠️ ${failedTests} test(s) en échec.`);
}
console.log('================================================================\n');

export default { totalTests, passedTests, failedTests };
if (process.argv[1] === fileURLToPath(import.meta.url) && failedTests > 0) process.exit(1);
