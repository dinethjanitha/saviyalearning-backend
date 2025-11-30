
import express from 'express';
import { addResource, getResources, viewResource, adminDeleteResource, updateResource, deleteResource } from '../controllers/resourceController.js';
import { authenticateJWT as auth, isAdmin } from '../middleware/auth.js';

const router = express.Router();


// Add a new resource to a group
router.post('/', auth, addResource);
// List resources for a group
router.get('/group/:groupId', auth, getResources);
// View a resource (increments views count)
router.get('/:id', auth, viewResource);
// Update a resource (uploader or admin)
router.put('/:id', auth, updateResource);
// Delete a resource (uploader or admin)
router.delete('/:id', auth, deleteResource);
// Admin: Delete a resource (legacy, still works)
router.delete('/:id/admin', auth, isAdmin, adminDeleteResource);

export default router;
