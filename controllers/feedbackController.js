import Feedback from '../models/Feedback.js';
import ActivityLog from '../models/ActivityLog.js';

// Create feedback (public)
export const createFeedback = async (req, res) => {
  try {
    const { message, rating, email, name, type, metadata } = req.body;
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const feedbackData = {
      message,
      rating,
      email,
      name,
      type,
      metadata: metadata || {},
    };

    if (req.user && req.user._id) feedbackData.user = req.user._id;
    if (req.ip) feedbackData.ip = req.ip;
    if (req.headers['user-agent']) feedbackData.userAgent = req.headers['user-agent'];

    const feedback = await Feedback.create(feedbackData);

    // Log activity
    try {
      await ActivityLog.create({
        userId: req.user ? req.user._id : null,
        actionType: 'feedback_created',
        details: { feedbackId: feedback._id, type: feedback.type }
      });
    } catch (e) {
      // non-fatal
      console.error('Activity log error:', e.message);
    }

    res.status(201).json({ message: 'Feedback submitted. Thank you.', feedback });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// List feedbacks (admin) with basic pagination and filtering
export const listFeedbacks = async (req, res) => {
  try {
    const { page = 1, limit = 25, status, type, q } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (q) query.message = { $regex: q, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Feedback.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Feedback.countDocuments(query)
    ]);

    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get feedback by id (admin)
export const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id).populate('user', 'email profile');
    if (!feedback) return res.status(404).json({ message: 'Feedback not found.' });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update feedback status or fields (admin)
export const updateFeedback = async (req, res) => {
  try {
    const updates = req.body;
    const feedback = await Feedback.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    if (!feedback) return res.status(404).json({ message: 'Feedback not found.' });
    res.json({ message: 'Feedback updated.', feedback });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete feedback (admin)
export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found.' });
    res.json({ message: 'Feedback deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
