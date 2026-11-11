const prisma = require('../prismaClient');

/**
 * @desc    Publish a new announcement (Admin only)
 * @route   POST /api/annonces
 * @access  Private/Admin
 */
const publishAnnonce = async (req, res) => {
  const { titre, contenu, urgent, cible } = req.body;

  try {
    const admin = await prisma.administrateur.findUnique({
      where: { utilisateurId: req.user.id }
    });

    const annonce = await prisma.annonce.create({
      data: {
        titre,
        contenu,
        urgent: urgent || false,
        cible: cible || 'tous',
        idAuteur: req.user.id,
        idAdminAuth: admin ? admin.id : undefined,
        statut: 'PUBLIEE'
      }
    });

    res.status(201).json({
      status: 'success',
      data: annonce
    });
  } catch (error) {
    console.error('publishAnnonce error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get all active announcements
 * @route   GET /api/annonces
 * @access  Public
 */
const getAnnonces = async (req, res) => {
  try {
    const annonces = await prisma.annonce.findMany({
      where: { statut: 'PUBLIEE' },
      orderBy: { dateCreation: 'desc' },
      include: { auteur: { select: { nom: true, prenom: true } } }
    });

    res.json({
      status: 'success',
      data: annonces
    });
  } catch (error) {
    console.error('getAnnonces error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update an announcement (Admin only)
 * @route   PATCH /api/annonces/:id
 * @access  Private/Admin
 */
const updateAnnonce = async (req, res) => {
  const { id } = req.params;
  const { titre, contenu, urgent, cible, statut } = req.body;

  try {
    const updatedAnnonce = await prisma.annonce.update({
      where: { idAnnonce: parseInt(id) },
      data: {
        titre,
        contenu,
        urgent: urgent !== undefined ? urgent : undefined,
        cible,
        statut
      }
    });

    res.json({
      status: 'success',
      data: updatedAnnonce
    });
  } catch (error) {
    console.error('updateAnnonce error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Delete an announcement (Admin only)
 * @route   DELETE /api/annonces/:id
 * @access  Private/Admin
 */
const deleteAnnonce = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.annonce.delete({
      where: { idAnnonce: parseInt(id) }
    });

    res.json({
      status: 'success',
      message: 'Announcement deleted'
    });
  } catch (error) {
    console.error('deleteAnnonce error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  publishAnnonce,
  getAnnonces,
  updateAnnonce,
  deleteAnnonce
};
