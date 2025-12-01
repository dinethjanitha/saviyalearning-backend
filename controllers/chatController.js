import ChatMessage from '../models/ChatMessage.js';
import LearningGroup from '../models/LearningGroup.js';
import ActivityLog from '../models/ActivityLog.js';

// Send a message to a group chat
export const sendMessage = async (req, res) => {
  try {
    const { groupId, message, type = 'text' } = req.body;
    const userId = req.user._id;

    if (!groupId || !message) {
      return res.status(400).json({ message: 'GroupId and message are required.' });
    }

    // Check if user is a member of the group
    const group = await LearningGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found.' });

    const isMember = group.members.some(m => m.userId.equals(userId));
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group.' });
    }

    // Create chat message
    const chatMessage = await ChatMessage.create({
      groupId,
      userId,
      message,
      type,
      timestamp: new Date(),
    });

    // Populate user details
    const populatedMessage = await ChatMessage.findById(chatMessage._id)
      .populate('userId', 'email profile.name profile.avatar');

    // Log activity
    await ActivityLog.create({
      userId,
      actionType: 'chat_message_sent',
      details: { groupId, messageId: chatMessage._id },
    });

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get chat messages for a group with pagination
export const getMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 50, before } = req.query;
    const userId = req.user._id;

    // Check if user is a member of the group
    const group = await LearningGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found.' });

    const isMember = group.members.some(m => m.userId.equals(userId));
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group.' });
    }

    // Build query
    const query = { groupId };
    if (before) {
      query.timestamp = { $lt: new Date(before) };
    }

    // Fetch messages
    const messages = await ChatMessage.find(query)
      .sort({ timestamp: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('userId', 'email profile.name profile.avatar');

    const total = await ChatMessage.countDocuments({ groupId });

    res.json({
      success: true,
      messages: messages.reverse(), // Return in chronological order
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a message (author or admin)
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await ChatMessage.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found.' });

    // Check authorization: message author or admin
    const isAuthor = message.userId.equals(userId);
    const isAdmin = req.user && ['admin', 'superadmin'].includes(req.user.role);

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this message.' });
    }

    await message.deleteOne();

    // Log activity
    await ActivityLog.create({
      userId,
      actionType: isAdmin ? 'admin_delete_message' : 'delete_message',
      details: { messageId, groupId: message.groupId },
    });

    res.json({ success: true, message: 'Message deleted.' });
  } catch (err) {
    console.error('Delete message error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Edit a message (author only, within 15 minutes)
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message: newMessage } = req.body;
    const userId = req.user._id;

    if (!newMessage) {
      return res.status(400).json({ message: 'Message content is required.' });
    }

    const message = await ChatMessage.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found.' });

    // Check if user is the author
    if (!message.userId.equals(userId)) {
      return res.status(403).json({ message: 'You can only edit your own messages.' });
    }

    // Check if message is older than 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (message.timestamp < fifteenMinutesAgo) {
      return res.status(403).json({ message: 'Messages can only be edited within 15 minutes.' });
    }

    message.message = newMessage;
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    const updatedMessage = await ChatMessage.findById(messageId)
      .populate('userId', 'email profile.name profile.avatar');

    // Log activity
    await ActivityLog.create({
      userId,
      actionType: 'edit_message',
      details: { messageId, groupId: message.groupId },
    });

    res.json({ success: true, message: updatedMessage });
  } catch (err) {
    console.error('Edit message error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get unread message count for a user across all groups
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { lastSeen } = req.query; // ISO timestamp of last seen messages

    // Get all groups user is member of
    const groups = await LearningGroup.find({ 'members.userId': userId });
    const groupIds = groups.map(g => g._id);

    const query = { groupId: { $in: groupIds } };
    if (lastSeen) {
      query.timestamp = { $gt: new Date(lastSeen) };
    }

    const unreadCount = await ChatMessage.countDocuments(query);

    res.json({ success: true, unreadCount });
  } catch (err) {
    console.error('Get unread count error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: Get all messages with filters
export const adminGetMessages = async (req, res) => {
  try {
    const { groupId, userId, page = 1, limit = 50, type } = req.query;

    const query = {};
    if (groupId) query.groupId = groupId;
    if (userId) query.userId = userId;
    if (type) query.type = type;

    const messages = await ChatMessage.find(query)
      .sort({ timestamp: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('userId', 'email profile.name')
      .populate('groupId', 'grade subject topic');

    const total = await ChatMessage.countDocuments(query);

    res.json({
      success: true,
      messages,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('Admin get messages error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
