const prisma = require('../prismaClient');

/**
 * @desc    Get contextual dashboard data based on user role
 * @route   GET /api/dashboard
 * @access  Private
 */
const getUserDashboard = async (req, res) => {
  const { id, role } = req.user;

  try {
    // 1. Get the main dashboard entry
    const dashboard = await prisma.dashboard.findUnique({
      where: { idUtilisateur: id },
      include: {
        adminData: role === 'admin',
        enseignantData: role === 'teacher',
        etudiantData: role === 'student'
      }
    });

    if (!dashboard) {
      return res.status(404).json({ message: 'Dashboard not initialized for this user' });
    }

    // 2. Format response based on role
    let analytics = null;
    if (role === 'admin') analytics = dashboard.adminData;
    if (role === 'teacher') analytics = dashboard.enseignantData;
    if (role === 'student') analytics = dashboard.etudiantData;

    res.json({
      status: 'success',
      data: {
        idDashboard: dashboard.idDashboard,
        role: dashboard.role,
        dernierChargement: dashboard.dernierChargement,
        analytics
      }
    });

  } catch (error) {
    console.error('getUserDashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update dashboard loading timestamp
 * @route   PATCH /api/dashboard/refresh
 * @access  Private
 */
const refreshDashboard = async (req, res) => {
  try {
    const dashboard = await prisma.dashboard.update({
      where: { idUtilisateur: req.user.id },
      data: { dernierChargement: new Date() }
    });

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
