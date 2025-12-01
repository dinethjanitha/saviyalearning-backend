import Session from '../models/Session.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';

// User joins a session (attendance)
export const joinSession = async (req, res) => {
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
      userId: req.user._id,
      actionType: 'session_joined',
      details: { sessionId: session._id },
      timestamp: new Date(),
    });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// User leaves a session (attendance)
export const leaveSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user._id;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
    // Find the latest attendee record for this user without leftAt (support multiple join/leave cycles)
    const attendeeIdx = [...session.attendees].reverse().findIndex(a => a.userId.toString() === userId.toString() && !a.leftAt);
    if (attendeeIdx === -1) {
      // User is not currently joined; idempotent: return success, no-op
      return res.json({ success: true, session, message: 'User not currently joined (idempotent leave)' });
    }
    // attendeeIdx is from the reversed array, so convert to original index
    const realIdx = session.attendees.length - 1 - attendeeIdx;
    // Remove the attendee record from the array
    session.attendees.splice(realIdx, 1);
    await session.save();
    await ActivityLog.create({
      userId: req.user._id,
      actionType: 'session_left',
      details: { sessionId: session._id },
      timestamp: new Date(),
    });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Create a new session (on login)
export const createSession = async (req, res) => {
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
      userId: req.user._id,
      actionType: 'session_created',
      details: { sessionId: session._id, ip: session.ip, meetingLink: session.meetingLink },
      timestamp: new Date(),
    });
    res.status(201).json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update meeting link for a session
export const updateMeetingLink = async (req, res) => {
  try {
    const { sessionId, meetingLink } = req.body;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
    session.meetingLink = meetingLink;
    await session.save();
    await ActivityLog.create({
      userId: req.user ? req.user._id : undefined,
      actionType: 'meeting_link_updated',
      details: { sessionId: session._id, meetingLink },
      timestamp: new Date(),
    });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// Start a session (set status to 'ongoing')
export const startSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
    if (session.status === 'ongoing') return res.status(400).json({ success: false, error: 'Session already started' });
    session.status = 'ongoing';
    session.startedAt = new Date();
    await session.save();
    await ActivityLog.create({
      userId: req.user ? req.user._id : undefined,
      actionType: 'session_started',
      details: { sessionId: session._id },
      timestamp: new Date(),
    });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// End a session (on logout)
export const endSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
    session.status = 'completed';
    session.endedAt = new Date();
    await session.save();
    await ActivityLog.create({
      userId: req.user._id,
      actionType: 'session_ended',
      details: { sessionId: session._id },
      timestamp: new Date(),
    });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Validate a session (check if active)
export const validateSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await Session.findById(sessionId);
    if (!session || session.status === 'completed' || session.status === 'cancelled') {
      return res.status(401).json({ success: false, error: 'Invalid or expired session' });
    }
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// List sessions for a user (admin or self)
export const listSessions = async (req, res) => {
  try {
    const { userId } = req.query;
    const sessions = await Session.find({ user: userId }).sort({ createdAt: -1 });
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete a session by ID (admin or owner)
export const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
    await session.deleteOne();
    await ActivityLog.create({
      userId: req.user ? req.user._id : undefined,
      actionType: 'session_deleted',
      details: { sessionId },
      timestamp: new Date(),
    });
    res.json({ success: true, message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin: List all sessions with optional filters
export const adminListSessions = async (req, res) => {
  try {
    const { page = 1, limit = 30, status, groupId, teacherId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (groupId) filter.groupId = groupId;
    if (teacherId) filter.teacherId = teacherId;
    const sessions = await Session.find(filter)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('groupId teacherId');
    const total = await Session.countDocuments(filter);
    res.json({ sessions, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Delete any session by ID
export const adminDeleteSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
    await session.deleteOne();
    await ActivityLog.create({
      userId: req.user ? req.user._id : undefined,
      actionType: 'admin_session_deleted',
      details: { sessionId },
      timestamp: new Date(),
    });
    res.json({ success: true, message: 'Session deleted (admin)' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin: Update session status (completed, cancelled, etc.)
export const adminUpdateSessionStatus = async (req, res) => {
  try {
    const { sessionId, status } = req.body;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
    session.status = status;
    if (status === 'completed') session.endedAt = new Date();
    await session.save();
    await ActivityLog.create({
      userId: req.user ? req.user._id : undefined,
      actionType: 'admin_session_status_updated',
      details: { sessionId, status },
      timestamp: new Date(),
    });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Analytics: Session status counts
export const sessionStatusCounts = async (req, res) => {
  try {
    const pipeline = [
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ];
    const results = await Session.aggregate(pipeline);
    const counts = {};
    results.forEach(r => { counts[r._id || "unknown"] = r.count; });
    res.json({ success: true, counts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Analytics: Session attendance stats
export const sessionAttendanceStats = async (req, res) => {
  try {
    const pipeline = [
      { $project: { attendeesCount: { $size: "$attendees" } } },
      { $group: {
        _id: null,
        avgAttendance: { $avg: "$attendeesCount" },
        minAttendance: { $min: "$attendeesCount" },
        maxAttendance: { $max: "$attendeesCount" },
        totalSessions: { $sum: 1 }
      }}
    ];
    const [stats] = await Session.aggregate(pipeline);
    res.json({ success: true, stats: stats || {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Analytics: Recent sessions (last 7 days)
export const recentSessionsAnalytics = async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const sessions = await Session.find({ createdAt: { $gte: since } })
      .sort({ createdAt: -1 });
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};