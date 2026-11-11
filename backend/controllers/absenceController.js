const prisma = require('../prismaClient');

/**
 * @desc    Record absences for a session (Teacher/Admin only)
 * @route   POST /api/absences
 * @access  Private/Teacher
 */
const recordAbsence = async (req, res) => {
  const { idEtudiants, idSeance, typeSeance } = req.body; // idEtudiants contains the NEW list of absents

  try {
    // 1. Verify existence of session and calculate duration
    const seance = await prisma.seance.findUnique({
      where: { idSeance: parseInt(idSeance) }
    });
    if (!seance) return res.status(404).json({ message: 'Seance not found' });

    const [hStart, mStart] = seance.heureDebut.split(':').map(Number);
    const [hEnd, mEnd] = seance.heureFin.split(':').map(Number);
    const durationHours = Math.ceil((hEnd + mEnd / 60) - (hStart + mStart / 60) || 2);

    // 2. Fetch existing absences for this session
    const existingAbsences = await prisma.absence.findMany({
      where: { idSeance: parseInt(idSeance) }
    });
    const existingAbsentIds = existingAbsences.map(a => a.idEtudiant);

    // 3. Identify DIFF
    const newAbsentIds = (idEtudiants || []).map(id => parseInt(id));
    const toAdd = newAbsentIds.filter(id => !existingAbsentIds.includes(id));
    const toRemove = existingAbsentIds.filter(id => !newAbsentIds.includes(id));

    // 4. Atomic Transaction for updates
    await prisma.$transaction(async (tx) => {
      // 4a. Delete removed absences
      if (toRemove.length > 0) {
        await tx.absence.deleteMany({
          where: {
            idSeance: parseInt(idSeance),
            idEtudiant: { in: toRemove }
          }
        });

        // Decrement counters
        for (const idEtudiant of toRemove) {
          await tx.compteurAbsence.update({
            where: { idEtudiant },
            data: { totalHeuresAbsence: { decrement: durationHours } }
          });
        }
      }

      // 4b. Create new absences
      if (toAdd.length > 0) {
        await Promise.all(toAdd.map(idEtudiant =>
          tx.absence.create({
            data: {
              idEtudiant,
              idSeance: parseInt(idSeance),
              typeSeance: typeSeance || seance.type,
              statut: 'INJUSTIFIEE'
            }
          })
        ));

        // Increment or Create counters
        for (const idEtudiant of toAdd) {
          await tx.compteurAbsence.upsert({
            where: { idEtudiant },
            update: { totalHeuresAbsence: { increment: durationHours } },
            create: { idEtudiant, totalHeuresAbsence: durationHours }
          });
        }
      }
    });

    res.status(201).json({
      status: 'success',
      message: `Appel mis à jour: ${toAdd.length} ajoutés, ${toRemove.length} retirés.`,
      data: { added: toAdd, removed: toRemove }
    });

  } catch (error) {
    console.error('recordAbsence error:', error);
    res.status(500).json({ message: 'Server error during roll-call update' });
  }
};

/**
 * @desc    Get personal absences for student
 * @route   GET /api/absences/me
 * @access  Private
 */
const getMyAbsences = async (req, res) => {
  const { id } = req.user;

  try {
    // 1. Get student ID
    const etudiant = await prisma.etudiant.findUnique({
      where: { utilisateurId: id }
    });

    if (!etudiant) return res.status(404).json({ message: 'Student profile not found' });

    // 2. Get absences and counter
    const [absences, counter] = await Promise.all([
      prisma.absence.findMany({
        where: { idEtudiant: etudiant.idEtudiant },
        include: {
          seance: { include: { module: true } },
          justificatif: true
        }
      }),
      prisma.compteurAbsence.findUnique({
        where: { idEtudiant: etudiant.idEtudiant }
      })
    ]);

    res.json({
      status: 'success',
      data: {
        absences,
        counter
      }
    });

  } catch (error) {
    console.error('getMyAbsences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update absence status / justificatif decision (Teacher/Admin only)
 * @route   PATCH /api/absences/:id
 * @access  Private/Teacher/Admin
 */
const updateAbsence = async (req, res) => {
  const { id } = req.params;
  const { statut, justificatifStatut } = req.body;

  try {
    // 1. Update the absence record's statut
    const updatedAbsence = await prisma.absence.update({
      where: { idAbsence: parseInt(id) },
      data: { statut }
    });

    // 2. If a justificatif decision was provided, update its statut as well
    if (justificatifStatut) {
      await prisma.justificatif.updateMany({
        where: { idAbsence: parseInt(id) },
        data: { statutJustif: justificatifStatut }
      });
    }

    res.json({
      status: 'success',
      data: updatedAbsence
    });
  } catch (error) {
    console.error('updateAbsence error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  recordAbsence,
  getMyAbsences,
  updateAbsence
};
