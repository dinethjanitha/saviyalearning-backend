import ActivityLog from '../models/ActivityLog.js';
import User from '../models/User.js';

// Admin: List activity logs with pagination and filtering
export const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 30, userId, actionType, q } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (actionType) filter.actionType = actionType;
    if (q) filter['details.resourceId'] = q; // quick search by resourceId
    const logs = await ActivityLog.find(filter)
      .sort({ timestamp: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('userId', 'email role profile');
    const total = await ActivityLog.countDocuments(filter);
    res.json({ logs, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// User: Get own activity logs
export const getMyActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user._id;
    const logs = await ActivityLog.find({ userId })
      .sort({ timestamp: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('userId', 'email role profile');
    const total = await ActivityLog.countDocuments({ userId });
    res.json({ logs, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
