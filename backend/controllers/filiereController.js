const prisma = require('../prismaClient');

const parseIdStrict = (val) => {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  if (!/^\d+$/.test(s)) return null;
  const n = parseInt(s, 10);
  if (n <= 0 || !Number.isSafeInteger(n)) return null;
  return n;
};

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

  const filiereId = parseIdStrict(id);
  if (!filiereId) {
    return res.status(400).json({
      message: 'Identifiant de filière invalide.',
      code: 'INVALID_FILIERE_ID'
    });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Verrouillage exclusif FOR UPDATE sur la filière parente
      const rows = await tx.$queryRaw`
        SELECT "idFiliere" FROM "Filiere" WHERE "idFiliere" = ${filiereId} FOR UPDATE
      `;
      if (!rows || rows.length === 0) {
        const err = new Error('FILIERE_NOT_FOUND');
        err.statusCode = 404;
        throw err;
      }

      // 2. Compter toutes les dépendances dans la même transaction
      const [studentsCount, modulesCount, groupesCount, documentsCount, edtsCount] = await Promise.all([
        tx.etudiant.count({ where: { idFiliere: filiereId } }),
        tx.module.count({ where: { idFiliere: filiereId } }),
        tx.groupe.count({ where: { idFiliere: filiereId } }),
        tx.document.count({ where: { idFiliere: filiereId } }),
        tx.edt.count({ where: { idFiliere: filiereId } })
      ]);

      if (studentsCount > 0) {
        const err = new Error('FILIERE_HAS_STUDENTS');
        err.detail = `Cette filière possède ${studentsCount} étudiant(s) inscrit(s).`;
        throw err;
      }
      if (modulesCount > 0) {
        const err = new Error('FILIERE_HAS_MODULES');
        err.detail = `Cette filière possède ${modulesCount} module(s) associé(s).`;
        throw err;
      }
      if (groupesCount > 0) {
        const err = new Error('FILIERE_HAS_GROUPES');
        err.detail = `Cette filière possède ${groupesCount} groupe(s) associé(s).`;
        throw err;
      }
      if (documentsCount > 0) {
        const err = new Error('FILIERE_HAS_DOCUMENTS');
        err.detail = `Cette filière possède ${documentsCount} document(s) associé(s).`;
        throw err;
      }
      if (edtsCount > 0) {
        const err = new Error('FILIERE_HAS_EDTS');
        err.detail = `Cette filière possède ${edtsCount} emploi(s) du temps associé(s).`;
        throw err;
      }

      // 3. Suppression sécurisée
      await tx.filiere.delete({ where: { idFiliere: filiereId } });
    });

    res.json({
      status: 'success',
      message: 'Filière supprimée.'
    });
  } catch (error) {
    if (error.message === 'FILIERE_NOT_FOUND') {
      return res.status(404).json({ message: 'Filière introuvable.', code: 'FILIERE_NOT_FOUND' });
    }
    if (['FILIERE_HAS_STUDENTS','FILIERE_HAS_MODULES','FILIERE_HAS_GROUPES',
         'FILIERE_HAS_DOCUMENTS','FILIERE_HAS_EDTS'].includes(error.message)) {
      return res.status(400).json({
        message: error.detail || 'Suppression impossible : dépendances existantes.',
        code: error.message
      });
    }
    console.error('deleteFiliere error:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = {
  getFilieres,
  createFiliere,
  updateFiliere,
  deleteFiliere
};
