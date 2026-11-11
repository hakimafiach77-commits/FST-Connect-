const prisma = require('../prismaClient');

/**
 * @desc    Get modules for the current user
 * @route   GET /api/modules
 * @access  Private
 */
const getModules = async (req, res) => {
  const { id, role } = req.user;

  try {
    let modules = [];

    if (role === 'student') {
      const etudiant = await prisma.etudiant.findUnique({
        where: { utilisateurId: id },
        select: { idFiliere: true }
      });

      if (!etudiant || !etudiant.idFiliere) {
        return res.status(404).json({ message: 'Student academic data not found' });
      }

      modules = await prisma.module.findMany({
        where: { idFiliere: etudiant.idFiliere },
        include: {
          _count: { select: { documents: true, examens: true } }
        }
      });
    }
    else if (role === 'teacher') {
      const enseignant = await prisma.enseignant.findUnique({
        where: { utilisateurId: id },
        select: { idEnseignant: true }
      });

      if (!enseignant) return res.status(404).json({ message: 'Teacher profile not found' });

      const affectations = await prisma.affectation.findMany({
        where: { idEnseignant: enseignant.idEnseignant },
        include: {
          module: {
            include: {
              _count: { select: { documents: true, examens: true } }
            }
          }
        }
      });

      modules = affectations.map(a => a.module);
    }
    else if (role === 'admin') {
      modules = await prisma.module.findMany({
        include: { filiere: true, affectations: { include: { enseignant: { include: { utilisateur: true } } } } }
      });
    }

    res.json({
      status: 'success',
      data: modules
    });

  } catch (error) {
    console.error('getModules error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get single module with documents
 * @route   GET /api/modules/:id
 * @access  Private
 */
const getModuleDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const module = await prisma.module.findUnique({
      where: { idModule: parseInt(id) },
      include: {
        documents: true,
        examens: true,
        affectations: {
          include: {
            enseignant: {
              include: { utilisateur: { select: { nom: true, prenom: true, email: true } } }
            }
          }
        }
      }
    });

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    res.json({
      status: 'success',
      data: module
    });
  } catch (error) {
    console.error('getModuleDetails error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Create Module
 * @route   POST /api/modules
 * @access  Private/Admin
 */
const createModule = async (req, res) => {
  const { code, intitule, idFiliere, coefficient, semestre, idResponsable } = req.body;

  try {
    const module = await prisma.$transaction(async (tx) => {
      const m = await tx.module.create({
        data: {
          code,
          intitule,
          idFiliere: parseInt(idFiliere),
          coefficient: parseFloat(coefficient),
          semestre,
          idResponsable: idResponsable ? parseInt(idResponsable) : null
        }
      });

      if (idResponsable) {
        await tx.affectation.create({
          data: {
            idModule: m.idModule,
            idEnseignant: parseInt(idResponsable),
            typeIntervention: 'CM',
            heuresAssignees: 48
          }
        });
      }
      return m;
    });

    res.status(201).json({ status: 'success', data: module });
  } catch (error) {
    console.error('createModule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update Module
 * @route   PATCH /api/modules/:id
 * @access  Private/Admin
 */
const updateModule = async (req, res) => {
  const { id } = req.params;
  const { code, intitule, idFiliere, coefficient, semestre, idResponsable } = req.body;

  try {
    const module = await prisma.$transaction(async (tx) => {
      const m = await tx.module.update({
        where: { idModule: parseInt(id) },
        data: {
          code,
          intitule,
          idFiliere: idFiliere ? parseInt(idFiliere) : undefined,
          coefficient: coefficient ? parseFloat(coefficient) : undefined,
          semestre,
          idResponsable: idResponsable ? parseInt(idResponsable) : undefined
        }
      });

      if (idResponsable) {
        // Simple logic: update or create one CM affectation
        const existing = await tx.affectation.findFirst({
          where: { idModule: parseInt(id), typeIntervention: 'CM' }
        });

        if (existing) {
          await tx.affectation.update({
            where: { idAffectation: existing.idAffectation },
            data: { idEnseignant: parseInt(idResponsable) }
          });
        } else {
          await tx.affectation.create({
            data: {
              idModule: m.idModule,
              idEnseignant: parseInt(idResponsable),
              typeIntervention: 'CM',
              heuresAssignees: 48
            }
          });
        }
      }
      return m;
    });

    res.json({ status: 'success', data: module });
  } catch (error) {
    console.error('updateModule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Delete Module
 * @route   DELETE /api/modules/:id
 * @access  Private/Admin
 */
const deleteModule = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.affectation.deleteMany({ where: { idModule: parseInt(id) } });
      await tx.seance.deleteMany({ where: { idModule: parseInt(id) } });
      await tx.note.deleteMany({ where: { idModule: parseInt(id) } });
      await tx.examen.deleteMany({ where: { idModule: parseInt(id) } });
      await tx.document.deleteMany({ where: { idModule: parseInt(id) } });
      await tx.module.delete({ where: { idModule: parseInt(id) } });
    });

    res.json({ status: 'success', message: 'Module deleted' });
  } catch (error) {
    console.error('deleteModule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getModules,
  getModuleDetails,
  createModule,
  updateModule,
  deleteModule
};
