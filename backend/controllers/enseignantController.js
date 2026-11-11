const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');

/**
 * @desc    Get all teachers with user profiles
 * @route   GET /api/enseignants
 * @access  Private
 */
const getEnseignants = async (req, res) => {
  try {
    const enseignants = await prisma.enseignant.findMany({
      include: {
        utilisateur: {
          select: { id: true, nom: true, prenom: true, email: true, role: true, statut: true }
        },
        affectations: {
          include: { module: true }
        }
      }
    });

    res.json({
      status: 'success',
      data: enseignants
    });
  } catch (error) {
    console.error('getEnseignants error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Smart Enrollment (Create User + Enseignant)
 * @route   POST /api/enseignants
 * @access  Private/Admin
 */
const createEnseignant = async (req, res) => {
  const { nom, prenom, email, matricule, grade, specialite, type, volumeHoraireBase, password } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const hashedPassword = await bcrypt.hash(password || 'prof123', 10);
      const user = await tx.utilisateur.create({
        data: {
          nom,
          prenom,
          email,
          motDePasse: hashedPassword,
          role: 'teacher'
        }
      });

      // 2. Create Enseignant
      const enseignant = await tx.enseignant.create({
        data: {
          utilisateurId: user.id,
          matricule,
          grade,
          specialite,
          type: type || 'PERMANENT',
          volumeHoraireBase: volumeHoraireBase ? parseInt(volumeHoraireBase) : 190,
          statut: 'ACTIF'
        }
      });

      return { user, enseignant };
    });

    res.status(201).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Conflict: Email or Matricule already exists' });
    }
    console.error('createEnseignant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update Teacher Profile & User data
 * @route   PATCH /api/enseignants/:id
 * @access  Private/Admin
 */
const updateEnseignant = async (req, res) => {
  const { id } = req.params;
  const { nom, prenom, email, matricule, grade, specialite, statut, type, volumeHoraireBase } = req.body;

  try {
    const enseignant = await prisma.enseignant.findUnique({ where: { idEnseignant: parseInt(id) } });
    if (!enseignant) return res.status(404).json({ message: 'Teacher not found' });

    const result = await prisma.$transaction(async (tx) => {
      // Update User
      await tx.utilisateur.update({
        where: { id: enseignant.utilisateurId },
        data: { nom, prenom, email }
      });

      // Update Enseignant
      const updatedEnseignant = await tx.enseignant.update({
        where: { idEnseignant: parseInt(id) },
        data: {
          matricule,
          grade,
          specialite,
          statut,
          type,
          volumeHoraireBase: volumeHoraireBase ? parseInt(volumeHoraireBase) : undefined
        }
      });

      return updatedEnseignant;
    });

    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('updateEnseignant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Delete Teacher
 * @route   DELETE /api/enseignants/:id
 * @access  Private/Admin
 */
const deleteEnseignant = async (req, res) => {
  const { id } = req.params;

  try {
    const enseignant = await prisma.enseignant.findUnique({ where: { idEnseignant: parseInt(id) } });
    if (!enseignant) return res.status(404).json({ message: 'Teacher not found' });

    await prisma.$transaction(async (tx) => {
      // Delete associated data
      await tx.affectation.deleteMany({ where: { idEnseignant: parseInt(id) } });
      await tx.seance.deleteMany({ where: { idEnseignant: parseInt(id) } });
      
      // Delete Enseignant
      await tx.enseignant.delete({ where: { idEnseignant: parseInt(id) } });
      
      // Delete User
      await tx.utilisateur.delete({ where: { id: enseignant.utilisateurId } });
    });

    res.json({
      status: 'success',
      message: 'Teacher and associated user deleted'
    });
  } catch (error) {
    console.error('deleteEnseignant error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getEnseignants,
  createEnseignant,
  updateEnseignant,
  deleteEnseignant
};
