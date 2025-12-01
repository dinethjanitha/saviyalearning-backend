import Notification from '../models/Notification.js';
import UserPreferences from '../models/UserPreferences.js';
import User from '../models/User.js';
import { getIO } from '../services/socketService.js';
import { sendMail } from '../services/mailService.js';

// Create notification helper
export const createNotification = async (userId, type, title, message, data = {}, priority = 'medium') => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data,
      priority,
      createdAt: new Date(),
    });

    // Get user preferences
    let preferences = await UserPreferences.findOne({ userId });
    if (!preferences) {
      // Create default preferences if not exists
      preferences = await UserPreferences.create({ userId });
    }

    // Send real-time notification via Socket.io
    if (preferences.inAppNotifications.enabled) {
      try {
        const io = getIO();
        io.to(`user-${userId}`).emit('new-notification', notification);
      } catch (err) {
        console.error('Socket notification error:', err);
      }
    }

    // Send email notification if enabled
    if (preferences.emailNotifications.enabled && shouldSendEmail(type, preferences)) {
      await sendEmailNotification(userId, notification);
    }

    return notification;
  } catch (err) {
    console.error('Create notification error:', err);
    throw err;
  }
};

// Helper to check if email should be sent for this notification type
const shouldSendEmail = (type, preferences) => {
  const emailPrefs = preferences.emailNotifications;
  
  switch (type) {
    case 'group_invite':
      return emailPrefs.groupInvites;
    case 'resource_added':
      return emailPrefs.newResources;
    case 'session_scheduled':
    case 'session_reminder':
      return emailPrefs.sessionReminders;
    case 'chat_message':
      return emailPrefs.chatMessages;
    case 'resource_request':
    case 'request_response':
      return emailPrefs.resourceRequests;
    case 'report_status':
      return emailPrefs.reportUpdates;
    case 'admin_announcement':
      return emailPrefs.adminAnnouncements;
    default:
      return false;
  }
};

// Helper to send email notification
const sendEmailNotification = async (userId, notification) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.email) return;

    const emailSubject = notification.title;
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${notification.title}</h2>
        <p style="color: #666; line-height: 1.6;">${notification.message}</p>
        ${notification.data.link ? `<a href="${notification.data.link}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px;">View Details</a>` : ''}
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">You received this email because you have notifications enabled. You can change your notification preferences in your account settings.</p>
      </div>
    `;

    await sendMail({
      to: user.email,
      subject: emailSubject,
      html: emailBody,
    });

    // Mark email as sent
    await Notification.findByIdAndUpdate(notification._id, {
      emailSent: true,
      emailSentAt: new Date(),
    });
  } catch (err) {
    console.error('Send email notification error:', err);
  }
};

// Get user notifications with pagination
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, type, read, priority } = req.query;

    const filter = { userId };
    if (type) filter.type = type;
    if (read !== undefined) filter.read = read === 'true';
    if (priority) filter.priority = priority;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ userId, read: false });

    res.json({
      success: true,
      notifications,
      total,
      unreadCount,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const unreadCount = await Notification.countDocuments({ userId, read: false });

    res.json({ success: true, unreadCount });
  } catch (err) {
    console.error('Get unread count error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({ _id: id, userId });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({ success: true, notification });
  } catch (err) {
    console.error('Mark as read error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    res.json({ 
      success: true, 
      message: 'All notifications marked as read.',
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error('Mark all as read error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({ _id: id, userId });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    await notification.deleteOne();

    res.json({ success: true, message: 'Notification deleted.' });
  } catch (err) {
    console.error('Delete notification error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete all read notifications
export const deleteAllRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.deleteMany({ userId, read: true });

    res.json({ 
      success: true, 
      message: 'All read notifications deleted.',
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('Delete all read error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get user notification preferences
export const getPreferences = async (req, res) => {
  try {
    const userId = req.user._id;

    let preferences = await UserPreferences.findOne({ userId });
    if (!preferences) {
      // Create default preferences
      preferences = await UserPreferences.create({ userId });
    }

    res.json({ success: true, preferences });
  } catch (err) {
    console.error('Get preferences error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update user notification preferences
export const updatePreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    let preferences = await UserPreferences.findOne({ userId });
    if (!preferences) {
      preferences = await UserPreferences.create({ userId, ...updates });
    } else {
      // Update nested objects
      if (updates.emailNotifications) {
        preferences.emailNotifications = { ...preferences.emailNotifications.toObject(), ...updates.emailNotifications };
      }
      if (updates.pushNotifications) {
        preferences.pushNotifications = { ...preferences.pushNotifications.toObject(), ...updates.pushNotifications };
      }
      if (updates.inAppNotifications) {
        preferences.inAppNotifications = { ...preferences.inAppNotifications.toObject(), ...updates.inAppNotifications };
      }
      if (updates.quietHours) {
        preferences.quietHours = { ...preferences.quietHours.toObject(), ...updates.quietHours };
      }
      if (updates.language) {
        preferences.language = updates.language;
      }
      
      preferences.updatedAt = new Date();
      await preferences.save();
    }

    res.json({ success: true, preferences });
  } catch (err) {
    console.error('Update preferences error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: Send notification to specific users
export const sendToUsers = async (req, res) => {
  try {
    const { userIds, type, title, message, data, priority } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'UserIds array is required.' });
    }

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required.' });
    }

    const notifications = [];
    for (const userId of userIds) {
      const notification = await createNotification(
        userId,
        type || 'admin_announcement',
        title,
        message,
        data || {},
        priority || 'medium'
      );
      notifications.push(notification);
    }

    res.json({ 
      success: true, 
      message: `Notifications sent to ${userIds.length} users.`,
      count: notifications.length
    });
  } catch (err) {
    console.error('Send to users error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: Broadcast notification to all users
export const broadcastToAll = async (req, res) => {
  try {
    const { type, title, message, data, priority } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required.' });
    }

    // Get all active users
    const users = await User.find({ status: 'active' }).select('_id');
    const userIds = users.map(u => u._id);

    const notifications = [];
    for (const userId of userIds) {
      const notification = await createNotification(
        userId,
        type || 'admin_announcement',
        title,
        message,
        data || {},
        priority || 'medium'
      );
      notifications.push(notification);
    }

    res.json({ 
      success: true, 
      message: `Notification broadcast to ${userIds.length} users.`,
      count: notifications.length
    });
  } catch (err) {
    console.error('Broadcast error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: Get notification statistics
export const getNotificationStats = async (req, res) => {
  try {
    const totalNotifications = await Notification.countDocuments();
    const readNotifications = await Notification.countDocuments({ read: true });
    const unreadNotifications = await Notification.countDocuments({ read: false });
    const emailsSent = await Notification.countDocuments({ emailSent: true });

    // Notifications by type
    const byType = await Notification.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Notifications by priority
    const byPriority = await Notification.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Recent notifications (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await Notification.countDocuments({ createdAt: { $gte: oneDayAgo } });

    res.json({
      success: true,
      statistics: {
        totalNotifications,
        readNotifications,
        unreadNotifications,
        emailsSent,
        recentCount,
        byType,
        byPriority,
      }
    });
  } catch (err) {
    console.error('Get notification stats error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
