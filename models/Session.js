import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  title: String,
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningGroup' },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scheduledAt: Date,
  duration: Number,
  meetingLink: String,
  attendees: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: Date,
    leftAt: Date,
  }],
  status: { type: String, enum: ['scheduled', 'ongoing', 'completed', 'cancelled'], default: 'scheduled' },
  startedAt: Date,
  endedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

const Session = mongoose.model('Session', sessionSchema);
export default Session;
