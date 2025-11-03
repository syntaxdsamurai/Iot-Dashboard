import { Server } from 'socket.io';

let io = null;

export const initSocketService = (httpServer) => {
  if (!io) {
    io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ['GET', 'POST'],
      },
    });

    console.log('Socket.IO service initialized');

    // --- Main Connection Handler ---
    io.on('connection', (socket) => {
      console.log(`🔌 New client connected: ${socket.id}`);

      // --- Room Management Handlers ---

      // Listen for a client request to join a specific room
      socket.on('join-room', (roomName) => {
        // Leave all other rooms first to prevent duplicate messages
        socket.rooms.forEach((room) => {
          if (room !== socket.id) {
            socket.leave(room);
          }
        });
        
        // Join the new room
        socket.join(roomName);
        console.log(`Client ${socket.id} joined room: ${roomName}`);
      });

      // Listen for a client request to leave a room
      socket.on('leave-room', (roomName) => {
        socket.leave(roomName);
        console.log(`Client ${socket.id} left room: ${roomName}`);
      });

      // --- Disconnect Handler ---
      socket.on('disconnect', (reason) => {
        console.log(`Client disconnected: ${socket.id}. Reason: ${reason}`);
      });
    });
  }
  return io;
};

/**
 * A helper function to get the initialized IO instance
 * from other parts of the application.
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO service not initialized!');
  }
  return io;
};

