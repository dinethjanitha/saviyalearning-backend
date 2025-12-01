import express from 'express';
import {
  createReport,
  getReports,
  getReportById,
  getMyReports,
  updateReportStatus,
  takeAction,
  deleteReport,
  getReportStatistics,
  bulkUpdateReports
} from '../controllers/reportController.js';
import { authenticateJWT as auth, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create a new report (authenticated users)
router.post('/', auth, createReport);

// Get my submitted reports
router.get('/my', auth, getMyReports);

// Admin: Get all reports with filters
router.get('/admin/all', auth, isAdmin, getReports);

// Admin: Get report statistics
router.get('/admin/statistics', auth, isAdmin, getReportStatistics);

// Admin: Get a single report by ID
router.get('/admin/:id', auth, isAdmin, getReportById);

// Admin: Update report status
router.patch('/admin/:id/status', auth, isAdmin, updateReportStatus);

// Admin: Take action on reported content/user
router.post('/admin/:id/action', auth, isAdmin, takeAction);

// Admin: Delete report
router.delete('/admin/:id', auth, isAdmin, deleteReport);

// Admin: Bulk update reports
router.post('/admin/bulk-update', auth, isAdmin, bulkUpdateReports);

export default router;
