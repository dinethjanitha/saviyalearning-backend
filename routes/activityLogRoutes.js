import express from 'express';
import { getActivityLogs, getMyActivityLogs } from '../controllers/activityLogController.js';
import { authenticateJWT as auth, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// User: Get own activity logs
router.get('/my', auth, getMyActivityLogs);

// Admin: List activity logs
router.get('/', auth, isAdmin, getActivityLogs);

export default router;
