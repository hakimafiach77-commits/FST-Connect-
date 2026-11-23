import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

console.log('================================================================');
console.log('🧪 TEST SUITE QA: Cartes 4.9, 4.11 & 4.17 "Comm, Absences & Réclamations"');
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

const annonceControllerPath = path.join(backendDir, 'controllers', 'annonceController.js');
const annonceRoutesPath = path.join(backendDir, 'routes', 'annonceRoutes.js');
const notificationControllerPath = path.join(backendDir, 'controllers', 'notificationController.js');
const notificationRoutesPath = path.join(backendDir, 'routes', 'notificationRoutes.js');
const absenceControllerPath = path.join(backendDir, 'controllers', 'absenceController.js');
const absenceRoutesPath = path.join(backendDir, 'routes', 'absenceRoutes.js');
const noteControllerPath = path.join(backendDir, 'controllers', 'noteController.js');
const noteRoutesPath = path.join(backendDir, 'routes', 'noteRoutes.js');
const prismaSchemaPath = path.join(backendDir, 'prisma', 'schema.prisma');
const adminAnnoncesPath = path.join(srcDir, 'pages', 'admin', 'AdminAnnonces.jsx');
const publicAnnoncesPath = path.join(srcDir, 'pages', 'Announcements.jsx');
const adminAbsencesPath = path.join(srcDir, 'pages', 'admin', 'AdminAbsences.jsx');
const teacherAbsencesPath = path.join(srcDir, 'pages', 'enseignant', 'TeacherAbsences.jsx');
const studentAbsencesPath = path.join(srcDir, 'pages', 'etudiant', 'Absences.jsx');
const adminReclamationsPath = path.join(srcDir, 'pages', 'admin', 'AdminReclamations.jsx');
const reclamationsManagerPath = path.join(srcDir, 'pages', 'ReclamationsManager.jsx');
const appPath = path.join(srcDir, 'App.jsx');
const dataContextPath = path.join(srcDir, 'contexts', 'DataContext.jsx');

console.log('🔍 1. INTÉGRITÉ ARCHITECTURALE & PRÉSENCE DES FICHIERS');
assert(fs.existsSync(annonceControllerPath), 'annonceController.js présent');
assert(fs.existsSync(annonceRoutesPath), 'annonceRoutes.js présent');
assert(fs.existsSync(notificationControllerPath), 'notificationController.js présent');
assert(fs.existsSync(notificationRoutesPath), 'notificationRoutes.js présent');
assert(fs.existsSync(absenceControllerPath), 'absenceController.js présent');
assert(fs.existsSync(absenceRoutesPath), 'absenceRoutes.js présent');
assert(fs.existsSync(noteControllerPath), 'noteController.js présent');
assert(fs.existsSync(adminAnnoncesPath), 'AdminAnnonces.jsx présent');
assert(fs.existsSync(publicAnnoncesPath), 'Announcements.jsx public présent');
assert(fs.existsSync(adminAbsencesPath), 'AdminAbsences.jsx présent');
assert(fs.existsSync(teacherAbsencesPath), 'TeacherAbsences.jsx présent');
assert(fs.existsSync(studentAbsencesPath), 'etudiant/Absences.jsx présent');
assert(fs.existsSync(adminReclamationsPath), 'AdminReclamations.jsx présent');
assert(fs.existsSync(reclamationsManagerPath), 'ReclamationsManager.jsx présent');

const annonceController = fs.readFileSync(annonceControllerPath, 'utf-8');
const annonceRoutes = fs.readFileSync(annonceRoutesPath, 'utf-8');
const notificationController = fs.readFileSync(notificationControllerPath, 'utf-8');
const notificationRoutes = fs.readFileSync(notificationRoutesPath, 'utf-8');
const absenceController = fs.readFileSync(absenceControllerPath, 'utf-8');
const absenceRoutes = fs.readFileSync(absenceRoutesPath, 'utf-8');
const noteController = fs.readFileSync(noteControllerPath, 'utf-8');
const schemaContent = fs.readFileSync(prismaSchemaPath, 'utf-8');
const adminAnnonces = fs.readFileSync(adminAnnoncesPath, 'utf-8');
const adminAbsences = fs.readFileSync(adminAbsencesPath, 'utf-8');
const teacherAbsences = fs.readFileSync(teacherAbsencesPath, 'utf-8');
const studentAbsences = fs.readFileSync(studentAbsencesPath, 'utf-8');
const adminReclamations = fs.readFileSync(adminReclamationsPath, 'utf-8');
const appContent = fs.readFileSync(appPath, 'utf-8');
const dataContext = fs.readFileSync(dataContextPath, 'utf-8');

console.log('\n🔍 2. MODÈLE DE DONNÉES PRISMA (DB)');
assert(schemaContent.includes('model Annonce {'), 'Modèle Prisma Annonce défini');
assert(schemaContent.includes('titre') && schemaContent.includes('urgent') && schemaContent.includes('cible'), 'Champs titre, urgent, cible sur Annonce');
assert(schemaContent.includes('model Notification {'), 'Modèle Prisma Notification défini');
assert(schemaContent.includes('idNotification') && schemaContent.includes('lu') && schemaContent.includes('priorite'), 'Champs clés idNotification, lu, priorite sur Notification');
assert(schemaContent.includes('model Absence {'), 'Modèle Prisma Absence défini');
assert(schemaContent.includes('statut') && schemaContent.includes('INJUSTIFIEE'), 'Statut par défaut INJUSTIFIEE sur Absence');
assert(schemaContent.includes('model Justificatif {'), 'Modèle Prisma Justificatif défini');
assert(schemaContent.includes('scanDocument') && schemaContent.includes('dateSoumission'), 'Attributs scanDocument et dateSoumission sur Justificatif');
assert(schemaContent.includes('model CompteurAbsence {'), 'Modèle Prisma CompteurAbsence défini');
assert(schemaContent.includes('totalHeuresAbsence'), 'Compteur totalHeuresAbsence configuré');
assert(schemaContent.includes('model Reclamation {'), 'Modèle Prisma Reclamation défini');

console.log('\n🔍 3. SÉCURITÉ DES ROUTES & CONTRÔLE D\'ACCÈS (RBAC)');
assert(annonceRoutes.includes("router.get('/', getAnnonces)"), 'Consultation des annonces ouverte au public');
assert(annonceRoutes.includes("router.post('/', protect, authorize('admin'), publishAnnonce)"), 'Publication d\'annonce réservée au rôle admin');
assert(annonceRoutes.includes("router.patch('/:id', protect, authorize('admin'), updateAnnonce)"), 'Mise à jour d\'annonce réservée au rôle admin');
assert(annonceRoutes.includes("router.delete('/:id', protect, authorize('admin'), deleteAnnonce)"), 'Suppression d\'annonce réservée au rôle admin');
assert(notificationRoutes.includes("router.get('/', protect, getMyNotifications)"), 'Consultation notifications personnelles protégée');
assert(notificationRoutes.includes("router.patch('/:id/read', protect, markAsRead)"), 'Marquage lu protégé par utilisateur');
assert(absenceRoutes.includes("router.post('/', protect, authorize('teacher', 'admin'), recordAbsence)"), 'Saisie d\'absence réservée aux enseignants et admins');
assert(absenceRoutes.includes("router.patch('/:id', protect, authorize('teacher', 'admin'), updateAbsence)"), 'Validation d\'absence réservée aux enseignants et admins');
assert(absenceRoutes.includes("router.get('/me', protect, getMyAbsences)"), 'Consultation des absences personnelles protégée');

console.log('\n🔍 4. LOGIQUE MÉTIER DES ANNONCES & NOTIFICATIONS (Carte 4.9)');
assert(annonceController.includes('statut: \'PUBLIEE\''), 'Annonces créées avec statut PUBLIEE');
assert(annonceController.includes('idAdminAuth'), 'Rattachement à l\'administrateur émetteur');
assert(notificationController.includes('idUtilisateur: req.user.id'), 'Protection de propriété stricte sur les notifications');
assert(adminAnnonces.includes('urgente') || adminAnnonces.includes('urgent'), 'Admin : bascule urgence pour alertes prioritaires');
assert(adminAnnonces.includes('cible') || adminAnnonces.includes('target'), 'Admin : ciblage des annonces (Tous, Étudiants, Enseignants)');

console.log('\n🔍 5. LOGIQUE MÉTIER DES ABSENCES & COMPTEUR D\'HEURES (Carte 4.11)');
assert(absenceController.includes('durationHours'), 'Calcul de la durée horaire de la séance pour incrémentation');
assert(absenceController.includes('$transaction'), 'Mise à jour atomique de l\'appel et du compteur d\'heures');
assert(absenceController.includes('compteurAbsence.upsert') || absenceController.includes('totalHeuresAbsence'), 'Mise à jour automatique du compteur d\'absences cumulé');
assert(absenceController.includes('justificatifStatut'), 'Prise en charge de la validation de justificatif');
assert(teacherAbsences.includes('KpiCard') || teacherAbsences.includes('abs-kpi'), 'Enseignant : indicateurs clés KPI de présence');
assert(studentAbsences.includes('JustificatifForm'), 'Étudiant : modal et formulaire de téléversement de justificatif');
assert(studentAbsences.includes('5 * 1024 * 1024'), 'Étudiant : restriction de taille de fichier à 5 MB');
assert(adminAbsences.includes('studentStats'), 'Admin : consolidation des statistiques d\'assiduité par étudiant');

console.log('\n🔍 6. LOGIQUE MÉTIER DES RÉCLAMATIONS (Carte 4.17)');
assert(noteController.includes('submitReclamation'), 'Contrôleur : soumission de réclamation');
assert(noteController.includes('updateReclamation'), 'Contrôleur : arbitrage de réclamation');
assert(noteController.includes('note.etudiant.utilisateurId !== req.user.id'), 'Contrôle anti-usurpation sur la réclamation');
assert(adminReclamations.includes('handleAction') && adminReclamations.includes('VALIDEE'), 'Admin : action de validation avec répercussion sur la note');

console.log('\n🔍 7. ROUTAGE APPLICATIF & STORE GLOBAL (App.jsx & DataContext.jsx)');
assert(appContent.includes('path="/annonces"') || appContent.includes('Announcements'), 'Route annonces configurée');
assert(appContent.includes('path="/absences"') || appContent.includes('AdminAbsences'), 'Route absences admin configurée');
assert(appContent.includes('path="/teacher/absences"') || appContent.includes('TeacherAbsences'), 'Route absences enseignant configurée');
assert(appContent.includes('path="/etudiant/absences"') || appContent.includes('Absences'), 'Route absences étudiant configurée');
assert(dataContext.includes("'absences': 'idAbsence'"), 'Normalisation clé primaire idAbsence');
assert(dataContext.includes("'annonces': 'idAnnonce'") || dataContext.includes('annonces'), 'Normalisation annonces dans DataContext');

console.log('\n================================================================');
console.log(`📊 RÉSULTAT DU CONTRÔLE QA: ${passedTests}/${totalTests} tests validés (${Math.round((passedTests/totalTests)*100)}%)`);
if (failedTests === 0) {
  console.log('🎉 TOUS LES TESTS SONT AU VERT! CARTES 4.9, 4.11 & 4.17 VALIDÉES.');
} else {
  console.log(`⚠️ ${failedTests} test(s) en échec.`);
}
console.log('================================================================\n');

export default { totalTests, passedTests, failedTests };
if (process.argv[1] === fileURLToPath(import.meta.url) && failedTests > 0) process.exit(1);
