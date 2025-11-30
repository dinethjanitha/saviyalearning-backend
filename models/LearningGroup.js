import mongoose from 'mongoose';

const learningGroupSchema = new mongoose.Schema({
  grade: { type: String, required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  description: { type: String },
  whatsappLink: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String,
    joinedAt: { type: Date, default: Date.now },
  }],
  resourceGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ResourceGroup' }],
  resources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  sessions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session' }],
  chatMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage' }],
  maxMembers: { type: Number, default: 100 },
  groupType: { type: String, enum: ['public', 'private'], default: 'public' },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

// Enforce unique group per Grade+Subject+Topic
learningGroupSchema.index({ grade: 1, subject: 1, topic: 1 }, { unique: true });

const LearningGroup = mongoose.model('LearningGroup', learningGroupSchema);
export default LearningGroup;
