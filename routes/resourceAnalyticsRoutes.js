import express from 'express';
import { getResourceAnalytics } from '../controllers/resourceAnalyticsController.js';
import { authenticateJWT as auth, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Admin: Get resource analytics
router.get('/', auth, isAdmin, getResourceAnalytics);

export default router;
