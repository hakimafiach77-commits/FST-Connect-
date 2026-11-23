const prisma = require('../prismaClient');

/**
 * @desc    Create a new document (Teacher or Admin)
 * @route   POST /api/documents
 * @access  Private/Teacher, Admin
 */
const createDocument = async (req, res) => {
  const { titre, type, cheminFichier, idModule } = req.body;

  if (!titre || typeof titre !== 'string' || !titre.trim()) {
    return res.status(400).json({ success: false, error: 'TITLE_REQUIRED', message: 'Le titre du document est obligatoire' });
  }

  if (!idModule || isNaN(parseInt(idModule, 10)) || parseInt(idModule, 10) <= 0) {
    return res.status(400).json({ success: false, error: 'INVALID_MODULE_ID', message: 'L\'identifiant de module est invalide ou manquant' });
  }

  const parsedModuleId = parseInt(idModule, 10);

  try {
    const moduleExists = await prisma.module.findUnique({
      where: { idModule: parsedModuleId }
    });

    if (!moduleExists) {
      return res.status(404).json({ success: false, error: 'MODULE_NOT_FOUND', message: 'Module introuvable' });
    }

    const document = await prisma.document.create({
      data: {
        titre: titre.trim(),
        type: type && typeof type === 'string' ? type.trim() : 'Ressource',
        cheminFichier: cheminFichier && typeof cheminFichier === 'string' ? cheminFichier.trim() : 'document.pdf',
        idModule: parsedModuleId,
        idAuteur: req.user.id
      }
    });

    res.status(201).json({
      status: 'success',
      data: document
    });
  } catch (error) {
    console.error('createDocument error:', error.message);
    res.status(500).json({ message: 'Server error', detail: error.message });
  }
};

/**
 * @desc    Get documents for a module
 * @route   GET /api/documents/module/:idModule
 * @access  Private
 */
const getModuleDocuments = async (req, res) => {
  const { idModule } = req.params;
  const parsedModuleId = parseInt(idModule, 10);

  if (isNaN(parsedModuleId) || parsedModuleId <= 0) {
    return res.status(400).json({ success: false, error: 'INVALID_MODULE_ID', message: 'Identifiant de module invalide' });
  }

  try {
    const documents = await prisma.document.findMany({
      where: { idModule: parsedModuleId },
      orderBy: { dateUpload: 'desc' }
    });

    res.json({
      status: 'success',
      data: documents
    });
  } catch (error) {
    console.error('getModuleDocuments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update a document (Author or Admin only - Anti-IDOR)
 * @route   PATCH /api/documents/:id
 * @access  Private/Teacher, Admin
 */
const updateDocument = async (req, res) => {
  const { id } = req.params;
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId) || parsedId <= 0) {
    return res.status(400).json({ success: false, error: 'INVALID_ID', message: 'Identifiant de document invalide' });
  }

  const { titre, type, cheminFichier } = req.body;

  try {
    const existing = await prisma.document.findUnique({
      where: { idDocument: parsedId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'DOCUMENT_NOT_FOUND', message: 'Document introuvable' });
    }

    // Anti-IDOR : Seul l'auteur ou un admin peut modifier le document
    if (req.user.role !== 'admin' && existing.idAuteur !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Non autorisé à modifier ce document (seul l\'auteur ou un administrateur peut le modifier)'
      });
    }

    const updated = await prisma.document.update({
      where: { idDocument: parsedId },
      data: {
        titre: titre && typeof titre === 'string' && titre.trim() ? titre.trim() : undefined,
        type: type && typeof type === 'string' && type.trim() ? type.trim() : undefined,
        cheminFichier: cheminFichier && typeof cheminFichier === 'string' && cheminFichier.trim() ? cheminFichier.trim() : undefined
      }
    });

    res.json({
      status: 'success',
      data: updated
    });
  } catch (error) {
    console.error('updateDocument error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Delete a document (Author or Admin only - Anti-IDOR)
 * @route   DELETE /api/documents/:id
 * @access  Private/Teacher, Admin
 */
const deleteDocument = async (req, res) => {
  const { id } = req.params;
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId) || parsedId <= 0) {
    return res.status(400).json({ success: false, error: 'INVALID_ID', message: 'Identifiant de document invalide' });
  }

  try {
    const existing = await prisma.document.findUnique({
      where: { idDocument: parsedId }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'DOCUMENT_NOT_FOUND', message: 'Document introuvable' });
    }

    // Anti-IDOR : Seul l'auteur ou un admin peut supprimer le document
    if (req.user.role !== 'admin' && existing.idAuteur !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Non autorisé à supprimer ce document (seul l\'auteur ou un administrateur peut le supprimer)'
      });
    }

    await prisma.document.delete({
      where: { idDocument: parsedId }
    });

    res.json({
      status: 'success',
      message: 'Document supprimé'
    });
  } catch (error) {
    console.error('deleteDocument error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createDocument,
  getModuleDocuments,
  updateDocument,
  deleteDocument
};
