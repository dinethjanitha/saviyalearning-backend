import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  profile: {
    name: String,
    bio: String,
    avatar: String, // profile photo URL
    country: String,
    region: String,
  },
  role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
  status: { type: String, enum: ['active', 'banned', 'suspended'], default: 'active' },
  verified: { type: Boolean, default: false },
  skills: [{
    subject: String,
    topics: [String],
    proficiency: String,
  }],
  reputation: {
    points: { type: Number, default: 0 },
    sessionsTaught: { type: Number, default: 0 },
    resourcesShared: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
export default User;
