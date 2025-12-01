import express from 'express';
import {
  createResourceGroup,
  getResourceGroups,
  getResourceGroupById,
  updateResourceGroup,
  deleteResourceGroup,
  addResourceToGroup,
  removeResourceFromGroup,
  linkLearningGroup,
  unlinkLearningGroup
} from '../controllers/resourceGroupController.js';
import { authenticateJWT as auth, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create resource group (admin)
router.post('/', auth, isAdmin, createResourceGroup);

// Get all resource groups
router.get('/', auth, getResourceGroups);

// Get resource group by ID
router.get('/:id', auth, getResourceGroupById);

// Update resource group (admin)
router.put('/:id', auth, isAdmin, updateResourceGroup);

// Delete resource group (admin)
router.delete('/:id', auth, isAdmin, deleteResourceGroup);

// Add resource to group (admin)
router.post('/:id/resources', auth, isAdmin, addResourceToGroup);

// Remove resource from group (admin)
router.delete('/:id/resources/:resourceId', auth, isAdmin, removeResourceFromGroup);

// Link learning group to resource group (admin)
router.post('/:id/link-group', auth, isAdmin, linkLearningGroup);

// Unlink learning group from resource group (admin)
router.delete('/:id/link-group/:learningGroupId', auth, isAdmin, unlinkLearningGroup);

export default router;
