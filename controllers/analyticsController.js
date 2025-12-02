import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import LearningGroup from '../models/LearningGroup.js';
import Session from '../models/Session.js';
import Resource from '../models/Resource.js';

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
    
    // Learning platform statistics
    const totalGroups = await LearningGroup.countDocuments();
    const totalSessions = await Session.countDocuments();
    const totalResources = await Resource.countDocuments();
    const activeSessions = await Session.countDocuments({ status: 'ongoing' });
    const scheduledSessions = await Session.countDocuments({ status: 'scheduled' });
    const completedSessions = await Session.countDocuments({ status: 'completed' });

    res.json({
      totalUsers,
      activeUsers,
      bannedUsers,
      suspendedUsers,
      adminCount,
      superadminCount,
      totalGroups,
      totalSessions,
      totalResources,
      activeSessions,
      scheduledSessions,
      completedSessions,
      recentActivities
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
