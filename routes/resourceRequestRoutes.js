import express from 'express';
import {
  createResourceRequest,
  getResourceRequests,
  getResourceRequestById,
  getMyResourceRequests,
  updateResourceRequest,
  deleteResourceRequest,
  respondToRequest,
  markAsFulfilled,
  closeRequest,
  reopenRequest,
  adminGetResourceRequests,
  getRequestStatistics
} from '../controllers/resourceRequestController.js';
import { authenticateJWT as auth, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create a new resource request
router.post('/', auth, createResourceRequest);

// Get all resource requests with filters
router.get('/', getResourceRequests);

// Get my resource requests
router.get('/my', auth, getMyResourceRequests);

// Get resource request statistics
router.get('/statistics', auth, getRequestStatistics);

// Get a single resource request by ID
router.get('/:id', getResourceRequestById);

// Update resource request
router.put('/:id', auth, updateResourceRequest);

// Delete resource request
router.delete('/:id', auth, deleteResourceRequest);

// Respond to a resource request
router.post('/:id/respond', auth, respondToRequest);

// Mark request as fulfilled
router.patch('/:id/fulfill', auth, markAsFulfilled);

// Close request
router.patch('/:id/close', auth, closeRequest);

// Reopen request
router.patch('/:id/reopen', auth, reopenRequest);

// Admin: Get all resource requests
router.get('/admin/all', auth, isAdmin, adminGetResourceRequests);

export default router;
