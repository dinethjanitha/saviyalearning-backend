import express from 'express';
import {	signup,
	login,
	refreshToken,
	requestPasswordReset,
	resetPassword,
	logout,
	verifyEmail
} from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', signup);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/refresh-token
router.post('/refresh-token', refreshToken);

// POST /api/auth/request-password-reset
router.post('/request-password-reset', requestPasswordReset);

// POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

// POST /api/auth/logout
router.post('/logout', logout);

// GET /api/auth/verify-email
router.get('/verify-email', verifyEmail);

export default router;
