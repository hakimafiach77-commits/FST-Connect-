const prisma = require('../prismaClient');

/**
 * @desc    Create a new document (Teacher only)
 * @route   POST /api/documents
 * @access  Private/Teacher
 */
const createDocument = async (req, res) => {
  const { titre, type, cheminFichier, idModule } = req.body;

  try {
    const document = await prisma.document.create({
      data: {
        titre: titre || 'Sans titre',
        type: type || 'Ressource',
        cheminFichier: cheminFichier || 'document.pdf',
        idModule: idModule ? parseInt(idModule) : null,
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

  try {
    const documents = await prisma.document.findMany({
      where: { idModule: parseInt(idModule) },
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
 * @desc    Delete a document
 * @route   DELETE /api/documents/:id
 * @access  Private/Teacher
 */
const deleteDocument = async (req, res) => {
  const { id } = req.params;

  try {
    // Optional: Add ownership check here
    await prisma.document.delete({
      where: { idDocument: parseInt(id) }
    });

    res.json({
      status: 'success',
      message: 'Document deleted'
    });
  } catch (error) {
    console.error('deleteDocument error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createDocument,
  getModuleDocuments,
  deleteDocument
};
