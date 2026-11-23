import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('################################################################');
console.log('🚀 FST-CONNECT: GLOBAL QA TEST SUITE RUNNER');
console.log('################################################################\n');

const testSuites = [
  { name: '4.1 Portail d\'accueil', script: path.join(__dirname, 'tests-portail-accueil.mjs') },
  { name: '4.3 Gestion des étudiants', script: path.join(__dirname, 'tests-gestion-etudiants.mjs') },
  { name: '4.6 Gestion des enseignants', script: path.join(__dirname, 'tests-gestion-enseignants.mjs') },
  { name: '4.13 Filières, groupes et années', script: path.join(__dirname, 'tests-filieres-groupes.mjs') },
  { name: '4.15 Examens et notes', script: path.join(__dirname, 'tests-examens-notes.mjs') },
  { name: '4.8 Emplois du temps', script: path.join(__dirname, 'tests-emplois-du-temps.mjs') },
  { name: '4.10 Modules et documents', script: path.join(__dirname, 'tests-modules-documents.mjs') },
  { name: '4.9, 4.11, 4.17 Comm, Absences & Réclamations', script: path.join(__dirname, 'tests-communication-absences-reclamations.mjs') },
  { name: '4.4 & 4.5 PFE & Stages', script: path.join(__dirname, 'tests-pfe-stages.mjs') },
  { name: '4.16 & 4.7 Délibérations & Affectations', script: path.join(__dirname, 'tests-deliberations-affectations.mjs') },
  { name: '4.12 & 4.19 Salles & Formations', script: path.join(__dirname, 'tests-salles-formations.mjs') },
  { name: '4.14 & 4.18 Tableaux de bord & Clubs', script: path.join(__dirname, 'tests-dashboard-clubs.mjs') }
];

let globalStatus = 0;

for (const suite of testSuites) {
  try {
    console.log(`▶ Exécution de la suite : ${suite.name}...`);
    execSync(`node "${suite.script}"`, { stdio: 'inherit' });
  } catch (err) {
    globalStatus = 1;
    console.error(`❌ Échec lors de l'exécution de ${suite.name}`);
  }
}

if (globalStatus === 0) {
  console.log('################################################################');
  console.log('🎉 100% SUCCÈS : TOUTES LES SUITES DE RECETTE SONT AU VERT !');
  console.log('################################################################\n');
} else {
  console.log('################################################################');
  console.log('⚠️ CERTAINS TESTS ONT ÉCHOUÉ.');
  console.log('################################################################\n');
  process.exit(1);
}
