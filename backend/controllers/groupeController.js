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
 * @desc    Get all groups by filiere
 * @route   GET /api/groupes
 * @access  Private
 */
const getGroupes = async (req, res) => {
  const { idFiliere } = req.query;

  try {
    const groupes = await prisma.groupe.findMany({
      where: idFiliere ? { idFiliere: parseInt(idFiliere) } : {},
      include: {
        filiere: { select: { code: true, intitule: true } },
        enseignant: { select: { utilisateur: { select: { nom: true, prenom: true } } } },
        etudiantsProjet: true,
        _count: { select: { etudiantsTD: true, etudiantsTP: true, etudiantsProjet: true } }
      }
    });

    res.json({
      status: 'success',
      data: groupes
    });
  } catch (error) {
    console.error('getGroupes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Create a new group
 * @route   POST /api/groupes
 * @access  Private/Admin
 */
const createGroupe = async (req, res) => {
  const { idFiliere, type, capaciteMax, nom, description, annee, idEnseignant, etudiantsIds } = req.body;
  console.log('[DEBUG] createGroupe request:', { idFiliere, type, capaciteMax, nom, description, annee, idEnseignant, etudiantsIds });

  try {
    const groupe = await prisma.groupe.create({
      data: {
        idFiliere: parseInt(idFiliere),
        nom: nom || "Sans nom",
        type: type || "TD",
        capaciteMax: capaciteMax !== undefined ? parseInt(capaciteMax) : 30,
        description,
        annee,
        idEnseignant: idEnseignant ? parseInt(idEnseignant) : null,
        etudiantsProjet: etudiantsIds?.length ? {
          connect: etudiantsIds.map(id => ({ idEtudiant: parseInt(id) }))
        } : undefined
      }
    });

    console.log('[DEBUG] createGroupe success:', groupe);
    res.status(201).json({
      status: 'success',
      data: groupe
    });
  } catch (error) {
    console.error('createGroupe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Delete a group
 * @route   DELETE /api/groupes/:id
 * @access  Private/Admin
 */
const deleteGroupe = async (req, res) => {
  const { id } = req.params;

  const groupeId = parseIdStrict(id);
  if (!groupeId) {
    return res.status(400).json({
      message: 'Identifiant de groupe invalide.',
      code: 'INVALID_GROUPE_ID'
    });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Verrouillage exclusif FOR UPDATE sur le groupe parent
      const rows = await tx.$queryRaw`
        SELECT "idGroupe" FROM "Groupe" WHERE "idGroupe" = ${groupeId} FOR UPDATE
      `;
      if (!rows || rows.length === 0) {
        const err = new Error('GROUPE_NOT_FOUND');
        err.statusCode = 404;
        throw err;
      }

      // 2. Compter toutes les dépendances dans la même transaction
      const [tdCount, tpCount, projetCount, seancesCount, edtsCount] = await Promise.all([
        tx.etudiant.count({ where: { idGroupeTD: groupeId } }),
        tx.etudiant.count({ where: { idGroupeTP: groupeId } }),
        tx.etudiant.count({ where: { idGroupeProjet: groupeId } }),
        tx.seance.count({ where: { idGroupe: groupeId } }),
        tx.edt.count({ where: { idGroupe: groupeId } })
      ]);

      if (tdCount > 0) {
        const err = new Error('GROUPE_HAS_ETUDIANTS_TD');
        err.detail = `Ce groupe possède ${tdCount} étudiant(s) en TD.`;
        throw err;
      }
      if (tpCount > 0) {
        const err = new Error('GROUPE_HAS_ETUDIANTS_TP');
        err.detail = `Ce groupe possède ${tpCount} étudiant(s) en TP.`;
        throw err;
      }
      if (projetCount > 0) {
        const err = new Error('GROUPE_HAS_ETUDIANTS_PROJET');
        err.detail = `Ce groupe possède ${projetCount} étudiant(s) en Projet.`;
        throw err;
      }
      if (seancesCount > 0) {
        const err = new Error('GROUPE_HAS_SEANCES');
        err.detail = `Ce groupe possède ${seancesCount} séance(s) planifiée(s).`;
        throw err;
      }
      if (edtsCount > 0) {
        const err = new Error('GROUPE_HAS_EDTS');
        err.detail = `Ce groupe possède ${edtsCount} emploi(s) du temps associé(s).`;
        throw err;
      }

      // 3. Suppression sécurisée
      await tx.groupe.delete({ where: { idGroupe: groupeId } });
    });

    res.json({
      status: 'success',
      message: 'Groupe supprimé.'
    });
  } catch (error) {
    if (error.message === 'GROUPE_NOT_FOUND') {
      return res.status(404).json({ message: 'Groupe introuvable.', code: 'GROUPE_NOT_FOUND' });
    }
    if (['GROUPE_HAS_ETUDIANTS_TD','GROUPE_HAS_ETUDIANTS_TP','GROUPE_HAS_ETUDIANTS_PROJET',
         'GROUPE_HAS_SEANCES','GROUPE_HAS_EDTS'].includes(error.message)) {
      return res.status(400).json({
        message: error.detail || 'Suppression impossible : dépendances existantes.',
        code: error.message
      });
    }
    console.error('deleteGroupe error:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

/**
 * @desc    Update a group
 * @route   PATCH /api/groupes/:id
 * @access  Private/Admin
 */
const updateGroupe = async (req, res) => {
  const { id } = req.params;
  const { nom, type, capaciteMax, description, annee, idEnseignant, etudiantsIds } = req.body;
  console.log('[DEBUG] updateGroupe request:', { id, nom, type, capaciteMax, description, annee, idEnseignant, etudiantsIds });

  try {
    const updateData = {};
    if (nom !== undefined) updateData.nom = nom;
    if (type !== undefined) updateData.type = type;
    if (capaciteMax !== undefined) updateData.capaciteMax = parseInt(capaciteMax);
    if (description !== undefined) updateData.description = description;
    if (annee !== undefined) updateData.annee = annee;
    if (idEnseignant !== undefined) updateData.idEnseignant = parseInt(idEnseignant);
    if (etudiantsIds) {
      updateData.etudiantsProjet = {
        set: etudiantsIds.map(id => ({ idEtudiant: parseInt(id) }))
      };
    }

    const groupe = await prisma.groupe.update({
      where: { idGroupe: parseInt(id) },
      data: updateData
    });

    console.log('[DEBUG] updateGroupe success:', groupe);
    res.json({
      status: 'success',
      data: groupe
    });
  } catch (error) {
    console.error('updateGroupe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getGroupes,
  createGroupe,
  updateGroupe,
  deleteGroupe
};
