// Simple Socket.IO service
import { Server } from 'socket.io';

let io;

export const initializeSocket = (server) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://saviyalearn.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a group room
    socket.on('join-group', (groupId) => {
      socket.join(`group-${groupId}`);
      console.log(`Socket ${socket.id} joined group-${groupId}`);
    });

    // Leave a group room
    socket.on('leave-group', (groupId) => {
      socket.leave(`group-${groupId}`);
      console.log(`Socket ${socket.id} left group-${groupId}`);
    });

    // Typing indicators - match frontend event names
    socket.on('typing-start', (data) => {
      console.log(`${data.userName} is typing in group-${data.groupId}`);
      socket.to(`group-${data.groupId}`).emit('user-typing', {
        userId: data.userId,
        userName: data.userName,
      });
    });

    socket.on('typing-stop', (data) => {
      console.log(`${data.userId} stopped typing in group-${data.groupId}`);
      socket.to(`group-${data.groupId}`).emit('user-stop-typing', {
        userId: data.userId,
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  console.log('Socket.io initialized successfully');
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
