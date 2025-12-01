import ResourceRequest from '../models/ResourceRequest.js';
import Resource from '../models/Resource.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { getIO } from '../services/socketService.js';

// Create a new resource request
export const createResourceRequest = async (req, res) => {
  try {
    const { title, description, subject, topic, type, groupId } = req.body;
    const requesterId = req.user._id;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required.' });
    }

    // Convert empty string to undefined for optional groupId
    const requestData = {
      requesterId,
      title,
      description,
      subject,
      topic,
      type,
      status: 'open',
      createdAt: new Date(),
    };
    
    // Only add groupId if it's a valid non-empty string
    if (groupId && groupId.trim() !== '') {
      requestData.groupId = groupId;
    }

    const resourceRequest = await ResourceRequest.create(requestData);

    const populatedRequest = await ResourceRequest.findById(resourceRequest._id)
      .populate('requesterId', 'email profile.name profile.avatar');

    // Log activity
    await ActivityLog.create({
      userId: requesterId,
      actionType: 'resource_request_created',
      details: { requestId: resourceRequest._id, title },
    });

    // Notify group members via socket if groupId provided
    if (groupId) {
      try {
        const io = getIO();
        io.to(`group-${groupId}`).emit('new-resource-request', populatedRequest);
      } catch (err) {
        console.error('Socket notification error:', err);
      }
    }

    res.status(201).json({ success: true, request: populatedRequest });
  } catch (err) {
    console.error('Create resource request error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all resource requests with filters and pagination
export const getResourceRequests = async (req, res) => {
  try {
    const { status, subject, topic, type, groupId, page = 1, limit = 20, q } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (subject) filter.subject = subject;
    if (topic) filter.topic = topic;
    if (type) filter.type = type;
    if (groupId) filter.groupId = groupId;
    
    if (q) {
      filter.$or = [
        { title: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
        { subject: new RegExp(q, 'i') },
        { topic: new RegExp(q, 'i') }
      ];
    }

    const requests = await ResourceRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('requesterId', 'email profile.name profile.avatar')
      .populate('responses.userId', 'email profile.name profile.avatar')
      .populate('responses.resourceId');

    const total = await ResourceRequest.countDocuments(filter);

    res.json({
      success: true,
      requests,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('Get resource requests error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get a single resource request by ID
export const getResourceRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await ResourceRequest.findById(id)
      .populate('requesterId', 'email profile.name profile.avatar')
      .populate('responses.userId', 'email profile.name profile.avatar')
      .populate('responses.resourceId');

    if (!request) {
      return res.status(404).json({ message: 'Resource request not found.' });
    }

    res.json({ success: true, request });
  } catch (err) {
    console.error('Get resource request error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get my resource requests
export const getMyResourceRequests = async (req, res) => {
  try {
    const requesterId = req.user._id;
    const { status, page = 1, limit = 20 } = req.query;

    const filter = { requesterId };
    if (status) filter.status = status;

    const requests = await ResourceRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('responses.userId', 'email profile.name profile.avatar')
      .populate('responses.resourceId');

    const total = await ResourceRequest.countDocuments(filter);

    res.json({
      success: true,
      requests,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('Get my requests error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update resource request (requester only)
export const updateResourceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, subject, topic, type } = req.body;
    const userId = req.user._id;

    const request = await ResourceRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Resource request not found.' });
    }

    // Only requester can update
    if (!request.requesterId.equals(userId)) {
      return res.status(403).json({ message: 'Only the requester can update this request.' });
    }

    if (title !== undefined) request.title = title;
    if (description !== undefined) request.description = description;
    if (subject !== undefined) request.subject = subject;
    if (topic !== undefined) request.topic = topic;
    if (type !== undefined) request.type = type;
    request.updatedAt = new Date();

    await request.save();

    const updatedRequest = await ResourceRequest.findById(id)
      .populate('requesterId', 'email profile.name profile.avatar')
      .populate('responses.userId', 'email profile.name profile.avatar')
      .populate('responses.resourceId');

    // Log activity
    await ActivityLog.create({
      userId,
      actionType: 'resource_request_updated',
      details: { requestId: id },
    });

    res.json({ success: true, request: updatedRequest });
  } catch (err) {
    console.error('Update resource request error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete resource request (requester or admin)
export const deleteResourceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const request = await ResourceRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Resource request not found.' });
    }

    // Only requester or admin can delete
    const isRequester = request.requesterId.equals(userId);
    const isAdmin = req.user && ['admin', 'superadmin'].includes(req.user.role);

    if (!isRequester && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this request.' });
    }

    await request.deleteOne();

    // Log activity
    await ActivityLog.create({
      userId,
      actionType: isAdmin ? 'admin_delete_resource_request' : 'delete_resource_request',
      details: { requestId: id },
    });

    res.json({ success: true, message: 'Resource request deleted.' });
  } catch (err) {
    console.error('Delete resource request error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Respond to a resource request with a resource
export const respondToRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { resourceId, message } = req.body;
    const userId = req.user._id;

    const request = await ResourceRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Resource request not found.' });
    }

    if (request.status === 'closed') {
      return res.status(400).json({ message: 'This request is closed.' });
    }

    // Verify resource exists if provided
    if (resourceId) {
      const resource = await Resource.findById(resourceId);
      if (!resource) {
        return res.status(404).json({ message: 'Resource not found.' });
      }
    }

    // Add response
    request.responses.push({
      userId,
      resourceId: resourceId || null,
      message: message || '',
      date: new Date(),
    });
    request.updatedAt = new Date();

    await request.save();

    const updatedRequest = await ResourceRequest.findById(id)
      .populate('requesterId', 'email profile.name profile.avatar')
      .populate('responses.userId', 'email profile.name profile.avatar')
      .populate('responses.resourceId');

    // Update reputation for responder
    await User.findByIdAndUpdate(userId, {
      $inc: { 'reputation.resourcesShared': 1 }
    });

    // Log activity
    await ActivityLog.create({
      userId,
      actionType: 'resource_request_response',
      details: { requestId: id, resourceId },
    });

    // Notify requester via socket
    try {
      const io = getIO();
      io.to(`user-${request.requesterId}`).emit('request-response', {
        requestId: id,
        responder: {
          _id: userId,
          name: req.user.profile.name
        }
      });
    } catch (err) {
      console.error('Socket notification error:', err);
    }

    res.json({ success: true, request: updatedRequest });
  } catch (err) {
    console.error('Respond to request error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Mark request as fulfilled (requester only)
export const markAsFulfilled = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const request = await ResourceRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Resource request not found.' });
    }

    // Only requester can mark as fulfilled
    if (!request.requesterId.equals(userId)) {
      return res.status(403).json({ message: 'Only the requester can mark this as fulfilled.' });
    }

    request.status = 'fulfilled';
    request.updatedAt = new Date();
    await request.save();

    const updatedRequest = await ResourceRequest.findById(id)
      .populate('requesterId', 'email profile.name profile.avatar')
      .populate('responses.userId', 'email profile.name profile.avatar')
      .populate('responses.resourceId');

    // Log activity
    await ActivityLog.create({
      userId,
      actionType: 'resource_request_fulfilled',
      details: { requestId: id },
    });

    res.json({ success: true, request: updatedRequest });
  } catch (err) {
    console.error('Mark as fulfilled error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Close request (requester or admin)
export const closeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const request = await ResourceRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Resource request not found.' });
    }

    // Only requester or admin can close
    const isRequester = request.requesterId.equals(userId);
    const isAdmin = req.user && ['admin', 'superadmin'].includes(req.user.role);

    if (!isRequester && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to close this request.' });
    }

    request.status = 'closed';
    request.updatedAt = new Date();
    await request.save();

    const updatedRequest = await ResourceRequest.findById(id)
      .populate('requesterId', 'email profile.name profile.avatar')
      .populate('responses.userId', 'email profile.name profile.avatar')
      .populate('responses.resourceId');

    // Log activity
    await ActivityLog.create({
      userId,
      actionType: 'resource_request_closed',
      details: { requestId: id },
    });

    res.json({ success: true, request: updatedRequest });
  } catch (err) {
    console.error('Close request error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Reopen request (requester only)
export const reopenRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const request = await ResourceRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Resource request not found.' });
    }

    // Only requester can reopen
    if (!request.requesterId.equals(userId)) {
      return res.status(403).json({ message: 'Only the requester can reopen this request.' });
    }

    request.status = 'open';
    request.updatedAt = new Date();
    await request.save();

    const updatedRequest = await ResourceRequest.findById(id)
      .populate('requesterId', 'email profile.name profile.avatar')
      .populate('responses.userId', 'email profile.name profile.avatar')
      .populate('responses.resourceId');

    // Log activity
    await ActivityLog.create({
      userId,
      actionType: 'resource_request_reopened',
      details: { requestId: id },
    });

    res.json({ success: true, request: updatedRequest });
  } catch (err) {
    console.error('Reopen request error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: Get all resource requests with advanced filters
export const adminGetResourceRequests = async (req, res) => {
  try {
    const { status, requesterId, page = 1, limit = 30 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (requesterId) filter.requesterId = requesterId;

    const requests = await ResourceRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('requesterId', 'email profile.name')
      .populate('responses.userId', 'email profile.name')
      .populate('responses.resourceId');

    const total = await ResourceRequest.countDocuments(filter);

    res.json({
      success: true,
      requests,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('Admin get requests error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get resource request statistics
export const getRequestStatistics = async (req, res) => {
  try {
    const totalRequests = await ResourceRequest.countDocuments();
    const openRequests = await ResourceRequest.countDocuments({ status: 'open' });
    const fulfilledRequests = await ResourceRequest.countDocuments({ status: 'fulfilled' });
    const closedRequests = await ResourceRequest.countDocuments({ status: 'closed' });

    // Most requested subjects
    const topSubjects = await ResourceRequest.aggregate([
      { $match: { status: 'open' } },
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Most active requesters
    const topRequesters = await ResourceRequest.aggregate([
      { $group: { _id: '$requesterId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      statistics: {
        totalRequests,
        openRequests,
        fulfilledRequests,
        closedRequests,
        topSubjects,
        topRequesters,
      }
    });
  } catch (err) {
    console.error('Get statistics error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
