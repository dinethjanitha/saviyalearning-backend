import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

import app from './app.js';
import http from 'http';
import { initializeSocket } from './services/socketService.js';

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Socket.io initialized');
});
