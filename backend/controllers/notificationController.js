const prisma = require('../prismaClient');

/**
 * @desc    Get current user's notifications
 * @route   GET /api/notifications
 * @access  Private
 */
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { idUtilisateur: req.user.id },
      orderBy: { dateEnvoi: 'desc' }
    });

    res.json({
      status: 'success',
      data: notifications
    });
  } catch (error) {
    console.error('getMyNotifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await prisma.notification.update({
      where: { 
        idNotification: parseInt(id),
        idUtilisateur: req.user.id // Ensure user owns the notification
      },
      data: { lu: true }
    });

    res.json({
      status: 'success',
      data: notification
    });
  } catch (error) {
    console.error('markAsRead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead
};
