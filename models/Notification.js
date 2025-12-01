import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'group_invite',
      'group_joined',
      'group_left',
      'resource_added',
      'session_scheduled',
      'session_reminder',
      'session_started',
      'session_cancelled',
      'chat_message',
      'resource_request',
      'request_response',
      'report_status',
      'reputation_earned',
      'role_changed',
      'account_status',
      'admin_announcement',
      'system'
    ],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: {
    // Flexible object for additional data
    groupId: mongoose.Schema.Types.ObjectId,
    resourceId: mongoose.Schema.Types.ObjectId,
    sessionId: mongoose.Schema.Types.ObjectId,
    messageId: mongoose.Schema.Types.ObjectId,
    requestId: mongoose.Schema.Types.ObjectId,
    reportId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    link: String,
    action: String
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  read: { type: Boolean, default: false },
  readAt: Date,
  delivered: { type: Boolean, default: false },
  deliveredAt: Date,
  emailSent: { type: Boolean, default: false },
  emailSentAt: Date,
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date, // Optional expiry for time-sensitive notifications
});

// Indexes for better query performance
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // Auto-delete after 30 days

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
