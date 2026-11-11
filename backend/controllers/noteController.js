const prisma = require('../prismaClient');

/**
 * @desc    Record or update a note (Teacher only)
 * @route   POST /api/notes
 * @access  Private/Teacher
 */
const recordNote = async (req, res) => {
  const { idEtudiant, idModule, idExamen, valeurCC, valeurEF, moyenneModule, idNote } = req.body;

  try {
    let note;

    // Bug #4 fix: upsert(where: { idNote: 0 }) is invalid — Prisma cannot find or create
    // a record at PK=0 on auto-increment schemas. Use explicit create vs update instead.
    if (idNote && parseInt(idNote) > 0) {
      note = await prisma.note.update({
        where: { idNote: parseInt(idNote) },
        data: {
          valeurCC,
          valeurEF,
          moyenneModule,
          dateSaisie: new Date()
        }
      });
    } else {
      note = await prisma.note.create({
        data: {
          idEtudiant,
          idModule,
          idExamen,
          valeurCC,
          valeurEF,
          moyenneModule
        }
      });
    }

    res.json({
      status: 'success',
      data: note
    });
  } catch (error) {
    console.error('recordNote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get personal notes for student
 * @route   GET /api/notes/me
 * @access  Private
 */
const getMyNotes = async (req, res) => {
  const { id } = req.user;

  try {
    const etudiant = await prisma.etudiant.findUnique({
      where: { utilisateurId: id }
    });

    if (!etudiant) return res.status(404).json({ message: 'Student profile not found' });

    const notes = await prisma.note.findMany({
      where: { 
        idEtudiant: etudiant.idEtudiant,
        estVerrouillee: false // Only show non-locked or public results
      },
      include: {
        module: true,
        examen: true,
        reclamations: true
      }
    });

    res.json({
      status: 'success',
      data: notes
    });
  } catch (error) {
    console.error('getMyNotes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Submit a reclamation for a note
 * @route   POST /api/notes/reclaim
 * @access  Private/Student
 */
const submitReclamation = async (req, res) => {
  const { idNote, motif } = req.body;

  try {
    // 1. Verify note belongs to user
    const note = await prisma.note.findUnique({
      where: { idNote },
      include: { etudiant: true }
    });

    if (!note || note.etudiant.utilisateurId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to reclaim this note' });
    }

    // 2. Create Reclamation
    const reclamation = await prisma.reclamation.create({
      data: {
        idNote,
        motif,
        statut: 'OUVERTE'
      }
    });

    res.status(201).json({
      status: 'success',
      data: reclamation
    });
  } catch (error) {
    console.error('submitReclamation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Bulk Record Notes (Teacher only)
 * @route   POST /api/notes/bulk
 * @access  Private/Teacher
 */
const recordBulkNotes = async (req, res) => {
  const { idModule, idExamen, notes } = req.body;

  if (!notes || !Array.isArray(notes)) {
    return res.status(400).json({ message: 'Invalid notes array' });
  }

  try {
    // 1. Fetch module for coefficients
    const module = await prisma.module.findUnique({
      where: { idModule: parseInt(idModule) }
    });

    const coeffCC = module?.coeffCC || 0.4;
    const coeffEF = module?.coeffEF || 0.6;

    // Bug #4 fix: upsert(where: { idNote: -1 }) is invalid for the same reason as recordNote.
    // Map each note entry to an explicit update (if idNote > 0) or create (if no idNote).
    const results = await prisma.$transaction(
      notes.map((n) => {
        const cc = n.valeurCC !== undefined ? parseFloat(n.valeurCC) : null;
        const ef = n.valeurEF !== undefined ? parseFloat(n.valeurEF) : null;

        // Auto-calculate average if both provided
        let moyenne = n.moyenneModule ? parseFloat(n.moyenneModule) : null;
        if (cc !== null && ef !== null) {
          moyenne = (cc * coeffCC) + (ef * coeffEF);
        }

        const existingId = n.idNote && parseInt(n.idNote) > 0 ? parseInt(n.idNote) : null;

        if (existingId) {
          return prisma.note.update({
            where: { idNote: existingId },
            data: {
              valeurCC: cc ?? undefined,
              valeurEF: ef ?? undefined,
              moyenneModule: moyenne ?? undefined,
              estVerrouillee: n.publiee || false,
              dateSaisie: new Date()
            }
          });
        } else {
          return prisma.note.create({
            data: {
              idEtudiant: parseInt(n.idEtudiant),
              idModule: parseInt(idModule),
              idExamen: idExamen ? parseInt(idExamen) : undefined,
              valeurCC: cc ?? 0,
              valeurEF: ef ?? 0,
              moyenneModule: moyenne ?? 0,
              estVerrouillee: n.publiee || false
            }
          });
        }
      })
    );

    res.json({
      status: 'success',
      message: `${results.length} notes traitées`,
      data: results
    });
  } catch (error) {
    console.error('recordBulkNotes error:', error);
    res.status(500).json({ message: 'Server error during bulk recording' });
  }
};

/**
 * @desc    Update reclamation status (Admin only)
 * @route   PATCH /api/notes/reclaim/:id
 * @access  Private/Admin
 */
const updateReclamation = async (req, res) => {
  const { id } = req.params;
  const { statut, reponseEnseignant } = req.body;

  try {
    const reclamation = await prisma.reclamation.update({
      where: { idReclamation: parseInt(id) },
      data: {
        statut,
        reponseEnseignant
      }
    });

    res.json({
      status: 'success',
      data: reclamation
    });
  } catch (error) {
    console.error('updateReclamation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  recordNote,
  recordBulkNotes,
  getMyNotes,
  submitReclamation,
  updateReclamation
};
