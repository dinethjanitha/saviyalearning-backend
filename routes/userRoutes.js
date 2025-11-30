import express from 'express';
import { getProfile,
	updateProfile,
	listUsers,
	getUserById,
	updateUserById,
	deleteUserById,
	changeUserRole,
	banUser,
	suspendUser,
	reactivateUser,
	adminResetPassword
} from '../controllers/userController.js';
import { authenticateJWT } from '../middleware/auth.js';

// Admin role middleware
function requireAdmin(req, res, next) {
	if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
		return res.status(403).json({ message: 'Admin access required.' });
	}
	next();
}

const router = express.Router();

// GET /api/users/me - Get current user's profile
router.get('/me', authenticateJWT, getProfile);

// PUT /api/users/me - Update current user's profile
router.put('/me', authenticateJWT, updateProfile);

// --- Admin User Management ---
// GET /api/users - List/search users
router.get('/', authenticateJWT, requireAdmin, listUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', authenticateJWT, requireAdmin, getUserById);

// PUT /api/users/:id - Update user by ID
router.put('/:id', authenticateJWT, requireAdmin, updateUserById);

// DELETE /api/users/:id - Delete user by ID
router.delete('/:id', authenticateJWT, requireAdmin, deleteUserById);

// PATCH /api/users/:id/role - Change user role
router.patch('/:id/role', authenticateJWT, requireAdmin, changeUserRole);

// PATCH /api/users/:id/ban - Ban user
router.patch('/:id/ban', authenticateJWT, requireAdmin, banUser);

// PATCH /api/users/:id/suspend - Suspend user
router.patch('/:id/suspend', authenticateJWT, requireAdmin, suspendUser);

// PATCH /api/users/:id/reactivate - Reactivate user
router.patch('/:id/reactivate', authenticateJWT, requireAdmin, reactivateUser);

// PATCH /api/users/:id/reset-password - Admin reset user password
router.patch('/:id/reset-password', authenticateJWT, requireAdmin, adminResetPassword);

export default router;
