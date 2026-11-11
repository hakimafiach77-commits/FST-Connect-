const prisma = require('../prismaClient');

/**
 * @desc    Get all external formations with their partners
 * @route   GET /api/formations
 * @access  Private
 */
const getFormations = async (req, res) => {
  try {
    const formations = await prisma.formation.findMany({
      where: { statut: 'OUVERTE' },
      include: {
        collaborateur: true,
        _count: { select: { inscriptions: true } }
      }
    });

    res.json({
      status: 'success',
      data: formations
    });
  } catch (error) {
    console.error('getFormations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get single formation with details
 * @route   GET /api/formations/:id
 * @access  Private
 */
const getFormationDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const formation = await prisma.formation.findUnique({
      where: { idFormation: parseInt(id) },
      include: {
        collaborateur: true,
        inscriptions: {
          include: { utilisateur: { select: { nom: true, prenom: true } } }
        }
      }
    });

    if (!formation) {
      return res.status(404).json({ message: 'Formation not found' });
    }

    res.json({
      status: 'success',
      data: formation
    });
  } catch (error) {
    console.error('getFormationDetails error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getFormations,
  getFormationDetails
};
