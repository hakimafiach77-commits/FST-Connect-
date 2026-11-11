const prisma = require('../prismaClient');

/**
 * @desc    Propose a new PFE (Student only)
 * @route   POST /api/pfe/propose
 * @access  Private/Student
 */
const proposePFE = async (req, res) => {
  const { titre, description } = req.body;

  try {
    // 1. Get student profile
    const etudiant = await prisma.etudiant.findUnique({
      where: { utilisateurId: req.user.id }
    });

    if (!etudiant) return res.status(404).json({ message: 'Student profile not found' });

    // 2. Check if already has a PFE
    const existingPFE = await prisma.pfe.findFirst({
      where: { idEtudiant: etudiant.idEtudiant }
    });

    if (existingPFE) return res.status(400).json({ message: 'You have already proposed a project' });

    // 3. Create PFE
    const pfe = await prisma.pfe.create({
      data: {
        idEtudiant: etudiant.idEtudiant,
        titre,
        description,
        statut: 'PROPOSE'
      }
    });

    res.status(201).json({
      status: 'success',
      data: pfe
    });
  } catch (error) {
    console.error('proposePFE error:', error);
    res.status(500).json({ message: 'Server error' });
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
      pfe = await prisma.pfe.findFirst({
        where: { idEtudiant: etudiant.idEtudiant },
        include: { encadrant: { include: { utilisateur: true } }, jury: true }
      });
    } 
    else if (role === 'teacher') {
      const enseignant = await prisma.enseignant.findUnique({
        where: { utilisateurId: id }
      });
      pfe = await prisma.pfe.findMany({
        where: { idEncadrant: enseignant.idEnseignant },
        include: { etudiant: { include: { utilisateur: true } }, jury: true }
      });
    }

    res.json({
      status: 'success',
      data: pfe
    });
  } catch (error) {
    console.error('getMyPFE error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Assign encadrant to PFE (Admin only)
 * @route   PATCH /api/pfe/assign
 * @access  Private/Admin
 */
const assignEncadrant = async (req, res) => {
  const { idPFE, idEncadrant } = req.body;

  try {
    const pfe = await prisma.pfe.update({
      where: { idPG: idPFE },
      data: {
        idEncadrant,
        statut: 'EN_COURS'
      }
    });

    res.json({
      status: 'success',
      data: pfe
    });
  } catch (error) {
    console.error('assignEncadrant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update PFE Status or Details (Admin/Encadrant)
 * @route   PATCH /api/pfe/:id
 * @access  Private
 */
const updatePFE = async (req, res) => {
  const { id } = req.params;
  const { titre, description, statut, idJury, dateSoutenance, avisEncadrant } = req.body;

  try {
    const pfe = await prisma.pfe.update({
      where: { idPG: parseInt(id) },
      data: {
        titre,
        description,
        statut,
        idJury: idJury ? parseInt(idJury) : undefined,
        dateSoutenance: dateSoutenance ? new Date(dateSoutenance) : undefined,
        avisEncadrant
      }
    });

    res.json({
      status: 'success',
      data: pfe
    });
  } catch (error) {
    console.error('updatePFE error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Record Final PFE Grade
 * @route   PATCH /api/pfe/:id/grade
 * @access  Private/Admin
 */
const setFinalGrade = async (req, res) => {
  const { id } = req.params;
  const { noteFinale } = req.body;

  try {
    const pfe = await prisma.pfe.update({
      where: { idPG: parseInt(id) },
      data: {
        noteFinale: parseFloat(noteFinale),
        statut: 'SOUTENU'
      }
    });

    res.json({
      status: 'success',
      data: pfe
    });
  } catch (error) {
    console.error('setFinalGrade error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  proposePFE,
  getMyPFE,
  assignEncadrant,
  updatePFE,
  setFinalGrade
};
