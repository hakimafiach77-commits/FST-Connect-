const prisma = require('../prismaClient');

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

  try {
    // 1. Check if seance exists
    const existing = await prisma.seance.findUnique({ where: { idSeance: parseInt(id) } });
    if (!existing) return res.status(404).json({ message: 'Séance introuvable' });

    // 2. Validation Logic (ignore self in conflict check)
    const teacherId = idEnseignant || existing.idEnseignant;
    const salleId = idSalle || existing.idSalle;
    const groupeId = idGroupe || existing.idGroupe;
    const day = jour || existing.jour;
    const start = heureDebut || existing.heureDebut;
    const end = heureFin || existing.heureFin;

    const teacherConflict = await checkOverlap(teacherId, 'teacher', day, start, end, id);
    if (teacherConflict) return res.status(400).json({ message: 'Conflit: Enseignant déjà occupé' });

    const roomConflict = await checkOverlap(salleId, 'room', day, start, end, id);
    if (roomConflict) return res.status(400).json({ message: 'Conflit: Salle déjà occupée' });

    const groupConflict = await checkOverlap(groupeId, 'group', day, start, end, id);
    if (groupConflict) return res.status(400).json({ message: 'Conflit: Groupe déjà occupé' });

    // 3. Update
    const seance = await prisma.seance.update({
      where: { idSeance: parseInt(id) },
      data: {
        idModule: idModule ? parseInt(idModule) : undefined,
        idEnseignant: idEnseignant ? parseInt(idEnseignant) : undefined,
        idGroupe: idGroupe ? parseInt(idGroupe) : undefined,
        idSalle: idSalle ? parseInt(idSalle) : undefined,
        type,
        jour: jour ? parseInt(jour) : undefined,
        heureDebut,
        heureFin,
        statut
      }
    });

    res.json({ status: 'success', data: seance });
  } catch (error) {
    console.error('updateSeance error:', error);
    res.status(500).json({ message: 'Server error during update' });
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
