const prisma = require('../prismaClient');

/**
 * @desc    Create a jury and assign members/PFEs (Admin only)
 * @route   POST /api/juries
 * @access  Private/Admin
 */
const createJury = async (req, res) => {
  const { dateSoutenance, idEnseignants, idPFEs } = req.body;

  try {
    const jury = await prisma.jury.create({
      data: {
        dateSoutenance: new Date(dateSoutenance),
        membresEnseignants: {
          connect: idEnseignants.map(id => ({ idEnseignant: id }))
        },
        pfes: {
          connect: idPFEs.map(id => ({ idPG: id }))
        }
      },
      include: { membresEnseignants: true, pfes: true }
    });

    res.status(201).json({
      status: 'success',
      data: jury
    });
  } catch (error) {
    console.error('createJury error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get all juries
 * @route   GET /api/juries
 * @access  Private
 */
const getJuries = async (req, res) => {
  try {
    const juries = await prisma.jury.findMany({
      include: {
        membresEnseignants: { include: { utilisateur: true } },
        pfes: { include: { etudiant: { include: { utilisateur: true } } } }
      }
    });

    res.json({
      status: 'success',
      data: juries
    });
  } catch (error) {
    console.error('getJuries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createJury,
  getJuries
};
