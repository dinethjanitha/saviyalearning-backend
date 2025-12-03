import express from 'express';
import {
  createFeedback,
  listFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback
} from '../controllers/feedbackController.js';
import { authenticateJWT, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public: submit feedback
router.post('/', createFeedback);

// Admin: list feedbacks
router.get('/', authenticateJWT, isAdmin, listFeedbacks);

// Admin: get single feedback
router.get('/:id', authenticateJWT, isAdmin, getFeedbackById);

// Admin: update
router.patch('/:id', authenticateJWT, isAdmin, updateFeedback);

// Admin: delete
router.delete('/:id', authenticateJWT, isAdmin, deleteFeedback);

export default router;
