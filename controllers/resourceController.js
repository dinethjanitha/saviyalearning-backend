// Update a resource (uploader or admin)
export const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, link } = req.body;
    const resource = await Resource.findById(id);
    if (!resource) return res.status(404).json({ message: 'Resource not found.' });
    // Only uploader or admin can update
    const isUploader = resource.uploadedBy.equals(req.user._id);
    const isAdmin = req.user && req.user.role === 'admin';
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
    const isAdmin = req.user && req.user.role === 'admin';
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
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { sendMail } from '../services/mailService.js';
import { resourceSharedEmail } from '../services/emailTemplates.js';

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
    
    // Send email notification to all group members
    try {
      const groupWithMembers = await LearningGroup.findById(groupId).populate('members.userId', 'email profile.name');
      if (groupWithMembers && groupWithMembers.members.length > 0) {
        const uploader = await User.findById(req.user._id).select('profile.name email');
        const uploaderName = uploader?.profile?.name || uploader?.email || 'A member';
        
        // Send email to each member (except the uploader)
        const emailPromises = groupWithMembers.members
          .filter(member => member.userId && member.userId._id.toString() !== req.user._id.toString())
          .map(async (member) => {
            const memberEmail = member.userId.email;
            const memberName = member.userId.profile?.name || memberEmail;
            
            try {
              await sendMail({
                to: memberEmail,
                subject: `New Resource Added: ${title}`,
                html: resourceSharedEmail(memberName, uploaderName, {
                  title,
                  groupInfo: `${groupWithMembers.grade} - ${groupWithMembers.subject} - ${groupWithMembers.topic}`,
                  description,
                  link
                }),
                text: `New Resource Added: ${title}\n\nShared by: ${uploaderName}\nGroup: ${groupWithMembers.grade} - ${groupWithMembers.subject} - ${groupWithMembers.topic}${description ? `\nDescription: ${description}` : ''}\nLink: ${link}`
              });
              console.log(`[SUCCESS] Resource notification email sent to ${memberEmail}`);
            } catch (emailError) {
              console.error(`[ERROR] Failed to send email to ${memberEmail}:`, emailError.message);
            }
          });
        
        await Promise.allSettled(emailPromises);
      }
    } catch (notifError) {
      console.error('Error sending resource notification emails:', notifError);
      // Don't fail the request if email fails
    }
    
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List resources for a group with pagination and search/filtering
export const getResources = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 50, q } = req.query;
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
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const resources = await Resource.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('uploadedBy', 'profile.name email');
    const total = await Resource.countDocuments(filter);
    const hasMore = (pageNum * limitNum) < total;
    res.json({ 
      resources, 
      total, 
      page: pageNum, 
      limit: limitNum,
      hasMore,
      totalPages: Math.ceil(total / limitNum)
    });
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

// Get user's uploaded resources
export const getMyResources = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const resources = await Resource.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('groupId', 'subject topic');
    const total = await Resource.countDocuments({ uploadedBy: req.user._id });
    res.json({ resources, total, page: parseInt(page), limit: parseInt(limit) });
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
