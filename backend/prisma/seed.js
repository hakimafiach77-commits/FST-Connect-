const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SURNAMES = ['Bennani', 'El Idrissi', 'Mansouri', 'Alami', 'Tazi', 'Berrada', 'Chraibi', 'Zahiri', 'Lahlou', 'Moussaoui', 'Naji', 'Ouazzani', 'Qasmi', 'Radi', 'Sami', 'Tahiri', 'Yousfi', 'Zahra', 'Amrani', 'Belhaj', 'Fahmi', 'Ghazali', 'Haddad', 'Jabri', 'Kabbaj', 'Raki', 'Hakimi', 'Ziyech', 'En-Nesyri', 'Bounou', 'Aguerd', 'Mazraoui', 'Amrabat', 'Saiss', 'Ounahi'];
const FIRSTNAMES = ['Youssef', 'Amine', 'Meryem', 'Fatima', 'Said', 'Hassan', 'Karim', 'Salma', 'Ghita', 'Hamza', 'Imane', 'Kenza', 'Mehdi', 'Nora', 'Rayan', 'Sofia', 'Tariq', 'Walid', 'Yasmina', 'Zineb', 'Adam', 'Basma', 'Driss', 'Elias', 'Laila', 'Anas', 'Othmane', 'Marouane', 'Siham', 'Houda', 'Khadija', 'Rachid', 'Moha', 'Mustapha'];

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const SLOTS = [
  { start: '08:30', end: '10:20' },
  { start: '10:30', end: '12:20' },
  { start: '14:30', end: '16:20' },
  { start: '16:30', end: '18:20' }
];

async function main() {
  console.log('🚀 Finalizing High-Fidelity Seeding for 2026 Academic Year...');

  const hashedPass = await bcrypt.hash('password123', 10);

  // --- CLEANUP ---
  console.log('🧹 Purging existing data...');
  const tables = [
    'ServiceNotification', 'Inscription', 'DocumentPfe', 'Pfe', 'Jury', 'Absence', 'Seance', 'Edt', 'Salle', 
    'Affectation', 'Reclamation', 'Note', 'Examen', 'Document', 'Module', 'CompteurAbsence', 'Stage', 
    'Etudiant', 'Groupe', 'Filiere', 'Enseignant', 'MailService', 'Administrateur', 'Annonce', 'Notification', 
    'Club', 'Formation', 'Collaborateur', 'ResultatFinal', 'Semestre', 'Justificatif', 'DashboardAdminData', 
    'DashboardEnseignantData', 'DashboardEtudiantData', 'Dashboard', 'RoleService', 'SessionService', 
    'HistoriqueConnexion', 'TokenReinit', 'Utilisateur'
  ];
  for (const table of tables) {
    try { await prisma[table[0].toLowerCase() + table.slice(1)].deleteMany({}); } catch(e) {}
  }

  // --- 1. SYSTEM STRUCTURE ---
  console.log('🏗️  Building Academic Infrastructure 2026...');
  const semestres = await Promise.all([
    prisma.semestre.create({ data: { libelle: 'Automne 2025/2026', estCloture: true } }),
    prisma.semestre.create({ data: { libelle: 'Printemps 2025/2026', estCloture: false } })
  ]);

  const salles = await Promise.all([
    ...['Amphi A', 'Amphi B', 'Amphi C', 'Amphi D'].map(n => prisma.salle.create({ data: { nom: n, capaciteMax: 250, type: 'Amphithéâtre' } })),
    ...['B10', 'B11', 'B12', 'C01', 'C02', 'C03', 'C04', 'D01'].map(n => prisma.salle.create({ data: { nom: `Salle ${n}`, capaciteMax: 50, type: 'Cours' } })),
    ...['L01', 'L02', 'L03', 'L04', 'L05'].map(n => prisma.salle.create({ data: { nom: `Labo ${n}`, capaciteMax: 25, type: 'TP' } }))
  ]);

  const filieres = await Promise.all([
    prisma.filiere.create({ data: { code: 'LSI', intitule: 'Licence en Systèmes d\'Information' } }),
    prisma.filiere.create({ data: { code: 'BCG', intitule: 'Biologie Chimie Géologie' } }),
    prisma.filiere.create({ data: { code: 'GM', intitule: 'Génie Mécanique' } }),
    prisma.filiere.create({ data: { code: 'GE', intitule: 'Génie Electrique' } }),
    prisma.filiere.create({ data: { code: 'MIPC', intitule: 'Mathématiques Informatique Physique Chimie' } }),
    prisma.filiere.create({ data: { code: 'GEA', intitule: 'Génie de l\'Eau et de l\'Environnement' } })
  ]);

  // --- 2. USERS: ADMINS & FACULTY ---
  console.log('👨‍🏫 Generating Faculty & Staff...');
  const adminUser = await prisma.utilisateur.create({
    data: { nom: 'Alami', prenom: 'Meryem', email: 'admin@fst.ac.ma', motDePasse: hashedPass, role: 'admin' }
  });
  await prisma.administrateur.create({ data: { utilisateurId: adminUser.id, matricule: 'ADM-2026-001' } });
  const adminDash = await prisma.dashboard.create({ data: { idUtilisateur: adminUser.id, role: 'admin' } });
  await prisma.dashboardAdminData.create({ data: { idDashboard: adminDash.idDashboard, nbNotesSaisies: 4500, nbPFEEnCours: 120 } });

  const teachers = [];
  for (let i = 0; i < 40; i++) {
    const nom = SURNAMES[i % SURNAMES.length];
    const prenom = FIRSTNAMES[(i + 7) % FIRSTNAMES.length];
    const u = await prisma.utilisateur.create({
      data: { nom, prenom, email: `${prenom.toLowerCase()}.${nom.toLowerCase()}${i}@fst.ac.ma`.replace(/ /g, '-'), motDePasse: hashedPass, role: 'teacher' }
    });
    const e = await prisma.enseignant.create({
      data: { 
        utilisateurId: u.id, 
        matricule: `PROF-${2000 + i}`, 
        grade: i % 4 === 0 ? 'PES' : (i % 2 === 0 ? 'PH' : 'PA'), 
        specialite: i % 2 === 0 ? 'Informatique' : 'Electronique/Automatique' 
      }
    });
    const dash = await prisma.dashboard.create({ data: { idUtilisateur: u.id, role: 'teacher' } });
    await prisma.dashboardEnseignantData.create({ data: { idDashboard: dash.idDashboard, modulesPendants: 'Salles de TP occupées' } });
    teachers.push(e);
  }

  // --- 3. ACADEMIC CONTENT ---
  console.log('📚 Populating ALL Modules & Schedules for 2026...');
  const modules = [];
  for (const f of filieres) {
    for (let s = 1; s <= 4; s++) { // 4 semesters
      for (let m = 1; m <= 6; m++) { // 6 modules per semester
        const mod = await prisma.module.create({
          data: { 
            code: `${f.code}-S${s}-M${m}`, 
            intitule: `${f.code} : ${f.code=== 'LSI' ? 'Informatique' : 'Techniques'} ${s}.${m}`, 
            idFiliere: f.idFiliere, 
            coefficient: (Math.random() * 2 + 2).toFixed(1), 
            semestre: `S${s}` 
          }
        });
        modules.push(mod);
        
        // Assign 1-2 teachers per module
        const teacherCount = Math.random() > 0.8 ? 2 : 1;
        for (let tIdx = 0; tIdx < teacherCount; tIdx++) {
           const teacher = teachers[(modules.length + tIdx) % teachers.length];
           await prisma.affectation.create({
             data: { idEnseignant: teacher.idEnseignant, idModule: mod.idModule, typeIntervention: tIdx === 0 ? 'CM' : 'TD', heuresAssignees: 24 }
           });
        }
      }
    }
  }

  // --- 4. STUDENTS ---
  console.log('🎓 Generating 600+ Students...');
  const students = [];
  for (const f of filieres) {
    const groupeTD = await prisma.groupe.create({ data: { idFiliere: f.idFiliere, type: 'TD', capaciteMax: 50 } });
    const groupeTP1 = await prisma.groupe.create({ data: { idFiliere: f.idFiliere, type: 'TP', capaciteMax: 25 } });
    const groupeTP2 = await prisma.groupe.create({ data: { idFiliere: f.idFiliere, type: 'TP', capaciteMax: 25 } });

    for (let i = 0; i < 100; i++) { // 100 students per filiere
      const nom = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
      const prenom = FIRSTNAMES[Math.floor(Math.random() * FIRSTNAMES.length)];
      const email = `${prenom.toLowerCase()}.${nom.toLowerCase()}.${f.code.toLowerCase()}${i}@student.ac.ma`.replace(/ /g, '-');
      
      const u = await prisma.utilisateur.create({
        data: { nom, prenom, email, motDePasse: hashedPass, role: 'student' }
      });
      
      const s = await prisma.etudiant.create({
        data: { 
          utilisateurId: u.id, 
          cne: `${f.code}${20000 + i}${Math.floor(Math.random() * 99)}`, 
          idFiliere: f.idFiliere, 
          idGroupeTD: groupeTD.idGroupe,
          idGroupeTP: i < 50 ? groupeTP1.idGroupe : groupeTP2.idGroupe,
          statut: 'ACTIF'
        }
      });

      const cp = await prisma.compteurAbsence.create({ data: { idEtudiant: s.idEtudiant, totalHeuresAbsence: 0 } });
      const dash = await prisma.dashboard.create({ data: { idUtilisateur: u.id, role: 'student' } });
      await prisma.dashboardEtudiantData.create({ data: { idDashboard: dash.idDashboard, tauxAbsence: (Math.random() * 8).toFixed(2) } });
      
      students.push(s);
    }
  }

  // --- 5. SCHEDULES & ACTIVITY ---
  console.log('📅 Generating Comprehensive Schedules & Absences...');
  const currentModules = modules.filter(m => m.semestre === 'S2' || m.semestre === 'S4'); // Current spring semester
  
  for (const mod of currentModules) {
    const affectations = await prisma.affectation.findMany({ where: { idModule: mod.idModule } });
    const groups = await prisma.groupe.findMany({ where: { idFiliere: mod.idFiliere } });

    for (const aff of affectations) {
      // Create 2 sessions per week for each affected teacher
      for (let j = 0; j < 2; j++) {
        const dayIdx = (mod.idModule + j * 2) % 6;
        const slotIdx = (mod.idModule + j) % 4;
        const seance = await prisma.seance.create({
          data: {
            idModule: mod.idModule,
            idEnseignant: aff.idEnseignant,
            idGroupe: groups[j % groups.length].idGroupe,
            type: j === 0 ? 'CM' : 'TD',
            jour: DAYS[dayIdx],
            heureDebut: SLOTS[slotIdx].start,
            heureFin: SLOTS[slotIdx].end,
            idSalle: salles[Math.floor(Math.random() * salles.length)].idSalle
          }
        });

        // Add some absences for these sessions
        const groupStudents = students.filter(s => s.idGroupeTD === seance.idGroupe || s.idGroupeTP === seance.idGroupe);
        const absentCount = Math.floor(Math.random() * 4);
        for (let k = 0; k < absentCount; k++) {
          const s = groupStudents[Math.floor(Math.random() * groupStudents.length)];
          if (!s) continue;
          
          const isJustified = Math.random() > 0.7;
          let idJust = null;
          if (isJustified) {
            const jst = await prisma.justificatif.create({
              data: { motif: 'Raison médicale', etat: 'EN_ATTENTE', scanDocument: 'certificat_medical.pdf' }
            });
            idJust = jst.idJustificatif;
          }

          await prisma.absence.create({
            data: { 
              idEtudiant: s.idEtudiant, 
              idSeance: seance.idSeance, 
              statut: isJustified ? 'EN_ATTENTE' : 'INJUSTIFIEE',
              idJustificatif: idJust,
              dateSaisie: new Date()
            }
          });
        }
      }
    }

    // Add Exam for this module
    const exam = await prisma.examen.create({
      data: { type: 'Examen Final', date: new Date('2026-06-15'), heure: '14:30', idModule: mod.idModule, idSalle: salles[0].idSalle }
    });

    // Add some random grades for S1 modules (completed)
    const prevSemModules = modules.filter(m => m.idFiliere === mod.idFiliere && m.semestre === 'S1').slice(0, 2);
    for (const pm of prevSemModules) {
       const modStudents = students.filter(s => s.idFiliere === pm.idFiliere).slice(0, 20);
       for (const s of modStudents) {
         await prisma.note.create({
           data: {
             idEtudiant: s.idEtudiant,
             idModule: pm.idModule,
             valeurCC: (Math.random() * 8 + 8).toFixed(2),
             valeurEF: (Math.random() * 10 + 6).toFixed(2),
             estVerrouillee: true
           }
         });
       }
    }
  }

  // --- 6. COMMS & PRO ---
  console.log('📢 Finalizing Social & Pro Data...');
  await prisma.annonce.createMany({
    data: [
      { titre: 'Bienvenue sur la nouvelle plateforme !', contenu: 'Le portail FST-Connect est désormais officiellement ouvert pour tous les étudiants et enseignants.', cible: 'tous', idAuteur: adminUser.id },
      { titre: 'Emplois du temps Printemps 2026', contenu: 'Les emplois du temps définitifs pour le second semestre sont disponibles en téléchargement.', cible: 'tous', idAuteur: adminUser.id, urgent: true },
      { titre: 'Hackathon Innovation Digitale', contenu: 'Participez au grand hackathon de la faculté. Inscriptions ouvertes jusqu\'au 20 Avril.', cible: 'tous', idAuteur: teachers[0].utilisateurId },
      { titre: 'Rappel : Soutenances PFE', contenu: 'Le dépôt des rapports de PFE doit se faire impérativement avant le 30 Mai.', cible: 'LSI', idAuteur: adminUser.id, urgent: true }
    ]
  });

  const club = await prisma.club.create({ data: { nom: 'Club IT & Robotics', description: 'Le hub de l\'innovation technologique à la FST.', idResponsable: teachers[2].utilisateurId } });
  
  console.log('✅ Seeding Completed Successfully! All systems active for 2026. 🚀');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    pool.end();
  });
