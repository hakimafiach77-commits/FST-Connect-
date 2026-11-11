const prisma = require('../prismaClient');

/**
 * Normalizes entity objects by adding a generic 'id' property based on their primary key.
 * This version is safer and won't mangle complex types like Dates or Decimals.
 */
const normalizeData = (data, visited = new Set()) => {
  if (data === null || data === undefined) return data;

  // Handle circular references
  if (typeof data === 'object' && data !== null) {
    if (visited.has(data)) return undefined; // or null
    visited.add(data);
  }

  // Handle Arrays
  if (Array.isArray(data)) {
    return data.map(item => normalizeData(item, visited));
  }

  // Handle Plain Objects only
  if (typeof data === 'object' && (data.constructor === Object || !data.constructor)) {
    const normalized = { ...data };
    
    // Primary Key Normalization
    const pkPatterns = [
      'idSeance', 'idAbsence', 'idNote', 'idAnnonce', 'idClub', 'idSalle', 
      'idModule', 'idEtudiant', 'idEnseignant', 'idEDT', 'idAffectation', 
      'idDocument', 'idExamen', 'idReclamation', 'idResultat', 'idPG', 
      'idStage', 'idJury', 'idFormation', 'idCollaborateur', 'idInscription', 
      'idNotification', 'idDashboard', 'idJustificatif',
      'idSemestre', 'idGroupe', 'idFiliere' 
    ];

    if (normalized.id === undefined) {
      for (const pk of pkPatterns) {
        if (normalized[pk] !== undefined) {
          normalized.id = normalized[pk];
          break;
        }
      }
    }

    // Common Aliases for Frontend Compatibility (RG32 & Legacy support)
    const aliases = {
      idEtudiant: 'studentId',
      idEnseignant: 'teacherId',
      idModule: 'moduleId',
      idFiliere: 'filiereId',
      idGroupe: 'groupId',
      idAnnonce: 'announcementId',
      idDocument: 'documentId',
      idAuteur: 'authorId',
      idAuteur: 'authorId',
      titre: 'title',
      contenu: ['content', 'body'],
      dateCreation: 'createdAt',
      dateUpload: 'uploadedAt',
      cheminFichier: 'filename'
    };

    for (const [key, alias] of Object.entries(aliases)) {
      if (normalized[key] !== undefined) {
        if (Array.isArray(alias)) {
          alias.forEach(a => { if (normalized[a] === undefined) normalized[a] = normalized[key]; });
        } else {
          if (normalized[alias] === undefined) normalized[alias] = normalized[key];
        }
      }
    }

    // Recursively normalize properties
    for (const key in normalized) {
      // Don't recurse into already normalized aliases to avoid infinite loops
      // and only recurse into objects/arrays
      if (typeof normalized[key] === 'object' && normalized[key] !== null) {
        normalized[key] = normalizeData(normalized[key], visited);
      }
    }

    return normalized;
  }

  return data;
};

/**
 * @desc    Get complete application state (Big Sync)
 * @route   GET /api/sync
 * @access  Private
 */
const getFullState = async (req, res) => {
  const { id, role } = req.user;

  try {
    // Basic shared data (Filieres, Groupes, Salles, Modules)
    const baseQueries = {
      filieres: prisma.filiere.findMany(),
      groupes: prisma.groupe.findMany({
        include: {
          enseignant: { select: { utilisateur: { select: { nom: true, prenom: true } } } },
          etudiantsProjet: true,
          filiere: { select: { code: true } }
        }
      }),
      salles: prisma.salle.findMany(),
      modules: prisma.module.findMany(),
      utilisateurs: prisma.utilisateur.findMany({
        select: { id: true, nom: true, prenom: true, email: true, role: true, photo: true, statut: true }
      }),
      annonces: prisma.annonce.findMany({ where: { statut: 'PUBLIEE' } }),
      reclamations: prisma.reclamation.findMany({ include: { note: true } }),
      documents: prisma.document.findMany(),
      clubs: prisma.club.findMany({
        include: {
          membres: { select: { idEtudiant: true } }
        }
      })
    };

    let resultData = {};

    if (role === 'admin') {
      const [filieres, groupes, salles, modules, utilisateurs, annonces, reclamations, documents, clubs, etudiants, enseignants, seances, absences, notes, pfes, juries, stages, edts] = await Promise.all([
        baseQueries.filieres,
        baseQueries.groupes,
        baseQueries.salles,
        baseQueries.modules,
        baseQueries.utilisateurs,
        baseQueries.annonces,
        baseQueries.reclamations,
        baseQueries.documents,
        baseQueries.clubs,
        prisma.etudiant.findMany(),
        prisma.enseignant.findMany(),
        prisma.seance.findMany(),
        prisma.absence.findMany(),
        prisma.note.findMany(),
        prisma.pfe.findMany(),
        prisma.jury.findMany({ include: { membresEnseignants: { include: { utilisateur: true } }, pfes: true } }),
        prisma.stage.findMany({ include: { etudiant: true } }),
        prisma.edt.findMany()
      ]);

      resultData = { filieres, groupes, salles, modules, utilisateurs, annonces, reclamations, documents, clubs, etudiants, enseignants, seances, absences, notes, pfes, juries, stages, edts };
    } 
    else if (role === 'teacher') {
      const teacher = await prisma.enseignant.findUnique({ where: { utilisateurId: id } });
      const teacherId = teacher?.idEnseignant;

      const [filieres, groupes, salles, modules, utilisateurs, annonces, documents, clubs, seances, pfes, juries, affectations] = await Promise.all([
        baseQueries.filieres,
        baseQueries.groupes,
        baseQueries.salles,
        baseQueries.modules,
        baseQueries.utilisateurs,
        baseQueries.annonces,
        baseQueries.documents,
        baseQueries.clubs,
        prisma.seance.findMany({ where: { idEnseignant: teacherId } }),
        prisma.pfe.findMany({ where: { idEncadrant: teacherId } }),
        prisma.jury.findMany({ 
          where: { membresEnseignants: { some: { idEnseignant: teacherId } } },
          include: { membresEnseignants: { include: { utilisateur: true } }, pfes: true }
        }),
        prisma.affectation.findMany({ where: { idEnseignant: teacherId } })
      ]);

      const moduleIds = [...new Set([...seances.map(s => s.idModule), ...affectations.map(a => a.idModule)])];
      const affectedModules = await prisma.module.findMany({
        where: { idModule: { in: moduleIds } },
        select: { idFiliere: true }
      });
      const filiereIds = [...new Set(affectedModules.map(m => m.idFiliere).filter(id => id !== null))];

      const students = await prisma.etudiant.findMany({
        where: { 
          OR: [
            { idGroupeTD: { in: [...new Set(seances.map(s => s.idGroupe))] } }, 
            { idGroupeTP: { in: [...new Set(seances.map(s => s.idGroupe))] } },
            { idFiliere: { in: filiereIds } }
          ] 
        }
      });
      const [notes, absences, reclamations] = await Promise.all([
        prisma.note.findMany({ where: { idModule: { in: moduleIds } } }),
        prisma.absence.findMany({ where: { idSeance: { in: seances.map(s => s.idSeance) } } }),
        prisma.reclamation.findMany({ where: { note: { idModule: { in: moduleIds } } }, include: { note: true } })
      ]);

      resultData = { filieres, groupes, salles, modules, utilisateurs, annonces, documents, clubs, seances, etudiants: students, pfes, notes, absences, juries, reclamations, affectations, enseignants: [teacher] };
    }
    else if (role === 'student') {
      const etudiant = await prisma.etudiant.findUnique({ 
        where: { utilisateurId: id },
        include: {
          filiere: true,
          groupeTD: true,
          groupeTP: true
        }
      });
      const etudiantId = etudiant?.idEtudiant;

      // Build session filter for student: their TD group, TP group, or general filiere courses
      const sessionOrFilters = [];
      if (etudiant?.idGroupeTD) sessionOrFilters.push({ idGroupe: etudiant.idGroupeTD });
      if (etudiant?.idGroupeTP) sessionOrFilters.push({ idGroupe: etudiant.idGroupeTP });
      if (etudiant?.idFiliere) {
        sessionOrFilters.push({ 
          module: { idFiliere: etudiant.idFiliere },
          idGroupe: null 
        });
      }

      const seanceQuery = sessionOrFilters.length > 0 
        ? prisma.seance.findMany({ 
            where: { OR: sessionOrFilters },
            include: {
              salle: true,
              module: true,
              groupe: true,
              enseignant: { include: { utilisateur: true } }
            }
          })
        : Promise.resolve([]);

      const [filieres, groupes, salles, modules, utilisateurs, annonces, documents, clubs, seances, notes, absences, pfes, juries, stages, reclamations, formations] = await Promise.all([
        baseQueries.filieres,
        baseQueries.groupes,
        baseQueries.salles,
        baseQueries.modules,
        baseQueries.utilisateurs,
        baseQueries.annonces,
        baseQueries.documents,
        baseQueries.clubs,
        seanceQuery,
        etudiantId ? prisma.note.findMany({ where: { idEtudiant: etudiantId } }) : Promise.resolve([]),
        etudiantId ? prisma.absence.findMany({ where: { idEtudiant: etudiantId } }) : Promise.resolve([]),
        etudiantId ? prisma.pfe.findMany({ where: { idEtudiant: etudiantId } }) : Promise.resolve([]),
        etudiantId ? prisma.jury.findMany({ 
          where: { pfes: { some: { idEtudiant: etudiantId } } },
          include: { membresEnseignants: { include: { utilisateur: true } } }
        }) : Promise.resolve([]),
        etudiantId ? prisma.stage.findMany({ where: { idEtudiant: etudiantId } }) : Promise.resolve([]),
        etudiantId ? prisma.reclamation.findMany({ where: { note: { idEtudiant: etudiantId } }, include: { note: true } }) : Promise.resolve([]),
        prisma.formation.findMany({ 
          include: { 
            collaborateur: { select: { nomOrganisme: true } },
            _count: { select: { inscriptions: true } }
          }
        })
      ]);

      // Flatten formations for easier frontend consumption
      const flattendFormations = formations.map(f => ({
        ...f,
        collaborateur: f.collaborateur?.nomOrganisme || 'Partenaire externe',
        inscrits: f._count?.inscriptions || 0,
        capacite: f.capacite || 50,
        lieu: f.lieu || 'FST Tanger',
        dateDebut: f.dateDebut || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }));

      const normalizedStudent = etudiant ? {
        ...etudiant,
        id: etudiant.idEtudiant,
        studentId: etudiant.idEtudiant,
        filiereId: etudiant.idFiliere,
        groupTDId: etudiant.idGroupeTD,
        groupTPId: etudiant.idGroupeTP
      } : null;

      resultData = { 
        filieres, 
        groupes, 
        salles, 
        modules, 
        utilisateurs, 
        annonces, 
        documents, 
        clubs, 
        seances, 
        etudiants: normalizedStudent ? [normalizedStudent] : [], 
        notes, 
        absences, 
        pfes, 
        juries, 
        stages, 
        reclamations, 
        formations: flattendFormations 
      };
    }

    const normalized = normalizeData(resultData);

    res.json({
      status: 'success',
      data: normalized
    });

  } catch (error) {
    console.error('getFullState error:', error);
    res.status(500).json({ message: 'Server error during sync' });
  }
};

module.exports = { getFullState, normalizeData };
