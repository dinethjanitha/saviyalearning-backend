import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  getPreferences,
  updatePreferences,
  sendToUsers,
  broadcastToAll,
  getNotificationStats
} from '../controllers/notificationController.js';
import { authenticateJWT as auth, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get user notifications
router.get('/', auth, getNotifications);

// Get unread count
router.get('/unread/count', auth, getUnreadCount);

// Mark notification as read
router.patch('/:id/read', auth, markAsRead);

// Mark all notifications as read
router.patch('/read/all', auth, markAllAsRead);

// Delete notification
router.delete('/:id', auth, deleteNotification);

// Delete all read notifications
router.delete('/read/all', auth, deleteAllRead);

// Get notification preferences
router.get('/preferences', auth, getPreferences);

// Update notification preferences
router.put('/preferences', auth, updatePreferences);

// Admin: Send notification to specific users
router.post('/admin/send', auth, isAdmin, sendToUsers);

// Admin: Broadcast notification to all users
router.post('/admin/broadcast', auth, isAdmin, broadcastToAll);

// Admin: Get notification statistics
router.get('/admin/statistics', auth, isAdmin, getNotificationStats);

export default router;
