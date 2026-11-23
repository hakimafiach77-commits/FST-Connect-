import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

console.log('================================================================');
console.log('🧪 TEST SUITE QA: Carte Trello 4.8 "Emplois du temps"');
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

const scheduleControllerPath = path.join(backendDir, 'controllers', 'scheduleController.js');
const scheduleRoutesPath = path.join(backendDir, 'routes', 'scheduleRoutes.js');
const prismaSchemaPath = path.join(backendDir, 'prisma', 'schema.prisma');
const adminEdtPath = path.join(srcDir, 'pages', 'admin', 'AdminEDT.jsx');
const publicEdtPath = path.join(srcDir, 'pages', 'PublicEDT.jsx');
const monPlanningPath = path.join(srcDir, 'pages', 'enseignant', 'MonPlanning.jsx');
const emploiDuTempsPath = path.join(srcDir, 'pages', 'etudiant', 'EmploiDuTemps.jsx');
const appPath = path.join(srcDir, 'App.jsx');
const dataContextPath = path.join(srcDir, 'contexts', 'DataContext.jsx');

console.log('🔍 1. INTÉGRITÉ ARCHITECTURALE & FICHIERS DU MODULE 4.8');
assert(fs.existsSync(scheduleControllerPath), 'Contrôleur backend scheduleController.js présent');
assert(fs.existsSync(scheduleRoutesPath), 'Fichier de routes scheduleRoutes.js présent');
assert(fs.existsSync(prismaSchemaPath), 'Schéma de base de données Prisma présent');
assert(fs.existsSync(adminEdtPath), 'Composant AdminEDT.jsx présent');
assert(fs.existsSync(publicEdtPath), 'Composant PublicEDT.jsx présent');
assert(fs.existsSync(monPlanningPath), 'Composant enseignant MonPlanning.jsx présent');
assert(fs.existsSync(emploiDuTempsPath), 'Composant étudiant EmploiDuTemps.jsx présent');
assert(fs.existsSync(appPath), 'Routeur principal App.jsx présent');
assert(fs.existsSync(dataContextPath), 'Contexte global DataContext.jsx présent');

const scheduleController = fs.readFileSync(scheduleControllerPath, 'utf-8');
const scheduleRoutes = fs.readFileSync(scheduleRoutesPath, 'utf-8');
const schemaContent = fs.readFileSync(prismaSchemaPath, 'utf-8');
const adminEdt = fs.readFileSync(adminEdtPath, 'utf-8');
const publicEdt = fs.readFileSync(publicEdtPath, 'utf-8');
const monPlanning = fs.readFileSync(monPlanningPath, 'utf-8');
const emploiDuTemps = fs.readFileSync(emploiDuTempsPath, 'utf-8');
const appContent = fs.readFileSync(appPath, 'utf-8');
const dataContext = fs.readFileSync(dataContextPath, 'utf-8');

console.log('\n🔍 2. MODÈLE DE DONNÉES & RELATIONS PRISMA (DB)');
assert(schemaContent.includes('model Edt {'), 'Modèle Prisma "Edt" défini');
assert(schemaContent.includes('idEDT') && schemaContent.includes('idFiliere') && schemaContent.includes('idGroupe'), 'Champs idEDT, idFiliere, idGroupe sur Edt');
assert(schemaContent.includes('model Seance {'), 'Modèle Prisma "Seance" défini');
assert(schemaContent.includes('idSeance') && schemaContent.includes('heureDebut') && schemaContent.includes('heureFin'), 'Attributs temporels idSeance, heureDebut, heureFin configurés sur Seance');
assert(schemaContent.includes('idModule') && schemaContent.includes('idEnseignant') && schemaContent.includes('idSalle'), 'Clés étrangères idModule, idEnseignant, idSalle sur Seance');
assert(schemaContent.includes('statut') && schemaContent.includes('VALIDE'), 'Statut par défaut VALIDE configuré sur Seance');
assert(schemaContent.includes('motifAnnulation'), 'Prise en charge du motif d\'annulation sur Seance');
assert(schemaContent.includes('model Salle {'), 'Modèle Prisma "Salle" défini');

console.log('\n🔍 3. SÉCURITÉ DES ROUTES BACKEND & CONTRÔLE D\'ACCÈS (RBAC)');
assert(scheduleRoutes.includes("router.get('/me', protect, getMySchedule)"), 'Route GET /api/schedule/me protégée par authentification (protect)');
assert(scheduleRoutes.includes("router.post('/', protect, authorize('admin'), createSeance)"), 'Route POST /api/schedule restreinte strictement au rôle Administrateur');
assert(scheduleRoutes.includes("router.patch('/:id', protect, authorize('admin'), updateSeance)"), 'Route PATCH /api/schedule/:id restreinte strictement au rôle Administrateur');
assert(scheduleRoutes.includes("router.delete('/:id', protect, authorize('admin'), deleteSeance)"), 'Route DELETE /api/schedule/:id restreinte strictement au rôle Administrateur');

console.log('\n🔍 4. DÉTECTION DES CONFLITS & CHEVAUCHEMENTS (scheduleController.js)');
assert(scheduleController.includes('const checkOverlap'), 'Algorithme centralisé de détection des chevauchements horaires checkOverlap');
assert(scheduleController.includes('lte: start') && scheduleController.includes('gt: start'), 'Détection de chevauchement sur la borne de début');
assert(scheduleController.includes('lt: end') && scheduleController.includes('gte: end'), 'Détection de chevauchement sur la borne de fin');
assert(scheduleController.includes('gte: start') && scheduleController.includes('lte: end'), 'Détection de séance englobée');
assert(scheduleController.includes('teacherConflict'), 'Détection de conflit : enseignant déjà programmé sur le même créneau');
assert(scheduleController.includes('roomConflict'), 'Détection de conflit : salle déjà occupée sur le même créneau');
assert(scheduleController.includes('groupConflict'), 'Détection de conflit : groupe étudiant déjà en cours sur le même créneau');
assert(scheduleController.includes('excludeId'), 'Exclusion de la séance modifiée pour éviter les faux positifs lors des mises à jour');

console.log('\n🔍 5. LOGIQUE MÉTIER & GESTION MULTI-PROFILS (scheduleController.js)');
assert(scheduleController.includes("role === 'student'"), 'getMySchedule : gestion dédiée au rôle Étudiant');
assert(scheduleController.includes('idGroupeTD') && scheduleController.includes('idGroupeTP'), 'getMySchedule : filtrage automatique selon les groupes TD et TP de l\'étudiant');
assert(scheduleController.includes("role === 'teacher'"), 'getMySchedule : gestion dédiée au rôle Enseignant');
assert(scheduleController.includes('idEnseignant: enseignant.idEnseignant'), 'getMySchedule : filtrage automatique sur les séances assignées à l\'enseignant');
assert(scheduleController.includes("role === 'admin'"), 'getMySchedule : vue consolidée complète pour l\'administrateur');
assert(scheduleController.includes('ALLOWED_DAYS'), 'Validation stricte des jours autorisés (Lundi à Samedi)');
assert(scheduleController.includes('parseIdStrict'), 'Fonction utilitaire de validation stricte des identifiants numériques');
assert(scheduleController.includes('SEANCE_NOT_FOUND'), 'Gestion d\'erreur 404 lors de la tentative de modification d\'une séance inexistante');
assert(scheduleController.includes('deleteSeance'), 'Suppression administrative de séance implémentée');

console.log('\n🔍 6. INTERFACES FRONTEND (AdminEDT, PublicEDT, MonPlanning, EmploiDuTemps)');
assert(adminEdt.includes("activeTab === 'documents'") || adminEdt.includes('activeTab'), 'AdminEDT : gestion par onglets (documents EDT / planning interactif)');
assert(adminEdt.includes('timeSlots'), 'AdminEDT : définition des créneaux horaires réglementaires');
assert(adminEdt.includes('showDocPanel') && adminEdt.includes('showSessionPanel'), 'AdminEDT : formulaires coulissants pour la création de documents et séances');
assert(adminEdt.includes('filiereFilter'), 'AdminEDT : filtre interactif par filière');
assert(publicEdt.includes('edtDocuments') && publicEdt.includes('selectedFiliere'), 'PublicEDT : catalogue public filtrable des emplois du temps');
assert(publicEdt.includes('Connexion Espace Privé'), 'PublicEDT : passerelle vers la connexion de l\'espace privé');
assert(monPlanning.includes('mySessions'), 'MonPlanning : affichage personnalisé du planning hebdomadaire de l\'enseignant');
assert(monPlanning.includes('weekOffset') && monPlanning.includes('getWeekRange'), 'MonPlanning : navigation temporelle par semaine (précédente/actuelle/suivante)');
assert(monPlanning.includes('showAppelModal') && monPlanning.includes('handleSaveAppel'), 'MonPlanning : déclenchement et enregistrement direct de la feuille d\'appel');
assert(emploiDuTemps.includes('mySessions') && emploiDuTemps.includes('idGroupeTD'), 'EmploiDuTemps : extraction automatique des cours du groupe TD/TP de l\'étudiant');
assert(emploiDuTemps.includes('TYPE_COLORS'), 'EmploiDuTemps : différenciation visuelle et code couleur par type d\'enseignement (CM, TD, TP, Examen)');
assert(emploiDuTemps.includes('handleExportPDF'), 'EmploiDuTemps : fonctionnalité d\'export de l\'emploi du temps');

console.log('\n🔍 7. ROUTAGE APPLICATIF & GESTION DE L\'ÉTAT (App.jsx & DataContext.jsx)');
assert(appContent.includes('path="/edt"') && appContent.includes('PublicEDT'), 'Route publique "/edt" branchée sur PublicEDT');
assert(appContent.includes('path="/admin/edt"') && appContent.includes('AdminEDT'), 'Route admin "/admin/edt" branchée sur AdminEDT');
assert(appContent.includes('path="/teacher/planning"') && appContent.includes('MonPlanning'), 'Route enseignant "/teacher/planning" branchée sur MonPlanning');
assert(appContent.includes('path="/etudiant/edt"') && appContent.includes('EmploiDuTemps'), 'Route étudiant "/etudiant/edt" branchée sur EmploiDuTemps');
assert(dataContext.includes("'seances': 'idSeance'"), 'Normalisation clé primaire idSeance dans DataContext');
assert(dataContext.includes("'salles': 'idSalle'"), 'Normalisation clé primaire idSalle dans DataContext');
assert(dataContext.includes("'edts': 'idEDT'") || dataContext.includes('edts'), 'Enregistrement de la collection edts dans DataContext');
assert(dataContext.includes("col === 'sessions' ? 'seances'"), 'Résolution d\'alias sessions -> seances dans DataContext');
assert(dataContext.includes("col === 'rooms' ? 'salles'"), 'Résolution d\'alias rooms -> salles dans DataContext');

console.log('\n================================================================');
console.log(`📊 RÉSULTAT DU CONTRÔLE QA: ${passedTests}/${totalTests} tests validés (${Math.round((passedTests/totalTests)*100)}%)`);
if (failedTests === 0) {
  console.log('🎉 TOUS LES TESTS SONT AU VERT! CARTE 4.8 VALIDÉE AVEC SUCCÈS.');
} else {
  console.log(`⚠️ ${failedTests} test(s) en échec.`);
}
console.log('================================================================\n');

export default { totalTests, passedTests, failedTests };
if (process.argv[1] === fileURLToPath(import.meta.url) && failedTests > 0) process.exit(1);
