// User joins a session (attendance)
exports.joinSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user._id;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
    // Prevent duplicate join
    const alreadyJoined = session.attendees.find(a => a.userId.toString() === userId.toString() && !a.leftAt);
    if (alreadyJoined) return res.status(400).json({ success: false, error: 'User already joined' });
    session.attendees.push({ userId, joinedAt: new Date() });
    await session.save();
    await ActivityLog.create({
      user: userId,
      action: 'session_joined',
      details: { sessionId: session._id },
      timestamp: new Date(),
    });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// User leaves a session (attendance)
exports.leaveSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user._id;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
    // Find the attendee record without leftAt
    const attendee = session.attendees.find(a => a.userId.toString() === userId.toString() && !a.leftAt);
    if (!attendee) return res.status(400).json({ success: false, error: 'User not currently joined' });
    attendee.leftAt = new Date();
    await session.save();
    await ActivityLog.create({
      user: userId,
      action: 'session_left',
      details: { sessionId: session._id },
      timestamp: new Date(),
    });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// backend/controllers/sessionController.js
const Session = require('../models/Session');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// Create a new session (on login)
exports.createSession = async (req, res) => {
  try {
    const { userId, userAgent, ip, meetingLink } = req.body;
    const session = new Session({
      user: userId,
      userAgent: userAgent || req.headers['user-agent'],
      ip: ip || req.ip,
      meetingLink,
      createdAt: new Date(),
      isActive: true,
    });
    await session.save();
    await ActivityLog.create({
      user: userId,
      action: 'session_created',
      details: { sessionId: session._id, ip: session.ip, meetingLink: session.meetingLink },
      timestamp: new Date(),
    });
    res.status(201).json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update meeting link for a session
exports.updateMeetingLink = async (req, res) => {
  try {
    const { sessionId, meetingLink } = req.body;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
    session.meetingLink = meetingLink;
    await session.save();
    await ActivityLog.create({
      user: req.user ? req.user._id : undefined,
      action: 'meeting_link_updated',
      details: { sessionId: session._id, meetingLink },
      timestamp: new Date(),
    });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// End a session (on logout)
exports.endSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
    session.isActive = false;
    session.endedAt = new Date();
    await session.save();
    await ActivityLog.create({
      user: session.user,
      action: 'session_ended',
      details: { sessionId: session._id },
      timestamp: new Date(),
    });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Validate a session (check if active)
exports.validateSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await Session.findById(sessionId);
    if (!session || !session.isActive) {
      return res.status(401).json({ success: false, error: 'Invalid or expired session' });
    }
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// List sessions for a user (admin or self)
exports.listSessions = async (req, res) => {
  try {
    const { userId } = req.query;
    const sessions = await Session.find({ user: userId }).sort({ createdAt: -1 });
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
