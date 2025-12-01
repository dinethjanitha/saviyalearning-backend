import express from 'express';
import {
  sendMessage,
  getMessages,
  deleteMessage,
  editMessage,
  getUnreadCount,
  adminGetMessages
} from '../controllers/chatController.js';
import { authenticateJWT as auth, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Send a message to a group
router.post('/send', auth, sendMessage);

// Get messages for a group
router.get('/group/:groupId', auth, getMessages);

// Delete a message
router.delete('/:messageId', auth, deleteMessage);

// Edit a message
router.put('/:messageId', auth, editMessage);

// Get unread message count
router.get('/unread/count', auth, getUnreadCount);

// Admin: Get all messages with filters
router.get('/admin/all', auth, isAdmin, adminGetMessages);

export default router;
