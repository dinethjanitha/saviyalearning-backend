import mongoose from 'mongoose';

const userPreferencesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  emailNotifications: {
    enabled: { type: Boolean, default: true },
    groupInvites: { type: Boolean, default: true },
    newResources: { type: Boolean, default: true },
    sessionReminders: { type: Boolean, default: true },
    chatMessages: { type: Boolean, default: false }, // Off by default to avoid spam
    resourceRequests: { type: Boolean, default: true },
    reportUpdates: { type: Boolean, default: true },
    adminAnnouncements: { type: Boolean, default: true },
  },
  pushNotifications: {
    enabled: { type: Boolean, default: true },
    groupInvites: { type: Boolean, default: true },
    newResources: { type: Boolean, default: true },
    sessionReminders: { type: Boolean, default: true },
    chatMessages: { type: Boolean, default: true },
    resourceRequests: { type: Boolean, default: true },
    reportUpdates: { type: Boolean, default: true },
    adminAnnouncements: { type: Boolean, default: true },
  },
  inAppNotifications: {
    enabled: { type: Boolean, default: true },
    groupInvites: { type: Boolean, default: true },
    newResources: { type: Boolean, default: true },
    sessionReminders: { type: Boolean, default: true },
    chatMessages: { type: Boolean, default: true },
    resourceRequests: { type: Boolean, default: true },
    reportUpdates: { type: Boolean, default: true },
    adminAnnouncements: { type: Boolean, default: true },
  },
  quietHours: {
    enabled: { type: Boolean, default: false },
    startTime: { type: String, default: '22:00' }, // 24-hour format
    endTime: { type: String, default: '08:00' },
  },
  language: { type: String, default: 'en' },
  updatedAt: { type: Date, default: Date.now },
});

const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema);
export default UserPreferences;
