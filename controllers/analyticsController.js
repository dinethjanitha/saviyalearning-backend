import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';

// Get basic analytics for admin dashboard
export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const bannedUsers = await User.countDocuments({ status: 'banned' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    const superadminCount = await User.countDocuments({ role: 'superadmin' });
    const recentActivities = await ActivityLog.find().sort({ timestamp: -1 }).limit(10);

    res.json({
      totalUsers,
      activeUsers,
      bannedUsers,
      suspendedUsers,
      adminCount,
      superadminCount,
      recentActivities
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
