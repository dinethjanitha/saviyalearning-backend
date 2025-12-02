import Session from '../models/Session.js';
import User from '../models/User.js';
import LearningGroup from '../models/LearningGroup.js';
import ActivityLog from '../models/ActivityLog.js';
import { createNotification } from './notificationController.js';
import { sendMail } from '../services/mailService.js';

// User joins a session (attendance)
export const joinSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user._id;
    console.log('Join session request:', { sessionId, userId: userId.toString() });
    
    const session = await Session.findById(sessionId);
    if (!session) {
      console.log('Session not found:', sessionId);
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    
    console.log('Session found:', { id: session._id, title: session.title, attendees: session.attendees.length });
    
    // Prevent duplicate join
    const alreadyJoined = session.attendees.find(a => a.userId.toString() === userId.toString() && !a.leftAt);
    if (alreadyJoined) {
      console.log('User already joined');
      return res.status(400).json({ success: false, error: 'User already joined' });
    }
    
    session.attendees.push({ userId, joinedAt: new Date() });
    await session.save();
    
    console.log('User joined successfully, new attendee count:', session.attendees.length);
    
    await ActivityLog.create({
      userId: req.user._id,
      actionType: 'session_joined',
      details: { sessionId: session._id },
      timestamp: new Date(),
    });
    res.json({ success: true, session });
  } catch (err) {
    console.error('Join session error:', err);
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

// Create a new learning session
export const createSession = async (req, res) => {
  try {
    const { title, groupId, scheduledAt, duration, meetingLink } = req.body;
    
    if (!title || !groupId || !scheduledAt || !duration) {
      return res.status(400).json({ 
        success: false, 
        error: 'Title, groupId, scheduledAt, and duration are required' 
      });
    }

    const session = new Session({
      title,
      groupId,
      teacherId: req.user._id,
      scheduledAt: new Date(scheduledAt),
      duration,
      meetingLink,
      status: 'scheduled',
      createdAt: new Date(),
    });
    
    await session.save();
    
    await ActivityLog.create({
      userId: req.user._id,
      actionType: 'session_created',
      details: { sessionId: session._id, title, groupId },
      timestamp: new Date(),
    });
    
    // Send email notification to all group members
    try {
      const group = await LearningGroup.findById(groupId).populate('members.userId', 'email profile.name');
      if (group && group.members.length > 0) {
        const teacher = await User.findById(req.user._id).select('profile.name email');
        const teacherName = teacher?.profile?.name || teacher?.email || 'A teacher';
        const scheduledDate = new Date(scheduledAt).toLocaleString('en-US', {
          dateStyle: 'full',
          timeStyle: 'short'
        });
        
        // Send email to each member (except the teacher)
        const emailPromises = group.members
          .filter(member => member.userId && member.userId._id.toString() !== req.user._id.toString())
          .map(async (member) => {
            const memberEmail = member.userId.email;
            const memberName = member.userId.profile?.name || memberEmail;
            
            try {
              await sendMail({
                to: memberEmail,
                subject: `New Session Scheduled: ${title}`,
                html: sessionScheduledEmail(memberName, teacherName, {
                  title,
                  groupInfo: `${group.grade} - ${group.subject} - ${group.topic}`,
                  scheduledDate,
                  duration,
                  meetingLink
                }),
                text: `New Session Scheduled: ${title}\n\nScheduled by: ${teacherName}\nGroup: ${group.grade} - ${group.subject} - ${group.topic}\nWhen: ${scheduledDate}\nDuration: ${duration} minutes${meetingLink ? `\nMeeting Link: ${meetingLink}` : ''}`
              });
              console.log(`[SUCCESS] Session notification email sent to ${memberEmail}`);
            } catch (emailError) {
              console.error(`[ERROR] Failed to send email to ${memberEmail}:`, emailError.message);
            }
          });
        
        await Promise.allSettled(emailPromises);
      }
    } catch (notifError) {
      console.error('Error sending session notification emails:', notifError);
      // Don't fail the request if email fails
    }
    
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

// Update session details (teacher only)
export const updateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title, scheduledAt, duration, meetingLink } = req.body;
    
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
    
    // Check if user is the teacher or admin
    const isTeacher = session.teacherId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isTeacher && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Only the teacher or admin can update this session' });
    }
    
    // Only allow updates for scheduled sessions
    if (session.status !== 'scheduled') {
      return res.status(400).json({ success: false, error: 'Can only update scheduled sessions' });
    }
    
    // Update fields
    if (title) session.title = title;
    if (scheduledAt) session.scheduledAt = scheduledAt;
    if (duration) session.duration = duration;
    if (meetingLink !== undefined) session.meetingLink = meetingLink;
    
    await session.save();
    
    await ActivityLog.create({
      userId: req.user._id,
      actionType: 'session_updated',
      details: { sessionId: session._id, updates: { title, scheduledAt, duration, meetingLink } },
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
    const session = await Session.findById(sessionId).populate('groupId').populate('teacherId');
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
    
    // Check if user is the teacher or admin
    const isTeacher = session.teacherId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isTeacher && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Only the teacher or admin can start this session' });
    }
    
    if (session.status === 'ongoing') return res.status(400).json({ success: false, error: 'Session already started' });
    if (session.status !== 'scheduled') return res.status(400).json({ success: false, error: 'Can only start scheduled sessions' });
    
    session.status = 'ongoing';
    session.startedAt = new Date();
    await session.save();
    
    // Send email notifications to all group members
    try {
      const group = await LearningGroup.findById(session.groupId._id).populate('members.userId');
      if (group && group.members && group.members.length > 0) {
        const teacherName = session.teacherId.profile?.name || session.teacherId.email;
        const groupInfo = `${group.grade} - ${group.subject} - ${group.topic}`;
        
        // Send emails to all members
        const emailPromises = group.members.map(async (member) => {
          if (member.userId && member.userId.email) {
            const memberName = member.userId.profile?.name || member.userId.email;
            
            try {
              await sendMail({
                to: member.userId.email,
                subject: `Session Started: ${session.title}`,
                html: sessionStartedEmail(memberName, {
                  title: session.title,
                  groupInfo,
                  teacherName,
                  meetingLink: session.meetingLink
                }),
              });
              console.log(`[SUCCESS] Session start email sent to ${member.userId.email}`);
            } catch (emailErr) {
              console.error(`[ERROR] Failed to send email to ${member.userId.email}:`, emailErr);
            }
          }
        });
        
        await Promise.allSettled(emailPromises);
        console.log(`[INFO] Session start notifications sent to ${group.members.length} members`);
      }
    } catch (emailError) {
      console.error('Error sending session start emails:', emailError);
      // Don't fail the request if emails fail
    }
    
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

// End a session
export const endSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
    
    // Check if user is the teacher or admin
    const isTeacher = session.teacherId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isTeacher && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Only the teacher or admin can end this session' });
    }
    
    if (session.status !== 'ongoing') return res.status(400).json({ success: false, error: 'Can only end ongoing sessions' });
    
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
    const { userId, groupId } = req.query;
    const query = {};
    
    if (userId) {
      // Get sessions where user is teacher or attendee
      query.$or = [
        { teacherId: userId },
        { 'attendees.userId': userId }
      ];
    }
    
    if (groupId) {
      query.groupId = groupId;
    }
    
    const sessions = await Session.find(query)
      .sort({ scheduledAt: -1 })
      .populate('teacherId', 'email profile')
      .populate('groupId', 'grade subject topic')
      .populate('attendees.userId', 'email profile');
      
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
    
    // Check if user is the teacher or admin
    const isTeacher = session.teacherId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isTeacher && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Only the teacher or admin can delete this session' });
    }
    
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

// Search/filter sessions
export const searchSessions = async (req, res) => {
  try {
    const { status, groupId, teacherId, fromDate, toDate, limit = 20, page = 1 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (groupId) query.groupId = groupId;
    if (teacherId) query.teacherId = teacherId;
    
    if (fromDate || toDate) {
      query.scheduledAt = {};
      if (fromDate) query.scheduledAt.$gte = new Date(fromDate);
      if (toDate) query.scheduledAt.$lte = new Date(toDate);
    }

    const sessions = await Session.find(query)
      .sort({ scheduledAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('teacherId', 'email profile')
      .populate('groupId', 'grade subject topic')
      .populate('attendees.userId', 'email profile');

    const total = await Session.countDocuments(query);

    res.json({ success: true, sessions, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get session attendees
export const getSessionAttendees = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const session = await Session.findById(sessionId)
      .populate('attendees.userId', 'email profile.name profile.avatar');

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    res.json({ success: true, attendees: session.attendees });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};