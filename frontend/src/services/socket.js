import { io } from 'socket.io-client';

// This is the URL of your local Node.js server
const NODE_SERVER_URL = "http://localhost:3001";

export const socket = io(NODE_SERVER_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

