const prisma = require('../prismaClient');

const ALLOWED_STATUTS = ['SOLICITEE', 'VALIDEE', 'REFUSEE', 'CONVENTION_SIGNEE', 'EN_PREPARATION', 'TERMINEE'];

/**
 * @desc    Get all stages (Admin & Teachers)
 * @route   GET /api/stages
 * @access  Private/Admin, Teacher
 */
const getAllStages = async (req, res) => {
  const { statut } = req.query;

  try {
    const where = {};
    if (statut && typeof statut === 'string') {
      where.conventionStatut = statut.trim();
    }

    const stages = await prisma.stage.findMany({
      where,
      include: {
        etudiant: {
          include: {
            utilisateur: { select: { nom: true, prenom: true, email: true } },
            filiere: { select: { idFiliere: true, code: true, intitule: true } }
          }
        }
      },
      orderBy: { idStage: 'desc' }
    });

    res.json({
      status: 'success',
      count: stages.length,
      data: stages
    });
  } catch (error) {
    console.error('getAllStages error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des stages' });
  }
};

/**
 * @desc    Request a new internship convention (Student only)
 * @route   POST /api/stages/request
 * @access  Private/Student
 */
const requestStage = async (req, res) => {
  const { entreprise, dateDebut, dateFin, lieu, encadrantEntreprise, sujet } = req.body;

  if (!entreprise || typeof entreprise !== 'string' || !entreprise.trim()) {
    return res.status(400).json({ success: false, error: 'ENTREPRISE_REQUIRED', message: 'Le nom de l\'entreprise est obligatoire' });
  }

  if (!dateDebut || !dateFin) {
    return res.status(400).json({ success: false, error: 'DATES_REQUIRED', message: 'Les dates de début et de fin sont obligatoires' });
  }

  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);

  if (isNaN(debut.getTime()) || isNaN(fin.getTime())) {
    return res.status(400).json({ success: false, error: 'INVALID_DATES', message: 'Format de date invalide (ISO attendu)' });
  }

  if (fin < debut) {
    return res.status(400).json({ success: false, error: 'INVALID_DATE_RANGE', message: 'La date de fin doit être postérieure à la date de début' });
  }

  try {
    const etudiant = await prisma.etudiant.findUnique({
      where: { utilisateurId: req.user.id }
    });

    if (!etudiant) {
      return res.status(404).json({ success: false, error: 'STUDENT_NOT_FOUND', message: 'Profil étudiant introuvable' });
    }

    const stage = await prisma.stage.create({
      data: {
        idEtudiant: etudiant.idEtudiant,
        entreprise: entreprise.trim(),
        dateDebut: debut,
        dateFin: fin,
        conventionStatut: 'SOLICITEE'
      },
      include: {
        etudiant: {
          include: { utilisateur: { select: { nom: true, prenom: true, email: true } } }
        }
      }
    });

    res.status(201).json({
      status: 'success',
      data: stage
    });
  } catch (error) {
    console.error('requestStage error:', error);
    res.status(500).json({ message: 'Erreur lors de la demande de stage' });
  }
};

/**
 * @desc    Get student's own internships
 * @route   GET /api/stages/me
 * @access  Private
 */
const getMyStages = async (req, res) => {
  const { id, role } = req.user;

  try {
    let stages = [];

    if (role === 'student') {
      const etudiant = await prisma.etudiant.findUnique({
        where: { utilisateurId: id }
      });
      if (!etudiant) return res.status(404).json({ message: 'Profil étudiant introuvable' });

      stages = await prisma.stage.findMany({
        where: { idEtudiant: etudiant.idEtudiant },
        orderBy: { idStage: 'desc' }
      });
    } else {
      // Admin ou enseignant
      stages = await prisma.stage.findMany({
        include: {
          etudiant: {
            include: {
              utilisateur: { select: { nom: true, prenom: true, email: true } },
              filiere: { select: { idFiliere: true, code: true, intitule: true } }
            }
          }
        },
        orderBy: { idStage: 'desc' }
      });
    }

    res.json({
      status: 'success',
      count: stages.length,
      data: stages
    });
  } catch (error) {
    console.error('getMyStages error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des stages' });
  }
};

/**
 * @desc    Update stage convention status or note (Admin only)
 * @route   PATCH /api/stages/:id/statut
 * @access  Private/Admin
 */
const updateStageStatut = async (req, res) => {
  const { id } = req.params;
  const stageId = parseInt(id, 10);

  if (isNaN(stageId) || stageId <= 0) {
    return res.status(400).json({ success: false, error: 'INVALID_ID', message: 'Identifiant de stage invalide' });
  }

  const { conventionStatut, noteStage, rapportDepose } = req.body;

  if (conventionStatut !== undefined && !ALLOWED_STATUTS.includes(conventionStatut)) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_STATUS',
      message: `Statut invalide. Statuts acceptés: ${ALLOWED_STATUTS.join(', ')}`
    });
  }

  let parsedNote = undefined;
  if (noteStage !== undefined && noteStage !== null) {
    parsedNote = parseFloat(noteStage);
    if (isNaN(parsedNote) || parsedNote < 0 || parsedNote > 20) {
      return res.status(400).json({ success: false, error: 'INVALID_GRADE', message: 'La note de stage doit être un nombre compris entre 0 et 20' });
    }
  }

  try {
    const existing = await prisma.stage.findUnique({
      where: { idStage: stageId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'STAGE_NOT_FOUND', message: 'Stage introuvable' });
    }

    const updated = await prisma.stage.update({
      where: { idStage: stageId },
      data: {
        conventionStatut: conventionStatut ? conventionStatut.trim() : undefined,
        noteStage: parsedNote,
        rapportDepose: rapportDepose !== undefined ? Boolean(rapportDepose) : undefined
      },
      include: {
        etudiant: {
          include: {
            utilisateur: { select: { nom: true, prenom: true, email: true } }
          }
        }
      }
    });

    res.json({
      status: 'success',
      data: updated
    });
  } catch (error) {
    console.error('updateStageStatut error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du stage' });
  }
};

module.exports = {
  getAllStages,
  requestStage,
  getMyStages,
  updateStageStatut
};
