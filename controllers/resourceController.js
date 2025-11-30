// Update a resource (uploader or admin)
export const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, link } = req.body;
    const resource = await Resource.findById(id);
    if (!resource) return res.status(404).json({ message: 'Resource not found.' });
    // Only uploader or admin can update
    const isUploader = resource.uploadedBy.equals(req.user._id);
    const isAdmin = req.user && ['admin', 'superadmin'].includes(req.user.role);
    if (!isUploader && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    if (title !== undefined) resource.title = title;
    if (description !== undefined) resource.description = description;
    if (link !== undefined) resource.link = link;
    await resource.save();
    await ActivityLog.create({
      userId: req.user._id,
      actionType: 'resource_update',
      details: { resourceId: id },
    });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a resource (uploader or admin)
export const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findById(id);
    if (!resource) return res.status(404).json({ message: 'Resource not found.' });
    // Only uploader or admin can delete
    const isUploader = resource.uploadedBy.equals(req.user._id);
    const isAdmin = req.user && ['admin', 'superadmin'].includes(req.user.role);
    if (!isUploader && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    await resource.deleteOne();
    await ActivityLog.create({
      userId: req.user._id,
      actionType: 'resource_delete',
      details: { resourceId: id },
    });
    res.json({ message: 'Resource deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

import Resource from '../models/Resource.js';
import LearningGroup from '../models/LearningGroup.js';
import ActivityLog from '../models/ActivityLog.js';

// Add a new resource (Google Drive/shared link) to a group
export const addResource = async (req, res) => {
  try {
    const { title, description, link, groupId } = req.body;
    if (!title || !link || !groupId) {
      return res.status(400).json({ message: 'Title, link, and groupId are required.' });
    }
    // Check if user is a member of the group
    const group = await LearningGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found.' });
    const isMember = group.members.some(m => m.userId.equals(req.user._id));
    if (!isMember) return res.status(403).json({ message: 'You are not a member of this group.' });
    // Create resource
    const resource = await Resource.create({
      title,
      description,
      type: 'drive-link',
      link,
      groupId,
      uploadedBy: req.user._id,
    });
    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      actionType: 'resource_create',
      details: { resourceId: resource._id, groupId, title },
    });
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List resources for a group with pagination and search/filtering
export const getResources = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 20, q } = req.query;
    // Check if user is a member of the group
    const group = await LearningGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found.' });
    const isMember = group.members.some(m => m.userId.equals(req.user._id));
    if (!isMember) return res.status(403).json({ message: 'You are not a member of this group.' });
    const filter = { groupId };
    if (q) {
      filter.$or = [
        { title: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
        { link: new RegExp(q, 'i') }
      ];
    }
    const resources = await Resource.find(filter)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    const total = await Resource.countDocuments(filter);
    res.json({ resources, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Increment views count and return resource
export const viewResource = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!resource) return res.status(404).json({ message: 'Resource not found.' });
    // Log activity
    await ActivityLog.create({
      userId: req.user ? req.user._id : null,
      actionType: 'resource_view',
      details: { resourceId: resource._id },
    });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Delete a resource
export const adminDeleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findByIdAndDelete(id);
    if (!resource) return res.status(404).json({ message: 'Resource not found.' });
    await ActivityLog.create({
      userId: req.user._id,
      actionType: 'resource_delete',
      details: { resourceId: id },
    });
    res.json({ message: 'Resource deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
