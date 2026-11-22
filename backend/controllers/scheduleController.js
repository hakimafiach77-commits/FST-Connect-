const prisma = require('../prismaClient');

const ALLOWED_DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const parseIdStrict = (val) => {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  if (!/^\d+$/.test(s)) return null;
  const n = parseInt(s, 10);
  if (n <= 0 || !Number.isSafeInteger(n)) return null;
  return n;
};

/**
 * @desc    Get user-specific schedule (EDT)
 * @route   GET /api/schedule/me
 * @access  Private
 */
const getMySchedule = async (req, res) => {
  const { id, role } = req.user;

  try {
    let seances = [];

    if (role === 'student') {
      // 1. Get student's group info
      const etudiant = await prisma.etudiant.findUnique({
        where: { utilisateurId: id },
        select: { idGroupeTD: true, idGroupeTP: true, idFiliere: true }
      });

      if (!etudiant) return res.status(404).json({ message: 'Student profile not found' });

      // 2. Find seances for their groups or general filiere events
      seances = await prisma.seance.findMany({
        where: {
          OR: [
            { idGroupe: etudiant.idGroupeTD },
            { idGroupe: etudiant.idGroupeTP }
          ]
        },
        include: {
          module: true,
          salle: true,
          enseignant: {
            include: { utilisateur: { select: { nom: true, prenom: true } } }
          }
        },
        orderBy: [
          { jour: 'asc' },
          { heureDebut: 'asc' }
        ]
      });
    } 
    else if (role === 'teacher') {
      // 1. Get teacher profile
      const enseignant = await prisma.enseignant.findUnique({
        where: { utilisateurId: id }
      });

      if (!enseignant) return res.status(404).json({ message: 'Teacher profile not found' });

      // 2. Find seances assigned to them
      seances = await prisma.seance.findMany({
        where: { idEnseignant: enseignant.idEnseignant },
        include: {
          module: true,
          salle: true,
          groupe: { include: { filiere: true } }
        },
        orderBy: [
          { jour: 'asc' },
          { heureDebut: 'asc' }
        ]
      });
    }
    else if (role === 'admin') {
      // Admin sees everything
      seances = await prisma.seance.findMany({
        include: {
          module: true,
          salle: true,
          groupe: true,
          enseignant: {
            include: { utilisateur: { select: { nom: true, prenom: true } } }
          }
        }
      });
    }

    res.json({
      status: 'success',
      data: seances
    });

  } catch (error) {
    console.error('getMySchedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Helper to check for scheduling overlaps
 */
const checkOverlap = async (id, type, jour, start, end, excludeId = null) => {
  const where = {
    jour,
    OR: [
      { // New starts during existing
        AND: [
          { heureDebut: { lte: start } },
          { heureFin: { gt: start } }
        ]
      },
      { // New ends during existing
        AND: [
          { heureDebut: { lt: end } },
          { heureFin: { gte: end } }
        ]
      },
      { // Existing is inside new
        AND: [
          { heureDebut: { gte: start } },
          { heureFin: { lte: end } }
        ]
      }
    ]
  };

  if (excludeId) where.idSeance = { not: parseInt(excludeId) };

  if (type === 'teacher') where.idEnseignant = parseInt(id);
  if (type === 'room')    where.idSalle = parseInt(id);
  if (type === 'group')   where.idGroupe = parseInt(id);

  const conflict = await prisma.seance.findFirst({ where });
  return conflict;
};

/**
 * @desc    Create a new Seance (Admin Only)
 * @route   POST /api/schedule
 * @access  Private/Admin
 */
const createSeance = async (req, res) => {
  const { idModule, idEnseignant, idGroupe, idSalle, type, jour, heureDebut, heureFin } = req.body;

  try {
    // 1. Validation Logic
    const teacherConflict = await checkOverlap(idEnseignant, 'teacher', jour, heureDebut, heureFin);
    if (teacherConflict) return res.status(400).json({ message: 'Conflit: Enseignant déjà occupé' });

    const roomConflict = await checkOverlap(idSalle, 'room', jour, heureDebut, heureFin);
    if (roomConflict) return res.status(400).json({ message: 'Conflit: Salle déjà occupée' });

    const groupConflict = await checkOverlap(idGroupe, 'group', jour, heureDebut, heureFin);
    if (groupConflict) return res.status(400).json({ message: 'Conflit: Groupe déjà occupé' });

    // 2. Create Seance
    const seance = await prisma.seance.create({
      data: {
        idModule: parseInt(idModule),
        idEnseignant: parseInt(idEnseignant),
        idGroupe: parseInt(idGroupe),
        idSalle: parseInt(idSalle),
        type,
        jour,
        heureDebut,
        heureFin,
        statut: 'VALIDE'
      }
    });

    res.status(201).json({ status: 'success', data: seance });
  } catch (error) {
    console.error('createSeance error:', error);
    res.status(500).json({ message: 'Server error during creation' });
  }
};

/**
 * @desc    Update a Seance (Admin Only)
 * @route   PATCH /api/schedule/:id
 * @access  Private/Admin
 */
const updateSeance = async (req, res) => {
  const { id } = req.params;
  const { idModule, idEnseignant, idGroupe, idSalle, type, jour, heureDebut, heureFin, statut } = req.body;

  // 1. Validation stricte de l'identifiant URL
  const seanceId = parseIdStrict(id);
  if (!seanceId) {
    return res.status(400).json({
      message: 'Identifiant de séance invalide.',
      code: 'INVALID_SEANCE_ID'
    });
  }

  // 2. Validation stricte du champ jour si fourni
  let validatedJour;
  if (jour !== undefined) {
    if (typeof jour !== 'string' || !ALLOWED_DAYS.includes(jour.trim())) {
      return res.status(400).json({
        message: `Valeur du champ 'jour' invalide. Jours autorisés : ${ALLOWED_DAYS.join(', ')}.`,
        code: 'INVALID_JOUR'
      });
    }
    validatedJour = jour.trim();
  }

  // 3. Validation syntaxique stricte de chaque champ ID fourni dans le corps
  let validatedModuleId;
  if (idModule !== undefined) {
    validatedModuleId = parseIdStrict(idModule);
    if (!validatedModuleId) {
      return res.status(400).json({ message: 'Identifiant idModule invalide.', code: 'INVALID_MODULE_ID' });
    }
  }

  let validatedEnseignantId;
  if (idEnseignant !== undefined) {
    validatedEnseignantId = parseIdStrict(idEnseignant);
    if (!validatedEnseignantId) {
      return res.status(400).json({ message: 'Identifiant idEnseignant invalide.', code: 'INVALID_ENSEIGNANT_ID' });
    }
  }

  let validatedGroupeId;
  if (idGroupe !== undefined) {
    validatedGroupeId = parseIdStrict(idGroupe);
    if (!validatedGroupeId) {
      return res.status(400).json({ message: 'Identifiant idGroupe invalide.', code: 'INVALID_GROUPE_ID' });
    }
  }

  let validatedSalleId;
  if (idSalle !== undefined) {
    validatedSalleId = parseIdStrict(idSalle);
    if (!validatedSalleId) {
      return res.status(400).json({ message: 'Identifiant idSalle invalide.', code: 'INVALID_SALLE_ID' });
    }
  }

  try {
    // 4. Vérifier l'existence de la séance
    const existing = await prisma.seance.findUnique({ where: { idSeance: seanceId } });
    if (!existing) return res.status(404).json({ message: 'Séance introuvable', code: 'SEANCE_NOT_FOUND' });

    // 5. Vérification d'existence en base des entités référencées fournies
    if (validatedModuleId !== undefined) {
      const mod = await prisma.module.findUnique({ where: { idModule: validatedModuleId } });
      if (!mod) return res.status(404).json({ message: 'Module introuvable.', code: 'MODULE_NOT_FOUND' });
    }
    if (validatedEnseignantId !== undefined) {
      const ens = await prisma.enseignant.findUnique({ where: { idEnseignant: validatedEnseignantId } });
      if (!ens) return res.status(404).json({ message: 'Enseignant introuvable.', code: 'ENSEIGNANT_NOT_FOUND' });
    }
    if (validatedGroupeId !== undefined) {
      const grp = await prisma.groupe.findUnique({ where: { idGroupe: validatedGroupeId } });
      if (!grp) return res.status(404).json({ message: 'Groupe introuvable.', code: 'GROUPE_NOT_FOUND' });
    }
    if (validatedSalleId !== undefined) {
      const sal = await prisma.salle.findUnique({ where: { idSalle: validatedSalleId } });
      if (!sal) return res.status(404).json({ message: 'Salle introuvable.', code: 'SALLE_NOT_FOUND' });
    }

    // 6. Résolution des valeurs effectives pour les vérifications de conflit
    const teacherId = validatedEnseignantId !== undefined ? validatedEnseignantId : existing.idEnseignant;
    const salleId   = validatedSalleId      !== undefined ? validatedSalleId      : existing.idSalle;
    const groupeId  = validatedGroupeId     !== undefined ? validatedGroupeId     : existing.idGroupe;
    const day   = validatedJour !== undefined ? validatedJour : existing.jour;
    const start = heureDebut || existing.heureDebut;
    const end   = heureFin   || existing.heureFin;

    if (teacherId) {
      const teacherConflict = await checkOverlap(teacherId, 'teacher', day, start, end, seanceId);
      if (teacherConflict) return res.status(400).json({ message: 'Conflit: Enseignant déjà occupé', code: 'TEACHER_CONFLICT' });
    }

    if (salleId) {
      const roomConflict = await checkOverlap(salleId, 'room', day, start, end, seanceId);
      if (roomConflict) return res.status(400).json({ message: 'Conflit: Salle déjà occupée', code: 'ROOM_CONFLICT' });
    }

    if (groupeId) {
      const groupConflict = await checkOverlap(groupeId, 'group', day, start, end, seanceId);
      if (groupConflict) return res.status(400).json({ message: 'Conflit: Groupe déjà occupé', code: 'GROUP_CONFLICT' });
    }

    // 7. Mise à jour de la séance
    const seance = await prisma.seance.update({
      where: { idSeance: seanceId },
      data: {
        idModule:     validatedModuleId,
        idEnseignant: validatedEnseignantId,
        idGroupe:     validatedGroupeId,
        idSalle:      validatedSalleId,
        type,
        jour: validatedJour,
        heureDebut,
        heureFin,
        statut
      }
    });

    res.json({ status: 'success', data: seance });
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(400).json({ message: 'Référence de clé étrangère invalide.', code: 'FOREIGN_KEY_VIOLATION' });
    }
    console.error('updateSeance error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour.' });
  }
};

/**
 * @desc    Delete a Seance (Admin Only)
 * @route   DELETE /api/schedule/:id
 * @access  Private/Admin
 */
const deleteSeance = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.seance.delete({
      where: { idSeance: parseInt(id) }
    });
    res.json({ status: 'success', message: 'Séance supprimée' });
  } catch (error) {
    console.error('deleteSeance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMySchedule,
  createSeance,
  updateSeance,
  deleteSeance
};
