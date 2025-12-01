import { ObjectId } from 'mongodb';

// Admin: List/search all groups (with filters, pagination)
export const adminListGroups = async (req, res) => {
  try {
    const { grade, subject, topic, status, q, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (grade) filter.grade = grade;
    if (subject) filter.subject = subject;
    if (topic) filter.topic = topic;
    if (status) filter.status = status;
    if (q) {
      filter.$or = [
        { grade: new RegExp(q, 'i') },
        { subject: new RegExp(q, 'i') },
        { topic: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') }
      ];
    }
    const groups = await LearningGroup.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('createdBy', 'name email');
    const total = await LearningGroup.countDocuments(filter);
    res.json({ groups, total });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Admin: Update group info (edit grade, subject, topic, description, status)
export const adminUpdateGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const updates = (({ grade, subject, topic, description, status, maxMembers, groupType, whatsappLink }) => ({ grade, subject, topic, description, status, maxMembers, groupType, whatsappLink }))(req.body);
    // Remove undefined fields
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);
    const group = await LearningGroup.findByIdAndUpdate(groupId, updates, { new: true });
    if (!group) return res.status(404).json({ message: 'Group not found.' });
    await ActivityLog.create({ userId: req.user._id, actionType: 'admin_update_group', details: { group: group._id, updates } });
    res.json(group);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Admin: Delete/archive group
export const adminDeleteGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { archive } = req.query;
    let group;
    if (archive === 'true') {
      group = await LearningGroup.findByIdAndUpdate(groupId, { status: 'archived' }, { new: true });
    } else {
      group = await LearningGroup.findByIdAndDelete(groupId);
    }
    if (!group) return res.status(404).json({ message: 'Group not found.' });
    await ActivityLog.create({ userId: req.user._id, actionType: archive === 'true' ? 'admin_archive_group' : 'admin_delete_group', details: { group: groupId } });
    res.json({ message: archive === 'true' ? 'Group archived.' : 'Group deleted.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Admin: Remove/ban user from group
export const adminRemoveMember = async (req, res) => {
  try {
    const groupId = req.params.id;
    const memberId = req.params.userId;
    const group = await LearningGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found.' });
    const before = group.members.length;
    group.members = group.members.filter(m => !m.userId.equals(memberId));
    if (group.members.length === before) {
      return res.status(404).json({ message: 'User not a member.' });
    }
    await group.save();
    await ActivityLog.create({ userId: req.user._id, actionType: 'admin_remove_member', details: { group: groupId, member: memberId } });
    res.json({ message: 'Member removed.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Admin: Change member role in group
export const adminChangeMemberRole = async (req, res) => {
  try {
    const groupId = req.params.id;
    const memberId = req.params.userId;
    const { role } = req.body;
    const group = await LearningGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found.' });
    const member = group.members.find(m => m.userId.equals(memberId));
    if (!member) return res.status(404).json({ message: 'User not a member.' });
    member.role = role;
    await group.save();
    await ActivityLog.create({ userId: req.user._id, actionType: 'admin_change_member_role', details: { group: groupId, member: memberId, role } });
    res.json({ message: 'Member role updated.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
import LearningGroup from '../models/LearningGroup.js';
import ActivityLog from '../models/ActivityLog.js';
import mongoose from 'mongoose';
import { createNotification } from './notificationController.js';

// Create a new learning group (enforces Grade+Subject+Topic uniqueness)
export const createGroup = async (req, res) => {
  try {
    const { grade, subject, topic, description, whatsappLink, maxMembers, groupType } = req.body;
    const createdBy = req.user._id;
    // Check for existing group
    const exists = await LearningGroup.findOne({ grade, subject, topic });
    if (exists) {
      return res.status(409).json({ message: 'A group for this Grade, Subject, and Topic already exists.' });
    }
    const group = await LearningGroup.create({
      grade,
      subject,
      topic,
      description,
      whatsappLink,
      createdBy,
      members: [{ userId: createdBy, role: 'owner' }],
      maxMembers,
      groupType
    });
    await ActivityLog.create({ userId: req.user._id, actionType: 'create_group', details: { group: group._id } });
    
    // Send welcome notification to group creator
    await createNotification(
      createdBy,
      'group_created',
      'Group Created Successfully',
      `Your learning group "${subject} - ${topic}" has been created successfully.`,
      { groupId: group._id },
      'medium'
    );
    
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Join a group
export const joinGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user._id;
    const group = await LearningGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found.' });
    if (group.members.some(m => m.userId.equals(userId))) {
      return res.status(409).json({ message: 'Already a member.' });
    }
    if (group.members.length >= group.maxMembers) {
      return res.status(403).json({ message: 'Group is full.' });
    }
    group.members.push({ userId, role: 'member' });
    await group.save();
    await ActivityLog.create({ userId: userId, actionType: 'join_group', details: { group: group._id } });
    
    // Notify group owner and admins
    const owner = group.members.find(m => m.role === 'owner');
    if (owner && !owner.userId.equals(userId)) {
      await createNotification(
        owner.userId,
        'member_joined',
        'New Member Joined',
        `A new member joined your group "${group.subject} - ${group.topic}"`,
        { groupId: group._id, userId },
        'low'
      );
    }
    
    res.json({ message: 'Joined group.', group });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Leave a group
export const leaveGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user._id;
    const group = await LearningGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found.' });
    const before = group.members.length;
    group.members = group.members.filter(m => !m.userId.equals(userId));
    if (group.members.length === before) {
      return res.status(404).json({ message: 'Not a member.' });
    }
    await group.save();
    await ActivityLog.create({ userId: userId, actionType: 'leave_group', details: { group: group._id } });
    res.json({ message: 'Left group.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Search groups by grade, subject, topic (partial match)
export const searchGroups = async (req, res) => {
  try {
    const { grade, subject, topic, q } = req.query;
    const filter = {};
    if (grade) filter.grade = grade;
    if (subject) filter.subject = subject;
    if (topic) filter.topic = topic;
    if (q) {
      filter.$or = [
        { grade: new RegExp(q, 'i') },
        { subject: new RegExp(q, 'i') },
        { topic: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') }
      ];
    }
    const groups = await LearningGroup.find(filter).limit(50);
    res.json(groups);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get group details
export const getGroup = async (req, res) => {
  try {
    const group = await LearningGroup.findById(req.params.id)
      .populate('members.userId', 'name email')
      .populate('createdBy', 'name email');
    if (!group) return res.status(404).json({ message: 'Group not found.' });
    res.json(group);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// List groups the user has joined
export const listMyGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await LearningGroup.find({ 'members.userId': userId });
    res.json(groups);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update member role (owner only)
export const updateMemberRole = async (req, res) => {
  try {
    const groupId = req.params.id;
    const memberId = req.params.userId;
    const { role } = req.body;
    const userId = req.user._id;

    if (!['member', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    const group = await LearningGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found.' });

    // Check if user is owner
    const isOwner = group.members.some(m => m.userId.equals(userId) && m.role === 'owner');
    if (!isOwner) {
      return res.status(403).json({ message: 'Only group owner can change member roles.' });
    }

    const member = group.members.find(m => m.userId.equals(memberId));
    if (!member) return res.status(404).json({ message: 'User not a member.' });

    if (member.role === 'owner') {
      return res.status(400).json({ message: 'Cannot change owner role.' });
    }

    member.role = role;
    await group.save();

    await ActivityLog.create({
      userId,
      actionType: 'change_member_role',
      details: { group: groupId, member: memberId, role }
    });

    // Notify the member
    await createNotification(
      memberId,
      'role_changed',
      'Your Role Was Updated',
      `Your role in group "${group.subject} - ${group.topic}" has been changed to ${role}`,
      { groupId, role },
      'medium'
    );

    res.json({ message: 'Member role updated.', group });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Remove member (owner only)
export const removeMember = async (req, res) => {
  try {
    const groupId = req.params.id;
    const memberId = req.params.userId;
    const userId = req.user._id;

    const group = await LearningGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found.' });

    // Check if user is owner
    const isOwner = group.members.some(m => m.userId.equals(userId) && m.role === 'owner');
    if (!isOwner) {
      return res.status(403).json({ message: 'Only group owner can remove members.' });
    }

    const member = group.members.find(m => m.userId.equals(memberId));
    if (!member) return res.status(404).json({ message: 'User not a member.' });

    if (member.role === 'owner') {
      return res.status(400).json({ message: 'Cannot remove owner.' });
    }

    group.members = group.members.filter(m => !m.userId.equals(memberId));
    await group.save();

    await ActivityLog.create({
      userId,
      actionType: 'remove_member',
      details: { group: groupId, member: memberId }
    });

    // Notify the removed member
    await createNotification(
      memberId,
      'removed_from_group',
      'Removed from Group',
      `You have been removed from group "${group.subject} - ${group.topic}"`,
      { groupId },
      'high'
    );

    res.json({ message: 'Member removed.', group });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Invite user to group (owner/admin only)
export const inviteUser = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { userId: targetUserId, email } = req.body;
    const userId = req.user._id;

    const group = await LearningGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found.' });

    // Check if user is owner or admin
    const member = group.members.find(m => m.userId.equals(userId));
    if (!member || !['owner', 'admin'].includes(member.role)) {
      return res.status(403).json({ message: 'Only owner or admin can invite users.' });
    }

    // Find target user
    const User = (await import('../models/User.js')).default;
    let targetUser;
    if (targetUserId) {
      targetUser = await User.findById(targetUserId);
    } else if (email) {
      targetUser = await User.findOne({ email });
    }

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if already a member
    if (group.members.some(m => m.userId.equals(targetUser._id))) {
      return res.status(400).json({ message: 'User is already a member.' });
    }

    // Send invitation notification
    await createNotification(
      targetUser._id,
      'group_invite',
      'Group Invitation',
      `You've been invited to join "${group.subject} - ${group.topic}"`,
      { groupId, invitedBy: userId },
      'high'
    );

    await ActivityLog.create({
      userId,
      actionType: 'invite_user',
      details: { group: groupId, invitedUser: targetUser._id }
    });

    res.json({ message: 'Invitation sent.', user: { id: targetUser._id, email: targetUser.email, name: targetUser.profile.name } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

