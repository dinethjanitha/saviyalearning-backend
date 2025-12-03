import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  email: { type: String, required: false },
  name: { type: String, required: false },
  type: { type: String, enum: ['general', 'bug', 'feature'], default: 'general' },
  message: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  status: { type: String, enum: ['open', 'responded', 'closed'], default: 'open' },
  metadata: { type: Object, default: {} },
  ip: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

FeedbackSchema.index({ status: 1 });
FeedbackSchema.index({ createdAt: -1 });

const Feedback = mongoose.model('Feedback', FeedbackSchema);
export default Feedback;
