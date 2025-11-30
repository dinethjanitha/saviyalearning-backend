// backend/routes/sessionRoutes.js
const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const auth = require('../middleware/auth');

// Create session (login) - called after successful login









// Join a session (attendance)
router.post('/join', auth, sessionController.joinSession);
// Leave a session (attendance)
router.post('/leave', auth, sessionController.leaveSession);

router.post('/create', auth, sessionController.createSession);
router.post('/end', auth, sessionController.endSession);
router.post('/validate', sessionController.validateSession);
router.get('/list', auth, sessionController.listSessions);
router.post('/update-meeting-link', auth, sessionController.updateMeetingLink);

module.exports = router;