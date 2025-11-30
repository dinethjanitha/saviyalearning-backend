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
      .populate('userId', 'email role');
    const total = await ActivityLog.countDocuments(filter);
    res.json({ logs, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
