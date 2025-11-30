import Resource from '../models/Resource.js';

// Get analytics for resources (admin only)
export const getResourceAnalytics = async (req, res) => {
  try {
    // Top viewed resources
    const topViewed = await Resource.find()
      .sort({ views: -1 })
      .limit(10)
      .select('title views groupId uploadedBy createdAt');

    // Total resources
    const totalResources = await Resource.countDocuments();

    // Resources added in the last 7 days
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentResources = await Resource.countDocuments({ createdAt: { $gte: last7Days } });

    // Most active uploaders
    const topUploaders = await Resource.aggregate([
      { $group: { _id: '$uploadedBy', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalResources,
      recentResources,
      topViewed,
      topUploaders
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
