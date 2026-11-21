const prisma = require('../prismaClient');

/**
 * Helper to check if a teacher is assigned to or responsible for a given module
 */
const isTeacherAssignedToModule = async (utilisateurId, idModule) => {
  const enseignant = await prisma.enseignant.findUnique({
    where: { utilisateurId },
    select: { idEnseignant: true }
  });

  if (!enseignant) return false;

  // 1. Affectation directe au module
  const affectation = await prisma.affectation.findFirst({
    where: {
      idEnseignant: enseignant.idEnseignant,
      idModule
    }
  });
  if (affectation) return true;

  // 2. Responsable officiel du module
  const moduleRecord = await prisma.module.findUnique({
    where: { idModule },
    select: { idResponsable: true }
  });
  if (moduleRecord && moduleRecord.idResponsable === enseignant.idEnseignant) {
    return true;
  }

  return false;
};

/**
 * @desc    Get list of exams with optional filters
 * @route   GET /api/examens
 * @access  Private
 */
const getExamens = async (req, res) => {
  const { idModule, type, date } = req.query;

  try {
    const where = {};

    if (idModule) {
      const parsedModId = parseInt(idModule, 10);
      if (!isNaN(parsedModId)) where.idModule = parsedModId;
    }

    if (type && typeof type === 'string') {
      where.type = type.trim();
    }

    if (date) {
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        where.date = d;
      }
    }

    // Si rôle étudiant, limiter strictement aux modules de sa filière
    if (req.user.role === 'student') {
      const etudiant = await prisma.etudiant.findUnique({
        where: { utilisateurId: req.user.id },
        select: { idFiliere: true }
      });
      if (etudiant && etudiant.idFiliere) {
        where.module = { idFiliere: etudiant.idFiliere };
      } else {
        return res.json({ status: 'success', count: 0, data: [] });
      }
    }

    const examens = await prisma.examen.findMany({
      where,
      include: {
        module: {
          select: {
            idModule: true,
            code: true,
            intitule: true,
            filiere: { select: { idFiliere: true, code: true, intitule: true } }
          }
        },
        salle: {
          select: { idSalle: true, nom: true, capaciteMax: true, type: true }
        },
        _count: {
          select: { notes: true }
        }
      },
      orderBy: [{ date: 'asc' }, { heure: 'asc' }]
    });

    res.json({
      status: 'success',
      count: examens.length,
      data: examens
    });
  } catch (error) {
    console.error('getExamens error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des examens' });
  }
};

/**
 * @desc    Get single exam details
 * @route   GET /api/examens/:id
 * @access  Private
 */
const getExamenById = async (req, res) => {
  const { id } = req.params;
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId) || parsedId <= 0) {
    return res.status(400).json({ success: false, error: 'INVALID_ID', message: 'Identifiant d\'examen invalide' });
  }

  try {
    const examen = await prisma.examen.findUnique({
      where: { idExamen: parsedId },
      include: {
        module: {
          include: {
            filiere: true,
            responsable: {
              include: { utilisateur: { select: { nom: true, prenom: true, email: true } } }
            }
          }
        },
        salle: true,
        _count: {
          select: { notes: true }
        }
      }
    });

    if (!examen) {
      return res.status(404).json({ success: false, error: 'EXAMEN_NOT_FOUND', message: 'Examen introuvable' });
    }

    // Protection anti-fuite : un étudiant ne peut consulter que les examens de sa filière
    if (req.user.role === 'student') {
      const etudiant = await prisma.etudiant.findUnique({
        where: { utilisateurId: req.user.id },
        select: { idFiliere: true }
      });
      if (!etudiant || !etudiant.idFiliere || examen.module?.idFiliere !== etudiant.idFiliere) {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Accès non autorisé : cet examen ne concerne pas votre filière'
        });
      }
    }

    res.json({
      status: 'success',
      data: examen
    });
  } catch (error) {
    console.error('getExamenById error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * @desc    Create a new exam (Admin & Teacher assigned to module)
 * @route   POST /api/examens
 * @access  Private/Admin, Teacher
 */
const createExamen = async (req, res) => {
  const { type, date, heure, idSalle, idModule } = req.body;

  if (!type || typeof type !== 'string' || !type.trim()) {
    return res.status(400).json({ success: false, error: 'TYPE_REQUIRED', message: 'Le type d\'examen est obligatoire (ex: CC, EF, RATTRAPAGE)' });
  }

  if (!date) {
    return res.status(400).json({ success: false, error: 'DATE_REQUIRED', message: 'La date de l\'examen est obligatoire' });
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({ success: false, error: 'INVALID_DATE', message: 'Format de date invalide' });
  }

  if (!heure || typeof heure !== 'string' || !heure.trim()) {
    return res.status(400).json({ success: false, error: 'HEURE_REQUIRED', message: 'L\'heure de l\'examen est obligatoire (ex: 08:30)' });
  }

  const parsedModuleId = parseInt(idModule, 10);
  if (isNaN(parsedModuleId) || parsedModuleId <= 0) {
    return res.status(400).json({ success: false, error: 'INVALID_MODULE_ID', message: 'Identifiant de module manquant ou invalide' });
  }

  try {
    const moduleExists = await prisma.module.findUnique({
      where: { idModule: parsedModuleId }
    });

    if (!moduleExists) {
      return res.status(404).json({ success: false, error: 'MODULE_NOT_FOUND', message: 'Module introuvable' });
    }

    // RBAC Enseignant : vérification stricte de l'affectation ou de la responsabilité du module
    if (req.user.role === 'teacher') {
      const hasAccess = await isTeacherAssignedToModule(req.user.id, parsedModuleId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Non autorisé : vous n\'êtes pas affecté à ce module d\'enseignement'
        });
      }
    }

    let parsedSalleId = null;
    if (idSalle !== undefined && idSalle !== null) {
      parsedSalleId = parseInt(idSalle, 10);
      if (isNaN(parsedSalleId) || parsedSalleId <= 0) {
        return res.status(400).json({ success: false, error: 'INVALID_SALLE_ID', message: 'Identifiant de salle invalide' });
      }
      const salleExists = await prisma.salle.findUnique({
        where: { idSalle: parsedSalleId }
      });
      if (!salleExists) {
        return res.status(404).json({ success: false, error: 'SALLE_NOT_FOUND', message: 'Salle introuvable' });
      }
    }

    const examen = await prisma.examen.create({
      data: {
        type: type.trim(),
        date: parsedDate,
        heure: heure.trim(),
        idModule: parsedModuleId,
        idSalle: parsedSalleId
      },
      include: {
        module: { select: { idModule: true, code: true, intitule: true } },
        salle: { select: { idSalle: true, nom: true } }
      }
    });

    res.status(201).json({
      status: 'success',
      data: examen
    });
  } catch (error) {
    console.error('createExamen error:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'examen' });
  }
};

/**
 * @desc    Update an exam (Admin & Teacher assigned to module)
 * @route   PATCH /api/examens/:id
 * @access  Private/Admin, Teacher
 */
const updateExamen = async (req, res) => {
  const { id } = req.params;
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId) || parsedId <= 0) {
    return res.status(400).json({ success: false, error: 'INVALID_ID', message: 'Identifiant d\'examen invalide' });
  }

  const { type, date, heure, idSalle, idModule } = req.body;

  try {
    const existing = await prisma.examen.findUnique({
      where: { idExamen: parsedId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'EXAMEN_NOT_FOUND', message: 'Examen introuvable' });
    }

    // RBAC Enseignant : vérification de l'affectation sur le module actuel de l'examen
    if (req.user.role === 'teacher') {
      const hasCurrentAccess = await isTeacherAssignedToModule(req.user.id, existing.idModule);
      if (!hasCurrentAccess) {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Non autorisé : vous n\'êtes pas affecté au module de cet examen'
        });
      }
    }

    let parsedModuleId = undefined;
    if (idModule !== undefined) {
      parsedModuleId = parseInt(idModule, 10);
      if (isNaN(parsedModuleId) || parsedModuleId <= 0) {
        return res.status(400).json({ success: false, error: 'INVALID_MODULE_ID', message: 'Identifiant de module invalide' });
      }
      const modExists = await prisma.module.findUnique({ where: { idModule: parsedModuleId } });
      if (!modExists) {
        return res.status(404).json({ success: false, error: 'MODULE_NOT_FOUND', message: 'Module introuvable' });
      }

      // Si changement de module par un enseignant : doit également être affecté au nouveau module
      if (req.user.role === 'teacher' && parsedModuleId !== existing.idModule) {
        const hasNewAccess = await isTeacherAssignedToModule(req.user.id, parsedModuleId);
        if (!hasNewAccess) {
          return res.status(403).json({
            success: false,
            error: 'FORBIDDEN',
            message: 'Non autorisé : vous n\'êtes pas affecté au nouveau module spécifié'
          });
        }
      }
    }

    let parsedSalleId = undefined;
    if (idSalle !== undefined) {
      if (idSalle === null) {
        parsedSalleId = null;
      } else {
        parsedSalleId = parseInt(idSalle, 10);
        if (isNaN(parsedSalleId) || parsedSalleId <= 0) {
          return res.status(400).json({ success: false, error: 'INVALID_SALLE_ID', message: 'Identifiant de salle invalide' });
        }
        const salExists = await prisma.salle.findUnique({ where: { idSalle: parsedSalleId } });
        if (!salExists) {
          return res.status(404).json({ success: false, error: 'SALLE_NOT_FOUND', message: 'Salle introuvable' });
        }
      }
    }

    let parsedDate = undefined;
    if (date !== undefined) {
      parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ success: false, error: 'INVALID_DATE', message: 'Format de date invalide' });
      }
    }

    const updated = await prisma.examen.update({
      where: { idExamen: parsedId },
      data: {
        type: type && typeof type === 'string' && type.trim() ? type.trim() : undefined,
        date: parsedDate,
        heure: heure && typeof heure === 'string' && heure.trim() ? heure.trim() : undefined,
        idModule: parsedModuleId,
        idSalle: parsedSalleId
      },
      include: {
        module: { select: { idModule: true, code: true, intitule: true } },
        salle: { select: { idSalle: true, nom: true } }
      }
    });

    res.json({
      status: 'success',
      data: updated
    });
  } catch (error) {
    console.error('updateExamen error:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'examen' });
  }
};

/**
 * @desc    Delete an exam (Admin only - Protected against deleting exams with notes)
 * @route   DELETE /api/examens/:id
 * @access  Private/Admin
 */
const deleteExamen = async (req, res) => {
  const { id } = req.params;
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId) || parsedId <= 0) {
    return res.status(400).json({ success: false, error: 'INVALID_ID', message: 'Identifiant d\'examen invalide' });
  }

  try {
    const existing = await prisma.examen.findUnique({
      where: { idExamen: parsedId },
      include: {
        _count: { select: { notes: true } }
      }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'EXAMEN_NOT_FOUND', message: 'Examen introuvable' });
    }

    // Garde-fou d'intégrité : blocage si des notes sont rattachées
    if (existing._count.notes > 0) {
      return res.status(400).json({
        success: false,
        error: 'EXAMEN_HAS_NOTES',
        message: `Suppression impossible : cet examen possède déjà ${existing._count.notes} note(s) saisie(s)`
      });
    }

    await prisma.examen.delete({
      where: { idExamen: parsedId }
    });

    res.json({
      status: 'success',
      message: 'Examen supprimé'
    });
  } catch (error) {
    console.error('deleteExamen error:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'examen' });
  }
};

module.exports = {
  getExamens,
  getExamenById,
  createExamen,
  updateExamen,
  deleteExamen
};
