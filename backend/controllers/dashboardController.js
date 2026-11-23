const prisma = require('../prismaClient');

/**
 * @desc    Compute dynamic metrics when no static dashboard row exists
 */
const computeDynamicAnalytics = async (id, role) => {
  if (role === 'admin') {
    const [totalEtudiants, totalEnseignants, totalModules, totalFilieres, totalSalles, totalStages, totalPfes] = await Promise.all([
      prisma.etudiant.count(),
      prisma.enseignant.count(),
      prisma.module.count(),
      prisma.filiere.count(),
      prisma.salle.count(),
      prisma.stage.count(),
      prisma.pfe.count()
    ]);
    return {
      totalEtudiants,
      totalEnseignants,
      totalModules,
      totalFilieres,
      totalSalles,
      totalStages,
      totalPfes
    };
  }

  if (role === 'teacher') {
    const enseignant = await prisma.enseignant.findUnique({
      where: { utilisateurId: id },
      select: { idEnseignant: true }
    });
    if (!enseignant) return { modulesEnseignes: 0, seancesHebdo: 0, pfesEncadres: 0 };

    const [modulesEnseignes, seancesHebdo, pfesEncadres] = await Promise.all([
      prisma.affectation.count({ where: { idEnseignant: enseignant.idEnseignant } }),
      prisma.seance.count({ where: { idEnseignant: enseignant.idEnseignant } }),
      prisma.pfe.count({ where: { idEncadrant: enseignant.idEnseignant } })
    ]);
    return {
      modulesEnseignes,
      seancesHebdo,
      pfesEncadres
    };
  }

  if (role === 'student') {
    const etudiant = await prisma.etudiant.findUnique({
      where: { utilisateurId: id },
      include: {
        compteurAbsence: true,
        _count: { select: { notes: true, stages: true } }
      }
    });
    if (!etudiant) return { totalAbsencesHeures: 0, totalNotes: 0, totalStages: 0 };

    return {
      totalAbsencesHeures: etudiant.compteurAbsence?.totalHeuresAbsence || 0,
      totalNotes: etudiant._count.notes,
      totalStages: etudiant._count.stages
    };
  }

  return {};
};

/**
 * @desc    Get contextual dashboard data based on user role
 * @route   GET /api/dashboard
 * @access  Private
 */
const getUserDashboard = async (req, res) => {
  const { id, role } = req.user;

  try {
    // 1. Chercher un enregistrement Dashboard pré-existant
    const dashboard = await prisma.dashboard.findUnique({
      where: { idUtilisateur: id },
      include: {
        adminData: role === 'admin',
        enseignantData: role === 'teacher',
        etudiantData: role === 'student'
      }
    });

    let analytics = null;
    let dernierChargement = new Date();
    let idDashboard = null;

    if (dashboard) {
      idDashboard = dashboard.idDashboard;
      dernierChargement = dashboard.dernierChargement;
      if (role === 'admin') analytics = dashboard.adminData;
      if (role === 'teacher') analytics = dashboard.enseignantData;
      if (role === 'student') analytics = dashboard.etudiantData;
    }

    // 2. Si aucune donnée statique n'est initialisée, calculer dynamiquement à partir des données réelles
    if (!analytics) {
      analytics = await computeDynamicAnalytics(id, role);
    }

    res.json({
      status: 'success',
      data: {
        idDashboard: idDashboard || 0,
        role,
        dernierChargement,
        analytics
      }
    });

  } catch (error) {
    console.error('getUserDashboard error:', error);
    res.status(500).json({ message: 'Erreur serveur lors du chargement du tableau de bord' });
  }
};

/**
 * @desc    Update dashboard loading timestamp
 * @route   PATCH /api/dashboard/refresh
 * @access  Private
 */
const refreshDashboard = async (req, res) => {
  try {
    const existing = await prisma.dashboard.findUnique({
      where: { idUtilisateur: req.user.id }
    });

    let dashboard;
    if (existing) {
      dashboard = await prisma.dashboard.update({
        where: { idUtilisateur: req.user.id },
        data: { dernierChargement: new Date() }
      });
    } else {
      dashboard = {
        idUtilisateur: req.user.id,
        dernierChargement: new Date()
      };
    }

    res.json({
      status: 'success',
      data: dashboard
    });
  } catch (error) {
    console.error('refreshDashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserDashboard,
  refreshDashboard
};
