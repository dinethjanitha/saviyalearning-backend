import express from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
import { authenticateJWT } from '../middleware/auth.js';

// Admin role middleware
function requireAdmin(req, res, next) {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  next();
}

const router = express.Router();

// GET /api/analytics - Get admin analytics
router.get('/', authenticateJWT, requireAdmin, getAnalytics);

export default router;
