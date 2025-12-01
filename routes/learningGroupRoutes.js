import express from 'express';

import {
  createGroup,
  joinGroup,
  leaveGroup,
  searchGroups,
  getGroup,
  listMyGroups,
  adminListGroups,
  adminUpdateGroup,
  adminDeleteGroup,
  adminRemoveMember,
  adminChangeMemberRole,
  updateMemberRole,
  removeMember,
  inviteUser
} from '../controllers/learningGroupController.js';
import { authenticateJWT as auth, isAdmin } from '../middleware/auth.js';

const router = express.Router();
// Admin: List/search all groups
router.get('/', auth, isAdmin, adminListGroups);
// Admin: Update group
router.put('/:id', auth, isAdmin, adminUpdateGroup);
// Admin: Delete/archive group
router.delete('/:id', auth, isAdmin, adminDeleteGroup);
// Admin: Remove member
router.delete('/:id/members/:userId', auth, isAdmin, adminRemoveMember);
// Admin: Change member role
router.patch('/:id/members/:userId/role', auth, isAdmin, adminChangeMemberRole);


// Create group (auth required)
router.post('/', auth, createGroup);
// Join group
router.post('/:id/join', auth, joinGroup);
// Leave group
router.post('/:id/leave', auth, leaveGroup);
// Invite user to group (owner/admin)
router.post('/:id/invite', auth, inviteUser);
// Update member role (owner only)
router.patch('/:id/members/:userId/role', auth, updateMemberRole);
// Remove member (owner only)
router.delete('/:id/members/:userId', auth, removeMember);
// Search groups
router.get('/search', searchGroups);

// List my groups (must be before /:id)
router.get('/my', auth, listMyGroups);
// Get group details
router.get('/:id', getGroup);

export default router;
