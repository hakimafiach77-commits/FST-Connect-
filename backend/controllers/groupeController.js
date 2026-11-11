const prisma = require('../prismaClient');

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

  try {
    await prisma.groupe.delete({
      where: { idGroupe: parseInt(id) }
    });

    res.json({
      status: 'success',
      message: 'Group deleted'
    });
  } catch (error) {
    console.error('deleteGroupe error:', error);
    res.status(500).json({ message: 'Server error' });
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
