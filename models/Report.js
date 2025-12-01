import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  type: { type: String, enum: ['user', 'content'], required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // if user report
  reportedContent: {
    contentType: { type: String, enum: ['resource', 'session', 'message', 'group'] },
    contentId: mongoose.Schema.Types.ObjectId
  }, // if content report
  reason: { type: String, required: true },
  description: String, // Additional details from reporter
  status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // admin/superadmin
  adminNotes: String, // Admin notes during review
  actionTaken: { type: String, enum: ['warn', 'suspend', 'ban', 'remove', 'hide', 'dismiss'] },
  actionReason: String, // Reason for action taken
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

// Indexes for better query performance
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ type: 1, status: 1 });
reportSchema.index({ reportedBy: 1 });
reportSchema.index({ reportedUser: 1 });
reportSchema.index({ 'reportedContent.contentType': 1, 'reportedContent.contentId': 1 });

const Report = mongoose.model('Report', reportSchema);
export default Report;
