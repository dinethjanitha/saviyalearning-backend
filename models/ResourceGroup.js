import mongoose from 'mongoose';

const resourceGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  resources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  linkedGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LearningGroup' }],
  createdAt: { type: Date, default: Date.now },
});

const ResourceGroup = mongoose.model('ResourceGroup', resourceGroupSchema);
export default ResourceGroup;
