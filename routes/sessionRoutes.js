// backend/routes/sessionRoutes.js

import express from 'express';

import * as sessionController from '../controllers/sessionController.js';
import { authenticateJWT as auth, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Create session (login) - called after successful login










// Join a session (attendance)
router.post('/join', auth, sessionController.joinSession);
// Leave a session (attendance)
router.post('/leave', auth, sessionController.leaveSession);

// Create a session
router.post('/create', auth, sessionController.createSession);
// End a session
router.post('/end', auth, sessionController.endSession);
// Validate a session
router.post('/validate', sessionController.validateSession);
// List sessions
router.get('/list', auth, sessionController.listSessions);
// Update meeting link
router.post('/update-meeting-link', auth, sessionController.updateMeetingLink);

export default router;