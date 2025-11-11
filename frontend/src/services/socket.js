import { io } from 'socket.io-client';

// Determine the server URL based on environment
// In production (Render), use the environment variable
// In development, use localhost
const NODE_SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

console.log('🔌 Connecting to Socket.IO server:', NODE_SERVER_URL);

export const socket = io(NODE_SERVER_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
});

// Debug logs for connection events
socket.on('connect', () => {
  console.log('✅ Socket connected successfully:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Socket disconnected:', reason);
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log('🔄 Reconnection attempt:', attemptNumber);
});

socket.on('reconnect', (attemptNumber) => {
  console.log('✅ Socket reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_failed', () => {
  console.error('❌ Socket reconnection failed after all attempts');
});