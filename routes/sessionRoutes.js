// backend/routes/sessionRoutes.js
const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const auth = require('../middleware/auth');

// Create session (login) - called after successful login









module.exports = router;router.get('/list', auth, sessionController.listSessions);// List sessions for a user (admin or self)router.post('/validate', sessionController.validateSession);// Validate sessionrouter.post('/end', auth, sessionController.endSession);// End session (logout)outer.post('/create', auth, sessionController.createSession);