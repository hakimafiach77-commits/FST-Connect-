const prisma = require('../prismaClient');

/**
 * @desc    Get all PFEs (Admin & Teachers)
 * @route   GET /api/pfe
 * @access  Private/Admin, Teacher
 */
const getAllPFE = async (req, res) => {
  const { statut } = req.query;

  try {
    const where = {};
    if (statut && typeof statut === 'string') {
      where.statut = statut.trim();
    }

    const pfes = await prisma.pfe.findMany({
      where,
      include: {
        etudiant: {
          include: {
            utilisateur: { select: { nom: true, prenom: true, email: true } },
            filiere: { select: { idFiliere: true, code: true, intitule: true } }
          }
        },
        encadrant: {
          include: {
            utilisateur: { select: { nom: true, prenom: true, email: true } }
          }
        },
        jury: true
      },
      orderBy: { idPG: 'desc' }
    });

    res.json({
      status: 'success',
      count: pfes.length,
      data: pfes
    });
  } catch (error) {
    console.error('getAllPFE error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des PFE' });
  }
};

/**
 * @desc    Propose a new PFE (Student only)
 * @route   POST /api/pfe/propose
 * @access  Private/Student
 */
const proposePFE = async (req, res) => {
  const { titre, description } = req.body;

  if (!titre || typeof titre !== 'string' || !titre.trim()) {
    return res.status(400).json({ success: false, error: 'TITLE_REQUIRED', message: 'Le titre du projet PFE est obligatoire' });
  }

  try {
    const etudiant = await prisma.etudiant.findUnique({
      where: { utilisateurId: req.user.id }
    });

    if (!etudiant) {
      return res.status(404).json({ success: false, error: 'STUDENT_NOT_FOUND', message: 'Profil étudiant introuvable' });
    }

    const existingPFE = await prisma.pfe.findFirst({
      where: { idEtudiant: etudiant.idEtudiant }
    });

    if (existingPFE) {
      return res.status(400).json({ success: false, error: 'PFE_ALREADY_EXISTS', message: 'Vous avez déjà soumis un projet de PFE' });
    }

    const pfe = await prisma.pfe.create({
      data: {
        idEtudiant: etudiant.idEtudiant,
        titre: titre.trim(),
        description: description && typeof description === 'string' ? description.trim() : null,
        statut: 'PROPOSE'
      },
      include: {
        etudiant: {
          include: { utilisateur: { select: { nom: true, prenom: true, email: true } } }
        }
      }
    });

    res.status(201).json({
      status: 'success',
      data: pfe
    });
  } catch (error) {
    console.error('proposePFE error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la proposition du PFE' });
  }
};

/**
 * @desc    Get current user's PFE details
 * @route   GET /api/pfe/me
 * @access  Private
 */
const getMyPFE = async (req, res) => {
  const { id, role } = req.user;

  try {
    let pfe = null;

    if (role === 'student') {
      const etudiant = await prisma.etudiant.findUnique({
        where: { utilisateurId: id }
      });
      if (!etudiant) return res.status(404).json({ message: 'Profil étudiant introuvable' });

      pfe = await prisma.pfe.findFirst({
        where: { idEtudiant: etudiant.idEtudiant },
        include: {
          encadrant: { include: { utilisateur: { select: { nom: true, prenom: true, email: true } } } },
          jury: true
        }
      });
    } else if (role === 'teacher') {
      const enseignant = await prisma.enseignant.findUnique({
        where: { utilisateurId: id }
      });
      if (!enseignant) return res.status(404).json({ message: 'Profil enseignant introuvable' });

      pfe = await prisma.pfe.findMany({
        where: { idEncadrant: enseignant.idEnseignant },
        include: {
          etudiant: { include: { utilisateur: { select: { nom: true, prenom: true, email: true } } } },
          jury: true
        }
      });
    } else if (role === 'admin') {
      // Pour l'administrateur, retourner tous les PFEs
      pfe = await prisma.pfe.findMany({
        include: {
          etudiant: { include: { utilisateur: { select: { nom: true, prenom: true, email: true } } } },
          encadrant: { include: { utilisateur: { select: { nom: true, prenom: true, email: true } } } },
          jury: true
        },
        orderBy: { idPG: 'desc' }
      });
    }

    res.json({
      status: 'success',
      data: pfe
    });
  } catch (error) {
    console.error('getMyPFE error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * @desc    Assign encadrant to PFE (Admin only)
 * @route   PATCH /api/pfe/assign
 * @access  Private/Admin
 */
const assignEncadrant = async (req, res) => {
  const { idPFE, idPG, idEncadrant } = req.body;
  const pfeId = parseInt(idPFE || idPG, 10);
  const encadrantId = parseInt(idEncadrant, 10);

  if (isNaN(pfeId) || pfeId <= 0) {
    return res.status(400).json({ success: false, error: 'INVALID_PFE_ID', message: 'Identifiant PFE invalide ou manquant' });
  }

  if (isNaN(encadrantId) || encadrantId <= 0) {
    return res.status(400).json({ success: false, error: 'INVALID_ENCADRANT_ID', message: 'Identifiant enseignant encadrant invalide ou manquant' });
  }

  try {
    const existingPfe = await prisma.pfe.findUnique({
      where: { idPG: pfeId }
    });
    if (!existingPfe) {
      return res.status(404).json({ success: false, error: 'PFE_NOT_FOUND', message: 'Projet PFE introuvable' });
    }

    const enseignant = await prisma.enseignant.findUnique({
      where: { idEnseignant: encadrantId }
    });
    if (!enseignant) {
      return res.status(404).json({ success: false, error: 'ENSEIGNANT_NOT_FOUND', message: 'Enseignant encadrant introuvable' });
    }

    const pfe = await prisma.pfe.update({
      where: { idPG: pfeId },
      data: {
        idEncadrant: encadrantId,
        statut: 'EN_COURS'
      },
      include: {
        encadrant: { include: { utilisateur: { select: { nom: true, prenom: true, email: true } } } },
        etudiant: { include: { utilisateur: { select: { nom: true, prenom: true, email: true } } } }
      }
    });

    res.json({
      status: 'success',
      data: pfe
    });
  } catch (error) {
    console.error('assignEncadrant error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'affectation de l\'encadrant' });
  }
};

/**
 * @desc    Update PFE Status or Details (Admin or Encadrant - Anti-IDOR)
 * @route   PATCH /api/pfe/:id
 * @access  Private/Admin, Teacher
 */
const updatePFE = async (req, res) => {
  const { id } = req.params;
  const pfeId = parseInt(id, 10);

  if (isNaN(pfeId) || pfeId <= 0) {
    return res.status(400).json({ success: false, error: 'INVALID_ID', message: 'Identifiant PFE invalide' });
  }

  const { titre, description, statut, idJury, dateSoutenance, avisEncadrant } = req.body;

  try {
    const existing = await prisma.pfe.findUnique({
      where: { idPG: pfeId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'PFE_NOT_FOUND', message: 'Projet PFE introuvable' });
    }

    // Anti-IDOR : Si enseignant, vérifier qu'il est bien l'encadrant du PFE
    if (req.user.role === 'teacher') {
      const enseignant = await prisma.enseignant.findUnique({
        where: { utilisateurId: req.user.id }
      });
      if (!enseignant || existing.idEncadrant !== enseignant.idEnseignant) {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Non autorisé à modifier ce PFE (seul l\'encadrant assigné ou un administrateur peut le modifier)'
        });
      }
    }

    let parsedJuryId = undefined;
    if (idJury !== undefined) {
      parsedJuryId = parseInt(idJury, 10);
      if (isNaN(parsedJuryId)) {
        return res.status(400).json({ success: false, error: 'INVALID_JURY_ID', message: 'Identifiant jury invalide' });
      }
      const juryExists = await prisma.jury.findUnique({ where: { idJury: parsedJuryId } });
      if (!juryExists) {
        return res.status(404).json({ success: false, error: 'JURY_NOT_FOUND', message: 'Jury introuvable' });
      }
    }

    const pfe = await prisma.pfe.update({
      where: { idPG: pfeId },
      data: {
        titre: titre && typeof titre === 'string' && titre.trim() ? titre.trim() : undefined,
        description: description && typeof description === 'string' ? description.trim() : undefined,
        statut: statut && typeof statut === 'string' ? statut.trim() : undefined,
        idJury: parsedJuryId,
        dateSoutenance: dateSoutenance ? new Date(dateSoutenance) : undefined,
        avisEncadrant: avisEncadrant && typeof avisEncadrant === 'string' ? avisEncadrant.trim() : undefined
      },
      include: {
        encadrant: { include: { utilisateur: { select: { nom: true, prenom: true } } } },
        etudiant: { include: { utilisateur: { select: { nom: true, prenom: true } } } },
        jury: true
      }
    });

    res.json({
      status: 'success',
      data: pfe
    });
  } catch (error) {
    console.error('updatePFE error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du PFE' });
  }
};

/**
 * @desc    Record Final PFE Grade (Admin only)
 * @route   PATCH /api/pfe/:id/grade
 * @access  Private/Admin
 */
const setFinalGrade = async (req, res) => {
  const { id } = req.params;
  const pfeId = parseInt(id, 10);

  if (isNaN(pfeId) || pfeId <= 0) {
    return res.status(400).json({ success: false, error: 'INVALID_ID', message: 'Identifiant PFE invalide' });
  }

  const { noteFinale } = req.body;
  const grade = parseFloat(noteFinale);

  if (isNaN(grade) || grade < 0 || grade > 20) {
    return res.status(400).json({ success: false, error: 'INVALID_GRADE', message: 'La note finale doit être un nombre valide compris entre 0 et 20' });
  }

  try {
    const existing = await prisma.pfe.findUnique({
      where: { idPG: pfeId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'PFE_NOT_FOUND', message: 'Projet PFE introuvable' });
    }

    const pfe = await prisma.pfe.update({
      where: { idPG: pfeId },
      data: {
        noteFinale: grade,
        statut: 'SOUTENU'
      }
    });

    res.json({
      status: 'success',
      data: pfe
    });
  } catch (error) {
    console.error('setFinalGrade error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la saisie de la note' });
  }
};

module.exports = {
  getAllPFE,
  proposePFE,
  getMyPFE,
  assignEncadrant,
  updatePFE,
  setFinalGrade
};
