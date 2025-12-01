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
