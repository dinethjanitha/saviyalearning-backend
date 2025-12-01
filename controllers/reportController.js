import Report from '../models/Report.js';
import User from '../models/User.js';
import Resource from '../models/Resource.js';
import ChatMessage from '../models/ChatMessage.js';
import LearningGroup from '../models/LearningGroup.js';
import Session from '../models/Session.js';
import ActivityLog from '../models/ActivityLog.js';
import { getIO } from '../services/socketService.js';

// Create a new report
export const createReport = async (req, res) => {
  try {
    const { type, reportedUser, reportedContent, reason, description } = req.body;
    const reportedBy = req.user._id;

    if (!type || !reason) {
      return res.status(400).json({ message: 'Type and reason are required.' });
    }

    // Validate type-specific data
    if (type === 'user' && !reportedUser) {
      return res.status(400).json({ message: 'ReportedUser is required for user reports.' });
    }

    if (type === 'content' && (!reportedContent || !reportedContent.contentType || !reportedContent.contentId)) {
      return res.status(400).json({ message: 'ReportedContent (contentType and contentId) is required for content reports.' });
    }

    // Verify reported user exists
    if (type === 'user') {
      const userExists = await User.findById(reportedUser);
      if (!userExists) {
        return res.status(404).json({ message: 'Reported user not found.' });
      }

      // Prevent self-reporting
      if (reportedUser === reportedBy.toString()) {
        return res.status(400).json({ message: 'You cannot report yourself.' });
      }
    }

    // Verify reported content exists
    if (type === 'content') {
      const { contentType, contentId } = reportedContent;
      let contentExists = false;

      switch (contentType) {
        case 'resource':
          contentExists = await Resource.findById(contentId);
          break;
        case 'message':
          contentExists = await ChatMessage.findById(contentId);
          break;
        case 'group':
          contentExists = await LearningGroup.findById(contentId);
          break;
        case 'session':
          contentExists = await Session.findById(contentId);
          break;
        default:
          return res.status(400).json({ message: 'Invalid content type.' });
      }

      if (!contentExists) {
        return res.status(404).json({ message: `Reported ${contentType} not found.` });
      }
    }

    const report = await Report.create({
      type,
      reportedBy,
      reportedUser: type === 'user' ? reportedUser : undefined,
      reportedContent: type === 'content' ? reportedContent : undefined,
      reason,
      description,
      status: 'pending',
      createdAt: new Date(),
    });

    const populatedReport = await Report.findById(report._id)
      .populate('reportedBy', 'email profile.name')
      .populate('reportedUser', 'email profile.name');

    // Log activity
    await ActivityLog.create({
      userId: reportedBy,
      actionType: 'report_created',
      details: { reportId: report._id, type, reason },
    });

    // Notify admins via socket
    try {
      const io = getIO();
      io.emit('new-report', populatedReport);
    } catch (err) {
      console.error('Socket notification error:', err);
    }

    res.status(201).json({ success: true, report: populatedReport });
  } catch (err) {
    console.error('Create report error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all reports with filters and pagination (Admin only)
export const getReports = async (req, res) => {
  try {
    const { status, type, reportedBy, reportedUser, contentType, page = 1, limit = 30 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (reportedBy) filter.reportedBy = reportedBy;
    if (reportedUser) filter.reportedUser = reportedUser;
    if (contentType) filter['reportedContent.contentType'] = contentType;

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('reportedBy', 'email profile.name profile.avatar')
      .populate('reportedUser', 'email profile.name profile.avatar status')
      .populate('reviewedBy', 'email profile.name');

    const total = await Report.countDocuments(filter);

    res.json({
      success: true,
      reports,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('Get reports error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get a single report by ID (Admin only)
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id)
      .populate('reportedBy', 'email profile.name profile.avatar')
      .populate('reportedUser', 'email profile.name profile.avatar status role')
      .populate('reviewedBy', 'email profile.name');

    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    // Populate content details if content report
    if (report.type === 'content' && report.reportedContent) {
      const { contentType, contentId } = report.reportedContent;
      let contentDetails = null;

      switch (contentType) {
        case 'resource':
          contentDetails = await Resource.findById(contentId)
            .populate('uploadedBy', 'email profile.name')
            .populate('groupId', 'grade subject topic');
          break;
        case 'message':
          contentDetails = await ChatMessage.findById(contentId)
            .populate('userId', 'email profile.name')
            .populate('groupId', 'grade subject topic');
          break;
        case 'group':
          contentDetails = await LearningGroup.findById(contentId)
            .populate('createdBy', 'email profile.name');
          break;
        case 'session':
          contentDetails = await Session.findById(contentId)
            .populate('teacherId', 'email profile.name')
            .populate('groupId', 'grade subject topic');
          break;
      }

      report._doc.contentDetails = contentDetails;
    }

    res.json({ success: true, report });
  } catch (err) {
    console.error('Get report error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get my submitted reports
export const getMyReports = async (req, res) => {
  try {
    const reportedBy = req.user._id;
    const { status, page = 1, limit = 20 } = req.query;

    const filter = { reportedBy };
    if (status) filter.status = status;

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('reportedUser', 'email profile.name')
      .populate('reviewedBy', 'email profile.name');

    const total = await Report.countDocuments(filter);

    res.json({
      success: true,
      reports,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('Get my reports error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update report status (Admin only)
export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    const reviewedBy = req.user._id;

    if (!status) {
      return res.status(400).json({ message: 'Status is required.' });
    }

    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    report.status = status;
    report.reviewedBy = reviewedBy;
    report.adminNotes = adminNotes || report.adminNotes;
    report.updatedAt = new Date();
    await report.save();

    const updatedReport = await Report.findById(id)
      .populate('reportedBy', 'email profile.name')
      .populate('reportedUser', 'email profile.name')
      .populate('reviewedBy', 'email profile.name');

    // Log activity
    await ActivityLog.create({
      userId: reviewedBy,
      actionType: 'report_status_updated',
      details: { reportId: id, status, adminNotes },
    });

    res.json({ success: true, report: updatedReport });
  } catch (err) {
    console.error('Update report status error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Take action on reported content (Admin only)
export const takeAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, actionReason } = req.body;
    const adminId = req.user._id;

    if (!action) {
      return res.status(400).json({ message: 'Action is required.' });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    let actionTaken = false;
    let actionDetails = {};

    // Handle user report actions
    if (report.type === 'user' && report.reportedUser) {
      switch (action) {
        case 'warn':
          // Just log warning - future: send warning email
          actionDetails = { action: 'warn', userId: report.reportedUser };
          actionTaken = true;
          break;

        case 'suspend':
          await User.findByIdAndUpdate(report.reportedUser, { status: 'suspended' });
          actionDetails = { action: 'suspend', userId: report.reportedUser };
          actionTaken = true;
          break;

        case 'ban':
          await User.findByIdAndUpdate(report.reportedUser, { status: 'banned' });
          actionDetails = { action: 'ban', userId: report.reportedUser };
          actionTaken = true;
          break;

        case 'dismiss':
          actionDetails = { action: 'dismiss' };
          actionTaken = true;
          break;

        default:
          return res.status(400).json({ message: 'Invalid action for user report.' });
      }
    }

    // Handle content report actions
    if (report.type === 'content' && report.reportedContent) {
      const { contentType, contentId } = report.reportedContent;

      switch (action) {
        case 'remove':
          switch (contentType) {
            case 'resource':
              await Resource.findByIdAndDelete(contentId);
              break;
            case 'message':
              await ChatMessage.findByIdAndDelete(contentId);
              break;
            case 'group':
              await LearningGroup.findByIdAndUpdate(contentId, { status: 'archived' });
              break;
            case 'session':
              await Session.findByIdAndUpdate(contentId, { status: 'cancelled' });
              break;
          }
          actionDetails = { action: 'remove', contentType, contentId };
          actionTaken = true;
          break;

        case 'hide':
          // Future: Add hidden/flagged field to models
          actionDetails = { action: 'hide', contentType, contentId };
          actionTaken = true;
          break;

        case 'dismiss':
          actionDetails = { action: 'dismiss' };
          actionTaken = true;
          break;

        default:
          return res.status(400).json({ message: 'Invalid action for content report.' });
      }
    }

    if (!actionTaken) {
      return res.status(400).json({ message: 'No valid action taken.' });
    }

    // Update report
    report.status = 'resolved';
    report.reviewedBy = adminId;
    report.actionTaken = action;
    report.actionReason = actionReason;
    report.updatedAt = new Date();
    await report.save();

    const updatedReport = await Report.findById(id)
      .populate('reportedBy', 'email profile.name')
      .populate('reportedUser', 'email profile.name')
      .populate('reviewedBy', 'email profile.name');

    // Log activity
    await ActivityLog.create({
      userId: adminId,
      actionType: 'report_action_taken',
      details: { reportId: id, ...actionDetails, actionReason },
    });

    res.json({ success: true, report: updatedReport, actionDetails });
  } catch (err) {
    console.error('Take action error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete report (Admin only)
export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    await report.deleteOne();

    // Log activity
    await ActivityLog.create({
      userId: adminId,
      actionType: 'report_deleted',
      details: { reportId: id },
    });

    res.json({ success: true, message: 'Report deleted.' });
  } catch (err) {
    console.error('Delete report error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get report statistics (Admin only)
export const getReportStatistics = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const reviewedReports = await Report.countDocuments({ status: 'reviewed' });
    const resolvedReports = await Report.countDocuments({ status: 'resolved' });

    const userReports = await Report.countDocuments({ type: 'user' });
    const contentReports = await Report.countDocuments({ type: 'content' });

    // Most reported users
    const topReportedUsers = await Report.aggregate([
      { $match: { type: 'user', reportedUser: { $exists: true } } },
      { $group: { _id: '$reportedUser', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Reports by content type
    const reportsByContentType = await Report.aggregate([
      { $match: { type: 'content' } },
      { $group: { _id: '$reportedContent.contentType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Most common reasons
    const topReasons = await Report.aggregate([
      { $group: { _id: '$reason', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Reports over time (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentReports = await Report.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    res.json({
      success: true,
      statistics: {
        totalReports,
        pendingReports,
        reviewedReports,
        resolvedReports,
        userReports,
        contentReports,
        recentReports,
        topReportedUsers,
        reportsByContentType,
        topReasons,
      }
    });
  } catch (err) {
    console.error('Get statistics error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Bulk update reports (Admin only)
export const bulkUpdateReports = async (req, res) => {
  try {
    const { reportIds, status, adminNotes } = req.body;
    const reviewedBy = req.user._id;

    if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
      return res.status(400).json({ message: 'ReportIds array is required.' });
    }

    if (!status) {
      return res.status(400).json({ message: 'Status is required.' });
    }

    const updateData = {
      status,
      reviewedBy,
      updatedAt: new Date(),
    };

    if (adminNotes) updateData.adminNotes = adminNotes;

    const result = await Report.updateMany(
      { _id: { $in: reportIds } },
      { $set: updateData }
    );

    // Log activity
    await ActivityLog.create({
      userId: reviewedBy,
      actionType: 'reports_bulk_updated',
      details: { reportIds, status, count: result.modifiedCount },
    });

    res.json({
      success: true,
      message: `${result.modifiedCount} reports updated.`,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error('Bulk update error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
