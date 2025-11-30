import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['drive-link'], required: true },
  link: { type: String, required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningGroup', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;
