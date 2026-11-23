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
  { name: '4.13 Filières, groupes et années', script: path.join(__dirname, 'tests-filieres-groupes.mjs') }
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
