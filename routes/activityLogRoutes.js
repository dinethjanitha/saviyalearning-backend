import express from 'express';
import { getActivityLogs } from '../controllers/activityLogController.js';
import { authenticateJWT as auth, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Admin: List activity logs
router.get('/', auth, isAdmin, getActivityLogs);

export default router;
