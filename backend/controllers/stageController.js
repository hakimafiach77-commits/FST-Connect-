const prisma = require('../prismaClient');

/**
 * @desc    Request a new internship convention (Student only)
 * @route   POST /api/stages/request
 * @access  Private/Student
 */
const requestStage = async (req, res) => {
  const { entreprise, dateDebut, dateFin, lieu, encadrantEntreprise, sujet } = req.body;

  try {
    const etudiant = await prisma.etudiant.findUnique({
      where: { utilisateurId: req.user.id }
    });

    if (!etudiant) return res.status(404).json({ message: 'Etudiant non trouvé' });

    const stage = await prisma.stage.create({
      data: {
        idEtudiant: etudiant.idEtudiant,
        entreprise,
        lieu,
        encadrantEntreprise,
        sujet,
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        conventionStatut: 'SOLICITEE'
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
      stages = await prisma.stage.findMany({
        where: { idEtudiant: etudiant.idEtudiant }
      });
    } else {
      stages = await prisma.stage.findMany({
        include: { etudiant: { include: { utilisateur: true } } }
      });
    }

    res.json({
      status: 'success',
      data: stages
    });
  } catch (error) {
    console.error('getMyStages error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des stages' });
  }
};

module.exports = {
  requestStage,
  getMyStages
};
