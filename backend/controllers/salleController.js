const prisma = require('../prismaClient');

/**
 * @desc    Get all rooms
 * @route   GET /api/salles
 * @access  Private
 */
const getSalles = async (req, res) => {
  try {
    const salles = await prisma.salle.findMany({
      include: {
        _count: {
          select: { seances: true, examens: true }
        }
      }
    });

    res.json({
      status: 'success',
      data: salles
    });
  } catch (error) {
    console.error('getSalles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Create a new room
 * @route   POST /api/salles
 * @access  Private/Admin
 */
const createSalle = async (req, res) => {
  const { nom, type, capaciteMax, statut } = req.body;

  try {
    const salle = await prisma.salle.create({
      data: {
        nom,
        type: type || 'Cours',
        capaciteMax: parseInt(capaciteMax) || 40,
        statut: statut || 'Disponible'
      }
    });

    res.status(201).json({
      status: 'success',
      data: salle
    });
  } catch (error) {
    console.error('createSalle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update a room
 * @route   PATCH /api/salles/:id
 * @access  Private/Admin
 */
const updateSalle = async (req, res) => {
  const { id } = req.params;
  const { nom, type, capaciteMax, statut } = req.body;

  try {
    const updateData = {};
    if (nom !== undefined) updateData.nom = nom;
    if (type !== undefined) updateData.type = type;
    if (capaciteMax !== undefined) updateData.capaciteMax = parseInt(capaciteMax);
    if (statut !== undefined) updateData.statut = statut;

    const salle = await prisma.salle.update({
      where: { idSalle: parseInt(id) },
      data: updateData
    });

    res.json({
      status: 'success',
      data: salle
    });
  } catch (error) {
    console.error('updateSalle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Delete a room
 * @route   DELETE /api/salles/:id
 * @access  Private/Admin
 */
const deleteSalle = async (req, res) => {
  const { id } = req.params;

  try {
    // Check for dependencies (seances)
    const seanceCount = await prisma.seance.count({
      where: { idSalle: parseInt(id) }
    });

    if (seanceCount > 0) {
      return res.status(400).json({ message: 'Cannot delete room with scheduled sessions' });
    }

    await prisma.salle.delete({
      where: { idSalle: parseInt(id) }
    });

    res.json({
      status: 'success',
      message: 'Room deleted'
    });
  } catch (error) {
    console.error('deleteSalle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getSalles,
  createSalle,
  updateSalle,
  deleteSalle
};
