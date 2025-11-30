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
  status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // admin/superadmin
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

const Report = mongoose.model('Report', reportSchema);
export default Report;
