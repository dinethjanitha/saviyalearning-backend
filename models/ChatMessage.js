import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningGroup', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['text', 'file', 'image'], default: 'text' },
  fileUrl: String, // For file/image attachments
  fileName: String,
  fileSize: Number,
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }, // For resource attachments
  resourceLink: String, // Store resource link for quick access
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage' }, // For reply functionality
  edited: { type: Boolean, default: false },
  editedAt: Date,
  timestamp: { type: Date, default: Date.now },
});

// Index for faster queries
chatMessageSchema.index({ groupId: 1, timestamp: -1 });
chatMessageSchema.index({ userId: 1 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export default ChatMessage;
