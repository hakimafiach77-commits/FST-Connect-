const prisma = require('../prismaClient');

/**
 * @desc    Get all filieres with basic stats
 * @route   GET /api/filieres
 * @access  Private
 */
const getFilieres = async (req, res) => {
  try {
    const filieres = await prisma.filiere.findMany({
      include: {
        _count: {
          select: {
            etudiants: true,
            modules: true,
            groupes: true
          }
        }
      }
    });

    res.json({
      status: 'success',
      data: filieres
    });
  } catch (error) {
    console.error('getFilieres error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Create a new filiere
 * @route   POST /api/filieres
 * @access  Private/Admin
 */
const createFiliere = async (req, res) => {
  const { code, intitule, niveauEtude, nombreSemestres, duree } = req.body;

  try {
    const filiere = await prisma.filiere.create({
      data: {
        code,
        intitule,
        niveauEtude: niveauEtude || "Cycle d'Ingénieur",
        nombreSemestres: nombreSemestres ? parseInt(nombreSemestres) : 6,
        duree: duree ? parseInt(duree) : 3
      }
    });

    res.status(201).json({
      status: 'success',
      data: filiere
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Filiere with this code already exists' });
    }
    console.error('createFiliere error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update a filiere
 * @route   PATCH /api/filieres/:id
 * @access  Private/Admin
 */
const updateFiliere = async (req, res) => {
  const { id } = req.params;
  const { code, intitule, niveauEtude, nombreSemestres, duree } = req.body;

  try {
    const filiere = await prisma.filiere.update({
      where: { idFiliere: parseInt(id) },
      data: {
        code,
        intitule,
        ...(niveauEtude     !== undefined && { niveauEtude }),
        ...(nombreSemestres !== undefined && { nombreSemestres: parseInt(nombreSemestres) }),
        ...(duree           !== undefined && { duree: parseInt(duree) })
      }
    });

    res.json({
      status: 'success',
      data: filiere
    });
  } catch (error) {
    console.error('updateFiliere error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Delete a filiere
 * @route   DELETE /api/filieres/:id
 * @access  Private/Admin
 */
const deleteFiliere = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if students are enrolled
    const studentCount = await prisma.etudiant.count({
      where: { idFiliere: parseInt(id) }
    });

    if (studentCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete filiere with enrolled students' 
      });
    }

    await prisma.filiere.delete({
      where: { idFiliere: parseInt(id) }
    });

    res.json({
      status: 'success',
      message: 'Filiere deleted'
    });
  } catch (error) {
    console.error('deleteFiliere error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getFilieres,
  createFiliere,
  updateFiliere,
  deleteFiliere
};
