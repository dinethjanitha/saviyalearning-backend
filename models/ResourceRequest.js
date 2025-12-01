import mongoose from 'mongoose';

const resourceRequestSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  subject: String,
  topic: String,
  type: String, // book/notes/video/pdf/etc.
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningGroup' },
  status: { type: String, enum: ['open', 'fulfilled', 'closed'], default: 'open' },
  responses: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
    message: String,
    date: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

// Indexes for better query performance
resourceRequestSchema.index({ requesterId: 1, createdAt: -1 });
resourceRequestSchema.index({ status: 1, createdAt: -1 });
resourceRequestSchema.index({ groupId: 1, status: 1 });
resourceRequestSchema.index({ subject: 1, topic: 1 });

const ResourceRequest = mongoose.model('ResourceRequest', resourceRequestSchema);
export default ResourceRequest;
