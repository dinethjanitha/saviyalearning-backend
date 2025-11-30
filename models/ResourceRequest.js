import mongoose from 'mongoose';

const resourceRequestSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  description: String,
  subject: String,
  topic: String,
  type: String, // book/notes/video/etc.
  status: { type: String, enum: ['open', 'fulfilled', 'closed'], default: 'open' },
  responses: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
    message: String,
    date: Date,
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

const ResourceRequest = mongoose.model('ResourceRequest', resourceRequestSchema);
export default ResourceRequest;
