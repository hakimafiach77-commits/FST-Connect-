import fs from 'fs';
import path from 'path';

console.log('=====================================================');
console.log('🧪 TEST SUITE: Carte Trello 4.1 "Portail d\'accueil"');
console.log('=====================================================\n');

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

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');
const landingPagePath = path.join(srcDir, 'pages', 'LandingPage.jsx');
const appPath = path.join(srcDir, 'App.jsx');
const publicLayoutPath = path.join(srcDir, 'layouts', 'PublicLayout.jsx');
const heroImgPath = path.join(rootDir, 'public', 'hero_graduation.png');

console.log('🔍 1. VÉRIFICATION DES FICHIERS ET ASSETS');
assert(fs.existsSync(landingPagePath), 'Fichier LandingPage.jsx présent dans src/pages/');
assert(fs.existsSync(publicLayoutPath), 'Fichier PublicLayout.jsx présent dans src/layouts/');
assert(fs.existsSync(appPath), 'Fichier de routage App.jsx présent');
assert(fs.existsSync(heroImgPath), 'Image hero_graduation.png présente dans public/');

const landingContent = fs.readFileSync(landingPagePath, 'utf-8');
const appContent = fs.readFileSync(appPath, 'utf-8');

console.log('\n🔍 2. ROUTAGE ET ACCESSIBILITÉ PUBLIQUE');
assert(appContent.includes('path="/"') && appContent.includes('LandingPage'), 'Route "/" pointe vers LandingPage');
assert(appContent.includes('path="/landing"') && appContent.includes('LandingPage'), 'Route alias "/landing" pointe vers LandingPage');
assert(appContent.includes('PublicLayout'), 'LandingPage encapsulée dans le layout public sans authentification requise');

console.log('\n🔍 3. EN-TÊTE ET BARRE DE CONTACT');
assert(landingContent.includes('contact-info@fstt.ac.ma'), 'Email institutionnel FSTT présent');
assert(landingContent.includes('+212 5 39 39 39 53'), 'Numéro de téléphone officiel présent');
assert(landingContent.includes('https://www.fstt.ac.ma'), 'Lien vers le site officiel FSTT présent');
assert(landingContent.includes('ESPACE PRIVÉ') && landingContent.includes('/auth'), 'Bouton "ESPACE PRIVÉ" redirige vers /auth');

console.log('\n🔍 4. BANNIÈRE HERO & APPELS À L\'ACTION (CTA)');
assert(landingContent.includes('Département Informatique'), 'Titre principal Hero "Département Informatique"');
assert(landingContent.includes('/hero_graduation.png'), 'Arrière-plan hero graduation configuré');
assert(landingContent.includes('Accéder à la plateforme de gestion GDI') && landingContent.includes('to="/auth"'), 'Bouton CTA principal pointe vers /auth');

console.log('\n🔍 5. RACCOURCIS DE SERVICES (SHORTCUTS)');
assert(landingContent.includes("label: 'Emplois du Temps'") && landingContent.includes("href: '/edt'"), 'Raccourci Emploi du temps vers /edt');
assert(landingContent.includes("label: 'Listes des Étudiants'") && landingContent.includes("href: '/etudiants'"), 'Raccourci Étudiants vers /etudiants');
assert(landingContent.includes("label: 'E-Learning (Moodle)'") && landingContent.includes('moodle-fstt.uae.ac.ma'), 'Raccourci Moodle externe fonctionnel');
assert(landingContent.includes("label: 'Scolarité & Documents'") && landingContent.includes('edoc-fstt.uae.ac.ma'), 'Raccourci Scolarité eDoc fonctionnel');
assert(landingContent.includes("label: 'Clubs & Vie Étudiante'") && landingContent.includes("href: '/clubs'"), 'Raccourci Clubs vers /clubs');

console.log('\n🔍 6. OFFRE DE FORMATION & STATISTIQUES');
assert(landingContent.includes('800+') && landingContent.includes('Étudiants inscrits'), 'Statistique Étudiants 800+ présente');
assert(landingContent.includes('45') && landingContent.includes('Enseignants'), 'Statistique Enseignants 45 présente');
assert(landingContent.includes('6') && landingContent.includes('Filières actives'), 'Statistique 6 Filières présente');
assert(landingContent.includes('Licence (LST)'), 'Section Licence LST intégrée');
assert(landingContent.includes('Master (MST)'), 'Section Master MST intégrée');
assert(landingContent.includes("Cycle d'Ingénieur"), 'Section Cycle d\'Ingénieur intégrée');

console.log('\n🔍 7. ACTUALITÉS & AGENDA DES ÉVÈNEMENTS');
assert(landingContent.includes('Soutenances des PFE - Master IA'), 'Actualité PFE Master IA présente');
assert(landingContent.includes('Appel à candidature: Doctorat'), 'Actualité Doctorat présente');
assert(landingContent.includes('Hackathon "Smart City Tanger"'), 'Évènement Hackathon présent');
assert(landingContent.includes('Séminaire: Cybersécurité'), 'Évènement Cybersécurité présent');

console.log('\n🔍 8. FAQ INTERACTIVE & PARTENAIRES');
assert(landingContent.includes('FaqSection'), 'Composant FaqSection présent');
assert(landingContent.includes('CAPGEMINI') && landingContent.includes('Oracle') && landingContent.includes('Microsoft'), 'Partenaires industriels référencés');

console.log('\n🔍 9. PIED DE PAGE & MENTIONS LÉGALES');
assert(landingContent.includes('© 2026 Faculté des Sciences et Techniques de Tanger'), 'Copyright et mentions FSTT 2026 présents');
assert(landingContent.includes('d.informatique@fstt.ac.ma'), 'Email de contact département dans le footer');

console.log('\n=====================================================');
console.log(`📊 RÉSULTAT DU CONTRÔLE: ${passedTests}/${totalTests} tests validés (${Math.round((passedTests/totalTests)*100)}%)`);
if (failedTests === 0) {
  console.log('🎉 TOUS LES TESTS SONT AU VERT! CARTE 4.1 VALIDÉE AVEC SUCCÈS.');
} else {
  console.log(`⚠️ ${failedTests} test(s) en échec.`);
}
console.log('=====================================================\n');

if (failedTests > 0) process.exit(1);

